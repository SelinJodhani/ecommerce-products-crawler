import cheerio from 'cheerio';

export default async function (searchQuery, context) {
  const products = []; // Array to store all the products

  /**
   * @type {import('playwright').Page}
   */
  const page = await context.newPage();

  let count = 0;

  try {
    await page.goto(`https://www.flipkart.com/search?q=${searchQuery}`);

    while (true) {
      await page.mouse.wheel(0, 15000);
      await page.waitForTimeout(1000);
      await page.waitForSelector('a[class="_1LKTO3"]', { timeout: 5000 });

      let productContainer = await page.$$('[class="_4ddWXP"]');

      if (productContainer.length === 0) {
        productContainer = await page.$$('[class="_2kHMtA"]');
      }

      for (let product of productContainer) {
        const containerHtml = await product.innerHTML();
        const $ = cheerio.load(containerHtml);

        const productUrl =
          $('a[class="s1Q9rs"]')?.get(0)?.attribs?.href ||
          $('a[class="_1fQZEK"]')?.get(0)?.attribs?.href;

        const [zero, first, second, third] = productUrl.split('/');

        const productTitle = $('a[class="s1Q9rs"]').text() || $('a[class="_4rR01T"]').text();
        const productRatingCount = $('div[class="_3LWZlK"]').text();
        const productReviewCount = $('span[class="_2_R_DZ"]').text();
        const productPrice =
          $('div[class="_30jeq3"]').text() ?? $('div[class="_30jeq3 _1_WHN1"]').text();

        products.push({
          url: `www.flipkart.com/${first}/${second}/${third.split('?')[0]}`,
          title: productTitle,
          code: productTitle.toLowerCase().split(' ').join('_'),
          reviewCount: productReviewCount.slice(1, -1),
          rating: productRatingCount
            ? `${productRatingCount} out of 5 stars`
            : '0.0 out of 5 stars',
          price: productPrice.split('₹')[1],
        });
      }

      const nextButton = await page.$('span:has-text("Next")');

      if (count === 20) {
        break;
      }

      count++;

      await nextButton.click();

      console.log(
        `✅ ${products.length} products scrapped for category ${searchQuery} from Flipkart`
      );
    }
  } catch (err) {
    console.error(err);
  }

  return { products, website: 'flipkart.com' };
}
