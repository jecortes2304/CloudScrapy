const {executablePath} = require('puppeteer')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const fs = require('fs')
const credentials = require('../jsons/credentials.json');
const cookies = require('../jsons/cookies.json');
const config = require('../jsons/config.json');
const prompt = require("prompt-sync")({sigint: true});

const loginPcComponents = async () => {
    // const browser = await puppeteer.launch(config.config1)
    const browser = await puppeteer.launch(
        {
            headless: false,
            defaultViewport: null,
            userDataDir: "C:/Users/jecor/AppData/Local/Google/Chrome/User Data/Default",
            executablePath: executablePath(),
            "args": [
                "--start-maximized",
                "--no-sandbox",
                "--disable-gpu",
                "--incognito",
                "--disable-dev-shm-usage",
                "--disable-setuid-sandbox",
                "--no-first-run",
                "--no-zygote",
                "--single-process",
                "--window-size=1920,1080",
                "--disable-dev-shm-usage",
                "--disable-extensions",
                "--disable-dev-tools",
                "--ignore-certificate-errors",
                "--enable-logging",
                "--v=1",
                "--disable-setuid-sandbox",
                "--disable-infobars",
                "--window-position=0,0",
                "--ignore-certifcate-errors",
                "--ignore-certifcate-errors-spki-list",
                "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
            ]
        }
    )
    const pages = await browser.pages()
    const page = await pages[0]
    await page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0')
    // await page.goto('https://bot.sannysoft.com/', {waitUntil: 'networkidle0'})
    // await page.goto('https://www.pccomponentes.com', {waitUntil: 'networkidle0'})
    //
    // await page.evaluate("document.getElementsByClassName('sc-jvfqPk hAvYSD')[0].click()")

    // await page.waitForNavigation({waitUntil: 'networkidle0'})

    await page.goto('https://www.pccomponentes.com/login', {waitUntil: 'networkidle0'})

    await page.waitForSelector("#username")

    await page.type("#username", credentials.pc_components.username, {delay: 10});
    await page.type("#password", credentials.pc_components.password, {delay: 10});
    await page.evaluate("document.getElementsByClassName('sc-iqHYmW hopIa-D')[0].click()")
    await page.waitForNavigation({waitUntil: 'networkidle0'})

    await browser.close()
}




loginPcComponents().then(r => console.log(r))