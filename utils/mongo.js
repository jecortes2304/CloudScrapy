const {mongoose} = require("mongoose");
const logger = require('../utils/logger')("")
const config = require('config')
const mongoUri = config.get('mongodb.mongodb_uri')

function MongoDb() {
    function connect(){
        mongoose.set('strictQuery', true)
        mongoose.connect(mongoUri, {useNewUrlParser: true, useUnifiedTopology: true},
            function (err) {
                if (err) {
                    logger.error('Mongo DB error connection!')
                } else {
                    logger.info('Mongo DB connected!')
                }
            });
    }

    function connection(){
        return mongoose.connection
    }

    return{
        connect,
        connection
    }
}

module.exports = MongoDb()