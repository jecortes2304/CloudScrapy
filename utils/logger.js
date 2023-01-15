const winston = require('winston');
require('winston-mongodb');
require('winston-daily-rotate-file');
const alignColorsAndTime = winston.format.combine(
    winston.format.label({
        label: `[CloudScrapy v0.0.1]-[LOGGER]`,
    }),
    winston.format.json(),
    winston.format.timestamp({
        format: `DD-MM-YYYY-HH:MM:SS`,
    }),
    winston.format.printf(
        info => `${info.level}---->${info.label}---->${[info.timestamp]}---->${info.message}`
    ),
);

const dailyRotateFileTransport = filename => new winston.transports.DailyRotateFile({
    filename: `${process.env.LOGS_PATH_DEV}/logs_%DATE%${filename}.log`,
    maxSize: "1g",
    maxDays: "1d",
    zippedArchive: true,
    datePattern: 'YYYY-MM-DD'
});


const logger = function (filename){
    return winston.createLogger({
        level: 'silly',
        transports: [
            new (winston.transports.Console)({
                format: winston.format.combine(winston.format.colorize({all: true}), alignColorsAndTime),
            }),
            dailyRotateFileTransport(filename)
        ]
    });
}



module.exports = logger;
