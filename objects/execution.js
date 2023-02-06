const {GetInResponse} = require("./getInResponse");
const {RequestConfig} = require("./requestConfig");
const {Request} = require("./request");

function Execution(data) {
    this.requestDescription = data['request_description']
    this.request = new Request(data)
    this.getInResponse = new GetInResponse(data)
    this.requestConfig = new RequestConfig(data)

}

module.exports = {Execution}