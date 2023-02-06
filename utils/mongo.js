const {mongoose} = require("mongoose");
const logger = require('../utils/logger')("")
const {mongodbConfig} = require('../configs/appConfig')

function MongoDb() {
    function connect(){
        mongoose.set('strictQuery', true)
        mongoose.connect(mongodbConfig.uri, {useNewUrlParser: true, useUnifiedTopology: true},
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