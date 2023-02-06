const {mongodbConfig} = require("../configs/appConfig");
const winston = require('winston');
require('winston-mongodb');

winston.addColors({ label: 'bold blueBG' });
winston.addColors({ timestamp: 'magenta' });
winston.addColors({ space: 'bold magentaBG' });
const colorizer = winston.format.colorize();

const logsColors = winston.format.printf(
    info => `${info.level}--->${colorizer.colorize('label', info.label)}--->${colorizer.colorize('timestamp', info.timestamp)}--->${info.message}`
)

const logsNoColors = winston.format.printf(
    info => `${info.level}--->${info.label}--->${[info.timestamp]}--->${info.message}`
)

const alignColorsAndTime = logsFormats => winston.format.combine(
    winston.format.label({
        label: `[CloudScrapy v0.0.1]-[LOGGER]`,
    }),
    winston.format.timestamp({
        format: `DD-MM-YYYY-HH:MM:SS`,
    }),
    logsFormats
);


const fileNameTransport = filename => new winston.transports.File({
    level: 'silly',
    filename: `${process.env.LOGS_PATH}/${filename}.log`,
    format: winston.format.combine(winston.format.json(), alignColorsAndTime(logsNoColors)),
});


const logger = function (filename) {
    if (filename !== "") {
        return winston.createLogger({
            level: 'silly',
            transports: [
                new (winston.transports.Console)({
                    format: winston.format.combine(winston.format.colorize({all: true}), alignColorsAndTime(logsColors)),
                }),
                fileNameTransport(filename),
                new (winston.transports.MongoDB)({
                    autoReconnect: true,
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    level: 'silly',
                    db: mongodbConfig.uri,
                    collection: 'logs_general',
                    format: winston.format.combine(alignColorsAndTime(logsColors))
                }),
            ]
        });
    } else {
        return winston.createLogger({
            level: 'silly',
            transports: [
                new (winston.transports.Console)({
                    format: winston.format.combine(winston.format.colorize({all: true}), alignColorsAndTime(logsColors)),
                }),
                new (winston.transports.MongoDB)({
                    autoReconnect: true,
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    level: 'silly',
                    db: mongodbConfig.uri,
                    collection: 'logs_general',
                    format: winston.format.combine(alignColorsAndTime(logsColors))
                }),
            ]
        });
    }
}





module.exports = logger;
