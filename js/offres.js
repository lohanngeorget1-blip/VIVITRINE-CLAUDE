// Rendu de la grille tarifaire et du tableau comparatif.
// -----------------------------------------------------------------------
// Les deux se construisent à partir de data/offres.js : un tarif ne se
// corrige qu'à un seul endroit. Chaque montant est enveloppé dans un
// élément masquable, que js/prix.js découvre une fois l'adresse laissée.

import { offres } from "../data/offres.js?v=23";

const coche = `<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7.4 5.4 10.8 12 3.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* Un montant : masqué tant que le visiteur n'a pas laissé son adresse.
   `aria-hidden` sur le leurre et un libellé de remplacement pour les
   lecteurs d'écran, qui ne doivent pas annoncer une suite de caractères
   sans signification. */
const montant = (v) =>
  `<span class="prix-masque"><span class="prix-valeur">${v}</span>` +
  `<span class="prix-leurre" aria-hidden="true">••• €</span></span>`;

export function initOffres() {
  const grille = document.querySelector(".offres-grille");
  if (grille) {
    grille.innerHTML = offres
      .map(
        (o) => `
    <article class="offre${o.avant ? " offre-mise-en-avant" : ""}${o.large ? " offre-large" : ""}">
      <div class="offre-tete">
        <span class="offre-nom">${o.nom}</span>
        ${o.marque ? `<span class="offre-marque">${o.marque}</span>` : ""}
      </div>
      ${o.prefixe ? `<p class="offre-prefixe">${o.prefixe}</p>` : ""}
      <p class="offre-prix">${montant(o.creation)}</p>
      ${o.sansAbo ? "" : `<p class="offre-abonnement">puis ${montant(o.abonnement)} <span>/ mois</span></p>`}
      <p class="offre-modalite">${o.modalite}</p>
      <p class="offre-resume">${o.resume}</p>
      <p class="offre-perimetre">${o.perimetre}</p>
      <ul class="offre-points">
        ${o.points.map((p) => `<li><span class="icone">${coche}</span><span>${p}</span></li>`).join("")}
      </ul>
      <a class="btn ${o.avant ? "btn-primaire" : "btn-contour"} btn-bloc" href="contact.html?offre=${o.cle}" data-magnetique="5">${o.action}</a>
      <p class="offre-pour">${o.pour}</p>
    </article>`
      )
      .join("");
  }
}
