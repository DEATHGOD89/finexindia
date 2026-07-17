const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Set viewport to standard desktop
    await page.setViewport({ width: 1280, height: 800 });

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`Console Error: ${msg.text()}`);
        }
    });
    page.on('pageerror', err => {
        errors.push(`Page Error: ${err.message}`);
    });

    console.log("Navigating to http://localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    console.log("Taking landing page screenshot...");
    await page.screenshot({ path: 'landing_test.png' });

    console.log("Clicking India Edition...");
    await page.evaluate(() => {
        document.querySelector('button[onclick="selectPlatform(\\\'india\\\')"]').click();
    });
    // Wait for animation
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'india_dashboard_test.png' });

    console.log("Clicking Logo to return...");
    await page.evaluate(() => {
        document.querySelector('.nav-brand').click();
    });
    // Wait for reload
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'back_to_landing_test.png' });

    console.log("Clicking Global Edition...");
    await page.evaluate(() => {
        document.querySelector('button[onclick="selectPlatform(\\\'global\\\')"]').click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'global_dashboard_test.png' });

    await browser.close();

    console.log("UI Test Complete.");
    if (errors.length > 0) {
        console.log("ERRORS FOUND:");
        console.log(errors.join('\n'));
    } else {
        console.log("No console errors found. UI is clean.");
    }
})();
