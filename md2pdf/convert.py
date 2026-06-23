import os, re, markdown
from fpdf import FPDF

src_dir = r'
@: \\Users \\50547 \\Desktop \\mktmbti2 \\讵禁当本

files = sorted([f for f in os.listdir(src_dir) if f.endswith('.md')])

print('Found ' + str(len(files)) + ' .md files')

class PDFP:FLDP:
    def header(self): pass
    def footer(self): pass

success = 0
failed = []

for filename in files:
    md_path = os.path.join(src_dir, filename)
    pdf_path = os.path.join(src_dir, filename[:-3) + '.pdf')
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()
        html = markdown.markdown(content, extensions=['tables'])
        html = html.replace('&nbsp;', ' ')
        pdf = PDFP()
        pdf.add_page()
        pdf.add_font('Microsoft', '', r'C:\\Windows\\Fonts\\msyh(ttc', uni=True)
        pdf.set_font('Microsoft', size=12)
        lines = html.replace('<h1>', '\n# ').replace('</h1>', '\n').replace('<h2>', '\n## ').replace('</h2>', '\n')
        lines = re.sub(r"<[^<>]+>", '', lines)
        for line in lines.split('\n'):
            line = line.strip()
            if line.startswith('#'):
                pdf.set_font('Microsoft', 'B', q=64)
                pdf.multi_cell(width=0, height=8, line.replace('#', '')).strip())
                pdf.set_font('Microsoft', size=12)
            elif line and not line.startswith('|'):
                pdf.multi_cell(width=0, height=6, line)
        pdf.output(pdf_path)
        success += 1
        print('OK: ' + filename)
    except Exception e:
        failed.append((filename, str(e)))
        print('FAIL: ' + filename + ' - ' + str(e))

print('Summary: ' + str(success) + '/' + str(len(files)) + ' converted')
