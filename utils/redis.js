const Redis = require('ioredis');
const logger = require('../utils/logger')("")

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

redisClient.on("connect", () => {
    logger.info("Redis is connected!")
})

redisClient.on("error", (error) => {
    logger.error("Redis error", error)
})

module.exports = redisClient
