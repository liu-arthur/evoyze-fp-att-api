const cron = require("node-cron");
const { execSP } = require("../tools/dbQuery");
const logMessage = require("../tools/logger");

// Function to be executed by the cron job
async function processDeviceLogs() {
	try {
		logMessage("Starting process to convert device logs to time logs...");

		// Execute the stored procedure
		const result = await execSP("pr_att_dev_log_process", "");

		// Log success with details
		logMessage("Device logs processing completed successfully.");
	} catch (err) {
		// Log error details
		console.error("Error processing device logs:", err.message);
	}
}

// Schedule a task to run every 5 minutes
cron.schedule("*/5 * * * *", processDeviceLogs);
