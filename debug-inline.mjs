// Debug inline script
import fs from 'fs';
import path from 'path';

const distDir = path.resolve('./dist');
const htmlPath = path.join(distDir, 'index.html');

console.log('=== Debug Inline Script ===');
console.log('distDir:', distDir);
console.log('htmlPath:', htmlPath);
console.log('html exists:', fs.existsSync(htmlPath));

let html = fs.readFileSync(htmlPath, 'utf-8');
console.log('\n--- Looking for JS ---');
console.log('HTML content around script:');
const scriptMatch = html.match(/<script[^>]*><\/script>/);
console.log('Inline script found:', !!scriptMatch);

const srcMatch = html.match(/<script[^>]*src="([^"]+)"[^>]*>/);
console.log('External script found:', !!srcMatch);
if (srcMatch) {
  console.log('Script src:', srcMatch[1]);
}

console.log('\n--- Looking for CSS ---');
const linkMatch = html.match(/<link[^>]*href="([^"]+)"[^>]*>/);
console.log('External CSS found:', !!linkMatch);
if (linkMatch) {
  console.log('Link href:', linkMatch[1]);
}

console.log('\n--- Files in dist ---');
console.log(fs.readdirSync(distDir));
console.log('\n--- Files in dist/assets ---');
const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  console.log(fs.readdirSync(assetsDir));
} else {
  console.log('No assets folder');
}
