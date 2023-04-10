# Indeed Job Scraper
This is a Node.js script that scrapes job listings from Indeed.co.uk based on search criteria such as job role, location, and filter keywords. The scraped job listings are saved to a text file, a PDF file, and a JSON file for further analysis.

### Installation
```
npm i
```

### Running Script
```
node scraper.js
```

## How to Use
Update the following variables in the script to customize your search criteria:

```
const jobRole = "junior+software+developer";
const location = "United+Kingdom";
const daysAgo = 5;
const filter = "junior";
```

jobRole: The desired job role, use "+" character between words instead of spaces.

location: The desired job location, use "+" character between words instead of spaces.

daysAgo: The number of days ago from which to search for job listings.

filter: The keyword to filter job listings based on the job title.

The script will launch a headless browser, navigate to Indeed.co.uk with the specified search criteria, scrape the job listings data, and save it to a text file, a PDF file, and a JSON file on your desktop.

## Dependencies
Puppeteer: A Node.js library for controlling headless Chrome or Chromium.

fs: A built-in Node.js module for file system operations.

markdown-pdf: A Node.js module for generating PDF files from Markdown.

#Note
Please use this script responsibly and in compliance with the terms of use of Indeed.co.uk.

This script may break if Indeed.co.uk's website structure changes. If that happens, you may need to update the script accordingly.

Use it at your own risk.
