# Python script to inline assets
import os

dist_dir = os.path.join(os.path.dirname(__file__), 'dist')
html_path = os.path.join(dist_dir, 'index.html')
js_path = os.path.join(dist_dir, 'assets', 'index-DJWk6l2G.js')
css_path = os.path.join(dist_dir, 'assets', 'index-By1SFBXM.css')

print('Starting inline process...')

# Read files
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()
    
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()
    
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

print(f'HTML: {len(html)} chars')
print(f'JS: {len(js)} chars ({len(js)//1024} KB)')
print(f'CSS: {len(css)} chars ({len(css)//1024} KB)')

# Replace
new_html = html.replace(
    '<script type="module" crossorigin src="./assets/index-DJWk6l2G.js"></script>',
    f"<script type='module'>{js}</script>"
)
new_html = new_html.replace(
    '<link rel="stylesheet" crossorigin href="./assets/index-By1SFBXM.css">',
    f"<style>{css}</style>"
)

print(f'New HTML: {len(new_html)} chars ({len(new_html)//1024} KB)')

# Write
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_html)
print('Written to index.html')

# Remove assets folder
import shutil
assets_dir = os.path.join(dist_dir, 'assets')
if os.path.exists(assets_dir):
    shutil.rmtree(assets_dir)
    print('Removed assets folder')

print('Done!')
