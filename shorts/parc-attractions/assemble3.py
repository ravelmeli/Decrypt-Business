"""Assemble v3/video/index.html from head + engine.js + world.js + tail.js (continuous-camera version)."""
import json, re
B = json.load(open("v3/video/assets/beats.json")); DUR = B["dur"]
h = open("assemble2.py").read(); head = h[h.index("head = '''") + 10: h.index("'''.replace")]
# smaller, calmer annotations
head = head.replace("padding: 12px 26px 14px; border-radius: 999px; font-size: 38px", "padding: 8px 20px 10px; border-radius: 999px; font-size: 28px")
head = head.replace("font-size: 168px; line-height: 1; letter-spacing: -.02em", "font-size: 132px; line-height: 1; letter-spacing: -.02em").replace("-webkit-text-stroke: 14px #120833", "-webkit-text-stroke: 11px #120833")
head = head.replace("padding: 10px 30px; border: 7px solid; border-radius: 16px; font-size: 52px", "padding: 6px 22px; border: 5px solid; border-radius: 14px; font-size: 34px")
head = head.replace("#flash { position: absolute; inset: 0; background: #fff;", "#flash { position: absolute; inset: 0; background: #120833;")
head = head.replace("assets/mix.wav", "assets/mix.wav")
head = head.replace("data-fps=\"60\"", "data-fps=\"30\"")
head = head.replace("%DUR%", str(DUR))
parts = [open(f"v3/video/{n}.js").read() for n in ("engine", "world", "tail")]
# keyword auto-fit smaller cap
parts[0] = parts[0].replace("Math.min(168,", "Math.min(132,")
open("v3/video/index.html", "w").write(head + "".join(parts) + "    </script>\n  </body>\n</html>\n")
print("assembled", DUR)
