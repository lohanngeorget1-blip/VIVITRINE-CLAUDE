import { offres } from "../data/offres.js?v=21";

const coche = `<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7.4 5.4 10.8 12 3.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function initOffres() {
  const grille = document.querySelector(".offres-grille");
  if (!grille) return;

  grille.innerHTML = offres
    .map(
      (o) => `
    <article class="offre${o.avant ? " offre-mise-en-avant" : ""}">
      <div class="offre-tete">
        <span class="offre-nom">${o.nom}</span>
        ${o.marque ? `<span class="offre-marque">${o.marque}</span>` : ""}
      </div>
      <p class="offre-prix">${o.prix}</p>
      <p class="offre-modalite">${o.modalite}</p>
      <p class="offre-resume">${o.resume}</p>
      <p class="offre-perimetre">${o.perimetre}</p>
      <ul class="offre-points">
        ${o.points.map((p) => `<li><span class="icone">${coche}</span><span>${p}</span></li>`).join("")}
      </ul>
      <a class="btn ${o.avant ? "btn-primaire" : "btn-contour"} btn-bloc" href="contact.html" data-magnetique="5">${o.action}</a>
    </article>`
    )
    .join("");
}
