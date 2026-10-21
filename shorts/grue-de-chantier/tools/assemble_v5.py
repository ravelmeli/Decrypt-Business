"""Inline video-v5/module.js into video-v5/index.html (head/CSS/GSAP part is kept from the existing file)."""
import sys, re
root = sys.argv[1]
html = open(f"{root}/index.html").read()
mod = open(f"{root}/module.js").read()
i = html.index('<script type="module">')
head = html[:i]
open(f"{root}/index.html", "w").write(head + '<script type="module">\n' + mod + '    </script>\n  </body>\n</html>\n')
print("assembled", len(mod), "bytes of module")
