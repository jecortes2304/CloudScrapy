const Role = require('../models/rolModel')
const User = require("../models/userModel");
const logger = require("./logger")("");
const config = require('config')
const {password, name, email, username} = config.get('root_user')
const crypto = require('./cryptoUtils')
const {PERMISSIONS} = require("./constants");
const {ROLES} = require("./constants");



const createRoles = async () => {
    try {
        const count = await Role.estimatedDocumentCount();
        if (count > 0) return;

        const values = await Promise.all([
            new Role({
                name: ROLES.ROOT,
                permissions: PERMISSIONS.All
            }).save(),
            new Role({
                name: ROLES.MODERATOR,
                permissions: [PERMISSIONS.READ, PERMISSIONS.SEARCH, PERMISSIONS.NOTIFY, PERMISSIONS.CONFIG, PERMISSIONS.EDIT_OWN]
            }).save(),
            new Role({
                name: ROLES.USER_PREMIUM,
                permissions: [PERMISSIONS.EDIT_OWN, PERMISSIONS.READ]
            }).save(),
            new Role({
                name: ROLES.USER_STANDARD,
                permissions: [PERMISSIONS.READ]
            }).save()
        ]);
        logger.info(`Roles successfully created ${values}`)
    } catch (error) {
        logger.error(`Error creating Roles ${error}`)
    }
}

const createRootUser = async () => {
    try {

        const {exportedPublicKeyBuffer, exportedPrivateKeyBuffer} = crypto.encryptDecrypt().generateKeysPair()
        const keysPair = {
            privateKey: exportedPrivateKeyBuffer,
            publicKey: exportedPublicKeyBuffer
        }
        const role = await Role.findOne({name: ROLES.ROOT});
        const isUsernameExist = await User.findOne({username: username});
        if (!isUsernameExist) {
            const rootUser = new User({
                username: username,
                name: name,
                email: email,
                password: password,
                role: role,
                keysPair: keysPair
            });
            await rootUser.save()
            logger.info(`Root user successfully created`)
        }
    } catch (error) {
        logger.error(`Error creating Root user ${error}`)
    }
}


module.exports = {createRoles, createRootUser}