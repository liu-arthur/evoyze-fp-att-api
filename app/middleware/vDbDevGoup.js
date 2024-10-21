const { execSP } = require("../tools/dbQuery");
const { vDevice } = require("../middleware/vRules");
const logMessage = require("../tools/logger");

const vDevGoup = async (req, res, next) => {
	try {
		// Validate the request body against the schema
		const { error, value } = vDevice.validate(req.body);
		if (error) {
			return res.status(400).json({ error: "Invalid request data." });
		}

		const { dev_group, dev_passcode, dev_id, ip_addr } = value;

		// Check if the device group exists
		let parameters = { dev_group };
		let result = await execSP("pr_att_device_group_pc", parameters);

		// Check if the passcode provided matches the passcode in the database
		// Validate passcode
		if (
			result.recordset[0].passcode.toLowerCase() !==
			dev_passcode.toLowerCase()
		) {
			return res.status(401).json({ msg: "Authentication failed." });
		}

		// Check if the device ID and device group are match.
		parameters = {
			current_uid: "nAttDevIntf",
			co_id: null,
			axn: null,
			is_in_use: 1,
			dev_group,
			dev_id,
			ip_addr,
			my_role_id: -999,
			url: "/api-att-log",
		};

		result = await execSP("pr_att_dev_list", parameters);

		// Check if the passcode is missing or empty
		if (result.recordset && result.recordset.length > 0) {
			// If the IP address is found, continue to the next middleware or route
			logMessage("Dev. Group and Dev. ID are active, continue..");
			next();
		} else {
			return res.status(401).json({ msg: "Unauthorized access." });
		}
	} catch (err) {
		next(err);
	}
};

module.exports = { vDevGoup: vDevGoup };
