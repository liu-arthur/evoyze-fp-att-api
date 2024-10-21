const fs = require('fs');
const path = require('path');
const minify = require('@node-minify/core');
const uglifyES = require('@node-minify/uglify-es');
const execSync = require('child_process').execSync;
const moment = require('moment');

const APP = require('../package.json');
const _APPNAME = APP.name
const _APPDESCRIPTION = APP.description

// Function to minify JavaScript files
async function minifyJsFiles(inputDir, outputDir) {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    async function processDirectory(currentInputDir, currentOutputDir) {
        const files = await fs.promises.readdir(currentInputDir, { withFileTypes: true });

        for (const file of files) {
            const filePath = path.join(currentInputDir, file.name);
            const outputFilePath = path.join(currentOutputDir, file.name);

            if (file.isDirectory()) {
                await fs.promises.mkdir(outputFilePath, { recursive: true });
                await processDirectory(filePath, outputFilePath);
            } else if (path.extname(file.name) === '.js') {
                try {
                    const minified = await minify({
                        compressor: uglifyES,
                        input: filePath,
                        output: outputFilePath
                    });
                    fs.writeFileSync(outputFilePath, minified);
                    console.log(`Minified: ${filePath}`);
                } catch (error) {
                    console.error(`Error minifying file ${filePath}:`, error);
                }
            }
        }
    }

    await processDirectory(inputDir, outputDir);
}

// Function to package the application using pkg
function pkgApp(entryPoint, outputFile) {
    console.log('Packaging application with pkg...');

    if (!fs.existsSync(entryPoint)) {
        console.error(`Error: Entry point file does not exist at ${entryPoint}`);
        process.exit(1);
    }

    execSync(`pkg --targets node18-win-x64 ${entryPoint} --output ${outputFile}`, { stdio: 'inherit' });
}

// Recursive function to copy files and directories
function copyDirectorySync(source, destination) {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const entries = fs.readdirSync(source, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(source, entry.name);
        const destPath = path.join(destination, entry.name);

        if (entry.isDirectory()) {
            copyDirectorySync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Function to copy the config folder
function copyConfig() {
    console.log('Copying config folder...');
    const source = path.join(__dirname, '..', 'config');
    const destination = path.join(__dirname, '..', 'build', 'dist', 'config');
    copyDirectorySync(source, destination);
}

// Function to copy the www folder
function copyWwwFolder() {
    console.log('Copying www folder...');
    const source = path.join(__dirname, '..', 'www');
    const destination = path.join(__dirname, '..', 'build', 'dist', 'www');
    copyDirectorySync(source, destination);
}

// Function to copy README.md
function copyREADME() {
    console.log('Copying README.md...');
    const source = path.join(__dirname, '..', 'README.md');
    const destination = path.join(__dirname, '..', 'build', 'dist', 'README.md');
    if (fs.existsSync(source)) {
        fs.copyFileSync(source, destination);
    } else {
        console.warn(`File not found: ${source}`);
    }
}

// Function to create XML
function createXML() {
    // Define the XML content
    const xmlContent = `
<service>
    <id>${_APPNAME}</id>
    <name>${_APPDESCRIPTION}</name>
    <description>${_APPDESCRIPTION}</description>
    <executable>${_APPNAME}.exe</executable>
    <arguments></arguments>
    <delayedAutoStart>true</delayedAutoStart>
    <stoptimeout>3sec</stoptimeout>
</service>
`;
    
    // Define the path to the XML file
    const filePath = path.join(__dirname, '..', 'build', 'dist', `${_APPNAME}-main.xml`);

    // Write the XML content to the file
    fs.writeFileSync(filePath, xmlContent, 'utf8');

    console.log('File app.xml created successfully with the specified content.');
}

// Function to copy WinSW.NET461.exe
function copyWinSW() {
    // Define the source file path
    const sourceFilePath = 'F:\\evoyze\\word_order\\tools\\WinSW.NET461.exe';

    // Define the destination directory and file name
    const destinationFilePath = path.join(__dirname, '..', 'build', 'dist', `${_APPNAME}-main.exe`);

    // Copy and rename the file
    try {
        fs.copyFileSync(sourceFilePath, destinationFilePath);
        console.log(`File copied and renamed to ${destinationFilePath}`);
    } catch (error) {
        console.error(`Error copying file: ${error.message}`);
    }

}

// Function to copy node_modules, package.json, and package-lock.json
function copyDependencies() {
    console.log('Copying node_modules, package.json, and package-lock.json...');
    const rec = `${moment().format('YYYYMMDD')}`;

    const buildSourceDir = path.join(__dirname, '..', 'build', `source_${rec}`);
    if (!fs.existsSync(buildSourceDir)) {
        fs.mkdirSync(buildSourceDir, { recursive: true });
    }

    const filesToCopy = [
        'package.json',
        'package-lock.json'
    ];

    filesToCopy.forEach(file => {
        const srcPath = path.join(__dirname, '..', file);
        const destPath = path.join(buildSourceDir, file);
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${srcPath}`);
        } else {
            console.warn(`File not found: ${srcPath}`);
        }
    });

    const srcNodeModulesPath = path.join(__dirname, '..', 'node_modules');
    const destNodeModulesPath = path.join(buildSourceDir, 'node_modules');
    if (fs.existsSync(srcNodeModulesPath)) {
        copyDirectorySync(srcNodeModulesPath, destNodeModulesPath);
        console.log(`Copied: ${srcNodeModulesPath}`);
    } else {
        console.warn(`Directory not found: ${srcNodeModulesPath}`);
    }
}

// Main function
async function main() {
    const rec = `${moment().format('YYYYMMDD')}`;
    const inputDir = path.join(__dirname, '..', 'app');
    const outputDir = path.join('build', `source_${rec}`, 'app');

    console.log('Creating build folder...');
    if (!fs.existsSync('build')) {
        fs.mkdirSync('build');
    }

    console.log('Creating dist folder inside build...');
    const distDir = 'build/dist';
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    try {
        await minifyJsFiles(inputDir, outputDir);
        copyDependencies();

        const entryPoint = path.join(outputDir, 'app.js');
        const outputFile = path.join(distDir, _APPNAME);
        pkgApp(entryPoint, outputFile);

        copyConfig();
        copyWwwFolder();
        copyREADME();
        createXML();
        copyWinSW();
        console.log('Build process completed successfully.');
    } catch (error) {
        console.error('Build process failed:', error);
    }
}

main();
