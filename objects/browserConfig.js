const defaultConfig = require('../configs/config.json')
export function BrowserConfig(data) {
    if (data['browser_config'] !== {} || data['browser_config'] !== undefined || data['browser_config'] !== null) {
        this.browserConfig = data['browser_config']
    } else {
        this.browserConfig = defaultConfig.config_1
    }

    return this;
}