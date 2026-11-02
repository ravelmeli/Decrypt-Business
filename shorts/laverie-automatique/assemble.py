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
PAL = [("#ffc93c", "#ffe14d"), ("#ff4f7a", "#ff5a5f"), ("#2fc4ff", "#3fb8ff"), ("#6dff9a", "#4de3b5"), ("#120833", "#08121f"), ("#1e0f55", "#0f2a4a"), ("#34187f", "#1b4a78"), ("#1a2160", "#13294b"), ("#0b0a3a", "#08121f"), ("#12083a", "#08121f"), ("#f4ecd8", "#eaf6ff"), ("#e6ebff", "#eaf6ff"), ("#b8c4ff", "#a9c8e6"), ("#9fb3ff", "#8fc3f0"), ("rgba(24,10,70,.88)", "rgba(8,28,52,.88)"), ("rgba(10,16,50,.92)", "rgba(6,20,38,.92)"), ("rgba(2,4,20,.55)", "rgba(1,6,14,.55)"), ("0f1546", "08121f")]
for o, n in PAL: head = head.replace(o, n)
head = head.replace("#brandend { position: absolute; left: 0; right: 0; top: 620px;","#brandend { position: absolute; left: 0; right: 0; top: 330px;").replace("%DUR%", str(DUR))
parts = [open(f"video/{n}.js").read() for n in ("engine", "world", "tail")]
# keyword auto-fit smaller cap
parts[0] = parts[0].replace("Math.min(168,", "Math.min(132,")
open("video/index.html", "w").write(head + "".join(parts) + "    </script>\n  </body>\n</html>\n")
print("assembled", DUR)
