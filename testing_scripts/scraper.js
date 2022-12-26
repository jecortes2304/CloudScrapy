const puppeteer = require('puppeteer-extra')
const {Cluster} = require('puppeteer-cluster');
const {Engine} = require("../components/pupperteerEngine");
const pinoLogger = require('express-pino-logger')();
const blockResourcesPlugin = require('puppeteer-extra-plugin-block-resources')();
// Cluster.use(blockResourcesPlugin);

const Scraper = async (jsonData) => {
    const cluster = await Cluster.launch({
        puppeteerOptions: {
            headless: false,
            defaultViewport: false,
            userDataDir: "./temp"
        },
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 10
    });


    await cluster.task(async ({page, data: url}) => {
        console.log(url)
        await page.goto(url, {waitUntil: 'networkidle0'});
        await page.screenshot({path: 'foto'+new Date().getMilliseconds()+'.png'});
        // Store screenshot, do something else
    });


    await cluster.queue('https://www.wikipedia.org/');
    await cluster.queue('https://www.youtube.com/');
    await cluster.queue('https://medium.com/');
    await cluster.queue('https://www.facebook.com/');
    await cluster.queue('https://www.pccomponentes.com/');


    await cluster.idle();
    await cluster.close();
}


module.exports = {Scraper}
