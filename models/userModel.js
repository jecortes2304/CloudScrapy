const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    browserUrl: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    }
},{
    timestamps: true,
});

const UserModel = mongoose.model('User', User);

module.exports = UserModel;
