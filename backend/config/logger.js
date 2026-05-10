// Winston Logger Configuration
// Save as: backend/config/logger.js

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Define colors for console output
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.json()
);

// Define transports
const transports = [
    // Console transport - all logs
    new winston.transports.Console(),

    // File transport - errors only
    new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5 * 1024 * 1024,
        maxFiles: 5,
        format: fileFormat
    }),

    // File transport - all logs
    new winston.transports.File({
        filename: path.join(logsDir, 'all.log'),
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
        format: fileFormat
    }),

    // File transport - HTTP requests
    new winston.transports.File({
        filename: path.join(logsDir, 'http.log'),
        level: 'http',
        maxsize: 10 * 1024 * 1024,
        maxFiles: 5,
        format: fileFormat
    })
];

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    levels,
    format,
    transports,
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'exceptions.log')
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'rejections.log')
        })
    ]
});

module.exports = logger;
