const jwt = require('jsonwebtoken');
const Joi = require("@hapi/joi");
const User = require("../models/userModel");
const {LOGIN_REGISTER_ERRORS} = require('../utils/constants');
const crypto = require("../utils/cryptoUtils");
const config = require('config');
const {SECRET_TOKEN} = config.get('tokens');

function UserController() {

    async function getAllUsers(req, res){
        const users = await User.find({})
        let userMap = [];

        users.forEach(function(user) {
            userMap.push(user._id);
        });

        return res.status(200).json({
            code: LOGIN_REGISTER_ERRORS.OK_OPERATION.code,
            message: LOGIN_REGISTER_ERRORS.OK_OPERATION.message,
            data: {userMap}
        })
    }

    async function getUserById(req, res) {
        try {
            const userId = req.params.userId
            const user = await User.findOne({_id: userId});
            if (!user) {
                return res.status(404).json({
                    error: {
                        code: LOGIN_REGISTER_ERRORS.USER_NOT_FOUND.code,
                        message: LOGIN_REGISTER_ERRORS.USER_NOT_FOUND.message
                    }
                })
            } else {
                return res.status(200).json({
                    code: LOGIN_REGISTER_ERRORS.USER_FOUND_OK.code,
                    message: LOGIN_REGISTER_ERRORS.USER_FOUND_OK.message,
                    data: {user}
                })
            }
        } catch (error) {
            return res.status(500).json({
                error: {
                    code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                    message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                    error: error.toString()
                }
            })
        }
    }

    async function getUserProfileInfo(req, res) {
        try {
            const token = getToken(req)
            const userInfo = jwt.verify(token, SECRET_TOKEN)
            const user = await User.findOne({_id: userInfo.id})
            if (user) {
                return res.status(200).json({
                    code: LOGIN_REGISTER_ERRORS.OK_OPERATION.code,
                    message: LOGIN_REGISTER_ERRORS.OK_OPERATION.message,
                    data: {user}
                })
            }
        } catch (error) {
            return res.status(500).json({
                error: {
                    code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                    message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                    error: error.toString()
                }
            })
        }
    }

    async function getUserByUsername(req, res) {
        try {
            const username = req.params.username
            const user = await User.findOne({username: username});
            if (!user) {
                return res.status(404).json({
                    error: {
                        code: LOGIN_REGISTER_ERRORS.USER_NOT_FOUND.code,
                        message: LOGIN_REGISTER_ERRORS.USER_NOT_FOUND.message
                    }
                })
            } else {
                return res.status(200).json({
                    code: LOGIN_REGISTER_ERRORS.USER_FOUND_OK.code,
                    message: LOGIN_REGISTER_ERRORS.USER_FOUND_OK.message,
                    data: {user}
                })
            }
        } catch (error) {
            return res.status(500).json({
                error: {
                    code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                    message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                    error: error.toString()
                }
            })
        }
    }

    async function deleteUserById(req, res) {
        try {
            const userId = req.params.userId
            const user = await User.findOne({_id: userId});
            if (!user) {
                return res.status(404).json({
                    error: {
                        code: LOGIN_REGISTER_ERRORS.USER_NOT_FOUND.code,
                        message: LOGIN_REGISTER_ERRORS.USER_NOT_FOUND.message
                    }
                })
            } else {
                if (user.username === 'root') {
                    return res.status(403).json({
                        code: LOGIN_REGISTER_ERRORS.ERROR_ROOT_DELETE.code,
                        message: LOGIN_REGISTER_ERRORS.ERROR_ROOT_DELETE.message
                    })
                } else {
                    await User.deleteOne({_id: userId});
                    return res.status(200).json({
                        code: LOGIN_REGISTER_ERRORS.DELETE_OK.code,
                        message: LOGIN_REGISTER_ERRORS.DELETE_OK.message
                    })
                }
            }
        } catch (error) {
            return res.status(500).json({
                error: {
                    code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                    message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                    error: error.toString()
                }
            })
        }
    }

    async function updateUserById(req, res) {
        try {
            const {error} = schemaUpdater.validate(req.body)
            if (error) {
                return res.status(400).json({
                    error: {
                        code: 400,
                        message: error.details[0].message
                    }
                })
            }
            const userId = req.params.userId
            const userToUpdate = req.body
            const userUpdated = await User.findByIdAndUpdate(userId, userToUpdate, {new: true});
            if (!userUpdated) {
                return res.status(404).json({
                    error: {
                        code: LOGIN_REGISTER_ERRORS.USER_NOT_FOUND.code,
                        message: LOGIN_REGISTER_ERRORS.USER_NOT_FOUND.message
                    }
                })
            }else {
                const userToShow = {
                    username: userUpdated.username,
                    name: userUpdated.name,
                    email: userUpdated.email,
                    publicKey: userUpdated.keysPair.publicKey,
                    role: userUpdated.role
                }
                return res.status(200).json({
                        code: LOGIN_REGISTER_ERRORS.USER_UPDATED_OK.code,
                        message: LOGIN_REGISTER_ERRORS.USER_UPDATED_OK.message,
                        data: userToShow
                })
            }
        } catch (error) {
            return res.status(500).json({
                error: {
                    code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                    message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                    error: error.toString()
                }
            })
        }
    }

    async function refreshKeysPairById(req, res) {
        try {
            const userId = req.params.userId
            const {exportedPublicKeyBuffer, exportedPrivateKeyBuffer} = crypto.encryptDecrypt().generateKeysPair()
            const keysPair = {
                privateKey: exportedPrivateKeyBuffer,
                publicKey: exportedPublicKeyBuffer
            }
            const userUpdated = await User.findByIdAndUpdate(userId, {keysPair}, {new: true});
            if (!userUpdated) {
                return res.status(404).json({
                    error: {
                        code: LOGIN_REGISTER_ERRORS.USER_NOT_FOUND.code,
                        message: LOGIN_REGISTER_ERRORS.USER_NOT_FOUND.message
                    }
                })
            } else {
                return res.status(204).json({
                    code: LOGIN_REGISTER_ERRORS.UPDATED_NO_CONTENT.code,
                    message: LOGIN_REGISTER_ERRORS.UPDATED_NO_CONTENT.message
                })
            }
        } catch (error) {
            return res.status(500).json({
                error: {
                    code: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.code,
                    message: LOGIN_REGISTER_ERRORS.INTERNAL_SERVER_ERROR.message,
                    error: error.toString()
                }
            })
        }
    }


    const schemaUpdater = Joi.object({
        name: Joi.string().min(6).max(255).required(),
        password: Joi.string().min(6).max(1024).required(),
        role: Joi.string().min(4).max(20)
    })


    function getToken(req) {
        return req.header('X-API-Key')
    }



    return Object.freeze({
        getUserById,
        getAllUsers,
        getUserProfileInfo,
        getUserByUsername,
        deleteUserById,
        updateUserById,
        refreshKeysPairById
    })
}

module.exports = UserController();
