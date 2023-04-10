// Description: This script scrapes job listings from Indeed.co.uk and saves them to a text file, a PDF file, and a JSON file.

// Update the following variables to change the search criteria(ensure to include the + character between words)
const jobRole = "junior+software+developer";
const location = "United+Kingdom";
const daysAgo = 5;
const filter = "junior";

// Import dependencies
const puppeteer = require("puppeteer");
const fs = require("fs");
const markdownpdf = require("markdown-pdf");

// Define a list of user agents
const userAgentList = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:70.0) Gecko/20100101 Firefox/70.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:71.0) Gecko/20100101 Firefox/71.0",
];

async function scrapeJobListings(jobRole, location, daysAgo, filter) {
  console.log("Launching browser...");
  // Launch a headless browser, change headless to false to see the browser in action
  const browser = await puppeteer.launch({ headless: true });
  console.log("Opening new page...");
  const page = await browser.newPage();

  // Set a random user agent to avoid being blocked
  const randomUserAgent =
    userAgentList[Math.floor(Math.random() * userAgentList.length)];
  await page.setUserAgent(randomUserAgent);

  // Emulate human-like behavior by adding a random delay between actions
  await page.setViewport({ width: 1366, height: 768 });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });
  console.log("Navigating to URL...");
  await page.goto(
    `https://www.indeed.co.uk/jobs?q=${jobRole}&l=${location}&fromage=${daysAgo}`
  );

  // Wait for job listings to load
  console.log("Waiting for job listings to load...");
  await page.waitForSelector(".slider_container");
  console.log(page);

  let hasMorePages = true; // Track if there are more pages
  const jobListings = []; // Store job listings data
  // Loop through pages
  while (hasMorePages) {
    console.log(`Scraping page...`);
    // Extract job listings data from current page
    const pageJobListings = await page.evaluate((filter) => {
      const listings = Array.from(
        document.querySelectorAll(".slider_container")
      );
      // Filter listings based on title containing variable
      return (
        listings
          .filter((listing) =>
            listing
              .querySelector(".jobTitle")
              .textContent.trim()
              .toLowerCase()
              //Change the word to the one you want to filter
              .includes(filter)
          )
          // Map the filtered listings to an object containing the data we want
          .map((listing) => {
            const titleElement = listing.querySelector(".jobTitle");
            const title = titleElement ? titleElement.textContent.trim() : "";
            const companyElement = listing.querySelector(".companyName");
            const company = companyElement
              ? companyElement.textContent.trim()
              : "";
            const locationElement = listing.querySelector(".companyLocation");
            const location = locationElement
              ? locationElement.textContent.trim()
              : "";
            const summaryElement = listing.querySelector(".job-snippet");
            const summary = summaryElement
              ? summaryElement.textContent.trim()
              : "";
            const linkElement = listing.querySelector(".jcs-JobTitle");
            const link = linkElement ? linkElement.href : "";

            return { title, company, location, summary, link };
          })
      );
    }, filter);
    // Add the job listings data from the current page to the jobListings array
    jobListings.push(...pageJobListings); // Collect job listings data from current page

    // console.log(`Job listings:`, jobListings);

    // Close popups
    const popupSelectors = ".icl-CloseButton"; // Update with the appropriate selector for the close buttons of the popups
    const popupElements = await page.$$(popupSelectors); // Use page.$$ to retrieve all matching elements
    for (const popupElement of popupElements) {
      // Handle each popup as needed (e.g., close, dismiss, etc.)
      await popupElement.click(); // Click on the close button of each popup
      console.log("popup closed");
      await new Promise((r) => setTimeout(r, 500));
    }

    // Check if there is a "Next" button
    const nextButton = await page.$('[data-testid="pagination-page-next"]');
    if (nextButton) {
      await Promise.all([
        page.waitForNavigation(), // Wait for navigation to complete
        page.click('[data-testid="pagination-page-next"]'), // Click on the "Next" button or link
        new Promise((r) => setTimeout(r, 1000)),
      ]);
    } else {
      hasMorePages = false; // Set hasMorePages to false if there is no "Next" button or link
      // Define the file path on the desktop
      const filePath = "/Users/Seb/Desktop/job_listings.md";
      const pdfFilePath = "/Users/Seb/Desktop/job_listings.pdf";
      const jobListingsList = jobListings.map(
        (job) =>
          `- Title: ${job.title}\n  Company: ${job.company}\n  Location: ${job.location}\n Summary: ${job.summary}\n  Link:[${job.title}](${job.link})\n\n`
      );
      fs.writeFileSync(filePath, jobListingsList.join("\n"));
      // Write the job listings data to a markdown file
      markdownpdf()
        .from(filePath)
        //convert to pdf
        .to(pdfFilePath, () => {
          console.log(`PDF file has been created at ${pdfFilePath}`);
        });
      // Write job listings data to a JSON file
      const jobListingsData = JSON.stringify(jobListings, null, 2);
      fs.writeFileSync("job_listings.json", jobListingsData, "utf-8");
      console.log("Job listings data saved to job_listings.json");
    }
  }
  // Close the browser
  await browser.close();
  console.log("Browser closed.");
}
// Call the function
scrapeJobListings(jobRole, location, daysAgo, filter);
