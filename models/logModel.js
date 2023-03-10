const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const Log = new Schema({
  idContext: String,
  idRequest: String,
  logUrl: String,
},{
  timestamps: true,
});

const LogModel = mongoose.model('logs_requests', Log);

module.exports = LogModel;