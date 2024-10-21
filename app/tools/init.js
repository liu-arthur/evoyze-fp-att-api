const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const updateValidation = require("./cuValidation");

// Define the path to the config directory and files
const cwd = process.cwd();
const configDir = path.join(cwd, "config");
const configPath = path.join(configDir, "config.json");

const logMessage = require("./logger");

// Define the content to be written to config.json
const configContent = {
	db_uid: "evy_admin",
	db_pwd: "evy_admin",
	db_db: "evy_hrms",
	db_server: "EVOYZE-LAPTOP\\SQLEXPRESS",
	api_key: `eVoyze ${uuidv4().replace(/-/g, "")}${uuidv4().replace(
		/-/g,
		""
	)}`,
	port: "38012",
	version: "24.08.3",
	validation: "",
};

// Function to check if the file exists and create it if it does not
function init() {
	// Check if the config directory exists
	if (!fs.existsSync(configDir)) {
		logMessage(
			"Config directory does not exist. Creating config directory..."
		);

		// Create the config directory
		fs.mkdirSync(configDir, { recursive: true });

		logMessage("Config directory created successfully.");
	}

	if (!fs.existsSync(configPath)) {
		logMessage("Config file does not exist. Creating config.json...");

		// Create the config.json file with the specified content
		fs.writeFileSync(
			configPath,
			JSON.stringify(configContent, null, 4),
			"utf8"
		);

		logMessage("Config file created successfully.");
	} else {
		logMessage("Config file already exists.");
	}

	updateValidation();
}

// Export the function
module.exports = init;

if (require.main === module) {
	init();
}
