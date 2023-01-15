function Request(data) {
    const request = data['send_in_request'];
    this.url = request['url'];
    this.options = request['options'];
    this.instructions = request['instructions'];
}

module.exports = {Request}