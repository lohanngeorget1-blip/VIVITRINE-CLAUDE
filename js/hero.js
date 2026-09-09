// HERO — le plan tourne en boucle, les phrases tournent avec lui.
// -----------------------------------------------------------------------
// Le montage vidéo contient déjà l'aller puis le retour : un simple `loop`
// suffit donc à obtenir la boucle infinie « normal → inverse → normal »
// sans coupure ni redémarrage visible. Le rôle du script se limite à trois
// choses : garantir le démarrage automatique même quand le navigateur le
// refuse, relier la jauge à l'avancement du plan, et faire tourner les
// phrases du titre.

export function initHero() {
  initPlan();
  initPhrases();
}

/* ------------------------------------------------------------- le plan */
function initPlan() {
  const scene = document.querySelector(".hero-scene");
  if (!scene) return;

  const video = scene.querySelector(".hero-video");
  const secours = scene.querySelector(".hero-secours");
  const jauge = document.querySelector(".hero-jauge");
  if (!video) return;

  video.muted = true;      // indispensable pour que la lecture auto passe
  video.defaultMuted = true;
  video.playsInline = true;

  video.addEventListener("error", () => {
    video.style.display = "none";
    if (secours) secours.style.display = "grid";
  });

  const lancer = () => {
    const p = video.play();
    if (p && typeof p.catch === "function") {
      // Si le navigateur refuse malgré tout, la première interaction relance.
      p.catch(() => {
        const relance = () => {
          video.play().catch(() => {});
          document.removeEventListener("pointerdown", relance);
        };
        document.addEventListener("pointerdown", relance, { once: true });
      });
    }
  };

  if (video.readyState >= 2) lancer();
  else video.addEventListener("loadeddata", lancer, { once: true });

  // Un onglet remis au premier plan reprend là où il en était.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) lancer();
  });

  // La jauge suit le plan : elle se remplit à l'aller, se vide au retour.
  // Le montage étant symétrique, la moitié de la durée marque le demi-tour.
  if (!jauge) return;
  const suivre = () => {
    const d = video.duration;
    if (d) {
      const t = video.currentTime / d;
      const lecture = t <= 0.5 ? t * 2 : (1 - t) * 2;
      jauge.style.setProperty("--lecture", lecture.toFixed(4));
    }
    requestAnimationFrame(suivre);
  };
  requestAnimationFrame(suivre);
}

/* --------------------------------------------------------- les phrases */
function initPhrases() {
  const zone = document.querySelector(".hero-rotatif");
  if (!zone) return;

  let phrases;
  try {
    phrases = JSON.parse(zone.dataset.phrases || "[]");
  } catch (_) {
    phrases = [];
  }
  if (!phrases.length) return;

  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Chaque mot est un élément à part : ils montent en léger décalé, ce qui
  // donne son grain au changement de phrase.
  const fabriquer = (texte) => {
    const el = document.createElement("span");
    el.className = "hero-phrase entre";
    texte.split(" ").forEach((mot, i) => {
      const m = document.createElement("span");
      m.className = "mot";
      m.style.setProperty("--i", i);
      m.textContent = mot;
      el.appendChild(m);
    });
    return el;
  };

  let i = 0;
  let actuelle = fabriquer(phrases[0]);
  zone.appendChild(actuelle);
  requestAnimationFrame(() => {
    actuelle.classList.remove("entre");
    actuelle.classList.add("presente");
  });

  if (reduit || phrases.length < 2) return;

  setInterval(() => {
    const sortante = actuelle;
    i = (i + 1) % phrases.length;
    const entrante = fabriquer(phrases[i]);
    zone.appendChild(entrante);

    // La sortante part d'abord, l'entrante arrive un souffle après : les
    // deux formulations ne se superposent jamais franchement.
    requestAnimationFrame(() => {
      sortante.classList.remove("presente");
      sortante.classList.add("sort");
    });
    setTimeout(() => {
      entrante.classList.remove("entre");
      entrante.classList.add("presente");
    }, 190);

    actuelle = entrante;
    setTimeout(() => sortante.remove(), 900);
  }, 3800);
}
