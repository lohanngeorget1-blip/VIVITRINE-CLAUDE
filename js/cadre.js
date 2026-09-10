// Le signe de marque au défilement.
// -----------------------------------------------------------------------
// Les équerres de cadrage se referment au survol pour tout ce qui se
// clique (c'est du CSS pur). Pour les blocs qu'on ne clique pas — une
// citation, une image, un chiffre — il faut un déclencheur : ils se
// cadrent quand ils entrent dans l'écran, puis restent cadrés.
//
// C'est volontairement la seule chose que fait ce module. Le geste doit
// rester rare pour rester un signe.

export function initCadre() {
  const cibles = document.querySelectorAll(".cadre-fixe");
  if (!cibles.length) return;

  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduit || !("IntersectionObserver" in window)) {
    cibles.forEach((el) => el.classList.add("est-cadre"));
    return;
  }

  const obs = new IntersectionObserver(
    (entrees, o) => {
      entrees.forEach((e) => {
        if (!e.isIntersecting) return;
        // Le cadre se ferme juste après l'apparition du bloc : les deux
        // mouvements se lisent l'un après l'autre, pas en même temps.
        const retard = Number(e.target.dataset.cadreRetard) || 260;
        setTimeout(() => e.target.classList.add("est-cadre"), retard);
        o.unobserve(e.target);
      });
    },
    { threshold: 0.3, rootMargin: "0px 0px -8% 0px" }
  );

  cibles.forEach((el) => obs.observe(el));
}
