// Accès aux tarifs contre une adresse e-mail.
// -----------------------------------------------------------------------
// Les prix sont masqués jusqu'à ce que le visiteur laisse son adresse. Le
// masquage est purement visuel : tout est dans la page, donc consultable
// par qui sait ouvrir les outils du navigateur. C'est volontaire et c'est
// la seule chose qu'un site statique puisse faire — il s'agit de capter
// une piste commerciale, pas de protéger un secret.
//
// L'accès est retenu dans le navigateur du visiteur : il ne redemande pas
// l'adresse à chaque visite.

import { API, DUREE_ACCES_PRIX } from "./config.js?v=23";

const CLE = "vivitrine-acces-prix";

/* Validation volontairement souple : on écarte les fautes de frappe
   évidentes sans rejeter les adresses exotiques mais valides. */
const adresseValide = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function accesEnCours() {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return false;
    const { date } = JSON.parse(brut);
    const jours = (Date.now() - date) / 86400000;
    return jours < DUREE_ACCES_PRIX;
  } catch (_) {
    return false;
  }
}

function retenir(email) {
  try {
    localStorage.setItem(CLE, JSON.stringify({ email, date: Date.now() }));
  } catch (_) {
    /* navigation privée ou stockage refusé : l'accès ne durera que la page */
  }
}

/* Transmission de la piste. Sans backend configuré, l'adresse reste dans
   le navigateur du visiteur et n'arrive jamais au studio : on ouvre alors
   les tarifs quand même — refuser l'accès pour une raison technique
   n'aurait aucun sens — et on le signale au développeur. */
async function transmettre(email, origine) {
  if (!API) {
    console.warn(
      "[Vivitrine] Aucun backend configuré (js/config.js) : l'adresse « " +
      email + " » n'a été transmise nulle part."
    );
    return { transmis: false };
  }
  try {
    const r = await fetch(`${API}/pistes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, origine, page: location.pathname }),
    });
    return { transmis: r.ok };
  } catch (_) {
    return { transmis: false };
  }
}

export function initPrix() {
  const portes = document.querySelectorAll("[data-porte-prix]");
  if (!portes.length) return;

  const ouvrir = () => {
    document.body.classList.add("prix-ouverts");
    portes.forEach((p) => p.setAttribute("hidden", ""));
  };

  if (accesEnCours()) { ouvrir(); return; }

  portes.forEach((porte) => {
    const form = porte.querySelector("form");
    const champ = porte.querySelector('input[type="email"]');
    const erreur = porte.querySelector("[data-erreur]");
    if (!form || !champ) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = champ.value.trim();

      if (!adresseValide(email)) {
        erreur.textContent = "Cette adresse ne semble pas valide.";
        champ.setAttribute("aria-invalid", "true");
        champ.focus();
        return;
      }

      erreur.textContent = "";
      champ.removeAttribute("aria-invalid");
      const bouton = form.querySelector("button");
      if (bouton) { bouton.disabled = true; bouton.textContent = "Un instant…"; }

      retenir(email);
      await transmettre(email, porte.dataset.portePrix || "offres");
      ouvrir();
    });
  });
}
