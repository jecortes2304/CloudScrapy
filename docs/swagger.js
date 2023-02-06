const {apiDocsConfig} = require('../configs/apiConfig')
const swaggerAutogen = require('swagger-autogen')()

const outputFile = './configs/swaggerConfig.json'
const endpointRoutes = ['./app.js']

swaggerAutogen(outputFile, endpointRoutes , apiDocsConfig).then(() => {
    require('../app')
})