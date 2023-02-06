const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Browser = new Schema({
    idUser: {
        type: String,
        required: true,
    },
    idBrowser: {
        type: String,
        required: true,
    },
    browserUrl: {
        type: String,
        required: true
    },
    browserStatus: {
        type: String,
    },
    browserContexts: {
        type: [String]
    }
},{
    timestamps: true,
});

const BrowserModel = mongoose.model('browser', Browser);

module.exports = BrowserModel;
