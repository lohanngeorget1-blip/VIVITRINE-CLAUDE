// Moteur de mouvement du site.
// -----------------------------------------------------------------------
// Un seul module alimente toutes les micro-interactions : apparitions au
// scroll, position du curseur, parallaxe, boutons magnétiques, jauge de
// et jauge de lecture. Tout passe par des variables CSS, ce qui
// laisse la mise en forme dans les feuilles de style et garde ici la seule
// logique de mesure.
//
// Une seule boucle rAF sert l'ensemble, et elle ne tourne que si quelque
// chose a bougé : au repos, le site ne consomme rien.

const reduit = window.matchMedia("(prefers-reduced-motion: reduce)");
const finPointeur = window.matchMedia("(hover: hover) and (pointer: fine)");

const lerp = (a, b, t) => a + (b - a) * t;
const borne = (v, min, max) => Math.max(min, Math.min(max, v));

/* -------------------------------------------------- apparitions au scroll */
function initApparitions() {
  const cibles = document.querySelectorAll("[data-reveal]");
  if (!cibles.length) return;

  if (reduit.matches || !("IntersectionObserver" in window)) {
    cibles.forEach((el) => el.classList.add("is-in"));
    return;
  }

  // Les éléments d'un même groupe arrivent en vague plutôt que d'un bloc.
  const groupes = new Map();
  cibles.forEach((el) => {
    const g = el.dataset.revealGroup;
    if (!g) return;
    if (!groupes.has(g)) groupes.set(g, []);
    groupes.get(g).push(el);
  });
  groupes.forEach((els) =>
    els.forEach((el, i) =>
      el.style.setProperty("--reveal-delay", `${Math.min(i * 0.06, 0.36)}s`)
    )
  );

  const obs = new IntersectionObserver(
    (entrees, o) => {
      entrees.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        o.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  cibles.forEach((el) => obs.observe(el));
}

/* ------------------------------------------------------ curseur global */
function initCurseur() {
  if (!finPointeur.matches || reduit.matches) return;
  const racine = document.documentElement;
  let viseX = 0, viseY = 0, x = 0, y = 0, actif = false;

  window.addEventListener(
    "pointermove",
    (e) => {
      viseX = (e.clientX / window.innerWidth) * 2 - 1;
      viseY = (e.clientY / window.innerHeight) * 2 - 1;
      if (!actif) { actif = true; boucle(); }
    },
    { passive: true }
  );

  function boucle() {
    x = lerp(x, viseX, 0.08);
    y = lerp(y, viseY, 0.08);
    racine.style.setProperty("--mx", x.toFixed(4));
    racine.style.setProperty("--my", y.toFixed(4));
    if (Math.abs(viseX - x) > 0.001 || Math.abs(viseY - y) > 0.001) {
      requestAnimationFrame(boucle);
    } else {
      actif = false;
    }
  }
}

/* ------------------------------------------------------ boutons magnétiques */
function initMagnetiques() {
  if (!finPointeur.matches || reduit.matches) return;
  document.querySelectorAll("[data-magnetique]").forEach((el) => {
    const force = Number(el.dataset.magnetique) || 6;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--pull-x", `${((e.clientX - r.left) / r.width - 0.5) * force}px`);
      el.style.setProperty("--pull-y", `${((e.clientY - r.top) / r.height - 0.5) * force}px`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--pull-x", "0px");
      el.style.setProperty("--pull-y", "0px");
    });
  });
}

/* ---------------------------------------- parallaxe et jauge de lecture */
function initScroll() {
  const parallaxes = Array.from(document.querySelectorAll("[data-parallax]"));
  const jauge = document.querySelector(".nav-jauge");
  const navbar = document.querySelector(".navbar");

  let dernier = window.scrollY;
  let planifie = false;

  const mesurer = () => {
    planifie = false;
    const y = window.scrollY;
    const delta = y - dernier;
    dernier = y;

    // Jauge de progression de lecture.
    if (jauge) {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      jauge.style.setProperty("--progres", total > 0 ? borne(y / total, 0, 1).toFixed(4) : 0);
    }

    // La barre s'escamote quand on descend franchement, revient dès qu'on remonte.
    if (navbar) {
      navbar.classList.toggle("est-defile", y > 8);
      navbar.classList.toggle("est-cachee", delta > 4 && y > 260 && !document.body.classList.contains("menu-ouvert"));
    }

    if (reduit.matches) return;

    // Parallaxe : quelques pixels, proportionnels à la position dans l'écran.
    const h = window.innerHeight;
    parallaxes.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > h + 200) return;
      const centre = (r.top + r.height / 2 - h / 2) / h; // -1 → 1
      const amp = Number(el.dataset.parallax) || 24;
      el.style.setProperty("--shift", `${(-centre * amp).toFixed(1)}px`);
    });
  };

  const surScroll = () => {
    if (planifie) return;
    planifie = true;
    requestAnimationFrame(mesurer);
  };

  window.addEventListener("scroll", surScroll, { passive: true });
  window.addEventListener("resize", surScroll, { passive: true });
  mesurer();
}

export function initMotion() {
  initApparitions();
  initCurseur();
  initMagnetiques();
  initScroll();
}
