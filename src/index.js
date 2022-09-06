const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const main = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
  );

  page.on("requestfinished", async (request) => {
    const response = request.response();

    if (response) {
      const fileData = await response.buffer();
      const comparisonFileData = await Buffer.from(
        await axios
          .get(response.url(), {
            responseType: "arraybuffer",
          })
          .then((response) => response.data)
      );

      console.log('requestfinished', {
        url: response.url(),
        puppeteerBufferSize: fileData.byteLength,
        axiosBufferSize: comparisonFileData.byteLength,
      });
    }
  });

  page.on("response", async (response) => {
    const fileData = await response.buffer();
    const comparisonFileData = await Buffer.from(
      await axios
        .get(response.url(), {
          responseType: "arraybuffer",
        })
        .then((response) => response.data)
    );

    console.log('response', {
      url: response.url(),
      puppeteerBufferSize: fileData.byteLength,
      axiosBufferSize: comparisonFileData.byteLength,
    });
  });

  const html = fs.readFileSync(path.resolve(__dirname, "test.html"));
  await page.setContent(html.toString("utf-8"), {
    waitUntil: ["networkidle0"],
  });
  await page.screenshot({ path: path.resolve(__dirname, `screenshot.png`) });
  await browser.close();
};

main();
