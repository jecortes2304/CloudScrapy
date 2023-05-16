const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const Log = new Schema({
  userId: String,
  idContext: String,
  idRequest: String,
  logUrl: String,
  expireAt: {
    type: Date,
    default: new Date(),
    expires: '1h',
  }
},{
  timestamps: true,
}).index( { "expireAt": 1 }, { expireAfterSeconds: 3600 } );


const LogModel = mongoose.model('logs_requests', Log);

module.exports = LogModel;