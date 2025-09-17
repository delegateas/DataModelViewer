const fs = require('fs');

// Ensure the standalone directory structure exists for the pipeline's mv commands
if (!fs.existsSync('.next/standalone')) {
  fs.mkdirSync('.next/standalone', { recursive: true });
  console.log('Created .next/standalone directory');
}

if (!fs.existsSync('.next/standalone/.next')) {
  fs.mkdirSync('.next/standalone/.next', { recursive: true });
  console.log('Created .next/standalone/.next directory');
}

console.log('Post-build: Directories prepared for breaking Next 15 pipeline file moves');