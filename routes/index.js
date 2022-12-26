const express = require('express');
const router = express.Router();
const {PuppeteerEngine} = require("../components/pupperteerEngine");
const os = require("os");
const fs = require("fs");
let puppeteerEngine = null

let timeout = 1500000
let browsers = 0
const maxNumberOfBrowsers = 10


router.get('/', function (req, res) {
    console.log(os.hostname())
    let response = {
        msg: 'Scraping the clouds',
        hostname: os.hostname().toString()
    }
    res.send(response);
});


router.post('/api/run/', async function (req, res) {
    req.setTimeout(timeout);

    try {
        let data = req.body
        console.log(req.body.url)
        while (browsers === maxNumberOfBrowsers) {
            await sleep(1000)
        }
        await executeEngine(data).then(result => {
            let response = {
                msg: 'Instructions successfully executed',
                hostname: os.hostname(),
                data: result
            }
            if (result.message === "Action required"){
                console.log('Waiting '+timeout/1000+ 'seconds')
                sleep(timeout)
            }
            console.log('done Execute Engine')
            res.send(response)
        })
    } catch (error) {
        res.send({ error: error.toString() })
    }
});


router.post('/api/run/2fa/', async function (req, res) {
    let data = req.body
    console.log("data2fa " + data)

});


async function executeEngine(args) {
    puppeteerEngine = new PuppeteerEngine(args)
    browsers += 1
    try {
        let booksDetails = await puppeteerEngine.runEngine().then(response => {
            return response
        })
        browsers -= 1
        return booksDetails
    } catch (error) {
        browsers -= 1
        console.log(error)
    }
}

async function handle2FaEngine(args) {
    if (puppeteerEngine !== null){
        console.log("handling2Fa")
        await puppeteerEngine.handle2Fa(args)
    }else {
        console.log("PuppeteerEngine is null")
    }
}

function sleep(ms) {
    console.log('Running maximum number of browsers')
    return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = router;