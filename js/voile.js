// Voile de chargement et transition entre les pages.
// -----------------------------------------------------------------------
// Le signe Vivitrine est découpé en tuiles : au départ d'une page elles
// s'écartent, à l'arrivée elles se remettent en place. La transition dure
// le temps du changement de page, pas davantage — on masque le blanc, on
// ne fait pas patienter.

const CLE = "vivitrine-intro";
const COLS = 4;
const RANGS = 4;
const SORTIE = 380;   // durée de la dislocation avant de changer de page

export function initVoile() {
  const voile = document.querySelector(".voile");
  if (!voile) return;

  const barre = voile.querySelector(".voile-barre-fill");
  const cap = voile.querySelector(".voile-cap");
  construireSigne(voile.querySelector(".voile-signe"));

  let premiere = true;
  try {
    premiere = sessionStorage.getItem(CLE) !== "1";
    sessionStorage.setItem(CLE, "1");
  } catch (_) {}

  voile.classList.toggle("est-intro", premiere);

  const masquer = () => {
    voile.classList.add("est-masque");
    voile.classList.remove("est-sortie");
    document.body.classList.remove("no-scroll");
  };

  const montrer = (destination) => {
    if (cap) cap.textContent = destination || "";
    voile.classList.remove("est-masque", "est-intro");
    voile.classList.add("est-sortie");
    document.body.classList.add("no-scroll");
  };

  if (premiere) {
    document.body.classList.add("no-scroll");
    let p = 0, cible = 0.4;
    const pas = () => {
      p += (cible - p) * 0.16;
      if (barre) barre.style.width = `${Math.min(p * 100, 100)}%`;
      if (p < 0.99) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);

    const polices = document.fonts?.ready ?? Promise.resolve();
    polices.then(() => (cible = 0.82));
    if (document.readyState === "complete") cible = 0.96;
    else window.addEventListener("load", () => (cible = 0.96), { once: true });

    Promise.race([
      Promise.all([polices, new Promise((r) => setTimeout(r, 500))]),
      new Promise((r) => setTimeout(r, 1600)),
    ]).then(() => {
      cible = 1;
      if (barre) barre.style.width = "100%";
      setTimeout(masquer, 180);
    });
  } else {
    // Navigation interne : on laisse les tuiles finir de se reposer.
    setTimeout(masquer, 420);
  }

  window.addEventListener("pageshow", (e) => e.persisted && masquer());

  const interne = (a) => {
    if (a.target === "_blank" || a.hasAttribute("download")) return false;
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
    return a.origin === window.location.origin;
  };

  document.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const a = e.target.closest("a[href]");
    if (!a || !interne(a) || a.pathname === window.location.pathname) return;
    e.preventDefault();
    montrer(a.dataset.cap || a.textContent.trim().slice(0, 26));
    setTimeout(() => (window.location.href = a.href), SORTIE);
  });
}

/* Découpe le signe en tuiles. Chacune porte sa direction de fuite : les
   fragments s'écartent depuis le centre, ceux du bord partent plus loin. */
function construireSigne(signe) {
  if (!signe) return;
  signe.style.setProperty("--cols", COLS);
  signe.style.setProperty("--rangs", RANGS);

  const l = 100 / COLS;
  const h = 100 / RANGS;
  let i = 0;

  for (let r = 0; r < RANGS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = document.createElement("span");
      t.className = "voile-tuile";
      t.style.left = `${c * l}%`;
      t.style.top = `${r * h}%`;
      t.style.width = `${l}%`;
      t.style.height = `${h}%`;
      // `background-position` en pourcentage cale la case sur la grille.
      t.style.backgroundPosition =
        `${(c / (COLS - 1)) * 100}% ${(r / (RANGS - 1)) * 100}%`;

      const dx = (c - (COLS - 1) / 2) / ((COLS - 1) / 2);
      const dy = (r - (RANGS - 1) / 2) / ((RANGS - 1) / 2);
      t.style.setProperty("--dx", (dx * 34).toFixed(1));
      t.style.setProperty("--dy", (dy * 30).toFixed(1));
      t.style.setProperty("--rot", (dx * 16 + dy * 8).toFixed(1));
      t.style.setProperty("--i", i++);

      signe.appendChild(t);
    }
  }
}
