"""Assemble fast-food-franchise/video/index.html from the shared v5 template (head/CSS), the shared 3D prelude and scenes.js."""
import re
G = "grue-de-chantier/video-v5"
tpl = open(f"{G}/index.html").read()
mod = open(f"{G}/module.js").read()
head = tpl[: tpl.index("<script>\n      const tl = gsap.timeline")]
marker = "      /* =====================================================================\n         DIORAMAS"
prelude = mod[: mod.index(marker)]
scenes = open("fast-food-franchise/video/scenes.js").read()
head = head.replace("Economie de la grue de chantier", "Economie d'un fast-food en franchise")
head = head.replace("60.32", "70.2")
head = head.replace(".hl em { font-style: normal; color: #7b5cf0; }", ".hl em { font-style: normal; color: #5b3fd0; }")
head = head.replace('<div id="caps"></div>', '<div class="cap" id="cap"></div>')
head = head.replace('<div id="srcs"></div>', '<div id="srcs"></div>')
classic = '''<script>
      const tl = gsap.timeline({ paused: true });
      const HL = [
        [0.0, 4.7, "100 € de burgers,<br><em>5 à 10 €</em> pour lui", "sm"],
        [4.9, 8.4, "Salle pleine,<br><em>file dehors</em>", ""],
        [8.6, 13.9, "Marge nette :<br><em>5 à 10 %</em>", ""],
        [14.0, 16.2, "Suivons<br><em>l'argent</em>", ""],
        [16.4, 23.7, "Droit d'entrée<br><em>+ apport</em>", "green"],
        [23.9, 28.8, "La marque<br><em>se sert d'abord</em>", "red"],
        [29.0, 36.0, "Redevance<br><em>+ marketing</em>", "red"],
        [36.2, 40.5, "Loyer fixé<br>pour <em>20 ans</em>", "red"],
        [40.6, 46.8, "Ingrédients<br>+ <em>équipes</em>", "red"],
        [46.9, 49.4, "Il reste<br><em>quelques euros</em>", "green"],
        [49.6, 54.3, "La marque touche<br><em>sur chaque vente</em>", "red"],
        [54.5, 58.7, "Le risque reste<br>au <em>franchisé</em>", "red"],
        [58.9, 66.3, "Un restaurant,<br>un <em>contrat</em>", ""],
        [66.5, 70.2, "La caisse<br><em>n'est pas la poche</em>", "sm"],
      ];
      const hlRoot = document.getElementById("hls");
      HL.forEach(([a, b, html, cls], i) => {
        const d = document.createElement("div"); d.className = "hl " + cls; d.innerHTML = html; hlRoot.appendChild(d);
        if (i === 0) { tl.set(d, { opacity: 1, y: 0 }, 0); tl.fromTo(d, { scale: 1.18 }, { scale: 1, duration: 0.45, ease: "back.out(2.2)" }, 0); } else tl.fromTo(d, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.6)" }, a);
        if (i < HL.length - 1) tl.to(d, { opacity: 0, y: -24, duration: 0.3, ease: "power1.in" }, b - 0.3);
      });
      const srcRoot = document.getElementById("srcs");
      [[9.0, 13.5, "Ordres de grandeur : Toute la Franchise · AC Franchise"], [17.0, 23.5, "Sources : L'Expert-comptable · Copeps · Toute la Franchise"], [29.5, 35.8, "Source : McDonald's UK, page officielle des chiffres"], [36.5, 40.3, "Source : McDonald's UK"], [41.0, 46.5, "Ordres de grandeur : Toute la Franchise · AC Franchise"]].forEach(([a, b, txt]) => {
        const d = document.createElement("div"); d.className = "src"; d.textContent = txt; srcRoot.appendChild(d);
        tl.to(d, { opacity: 0.8, duration: 0.4 }, a); tl.to(d, { opacity: 0, duration: 0.4 }, b);
      });
      window.__timelines["main"] = tl;
    </script>
    <script type="module">
'''
extra = "      const whiteC = new THREE.Color(P.white), lavC = new THREE.Color('#c9b8f7');\n"
out = head + classic + prelude + extra + scenes + "    </script>\n  </body>\n</html>\n"
open("fast-food-franchise/video/index.html", "w").write(out)
print("assembled", len(out))
