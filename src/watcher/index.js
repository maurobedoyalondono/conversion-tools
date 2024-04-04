const chokidar = require('chokidar');
const fsExtra = require('fs-extra');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const logAction = (filePath, destPath, logFile) => {
  const logMsg = `Moved ${filePath} to ${destPath}\n`;
  fs.appendFileSync(logFile, logMsg, 'utf8');
  console.log(logMsg);
};

const moveFile = async (filePath, destDir, logFile) => {
  const fileName = path.basename(filePath);
  const destPath = path.join(destDir, fileName);
  try {
    await fsExtra.move(filePath, destPath, { overwrite: true });
    logAction(filePath, destPath, logFile);
  } catch (err) {
    console.error(`Error moving file: ${err}`);
  }
};

const setupWatcher = ({inputDir, outputDir, filesToMove, logFile}) => {
  // Compile regex patterns from the configuration
  const regexPatterns = filesToMove.map(pattern => new RegExp(pattern));
  
  const watcher = chokidar.watch(inputDir, {ignored: /(^|[\/\\])\../});

  watcher.on('add', filePath => {
    const fileName = path.basename(filePath);
    // Test if the file name matches any of the compiled regex patterns
    const matchesPattern = regexPatterns.some(regex => regex.test(fileName));
    if (matchesPattern) {
      moveFile(filePath, outputDir, logFile);
    }
  });
};

config.watchConfig.forEach(setupWatcher);
