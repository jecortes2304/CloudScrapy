const jwt = require('jsonwebtoken');
const Joi = require("@hapi/joi");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const {LOGIN_REGISTER_ERRORS, ROLES} = require('../utils/constants');
const Role = require("../models/rolModel");
const crypto = require("../utils/cryptoUtils");
const config = require('config');
const {SECRET_TOKEN} = config.get('tokens');


function AuthController() {


    async function registerUser(req, res) {
        const {error} = schemaRegister.validate(req.body)
        if (error) {
            return res.status(400).json({
                error: {
                    code: 400,
                    message: error.details[0].message
                }
            })
        }

        const isEmailExist = await User.findOne({email: req.body.email});
        if (isEmailExist) {
            return res.status(400).json({
                error: {
                    code: LOGIN_REGISTER_ERRORS.USER_EXIST.code,
                    message: LOGIN_REGISTER_ERRORS.USER_EXIST.message
                }
            })
        }

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);
        const role = await Role.findOne({name: req.body.role});
        const {exportedPublicKeyBuffer, exportedPrivateKeyBuffer} = crypto.encryptDecrypt().generateKeysPair()
        const keysPair = {
            privateKey: exportedPrivateKeyBuffer,
            publicKey: exportedPublicKeyBuffer
        }

        const user = new User({
            username: req.body.username,
            name: req.body.name,
            email: req.body.email,
            password: password,
            keysPair: keysPair
        });

        if (role) {
            if (role.name === ROLES.ROOT.toString()) {
                return res.status(400).json({
                    error: {
                        code: LOGIN_REGISTER_ERRORS.ERROR_ROOT_ROLE.code,
                        message: LOGIN_REGISTER_ERRORS.ERROR_ROOT_ROLE.message
                    }
                })
            } else {
                user.role = role
            }
        } else {
            user.role = await Role.findOne({name: ROLES.USER_STANDARD});
        }

        try {
            const savedUser = await user.save();

            const userToShow = {
                username: savedUser.username,
                name: savedUser.name,
                email: savedUser.email,
                publicKey: savedUser.keysPair.publicKey,
                role: savedUser.role
            }
            return res.status(200).json({
                message: LOGIN_REGISTER_ERRORS.REGISTER_OK.message,
                code: LOGIN_REGISTER_ERRORS.REGISTER_OK.code,
                data: userToShow
            })
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

    async function loginUser(req, res) {
        try {
            const {error} = schemaLogin.validate(req.body);
            if (error) return res.status(400).json({
                error: {
                    code: 400,
                    message: error.details[0].message
                }
            })

            const user = await User.findOne({email: req.body.email});
            if (!user) return res.status(404).json({
                error: {
                    code: LOGIN_REGISTER_ERRORS.USER_NOT_FOUND.code,
                    message: LOGIN_REGISTER_ERRORS.USER_NOT_FOUND.message
                }
            });

            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) return res.status(401).json({
                code: LOGIN_REGISTER_ERRORS.WRONG_PASS.code,
                message: LOGIN_REGISTER_ERRORS.WRONG_PASS.message
            })

            // Creating Token
            const token = jwt.sign({
                id: user._id,
                username: user.username,
                name: user.name
            }, SECRET_TOKEN)

            return res.status(200).header('X-API-Key', token).json({
                code: LOGIN_REGISTER_ERRORS.LOGIN_OK.code,
                message: LOGIN_REGISTER_ERRORS.LOGIN_OK.message,
                token: token
            })
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


    const schemaRegister = Joi.object({
        username: Joi.string().min(6).max(255).required(),
        name: Joi.string().min(6).max(255).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required(),
        role: Joi.string().min(4).max(20)
    }).required()

    const schemaLogin = Joi.object().keys({
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required()
    }).required()


    return Object.freeze({
        registerUser,
        loginUser,
    })
}

module.exports = AuthController();
