import puppeteer from "puppeteer";
import fs from "fs/promises";

const wait = async function (sec) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(1), sec * 1000);
  });
};
const getInnerHtml = async function (page, selector) {
  const element = await page.$(selector);
  if (element) {
    return await element.evaluate((el) => el.textContent);
  }
  return "";
};
async function getPrice(page) {
  const info = {};
  const parentSelector = ".PriceInfo_root__GX9Xp";
  const childTexts = await page.evaluate((selector) => {
    const parentElement = document.querySelector(selector);
    if (!parentElement) return [];
    const children = parentElement.children;
    const texts = Array.from(children).map((child) => child.textContent.trim());

    return texts;
  }, parentSelector);
  if (childTexts.length > 1) {
    info.oldPrice = childTexts[0].split(" ")[0];
    info.newPrice = childTexts[1].split(" ")[0];
    return info;
  }
  info.price = childTexts[0].split(" ")[0];
  return info;
}

const url = process.argv[2];
const region = process.argv[3];
let info;

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(url);
  await page.setViewport({ width: 1080, height: 1024 });
  await wait(7);
  await page.click(".Region_regionIcon__oZ0Rt");
  const element = await page.evaluateHandle((text) => {
    return Array.from(
      document.querySelectorAll(".UiRegionListBase_list__cH0fK > li")
    ).find((el) => el.textContent === text);
  }, region);
  await wait(1);
  await element.click();
  await wait(1);
  await page.screenshot({ path: "screenshot.jpg" });
  info = await getPrice(page);
  //   info.price = await getInnerHtml(page, ".Price_role_old__r1uT1");
  //   info.discount = await getInnerHtml(page, ".Price_role_discount__l_tpE");
  info.rating = await getInnerHtml(page, ".ActionsRow_stars__EKt42");
  ("ActionsRow_stars__EKt42");
  info.reviews = await getInnerHtml(page, ".ActionsRow_reviews__AfSj_");
  await fs.writeFile("product.txt", JSON.stringify(info));
  await browser.close();
})();
