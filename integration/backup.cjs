/* Only operates on an empty, explicitly named test database and a generated restore target. */
const { MongoClient } = require('mongoose').mongo;
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { spawnSync } = require('node:child_process');
(async () => {
  const uri = process.env.TEST_MONGO;
  if (!uri) throw new Error('Set TEST_MONGO to an empty storefront_backup_test… database');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const target = 'restore_store_' + randomUUID().replaceAll('-', '');
  let created = false, temp;
  try {
    if (!db.databaseName.startsWith('storefront_backup_test') || (await db.listCollections().toArray()).length) throw new Error('Refusing nonempty/non-test source');
    created = true;
    await db.collection('products').insertMany([{title:'Recovery café',desc:'Unicode and nested BSON',price:3.5,createdAt:new Date(),extra:{enabled:true}}, {title:'Second product',price:0}]);
    await db.collection('products').createIndex({title:1}, {unique:true});
    await db.collection('auth_sessions').insertOne({_id:'test-session',expiresAt:new Date()});
    await db.collection('login_limits').insertOne({_id:'test-limit',attempts:4});
    temp = await fs.mkdtemp(path.join(os.tmpdir(), 'store-drill-'));
    const archive = path.join(temp, 'store.archive.gz');
    function run(args, success=true) {
      const result = spawnSync(process.execPath, [path.join(__dirname,'../scripts/database.cjs'), ...args], {env:{...process.env,MONGO:uri},stdio:'inherit'});
      if ((result.status === 0) !== success) throw new Error('Unexpected recovery helper outcome');
    }
    run(['backup',archive]);
    run(['restore',archive,target]);
    run(['verify',target]);
    run(['restore',archive,target],false);
    run(['restore',archive,db.databaseName],false);
    await fs.appendFile(archive,'corruption');
    run(['restore',archive,'restore_unused'],false);
    if (await client.db(target).collection('products').countDocuments() !== 2) throw new Error('Missing recovered data');
    console.log('PASS: nonempty BSON restore, index preservation, auth exclusion, and restore guards.');
  } finally {
    if (created) { await db.dropDatabase(); await client.db(target).dropDatabase(); }
    if (temp) await fs.rm(temp,{recursive:true,force:true});
    await client.close();
  }
})().catch(() => { console.error('Recovery drill failed; verify test credentials, empty test database, and tool availability.');process.exitCode=1; });
