const Redis = require('ioredis');
const logger = require('../utils/logger')("")
const appConfig = require('../configs/appConfig')

const redisClient = new Redis({
    host: appConfig.redisConfig.host,
    port: appConfig.redisConfig.port
});

redisClient.on("connect", () => {
    logger.info("Redis is connected!")
})

redisClient.on("error", (error) => {
    logger.error("Redis error", error)
})

module.exports = redisClient
