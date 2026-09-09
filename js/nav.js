// Navigation : ouverture du menu mobile et verrouillage du défilement.
// Les états de la barre au scroll sont gérés dans motion.js, qui mesure
// déjà la position : inutile d'ajouter un second écouteur.

export function initNav() {
  const bascule = document.querySelector(".nav-bascule");
  const menu = document.querySelector(".menu-mobile");
  if (!bascule || !menu) return;

  menu.querySelectorAll(".menu-mobile-liens a").forEach((a, i) =>
    a.style.setProperty("--i", i)
  );

  const fermer = () => {
    bascule.classList.remove("est-ouvert");
    menu.classList.remove("est-ouvert");
    bascule.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll", "menu-ouvert");
  };

  const ouvrir = () => {
    bascule.classList.add("est-ouvert");
    menu.classList.add("est-ouvert");
    bascule.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll", "menu-ouvert");
  };

  bascule.addEventListener("click", () =>
    menu.classList.contains("est-ouvert") ? fermer() : ouvrir()
  );
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", fermer));
  window.addEventListener("keydown", (e) => e.key === "Escape" && fermer());
}
