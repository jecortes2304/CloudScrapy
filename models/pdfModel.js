const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const Pdf = new Schema({
  idContext: String,
  idRequest: String,
  pdfUrl: String,
},{
  timestamps: true,
});

const PdfModel = mongoose.model('pdf', Pdf);

module.exports = PdfModel;