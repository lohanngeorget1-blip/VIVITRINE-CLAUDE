// Déroulé d'un projet Vivitrine — source unique de la section
// « Comment on travaille » (liste de repli et orbite).
//
// `avancement` = où en est le projet à la fin de l'étape.
// `liees` = étapes voisines, mises en évidence quand celle-ci est ouverte.
export const etapes = [
  {
    titre: "Premier échange",
    duree: "1 heure",
    detail:
      "On parle de votre métier, de vos clients et de ce qui vous distingue de l'atelier d'à côté. On repart avec un cadrage écrit et un prix ferme : pas de fourchette, pas de supplément découvert en cours de route.",
    livrable: "un cadrage écrit et un devis détaillé ligne par ligne",
    avancement: 15,
    liees: [2],
  },
  {
    titre: "Maquette",
    duree: "3 à 5 jours",
    detail:
      "La page d'accueil est dessinée pour de bon : mise en page, choix typographiques, traitement de vos photos. Vous voyez à quoi ressemblera le site avant qu'une seule ligne de code soit écrite, et vous demandez les changements que vous voulez.",
    livrable: "la maquette de la page d'accueil, à valider",
    avancement: 35,
    liees: [1, 3],
  },
  {
    titre: "Rédaction",
    duree: "en parallèle",
    detail:
      "On écrit les pages avec vous, dans vos mots. C'est souvent l'étape que les clients redoutent : elle est comprise dans le prix, et vous n'avez qu'à répondre à nos questions et fournir vos photos.",
    livrable: "les textes de chaque page, relus avec vous",
    avancement: 50,
    liees: [2, 4],
  },
  {
    titre: "Développement",
    duree: "1 à 2 semaines",
    detail:
      "Intégration du design, mise en place du référencement local, optimisation de la vitesse d'affichage et tests sur téléphone, tablette et ordinateur. Vous suivez l'avancement en direct sur une adresse privée.",
    livrable: "le site complet sur une adresse privée",
    avancement: 80,
    liees: [3, 5],
  },
  {
    titre: "Mise en ligne",
    duree: "1 journée",
    detail:
      "Nom de domaine, hébergement, fiche Google et redirections depuis l'ancien site. Puis une séance de prise en main pour que vous sachiez modifier vos horaires, vos photos et vos tarifs sans nous appeler.",
    livrable: "le site en ligne, et une séance de formation",
    avancement: 100,
    liees: [4, 6],
  },
  {
    titre: "Suivi",
    duree: "au fil de l'eau",
    detail:
      "Mises à jour techniques, sauvegardes, corrections et petites évolutions. Trois mois de suivi sont compris avec le forfait Signature, puis c'est un abonnement mensuel sans engagement de durée.",
    livrable: "un interlocuteur joignable, six mois après comme le premier jour",
    avancement: 100,
    liees: [5],
  },
];
