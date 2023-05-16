const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const Screenshot = new Schema({
  userId: String,
  idContext: String,
  idRequest: String,
  urlPage: String,
  imageUrl: String,
  error: String,
  expireAt: {
    type: Date,
    default: new Date(),
    expires: '1h',
  }
},{
  timestamps: true,
}).index( { "expireAt": 1 }, { expireAfterSeconds: 3600 } );

const ScreenshotModel = mongoose.model('Screenshot', Screenshot);

module.exports = ScreenshotModel;