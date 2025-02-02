import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  const { year, make, model } = await req.json();

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-features=IsolateOrigins,site-per-process',
        '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"',
      ],
    });
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });

    const url = `https://www.edmunds.com/${make}/${model}/${year}/review/`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Extract the required information here
    const features = await page.evaluate(() => {
      const featureElements = document.querySelectorAll('.features-list.w-100 tbody tr');
      const featuresList: string[] = [];
      featureElements.forEach((element) => {
        const featureName = element.querySelector('th')?.innerText.trim();
        const featureValue = element.querySelector('td')?.innerText.trim();
        if (featureName && featureValue) {
          featuresList.push(`${featureName}: ${featureValue}`);
        }
      });
      return featuresList;
    });

    console.log('Features:', features); // Log the features for debugging

    await browser.close();

    return NextResponse.json({ features });
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Error during web scraping:', error);
    return NextResponse.json({ error: 'An error occurred during web scraping.' }, { status: 500 });
  }
}