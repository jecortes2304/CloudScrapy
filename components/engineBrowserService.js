const {config_1} = require("../config/config_files/engineConfig.js");
const {executablePath} = require("puppeteer");
const puppeteer = require("puppeteer-extra");
const logger = require('../utils/logger')("")
const pluginAdBlocker = require('puppeteer-extra-plugin-adblocker')()
const pluginStealth = require('puppeteer-extra-plugin-stealth')()
puppeteer.use(pluginAdBlocker)
puppeteer.use(pluginStealth)


class BrowserService {

    browserInstance = null
    browserId = ""
    browserWSUrl = ""
    constructor() {

    }

    async newBrowser() {
        config_1["executablePath"] = executablePath()
        const browser = await puppeteer.launch(config_1);

        browser.on('disconnected', async () => {
            logger.error(`Browser disconnected id: ${browser.target()._targetId}`)
            if (browser.process() != null) {
                browser.process().kill('SIGINT')
            }
            logger.info(`Relaunching browser with WSUrl ${browser.wsEndpoint()} ...`)
            await this.newBrowser();
        });
        logger.info(`Browser created id: ${browser.target()._targetId}`)
        this.browserInstance = browser
        this.browserId = this.browserInstance.target()._targetId
        this.browserWSUrl = this.browserInstance.wsEndpoint()
        return browser
    }

    async getBrowserInstance(){
        if (!this.browserInstance){
           await this.newBrowser()
        }

        return this.browserInstance
    }

    async closeBrowser() {
        logger.info(`Browser: ${this.browserId} closed correctly`)
        await this.browserInstance.close()
    }

}

const browserApiService = new BrowserService()
module.exports = browserApiService