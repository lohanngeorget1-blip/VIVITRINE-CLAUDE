// Envoi du formulaire de contact sans quitter la page.
// -----------------------------------------------------------------------
// Remplace l'ancien « mailto: », qui ouvrait le logiciel de messagerie du
// visiteur — et ne faisait donc rien du tout pour qui consulte ses mails
// dans un navigateur ou depuis un téléphone. Le visiteur croyait avoir
// envoyé, personne ne recevait rien.
//
// La demande part vers /api/contact, qui l'enregistre puis notifie. Sans
// JavaScript, le formulaire reste soumis normalement vers la page de
// remerciement : il ne devient jamais inutilisable.

export function initContact() {
  const form = document.querySelector("[data-contact]");
  if (!form) return;

  const bouton = form.querySelector('button[type="submit"]');
  const avis = form.querySelector("[data-avis]");
  const libelle = bouton ? bouton.textContent : "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const donnees = Object.fromEntries(new FormData(form).entries());
    donnees.origine = document.title + " — " + location.pathname;

    avis.className = "avis";
    avis.textContent = "";
    if (bouton) { bouton.disabled = true; bouton.textContent = "Envoi…"; }

    let reponse;
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      });
      reponse = { ok: r.ok, data: await r.json().catch(() => ({})) };
    } catch (_) {
      reponse = { ok: false, data: {} };
    }

    if (bouton) { bouton.disabled = false; bouton.textContent = libelle; }

    if (reponse.ok) {
      form.reset();
      avis.className = "avis est-succes";
      avis.innerHTML =
        "<strong>Votre demande est bien partie.</strong> Nous répondons sous 48 heures ouvrées.";
      return;
    }

    avis.className = "avis est-erreur";
    avis.textContent =
      reponse.data.message ||
      "L'envoi a échoué. Écrivez-nous directement à vivitrine.dizagn@gmail.com.";
  });
}
