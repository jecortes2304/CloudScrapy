const apiConfig = {
    apiDocsConfig: {
        info: {
            title: "Cloud Scrapy API",
            version: "0.0.1",
            description:
                "API to interact with headless browser engine bot on the cloud to scrape data",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
            contact: {
                name: "Lucual18",
                url: "https://www.lucual18.com",
                email: "layusoelu@lucual18.es",
            },
        },
        servers: [
            {
                url: "http://localhost:3000/",
                description: "dev server"
            },
            {
                url: "http://localhost:5000/",
                description: "docker dev server"
            }
        ],
        consumes: ['application/json'],
        produces: ['application/json'],
        securityDefinitions: {
            apiKeyAuth:{
                type: "apiKey",
                in: "header",
                name: "X-API-Key",
                description: "Cloud Scrapy key to authenticate"
            }
        },
        apis: ["./routes/*.js"],
        definitions: {
            Execution: {
            request_description: "Searching on google a word and click first link",
            send_in_request: {
                url: "https://www.google.com", options: {"waitUntil": "networkidle0"},
                instructions: [
                    {command: "type", params: ["input[name='q']", "lucual18"], options: {delay: 10}}
                ]
            },
            get_in_response: {
                cookies: true,
                headers: true,
                logs: {
                    active: true,
                    full_logs: false
                },
                screenshot: {
                    active: true,
                    full_page: false
                },
                source_page: true
            },
            request_config: {
                block_resources: ["image", "video"],
            }
        }}
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
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "Cloud Scrapy Api Docs"
        // customfavIcon: "/assets/favicon.ico"
    },
    corsConfig: {
        origin: 'http://localhost:3000',
        optionsSuccessStatus: 200
    }
}

module.exports = apiConfig
