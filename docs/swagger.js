const {apiDocsConfig} = require('../configs/apiConfig')
const swaggerAutogen = require('swagger-autogen')({openapi: '3.0.0'});

const outputFile = './configs/swaggerConfig.json'
const endpointRoutes = ['./app.js']

swaggerAutogen(outputFile, endpointRoutes , apiDocsConfig).then(() => {
    require('../app')
})