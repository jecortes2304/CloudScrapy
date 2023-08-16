const swaggerFile = require('./config/docs/openapi.json')
const express = require('express');
const cors = require('cors');
const path = require('path');
const {corsConfig, apiDocsOptionsUI} = require('./config/config_files/apiConfig')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const swaggerUi = require('swagger-ui-express')
const app = express();
const config = require('config')
const v1 = require('./routes/v1');
const mongoDb = require('./utils/mongo');
const initialSetup = require('./utils/initialSetup');
const BrowserServiceApi = require('./components/engineBrowserService')
const os = require("os");
const bp = require('body-parser')
const ScheduleProcess = require('./utils/scheduler')

//SETTING UP
mongoDb.connect()
initialSetup.createRoles().then(function () {
    initialSetup.createRootUser().then()
})
console.log('NODE_ENV: ' + config.util.getEnv('NODE_ENV'));
console.log('Listening on: ' + config.get('server.server_url'));

// //INITIATING BROWSER SERVICE
BrowserServiceApi.newBrowser().then()

//SETTING CONFIGS OF APP
app.use(express.json({limit: '20mb'}));
app.use(logger('dev'));
app.use(express.json());
app.use(cors(corsConfig));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bp.json())

//SETTING ROUTERS AND ENDPOINTS
app.use('/api/v1', v1)
app.get('/', async function (req, res) {
    /* #swagger.ignore = true*/
    await res.redirect('/api-docs')
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile, apiDocsOptionsUI))
app.get('/openapi.json', async function (req, res) {
    /* #swagger.ignore = true*/
    res.setHeader('Content-Type', 'application/json');
    await res.send(swaggerFile);
});
app.use('/public', express.static('public'))

ScheduleProcess().start()


// CATCH 404 AND FORWARD TO ERROR HANDLER
app.use(function (req, res, next) {
        const notFoundError = {
            hostname: os.hostname(),
            code: 404,
            message: `The request url was not found in the server, please try again!`,
        }
        next(res.status(404).send(notFoundError));
    });

// CATCH 400 AND FORWARD TO ERROR HANDLER
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error(err);
        const badRequestError = {
            error: {
                code: 400,
                message: err.message,
            }
        }
        return res.status(400).send(badRequestError);
    }
    next();
});



module.exports = app;
