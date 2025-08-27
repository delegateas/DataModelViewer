const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '../stubs');
const destinationDir = path.resolve(__dirname, '../generated');

fs.mkdirSync(destinationDir, { recursive: true });

const files = fs.readdirSync(sourceDir);
files.forEach(file => {
  const sourceFile = path.join(sourceDir, file);
  const destFile = path.join(destinationDir, file);
  fs.copyFileSync(sourceFile, destFile);
  console.log(`Copied ${file} to ${destinationDir}`);
});