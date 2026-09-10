// Le rail de lecture d'un chapitre.
// -----------------------------------------------------------------------
// Un chapitre se lit sur une colonne étroite : à droite, l'écran est vide.
// On y pose le sommaire du chapitre, qui suit la lecture et permet d'y
// revenir. Ce n'est pas un ornement — c'est ce qui dit combien il reste.
//
// Le rail est construit ici plutôt que dans le générateur : il se déduit
// des titres réellement présents, quelle que soit la façon dont la page
// est composée. Sans script, le chapitre reste entier et lisible.

export function initChapitre() {
  centrerSousNav();

  const blocs = [...document.querySelectorAll(".chapitre-bloc")];
  if (blocs.length < 3) return;
  // Sous 1240 px la colonne de texte occupe l'écran : pas de place, pas de rail.
  if (!window.matchMedia("(min-width: 1240px)").matches) return;

  const rail = document.createElement("nav");
  rail.className = "rail";
  rail.setAttribute("aria-label", "Sommaire du chapitre");

  const liens = blocs.map((bloc, i) => {
    const h = bloc.querySelector("h2");
    if (!h) return null;
    if (!bloc.id) bloc.id = "bloc-" + (i + 1);

    // Le repère est écrit pour être court ; le titre est une phrase et
    // ne tiendrait pas dans la marge.
    const court = bloc.querySelector(".chapitre-repere");
    const a = document.createElement("a");
    a.href = "#" + bloc.id;
    a.innerHTML = `<span class="rail-num">${String(i + 1).padStart(2, "0")}</span>`
                + `<span class="rail-titre">${(court || h).textContent.trim()}</span>`;
    rail.appendChild(a);
    return { a, bloc };
  }).filter(Boolean);

  if (liens.length < 3) return;

  const jauge = document.createElement("span");
  jauge.className = "rail-jauge";
  jauge.innerHTML = "<i></i>";
  rail.appendChild(jauge);
  document.body.appendChild(rail);

  const barre = jauge.querySelector("i");
  const fin = document.querySelector(".suite") || document.querySelector(".pied");

  // Le bloc en cours est le dernier dont le haut est passé sous le tiers
  // supérieur de l'écran : c'est celui qu'on est effectivement en train
  // de lire, pas celui qui vient d'apparaître en bas.
  let planifie = false;
  const suivre = () => {
    planifie = false;
    const seuil = window.innerHeight * 0.34;
    let actif = 0;
    liens.forEach(({ bloc }, i) => {
      if (bloc.getBoundingClientRect().top <= seuil) actif = i;
    });
    liens.forEach(({ a }, i) => a.classList.toggle("est-actif", i === actif));

    const premier = liens[0].bloc.getBoundingClientRect().top + window.scrollY;
    const dernier = liens[liens.length - 1].bloc;
    const bas = dernier.getBoundingClientRect().bottom + window.scrollY;
    const p = (window.scrollY + window.innerHeight * 0.34 - premier) / Math.max(1, bas - premier);
    barre.style.transform = `scaleY(${Math.max(0, Math.min(1, p)).toFixed(3)})`;

    // Visible seulement entre le premier bloc et le passage au chapitre
    // suivant : ailleurs, le rail se poserait sur un fond sombre.
    const commence = liens[0].bloc.getBoundingClientRect().top < window.innerHeight * 0.5;
    const termine = fin && fin.getBoundingClientRect().top < window.innerHeight * 0.8;
    rail.classList.toggle("est-visible", commence && !termine);
  };

  const surScroll = () => {
    if (planifie) return;
    planifie = true;
    requestAnimationFrame(suivre);
  };

  window.addEventListener("scroll", surScroll, { passive: true });
  window.addEventListener("resize", surScroll, { passive: true });
  suivre();
}

/* Sur un écran étroit, la sous-navigation défile : le chapitre en cours
   peut se trouver hors du cadre. On l'y ramène, sans toucher au
   défilement de la page. */
function centrerSousNav() {
  const piste = document.querySelector(".sous-nav-inner");
  const actif = piste?.querySelector(".sous-nav-liens a.est-actif");
  if (!piste || !actif || piste.scrollWidth <= piste.clientWidth) return;

  const cible = actif.offsetLeft - (piste.clientWidth - actif.offsetWidth) / 2;
  piste.scrollLeft = Math.max(0, cible);
}
