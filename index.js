import fetch from "node-fetch";
import cron from "node-cron";

// Function to send the SMS request
async function sendSMS() {
  try {
    const response = await fetch(
      "https://tlcc-sms-campaign.vercel.app/api/send-sms",
      {
        method: "GET",
      }
    );

    if (response.ok) {
      console.log("SMS sent successfully:", await response.text());
    } else {
      console.error(
        "Failed to send SMS:",
        response.status,
        await response.text()
      );
    }
  } catch (error) {
    console.error("Error occurred while sending SMS:", error);
  }
}

// Schedule the task to run every hour
cron.schedule("0 * * * *", () => {
  console.log("Running SMS cron job at", new Date());
  sendSMS();
});

// Keep the script running
console.log("Cron job started. Will run every hour.");
