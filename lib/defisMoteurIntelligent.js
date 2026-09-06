// Moteur intelligent Défis V2 — couche de décision pure.
// Aucun effet de bord : ce module n'écrit ni dans Supabase ni dans l'UI.
// Il transforme des faits utilisateur déjà disponibles dans l'application
// en signaux puis en une proposition de défi explicable.

export const SIGNAL_DEFI = Object.freeze({
  SATIETE: "satiete",
  EXTRAS: "extras",
  REGULARITE: "regularite",
  DYNAMIQUE_POSITIVE: "dynamique_positive",
  STAGNATION: "stagnation"
});

const DEFIS_PAR_SIGNAL = Object.freeze({
  [SIGNAL_DEFI.SATIETE]: "💡 J’écoute mon ventre",
  [SIGNAL_DEFI.EXTRAS]: "✨ Je me programme du plaisir",
  [SIGNAL_DEFI.REGULARITE]: "💧 1 cru par jour",
  [SIGNAL_DEFI.DYNAMIQUE_POSITIVE]: "💧 1 cru par jour",
  [SIGNAL_DEFI.STAGNATION]: "🔥 1 vraie faim = 1 vrai repas"
});

const humeurFragile = (humeur = "") => {
  const valeur = String(humeur).toLowerCase();
  return ["lourd", "fragile", "difficile", "fatigu", "triste"].some(mot => valeur.includes(mot));
};

export function detecterSignauxDefis({
  repas7j = [],
  extras7j = [],
  derniereSemaine = null,
  poids = []
} = {}) {
  const signaux = [];
  const repasAvecSatiete = repas7j.filter(r => String(r?.satiete || "").trim());
  const satieteNon = repasAvecSatiete.filter(r => String(r.satiete).toLowerCase() === "non").length;

  if (repasAvecSatiete.length >= 3 && satieteNon / repasAvecSatiete.length >= 0.3) {
    signaux.push({
      type: SIGNAL_DEFI.SATIETE,
      score: 90,
      raison: "Plusieurs repas récents montrent que les signaux de satiété peuvent être difficiles à suivre."
    });
  }

  const kcalExtras = extras7j.reduce((total, extra) => total + (Number(extra?.kcal) || 0), 0);
  const budgetExtras = Number(derniereSemaine?.budget_extras) || 0;
  if (extras7j.length >= 3 || (budgetExtras > 0 && kcalExtras > budgetExtras)) {
    signaux.push({
      type: SIGNAL_DEFI.EXTRAS,
      score: 80,
      raison: "Les extras sont assez présents pour qu'un petit défi d'anticipation puisse être utile."
    });
  }

  const joursSaisis = new Set(repas7j.map(r => r?.date).filter(Boolean)).size;
  if (joursSaisis >= 4) {
    signaux.push({
      type: SIGNAL_DEFI.REGULARITE,
      score: 55,
      raison: "Ta saisie est régulière : c'est un bon moment pour proposer un petit pas supplémentaire."
    });
  }

  if (derniereSemaine?.validee && Number(derniereSemaine?.nb_jours_saisis) >= 5 && !humeurFragile(derniereSemaine?.humeur_dominante)) {
    signaux.push({
      type: SIGNAL_DEFI.DYNAMIQUE_POSITIVE,
      score: 60,
      raison: "Ta dernière semaine montre une dynamique suffisamment stable pour tenter un nouveau petit défi."
    });
  }

  const poidsTries = [...poids]
    .filter(p => Number.isFinite(Number(p?.poids)) && p?.date)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (poidsTries.length >= 3) {
    const recent = poidsTries.slice(-3);
    const valeurs = recent.map(p => Number(p.poids));
    const amplitude = Math.max(...valeurs) - Math.min(...valeurs);
    if (amplitude <= 0.5) {
      signaux.push({
        type: SIGNAL_DEFI.STAGNATION,
        score: 45,
        raison: "Le poids semble stable sur plusieurs mesures : on peut travailler un comportement sans focaliser sur la balance."
      });
    }
  }

  return signaux.sort((a, b) => b.score - a.score);
}

export function choisirPropositionDefi({
  signaux = [],
  defisDisponibles = [],
  defiActif = null,
  humeur = ""
} = {}) {
  if (defiActif) {
    return { proposition: null, raisonBlocage: "defi_actif" };
  }

  if (humeurFragile(humeur)) {
    return { proposition: null, raisonBlocage: "humeur_fragile" };
  }

  for (const signal of signaux) {
    const nomCible = DEFIS_PAR_SIGNAL[signal.type];
    const defi = defisDisponibles.find(item => item?.nom === nomCible);
    if (defi) {
      return {
        proposition: {
          defi,
          signal: signal.type,
          score: signal.score,
          raison: signal.raison
        },
        raisonBlocage: null
      };
    }
  }

  return { proposition: null, raisonBlocage: "aucun_defi_adapte" };
}
