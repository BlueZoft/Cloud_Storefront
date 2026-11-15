// Match the port expected by reverse proxies and containers; allow local binding overrides.
process.env.HOSTNAME = process.env.BIND_HOST || '0.0.0.0';
require('../.next/standalone/server.js');
