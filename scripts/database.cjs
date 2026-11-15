/* Private logical backups using official MongoDB Database Tools. */
const fs = require('node:fs');
const fsp = fs.promises;
const path = require('node:path');
const os = require('node:os');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { MongoClient, BSON } = require('mongoose').mongo;
process.umask(0o077);
const uri = process.env.MONGO;
const [command, archiveOrTarget, targetArg] = process.argv.slice(2);
async function checksum(file) {
  const hash = createHash('sha256');
  for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
function validTarget(target, source) {
  if (!/^restore_[A-Za-z0-9_]{1,56}$/.test(target || '') || target === source) throw new Error('unsafe target');
}
async function main() {
  if (!uri || !['backup', 'restore', 'verify'].includes(command) || !archiveOrTarget) throw new Error('arguments');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  let temp;
  try {
    const source = client.db().databaseName;
    // Give tools a URI without an implicit database, preserving authentication source.
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/?]+)\/([^?]+)(\?.*)?$/);
    if (!match || !/^[A-Za-z0-9_-]{1,63}$/.test(source)) throw new Error('Use an explicit simple database name in the URI');
    const params = new URLSearchParams((match[3] || '').slice(1));
    if (client.options.credentials && !params.has('authSource')) params.set('authSource', client.options.credentials.source);
    const toolUri = `${match[1]}/?${params.toString()}`;
    temp = await fsp.mkdtemp(path.join(os.tmpdir(), 'store-backup-'));
    const config = path.join(temp, 'tools.json');
    await fsp.writeFile(config, JSON.stringify({ uri: toolUri }), { mode: 0o600 });
    function tool(binary, args) {
      const result = spawnSync(binary, [`--config=${config}`, ...args], { stdio: 'ignore' });
      if (result.error || result.status !== 0) throw new Error('database tool failed');
    }
    if (command === 'backup') {
      const file = path.resolve(archiveOrTarget);
      if (fs.existsSync(file + '.sha256') || fs.existsSync(file + '.manifest.json')) throw new Error('exists');
      const handle = await fsp.open(file, 'wx', 0o600);
      await handle.close();
      try {
        tool(process.env.MONGODUMP_BIN || 'mongodump', [`--db=${source}`, `--archive=${file}`, '--gzip', '--excludeCollection=auth_sessions', '--excludeCollection=login_limits']);
      } catch (error) { await fsp.unlink(file); throw error; }
      const sha256 = await checksum(file);
      const collections = (await client.db(source).listCollections().toArray()).map(row => row.name).filter(name => !['auth_sessions', 'login_limits'].includes(name)).sort();
      await fsp.writeFile(file + '.sha256', sha256 + '\n', { flag: 'wx', mode: 0o600 });
      await fsp.writeFile(file + '.manifest.json', JSON.stringify({ format: 1, source, collections, sha256 }), { flag: 'wx', mode: 0o600 });
      console.log('Backup and SHA256 checksum written; authentication state excluded.');
    } else if (command === 'restore') {
      const file = path.resolve(archiveOrTarget);
      const target = targetArg;
      validTarget(target, source);
      const manifest = JSON.parse(await fsp.readFile(file + '.manifest.json', 'utf8'));
      const expected = (await fsp.readFile(file + '.sha256', 'utf8')).trim();
      if (manifest.format !== 1 || manifest.source !== source || manifest.sha256 !== expected || !Array.isArray(manifest.collections)) throw new Error('manifest');
      if (!/^[a-f0-9]{64}$/.test(expected) || await checksum(file) !== expected) throw new Error('checksum');
      if ((await client.db(target).listCollections().toArray()).length) throw new Error('nonempty target');
      tool(process.env.MONGORESTORE_BIN || 'mongorestore', [`--archive=${file}`, '--gzip', `--nsInclude=${source}.*`, `--nsFrom=${source}.*`, `--nsTo=${target}.*`, `--nsExclude=${source}.auth_sessions`, `--nsExclude=${source}.login_limits`, '--stopOnError']);
      const restored = (await client.db(target).listCollections().toArray()).map(row => row.name).sort();
      if (JSON.stringify(restored) !== JSON.stringify(manifest.collections)) throw new Error('restored namespaces differ');
      console.log('Restored to separate target; no active sessions restored.');
    } else {
      const target = archiveOrTarget;
      validTarget(target, source);
      async function data(database) {
        const db = client.db(database);
        const names = (await db.listCollections().toArray()).map(c => c.name).filter(n => !['auth_sessions', 'login_limits'].includes(n)).sort();
        const result = {};
        for (const name of names) {
          const hash = createHash('sha256');
          for await (const document of db.collection(name).find().sort({ _id: 1 })) hash.update(BSON.EJSON.stringify(document, { relaxed: false }) + '\n');
          const indexes = (await db.collection(name).indexes()).map(({name, key, unique, expireAfterSeconds}) => ({ name, key, unique, expireAfterSeconds })).sort((a,b) => a.name.localeCompare(b.name));
          result[name] = { hash: hash.digest('hex'), indexes };
        }
        return JSON.stringify(result);
      }
      if (await data(source) !== await data(target)) throw new Error('data or indexes differ');
      for (const name of ['auth_sessions', 'login_limits']) if (await client.db(target).collection(name).countDocuments()) throw new Error('auth state present');
      console.log('PASS: business documents and indexes match; restored authentication state is empty.');
    }
  } finally {
    await client.close();
    if (temp) await fsp.rm(temp, { recursive: true, force: true });
  }
}
main().catch(() => {
  console.error('Database operation failed. Check URI/tool access, checksum, and empty restore_ target.\nUsage: node scripts/database.cjs backup FILE | restore FILE restore_NAME | verify restore_NAME');
  process.exitCode = 1;
});
