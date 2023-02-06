const appConfig = {
  appConfig: {
    host: process.env.APP_HOST,
    port: process.env.APP_PORT
  },
  redisConfig: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    user: process.env.REDIS_USER,
    pass: process.env.REDIS_PASS
  },
  mongodbConfig: {
    host: process.env.MONGODB_HOST,
    uri: process.env.MONGODB_URI,
    port: process.env.MONGODB_PORT,
    dbName: process.env.MONGODB_DBNAME,
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASS
  }
}

module.exports = appConfig
