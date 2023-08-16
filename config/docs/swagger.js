const {apiDocsConfig} = require('../config_files/apiConfig')
const swaggerAutogen = require('swagger-autogen')({openapi: '3.0.0'});

const outputFile = './config/docs/openapi.json'
const endpointRoutes = ['./app.js']

swaggerAutogen(outputFile, endpointRoutes , apiDocsConfig).then(() => {
    // require('../../app')
    console.log("DOCS UPDATED")
})