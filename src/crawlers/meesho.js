import cheerio from 'cheerio';

export default async function (searchQuery, context) {
  let products = []; // Array to store all the products

  const page = await context.newPage();

  let count = 0;

  try {
    await page.goto(`https://www.meesho.com/search?q=${searchQuery}`);

    while (true) {
      await page.mouse.wheel(0, 15000);
      await page.waitForTimeout(1000);
      await page.waitForSelector(
        'div[class="sc-hLBbgP ProductList__GridCol-sc-8lnc8o-0 fqMYmg eCJiSA"]',
        { timeout: 5000 }
      );

      const productContainer = await page.$$(
        'div[class="sc-hLBbgP ProductList__GridCol-sc-8lnc8o-0 fqMYmg eCJiSA"]'
      );

      for (let product of productContainer) {
        const containerHtml = await product.innerHTML();
        const $ = cheerio.load(containerHtml);

        const productUrl = $('a')?.get(0)?.attribs?.href;

        const productTitle = $(
          'p[class="sc-jSUZER eQcGxV NewProductCardstyled__StyledDesktopProductTitle-sc-6y2tys-5 ejhQZU NewProductCardstyled__StyledDesktopProductTitle-sc-6y2tys-5 ejhQZU"]'
        ).text();
        const productRatingCount = $('span[class="sc-jSUZER kUAldP"]').text();
        const productReviewCount = $(
          'span[class="sc-jSUZER heqCfW NewProductCardstyled__RatingCount-sc-6y2tys-21 jZyLzI NewProductCardstyled__RatingCount-sc-6y2tys-21 jZyLzI"]'
        ).text();
        const productPrice = $('h5[class="sc-jSUZER hNJLZk"]').text();

        products.push({
          url: `https://www.eyemyeye.com${productUrl}`,
          title: productTitle,
          code: productTitle.toLowerCase().split(' ').join('_'),
          reviewCount: isNaN(parseInt(productReviewCount?.split(' ')?.[0] ?? 0, 10))
            ? 0
            : parseInt(productReviewCount?.split(' ')?.[0] ?? 0, 10),
          rating: isNaN(parseFloat(productRatingCount ?? '0.0'))
            ? 0.0
            : parseFloat(productRatingCount ?? '0.0'),
          price: parseInt(productPrice?.split('₹')?.[1]?.split(' ')?.[0] ?? 0, 10),
        });
      }

      const nextButton = await page.$('span:has-text("NEXT")');

      if (count === 20) {
        break;
      }

      count++;

      await nextButton.click();

      console.log(
        `✅ ${products.length} products scrapped for category ${searchQuery} from meesho`
      );
    }
  } catch (err) {
    console.error(err);
  }

  return { products, website: 'meesho' };
}
