const { password } = require("pg/lib/defaults");

module.exports = {
  db: {
    user: process.env.POSTGRES_USER || 'user',
    host: process.env.POSTGRES_HOST || 'db',
    database: process.env.POSTGRES_DB || 'todo_db',
    password: process.env.POSTGRES_PASSWORD || 'password',
    port: process.env.POSTGRES_PORT || 5432,
  },
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    user: process.env.REDIS_USER || null,
    password: process.env.REDIS_PASSWORD || null,
    port: process.env.REDIS_PORT || null,
  },
};
