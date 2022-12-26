const puppeteer = require('puppeteer');
const Page = require('puppeteer/lib/Page');

async function newPageWithNewContext(browser) {
    const {browserContextId} = await browser._connection.send('Target.createBrowserContext');
    const {targetId} = await browser._connection.send('Target.createTarget', {url: 'about:blank', browserContextId});
    const client = await browser._connection.createSession(targetId);
    const page = await Page.create(client, browser._ignoreHTTPSErrors, browser._screenshotTaskQueue);
    page.browserContextId = browserContextId;
    return page;
}

async function closePage(browser, page) {
    if (page.browserContextId != undefined) {
        await browser._connection.send('Target.disposeBrowserContext', {browserContextId: page.browserContextId});
    }
    await page.close();
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await newPageWithNewContext(browser);
    await page.goto('https://example.com');
    console.log(await page.cookies());

    await closePage(browser, page);
    await browser.close();
})();