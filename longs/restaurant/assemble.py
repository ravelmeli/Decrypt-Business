"""Assemble video/index.html (16:9, 1920x1080) from head + engine + world + tail.  Usage: python3 assemble.py [t0 t1]  (chunk render: seconds of the full timeline)"""
import json, sys
B = json.load(open("video/assets/beats.json")); DUR = B["dur"]
t0 = float(sys.argv[1]) if len(sys.argv) > 2 else 0.0; t1 = float(sys.argv[2]) if len(sys.argv) > 2 else DUR
LEN = round(t1 - t0, 3); AUD = "assets/mix.wav" if len(sys.argv) <= 2 else f"assets/mix_chunk.wav"
head = '''<!doctype html>
<html lang="fr" data-resolution="landscape">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Decrypt Business - Ouvrir un restaurant</title>
    <script src="assets/gsap.min.js"></script>
    <script>window.__OFF = %OFF%;</script>
    <script src="assets/beats.js"></script>
    <script src="assets/words.js"></script>
    <script>window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {}; window.__hf.buildReady.models = new Promise((r) => { window.__resolveModels = r; });</script>
    <script type="importmap">{ "imports": { "three": "./assets/three/three.module.js", "three/addons/": "./assets/three/addons/" } }</script>
    <style>
      @font-face { font-family: "DecryptInter"; src: url("assets/fonts/Inter-Black.otf"); font-weight: 900; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1920px; height: 1080px; overflow: hidden; background: #071c20; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "DecryptInter", Inter, sans-serif; font-weight: 900; color: #fff; background: linear-gradient(180deg, #071c20 0%, #0f3a40 45%, #1a6068 100%); }
      #gl, #fxg { position: absolute; inset: 0; width: 1920px; height: 1080px; display: block; }
      #fxg { mix-blend-mode: screen; filter: blur(22px) brightness(1.25) contrast(1.5); opacity: .30; }
      #vig { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(1,10,12,.55) 100%); pointer-events: none; }
      #leads, #notes, #panels, #stamps, #kws { position: absolute; inset: 0; pointer-events: none; }
      .lead { position: absolute; left: 0; top: 0; height: 0; border-top: 3px dashed #ffd84a; transform-origin: 0 50%; opacity: 0; }
      .lead.red { border-color: #ff6b5e; } .lead.blue { border-color: #4db8ff; } .lead.green { border-color: #43e0a6; } .lead.white { border-color: #f2fbf7; }
      .note { position: absolute; left: 0; top: 0; padding: 7px 20px 9px; border-radius: 999px; font-size: 28px; letter-spacing: .02em; text-transform: uppercase; white-space: nowrap; opacity: 0; box-shadow: 0 6px 0 rgba(0,0,0,.28); }
      .note.gold { background: #ffd84a; color: #071c20; } .note.red { background: #ff6b5e; color: #fff; } .note.blue { background: #4db8ff; color: #071c20; }
      .note.green { background: #43e0a6; color: #071c20; } .note.white { background: #f2fbf7; color: #0f3a40; }
      .kw { position: absolute; left: 0; right: 0; top: 70px; text-align: center; font-size: 130px; line-height: 1; letter-spacing: -.02em; text-transform: uppercase; opacity: 0; white-space: nowrap; text-shadow: 0 8px 0 rgba(0,0,0,.32); -webkit-text-stroke: 10px #071c20; paint-order: stroke fill; }
      .kw.gold { color: #ffd84a; } .kw.red { color: #ff6b5e; } .kw.green { color: #43e0a6; } .kw.blue { color: #4db8ff; } .kw.white { color: #fff; }
      .stamp { position: absolute; left: 0; top: 0; padding: 6px 22px; border: 5px solid; border-radius: 14px; font-size: 32px; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; opacity: 0; background: rgba(6,28,32,.92); }
      .stamp.red { color: #ff6b5e; border-color: #ff6b5e; } .stamp.blue { color: #4db8ff; border-color: #4db8ff; } .stamp.gold { color: #ffd84a; border-color: #ffd84a; }
      #cap { position: absolute; left: 120px; right: 120px; top: 930px; text-align: center; font-size: 50px; line-height: 1.25; text-transform: uppercase; letter-spacing: .01em; opacity: 0; text-shadow: 0 4px 0 rgba(0,0,0,.4), 0 0 12px rgba(0,0,0,.5); }
      #cap span { display: inline-block; padding: 0 10px; margin: 0 2px; border-radius: 12px; } #cap .next { opacity: .45; } #cap .past { opacity: 1; } #cap .on { background: #ffd84a; color: #071c20; transform: rotate(-2deg) scale(1.05); text-shadow: none; opacity: 1; }
      #prog { position: absolute; left: 60px; right: 60px; bottom: 28px; height: 5px; background: rgba(255,255,255,.18); border-radius: 3px; } #prog i { display: block; height: 100%; width: 0; background: #ffd84a; border-radius: 3px; }
      #brandend { position: absolute; left: 0; right: 0; top: 380px; text-align: center; opacity: 0; } #brandend b { display: block; font-size: 150px; letter-spacing: .04em; color: #ffd84a; text-shadow: 0 10px 0 rgba(0,0,0,.35); } #brandend span { display: block; margin-top: 14px; font-size: 44px; letter-spacing: .4em; color: #f2fbf7; }
      #flash { position: absolute; inset: 0; background: #071c20; opacity: 0; pointer-events: none; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="%DUR%" data-width="1920" data-height="1080" data-fps="30">
      <canvas id="gl" width="1920" height="1080"></canvas><canvas id="fxg" width="480" height="270"></canvas>
      <div id="vig"></div><div id="leads"></div><div id="panels"></div><div id="notes"></div><div id="stamps"></div><div id="kws"></div>
      <div id="cap"></div><div id="prog"><i></i></div>
      <div id="brandend"><b>DECRYPT BUSINESS</b><span>L'ÉCONOMIE EXPLIQUÉE</span></div>
      <div id="flash"></div>
      <audio id="vo" src="%AUD%" data-start="0" data-duration="%DUR%" data-track-index="1"></audio>
    </div>
    <script>window.__timelines["main"] = gsap.timeline({ paused: true });</script>
    <script type="module">
'''.replace("%DUR%", str(LEN)).replace("%OFF%", str(t0)).replace("%AUD%", AUD)
parts = [open(f"video/{n}.js").read() for n in ("engine", "world", "tail")]
parts[2] += "\n      window.__resolveModels && window.__resolveModels(true);\n"
open("video/index.html", "w").write(head + "".join(parts) + "    </script>\n  </body>\n</html>\n")
print("assembled", t0, t1, LEN)
