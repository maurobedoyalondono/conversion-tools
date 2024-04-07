const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load configuration
const config = require('./config.json');

// Compile regex patterns from the configuration
const patterns = config.patterns.map(pattern => new RegExp(pattern));

// Function to check if the file matches the required pattern and prefix
const matchesPatternAndPrefix = (filename) => {
  return patterns.some(pattern => pattern.test(filename)) && filename.startsWith(config.filePrefix);
};

// Function to process and rename files using the command from configuration
const processFile = (filePath) => {
    const filename = path.basename(filePath);
    // Regex to target the extension for replacement
    const outputFilename = filename.replace(/(\.[^\.]+)$/, '-lg$1');
    const outputPath = path.join(config.outputFolder, outputFilename);
    
    const command = config.commandTemplate
      .replace('{input}', `"${filePath}"`)
      .replace('{output}', `"${outputPath}"`)
      .replace('{width}', config.resizeWidth)
      .replace('{width}', config.resizeWidth)
      .replace('{height}', config.cropHeight);
  
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`Processed ${filePath} and saved as ${outputPath}`);
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
    });
  };
  

// Initialize watcher
const watcher = chokidar.watch(config.watchFolder, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

// Add event listeners
watcher
  .on('add', filePath => {
    console.log(`File ${filePath} has been added`);
    if (matchesPatternAndPrefix(path.basename(filePath))) {
      processFile(filePath);
    }
  })
  .on('change', filePath => {
    console.log(`File ${filePath} has been changed`);
    if (matchesPatternAndPrefix(path.basename(filePath))) {
      processFile(filePath);
    }
  })
  .on('error', error => console.log(`Watcher error: ${error}`));

console.log(`Watching for files in ${config.watchFolder}`);
