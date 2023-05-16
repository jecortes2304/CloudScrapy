//CLOUD SCRAPY ERRORS
exports.CLOUD_SCRAPY_ERRORS = {
    OK: {code: 'CS00', message: 'Request successful'},
    EXECUTION_SUCCESS: {code: 'CS01', message: 'Instructions successfully executed'},
    EXECUTION_FAILED: {code: 'CS02', message: 'Instruction failed'},
    NO_EXECUTION: {code: 'CS03', message: 'No instructions in request'},
    ACTION_REQUIRED: {code: 'CS04', message: 'Need attention, action required'},
    VERIFICATION_FAILED: {code: 'CS05', message: 'SCA verification failed'},
    UNKNOWN_ERROR: {code: 'CS06', message: 'Unknown execution error'},
    BROWSERS_CONTEXTS_LIMIT_EXCEED: {code: 'CS07', message: 'Browsers contexts limits exceed'}
}

//LOGIN AND REGISTER ERRORS
exports.LOGIN_REGISTER_ERRORS = {
    ERROR_ROOT_DELETE: {code: 403, message: 'User root can not be deleted'},
    ERROR_ROOT_ROLE: {code: 400, message: 'Root role already exist'},
    USER_EXIST: {code: 400, message: 'User already exist'},
    USER_NOT_FOUND : {code: 404, message: 'Resource not found: User not found'},
    NOT_FOUND : {code: 404, message: 'Resource not found'},
    UPDATED_NO_CONTENT : {code: 204, message: 'Resource successfully updated'},
    USER_UPDATED_OK : {code: 200, message: 'User successfully updated'},
    USER_FOUND_OK : {code: 200, message: 'User successfully found'},
    LOGIN_OK: {code: 200, message: 'User logged successfully'},
    DELETE_OK: {code: 200, message: 'User successfully deleted'},
    OK_OPERATION: {code: 200, message: 'Operation correctly executed'},
    REGISTER_OK: {code: 200, message: 'User registered successfully'},
    WRONG_PASS: {code: 401, message: 'Wrong password'},
    TOKEN_INVALID:  {code: 401, message: 'The token is invalid'},
    UNAUTHORIZED: {code: 401, message: 'Unauthorized'},
    FORBIDDEN: {code: 403, message: 'Resource forbidden'},
    UNKNOWN_AUTH_ERROR: {code: 400, message: 'Unknown authorization error'},
    BAD_REQUEST: {code: 400, message: 'Bad request'},
    TO_MANY_REQUESTS: {code: 429, message: 'To many requests'},
    INTERNAL_SERVER_ERROR: {code: 500, message: 'Internal server error'}
}

//ROUTES FILES STRINGS
exports.ROUTES_FILES_V1 = {
    LOG: "/api/v1/files/logs",
    LOG_INFO: "/api/v1/files/log-info",
    PDF: "/api/v1/files/pdfs",
    PDF_INFO: "/api/v1/files/pdf-info",
    SCREENSHOT: "/api/v1/files/screenshots",
    SCREENSHOT_INFO: "/api/v1/files/screenshot-info",
}

//DATABASE PERMISSIONS
exports.PERMISSIONS = {
    EDIT_OWN: "edit_own",
    SEARCH: "search",
    READ: "read",
    CREATE: "create",
    MODIFY: "modify",
    DELETE: "delete",
    CONFIG: "config",
    NOTIFY: "notify",
    All: ["edit_own", "search", "read", "create", "modify", "delete", "config", "notify"]
}

//DATABASE ROLES
exports.ROLES = {
    ROOT: "root",
    MODERATOR: "moderator",
    USER_PREMIUM: "user_premium",
    USER_STANDARD: "user_standard"
}

//DATABASE BROWSER_CONTEXT_STATUS
exports.BROWSER_CONTEXT_STATUS = {
    RUNNING: "running",
    WAITING: "waiting",
    STOPPED: "closed",
    CRASHED: "crashed"
}
