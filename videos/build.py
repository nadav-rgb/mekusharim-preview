# בונה אפליקציית-שחזור: shell.html + screens/*.html -> app.html, ומקמפל Tailwind.
# שימוש: python3 build.py <appdir> [screen-name]   (עם שם מסך: בונה תצוגה מקדימה ב-<appdir>/.preview/)
import sys, os, re, glob, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
ICONS = os.path.join(HERE, 'node_modules/lucide-static/icons')

def icon(m):
    attrs = dict(re.findall(r'data-([a-z]+)="([^"]*)"', m.group(0)))
    cls = re.search(r'class="([^"]*)"', m.group(0))
    name = attrs['icon']; size = attrs.get('size', '24'); stroke = attrs.get('stroke', '2')
    svg = open(os.path.join(ICONS, name + '.svg')).read()
    svg = re.sub(r'<!--.*?-->', '', svg, flags=re.S).strip()
    svg = re.sub(r'\s+', ' ', svg)
    svg = svg.replace('width="24"', f'width="{size}"').replace('height="24"', f'height="{size}"').replace('stroke-width="2"', f'stroke-width="{stroke}"')
    extra = (' ' + cls.group(1)) if cls else ''
    svg = svg.replace('class="lucide', f'class="shrink-0{extra} lucide', 1)
    return svg

def expand(html):
    return re.sub(r'<i\s+data-icon="[^"]+"[^>]*>\s*</i>', icon, html)

app = sys.argv[1]; only = sys.argv[2] if len(sys.argv) > 2 else None
shell = open(os.path.join(app, 'shell.html')).read()
frags = []
for f in sorted(glob.glob(os.path.join(app, 'screens', '*.html'))):
    name = os.path.splitext(os.path.basename(f))[0]
    if only and name != only: continue
    frags.append(open(f).read())
if only and not frags: sys.exit(f'no screen {only}')
out_dir = os.path.join(app, '.preview') if only else app
os.makedirs(out_dir, exist_ok=True)
css_name = f'{only}.css' if only else 'app.css'
html = expand(shell.replace('<!--SCREENS-->', '\n'.join(frags)))
if only:
    html = html.replace('href="app.css"', f'href=".preview/{css_name}"').replace('<base href="./">', '<base href="../">')
    html = html.replace('class="screen"', 'class="screen active"', 1)
open(os.path.join(out_dir, (only or 'app') + '.html'), 'w').write(html)
# Tailwind סורק את ה-HTML שנבנה (ה-@source בתוך theme.css מצביע על תיקיית האפליקציה)
r = subprocess.run([os.path.join(HERE, 'node_modules/.bin/tailwindcss'), '-i', os.path.join(app, 'theme.css'), '-o', os.path.join(out_dir, css_name)], capture_output=True, text=True)
if r.returncode: sys.exit(r.stderr)
print('built', os.path.join(out_dir, (only or 'app') + '.html'))
