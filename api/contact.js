// Réception des demandes de contact.
// ---------------------------------------------------------------------
// Fonction serveur Vercel. Elle enregistre la demande en base PUIS tente
// l'envoi d'un e-mail. L'ordre compte : si l'envoi échoue — quota
// dépassé, panne du fournisseur, clé expirée — la demande est déjà
// sauvegardée. Un formulaire qui perd des messages coûte plus cher qu'un
// formulaire sans notification.
//
// Ce fichier s'exécute UNIQUEMENT côté serveur. Les clés qu'il lit n'ont
// pas de préfixe NEXT_PUBLIC_ : elles ne peuvent pas atteindre le
// navigateur.
//
// C'est un point d'entrée PUBLIC : n'importe qui peut l'appeler. Tout ce
// qui arrive est traité comme hostile jusqu'à preuve du contraire.

const SUPABASE_URL   = process.env.SUPABASE_URL;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;
const RESEND_KEY     = process.env.RESEND_API_KEY;
const DESTINATAIRE   = process.env.CONTACT_DESTINATAIRE || "vivitrine.dizagn@gmail.com";

const LIMITES = { nom: 120, email: 160, activite: 160, message: 4000, origine: 120 };
const MAX_PAR_HEURE = 5;

/* Coupe, nettoie, refuse ce qui n'a pas la bonne forme. La validation
   faite dans le navigateur sert au confort de l'utilisateur ; celle-ci
   sert à la sécurité. On ne fait jamais confiance à la première. */
function texte(v, max) {
  if (typeof v !== "string") return "";
  // Les caractères de contrôle n'ont rien à faire dans un formulaire et
  // servent à brouiller les journaux (injection dans les logs).
  return v.replace(new RegExp(CONTROLE, "g"), "").trim().slice(0, max);
}
const CONTROLE = "[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]";

const emailValide = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v) && v.length <= LIMITES.email;

async function supabase(chemin, options = {}) {
  return fetch(SUPABASE_URL + "/rest/v1" + chemin, {
    ...options,
    headers: {
      apikey: SUPABASE_SECRET,
      Authorization: "Bearer " + SUPABASE_SECRET,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

function safeParse(s) { try { return JSON.parse(s); } catch { return {}; } }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Méthode non autorisée." });
  }

  if (!SUPABASE_URL || !SUPABASE_SECRET) {
    // On ne dit jamais au visiteur ce qui manque côté serveur : ce serait
    // renseigner un attaquant sur notre configuration.
    console.error("[contact] SUPABASE_URL ou SUPABASE_SECRET_KEY absent");
    return res.status(503).json({ message: "Le formulaire est momentanément indisponible." });
  }

  const corps = typeof req.body === "string" ? safeParse(req.body) : (req.body || {});

  // Piège à robots : un champ invisible pour un humain. S'il est rempli,
  // c'est un automate. On répond 200 pour ne pas lui apprendre qu'il a
  // été repéré — sinon il adapte son script.
  if (texte(corps.site_web, 50)) {
    return res.status(200).json({ message: "Votre demande est bien partie." });
  }

  const nom      = texte(corps.nom, LIMITES.nom);
  const email    = texte(corps.email, LIMITES.email).toLowerCase();
  const activite = texte(corps.activite, LIMITES.activite);
  const message  = texte(corps.message, LIMITES.message);
  const origine  = texte(corps.origine, LIMITES.origine);

  if (!nom) return res.status(400).json({ message: "Merci d'indiquer votre nom." });
  if (!emailValide(email)) return res.status(400).json({ message: "Cette adresse e-mail ne semble pas valide." });

  // L'IP vient d'un en-tête posé par Vercel. On prend la PREMIÈRE valeur :
  // les suivantes peuvent avoir été ajoutées par le client lui-même.
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || null;

  // --- contrôle de fréquence ------------------------------------------
  if (ip) {
    try {
      const r = await supabase("/rpc/demandes_recentes", {
        method: "POST",
        body: JSON.stringify({ p_ip: ip, p_minutes: 60 }),
      });
      if (r.ok && Number(await r.json()) >= MAX_PAR_HEURE) {
        return res.status(429).json({
          message: "Vous avez déjà envoyé plusieurs demandes. Écrivez-nous directement par e-mail.",
        });
      }
    } catch (_) {
      // Le contrôle a échoué : on laisse passer plutôt que de bloquer un
      // client légitime. Perdre un message coûte plus cher qu'un doublon.
    }
  }

  // --- enregistrement, AVANT l'e-mail ----------------------------------
  let enregistre = false;
  try {
    const r = await supabase("/demandes", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        nom, email,
        activite: activite || null,
        message: message || null,
        origine: origine || null,
        ip,
      }),
    });
    enregistre = r.ok;
    if (!r.ok) console.error("[contact] enregistrement refusé :", r.status);
  } catch (e) {
    console.error("[contact] enregistrement impossible :", e.message);
  }

  // --- notification ----------------------------------------------------
  let envoye = false;
  if (RESEND_KEY) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + RESEND_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Vivitrine <onboarding@resend.dev>",
          to: [DESTINATAIRE],
          reply_to: email,
          subject: "Demande de " + nom + (activite ? " — " + activite : ""),
          text:
            "Nom      : " + nom + "\n" +
            "E-mail   : " + email + "\n" +
            "Activite : " + (activite || "—") + "\n" +
            "Origine  : " + (origine || "—") + "\n\n" +
            (message || "(aucun message)") + "\n",
        }),
      });
      envoye = r.ok;
      if (!r.ok) console.error("[contact] envoi refusé :", r.status);
    } catch (e) {
      console.error("[contact] envoi impossible :", e.message);
    }
  }

  // Le visiteur reçoit la même réponse dès lors que sa demande est
  // conservée. Savoir si l'e-mail est parti ne le concerne pas ; ce qui
  // compte pour lui, c'est que son message ne soit pas perdu.
  if (enregistre || envoye) {
    return res.status(200).json({ message: "Votre demande est bien partie." });
  }
  return res.status(500).json({ message: "L'envoi a échoué. Écrivez-nous directement par e-mail." });
}
