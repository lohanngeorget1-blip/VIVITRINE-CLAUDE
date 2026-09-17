// Espace client Vivitrine — couche d'accès au compte.
// -----------------------------------------------------------------------
// CE MODULE N'AUTHENTIFIE PERSONNE. Un site statique n'a ni session, ni
// base, ni moyen de vérifier quoi que ce soit : l'authentification se fait
// forcément côté serveur. Ce fichier est l'adaptateur qui attend ce
// serveur, et l'interface complète qui va avec.
//
// Deux règles tenues strictement :
//   1. aucun mot de passe n'est jamais écrit dans localStorage, dans un
//      cookie, ni dans une URL ; il ne fait que transiter vers l'API ;
//   2. tant que `API` vaut null, le formulaire est désactivé et le dit.
//      Il ne simule pas une connexion réussie — laisser croire à un
//      visiteur qu'il est connecté alors que rien ne l'authentifie serait
//      un mensonge, et l'habituerait à taper son mot de passe dans un
//      formulaire qui ne mène nulle part.
//
// ----------------------------------------------------------------------
// CONTRAT ATTENDU DU BACKEND (à implémenter côté serveur)
//
//   POST {API}/auth/connexion
//        → { email, motDePasse }
//        ← 200 { jeton, expire, client: { nom, entreprise, offre } }
//        ← 401 { message }
//
//   POST {API}/auth/lien-connexion
//        → { email }
//        ← 204   (envoie un lien à usage unique, valable ~15 min)
//
//   GET  {API}/client/moi          en-tête : Authorization: Bearer <jeton>
//        ← 200 { nom, entreprise, offre, site, backend, statut, factures }
//        ← 401 (jeton expiré → renvoyer vers lien-expire.html)
//
//   POST {API}/auth/deconnexion    en-tête : Authorization: Bearer <jeton>
//        ← 204
//
// Le jeton doit être court (≤ 24 h) et renouvelable. Idéalement, servir
// un cookie httpOnly + SameSite=Strict plutôt qu'un jeton en JavaScript :
// remplacer alors `jeton()` par des requêtes en `credentials: "include"`.
// ----------------------------------------------------------------------

import { API } from "./config.js?v=23";

const CLE_JETON = "vivitrine-jeton";

/* --- jeton ---------------------------------------------------------- */
export function jeton() {
  try { return sessionStorage.getItem(CLE_JETON); } catch (_) { return null; }
}
function poserJeton(v) {
  // sessionStorage plutôt que localStorage : le jeton meurt à la
  // fermeture de l'onglet, ce qui limite la casse sur un poste partagé.
  try { v ? sessionStorage.setItem(CLE_JETON, v) : sessionStorage.removeItem(CLE_JETON); } catch (_) {}
}

/* --- appels ---------------------------------------------------------- */
async function appel(chemin, options = {}) {
  if (!API) throw new Error("hors-ligne");
  const entetes = { "Content-Type": "application/json", ...(options.headers || {}) };
  const j = jeton();
  if (j) entetes.Authorization = `Bearer ${j}`;
  const r = await fetch(`${API}${chemin}`, { ...options, headers: entetes });
  return r;
}

export async function connecter(email, motDePasse) {
  const r = await appel("/auth/connexion", {
    method: "POST",
    body: JSON.stringify({ email, motDePasse }),
  });
  if (r.status === 401) return { ok: false, message: "Adresse ou mot de passe incorrect." };
  if (!r.ok) return { ok: false, message: "Le service est momentanément indisponible." };
  const data = await r.json();
  poserJeton(data.jeton);
  return { ok: true, client: data.client };
}

export async function demanderLien(email) {
  const r = await appel("/auth/lien-connexion", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  // On répond pareil que l'adresse existe ou non : révéler qu'un compte
  // existe renseignerait un attaquant sur la clientèle du studio.
  return { ok: r.ok || r.status === 204 };
}

export async function profil() {
  const r = await appel("/client/moi");
  if (r.status === 401) { poserJeton(null); return { ok: false, expire: true }; }
  if (!r.ok) return { ok: false };
  return { ok: true, client: await r.json() };
}

export async function deconnecter() {
  try { await appel("/auth/deconnexion", { method: "POST" }); } catch (_) {}
  poserJeton(null);
}

/* --- interface ------------------------------------------------------- */

export function initCompte() {
  const form = document.querySelector("[data-connexion]");
  const espace = document.querySelector("[data-espace-client]");
  if (form) monterConnexion(form);
  if (espace) monterEspace(espace);
}

function monterConnexion(form) {
  const avis = form.querySelector("[data-avis]");
  const lienBouton = form.querySelector("[data-lien-connexion]");

  if (!API) {
    // Le backend n'existe pas encore : on neutralise le formulaire au lieu
    // de récolter un mot de passe qui n'irait nulle part.
    form.querySelectorAll("input, button").forEach((el) => (el.disabled = true));
    form.classList.add("est-hors-service");
    if (avis) {
      avis.className = "avis est-attention";
      avis.innerHTML =
        "<strong>Espace client en préparation.</strong> La connexion sera ouverte " +
        "dès la mise en service de notre serveur. En attendant, écrivez à " +
        '<a href="mailto:lohann@vivitrine.fr">lohann@vivitrine.fr</a> : ' +
        "nous vous transmettons vos accès à la main.";
    }
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.querySelector('[name="email"]').value.trim();
    const mdp = form.querySelector('[name="motdepasse"]').value;
    const bouton = form.querySelector('button[type="submit"]');

    avis.className = "avis";
    avis.textContent = "";
    bouton.disabled = true;
    bouton.textContent = "Connexion…";

    const r = await connecter(email, mdp);
    if (r.ok) { window.location.href = "espace-client.html"; return; }

    avis.className = "avis est-erreur";
    avis.textContent = r.message;
    bouton.disabled = false;
    bouton.textContent = "Se connecter";
    form.querySelector('[name="motdepasse"]').value = "";
  });

  if (lienBouton) {
    lienBouton.addEventListener("click", async () => {
      const email = form.querySelector('[name="email"]').value.trim();
      if (!email) { form.querySelector('[name="email"]').focus(); return; }
      lienBouton.disabled = true;
      await demanderLien(email);
      avis.className = "avis est-succes";
      avis.textContent =
        "Si un compte est associé à cette adresse, un lien de connexion vient d'être envoyé. Il est valable 15 minutes.";
    });
  }
}

async function monterEspace(espace) {
  const contenu = espace.querySelector("[data-contenu]");
  const chargement = espace.querySelector("[data-chargement]");

  const afficherHorsService = (titre, texte) => {
    chargement.hidden = true;
    contenu.hidden = false;
    espace.querySelector("[data-tableau]").hidden = true;
    const a = espace.querySelector("[data-avis]");
    a.className = "avis est-attention";
    a.innerHTML = `<strong>${titre}</strong> ${texte}`;
  };

  if (!API) {
    afficherHorsService(
      "Espace client en préparation.",
      "Le serveur Vivitrine n'est pas encore en service : le tableau de bord ci-dessous " +
      "montre ce que vous y trouverez. Vos accès vous seront transmis par e-mail à l'ouverture."
    );
    espace.querySelector("[data-tableau]").hidden = false;
    espace.querySelector("[data-tableau]").classList.add("est-apercu");
    return;
  }

  if (!jeton()) { window.location.href = "connexion.html"; return; }

  const r = await profil();
  if (!r.ok) {
    window.location.href = r.expire ? "lien-expire.html" : "connexion.html";
    return;
  }

  chargement.hidden = true;
  contenu.hidden = false;
  remplir(espace, r.client);

  espace.querySelector("[data-deconnexion]")?.addEventListener("click", async () => {
    await deconnecter();
    window.location.href = "connexion.html";
  });
}

/* Remplit le tableau de bord. `textContent` partout : ces valeurs viennent
   du serveur, on ne les injecte jamais comme du HTML. */
function remplir(espace, c) {
  const poser = (cle, valeur) => {
    const el = espace.querySelector(`[data-champ="${cle}"]`);
    if (el && valeur) el.textContent = valeur;
  };
  poser("nom", c.nom);
  poser("entreprise", c.entreprise);
  poser("offre", c.offre);
  poser("statut", c.statut);

  const lien = espace.querySelector("[data-champ=\"backend\"]");
  if (lien && c.backend) { lien.href = c.backend; lien.textContent = c.backend; lien.removeAttribute("aria-disabled"); }

  const site = espace.querySelector("[data-champ=\"site\"]");
  if (site && c.site) { site.href = c.site; site.textContent = c.site; }
}
