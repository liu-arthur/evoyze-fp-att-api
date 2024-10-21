const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const cwd = process.cwd();
const configPath = path.join(cwd, "config", "config.json");
const privateKeyPath = path.join(path.dirname(configPath), "private.key");
const publicKeyPath = path.join(path.dirname(configPath), "public.key");

const logMessage = require("./logger");

// Function to generate a key pair
function generateKeyPair() {
	const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: {
			type: "spki",
			format: "pem",
		},
		privateKeyEncoding: {
			type: "pkcs8",
			format: "pem",
		},
	});

	return { publicKey, privateKey };
}

// Function to generate a symmetric key (AES)
function generateSymmetricKey() {
	return crypto.randomBytes(32); // AES-256
}

// Function to encrypt data using AES
function encryptWithAES(data, key) {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
	let encrypted = cipher.update(data, "utf8", "base64");
	encrypted += cipher.final("base64");
	return { iv: iv.toString("base64"), encryptedData: encrypted };
}

// Function to encrypt a symmetric key using RSA
function encryptSymmetricKey(key, publicKey) {
	return crypto
		.publicEncrypt(
			{
				key: publicKey,
			},
			key
		)
		.toString("base64");
}

function cValidation() {
	try {
		let privateKeyContent;
		let publicKeyContent;

		if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
			logMessage(
				"Keys do not exist. Generating and creating private.key and public.key..."
			);
			const keyPair = generateKeyPair();
			privateKeyContent = keyPair.privateKey;
			publicKeyContent = keyPair.publicKey;
			fs.writeFileSync(privateKeyPath, privateKeyContent, "utf8");
			fs.writeFileSync(publicKeyPath, publicKeyContent, "utf8");
			logMessage("Key files created successfully.");
		} else {
			logMessage("Key files already exist.");
			privateKeyContent = fs.readFileSync(privateKeyPath, "utf8");
			publicKeyContent = fs.readFileSync(publicKeyPath, "utf8");
		}

		logMessage("Encrypting data...");
		const currentConfigContent = JSON.parse(
			fs.readFileSync(configPath, "utf8")
		);

		// Create a copy of the config object without the validation field
		const { validation, ...configWithoutValidation } = currentConfigContent;

		// Convert the config object (excluding validation) to a formatted string
		const dataToEncrypt = JSON.stringify(configWithoutValidation, null, 4);

		// Generate a symmetric key
		const symmetricKey = generateSymmetricKey();

		// Encrypt the data with the symmetric key
		const { iv, encryptedData } = encryptWithAES(
			dataToEncrypt,
			symmetricKey
		);

		// Encrypt the symmetric key with the public key
		const encryptedKey = encryptSymmetricKey(
			symmetricKey,
			publicKeyContent
		);

		// Combine the encrypted key and encrypted data
		currentConfigContent.validation = JSON.stringify({
			iv,
			encryptedData,
			encryptedKey,
		});

		fs.writeFileSync(
			configPath,
			JSON.stringify(currentConfigContent, null, 4),
			"utf8"
		);

		logMessage("Config file updated with encrypted validation.");
	} catch (error) {
		console.error("An error occurred:", error.message);
		process.exit(1); // Exit with error code
	}
}

// Export the function
module.exports = cValidation;

if (require.main === module) {
	validation();
}
