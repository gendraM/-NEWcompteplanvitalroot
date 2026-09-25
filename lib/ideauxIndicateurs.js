const DEFINITIONS = {
  duree: { unite: 'min', direction: 'augmenter' },
  distance: { unite: 'km', direction: 'augmenter' },
  vitesse: { unite: 'km/h', direction: 'augmenter' },
  allure: { unite: 'min/km', direction: 'diminuer' },
  frequence: { unite: 'fois/semaine', direction: 'augmenter' },
  pages: { unite: 'pages', direction: 'augmenter' },
  sessions: { unite: 'sessions', direction: 'augmenter' },
  heure_cible: { unite: 'heure', direction: 'cible' },
};

export function creerIndicateur({ cle, valeurCible = null, unite, direction, role = 'secondaire' }) {
  const definition = DEFINITIONS[cle] || {};
  return {
    cle,
    valeurCible,
    unite: unite || definition.unite || null,
    direction: direction || definition.direction || 'cible',
    role,
  };
}

export function creerProfilIndicateurs(type, params = {}) {
  if (type === 'course') {
    return {
      type: 'course',
      indicateurs: [
        creerIndicateur({ cle: 'duree', valeurCible: params.duree, role: 'principal' }),
        creerIndicateur({ cle: 'distance', valeurCible: params.distance }),
        creerIndicateur({ cle: 'vitesse', valeurCible: params.vitesse }),
        creerIndicateur({ cle: 'frequence', valeurCible: params.frequence }),
      ].filter((i) => i.valeurCible !== null && i.valeurCible !== undefined),
    };
  }

  return {
    type: type || 'generique',
    indicateurs: (params.indicateurs || []).map(creerIndicateur),
  };
}

function nombre(valeur) {
  const n = Number(valeur);
  return Number.isFinite(n) ? n : null;
}

export function comparerIndicateur(indicateur, valeurReelle) {
  const cible = nombre(indicateur?.valeurCible);
  const reel = nombre(valeurReelle);
  if (cible === null || reel === null) return { etat: 'non_mesurable', ecart: null };

  const ecart = reel - cible;
  let etat = 'cible';
  if (indicateur.direction === 'augmenter') etat = reel > cible ? 'au_dessus' : reel < cible ? 'en_dessous' : 'cible';
  if (indicateur.direction === 'diminuer') etat = reel < cible ? 'au_dessus' : reel > cible ? 'en_dessous' : 'cible';
  if (indicateur.direction === 'cible') etat = reel === cible ? 'cible' : 'ecart';

  return { etat, ecart, cible, reel };
}

export function construireSignauxIndicateurs(profil, realisations = []) {
  return (profil?.indicateurs || []).map((indicateur) => {
    const valeurs = realisations
      .map((r) => nombre(r?.[indicateur.cle]))
      .filter((v) => v !== null);
    const comparaisons = valeurs.map((v) => comparerIndicateur(indicateur, v));
    const favorables = comparaisons.filter((c) => c.etat === 'au_dessus').length;
    return {
      ...indicateur,
      observations: valeurs.length,
      moyenneReelle: valeurs.length ? valeurs.reduce((a, b) => a + b, 0) / valeurs.length : null,
      favorables,
      progressionRepetee: valeurs.length >= 2 && favorables / valeurs.length >= 0.6,
    };
  });
}
