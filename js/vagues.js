// Champ de vagues animé.
// -----------------------------------------------------------------------
// Une trame de lignes verticales déformée par un bruit simplex : la nappe
// ondule lentement d'elle-même et se creuse au passage du curseur, puis
// reprend sa forme. C'est le même principe que le composant React fourni,
// réécrit en JavaScript natif — le site n'a ni bundler ni dépendances, et
// le bruit est implémenté ici plutôt qu'importé.
//
// Les lignes sont volontairement espacées et très pâles : la trame doit se
// deviner, pas se lire. Trois d'entre elles portent les couleurs de la
// palette, le reste est en encre très transparente.

/* ------------------------------------------------------------ bruit 2D
   Simplex 2D, d'après l'algorithme de Ken Perlin (version simplifiée de
   Stefan Gustavson). Suffisant ici : on ne cherche qu'une ondulation
   organique, pas une texture exacte. */
function creerBruit2D(graine = 1337) {
    const perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    let s = graine;
    const alea = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(alea() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

    const grad = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;

    return (xin, yin) => {
        const s0 = (xin + yin) * F2;
        const i = Math.floor(xin + s0);
        const j = Math.floor(yin + s0);
        const t = (i + j) * G2;
        const x0 = xin - (i - t);
        const y0 = yin - (j - t);
        const i1 = x0 > y0 ? 1 : 0;
        const j1 = x0 > y0 ? 0 : 1;
        const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
        const ii = i & 255, jj = j & 255;
        let n = 0;
        const coin = (x, y, gi) => {
            let t0 = 0.5 - x * x - y * y;
            if (t0 < 0) return 0;
            t0 *= t0;
            const g = grad[gi % 8];
            return t0 * t0 * (g[0] * x + g[1] * y);
        };
        n += coin(x0, y0, perm[ii + perm[jj]]);
        n += coin(x1, y1, perm[ii + i1 + perm[jj + j1]]);
        n += coin(x2, y2, perm[ii + 1 + perm[jj + 1]]);
        return 70 * n;
    };
}

const NS = "http://www.w3.org/2000/svg";
const ECART_X = 34;
const ECART_Y = 30;

export function initVagues() {
    const zones = document.querySelectorAll("[data-vagues]");
    if (!zones.length) return;

    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)");
    const bruit = creerBruit2D();

    zones.forEach((zone) => monter(zone, bruit, reduit));
}

function monter(zone, bruit, reduit) {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("preserveAspectRatio", "none");
    zone.appendChild(svg);

    // Les couleurs viennent de la feuille de style : la nappe suit la
    // palette du site sans la redéclarer ici.
    const style = getComputedStyle(document.documentElement);
    const teintes = [
        style.getPropertyValue("--orange").trim() || "#ff4a0a",
        style.getPropertyValue("--bleu").trim() || "#1b3bd8",
        style.getPropertyValue("--vert").trim() || "#0e8f76",
    ];

    let lignes = [];
    let traces = [];
    let largeur = 0;
    let hauteur = 0;
    const souris = { x: -999, y: -999, px: -999, py: -999, vitesse: 0, angle: 0, posee: false };

    const construire = () => {
        const cadre = zone.getBoundingClientRect();
        largeur = Math.ceil(cadre.width);
        hauteur = Math.ceil(cadre.height);
        if (largeur < 2 || hauteur < 2) return;

        svg.setAttribute("viewBox", `0 0 ${largeur} ${hauteur}`);
        svg.style.width = "100%";
        svg.style.height = "100%";
        traces.forEach((t) => t.remove());
        traces = [];
        lignes = [];

        // On déborde volontairement du cadre : aucune ligne ne doit
        // s'arrêter net sur un bord, sinon la nappe paraît découpée.
        const colonnes = Math.ceil((largeur + 120) / ECART_X);
        const points = Math.ceil((hauteur + 120) / ECART_Y);
        const x0 = -60;
        const y0 = -60;

        for (let i = 0; i < colonnes; i++) {
            const serie = [];
            for (let j = 0; j < points; j++) {
                serie.push({
                    x: x0 + ECART_X * i,
                    y: y0 + ECART_Y * j,
                    ox: 0, oy: 0,          // décalage de vague
                    cx: 0, cy: 0,          // décalage du curseur
                    vx: 0, vy: 0,          // vitesse du décalage curseur
                });
            }
            const trace = document.createElementNS(NS, "path");
            trace.setAttribute("fill", "none");
            trace.setAttribute("stroke-width", "1");
            // une colonne sur onze prend une couleur de la palette
            const teinte = i % 11 === 3 ? teintes[0] : i % 11 === 7 ? teintes[1] : i % 11 === 0 ? teintes[2] : null;
            trace.setAttribute("stroke", teinte || "currentColor");
            trace.setAttribute("opacity", teinte ? "0.3" : "0.12");
            svg.appendChild(trace);
            traces.push(trace);
            lignes.push(serie);
        }
    };

    const deplacer = (temps) => {
        lignes.forEach((serie) => {
            serie.forEach((p) => {
                const onde = bruit((p.x + temps * 0.008) * 0.0028, (p.y + temps * 0.0035) * 0.0019) * 8;
                p.ox = Math.cos(onde) * 13;
                p.oy = Math.sin(onde) * 7;

                const dx = p.x - souris.x;
                const dy = p.y - souris.y;
                const dist = Math.hypot(dx, dy);
                const portee = Math.max(170, souris.vitesse);
                if (dist < portee) {
                    const part = 1 - dist / portee;
                    const force = Math.cos(dist * 0.001) * part;
                    p.vx += Math.cos(souris.angle) * force * portee * souris.vitesse * 0.00032;
                    p.vy += Math.sin(souris.angle) * force * portee * souris.vitesse * 0.00032;
                }
                p.vx += (0 - p.cx) * 0.012;
                p.vy += (0 - p.cy) * 0.012;
                p.vx *= 0.94;
                p.vy *= 0.94;
                p.cx = Math.max(-46, Math.min(46, p.cx + p.vx));
                p.cy = Math.max(-46, Math.min(46, p.cy + p.vy));
            });
        });
    };

    const dessiner = () => {
        lignes.forEach((serie, i) => {
            if (!traces[i] || serie.length < 2) return;
            let d = `M ${(serie[0].x + serie[0].ox).toFixed(1)} ${(serie[0].y + serie[0].oy).toFixed(1)}`;
            for (let k = 1; k < serie.length; k++) {
                const p = serie[k];
                d += `L ${(p.x + p.ox + p.cx).toFixed(1)} ${(p.y + p.oy + p.cy).toFixed(1)}`;
            }
            traces[i].setAttribute("d", d);
        });
    };

    // Le curseur n'agit que lorsque la nappe est à l'écran.
    let visible = false;
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(
            (entrees) => entrees.forEach((e) => (visible = e.isIntersecting)),
            { rootMargin: "120px" }
        ).observe(zone);
    } else {
        visible = true;
    }

    window.addEventListener("pointermove", (e) => {
        const cadre = zone.getBoundingClientRect();
        souris.x = e.clientX - cadre.left;
        souris.y = e.clientY - cadre.top;
        if (!souris.posee) { souris.px = souris.x; souris.py = souris.y; souris.posee = true; }
    }, { passive: true });

    let redim;
    window.addEventListener("resize", () => {
        clearTimeout(redim);
        redim = setTimeout(construire, 180);
    }, { passive: true });

    construire();

    if (reduit.matches) {
        deplacer(0);
        dessiner();
        return;
    }

    const battre = (temps) => {
        if (visible) {
            const dx = souris.x - souris.px;
            const dy = souris.y - souris.py;
            const d = Math.hypot(dx, dy);
            souris.vitesse += (d - souris.vitesse) * 0.1;
            souris.vitesse = Math.min(100, souris.vitesse);
            souris.angle = Math.atan2(dy, dx);
            souris.px = souris.x;
            souris.py = souris.y;

            deplacer(temps);
            dessiner();
        }
        requestAnimationFrame(battre);
    };
    requestAnimationFrame(battre);
}
