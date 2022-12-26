const puppeteer = require('puppeteer')
const fs = require('fs')
const credentials = require('../jsons/credentials.json');
const cookies = require('./campus_cookies.json');
const config = require('../jsons/config.json');
const prompt = require("prompt-sync")({sigint: true});

const campusUrgencias = async () => {
    const browser = await puppeteer.launch(config.config1)
    const pages = await browser.pages()
    const page = await pages[0]

    if (Object.keys(cookies).length > 0) {
        if (cookies)
        console.log('Cookies active');
        await page.setCookie(...cookies)
        await page.goto('https://campus.grupocto.com/#/inicio', {waitUntil: 'networkidle0'})

        const links = await page.$$eval('a', as => as.map(a => a.href))

        for (let link of links){
            console.log(link)
            if (link.includes('multimedia/videos')){
                await page.goto(link, {waitUntil: 'networkidle0'})
                break
            }
        }

    }else {
        await page.goto('https://idsrv.grupocto.com/', {waitUntil: 'networkidle0'})

        await page.type("input[name='SignInModel.UserName']", credentials.freddy.username, {delay: 10});
        await page.type("input[name='SignInModel.Password']", credentials.freddy.password, {delay: 10});
        await page.click("div.form-actions:nth-child(6) > button:nth-child(2)")

        await page.waitForNavigation({waitUntil: 'networkidle0'})

        let currentCookies = await page.cookies();
        console.log('Saving cookies in json');
        fs.writeFileSync('./campus_cookies.json', JSON.stringify(currentCookies));

        const links = await page.$$eval('a', as => as.map(a => a.href))

        for (let link of links){
            if (link.includes('multimedia/videos')){
                await page.goto(link, {waitUntil: 'networkidle0'})
                break
            }
        }
    }

    let elements = await page.evaluate('document.getElementsByClassName("blue")')
    console.log(elements)

    const checkboxes = await page.$$eval('a', as => as.map(a => a.href))

    for (let link of links){
        if (link.includes('multimedia/videos')){
            await page.goto(link, {waitUntil: 'networkidle0'})
            break
        }
    }

    // await browser.close()
}

const downloadVideos = async (page) =>{
    const links = await page.$$eval('a', as => as.map(a => a.href))

    for (let link of links){
        if (link.includes('multimedia/videos')){
            await page.goto(link, {waitUntil: 'networkidle0'})
            break
        }
    }

    // let elements = await page.evaluate('document.getElementsByClassName("blue")')
    // console.log(elements)
    //
    // const inputsChecks = await page.$$eval('input[type="checkbox"]', ()=>{})
    // console.log(inputsChecks)
}



campusUrgencias().then(r => console.log(r))