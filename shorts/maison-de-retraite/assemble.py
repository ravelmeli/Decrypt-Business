"""Assemble v3/video/index.html from head + engine.js + world.js + tail.js (continuous-camera version)."""
import json, re
B = json.load(open("video/assets/beats.json")); DUR = B["dur"]
h = open("../parc-attractions/assemble2.py").read(); head = h[h.index("head = '''") + 10: h.index("'''.replace")]
# smaller, calmer annotations
head = head.replace("padding: 12px 26px 14px; border-radius: 999px; font-size: 38px", "padding: 8px 20px 10px; border-radius: 999px; font-size: 28px")
head = head.replace("font-size: 168px; line-height: 1; letter-spacing: -.02em", "font-size: 132px; line-height: 1; letter-spacing: -.02em").replace("-webkit-text-stroke: 14px #120833", "-webkit-text-stroke: 11px #120833")
head = head.replace("padding: 10px 30px; border: 7px solid; border-radius: 16px; font-size: 52px", "padding: 6px 22px; border: 5px solid; border-radius: 14px; font-size: 34px")
head = head.replace("#flash { position: absolute; inset: 0; background: #fff;", "#flash { position: absolute; inset: 0; background: #120833;")
head = head.replace("assets/mix.wav", "assets/mix.wav")
head = head.replace("data-fps=\"60\"", "data-fps=\"30\"")
PAL = [("#ffc93c", "#f2b84b"), ("#ff4f7a", "#e0634d"), ("#2fc4ff", "#4fb0b5"), ("#6dff9a", "#8cc07a"), ("#120833", "#0c1f26"), ("#1e0f55", "#16363f"), ("#34187f", "#24505c"), ("#1a2160", "#1d3b47"), ("#0b0a3a", "#0c1f26"), ("#12083a", "#0c1f26"), ("#f4ecd8", "#f6ecd9"), ("#e6ebff", "#eaf2f2"), ("#b8c4ff", "#b7cdd0"), ("#9fb3ff", "#9ec3c8"), ("rgba(24,10,70,.88)", "rgba(14,38,46,.88)"), ("rgba(10,16,50,.92)", "rgba(10,28,34,.92)"), ("rgba(2,4,20,.55)", "rgba(2,10,14,.55)"), ("0f1546", "0c1f26")]
for o, n in PAL: head = head.replace(o, n)
head = head.replace("%DUR%", str(DUR))
parts = [open(f"video/{n}.js").read() for n in ("engine", "world", "tail")]
# keyword auto-fit smaller cap
parts[0] = parts[0].replace("Math.min(168,", "Math.min(132,")
open("video/index.html", "w").write(head + "".join(parts) + "    </script>\n  </body>\n</html>\n")
print("assembled", DUR)
