import { initVoile } from "./voile.js?v=23";
import { initNav } from "./nav.js?v=23";
import { initMotion } from "./motion.js?v=23";
import { initHero } from "./hero.js?v=23";
import { initCreations } from "./creations.js?v=23";
import { initOrbite } from "./orbite.js?v=23";
import { initCadre } from "./cadre.js?v=23";
import { initChapitre } from "./chapitre.js?v=23";
import { initCarte } from "./carte.js?v=23";
import { initPrix } from "./prix.js?v=23";
import { initCompte } from "./compte.js?v=23";
import { initOffres } from "./offres.js?v=23";
import { initFaq } from "./faq.js?v=23";

document.documentElement.classList.remove("no-js");

// Chaque module sort immédiatement si sa section n'est pas sur la page :
// le même point d'entrée sert donc toutes les pages du site.
initVoile();
initNav();
initOffres();
initPrix();
initCompte();
initFaq();
initHero();
initCreations();
initOrbite();
initCadre();
initChapitre();
initCarte();
initMotion();

// Le titre du hero se lève une fois la page prête. setTimeout plutôt que
// rAF : rAF ne se déclenche pas si l'onglet démarre en arrière-plan.
setTimeout(() => document.querySelector(".hero-titre")?.classList.add("est-entre"), 60);

// L'année du pied de page. Elle était posée par un <script> inline, ce
// qui obligeait la CSP à autoriser le script inline — donc à laisser une
// porte ouverte à toute injection de script. Déplacée ici, la politique
// peut se limiter à « script-src 'self' ».
const annee = document.getElementById("annee");
if (annee) annee.textContent = String(new Date().getFullYear());
