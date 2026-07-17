const fs = require('fs');
const html = fs.readFileSync('frontend/public/index.html', 'utf8');
const js = fs.readFileSync('frontend/src/js/app.js', 'utf8');
const matches = [...js.matchAll(/document\.getElementById\('([^']+)'\)/g)];
const missing = [];
for (const match of matches) {
    const id = match[1];
    if (!html.includes('id="' + id + '"') && !html.includes("id='" + id + "'")) {
        missing.push(id);
    }
}
console.log('Missing IDs:', [...new Set(missing)]);
