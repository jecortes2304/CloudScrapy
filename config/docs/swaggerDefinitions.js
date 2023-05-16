exports.AUTH_REQUESTS_DEFINITIONS = {
    LoginUser: {
        email: "string",
        password: "string"
    },
    RegisterUser: {
        username: "string",
        name: "string",
        email: "string",
        password: "string",
        role: "string"
    },
}

exports.AUTH_RESPONSES_DEFINITIONS = {
    RegisterOk: {
        message: "User registered successfully",
        code: 200,
        data: {
            username: "string",
            name: "string",
            email: "string",
            publicKey: "string",
            role: "string"
        }
    },
    LoginOk: {
        code: 200,
        message: "User logged successfully",
        token: "string"
    },
    ErrorLogin: {
        error: {
            code: 401,
            message: "The token is invalid"
        }
    },
    ErrorForbidden: {
        error: {
            code: 403,
            message: "Resource forbidden:"
        }
    }
}





exports.EXECUTION_REQUESTS_DEFINITIONS = {
    Execution: {
        request_description: "string",
        send_in_request: {
            url: "string", options: {waitUntil: "string"},
            instructions: [
                {command: "goto", params: ["string"], options: {waitUntil: "string"}},
                {command: "click", params: ["string"], options: {}},
                {command: "click_and_wait", params: ["string"], options: {}},
                {command: "wait_for_selector", params: ["string"], options: {}},
                {command: "wait_for_selector_and_click", params: ["string"], options: {}},
                {command: "wait_selector_click_wait_nav", params: ["string"], options: {}},
                {command: "wait_for_xpath", params: ["string"], options: {}},
                {command: "wait_for_function", params: ["string"], options: {timeout: 10}},
                {command: "wait_for_navigation", params: [], options: {waitUntil: "string"}},
                {command: "evaluate", params: ["string"], options: {}},
                {command: "verify", params: ["string"], options: {}},
                {command: "xpath", params: ["string"], options: {}},
                {command: "sec_type", params: ["string", "string"], options: {delay: 10}},
                {command: "keyboard_press", params: ["string"], options: {}},
                {command: "keyboard_down", params: ["string"], options: {}},
                {command: "keyboard_up", params: ["string"], options: {}},
                {command: "type", params: ["string", "string"], options: {delay: 10}}
            ]
        },
        get_in_response: {
            cookies: true,
            headers: true,
            html_to_pdf: true,
            logs: {
                active: true,
                full_logs: false
            },
            screenshot: {
                active: true,
                full_page: false
            },
            source_page: true,
            extract_rules: true
        },
        request_config: {
            block_resources: ["string"],
            headers: "string",
            cookies: "string",
            captcha: true,
            geolocation: {latitude: "string", longitude: "string"},
            user_agent: "string",
            view_port: {width: "string", height: "string"},
            custom_proxy: "string"
        }
    },
    ActionRequiredExecution: {
        context_id: "string",
        request_id: "string",
        request_description: "string",
        send_in_request: {
            url: "string", options: {waitUntil: "string"},
            instructions: [
                {command: "goto", params: ["string"], options: {waitUntil: "string"}},
                {command: "click", params: ["string"], options: {}},
                {command: "click_and_wait", params: ["string"], options: {}},
                {command: "wait_for_selector", params: ["string"], options: {}},
                {command: "wait_for_selector_and_click", params: ["string"], options: {}},
                {command: "wait_selector_click_wait_nav", params: ["string"], options: {}},
                {command: "wait_for_xpath", params: ["string"], options: {}},
                {command: "wait_for_function", params: ["string"], options: {timeout: 10}},
                {command: "wait_for_navigation", params: [], options: {waitUntil: "string"}},
                {command: "evaluate", params: ["string"], options: {}},
                {command: "verify", params: ["string"], options: {}},
                {command: "xpath", params: ["string"], options: {}},
                {command: "sec_type", params: ["string", "string"], options: {delay: 10}},
                {command: "keyboard_press", params: ["string"], options: {}},
                {command: "keyboard_down", params: ["string"], options: {}},
                {command: "keyboard_up", params: ["string"], options: {}},
                {command: "type", params: ["string", "string"], options: {delay: 10}}
            ]
        },
    },
}

exports.EXECUTION_RESPONSES_DEFINITIONS = {
    ExecutionResponse: {
        hostname: "string",
        requestId: "string",
        contextId: "string",
        instructionsMessage: "string",
        instructionsCode: "string",
        executionResult: {
            cookies: [],
            headers: {},
            screenshot: "string",
            htmlToPdf: "string",
            logs: "string",
            sourcePage: "string",
            extractRules: {},
        }
    },
    ExecutionResponseError: {
        hostname: "string",
        requestId: "string",
        code: 500,
        message: "string",
        error: "string"
    },
    ExecutionCloseResponse: {
        hostname: "string",
        contextId: "string",
        requestId: "string",
        code: 200,
        message: "string",
    },
    AllBrowserContextsResponse: {
        hostname: "string",
        code: 200,
        message: "string",
        result: {
            total: 1,
            browserContexts: []
        }
    },
}





exports.USER_REQUESTS_DEFINITIONS = {
    UpdateUser: {
        name: "string",
        password: "string",
        role: "string"
    },
}

exports.USER_RESPONSES_DEFINITIONS = {
    UpdateUserResponse: {
        code: 200,
        message: "User successfully updated",
        data: {
            username: "string",
            name: "string",
            email: "string",
            publicKey: "string",
            role: "string"
        }
    },
    UserByParamResponse: {
        code: 200,
        message: "Operation correctly executed",
        data: {}
    },
    UsersByParamResponse: {
        code: 200,
        message: "Operation correctly executed",
        data: [
            "string"
        ]
    },
    UserDeletedResponse: {
        code: 200,
        message: "User successfully deleted"
    }
}





exports.FILES_REQUESTS_DEFINITIONS = {

}

exports.FILES_RESPONSES_DEFINITIONS = {
    ScreenshotInfoResponse: {
        hostname: "string",
        message: "string",
        code: 200,
        screenshot: {
            userId: "string",
            idContext: "string",
            idRequest: "string",
            urlPage: "string",
            imageUrl: "string",
            error: "string",
            expireAt: "string",
            createdAt: "string",
            updatedAt: "string"
        }
    },
    PdfInfoResponse: {
        hostname: "string",
        message: "string",
        code: 200,
        pdf: {
            userId: "string",
            idContext: "string",
            idRequest: "string",
            urlPage: "string",
            pdfUrl: "string",
            error: "string",
            expireAt: "string",
            createdAt: "string",
            updatedAt: "string"
        }
    },
    LogInfoResponse: {
        hostname: "string",
        message: "string",
        code: 200,
        log: {
            userId: "string",
            idContext: "string",
            idRequest: "string",
            logUrl: "string",
            expireAt: "string",
            createdAt: "string",
            updatedAt: "string"
        }
    },

    FileNotFound: {
        code: 404,
        message: "string"
    },
}




exports.UTILS_REQUESTS_DEFINITIONS = {
    HtmlToPdfByContent:{
        request_description: "string",
        html_content: "string",
        output_format: "string",
        next: false
    }
}

exports.UTILS_RESPONSES_DEFINITIONS = {
    HtmlTpPdfByContentResponse: {
        hostname: "string",
        code: 200,
        message: "string",
        requestId: "string",
        contextId: "string",
        result: "string"
    }
}




exports.GENERIC_RESPONSES_DEFINITIONS = {
    ErrorNotFound: {
        error: {
            code: 404,
            message: "Resource not found"
        }
    },
    ErrorInternalServer: {
        error: {
            code: 500,
            message: "Internal server error",
            error: "string"
        }
    },
    ErrorBadRequest: {
        error: {
            code: 400,
            message: "string",
        }
    },
    ToManyRequests: {
        code: 429,
        message: "string"
    },
}
