const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const Screenshot = new Schema({
  id_context: String,
  href: String,
  image_path: String,
  error: String
});

const ScreenshotModel = mongoose.model('Screenshot', Screenshot);

module.exports = ScreenshotModel;