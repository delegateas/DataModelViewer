const { execSync } = require('child_process');

function generateChangelog(lastTag, nextVersion, repo) {
  let commits = [];
  try {
    const output = execSync(`git log ${lastTag}..HEAD --pretty=format:"%h|%s"`).toString();
    commits = output.split('\n').filter(line => line.trim()).map(line => {
      const [hash, message] = line.split('|');
      return { hash, message };
    });
  } catch (error) {
    console.log('No commits found or error getting commits');
    return `## [${nextVersion}] - ${new Date().toISOString().split('T')[0]}\n\n### Changed\n- Manual release\n\n`;
  }

  const categories = {
    'Features': [],
    'Bug Fixes': [],
    'Performance Improvements': [],
    'UI/UX Improvements': [],
    'Code Refactoring': [],
    'Other Changes': []
  };

  commits.forEach(commit => {
    const { hash, message } = commit;
    const link = `([${hash}](https://github.com/${repo}/commit/${hash}))`;
    let cleanMessage = message;
    
    // Clean up common prefixes
    cleanMessage = cleanMessage.replace(/^(feat|feature):\s*/i, '');
    cleanMessage = cleanMessage.replace(/^(fix|bugfix):\s*/i, '');
    cleanMessage = cleanMessage.replace(/^(perf|performance):\s*/i, '');
    cleanMessage = cleanMessage.replace(/^(style|ui|ux):\s*/i, '');
    cleanMessage = cleanMessage.replace(/^(refactor|refact):\s*/i, '');
    cleanMessage = cleanMessage.replace(/^chore:\s*/i, '');
    
    // Categorize commits
    if (message.match(/^feat|feature|add|implement|new/i) || message.includes('PBI')) {
      categories['Features'].push(`* ${cleanMessage} ${link}`);
    } else if (message.match(/^fix|bug|resolve|correct/i)) {
      categories['Bug Fixes'].push(`* ${cleanMessage} ${link}`);
    } else if (message.match(/perf|performance|optim|speed|fast/i)) {
      categories['Performance Improvements'].push(`* ${cleanMessage} ${link}`);
    } else if (message.match(/ui|ux|style|design|visual|appearance/i)) {
      categories['UI/UX Improvements'].push(`* ${cleanMessage} ${link}`);
    } else if (message.match(/refactor|restructure|reorganize|clean/i)) {
      categories['Code Refactoring'].push(`* ${cleanMessage} ${link}`);
    } else if (!message.match(/^merge|^chore\(release\)/i)) {
      categories['Other Changes'].push(`* ${cleanMessage} ${link}`);
    }
  });

  let changelog = `## [${nextVersion}] - ${new Date().toISOString().split('T')[0]}\n\n`;
  
  Object.entries(categories).forEach(([category, items]) => {
    if (items.length > 0) {
      changelog += `### ${category}\n\n`;
      items.forEach(item => {
        changelog += `${item}\n`;
      });
      changelog += '\n';
    }
  });

  // If no categorized items, add a simple changed section
  if (Object.values(categories).every(cat => cat.length === 0)) {
    changelog += `### Changed\n\n* Manual ${nextVersion.includes('major') ? 'major' : nextVersion.includes('minor') ? 'minor' : 'patch'} release\n\n`;
  }

  return changelog;
}

const lastTag = process.argv[2];
const nextVersion = process.argv[3];
const repo = process.argv[4];
console.log(generateChangelog(lastTag, nextVersion, repo));
