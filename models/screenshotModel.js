const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const Screenshot = new Schema({
  idContext: String,
  idRequest: String,
  urlPage: String,
  imageUrl: String,
  error: String
},{
  timestamps: true,
});

const ScreenshotModel = mongoose.model('Screenshot', Screenshot);

module.exports = ScreenshotModel;