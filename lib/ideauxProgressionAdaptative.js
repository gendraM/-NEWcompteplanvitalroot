function arrondirProgression(valeur, pas) {
  if (!Number.isFinite(valeur)) return null;
  if (!Number.isFinite(pas) || pas <= 0) return valeur;
  return Math.round(valeur / pas) * pas;
}

function pasParDefaut(indicateur) {
  const pas = {
    duree: 2,
    distance: 0.1,
    vitesse: 0.2,
    allure: 0.1,
    frequence: 1,
    pages: 5,
    sessions: 1,
  };
  return pas[indicateur?.cle] || 1;
}

function variationPrudente(indicateur, signal) {
  const cible = Number(indicateur?.valeurCible);
  const moyenne = Number(signal?.moyenneReelle);
  if (!Number.isFinite(cible) || !Number.isFinite(moyenne)) return cible;

  const ecart = moyenne - cible;
  const amplitude = Math.abs(ecart);
  if (amplitude === 0) return cible;

  // On ne transforme jamais toute la surperformance observée en nouvelle exigence.
  // Le prochain repère n'absorbe qu'une fraction de l'écart, arrondie à un pas lisible.
  const avance = Math.min(amplitude * 0.5, Math.max(Math.abs(cible) * 0.15, pasParDefaut(indicateur)));
  const sens = indicateur.direction === 'diminuer' ? -1 : 1;
  return arrondirProgression(cible + sens * avance, pasParDefaut(indicateur));
}

export function choisirDimensionProgression(signaux = []) {
  const eligibles = (signaux || []).filter(
    (signal) => signal?.progressionRepetee && Number(signal?.observations || 0) >= 2
  );
  if (!eligibles.length) return null;

  // Le cap principal est prioritaire. Les dimensions secondaires ne prennent
  // le relais que si le principal n'apporte pas de signal répété.
  return eligibles.find((signal) => signal.role === 'principal') || eligibles[0];
}

export function construirePropositionProgression(profil, signaux = []) {
  const choisi = choisirDimensionProgression(signaux);
  if (!choisi) {
    return {
      type: 'consolider',
      dimension: null,
      raison: 'Aucune progression répétée suffisamment solide : maintenir les repères et consolider la constance.',
      indicateurs: profil?.indicateurs || [],
    };
  }

  const indicateurs = (profil?.indicateurs || []).map((indicateur) => {
    if (indicateur.cle !== choisi.cle) return { ...indicateur };
    return {
      ...indicateur,
      valeurCible: variationPrudente(indicateur, choisi),
    };
  });

  return {
    type: 'progresser',
    dimension: choisi.cle,
    ancienneCible: choisi.valeurCible,
    nouvelleCible: indicateurs.find((i) => i.cle === choisi.cle)?.valeurCible,
    raison: `Progression répétée observée sur ${choisi.cle} ; une seule dimension évolue, les autres repères restent stables.`,
    indicateurs,
  };
}
