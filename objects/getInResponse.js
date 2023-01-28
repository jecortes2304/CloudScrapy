function GetInResponse(data) {
    const response = data['get_in_response']
    if (response !== undefined) {
        this.cookies = response['cookies'];
        this.headers = response['headers'];
        this.screenshot = response['screenshot'];
        this.logs = response['logs'];
        this.downloadFiles = response['download_files'];
        this.htmlToPdf = response['html_to_pdf'];
        this.sourcePage = response['source_page'];
        this.extractRules = response['extract_rules'];
    }
}

module.exports = {GetInResponse}