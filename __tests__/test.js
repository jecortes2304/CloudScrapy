const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({
        headless: false, slowMo: 100, // Uncomment to visualize test
    });
    const page = await browser.newPage();

    // Load "about:privatebrowsing" and await navigation
    await page.goto('https://www.idealista.com');

    // Resize window to 1536 x 676 and await navigation
    await page.setViewport({ width: 1536, height: 676 });

    // Click on <a> "Iniciar sesión" and await navigation
    await page.waitForSelector('.no-logged-user-menu [href="/login"]');
    await Promise.all([
        page.click('.no-logged-user-menu [href="/login"]'),
        page.waitForNavigation()
    ]);

    await browser.close();
})();