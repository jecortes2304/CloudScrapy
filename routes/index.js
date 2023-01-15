const express = require('express');
const router = express.Router();
const mongoDb = require('../utils/mongo');
const os = require("os");
const botEngine = require('../components/engine')
const logger = require('../utils/logger')("")
const Screenshot = require('../models/screenshot_model')
mongoDb.connect()


const timeout = 1500000
const maxNumberOfBrowsersContexts = process.env.MAX_NUMBER_BROWSER_CONTEXTS
const botInstance = botEngine;
let browser = null;
botInstance.initBrowser().then(value => {
    browser = value
})



router.get('/', async function (req, res) {
    const response = {
        message: 'Welcome to scrape the clouds',
        hostname: os.hostname()
    }
    res.send(response);
});


router.get('/screenshots', async function (req, res) {
    const response = {
        message: 'Welcome to scrape the clouds',
        hostname: os.hostname()
    }
    res.send(response);
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
    try {
        const contextId = req.query.context_id
        if (await botInstance.getContextById(contextId) !== undefined) {
            await botInstance.closeBrowserContextById(contextId)
            const response = {
                hostname: os.hostname(),
                message: `BrowserContext ${context_id} closed correctly`
            }
            res.send(response);
        } else {
            res.send({'error': `Context ${contextId} doesn't exist`})
        }
    } catch (error) {
        logger.error(error.toString())
        console.log(error)
        res.send({error: JSON.stringify(error)})
    }
});

router.post('/api/run', async function (req, res) {
    req.setTimeout(timeout);
    try {
        let data = req.body
        while (browser.browserContexts().length === maxNumberOfBrowsersContexts) {
            await sleep(1000)
            logger.warn('Running maximum number of browsers')
            logger.debug(`Amount of browserContexts: ${browserContexts}`)
        }
        const context = await botInstance.createBrowserContext(browser)
        const page = await botInstance.createPageByContext(context)
        const contextId = context.id
        const result = await botInstance.runInstructions(contextId, page, data)
        let extractRulesResponse = {}
        if (result['message'] === 'Action required') {
            setTimeout(async () => {
                await botInstance.closeBrowserContextById(contextId)
                logger.warn(`BrowserContext ${contextId} closed by timeout`)
            }, 300000);
        } else if (result['message'] === 'Instructions successfully executed') {
            const resultPage = result['page']
            extractRulesResponse = await botInstance.getResponseByContextPage(resultPage, data)
            await botInstance.closeBrowserContextById(contextId)
        }else if (result['message'] === 'No instructions'){
            const resultPage = result['page']
            extractRulesResponse = await botInstance.getResponseByContextPage(resultPage, data)
            await botInstance.closeBrowserContextById(contextId)
        }else {
            await botInstance.closeBrowserContextById(contextId)
        }
        const response = {
            hostname: os.hostname(),
            status_code: 200,
            contextId: result['contextId'],
            instructions_result: result['message'],
            extracts_rules_response: extractRulesResponse
        }
        res.send(response)
    } catch (error) {
        logger.error(error.toString())
        console.log(error)
        res.send({error: error.toString()})
    }
});

router.post('/api/run/2fa', async function (req, res) {
    req.setTimeout(timeout);
    let data = req.body
    const contextId = data.context_id
    try {
        while (browser.browserContexts().length === maxNumberOfBrowsersContexts) {
            await sleep(1000)
            logger.warn('Running maximum number of browsersContexts')
            logger.debug(`Amount of browserContexts: ${browserContexts}`)
        }
        if (await botInstance.getContextById(contextId) !== undefined) {
            const page = await botInstance.getPageByContextId(contextId)
            const result = await botInstance.runInstructionsAfter2fa(contextId, page, data)
            let response = {
                hostname: os.hostname(),
                status_code: 200,
                contextId: result['contextId'],
                instructions_result: result['message']
            }
            if (result['message'] === 'Instructions successfully executed') {
                const resultPage = result['page']
                const extractRulesResponse = await botInstance.getResponseByContextPage(resultPage, data)
                if (extractRulesResponse !== undefined && extractRulesResponse !== {}) {
                    response['extract_rules_response'] = extractRulesResponse
                    res.send(response)
                }
            } else {
                res.send(response)
            }
        } else {
            res.send({'error': `Context ${contextId} is undefined`})
        }
    } catch (error) {
        logger.error(error.toString())
        console.log(error)
        res.send({error: error.toString()})
    }
    await botInstance.closeBrowserContextById(contextId)

});


function sleep(ms) {
    logger.warn('Running maximum number of browsers')
    return new Promise(resolve => setTimeout(resolve, ms))
}

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