const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Set viewport to a typical size
  await page.setViewport({ width: 1536, height: 730 });
  
  // Log all browser console messages
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  
  // Navigate to the page
  try {
    await page.goto('http://localhost:5174/photos/', { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (e) {
    console.error('Navigation error:', e);
  }
  
  // Wait an extra second just to be sure React finishes rendering
  await new Promise(r => setTimeout(r, 2000));
  
  // Take screenshot
  const screenshotPath = 'C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\c0bab910-1844-4d29-ab07-340bbe02d990\\screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('Screenshot saved to:', screenshotPath);
  
  // Get body innerHTML just in case
  const html = await page.evaluate(() => document.body.innerHTML.substring(0, 500));
  console.log('HTML Start:', html);
  
  await browser.close();
})();
