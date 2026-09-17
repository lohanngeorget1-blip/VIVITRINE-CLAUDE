import { questions } from "../data/faq.js?v=23";

// FAQ : un seul volet ouvert à la fois, l'accordéon reste lisible.
export function initFaq() {
  const liste = document.querySelector(".faq-liste");
  if (!liste) return;

  const limite = Number(liste.dataset.limite) || questions.length;

  liste.innerHTML = questions
    .slice(0, limite)
    .map(
      (q, i) => `
    <div class="faq-item">
      <button class="faq-question" aria-expanded="false" aria-controls="rep-${i}" id="qst-${i}">
        <span>${q.q}</span>
        <span class="faq-signe" aria-hidden="true"></span>
      </button>
      <div class="faq-reponse" id="rep-${i}" role="region" aria-labelledby="qst-${i}">
        <div class="faq-reponse-inner"><p>${q.r}</p></div>
      </div>
    </div>`
    )
    .join("");

  const items = liste.querySelectorAll(".faq-item");
  items.forEach((item) => {
    const bouton = item.querySelector(".faq-question");
    bouton.addEventListener("click", () => {
      const ouvert = item.classList.contains("est-ouvert");
      items.forEach((autre) => {
        autre.classList.remove("est-ouvert");
        autre.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });
      if (!ouvert) {
        item.classList.add("est-ouvert");
        bouton.setAttribute("aria-expanded", "true");
      }
    });
  });
}
