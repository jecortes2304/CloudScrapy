const express = require('express');
const router = express.Router();
const mongoDb = require('../utils/mongo');
const os = require("os");
const Browser = require('../components/browser')
const logger = require('../utils/logger')("")
const Screenshot = require('../models/screenshotModel')
const BrowserService = require('../services/browserService')
mongoDb.connect()
let browser;
Browser.initBrowser().then(value => {
    browser = value
})

// logger.stream({sta}).on('log', function (log) {
//     logObject.logs_array.push(JSON.stringify(log));
//     logObject.save();
// });


router.get('/', async function (req, res) {
    const response = {
        message: 'Welcome to scrape the clouds',
        hostname: os.hostname()
    }
    res.send(response);
});

router.get('/screenshots', async function (req, res) {
    res.send();
});

router.get('/logs', async function (req, res) {
    res.send();
});

router.get('/api/image', async function (req, res) {
    try {
        const imageContextId = req.query.image_context_id
        Screenshot.findOne({id_context: imageContextId}).lean().exec(function (err, doc) {
            logger.info(`Document ${JSON.stringify(doc)}`)
            const response = {
                hostname: os.hostname(),
                message: `Screenshot fetched correctly`,
                screenshot: JSON.stringify(doc)
            }
            res.send(response);
        });
    } catch (error) {
        logger.error(error.toString())
        console.log(error)
        res.send({error: JSON.stringify(error)})
    }
});

router.get('/api/close_context', async function (req, res) {
    const data = req.query
    const result = await BrowserService.closeContext(data)
    result.requestStatusCode = res.statusCode
    res.send(result)
});

router.post('/api/run', async function (req, res) {
    const data = req.body
    const result = await BrowserService.run(data, browser)
    result.requestStatusCode = res.statusCode
    res.send(result)
});

router.post('/api/run/2fa', async function (req, res) {
    const data = req.body
    const result = await BrowserService.run2Fa(data, browser)
    result.requestStatusCode = res.statusCode
    res.send(result)
});



module.exports = router;


// function getFromRedis(){
// const objectContextStored = await redis.get(contextId)
// const jsonObjectContext = JSON.parse(objectContextStored)
// const sourcePage = jsonObjectContext.sourcePage
// const cookies = jsonObjectContext.cookies
// const headers = jsonObjectContext.headers
// const url = jsonObjectContext.url
// const page = await botInstance.createPageByContext(context)
// await page.setExtraHTTPHeaders(headers)
// await page.setCookie(...cookies)
// await page.goto(url, {waitUntil:"domcontentloaded"})
// await page.setContent(sourcePage)
// const context = await botInstance.createBrowserContext(browser)
// }

// function setInRedis(){
// let pageResponse
// page.on('response', response => {
//     const status = response.status()
//     if (status === 200) {
//         logger.debug(`Redirect 200 from'${ response.url()} to ${response.headers()['location']}`)
//         pageResponse = response
//     }
// })
// const currentPage = await botInstance.getPageByContextById(context.id)
// const url = await currentPage.url()
// const cookies = await currentPage.cookies()
// const headers = pageResponse.headers()
// const html = await currentPage.content()
//
// const objectContextSession = {
//     url: url,
//     cookies: cookies,
//     headers: headers,
//     sourcePage: html
// }
// redis.set(context.id, JSON.stringify(objectContextSession))
//}