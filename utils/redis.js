const Redis = require('ioredis');

module.exports = new Redis({
    uri: process.env.REDIS_URI_DEV
});
