require('dotenv')
const config = require("../configs/config.json");
const {executablePath} = require("puppeteer");
const puppeteer = require("puppeteer-extra");
const logger = require('../utils/logger')("")
const pluginAdBlocker = require('puppeteer-extra-plugin-adblocker')()
const pluginStealth = require('puppeteer-extra-plugin-stealth')()
puppeteer.use(pluginAdBlocker)
puppeteer.use(pluginStealth)



function Browser() {

    async function initBrowser() {
        config.config_1["executablePath"] = executablePath()
        const browser = await puppeteer.launch(config.config_1);
        browser.on('disconnected', () => {
            logger.error(`Browser disconnected id: ${browser.target()._targetId}`)
            if (browser.process() != null) {
                browser.process().kill('SIGINT')
            }
            logger.info(`Relaunching browser...`)
            initBrowser();
        });
        logger.info(`Browser created id: ${browser.target()._targetId}`)
        return browser
    }

    async function closeBrowser(browser) {
        await browser.close()
    }

    return Object.freeze({
        initBrowser,
        closeBrowser
    })
}

module.exports = Browser();