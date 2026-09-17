// Configuration du site — le seul endroit à remplir le jour où le backend
// Vivitrine est en ligne.
// -----------------------------------------------------------------------
// Tant que `API` vaut null, le site reste entièrement statique :
//   · la passerelle des prix garde l'adresse en local et prévient dans la
//     console que la piste n'est transmise nulle part ;
//   · la connexion à l'espace client est désactivée et l'explique.
//
// Renseigner `API` avec l'origine de l'API (sans barre oblique finale)
// active les deux. Le contrat attendu est décrit dans js/compte.js.

export const API = null;   // ex. "https://api.vivitrine.fr"

// Durée de validité de l'accès aux tarifs, en jours.
export const DUREE_ACCES_PRIX = 180;
