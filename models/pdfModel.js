const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const Pdf = new Schema({
  userId: String,
  idContext: String,
  idRequest: String,
  urlPage: String,
  pdfUrl: String,
  error: String,
  expireAt: {
    type: Date,
    default: new Date(),
    expires: '1h',
  }
},{
  timestamps: true,
}).index( { "expireAt": 1 }, { expireAfterSeconds: 3600 } );

const PdfModel = mongoose.model('pdf', Pdf);

module.exports = PdfModel;