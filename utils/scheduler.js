const cron = require("node-cron");
const {FilesExpiration} = require('../utils/filesUtils')

function ScheduleProcess(){

    return cron.schedule("0 0 */12 * * *", function () {
        FilesExpiration().verifyPdfsExpire()
        FilesExpiration().verifyImagesExpire()
        FilesExpiration().verifyLogsExpire()
        console.log("---------------------");
        console.log("Running a expiration files task every 12 hours");
    });

}

module.exports = ScheduleProcess