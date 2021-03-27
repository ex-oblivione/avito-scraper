const scraperObject = {
  url: 'https://www.avito.ru/sankt-peterburg/koshki/poroda-meyn-kun-ASgBAgICAUSoA5IV',

  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);
    let scrapedData = [];

    async function scrapeCurrentPage() {
      await page.waitForSelector('.index-content-2lnSO');

      let urls = await page.$$eval('.iva-item-root-G3n7v', links => {
        links = links.map(el => el.querySelector('.iva-item-titleStep-2bjuh > a').href)
        return links;
      });

      let pagePromise = (link) => new Promise(async (resolve, reject) => {
        let dataObj = {};
        let newPage = await browser.newPage();
        await newPage.goto(link);

        let price;
        try {
          price = await newPage.$eval('.item-view-content-right .js-item-price', elem => Number(elem.getAttribute('content')));
        } catch (error) {
          price = 'Цена не указана';
        }

        let description;
        try {
          description = await newPage.$eval('.item-description-text > p', text => text.textContent);
        } catch (error) {
          description = await newPage.$eval('.item-description-html', text => text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "").trim());
        }

        dataObj['title'] = await newPage.$eval('.title-info-title-text', text => text.textContent);
        dataObj['description'] = description;
        dataObj['url'] = link;
        dataObj['price'] = price;
        dataObj['author'] = await newPage.$eval('.seller-info-name > a', text => text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "").trim());

        resolve(dataObj);
        await newPage.close();
      });

      for (link in urls) {
        let currentPageData = await pagePromise(urls[link]);
        scrapedData.push(currentPageData);
        console.log(currentPageData);
      }
      return scrapedData;
    }
    let data = await scrapeCurrentPage();
    console.log(data);

    return data;
  }
}

module.exports = scraperObject;