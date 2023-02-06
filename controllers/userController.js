const jwt = require('jsonwebtoken');
const Joi = require("@hapi/joi");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const {
    REGISTER_OK,
    USER_EXIST,
    USER_NOT_FOUND,
    WRONG_PASS,
    UNAUTHORIZED,
    TOKEN_INVALID,
    LOGIN_OK,
    UNKNOWN_AUTH_ERROR
} = require('../utils/constants')


function UserController() {


    async function registerUser(req, res) {
        // Validations
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
            return res.status(USER_EXIST.code).json({
                error: {
                    code: USER_EXIST.code,
                    message: USER_EXIST.message
                }
            })
        }

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: password
        });
        try {
            const savedUser = await user.save();
            res.status(200).json({
                message: REGISTER_OK.message,
                code: REGISTER_OK.code,
                data: savedUser
            })
        } catch (error) {
            res.status(400).json({
                error: {
                    code: UNKNOWN_AUTH_ERROR.code,
                    message: UNKNOWN_AUTH_ERROR.message,
                    data: {error}
                }
            })
        }
    }

    async function loginUser(req, res) {
        // Validations
        try {
            const {error} = schemaLogin.validate(req.body);
            if (error) return res.status(400).json({
                error: {
                    code: 400,
                    message: error.details[0].message
                }
            })

            const user = await User.findOne({email: req.body.email});
            if (!user) return res.status(USER_NOT_FOUND.code).json({
                error: {
                    code: USER_NOT_FOUND.code,
                    message: USER_NOT_FOUND.message
                }
            });

            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) return res.status(WRONG_PASS.code).json({
                code: WRONG_PASS.code,
                message: WRONG_PASS.message
            })

            // Creating Token
            const token = jwt.sign({
                name: user.name,
                id: user._id
            }, process.env.SECRET_TOKEN)

            res.status(200).header('X-API-Key', token).json({
                code: LOGIN_OK.code,
                message: LOGIN_OK.message,
                data: {token}
            })
        } catch (error) {
            res.status(400).json({
                error: {
                    code: UNKNOWN_AUTH_ERROR.code,
                    message: UNKNOWN_AUTH_ERROR.message,
                    data: {error}
                }
            })
        }


    }

    function verifyToken(req, res, next) {

        const token = req.header('X-API-Key')
        if (!token) return res.status(UNAUTHORIZED.code).json({
            error: {
                code: UNAUTHORIZED.code,
                message: UNAUTHORIZED.message
            }
        })
        try {
            req.user = jwt.verify(token, process.env.SECRET_TOKEN)
            next()
        } catch (error) {
            res.status(TOKEN_INVALID.code).json({
                error: {
                    code: TOKEN_INVALID.code,
                    message: TOKEN_INVALID.message
                }
            })
        }
    }

    const schemaRegister = Joi.object({
        name: Joi.string().min(6).max(255).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required()
    })

    const schemaLogin = Joi.object({
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(6).max(1024).required()
    })


    return Object.freeze({
        registerUser,
        loginUser,
        verifyToken
    })
}

module.exports = UserController();
