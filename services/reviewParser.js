async function parseReviews(page, cssSelectorsArray) {
  


  const filteredSelectors = cssSelectorsArray.filter(cssSelectors => {
    return Object.values(cssSelectors).some(selector => selector); 
  });


  let allReviews = [];

  for (const cssSelectors of filteredSelectors) {
    if (!cssSelectors.reviewContainer) {
      console.log("Skipping empty reviewContainer selector");
      continue;
    }

    
    try {
      const reviews = await page.$$eval(cssSelectors.reviewContainer, (elements, selectors) => {
        return elements.map(el => {
          const getTextContent = (selector) => {
            if (!selector) return '';
            const element = el.querySelector(selector);
            return element ? element.innerText.trim() : '';
          };

           const getTextRating = (selector) => {
            if (!selector) return '';
            const element = el.querySelector(selector);
            return element ? element.getAttribute('aria-label'): '';
          };

          return {
            title: getTextContent(selectors.reviewTitle),
            body: getTextContent(selectors.reviewBody),
            rating: selectors.rating ? getTextRating(selectors.rating) : null,
            reviewer: getTextContent(selectors.reviewerName)
          };
        }).filter(review => review !== null);
      }, cssSelectors);

      if (reviews.length > 0) {
        console.log(reviews)
        console.log(`Successfully parsed ${reviews.length} reviews using selector set`);
        allReviews = allReviews.concat(reviews);
      } else {
        console.log("No reviews found with current selector set");
      }
    } catch (error) {
      console.error("Error parsing reviews with current selector set:", error);
    }
  }

  console.log(`Total reviews parsed: ${allReviews.length}`);
  return allReviews;
}




export { parseReviews };