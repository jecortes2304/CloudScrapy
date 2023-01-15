const {executablePath} = require('puppeteer')
const puppeteer = require('puppeteer-extra')
const credentials = require('../credentials.json');
const config = require('../../configs/config.json');
const logger = require('../../utils/logger')
const prompt = require("prompt-sync")({sigint: true});
const pluginBlockResources = require('puppeteer-extra-plugin-block-resources')()
const stealthPlugin = require('puppeteer-extra-plugin-stealth')()
puppeteer.use(pluginBlockResources)
puppeteer.use(stealthPlugin)


const loginFacebook = async () => {
    config.config_1["executablePath"] = executablePath()
    const browser = await puppeteer.launch(config.config_1)
    const context = await browser.createIncognitoBrowserContext()
    const page = await context.newPage()
    pluginBlockResources.blockedTypes.add('media')
    pluginBlockResources.blockedTypes.add('image')
    // pluginBlockResources.blockedTypes.add('stylesheet')
    pluginBlockResources.blockedTypes.add('font')

    await page.goto('https://business.facebook.com/', {waitUntil: 'networkidle0'})

    await page.waitForSelector("._9xo5")
    await page.evaluate("document.getElementsByClassName('_9xo5')[0].getElementsByTagName('button')[0].click()")

    logger.info('Selecting login');
    await page.waitForSelector("._42ft")
    await page.evaluate("document.getElementsByClassName('_42ft')[0].click()")
    await page.waitForNavigation({waitUntil: 'networkidle0'})

    logger.info('Selecting Facebook account for login');
    await page.evaluate("document.getElementsByClassName('xxziih7')[0].click()")
    await page.waitForNavigation({waitUntil: 'networkidle0'})

    logger.info('Login with credentials');
    await page.type("#email", credentials.facebook_business.username, {delay: 10});
    await page.type("#pass", credentials.facebook_business.password, {delay: 10});
    await page.click("#loginbutton")
    await page.waitForNavigation({waitUntil: 'domcontentloaded'})

    let code = ''
    while (code === '') {
        code = prompt("Write your code: ")
    }

    logger.info('Typing the 2fa code and sending');
    await page.type("#approvals_code", code, {'delay': 10})
    await page.click("#checkpointSubmitButton")
    await page.waitForNavigation({'waitUntil': 'networkidle0'})

    logger.info('Saving browser');
    await page.click("input[name='name_action_selected']")
    await page.click("#checkpointSubmitButton")
    await page.waitForNavigation({'waitUntil': 'networkidle0'})

    let html = await page.content()
    if (html.includes("Ver un intento de inicio de sesión reciente")) {
        await page.click("#checkpointSubmitButton")
        await page.waitForNavigation({'waitUntil': 'networkidle0'})
        html = await page.content()
        if (html.includes("Inicio de sesión cerca de ")) {
            await page.click("#checkpointSubmitButton")
            await page.waitForNavigation({'waitUntil': 'networkidle0'})
            logger.info('Saving browser again');
            await page.click("#checkpointSubmitButton")
            await page.waitForNavigation({'waitUntil': 'networkidle0'})
        }
    }

    try {
        const content = await page.content()
        if (content.includes('Inicio')) {
            logger.info('Login Successfully');
        }
    } catch (error) {
        logger.info('Failed to Login');
        process.exit(0);
    }

    logger.info('Taking picture');
    await page.screenshot({path: 'facebook.jpeg', type:'jpeg'})
    logger.info('Closing browser');
    await browser.close()
}



loginFacebook().then()