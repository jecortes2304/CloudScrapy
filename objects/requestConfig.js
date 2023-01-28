function RequestConfig(data) {
    const config = data['request_config']
    if (config !== undefined) {
        this.headers = config['headers'];
        this.cookies = config['cookies'];
        this.blockResources = config['block_resources'];
        this.captcha = config['captcha_solver'];
        this.geolocation = config['geolocation'];
        this.userAgent = config['user_agent'];
        this.viewPort = config['view_port'];
        this.customProxy = config['custom_proxy'];
    }
}

module.exports = {RequestConfig}