// Grille tarifaire Vivitrine — source unique du site.
// -----------------------------------------------------------------------
// Les cartes de la page « Offres » et le tableau comparatif sont tous deux
// construits à partir de ce fichier : un prix ne se modifie qu'ici.
//
// `creation` = paiement unique au lancement du projet.
// `abonnement` = mensualité qui couvre hébergement, maintenance, sécurité
// et suivi. Les deux sont indissociables : c'est le modèle du studio.

export const offres = [
  {
    cle: "start",
    nom: "START",
    creation: "449 €",
    abonnement: "69 €",
    modalite: "à la création, puis mensuel",
    perimetre: "1 à 3 pages",
    resume:
      "La présence en ligne qui manquait : on vous trouve, on comprend ce que vous faites, on vous appelle.",
    pour: "Artisan ou indépendant qui démarre",
    points: [
      "Design professionnel, pensé pour le téléphone",
      "Hébergement professionnel inclus",
      "Référencement local de base et fiche Google",
      "Maintenance et sécurité comprises",
      "Modifications à 20 € l'unité",
    ],
    action: "Choisir START",
  },
  {
    cle: "pro",
    nom: "PRO",
    creation: "699 €",
    abonnement: "89 €",
    modalite: "à la création, puis mensuel",
    perimetre: "3 à 6 pages",
    resume:
      "Le site qui travaille pour vous : textes écrits par un rédacteur, référencement optimisé, suivi sans compter les modifications.",
    pour: "Commerce ou cabinet déjà installé",
    points: [
      "Tout START, en plus abouti",
      "Copywriting professionnel inclus",
      "Référencement local optimisé",
      "Analyse marketing incluse",
      "Modifications et suivi illimités",
    ],
    avant: true,
    marque: "Le plus choisi",
    action: "Choisir PRO",
  },
  {
    cle: "max",
    nom: "MAX",
    prefixe: "À partir de",
    creation: "1 199 €",
    abonnement: "129 €",
    modalite: "selon le périmètre du projet",
    perimetre: "6 pages et plus",
    resume:
      "Le projet complet : design premium sur-mesure, stratégie de référencement, vidéo immersive, et un suivi prioritaire.",
    pour: "Entreprise qui vise la première place",
    points: [
      "Design premium entièrement sur-mesure",
      "Copywriting stratégique",
      "Référencement avancé et stratégique",
      "Vidéo Hero immersive incluse",
      "Suivi prioritaire et analyse marketing premium",
    ],
    action: "Parler d'un projet MAX",
  },
  {
    cle: "app",
    nom: "APPLICATION MOBILE",
    creation: "2 490 € – 3 490 €",
    abonnement: "169 € – 229 €",
    modalite: "selon la complexité de l'application",
    perimetre: "iOS et Android",
    resume:
      "Votre activité dans la poche de vos clients : une application native, avec espace utilisateur et notifications.",
    pour: "Activité avec des clients réguliers",
    points: [
      "Conception UI/UX entièrement sur-mesure",
      "Publication sur l'App Store et Google Play",
      "Espace utilisateur inclus",
      "Notifications push",
      "Maintenance, sécurité et suivi compris",
    ],
    large: true,
    action: "Parler d'une application",
  },
  {
    cle: "video",
    nom: "VIDÉO HERO",
    creation: "349 €",
    sansAbo: true,
    modalite: "seule ou ajoutée à une formule, sans abonnement",
    perimetre: "Tournage et montage",
    resume:
      "La vidéo qui ouvre votre page d'accueil : quelques secondes de votre atelier, de votre salle ou de vos mains au travail. C'est ce qui fait rester un visiteur pressé.",
    pour: "À ajouter à n'importe quelle formule",
    points: [
      "Tournage sur place, en Bretagne",
      "Montage et étalonnage aux couleurs de votre marque",
      "Compressée pour s'afficher sans ralentir la page",
      "Livrée en boucle propre, sans coupure visible",
      "Utilisable aussi sur vos réseaux",
    ],
    large: true,
    action: "Ajouter une vidéo Hero",
  },
];
