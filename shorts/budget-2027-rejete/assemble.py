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
head = head.replace("Economie d'un parc d'attractions", "Le budget 2027 rejeté")
head = head.replace("data-fps=\"60\"", "data-fps=\"30\"")
PAL = [("#ffc93c", "#ffb347"), ("#ff4f7a", "#ff6b5e"), ("#2fc4ff", "#4db8ff"), ("#6dff9a", "#43e0a6"), ("#120833", "#0d1626"), ("#1e0f55", "#1b2a44"), ("#34187f", "#2f4a73"), ("#1a2160", "#1b2a44"), ("#0b0a3a", "#0d1626"), ("#12083a", "#0d1626"), ("#f4ecd8", "#fbf3e6"), ("#e6ebff", "#f6f1e8"), ("#b8c4ff", "#c4b9a8"), ("#9fb3ff", "#b5a99a"), ("rgba(24,10,70,.88)", "rgba(14,22,40,.88)"), ("rgba(10,16,50,.92)", "rgba(10,16,30,.92)"), ("rgba(2,4,20,.55)", "rgba(2,5,12,.55)"), ("0f1546", "0d1626")]
for o, n in PAL: head = head.replace(o, n)
head = head.replace("#brandend { position: absolute; left: 0; right: 0; top: 620px;","#brandend { position: absolute; left: 0; right: 0; top: 330px;").replace("%DUR%", str(DUR))
parts = [open(f"video/{n}.js").read() for n in ("engine", "world", "tail")]
# keyword auto-fit smaller cap
parts[0] = parts[0].replace("Math.min(168,", "Math.min(132,")
head = head.replace('<script type="importmap">','<script>window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {}; window.__hf.buildReady.models = new Promise((r) => { window.__resolveModels = r; });</script>\n    <script type="importmap">')
parts[2] = parts[2] + "\n      window.__resolveModels && window.__resolveModels(true);\n"
open("video/index.html", "w").write(head + "".join(parts) + "    </script>\n  </body>\n</html>\n")
print("assembled", DUR)
