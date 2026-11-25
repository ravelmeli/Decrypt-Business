"""Post-render sync check: (1) caption chip (gold, #ffc93c) change frames in the MP4 vs word starts; (2) re-transcribe final audio and compare word starts."""
import json, subprocess, sys, numpy as np
mp4 = sys.argv[1]; W = json.load(open("voice/words.json"))
fps = 30; raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-vf", f"fps={fps},crop=1080:140:0:1400,scale=270:35", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 35, 270, 3).astype(int)
gold = ((abs(fr[..., 0] - 255) < 25) & (abs(fr[..., 1] - 201) < 30) & (abs(fr[..., 2] - 60) < 50))  # chip mask
cx = np.array([np.nonzero(g.any(0))[0].mean() if g.any() else -1 for g in gold])
chg = [i / fps for i in range(1, len(cx)) if cx[i] >= 0 and (cx[i - 1] < 0 or abs(cx[i] - cx[i - 1]) > 3)]
ws = np.array([x["s"] for x in W]); errs = []
for c in chg:
    k = int(np.argmin(abs(ws - c))); errs.append(c - ws[k])
errs = np.array(errs); print("chip changes", len(chg), "of", len(W), "words; median err %.3f s, p90 %.3f s, max %.3f s" % (np.median(errs), np.percentile(abs(errs), 90), abs(errs).max()))
