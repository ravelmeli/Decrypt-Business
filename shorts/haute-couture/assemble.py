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
PAL = [("#ffc93c", "#e2b857"), ("#ff4f7a", "#d0304a"), ("#2fc4ff", "#7aa7c7"), ("#6dff9a", "#7fb89a"), ("#120833", "#0e0910"), ("#1e0f55", "#241520"), ("#34187f", "#3a2030"), ("#1a2160", "#1c1420"), ("#0b0a3a", "#0e0910"), ("#12083a", "#0e0910"), ("#f4ecd8", "#f1e6d6"), ("#e6ebff", "#f6eee6"), ("#b8c4ff", "#c8b6c0"), ("#9fb3ff", "#c8a8b8"), ("rgba(24,10,70,.88)", "rgba(28,16,26,.9)"), ("rgba(10,16,50,.92)", "rgba(20,12,18,.92)"), ("rgba(2,4,20,.55)", "rgba(6,2,6,.55)"), ("0f1546", "0e0910")]
for o, n in PAL: head = head.replace(o, n)
head = head.replace("#brandend { position: absolute; left: 0; right: 0; top: 620px;","#brandend { position: absolute; left: 0; right: 0; top: 330px;").replace("%DUR%", str(DUR))
parts = [open(f"video/{n}.js").read() for n in ("engine", "world", "tail")]
# keyword auto-fit smaller cap
parts[0] = parts[0].replace("Math.min(168,", "Math.min(132,")
open("video/index.html", "w").write(head + "".join(parts) + "    </script>\n  </body>\n</html>\n")
print("assembled", DUR)
