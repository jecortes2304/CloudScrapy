const puppeteer = require("puppeteer")
const config = require('../jsons/config.json');
const jsonResponse = require("../jsons/jsonResponse.json");

class PuppeteerEngine {

    constructor(argsJson) {
        this.request = argsJson["send_in_request"]
        this.getInResponse = argsJson["get_in_response"]
        this.requestConfigs = argsJson["request_config"]
        this.code = argsJson
        this.jsonLogs = {
            "info": [],
            "success": [],
            "warning": [],
            "error": []
        }
    }

    async runEngine() {
        this.jsonLogs["info"].push("Engine initiated")
        const browser = await puppeteer.launch(config.config1)
        const pages = await browser.pages()
        const page = await pages[0]

        const url = this.request["goto"]["url"]
        const urlOptions = this.request["goto"]["options"]
        const instructions = this.request["goto"]["instructions"]

        await this.blockResources(this.requestConfigs["block_resources"], page)

        this.jsonLogs["info"].push("Opening url page")
        let responsePage = await page.goto(url, urlOptions)

        let index = 0
        const arrayInstructionsLength = instructions.length;
        this.jsonLogs["info"].push("Iterating through instructions")
        while (index < arrayInstructionsLength) {
            try {
                let result = await this.executeInstruction(
                    instructions[index]["command"],
                    instructions[index]["params"],
                    instructions[index]["options"],
                    page)
                if (result) {
                    if (instructions[index]["command"] === "sca") {
                        console.log("Action required")
                        this.jsonLogs["info"].push("Action required for sca")
                    }
                    console.log(`instruction ${(index + 1)}/${arrayInstructionsLength}`)
                    this.jsonLogs["info"].push(`instruction ${(index + 1)}/${arrayInstructionsLength}`)
                } else {
                    console.log(`Error in instruction ${(index + 1)}/${arrayInstructionsLength}-(${instructions[index]["command"]})`)
                    this.jsonLogs["error"].push(`Error in instruction ${(index + 1)}/${arrayInstructionsLength}-(${instructions[index]["command"]})`)
                    break
                }
            } catch (error) {
                console.log(error)
                this.jsonLogs["error"].push(error)
                break
            }
            ++index
        }

        this.jsonLogs["info"].push("Creating response and getting extract rules")
        for (let key in this.getInResponse) {
            await this.getContentResponseByKey(key, this.getInResponse, page, jsonResponse, responsePage, this.jsonLogs)
        }

        console.log('done Run Engine')
        this.jsonLogs["success"].push("Run Engine Done!!")
        await browser.close()
        return jsonResponse
    }

    async executeInstruction(command, params, options, page) {
        switch (command) {
            case "click":
                try {
                    await page.click(params[0], options)
                    return true
                } catch (error) {
                    console.log("Error click", error)
                    this.jsonLogs["error"].push(JSON.stringify(error))
                    return false
                }
            case "wait_for_timeout":
                try {
                    await page.waitForTimeout(params[0])
                    return true
                } catch (error) {
                    console.log("Error waitForTimeout", error)
                    this.jsonLogs["error"].push(error)
                    return false
                }
            case "wait_for_selector":
                try {
                    await page.waitForSelector(params[0], options)
                    return true
                } catch (error) {
                    console.log("Error waitForSelector", error)
                    this.jsonLogs["error"].push(error)
                    return false
                }
            case "wait_for_selector_and_click":
                try {
                    await (await page.waitForSelector(params[0], options)).click()
                    return true
                } catch (error) {
                    console.log("Error waitForSelectorAndClick", error)
                    this.jsonLogs["error"].push(error)
                    return false
                }
            case "wait_for_xpath":
                try {
                    await page.waitForXPath(params[0], options)
                    return true
                } catch (error) {
                    console.log("Error waitForXPath", error)
                    this.jsonLogs["error"].push(error)
                    return false
                }
            case "wait_for_navigation":
                try {
                    await page.waitForNavigation(options)
                    return true
                } catch (error) {
                    console.log("Error waitForNavigation", error)
                    this.jsonLogs["error"].push(error)
                    return false
                }
            case "wait_for_response":
                try {
                    await page.waitForResponse(params[0], options)
                    return true
                } catch (error) {
                    console.log("Error waitForResponse", error)
                    this.jsonLogs["error"].push(error)
                    return false
                }
            case "evaluate":
                try {
                    await page.evaluate(params[0], options)
                    return true
                } catch (error) {
                    console.log("Error evaluate", error)
                    this.jsonLogs["error"].push(error)
                    return false
                }
            case "wait_for_function":
                try {
                    await page.waitForFunction(params[0], options)
                    return true
                } catch (error) {
                    console.log("Error waitForFunction", error)
                    this.jsonLogs["error"].push(error)
                    return false
                }
            case "xpath":
                try {
                    await page.$x(params[0])
                    return true
                } catch (error) {
                    console.log("Error xpath", error)
                    this.jsonLogs["error"].push(error)
                    return false
                }
            case "type":
                try {
                    await page.type(params[0], params[1], options)
                    return true
                } catch (error) {
                    console.log("Error type", error)
                    this.jsonLogs["error"].push(error)
                    return false
                }
            case "sca":
                console.log("Asking SCA")
                this.jsonLogs["info"].push("Asking SCA")
                return true

        }
    }

    async blockResources(blockResourcesFlag, page) {
        if (blockResourcesFlag) {
            this.jsonLogs["info"].push("Resources blocked")
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                    // Block All Images
                    if (request.url().endsWith('.png') || request.url().endsWith('.jpg') || request.url().endsWith('.jpeg')) {
                        request.abort();
                        // Block All Videos
                    } else if (request.url().endsWith('.mpg') || request.url().endsWith('.mp4')) {
                        request.abort();
                        // Block All Styles
                    } else if (request.url().endsWith('.css') || request.url().endsWith('.scss')) {
                        request.abort();
                        // Block All Fonts
                    } else if (request.url().endsWith('.tif') || request.url().endsWith('.font')) {
                        request.abort();
                    } else {
                        request.continue()
                    }
                }
            )
            ;
        }
    }

    async getContentResponseByKey(key, getInResponse, page, jsonResponse, responsePage, jsonLogs) {
        let response = jsonResponse["response"]
        switch (key) {
            case "cookies":
                getInResponse["cookies"] === true ? response["cookies"] = await page.cookies() : response["cookies"] = {}
                console.log("cookies")
                break
            case "headers":
                getInResponse["headers"] === true ? response["headers"] = responsePage.headers() : response["headers"] = {}
                console.log("headers")
                break
            case "screenshot":
                const screenshotObject = getInResponse["screenshot"]
                const fullPageFlag = screenshotObject["full_page"]
                screenshotObject["active"] === true ?
                    response["screenshot"] = await page.screenshot({encoding: "base64", fullPage: fullPageFlag})
                    : response["screenshot"] = ""
                console.log("screenshot")
                break
            case "return_page_source":
                getInResponse["return_page_source"] === true ? response["source_page"] = await page.content() : response["source_page"] = {}
                console.log("return_page_source")
                break
            case "logs":
                getInResponse["logs"] === true ? response["logs"] = jsonLogs : response["logs"] = {}
                console.log("logs")
                break
            case "extract_rules":
                const arrayExtractRulesLength = getInResponse["extract_rules"].length;
                let extract_response = {}
                if (arrayExtractRulesLength > 0) {
                    for (let key in this.getInResponse) {
                        try {
                            console.log(`extract rule ${(key + 1)}/${arrayExtractRulesLength}`)
                            extract_response[key] = await page.$x(getInResponse["extract_rules"][key])
                        } catch (error) {
                            console.log(error)
                            break
                        }
                    }
                    response["extract_rules"] = extract_response
                } else {
                    response["extract_rules"] = {}
                }
                console.log("extract_rules")
                break
        }

    }

    async handle2Fa(instructions) {
        console.log("Filling the code input")
        await this.executeInstruction(instructions)
    }

}


module.exports = {PuppeteerEngine}