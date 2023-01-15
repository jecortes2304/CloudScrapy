const puppeteer = require('puppeteer-extra')
const {Cluster} = require('puppeteer-cluster');
const blockResourcesPlugin = require('puppeteer-extra-plugin-block-resources')();
// Cluster.use(blockResourcesPlugin);

const Scraper = async () => {
    const cluster = await Cluster.launch({
        puppeteerOptions: {
            headless: true,
            defaultViewport: false
        },
        concurrency: Cluster.CONCURRENCY_BROWSER,
        maxConcurrency: 16
    });
    const url = 'https://www.wikipedia.org/'
    for (let i = 0; i < 100; i++) {
        await cluster.queue(url)
    }

    await cluster.task(async ({page, data: url}) => {
        console.log(url)
        await page.goto(url, {waitUntil: 'networkidle0'});
        await page.screenshot({path: 'foto'+new Date().getMilliseconds()+'.png'});
        // Store screenshot, do something else
    });







    await cluster.idle();
    await cluster.close();
}


Scraper().then()


module.exports = {Scraper}
