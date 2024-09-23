const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealthPlugin());

const url = "https://www.stussy.com/collections/mens-hoodies-sweatshirts/products/1915022-8-ball-crew-pigment-dyed-natural";

async function givePage(){
    const browser = await puppeteer.launch({
        headless : false,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    await page.goto(url);
    await page.waitForNetworkIdle();

    return [browser, page];
}

async function atc(page) {
    let flagWhite = false;
    let countWhite = 0;

    // Loop for clicking sizes until all sizes are clicked
    while (!flagWhite) {
        flagWhite = await page.evaluate(async (countWhite) => {
            let sizes = document.querySelectorAll("input[class='product-swatch__input w-auto']");
            if (countWhite < sizes.length) {
                sizes[countWhite].click();
                document.querySelector("button[id='ProductAddToCart']").click();
                return false; // Continue the loop
            } else {
                return true; // Exit the loop
            }
        }, countWhite);

        // Add a 2-second timeout after clicking the "Add to Cart" button
        await new Promise(resolve => setTimeout(resolve, 1000));;

        countWhite++;
    }

    // Get all product links
    let productLinks = await page.evaluate(() => {
        const links = document.querySelectorAll("a[aria-label]");
        let productLinks = [];

        for (let i = 0; i < links.length; i++) {
            if (links[i].ariaLabel.includes("8 BALL CREW PIGMENT DYED")) {
                productLinks.push(links[i].href);
            }
        }

        return productLinks;
    });

    // Loop through all product links
    for (let i = 0; i < productLinks.length; i++) {
        await page.goto(productLinks[i]);

        let flagRest = false;
        let countRest = 0;

        // Loop for clicking sizes until all sizes are clicked on each product page
        while (!flagRest) {
            flagRest = await page.evaluate(async (countRest) => {
                let sizes = document.querySelectorAll("input[class='product-swatch__input w-auto']");
                if (countRest < sizes.length) {
                    sizes[countRest].click();
                    document.querySelector("button[id='ProductAddToCart']").click();
                    return false; // Continue the loop
                } else {
                    return true; // Exit the loop
                }
            }, countRest);

            // Add a 2-second timeout after clicking the "Add to Cart" button
            await new Promise(resolve => setTimeout(resolve, 3000));

            countRest++;
        }
    }

    await page.evaluate(() => {
        document.querySelector("button[title='Open Cart']").click()
    })
    
    await page.waitForSelector("button[name='checkout']");

    await page.evaluate(() => {
        document.querySelector("button[name='checkout']").click()
    })
    
    // Wait for the email input field
    try {
        await page.waitForSelector("input[id='email']", { timeout: 60000 });
    } catch (error) {
        console.error('Failed to find email input:', error);
        return;  // Exit if the selector was not found
    }

    // Filling in the form
    await page.type("input[id='email']", "talhahossain75@gmail.com", {delay: 20});
    await page.type("input[id='TextField0']", "Talha", {delay: 20});
    await page.type("input[id='TextField1']", "Khan", {delay: 20});
    await page.type("input[id='shipping-address1']", "6 Monroe Pl", {delay: 20});
    await page.type("input[id='TextField2']", "Apt 101", {delay: 20});
    await page.type("input[id='TextField3']", "Rockville", {delay: 20});
    await page.type("input[id='TextField4']", "20850", {delay: 20});
    await page.type("input[id='TextField5']", "4437645721", {delay: 20});

    await page.evaluate(() =>{
        document.querySelector("#Select1").value = "MD"
    })

    // Working with each iframe

    await page.waitForSelector("iframe[title='Field container for: Card number']", { timeout: 60000 })

    let iframe = await page.$("iframe[title='Field container for: Card number']");
    let cardNumberFrame = await iframe.contentFrame()
    if (cardNumberFrame) {
        await cardNumberFrame.type("input[id='number']", "5425233430109903", {delay: 100});
    } else {
        console.error("Card number iframe not found");
    }

    iframe = await page.$("iframe[title='Field container for: Expiration date (MM / YY)']");
    let cardExpiryFrame = await iframe.contentFrame()
    if (cardExpiryFrame) {
        await cardExpiryFrame.type("input[id='expiry']", "0426", {delay: 100});
    } else {
        console.error("Card expiry iframe not found");
    }

    iframe = await page.$("iframe[title='Field container for: Security code']");
    let cardCvvFrame = await iframe.contentFrame()
    if (cardCvvFrame) {
        await cardCvvFrame.type("input[id='verification_value']", "911", {delay: 100});
    } else {
        console.error("Card CVV iframe not found");
    }

    // Add a delay to ensure values are set before proceeding
    await new Promise(resolve => setTimeout(resolve, 2000));


    await page.evaluate(() => {
        document.querySelector("button[id='checkout-pay-button']").click()
    })
}

async function run(){
    const arr = await givePage();
    const page = arr[1];
    await atc(page);
}

run();

