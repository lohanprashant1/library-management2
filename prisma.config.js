const path = require('path');
const { defineConfig } = require('prisma/config');

module.exports = defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL || 'file:./db/custom.db',
  },
});
