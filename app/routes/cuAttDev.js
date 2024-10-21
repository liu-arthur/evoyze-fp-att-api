const express = require("express");
const sql = require("mssql");
const moment = require("moment");
const { execSP } = require("../tools/dbQuery");
const { vDevice } = require("../middleware/vRules");
const router = express.Router();

const logMessage = require("../tools/logger");

router.post("/", async (req, res) => {
	logMessage("Attendance device - Start");

	try {
		// Validate the request body against the schema
		const { error, value } = vDevice.validate(req.body);

		if (error) {
			logMessage("Attendance log - Error - Invalid request data.");

			return res.status(400).json({ error: "Invalid request data." });
		}

		const now = moment().format("YYYY-MM-DD HH:mm:ss");

		const parameters = {
			current_uid: "nAttDevIntf",
			ip_addr: req.body.ip_addr,
			last_status: "ok",
			last_try_on: now,
			last_success_on: now,

			// Output
			result: { type: sql.NVarChar, output: true },
		};

		// Await the execution of the stored procedure and collect the result
		const result = await execSP("pr_att_dev_update_status", parameters);

		if (result.output.result === "ok") {
			logMessage("Attendance log - End");
			res.status(200).json({ msg: "success" });
		} else {
			logMessage(`Attendance log - End - ${result.output.result}`);
			res.status(400).json({ msg: result.output.result });
		}
	} catch (err) {
		// For server-side debugging
		logMessage(`Error processing logs: ${err}`);
		res.status(500).json({
			msg: "Internal server error. Please try again later.",
		});
	}
});

module.exports = router;
