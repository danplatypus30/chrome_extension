const puppeteer = require('puppeteer');

// URL Search Link of website goes here
const pageURL = 'https://www.channelnewsasia.com/news/business/tpp-cptpp-trade-deal-signed-singapore-10025856';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(pageURL);

  const links = await page.$$eval('a', elements => elements.filter(element => {
    const parensRegex = /^((?!\().)*$/;
    return element.href.includes('.mid') && parensRegex.test(element.textContent);
  }).map(element => element.href));

  links.forEach(link => console.log(link));

  // Get the "viewport" of the page, as reported by the page.
  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      deviceScaleFactor: window.devicePixelRatio
    };
  });
  console.log('Dimensions:', dimensions);  
  
  // Get inner text
  const innerText = await page.evaluate(() => document.querySelector('.c-rte--article').innerText);
  console.log("Scrapped Text", innerText)

  await browser.close();
})();