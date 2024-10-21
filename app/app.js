const express = require("express");
const path = require("path");
const server = express();
const { exec } = require("child_process");
const { rConfig } = require("./tools/rConfig");
const config = JSON.parse(rConfig);
const port = config.port;
const version = config.version;
const logMessage = require("./tools/logger");

// Start scheduling
require("./cron/cronJobs");

// Serve static files from the 'www' directory
const cwd = process.cwd();
server.use(express.static(path.join(cwd, "www")));

// Middleware
const bodyParser = require("body-parser");
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

// Custom Middleware
const { vAccessKey } = require("./middleware/vAccessKey");
const { vDevGoup } = require("./middleware/vDbDevGoup");

// Define a simple route
server.get("/version", (req, res) => {
	res.send(
		`FAST Peple Attendance Module: Att-Device-API Version: ${version}`
	);
});

server.get("/validate", vAccessKey, (req, res) => {
	res.status(200).json({ msg: "success" });
});

// Import Routes
const cAttLog = require("./routes/cAttLog");
const cuAttDev = require("./routes/cuAttDev");

// Use Routes
server.use("/att-log", vAccessKey, vDevGoup, cAttLog);
server.use("/att-dev", vAccessKey, vDevGoup, cuAttDev);

// Redirect unknown routes to home
server.use((req, res) => {
	res.status(404).sendFile(path.join(cwd, "www", "404.html"));
});

// Start the server
server.listen(port, () => {
	logMessage(`Server is running on http://localhost:${port}`);
});
