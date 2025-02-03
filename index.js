import * as dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import cron from "node-cron";
import { getSpreadsheet } from "./lib/google/getSpreadSheet.js";
import { processEvents } from "./lib/utils.js";

// Function to send the SMS request
async function sendSMS() {
  try {
    // const response = await fetch(
    //   "https://tlcc-sms-campaign.vercel.app/api/send-sms",
    //   {
    //     method: "GET",
    //   }
    // );

    // if (response.ok) {
    //   console.log("SMS sent successfully:", await response.text());
    // } else {
    //   console.error(
    //     "Failed to send SMS:",
    //     response.status,
    //     await response.text()
    //   );
    // }

    // Fetch events and members from Google Spreadsheet
    const members = await getSpreadsheet("MEMBERS");
    const events = await getSpreadsheet("EVENTS");

    // Process events (single execution)
    await processEvents(events, members);
  } catch (error) {
    console.error("Error occurred while sending SMS:", error);
  }
}

async function startApp() {
  console.log("Running SMS", new Date());
  await sendSMS();
}

startApp();

// Schedule the task to run every hour
// cron.schedule("0 * * * *", () => {
// console.log("Running SMS cron job at", new Date());
// sendSMS();
// });

// Keep the script running
// console.log("Cron job started. Will run every hour.");
