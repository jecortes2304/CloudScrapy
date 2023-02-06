const {config_1} = require("../configs/engineConfig.js");
const {executablePath} = require("puppeteer");
const puppeteer = require("puppeteer-extra");
const logger = require('../utils/logger')("")
const pluginAdBlocker = require('puppeteer-extra-plugin-adblocker')()
const pluginStealth = require('puppeteer-extra-plugin-stealth')()
puppeteer.use(pluginAdBlocker)
puppeteer.use(pluginStealth)


function EngineBrowser() {


    async function initBrowser() {
        config_1["executablePath"] = executablePath()
            const browser = await puppeteer.launch(config_1);
                browser.on('disconnected', () => {
                    logger.error(`Browser disconnected id: ${browser.target()._targetId}`)
                    if (browser.process() != null) {
                        browser.process().kill('SIGINT')
                    }
                    logger.info(`Relaunching browser...`)
                    initBrowser();
                });
            logger.info(`Browser created id: ${browser.target()._targetId}`)
        return browser;
        }

    async function closeBrowser(browser) {
        logger.info(`Browser: ${browser.target()._targetId} closed correctly`)
        await browser.close()
    }

    return Object.freeze({
        initBrowser,
        closeBrowser
    })
}

module.exports = EngineBrowser();