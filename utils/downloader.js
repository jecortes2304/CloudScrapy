const https = require('https')
const http = require('http')
const fs = require('fs')
const URL = require('url').URL
const path = require('path')



function downloadByRequest(urlParam, fileName, callback){

    const url = new URL(urlParam)
    const requestProtocol = url.protocol === 'https:' ? https : http


    const req = requestProtocol.get(urlParam, function (res) {
        let fileStream = fs.createWriteStream(downloadPathImage+"/"+fileName)
        res.pipe(fileStream)

        fileStream.on("error", function (err){
            console.log(`Error writing to the stream ${err}`)
        })

        fileStream.on("close", function (){
            callback(fileName)
        })

        fileStream.on("finish", function (){
            fileStream.close()
            console.log(`File ${fileName} correctly downloaded`)
        })
    });

    req.on('error', function (err) {
        console.log(`Error downloading the file: ${err}`)
    })
}


async function downloadBySelectors(selectorsArray, filesDir, page) {

    const downloadPathImage = path.resolve(__dirname, `../files/pdfs/${filesDir}`);

    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath:downloadPathImage
    });

    for (let selector of selectorsArray) {
        await selector.click()
    }

}

module.exports = {downloadByRequest, downloadBySelectors}