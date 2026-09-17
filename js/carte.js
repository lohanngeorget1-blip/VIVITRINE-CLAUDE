// Courbes de niveau.
// -----------------------------------------------------------------------
// Dessine, dans les zones marquées [data-isobathes], des boucles fermées
// irrégulières empilées les unes dans les autres — les isobathes d'une
// carte marine. La plus intérieure est remplie d'un aplat très pâle :
// c'est ce qui fait lire un relief plutôt qu'un empilement de traits.
//
// Les boucles sont générées plutôt que dessinées à la main : elles
// s'adaptent à la taille de la zone, et une graine fixe garantit qu'elles
// ne changent pas d'un chargement à l'autre.

const NS = "http://www.w3.org/2000/svg";
const NIVEAUX = 5;      // nombre de courbes emboîtées
const SOMMETS = 13;     // points par boucle

function alea(graine) {
  let s = graine;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

/* Boucle fermée et lisse : les points sont reliés par une spline
   Catmull-Rom refermée sur elle-même, donc aucun angle nulle part. */
function boucle(cx, cy, rx, ry, deforme, r) {
  const pts = [];
  for (let i = 0; i < SOMMETS; i++) {
    const a = (i / SOMMETS) * Math.PI * 2;
    const k = 1 + (r() - 0.5) * deforme;
    pts.push({ x: cx + Math.cos(a) * rx * k, y: cy + Math.sin(a) * ry * k });
  }

  const n = pts.length;
  const p = (i) => pts[((i % n) + n) % n];
  let d = `M ${p(0).x.toFixed(1)} ${p(0).y.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const c1 = { x: p(i).x + (p(i + 1).x - p(i - 1).x) / 6,
                 y: p(i).y + (p(i + 1).y - p(i - 1).y) / 6 };
    const c2 = { x: p(i + 1).x - (p(i + 2).x - p(i).x) / 6,
                 y: p(i + 1).y - (p(i + 2).y - p(i).y) / 6 };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}`
       + ` ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}`
       + ` ${p(i + 1).x.toFixed(1)} ${p(i + 1).y.toFixed(1)}`;
  }
  return d + " Z";
}

export function initCarte() {
  const zones = document.querySelectorAll("[data-isobathes]");
  if (!zones.length) return;

  zones.forEach((zone, index) => {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("preserveAspectRatio", "none");
    zone.appendChild(svg);

    const dessiner = () => {
      const l = zone.clientWidth;
      const h = zone.clientHeight;
      if (l < 40 || h < 40) return;

      svg.setAttribute("viewBox", `0 0 ${l} ${h}`);
      svg.innerHTML = "";

      // Une graine par zone : deux reliefs voisins ne se ressemblent pas.
      const r = alea(911 + index * 137);
      const cx = l * (0.28 + r() * 0.44);
      const cy = h * (0.3 + r() * 0.4);

      for (let n = 0; n < NIVEAUX; n++) {
        const part = 1 - n / NIVEAUX;
        const t = document.createElementNS(NS, "path");
        t.setAttribute("d", boucle(cx, cy, l * 0.34 * part, h * 0.42 * part, 0.3, r));
        if (n === NIVEAUX - 1) t.setAttribute("class", "est-fond");
        svg.appendChild(t);
      }
    };

    dessiner();

    let redim;
    window.addEventListener("resize", () => {
      clearTimeout(redim);
      redim = setTimeout(dessiner, 200);
    }, { passive: true });
  });
}
