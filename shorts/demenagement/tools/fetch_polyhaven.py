"""Download CC0 Poly Haven models (glTF, 1k textures) into assets/models/<id>/ and record licences in CREDITS.md."""
import json, os, sys, urllib.request
OUT = sys.argv[1]; IDS = sys.argv[2:]
UA = {"User-Agent": "Mozilla/5.0 (decrypt-business asset fetch)"}
def get(url): return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
info = json.load(open("/tmp/ph_models.json"))
rows = []
for mid in IDS:
    fj = json.loads(get(f"https://api.polyhaven.com/files/{mid}"))
    g = fj["gltf"].get("1k") or fj["gltf"]["2k"]; g = g["gltf"]
    d = os.path.join(OUT, mid); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, os.path.basename(g["url"])), "wb").write(get(g["url"]))
    for rel, f in (g.get("include") or {}).items():
        p = os.path.join(d, rel); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, "wb").write(get(f["url"]))
    sz = sum(os.path.getsize(os.path.join(r, x)) for r, _, fs in os.walk(d) for x in fs)
    a = info.get(mid, {}); rows.append((mid, a.get("name", mid), ", ".join(a.get("authors", {}).keys()) if isinstance(a.get("authors"), dict) else "", sz))
    print(mid, round(sz / 1e6, 2), "MB", flush=True)
with open(os.path.join(OUT, "CREDITS.md"), "a") as f:
    for mid, name, au, sz in rows: f.write(f"- {name} (`{mid}`), Poly Haven, CC0 (public domain). Authors: {au}. https://polyhaven.com/a/{mid}\n")
