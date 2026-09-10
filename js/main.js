import { initVoile } from "./voile.js?v=22";
import { initNav } from "./nav.js?v=22";
import { initMotion } from "./motion.js?v=22";
import { initHero } from "./hero.js?v=22";
import { initCreations } from "./creations.js?v=22";
import { initVagues } from "./vagues.js?v=22";
import { initOrbite } from "./orbite.js?v=22";
import { initCadre } from "./cadre.js?v=22";
import { initChapitre } from "./chapitre.js?v=22";
import { initOffres } from "./offres.js?v=22";
import { initFaq } from "./faq.js?v=22";

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
initCadre();
initChapitre();
initMotion();

// Le titre du hero se lève une fois la page prête. setTimeout plutôt que
// rAF : rAF ne se déclenche pas si l'onglet démarre en arrière-plan.
setTimeout(() => document.querySelector(".hero-titre")?.classList.add("est-entre"), 60);
