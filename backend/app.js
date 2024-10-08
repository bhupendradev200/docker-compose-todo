const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const winston = require('winston');
const config = require('./config');

// Create an Express app
const app = express();
app.use(express.json());

// Set up Winston logger to log to an external file
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/app.log' })
  ],
});



const pool_config={
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
}

// PostgreSQL connection
const pool = new Pool(pool_config);
const redis_url=`redis://${config.redis.host}:${config.redis.port}`

const lg=console.log

logger.info(`Config data ${JSON.stringify(pool_config)}`);
logger.info(`redis_url ${redis_url}`);
lg(`Config data ${JSON.stringify(pool_config)}`);
lg(`redis_url ${redis_url}`);

// Redis connection
const redisClient = redis.createClient({
  url: redis_url
});
redisClient.connect();

// API Route: Get all todos
app.get('/todos', async (req, res) => {
  try {
    const cachedTodos = await redisClient.get('todos');
    if (cachedTodos) {
      logger.info('Fetched todos from Redis cache');
      return res.json(JSON.parse(cachedTodos));
    }

    const result = await pool.query('SELECT * FROM todos');
    const todos = result.rows;
    redisClient.setEx('todos', 3600, JSON.stringify(todos));
    
    logger.info('Fetched todos from PostgreSQL database');
    res.json(todos);
  } catch (err) {
    logger.error('Error fetching todos', err);
   
    res.status(500).json({ error: 'Error fetching todos' });
  }
});

// API Route: Add a new todo
app.post('/todos', async (req, res) => {
  const { title } = req.body;
  try {
    const result = await pool.query('INSERT INTO todos (title) VALUES ($1) RETURNING *', [title]);
    const newTodo = result.rows[0];

    // Invalidate cache
    redisClient.del('todos');
    
    logger.info('Added new todo');
    res.json(newTodo);
  } catch (err) {
    logger.error('Error adding todo', err);
    res.status(500).json({ error: 'Error adding todo' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
