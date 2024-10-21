const { rConfig } = require("../tools/rConfig");
const key = JSON.parse(rConfig);
const logMessage = require("../tools/logger");

function vAccessKey(req, res, next) {
	try {
		const apiKey = key.api_key.split(" ")[1];

		// Extract the Authorization header
		const authHeader = req.header("Authorization");

		if (!authHeader || !authHeader.startsWith("eVoyze")) {
			logMessage(
				`Error: Authorization header missing or invalid, result: ${authHeader}`
			);
			res.status(401).json({
				msg: "Authorization header missing or invalid.",
			});
			return;
		}

		// Extract the token from the header and remove the 'eVoyze ' prefix
		const token = authHeader.split(" ")[1];

		if (token !== apiKey) {
			logMessage(
				`Error: Incorrect token, result: providedToken: ${token}, apiKey: ${apiKey}`
			);
			res.status(401).json({ msg: "Incorrect token" });
			return;
		}

		// If the provided token matches the server's API key, continue..
		// logMessage(`Provided token matches the server's API key, continue..`)
		next();
	} catch (err) {
		next(err);
	}
}

module.exports = { vAccessKey: vAccessKey };
