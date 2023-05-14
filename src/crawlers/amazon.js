import cheerio from 'cheerio';

export default async function (searchQuery, context) {
  let products = []; // Array to store all the products

  const page = await context.newPage();

  try {
    await page.goto(`https://www.amazon.in/s?k=${searchQuery}`);

    while (true) {
      await page.waitForSelector(
        '[class="sg-col sg-col-4-of-12 sg-col-8-of-16 sg-col-12-of-20 sg-col-12-of-24 s-list-col-right"]',
        { timeout: 5000 }
      );

      const productContainer = await page.$$(
        '[class="sg-col sg-col-4-of-12 sg-col-8-of-16 sg-col-12-of-20 sg-col-12-of-24 s-list-col-right"]'
      );

      for (let product of productContainer) {
        const containerHtml = await product.innerHTML();
        const $ = cheerio.load(containerHtml);

        const isSponsored = $('span[class="puis-label-popover-default"]').text();

        if (isSponsored) {
          continue;
        }

        const productUrl = $(
          'a[class="a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal"]'
        ).get(0).attribs.href;

        const [zero, first, second, third] = productUrl.split('/');

        const productTitle = $(
          'a[class="a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal"]'
        ).text();
        const productRatingCount = $('span[class="a-icon-alt"]').text();
        const productReviewCount = $('span[class="a-size-base s-underline-text"]').text();
        const productPrice = $('span[class="a-offscreen"]').text().split('₹')[1];

        products.push({
          url: `www.amazon.in/${first}/${second}/${third}`,
          title: productTitle,
          code: productTitle.toLowerCase().split(' ').join('_'),
          reviewCount: productReviewCount,
          rating: productRatingCount,
          price: productPrice,
        });
      }

      const nextButton = await page.$('a:has-text("Next")');

      if (!nextButton) {
        break;
      }

      await nextButton.click();

      console.log(
        `-> ${products.length} products scraped for category ${searchQuery} from amazon.in`
      );
    }
  } catch (err) {
    console.error(err);
  }

  return { products, website: 'amazon.in' };
}
