"""Render the long video chapter by chapter (each chunk = one chapter, frame-exact), then concat + mux the full mix.
Usage: python3 render_chunks.py [first_chunk last_chunk]   (1-based, inclusive)"""
import json, os, subprocess, sys, time
B = json.load(open("video/assets/beats.json")); DUR = B["dur"]; FPS = 30
ch = json.load(open("voice/chapters.json"))
fr = lambda t: round(t * FPS) / FPS
bounds = [0.0] + [fr(c["start"] - 0.3) for c in ch[1:]] + [fr(DUR)]
os.makedirs("out", exist_ok=True)
a = int(sys.argv[1]) if len(sys.argv) > 2 else 1; b = int(sys.argv[2]) if len(sys.argv) > 2 else len(ch)
for k in range(a, b + 1):
    t0, t1 = bounds[k - 1], bounds[k]; out = f"out/ch{k:02d}.mp4"
    if os.path.exists(out): print("skip", out, flush=True); continue
    s = time.time(); print(f"== chunk {k}: {t0:.3f} -> {t1:.3f}", flush=True)
    subprocess.run(["python3", "assemble.py", str(t0), str(t1)], check=True)
    subprocess.run(["python3", "make_audio.py", str(t0), str(t1)], check=True)
    r = subprocess.run(["npx", "--yes", "hyperframes@0.8.183", "render", "-w", "3", "--fps", "30", "-o", f"../{out}.tmp.mp4"], cwd="video", capture_output=True, text=True)
    open(f"out/ch{k:02d}.log", "w").write(r.stdout + r.stderr)
    if r.returncode != 0 or not os.path.exists(out + ".tmp.mp4"): print("FAILED chunk", k, flush=True); sys.exit(1)
    os.rename(out + ".tmp.mp4", out); print(f"chunk {k} done in {(time.time() - s) / 60:.1f} min", flush=True)
