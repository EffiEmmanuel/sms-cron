import * as dotenv from "dotenv";
dotenv.config();
import cron from "node-cron";
import express from "express";
import { getSpreadsheet } from "./lib/google/getSpreadSheet.js";
import { processEvents } from "./lib/utils.js";

// Function to send the SMS request
async function sendSMS() {
  try {
    // Fetch events and members from Google Spreadsheet
    const members = await getSpreadsheet("MEMBERS");
    const events = await getSpreadsheet("EVENTS");

    // Process events (single execution)
    await processEvents(events, members);
  } catch (error) {
    console.error("Error occurred while sending SMS:", error);
  }
}

// Schedule the task to run every hour
cron.schedule("0 * * * *", async () => {
  console.log("Running SMS cron job at", new Date());
  await sendSMS();
});

// Keep the script running
console.log("Cron job started. Will run every hour.");

// Express server for health checks
const app = express();
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Cron job is running.");
});

app.get("/ping", (req, res) => {
  console.log("Server is live.");
  res.send("Server is live.");
});

app.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});
