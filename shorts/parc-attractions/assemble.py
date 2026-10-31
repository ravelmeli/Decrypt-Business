"""Assemble parc-attractions/video/index.html from the head template + engine.js + world.js + tail.js."""
import json
B = json.load(open("video/assets/beats.json")); DUR = B["dur"]
head = '''<!doctype html>
<html lang="fr" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Decrypt Business - Economie d'un parc d'attractions</title>
    <script src="assets/gsap.min.js"></script>
    <script src="assets/beats.js"></script>
    <script src="assets/words.js"></script>
    <script type="importmap">{ "imports": { "three": "./assets/three/three.module.js", "three/addons/": "./assets/three/addons/" } }</script>
    <style>
      @font-face { font-family: "DecryptInter"; src: url("assets/fonts/Inter-Black.otf"); font-weight: 900; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: #0b1230; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: "DecryptInter", Inter, sans-serif; font-weight: 900; color: #fff;
        background: linear-gradient(180deg, #090e2e 0%, #111a52 45%, #1b2a78 100%); }
      #gl, #fxg { position: absolute; inset: 0; width: 1080px; height: 1920px; display: block; }
      #fxg { mix-blend-mode: screen; filter: blur(22px) brightness(1.25) contrast(1.5); opacity: .34; }
      #vig { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(2,4,20,.55) 100%); pointer-events: none; }
      #leads, #notes, #panels, #stamps, #kws { position: absolute; inset: 0; pointer-events: none; }
      .lead { position: absolute; left: 0; top: 0; height: 0; border-top: 4px dashed #ffc93c; transform-origin: 0 50%; opacity: 0; }
      .lead.red { border-color: #ff5a5f; } .lead.blue { border-color: #4f8cff; } .lead.green { border-color: #35d07f; } .lead.white { border-color: #f4ecd8; }
      .note { position: absolute; left: 0; top: 0; padding: 12px 26px 14px; border-radius: 999px; font-size: 38px; letter-spacing: .02em; text-transform: uppercase; white-space: nowrap; opacity: 0; box-shadow: 0 8px 0 rgba(0,0,0,.28); }
      .note.gold { background: #ffc93c; color: #1a2160; } .note.red { background: #ff5a5f; color: #fff; } .note.blue { background: #4f8cff; color: #fff; }
      .note.green { background: #35d07f; color: #0f1546; } .note.white { background: #f4ecd8; color: #1a2160; }
      .kw { position: absolute; left: 0; right: 0; top: 140px; text-align: center; font-size: 168px; line-height: 1; letter-spacing: -.02em; text-transform: uppercase; opacity: 0; white-space: nowrap; text-shadow: 0 10px 0 rgba(0,0,0,.32); -webkit-text-stroke: 14px #0b1230; paint-order: stroke fill; }
      .kw.gold { color: #ffc93c; } .kw.red { color: #ff5a5f; } .kw.green { color: #35d07f; } .kw.blue { color: #6fa2ff; } .kw.white { color: #fff; }
      .stamp { position: absolute; left: 0; top: 0; padding: 10px 30px; border: 7px solid; border-radius: 16px; font-size: 52px; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; opacity: 0; background: rgba(10,16,50,.92); }
      .stamp.red { color: #ff5a5f; border-color: #ff5a5f; } .stamp.blue { color: #6fa2ff; border-color: #6fa2ff; } .stamp.gold { color: #ffc93c; border-color: #ffc93c; }
      .panel { position: absolute; left: 70px; right: 70px; border-radius: 40px; padding: 38px 40px 34px; background: rgba(12,18,60,.86); border: 3px solid rgba(255,201,60,.4); box-shadow: 0 24px 60px rgba(0,0,0,.45); opacity: 0; }
      .panel h4 { font-size: 40px; letter-spacing: .06em; text-transform: uppercase; color: #ffc93c; margin-bottom: 26px; } .panel h4 em { font-style: normal; color: #9fb3ff; font-size: 30px; }
      .sub { margin-top: 22px; font-size: 32px; color: #b8c4ff; letter-spacing: .02em; text-transform: uppercase; }
      .row { display: flex; align-items: center; gap: 18px; margin: 22px 0; } .lab { width: 290px; font-size: 32px; letter-spacing: .03em; color: #e6ebff; } .val { width: 120px; font-size: 42px; text-align: right; }
      .bar, .seg { display: block; height: 58px; border-radius: 14px; width: 0; } .row .bar { flex: 1 1 0; max-width: 520px; }
      .bar.gold, .seg.gold { background: #ffc93c; } .bar.blue, .seg.blue { background: #4f8cff; } .bar.red, .seg.red { background: #ff5a5f; } .bar.green, .seg.green { background: #35d07f; }
      .panel .bar.gold, .panel .seg.gold { color: #1a2160; }
      .stack { display: flex; width: 100%; height: 110px; border-radius: 20px; overflow: hidden; } .seg { height: 110px; border-radius: 0; display: flex; align-items: center; justify-content: center; } .seg b { font-size: 36px; white-space: nowrap; }
      .seg.gold b { color: #1a2160; } .seg.blue b { color: #fff; }
      .trio { display: flex; justify-content: space-between; gap: 18px; } .orb { flex: 1; text-align: center; border-radius: 28px; padding: 26px 10px 22px; transform: scale(0); } .orb b { display: block; font-size: 84px; line-height: 1; } .orb span { display: block; margin-top: 12px; font-size: 26px; text-transform: uppercase; letter-spacing: .03em; line-height: 1.2; }
      .orb.gold { background: #ffc93c; color: #1a2160; } .orb.blue { background: #4f8cff; color: #fff; } .orb.green { background: #35d07f; color: #0f1546; }
      .months { display: flex; gap: 8px; align-items: flex-end; height: 190px; } .mo { flex: 1; background: #4f8cff; border-radius: 10px 10px 0 0; height: 90px; display: flex; align-items: flex-end; justify-content: center; opacity: 0; transform-origin: bottom; } .mo.hot { background: #ffc93c; height: 190px; } .mo b { font-size: 26px; color: #0f1546; padding-bottom: 6px; }
      .big85 { margin-top: 26px; font-size: 38px; color: #e6ebff; text-transform: uppercase; letter-spacing: .03em; } .big85 b { color: #ffc93c; font-size: 60px; }
      .duo { display: flex; gap: 22px; } .arrow { flex: 1; border-radius: 28px; padding: 26px 14px; text-align: center; transform: scale(0); } .arrow b { display: block; font-size: 120px; line-height: 1; } .arrow span { display: block; font-size: 28px; text-transform: uppercase; letter-spacing: .03em; margin-top: 6px; line-height: 1.2; }
      .arrow.red { background: #ff5a5f; color: #fff; } .arrow.green { background: #35d07f; color: #0f1546; }
      #cap { position: absolute; left: 40px; right: 40px; top: 1420px; text-align: center; font-size: 66px; line-height: 1.25; text-transform: uppercase; letter-spacing: .01em; opacity: 0; text-shadow: 0 5px 0 rgba(0,0,0,.4), 0 0 14px rgba(0,0,0,.5); }
      #cap span { display: inline-block; padding: 0 12px; margin: 0 2px; border-radius: 14px; } #cap .next { opacity: .45; } #cap .past { opacity: 1; } #cap .on { background: #ffc93c; color: #1a2160; transform: rotate(-2.5deg) scale(1.05); text-shadow: none; opacity: 1; }
      #prog { position: absolute; left: 60px; right: 60px; bottom: 150px; height: 5px; background: rgba(255,255,255,.18); border-radius: 3px; } #prog i { display: block; height: 100%; width: 0; background: #ffc93c; border-radius: 3px; }
      #brandend { position: absolute; left: 0; right: 0; top: 620px; text-align: center; opacity: 0; } #brandend b { display: block; font-size: 120px; letter-spacing: .04em; color: #ffc93c; text-shadow: 0 10px 0 rgba(0,0,0,.35); } #brandend span { display: block; margin-top: 14px; font-size: 40px; letter-spacing: .4em; color: #e6ebff; }
      #flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="%DUR%" data-width="1080" data-height="1920" data-fps="60">
      <canvas id="gl" width="1080" height="1920"></canvas><canvas id="fxg" width="270" height="480"></canvas>
      <div id="vig"></div><div id="leads"></div><div id="panels"></div><div id="notes"></div><div id="stamps"></div><div id="kws"></div>
      <div id="cap"></div><div id="prog"><i></i></div>
      <div id="brandend"><b>DECRYPT BUSINESS</b><span>L'ÉCONOMIE EXPLIQUÉE</span></div>
      <div id="flash"></div>
      <audio id="vo" src="assets/mix.wav" data-start="0" data-duration="%DUR%" data-track-index="1"></audio>
    </div>
    <script>window.__timelines["main"] = gsap.timeline({ paused: true });</script>
    <script type="module">
'''.replace("%DUR%", str(DUR))
parts = [open(f"video/{n}.js").read() for n in ("engine", "world", "tail")]
open("video/index.html", "w").write(head + "".join(parts) + "    </script>\n  </body>\n</html>\n")
print("assembled", DUR)
