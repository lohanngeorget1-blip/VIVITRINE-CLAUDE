// Déroulé orbital du projet.
// -----------------------------------------------------------------------
// Portage en JavaScript natif du composant React « radial orbital
// timeline » : les étapes tournent autour d'un noyau, on en ouvre une
// pour la détailler, et les étapes voisines se signalent.
//
// Le balisage de départ est une liste ordonnée normale, lisible sans
// script et correctement indexée. Ce module ne la remplace que s'il peut
// réellement construire l'orbite — sinon la liste reste en place.

import { etapes } from "../data/etapes.js?v=21";

const RAYON = 0.36;      // rayon de l'orbite, en fraction de la largeur
const VITESSE = 0.05;    // degrés par image

export function initOrbite() {
  const zone = document.querySelector("[data-orbite]");
  if (!zone || !etapes.length) return;

  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const orbite = document.createElement("div");
  orbite.className = "orbite";

  const anneau = document.createElement("div");
  anneau.className = "orbite-anneau";
  orbite.appendChild(anneau);

  const noyau = document.createElement("div");
  noyau.className = "orbite-noyau";
  noyau.innerHTML = "<span>VIVITRINE</span>";
  orbite.appendChild(noyau);

  const aide = document.createElement("p");
  aide.className = "orbite-aide";
  aide.textContent = "Cliquez une étape pour la détailler";
  orbite.appendChild(aide);

  const jalons = etapes.map((etape, i) => {
    const jalon = document.createElement("div");
    jalon.className = "orbite-jalon";

    const pastille = document.createElement("button");
    pastille.type = "button";
    pastille.className = "orbite-pastille";
    pastille.textContent = String(i + 1).padStart(2, "0");
    pastille.setAttribute("aria-expanded", "false");
    pastille.setAttribute("aria-label", `Étape ${i + 1} : ${etape.titre}`);

    const titre = document.createElement("span");
    titre.className = "orbite-titre";
    titre.textContent = etape.titre;

    jalon.append(pastille, titre);
    orbite.appendChild(jalon);
    return { jalon, pastille, titre, etape, fiche: null };
  });

  zone.appendChild(orbite);
  zone.classList.add("est-orbite");

  let angle = 0;
  let ouvert = null;

  const dimensionner = () => {
    const r = orbite.getBoundingClientRect();
    const rayon = Math.min(r.width, r.height) * RAYON;
    anneau.style.width = anneau.style.height = `${rayon * 2}px`;
    return rayon;
  };

  let rayon = dimensionner();
  window.addEventListener("resize", () => { rayon = dimensionner(); }, { passive: true });

  const placer = () => {
    jalons.forEach(({ jalon }, i) => {
      const a = ((i / jalons.length) * 360 + angle) % 360;
      const rad = (a * Math.PI) / 180;
      const x = Math.cos(rad) * rayon;
      const y = Math.sin(rad) * rayon;
      jalon.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      // Les jalons du fond s'effacent légèrement : c'est ce qui donne
      // l'impression de profondeur sans perspective réelle.
      jalon.style.zIndex = ouvert === i ? 60 : Math.round(20 + 20 * Math.cos(rad));
      jalon.style.opacity = ouvert === i ? 1 : (0.45 + 0.55 * (1 + Math.sin(rad)) / 2).toFixed(2);
    });
  };

  const fermer = () => {
    jalons.forEach(({ jalon, pastille, fiche }, i) => {
      jalon.classList.remove("est-ouvert", "est-lie");
      pastille.setAttribute("aria-expanded", "false");
      if (fiche) { fiche.remove(); jalons[i].fiche = null; }
    });
    ouvert = null;
  };

  const ouvrir = (index) => {
    if (ouvert === index) { fermer(); return; }
    fermer();
    ouvert = index;

    const { jalon, pastille, etape } = jalons[index];
    jalon.classList.add("est-ouvert");
    pastille.setAttribute("aria-expanded", "true");

    // Les étapes voisines se signalent : on lit l'enchaînement.
    (etape.liees || []).forEach((n) => jalons[n - 1]?.jalon.classList.add("est-lie"));

    const fiche = document.createElement("div");
    fiche.className = "orbite-fiche";
    fiche.innerHTML = `
      <div class="orbite-fiche-tete">
        <span class="orbite-etat">Étape ${String(index + 1).padStart(2, "0")}</span>
        <span class="orbite-duree">${etape.duree}</span>
      </div>
      <h3>${etape.titre}</h3>
      <p>${etape.detail}</p>
      <div class="orbite-jauge">
        <div class="orbite-jauge-tete"><span>Avancement du projet</span><span>${etape.avancement}%</span></div>
        <div class="orbite-jauge-barre"><i style="width:0%"></i></div>
      </div>
      <p class="orbite-livrable"><b>Ce que vous recevez :</b> ${etape.livrable}</p>
      <div class="orbite-liens"></div>`;

    const liens = fiche.querySelector(".orbite-liens");
    (etape.liees || []).forEach((n) => {
      const voisin = etapes[n - 1];
      if (!voisin) return;
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = voisin.titre;
      b.addEventListener("click", (e) => { e.stopPropagation(); ouvrir(n - 1); });
      liens.appendChild(b);
    });

    jalon.appendChild(fiche);
    jalons[index].fiche = fiche;
    // setTimeout plutôt que requestAnimationFrame : rAF ne se déclenche
    // pas si l'onglet est en arrière-plan, la jauge resterait à zéro.
    setTimeout(() => {
      const barre = fiche.querySelector(".orbite-jauge-barre i");
      if (barre) barre.style.width = `${etape.avancement}%`;
    }, 40);

    // L'étape ouverte remonte en haut de l'orbite : la fiche retombe alors
    // au centre du cercle, jamais en dehors de la section.
    angle = 270 - (index / jalons.length) * 360;
    placer();
  };

  jalons.forEach(({ pastille }, i) =>
    pastille.addEventListener("click", (e) => { e.stopPropagation(); ouvrir(i); })
  );

  orbite.addEventListener("click", (e) => {
    if (e.target === orbite || e.target === anneau || e.target === noyau) fermer();
  });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") fermer(); });

  placer();

  if (reduit) return;

  // La rotation s'arrête tant qu'une étape est ouverte : on lit sans
  // que le contenu se dérobe.
  let visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entrees) => entrees.forEach((e) => (visible = e.isIntersecting)),
      { rootMargin: "80px" }
    ).observe(orbite);
  }

  const tourner = () => {
    if (visible && ouvert === null) {
      angle = (angle + VITESSE) % 360;
      placer();
    }
    requestAnimationFrame(tourner);
  };
  requestAnimationFrame(tourner);
}
