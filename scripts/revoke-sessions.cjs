const { MongoClient } = require('mongoose').mongo;
(async () => {
  if (process.argv[2] !== '--all' || !process.env.MONGO) throw new Error('arguments');
  const client = new MongoClient(process.env.MONGO, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    await client.db().collection('auth_sessions').deleteMany({});
    console.log('All administrator sessions revoked.');
  } finally { await client.close(); }
})().catch(() => { console.error('Session revocation failed. Load server configuration and pass --all.'); process.exitCode=1; });
