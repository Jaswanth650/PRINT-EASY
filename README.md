# PrintEasy — Online Printing Service

PrintEasy is a simple, responsive frontend mini project inspired by food-delivery ordering websites. Instead of ordering food, customers can select a PDF, choose printing preferences, enter a delivery address and place a sample print order.

## Features

- Responsive home page with a modern blue-and-white design
- PDF file selection and drag-and-drop (maximum 10 MB)
- Black & white or colour printing options
- A4/A3 paper size and single/double-sided choices
- Number of copies selector
- Automatic sample price calculation
- Sample order placement and order list
- Demo order status updates
- Orders saved in browser `localStorage`

## Technologies used

- HTML5
- CSS3
- Vanilla JavaScript
- Browser LocalStorage API

## Run the project

1. Download or clone this repository.
2. Open the `PrintEasy` folder.
3. Double-click `index.html`, or open it with the VS Code Live Server extension.
4. Select a PDF, choose print options and place a demo order.

No installation, database or backend server is required.

## Sample pricing

| Service | Sample price |
|---|---:|
| Black & white | ₹2 per page |
| Colour | ₹10 per page |
| Delivery | ₹20 per order |

These are demonstration prices and can be changed in `script.js`.

## Important notes

- This is a **frontend-only college mini project**. It does not send files to a print shop, process payments or arrange real delivery.
- Orders are stored only in the browser where they were created. Clearing browser storage may remove them.
- PDF page count is estimated from the file's internal text structure. Some PDFs may show an approximate count; check the document before using this as a real quote.
- The “Update demo status” button cycles through Order received, Printing and Delivered to demonstrate order tracking.

## Suggested GitHub repository description

`A responsive frontend mini project for an online document printing and delivery service, built with HTML, CSS and JavaScript.`

## Future improvements

- Add a backend and database for real order management
- Add customer and admin login
- Add online payments
- Connect orders to a real printing and delivery service
