const puppeteer = require('puppeteer');

// URL Search Link of website goes here
const pageURL = '';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(PageURL);

  const links = await page.$$eval('a', elements => elements.filter(element => {
    const parensRegex = /^((?!\().)*$/;
    return element.href.includes('.mid') && parensRegex.test(element.textContent);
  }).map(element => element.href));

  links.forEach(link => console.log(link));

  await browser.close();
})();