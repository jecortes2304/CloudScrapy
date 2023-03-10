const engineConfig = {
    config_1: {
        headless: true,
        defaultViewport: null,
        ignoreHTTPSErrors: true,
        args: [
            '--start-maximized',
            '--no-sandbox',
            '--disable-gpu',
            '--incognito',
            '--no-zygote',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-dev-tools',
            '--ignore-certificate-errors',
            '--lang=es-ES,es;q=0.9'
        ]
    },
    config_2: {
        headless: true,
        defaultViewport: null,
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: [
            '--enable-automation'
        ],
        args: [
            '--start-maximized',
            '--no-sandbox',
            '--disable-gpu',
            '--incognito',
            '--v=1',
            '--no-first-run',
            '--no-zygote',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-dev-tools',
            '--ignore-certificate-errors',
            '--lang=es-ES,es;q=0.9'
        ]
    },
    config_3: {
        headless: false,
        defaultViewport: null,
        ignoreDefaultArgs: [
            '--disable-extensions',
            '--enable-automation'
        ],
        args: [
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--allow-running-insecure-content',
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--mute-audio',
            '--no-zygote',
            '--no-xshm',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--enable-webgl',
            '--ignore-certificate-errors',
            '--lang=en-US,en;q=0.9',
            '--password-store=basic',
            '--disable-gpu-sandbox',
            '--disable-software-rasterizer',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-infobars',
            '--disable-breakpad',
            '--disable-canvas-aa',
            '--disable-2d-canvas-clip-aa',
            '--disable-gl-drawing-for-tests',
            '--enable-low-end-device-mode'
        ]
    }
}

module.exports = engineConfig
