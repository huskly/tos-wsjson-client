import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { PuppeteerExtra } from "puppeteer-extra";

export async function getAuthCode(username: string, password: string) {
  (puppeteer as unknown as PuppeteerExtra).use(StealthPlugin());

  return new Promise<string>(async (resolve) => {
    const browser = await (puppeteer as unknown as PuppeteerExtra).launch({
      headless: false, // or 'new' in the latest Puppeteer to get partial headless mode
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      userDataDir: "./puppeteer-data",
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    );
    await page.setViewport({ width: 800, height: 650 });
    await page.setRequestInterception(true);

    console.log(
      "Please log in manually. The script will watch for the final redirect URL.",
    );

    let oauthCode = null;

    page.on("request", async (request) => {
      const reqUrl = request.url();
      // If the request includes the OAuth code, capture it and abort
      if (reqUrl.includes("trade.thinkorswim.com/oauth?code=")) {
        const urlObj = new URL(reqUrl);
        oauthCode = urlObj.searchParams.get("code");
        console.log("OAuth Code Captured:", oauthCode);
        // Abort the request so the code isn't consumed
        return request.abort();
      }

      // Otherwise, let all other requests proceed normally
      request.continue();
    });

    await page.goto("https://trade.thinkorswim.com/", {
      waitUntil: "networkidle2",
    });
    page.waitForNavigation();
    await page.reload({ waitUntil: "networkidle2" });
    // add a random delay between 2-4 seconds
    await new Promise((resolve) => setTimeout(resolve, randomDelay(2, 4)));
    let frames = page.frames();
    let targetFrame = frames.find((frame) =>
      frame.url().includes("sws-gateway-nr.thinkorswim.com"),
    );
    if (!targetFrame) {
      throw new Error("Target frame not found");
    }
    const loginIdInput = await targetFrame.$("#loginIdInput");
    if (!loginIdInput) {
      throw new Error("Login ID input not found");
    }
    await loginIdInput.type(username, { delay: 100 });
    await new Promise((resolve) => setTimeout(resolve, randomDelay(1, 2)));
    let continueBtn = await targetFrame.$("#continueBtn");
    if (!continueBtn) {
      throw new Error("Continue button not found");
    }
    await continueBtn.click();
    page.waitForNavigation();
    await new Promise((resolve) => setTimeout(resolve, randomDelay(2, 4)));
    frames = page.frames();
    targetFrame = frames.find((frame) =>
      frame.url().includes("sws-gateway-nr.thinkorswim.com"),
    );
    if (!targetFrame) {
      throw new Error("Target frame not found");
    }
    const passwordInput = await targetFrame.$("#passwordInput");
    if (!passwordInput) {
      throw new Error("Password input not found");
    }
    await passwordInput.type(password, { delay: 100 });
    continueBtn = await targetFrame.$("#continueBtn");
    if (!continueBtn) {
      throw new Error("Continue button not found");
    }
    await continueBtn.click();
    page.waitForNavigation();
    // Wait until we pick up the code
    while (!oauthCode) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await browser.close();
    resolve(oauthCode);
  });
}

function randomDelay(minSeconds: number, maxSeconds: number): number {
  return (
    Math.floor(Math.random() * (maxSeconds - minSeconds) * 1000) +
    minSeconds * 1000
  );
}
