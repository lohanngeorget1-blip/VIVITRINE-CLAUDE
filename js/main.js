import { initVoile } from "./voile.js?v=21";
import { initNav } from "./nav.js?v=21";
import { initMotion } from "./motion.js?v=21";
import { initHero } from "./hero.js?v=21";
import { initCreations } from "./creations.js?v=21";
import { initVagues } from "./vagues.js?v=21";
import { initOrbite } from "./orbite.js?v=21";
import { initOffres } from "./offres.js?v=21";
import { initFaq } from "./faq.js?v=21";

document.documentElement.classList.remove("no-js");

// Chaque module sort immédiatement si sa section n'est pas sur la page :
// le même point d'entrée sert donc toutes les pages du site.
initVoile();
initNav();
initOffres();
initFaq();
initHero();
initCreations();
initVagues();
initOrbite();
initMotion();

// Le titre du hero se lève une fois la page prête. setTimeout plutôt que
// rAF : rAF ne se déclenche pas si l'onglet démarre en arrière-plan.
setTimeout(() => document.querySelector(".hero-titre")?.classList.add("est-entre"), 60);
