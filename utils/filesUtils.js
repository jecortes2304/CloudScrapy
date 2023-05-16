const { rimraf } = require('rimraf');
const fs = require('fs');
const path = require('path');
const config = require("config");


const pdfsFilesDir = path.join(`${__dirname}`, `.${config.get('paths.pdf_path')}`);
const logsFilesDir = path.join(`${__dirname}`, `.${config.get('paths.logs_path')}`);
const ScreenshotsFilesDir = path.join(`${__dirname}`, `.${config.get('paths.images_path')}`);
const addTimeInMillS = config.get('limits.time_seconds_expires') * 1000

function FilesExpiration(){
    function verifyPdfsExpire(){
        return deleteByDir(pdfsFilesDir)
    }

    function verifyImagesExpire(){
        return deleteByDir(logsFilesDir)
    }

    function verifyLogsExpire(){
        return deleteByDir(ScreenshotsFilesDir)
    }

    function deleteByDir(filesDir){
        fs.readdir(filesDir, function(err, files) {
            files.forEach(function(file) {
                try {
                    fs.stat(path.join(filesDir, file), function(err, stat) {
                        let endTime, now;
                        if (err) {
                            return console.error(err);
                        }
                        now = new Date().getTime();
                        endTime = new Date(stat.ctime).getTime() + addTimeInMillS;
                        if (now > endTime) {
                            let filePath = path.join(filesDir, file)
                            if (file.toString().length > 2){
                                rimraf.rimraf(filePath, [], function () {
                                }).catch(reason => {
                                    console.error(reason);
                                });
                            }
                        }
                    });
                }catch (error){
                    console.error("Error with file: " + file.toString())
                    console.error("Error : " + error.toString())
                }
            });
        });
    }

    return Object.freeze({
        verifyPdfsExpire,
        verifyImagesExpire,
        verifyLogsExpire
    })
}


module.exports = {FilesExpiration};
