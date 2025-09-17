const fs = require('fs');
const path = require('path');

function copyDirectorySync(src, dest) {
  try {
    // Check if source exists
    if (!fs.existsSync(src)) {
      console.log(`Source directory ${src} does not exist, skipping...`);
      return;
    }

    // Create destination directory if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    // Read directory contents
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        copyDirectorySync(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    console.log(`Successfully copied ${src} to ${dest}`);
  } catch (error) {
    console.error(`Error copying ${src} to ${dest}:`, error.message);
  }
}

function moveDirectorySync(src, dest) {
  try {
    // Check if source exists
    if (!fs.existsSync(src)) {
      console.log(`Source directory ${src} does not exist, skipping...`);
      return;
    }

    // Create destination directory if it doesn't exist
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Move the directory
    fs.renameSync(src, dest);
    console.log(`Successfully moved ${src} to ${dest}`);
  } catch (error) {
    console.error(`Error moving ${src} to ${dest}:`, error.message);
  }
}

// Check if we're in a CI environment (Azure DevOps sets BUILD_SOURCESDIRECTORY)
const isCI = process.env.BUILD_SOURCESDIRECTORY || process.env.CI;

// Move static files (this is generated, so we can always move it)
const staticSrc = '.next/static';
const staticDest = '.next/standalone/.next/static';
moveDirectorySync(staticSrc, staticDest);

// Handle public folder differently for CI vs local
const publicSrc = 'public';
const publicDest = '.next/standalone/public';

if (isCI) {
  // In CI, we can move since it's a clean environment
  moveDirectorySync(publicSrc, publicDest);
  console.log('CI environment detected - moved public folder');
} else {
  // Locally, copy to avoid git changes
  copyDirectorySync(publicSrc, publicDest);
  console.log('Local environment detected - copied public folder');
}

console.log('Post-build file organization complete');