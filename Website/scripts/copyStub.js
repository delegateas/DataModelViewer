const fs = require('fs');
const path = require('path');

const source = path.resolve(__dirname, '../stubs/Data.ts');
const destination = path.resolve(__dirname, '../generated/Data.ts');

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);

console.log(`Stub Data.ts copied to ${destination}`);