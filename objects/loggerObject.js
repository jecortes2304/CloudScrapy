function LoggerObject(fileName) {
    this.logger_file = require('../utils/logger').logger_file(fileName)
}

module.exports = {LoggerObject}