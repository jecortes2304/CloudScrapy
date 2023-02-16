const createError = require('http-errors');
const swaggerFile = require('./configs/swaggerConfig.json')
const express = require('express');
const cors = require('cors');
const path = require('path');
const {verifyToken} = require('./controllers/userController')
const {corsConfig, apiDocsOptionsUI} = require('./configs/apiConfig')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const swaggerUi = require('swagger-ui-express')

const app = express();


if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const engineRoutes = require('./routes/engineRoutes');
const usersRouter = require('./routes/usersRoutes');
const filesRouter = require('./routes/filesRoutes');
const indexRouter = require('./routes/indexRoutes');

//SETTING VIEWS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//SETTING CONFIGS OF APP
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(logger('dev'));
app.use(express.json());
app.use(cors(corsConfig));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//SETTING ROUTERS AND ENDPOINTS
app.use(indexRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile, apiDocsOptionsUI))
app.use('/api/users', usersRouter);
app.use('/api/files',verifyToken, filesRouter);
app.use('/api/engine',verifyToken, engineRoutes);
app.use('/public/logs',verifyToken, express.static(`${__dirname}/files/logs`));
app.use('/public/screenshots',verifyToken, express.static(`${__dirname}/files/screenshots`));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});


module.exports = app;
