//Cloud Scrapy errors
exports.OK = {code: 'CS00', message: 'Request successful'}
exports.EXECUTION_SUCCESS = {code: 'CS01', message: 'Instructions successfully executed'}
exports.EXECUTION_FAILED = {code: 'CS02', message: 'Instruction failed'}
exports.NO_EXECUTION = {code: 'CS03', message: 'No instructions in request'}
exports.ACTION_REQUIRED = {code: 'CS04', message: 'Need attention, action required'}
exports.VERIFICATION_FAILED = {code: 'CS05', message: 'SCA verification failed'}
exports.UNKNOWN_ERROR = {code: 'CS06', message: 'Unknown execution error'}


//Login and Register errors
exports.USER_EXIST = {code: 400, message: 'User already exist'}
exports.USER_NOT_FOUND = {code: 400, message: 'User not found'}
exports.LOGIN_OK = {code: 200, message: 'User logged successfully'}
exports.REGISTER_OK = {code: 200, message: 'User registered successfully'}
exports.WRONG_PASS = {code: 401, message: 'Wrong password'}
exports.TOKEN_INVALID = {code: 401, message: 'The token is invalid'}
exports.UNAUTHORIZED = {code: 401, message: 'Unauthorized'}
exports.UNKNOWN_AUTH_ERROR = {code: 400, message: 'Unknown authorization error'}
exports.INTERNAL_SERVER_ERROR = {code: 500, message: 'Internal server error'}


exports.BROWSER_STATUS = {
    RUNNING: "running",
    WAITING: "waiting",
    STOPPED: "stopped",
    CRASHED: "crashed"
}
