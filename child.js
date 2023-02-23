'use strict';

const http = require('node:http');
const { PrismaClient } = require('@prisma/client');

// The issue does not occur when the following line is removed.
new PrismaClient();

// The issue does also go away if we remove the call this.installHook("SIGTERM",!0)
// from node_modules/@prisma/client/runtime/libary.js

const port = 3000;

const server = http.createServer((req, res) => {
  console.log('[child] received request');
  res.end();
});

server.listen(port);
console.log(`[child] listening on port ${port}`);

setInterval(() => {
  console.log(`[child] still alive`);
}, 250).unref();
