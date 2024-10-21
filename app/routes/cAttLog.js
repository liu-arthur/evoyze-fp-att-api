const express = require("express");
const sql = require("mssql");
const { execSP } = require("../tools/dbQuery");
const { vDeviceLog } = require("../middleware/vRules");
const router = express.Router();

const logMessage = require("../tools/logger");

router.post("/", async (req, res) => {
	logMessage("Attendance log - Start");

	try {
		// Validate the request body against the schema
		const { error, value } = vDeviceLog.validate(req.body);
		if (error) {
			logMessage("Attendance log - Error - Invalid request data.");
			return res.status(400).json({ error: "Invalid request data." });
		}

		const { dev_id, dev_log } = value;

		// Initialize a counter for successful log entries
		let processedCount = 0;

		for (const logEntry of dev_log) {
			const { dev_user_id, clock_on, state } = logEntry;

			let parameters = {
				hardware_dev_id: dev_id,
				dev_user_id,
				clock_on,
				state,

				// Output
				result: { type: sql.NVarChar, output: true },
			};

			try {
				// Await the execution of the stored procedure and collect the result
				const result = await execSP("pr_att_dev_log_save", parameters);

				// Check the result and increment the counter if needed
				if (result.output && result.output.result === "ok") {
					processedCount++;
				}
			} catch (err) {
				logMessage(
					`Error processing log entry for user ${dev_user_id}: err`
				);
				// Optionally, handle individual log entry failures if needed
			}
		}

		// Conditional message based on processedCount
		if (processedCount === 0) {
			logMessage("Attendance log - End with 'NOLOG'");
			res.status(200).json({
				msg: "nolog",
				processedCount: 0,
			});
		} else {
			logMessage(
				`Attendance log - End with 'SUCCESS' == ${processedCount}`
			);
			res.status(200).json({
				msg: `success`,
				processedCount: processedCount,
			});
		}
	} catch (err) {
		// For server-side debugging
		console.error("Error processing logs:", err);
		res.status(500).json({
			msg: "Internal server error. Please try again later.",
		});
	}
});

module.exports = router;
