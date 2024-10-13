import puppeteer from 'puppeteer';
import { identifyCssSelectors } from './cssIdentifier.js';
import { parseReviews } from './reviewParser.js';
async function hasNextPage(page, cssSelectors) {
  
    return false;
}

async function goToNextPage(page, cssSelectors) {
  
    await page.click(cssSelectors.nextPageButton);
    await page.waitForNavigation();
}


async function extractReviews(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url , { timeout: 60000 });
    const content = await page.content();

    const cssSelectors = await identifyCssSelectors(content);
   
    console.log(cssSelectors)
    let reviews = [];
    let hasNextPageFlag = true;
    
    while (hasNextPageFlag) {
        const newReviews = await parseReviews(page, cssSelectors);
        reviews = reviews.concat(newReviews);

        
        hasNextPageFlag = await hasNextPage(page, cssSelectors);
        if (hasNextPageFlag) {
            await goToNextPage(page, cssSelectors);
        }
    }
    
    await browser.close();
    return { reviews_count: reviews.length, reviews };
}


export { extractReviews };