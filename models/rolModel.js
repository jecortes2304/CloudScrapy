const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const Role = new Schema({
  name: {
    type: String,
    required: true,
    unique:true
  },
  permissions: [String]
},{
  versionKey: false
});

const RoleModel = mongoose.model('roles', Role);

module.exports = RoleModel;