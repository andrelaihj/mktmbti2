const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const htmlPath = path.join(distDir, 'index.html');
const jsPath = path.join(distDir, 'assets', 'index-DJWk6l2G.js');
const cssPath = path.join(distDir, 'assets', 'index-By1SFBXM.css');

console.log('Starting inline process...');

// Read files
const html = fs.readFileSync(htmlPath, 'utf-8');
const js = fs.readFileSync(jsPath, 'utf-8');
const css = fs.readFileSync(cssPath, 'utf-8');

console.log(`HTML: ${html.length} chars`);
console.log(`JS: ${js.length} chars (${(js.length/1024).toFixed(1)} KB)`);
console.log(`CSS: ${css.length} chars (${(css.length/1024).toFixed(1)} KB)`);

// Replace
let newHtml = html;
newHtml = newHtml.replace(
  '<script type="module" crossorigin src="./assets/index-DJWk6l2G.js"></script>',
  `<script type="module">${js}</script>`
);
newHtml = newHtml.replace(
  '<link rel="stylesheet" crossorigin href="./assets/index-By1SFBXM.css">',
  `<style>${css}</style>`
);

console.log(`New HTML: ${newHtml.length} chars (${(newHtml.length/1024).toFixed(1)} KB)`);

// Write
fs.writeFileSync(htmlPath, newHtml);
console.log('Written to index.html');

// Remove assets folder
fs.rmSync(path.join(distDir, 'assets'), { recursive: true });
console.log('Removed assets folder');

console.log('Done!');
