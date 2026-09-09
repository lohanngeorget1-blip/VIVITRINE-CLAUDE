// CRÉATIONS — la pile réagit au curseur.
// -----------------------------------------------------------------------
// Chaque vignette porte une profondeur (--prof) fixée en CSS. On écrit ici
// une position de curseur normalisée (--px / --py) relative à la zone, et
// le CSS l'applique proportionnellement à la profondeur : les vignettes de
// devant bougent plus que celles du fond, ce qui fabrique le relief.
//
// Le mouvement est amorti par une interpolation, si bien que la pile
// « suit » le curseur avec une légère inertie au lieu de le coller.

const lerp = (a, b, t) => a + (b - a) * t;

export function initCreations() {
  const pile = document.querySelector(".pile");
  if (!pile) return;

  const index = document.querySelectorAll(".pile-index button");
  const vignettes = pile.querySelectorAll(".pile-item");

  // L'index sous la pile et les vignettes se répondent dans les deux sens.
  const viser = (i, on) => {
    vignettes[i]?.classList.toggle("est-vise", on);
    index[i]?.classList.toggle("est-vise", on);
    if (on) vignettes[i]?.style.setProperty("--ech", "1.045");
    else vignettes[i]?.style.removeProperty("--ech");
    if (on) vignettes[i]?.style.setProperty("--voile", "0");
    else vignettes[i]?.style.removeProperty("--voile");
  };

  index.forEach((b, i) => {
    b.addEventListener("pointerenter", () => viser(i, true));
    b.addEventListener("pointerleave", () => viser(i, false));
    b.addEventListener("focus", () => viser(i, true));
    b.addEventListener("blur", () => viser(i, false));
    b.addEventListener("click", () => vignettes[i]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }));
  });

  vignettes.forEach((v, i) => {
    v.addEventListener("pointerenter", () => index[i]?.classList.add("est-vise"));
    v.addEventListener("pointerleave", () => index[i]?.classList.remove("est-vise"));
  });

  const finPointeur = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!finPointeur.matches || reduit.matches) return;

  let viseX = 0, viseY = 0, x = 0, y = 0, anime = false;

  const boucle = () => {
    x = lerp(x, viseX, 0.07);
    y = lerp(y, viseY, 0.07);
    pile.style.setProperty("--px", x.toFixed(4));
    pile.style.setProperty("--py", y.toFixed(4));
    if (Math.abs(viseX - x) > 0.0015 || Math.abs(viseY - y) > 0.0015) {
      requestAnimationFrame(boucle);
    } else {
      anime = false;
    }
  };

  const relancer = () => {
    if (anime) return;
    anime = true;
    requestAnimationFrame(boucle);
  };

  pile.addEventListener(
    "pointermove",
    (e) => {
      const r = pile.getBoundingClientRect();
      viseX = ((e.clientX - r.left) / r.width) * 2 - 1;
      viseY = ((e.clientY - r.top) / r.height) * 2 - 1;
      relancer();
    },
    { passive: true }
  );

  // À la sortie, la pile revient d'elle-même à sa position de repos.
  pile.addEventListener("pointerleave", () => {
    viseX = 0;
    viseY = 0;
    relancer();
  });
}
