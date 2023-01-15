const {mongoose} = require("mongoose");
const logger = require('../utils/logger')("")

function MongoDb() {
    function connect(){
        mongoose.connect(process.env.MONGODB_DEV_URL, {useNewUrlParser: true, useUnifiedTopology: true},
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