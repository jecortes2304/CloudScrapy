const {LOGIN_REGISTER_ERRORS} = require("../utils/constants");
const jwt = require("jsonwebtoken");
const {ROLES} = require('../utils/constants')
const config = require('config')
const {SECRET_TOKEN} = config.get('tokens')
const User = require("../models/userModel");


async function verifyToken(req, res, next) {

    const token = getToken(req)

    if (!token) return res.status(401).json({
        error: {
            code: LOGIN_REGISTER_ERRORS.UNAUTHORIZED.code,
            message: LOGIN_REGISTER_ERRORS.UNAUTHORIZED.message
        }
    })
    try {
        const userInfo = jwt.verify(token, SECRET_TOKEN)
        const user = await User.findOne({_id: userInfo.id})
        if (user) {
            req.user = userInfo
            next()
        } else {
            return res.status(401).json({
                error: {
                    code: LOGIN_REGISTER_ERRORS.TOKEN_INVALID.code,
                    message: LOGIN_REGISTER_ERRORS.TOKEN_INVALID.message,
                    error: error.toString()
                }
            })
        }
    } catch (error) {
        return res.status(401).json({
            error: {
                code: LOGIN_REGISTER_ERRORS.TOKEN_INVALID.code,
                message: LOGIN_REGISTER_ERRORS.TOKEN_INVALID.message,
                error: error.toString()
            }
        })
    }
}


async function isRoot(req, res, next) {

    const token = getToken(req)

    if (!token) return res.status(401).json({
        error: {
            code: LOGIN_REGISTER_ERRORS.UNAUTHORIZED.code,
            message: LOGIN_REGISTER_ERRORS.UNAUTHORIZED.message
        }
    })
    try {
        const userVerify = jwt.verify(token, SECRET_TOKEN)
        const user = await User.findOne({_id: userVerify.id});
        if (user.username === ROLES.ROOT) {
            next()
        } else {
            return res.status(403).json({
                error: {
                    code: LOGIN_REGISTER_ERRORS.FORBIDDEN.code,
                    message: `${LOGIN_REGISTER_ERRORS.FORBIDDEN.message}: Only root user can execute this operation`
                }
            })
        }
    } catch (error) {
        return res.status(LOGIN_REGISTER_ERRORS.TOKEN_INVALID.code).json({
            error: {
                code: LOGIN_REGISTER_ERRORS.TOKEN_INVALID.code,
                message: LOGIN_REGISTER_ERRORS.TOKEN_INVALID.message,
                error: error.toString()
            }
        })
    }
}


function getToken(req) {
    return req.header('X-API-Key')
}



module.exports = {verifyToken, isRoot};