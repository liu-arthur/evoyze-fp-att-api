const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const cwd = process.cwd();
const configPath = path.join(cwd, "config", "config.json");

const publicKeyPath = path.join(path.dirname(configPath), "public.key");
const privateKeyPath = path.join(path.dirname(configPath), "private.key");

const logMessage = require("./logger");

const init = require("./init");

function runInitialScript() {
	try {
		logMessage("Config file not found! Running initial setup...");
		init();

		// Re-check if config.json exists after running the script
		if (!fs.existsSync(configPath)) {
			throw new Error("Config file still not found after initial setup.");
		}
	} catch (error) {
		console.error("Error running initial setup script:", error.message);
		process.exit(1); // Exit with failure code
	}
}

// Check if config.json exists
if (
	!fs.existsSync(configPath) ||
	!fs.existsSync(publicKeyPath) ||
	!fs.existsSync(privateKeyPath)
) {
	runInitialScript();
}

// Proceed with processing if config.json exists
const configContent = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Check if private.key exists
if (!fs.existsSync(privateKeyPath)) {
	console.error(`Private key file not found at ${privateKeyPath}.`);
	process.exit(1); // Exit with failure code
}

const privateKeyContent = fs.readFileSync(privateKeyPath, "utf8");

// Function to decrypt data using AES
function decryptWithAES(encryptedData, key, iv) {
	const decipher = crypto.createDecipheriv(
		"aes-256-cbc",
		key,
		Buffer.from(iv, "base64")
	);
	let decrypted = decipher.update(encryptedData, "base64", "utf8");
	decrypted += decipher.final("utf8");
	return decrypted;
}

// Function to decrypt a symmetric key using RSA
function decryptSymmetricKey(encryptedKey, privateKey) {
	return crypto.privateDecrypt(
		{
			key: privateKey,
		},
		Buffer.from(encryptedKey, "base64")
	);
}

let decryptedValidation = null;

try {
	const {
		iv: decIv,
		encryptedData: decEncryptedData,
		encryptedKey: decEncryptedKey,
	} = JSON.parse(configContent.validation);

	// Decrypt the symmetric key with the private key
	const decryptedSymmetricKey = decryptSymmetricKey(
		decEncryptedKey,
		privateKeyContent
	);

	// Decrypt the data with the symmetric key
	decryptedValidation = decryptWithAES(
		decEncryptedData,
		decryptedSymmetricKey,
		decIv
	);
} catch (error) {
	console.error("Error decrypting configuration:", error.message);
	process.exit(1); // Exit with failure code
}

module.exports = { rConfig: decryptedValidation };
