function GetInResponse(data) {
    const response = data['get_in_response']
    this.cookies = response['cookies'];
    this.headers = response['headers'];
    this.screenshot = response['screenshot'];
    this.logs = response['logs'];
    this.sourcePage = response['source_page'];
    this.extractRules = response['extract_rules'];
}

module.exports = {GetInResponse}