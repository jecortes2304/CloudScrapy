const config = require('config')
const {server_url, server_environment} = config.get('server')
const packageProject = require('../../package.json');
const cloudScrapyVersion = packageProject.version
const {
    AUTH_REQUESTS_DEFINITIONS, AUTH_RESPONSES_DEFINITIONS,
    EXECUTION_REQUESTS_DEFINITIONS, EXECUTION_RESPONSES_DEFINITIONS,
    USER_REQUESTS_DEFINITIONS, USER_RESPONSES_DEFINITIONS,
    FILES_RESPONSES_DEFINITIONS, UTILS_REQUESTS_DEFINITIONS,
    UTILS_RESPONSES_DEFINITIONS, GENERIC_RESPONSES_DEFINITIONS
} = require('../docs/swaggerDefinitions')

const apiConfig = {
    apiDocsConfig: {
        info: {
            title: "Cloud Scrapy API",
            version: cloudScrapyVersion,
            description:
                "API to interact with headless browser engine bot on the cloud to scrape data",
            license: {
                name: "ISC",
                url: "https://opensource.org/licenses/ISC",
            },
            contact: {
                name: "Lucual18",
                url: "https://www.lucual18.com",
                email: "joseernesto@lucual18.es",
            },
        },
        servers: [
            {
                url: `${server_url}`,
                description: `${server_environment} SERVER`
            }
        ],
        consumes: ['application/json'],
        produces: ['application/json'],
        externalDocs: {
            description: "openapi.json",
            url: "/openapi.json"
        },
        securityDefinitions: {
            apiKeyAuth: {
                type: "apiKey",
                in: "header",
                name: "X-API-Key",
                description: "Cloud Scrapy key to authenticate"
            }
        },
        apis: ["./routes/*.js"],
        definitions: {
            LoginUser: AUTH_REQUESTS_DEFINITIONS.LoginUser,
            RegisterUser: AUTH_REQUESTS_DEFINITIONS.RegisterUser,
            LoginOk: AUTH_RESPONSES_DEFINITIONS.LoginOk,
            RegisterOk: AUTH_RESPONSES_DEFINITIONS.RegisterOk,
            ErrorLogin: AUTH_RESPONSES_DEFINITIONS.ErrorLogin,
            ErrorForbidden: AUTH_RESPONSES_DEFINITIONS.ErrorForbidden,

            Execution: EXECUTION_REQUESTS_DEFINITIONS.Execution,
            ActionRequiredExecution: EXECUTION_REQUESTS_DEFINITIONS.ActionRequiredExecution,
            ExecutionResponse: EXECUTION_RESPONSES_DEFINITIONS.ExecutionResponse,
            ExecutionResponseError: EXECUTION_RESPONSES_DEFINITIONS.ExecutionResponseError,
            ExecutionCloseResponse: EXECUTION_RESPONSES_DEFINITIONS.ExecutionCloseResponse,
            AllBrowserContextsResponse: EXECUTION_RESPONSES_DEFINITIONS.AllBrowserContextsResponse,

            UpdateUser: USER_REQUESTS_DEFINITIONS.UpdateUser,
            UpdateUserResponse: USER_RESPONSES_DEFINITIONS.UpdateUserResponse,
            UserByParamResponse: USER_RESPONSES_DEFINITIONS.UserByParamResponse,
            UsersByParamResponse: USER_RESPONSES_DEFINITIONS.UsersByParamResponse,
            UserDeletedResponse: USER_RESPONSES_DEFINITIONS.UserDeletedResponse,

            LogInfoResponse: FILES_RESPONSES_DEFINITIONS.LogInfoResponse,
            PdfInfoResponse: FILES_RESPONSES_DEFINITIONS.PdfInfoResponse,
            ScreenshotInfoResponse: FILES_RESPONSES_DEFINITIONS.ScreenshotInfoResponse,
            FileNotFound: FILES_RESPONSES_DEFINITIONS.FileNotFound,

            HtmlToPdfByContent: UTILS_REQUESTS_DEFINITIONS.HtmlToPdfByContent,
            HtmlTpPdfByContentResponse: UTILS_RESPONSES_DEFINITIONS.HtmlTpPdfByContentResponse,

            ErrorNotFound: GENERIC_RESPONSES_DEFINITIONS.ErrorNotFound,
            ErrorBadRequest: GENERIC_RESPONSES_DEFINITIONS.ErrorBadRequest,
            ErrorInternalServer: GENERIC_RESPONSES_DEFINITIONS.ErrorInternalServer,
            ToManyRequests: GENERIC_RESPONSES_DEFINITIONS.ToManyRequests

        }
    },
    apiDocsOptions: {
        openapi: true,
        language: true,
        disableLogs: true,
        autoHeaders: true,
        autoQuery: true,
        autoBody: true
    },
    apiDocsOptionsUI: {
        // customCss: '.swagger-ui .topbar-wrapper img { content:url(\'/public/images/cloud_scrapy.ico\');}',
        customSiteTitle: "Cloud Scrapy Api Docs",
        customfavIcon: "/public/images/cloud_scrapy.ico"
    },
    corsConfig: {
        origin: server_url,
        optionsSuccessStatus: 200
    }
}

module.exports = apiConfig
