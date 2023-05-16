const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    username: {
        type: String,
        required: true,
        unique:true,
        min: 6,
        max: 255
    },
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        unique:true,
        min: 6,
        max: 1024
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    keysPair:{
        type: JSON,
        required: false
    },
    img: {
        type: String,
        allowNull: true
    },
    role: {
        ref: "roles",
        type: Schema.Types.ObjectId
    }
},{
    timestamps: true,
    versionKey: false
});

const UserModel = mongoose.model('User', User);

module.exports = UserModel;
