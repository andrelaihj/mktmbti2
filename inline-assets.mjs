// Post-build script to inline assets
import fs from 'fs';
import path from 'path';

const distDir = path.resolve('./dist');
const htmlPath = path.join(distDir, 'index.html');

console.log('Inlining assets into index.html...');

let html = fs.readFileSync(htmlPath, 'utf-8');

// Find and inline JS
const jsMatch = html.match(/<script[^>]*src="(\.\/assets\/[^"]+\.js)"[^>]*><\/script>/);
if (jsMatch) {
  const jsPath = path.join(distDir, jsMatch[1]);
  if (fs.existsSync(jsPath)) {
    const js = fs.readFileSync(jsPath, 'utf-8');
    html = html.replace(jsMatch[0], `<script type="module">${js}</script>`);
    console.log(`  ✓ Inlined JS (${(js.length / 1024).toFixed(1)} KB)`);
  }
}

// Find and inline CSS
const cssMatch = html.match(/<link[^>]*href="\.\/assets\/([^"]+\.css)"[^>]*>/);
if (cssMatch) {
  const cssPath = path.join(distDir, 'assets', cssMatch[1]);
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf-8');
    html = html.replace(cssMatch[0], `<style>${css}</style>`);
    console.log(`  ✓ Inlined CSS (${(css.length / 1024).toFixed(1)} KB)`);
  }
}

fs.writeFileSync(htmlPath, html);

// Remove assets folder
const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.rmSync(assetsDir, { recursive: true });
  console.log('  ✓ Removed assets folder');
}

console.log('Done! Single-file index.html created.');
