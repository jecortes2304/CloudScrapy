const puppeteer = require('puppeteer')
const fs = require('fs')
const credentials = require('../jsons/credentials.json');
const cookies = require('../jsons/cookies.json');
const config = require('../jsons/config.json');
const prompt = require("prompt-sync")({sigint: true});

const loginFacebook = async () => {
    const browser = await puppeteer.launch(config.config1)
    const pages = await browser.pages()
    const page = await pages[0]

    if (Object.keys(cookies).length) {
            console.log('Cookies active');
            await page.setCookie(...cookies)
            console.log('Entering home with cookies');
            await page.goto('https://business.facebook.com/', {waitUntil: 'networkidle0'})
            const contentBody = await page.evaluate(
                'document.getElementsByTag("body")');
            if (contentBody.includes('Inicia sesión')) {
                console.log('Session closed');
                fs.writeFileSync('./cookies.json', JSON.stringify({}));
                await defaultLogin(browser, page)
            } else {
                console.log('Taking picture');
                await page.screenshot({path: 'foto.png'})
                console.log('Closing browser');
                await browser.close()
            }
    } else {
        await defaultLogin(browser, page)
    }
}

const defaultLogin = async (browser, page) => {
    await page.goto('https://business.facebook.com/', {waitUntil: 'networkidle0'})

    await page.evaluate("document.getElementsByClassName('_9xo5')[0].getElementsByTagName('button')[0].click()")

    console.log('Selecting login');
    await page.evaluate("document.getElementsByClassName('_42ft _inf _9c1q _9ltl _9g1j _9f5z _2qix _3bn- _9g0w _w1i _inf _9c1q _9ltl _9f5z _9g1j _98hv _inf _9c1q _9ltl _9f5z _9g1j')[0].click()")
    await page.waitForNavigation({waitUntil: 'networkidle0'})

    console.log('Selecting Facebook account for login');
    await page.evaluate("document.getElementsByClassName('xeuugli x2lwn1j x6s0dn4 x78zum5 x1q0g3np x1iyjqo2 xozqiw3 x19lwn94 x1hc1fzr x13dflua x6o7n8i xxziih7 x12w9bfk xl56j7k xh8yej3')[0].click()")
    await page.waitForNavigation({waitUntil: 'networkidle0'})

    console.log('Login with credentials');
    await page.type("#email", credentials.facebook_business.username, {delay: 30});
    await page.type("#pass", credentials.facebook_business.password, {delay: 30});
    await page.click("#loginbutton")
    await page.waitForNavigation({waitUntil: 'networkidle0'})

    // await page.waitForFunction(() => {
    //     const code2Fa = document.getElementById("approvals_code").value;
    //     if (code2Fa.length === 0) {
    //         browser.close()
    //         return {
    //             "description": "Code required for 2fa authentication",
    //             "message": "Action required"
    //         };
    //     }
    // })
    let code = ''
    while (code === '') {
        code = prompt("Write your code: ")
    }

    console.log('Typing the 2fa code and sending');
    await page.type("#approvals_code", code, {'delay': 30})
    await page.click("#checkpointSubmitButton")
    await page.waitForNavigation({'waitUntil': 'networkidle0'})

    console.log('Saving browser');
    await page.evaluate("document.getElementsByClassName('uiInputLabel clearfix uiInputLabelLegacy')[1].click()")
    await page.evaluate("document.getElementById('checkpointSubmitButton').click()")
    await page.waitForNavigation({'waitUntil': 'networkidle0'})

    let html = await page.content()

    if (html.includes("Ver un intento de inicio de sesión reciente")){
        await page.click("#checkpointSubmitButton")
        await page.waitForNavigation({'waitUntil': 'networkidle0'})
        html = await page.content()
        if (html.includes("Inicio de sesión cerca de ")){
            await page.click("#checkpointSubmitButton")
            console.log('Saving browser again');
            // await page.evaluate("document.getElementsByClassName('uiInputLabel clearfix uiInputLabelLegacy')[1].click()")
            await page.evaluate("document.getElementById('checkpointSubmitButton').click()")
            await page.waitForNavigation({'waitUntil': 'networkidle0'})
        }
    }

    try {
        const content = await page.evaluate(
            'document.getElementsByClassName("x8t9es0 xkbp9ht x1xlr1w8 xm2d7dc x4hq6eo xq9mrsl x1yc453h x1h4wwuj xeuugli x1emribx x1i64zmx x1e56ztr").innerText');
        if (content === 'Inicio') {
            console.log('Login Successfully');
        }
    } catch (error) {
        console.log('Failed to Login');
        process.exit(0);
    }

    let currentCookies = await page.cookies();
    console.log('Saving cookies in json');
    fs.writeFileSync('./cookies.json', JSON.stringify(currentCookies));
    console.log('Taking picture');
    await page.screenshot({path: 'foto.png'})
    console.log('Closing browser');
    await browser.close()
}

debugger;


loginFacebook().then(r => console.log(r))