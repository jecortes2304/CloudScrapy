const Redis = require('ioredis');
const logger = require('../utils/logger')("")
const config = require('config')
const {host, port, password} = config.get('redis')

const redisClient = new Redis({
    host: host,
    port: port,
    password: password
});

redisClient.on("connect", () => {
    logger.info("Redis is connected!")
})

redisClient.on("error", (error) => {
    logger.error("Redis error", error)
})

module.exports = redisClient
