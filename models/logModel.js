const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const Log = new Schema({
  id_request: String,
  id_context: String,
  log_url: String,
  timestamp: String,
  logs_array: []
});

const LogModel = mongoose.model('logs_requests', Log);

module.exports = LogModel;