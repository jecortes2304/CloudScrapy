const puppeteer = require('puppeteer')
const fs = require('fs')
const credentials = require('../jsons/credentials.json');
const cookies = require('../jsons/cookies.json');
const config = require('../jsons/config.json');
const prompt = require("prompt-sync")({sigint: true});

const loginCoppel = async () => {
    const browser = await puppeteer.launch(config.config1)
    const pages = await browser.pages()
    const page = await pages[0]

    await page.goto('https://www.coppel.com/LogonForm?myAcctMain=1&storeId=10151&urlRequestType=Base&langId=-5&catalogId=10051', {waitUntil: 'networkidle0'})

    await page.type("#WC_AccountDisplay_FormInput_logonId_In_Logon_1",
        "arenas512@gmail.com", {delay: 10});
    await page.type("#WC_AccountDisplay_FormInput_logonPassword_In_Logon_1",
        "pc6vz4SV4P#Jc8x", {delay: 10});
    await page.click("#btn-login")
    await page.waitForNavigation({waitUntil: 'networkidle0'})

    await browser.close()
}




loginCoppel().then(r => console.log(r))