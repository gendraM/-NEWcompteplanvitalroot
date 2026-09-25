import {
  creerProfilIndicateurs,
  comparerIndicateur,
  construireSignauxIndicateurs,
} from '../lib/ideauxIndicateurs';

describe('indicateurs génériques Idéaux', () => {
  test('une vitesse km/h plus haute est au-dessus de la cible', () => {
    expect(comparerIndicateur({ valeurCible: 7.6, direction: 'augmenter' }, 8.1).etat).toBe('au_dessus');
  });

  test('une allure min/km plus basse représente aussi une amélioration', () => {
    expect(comparerIndicateur({ valeurCible: 6, direction: 'diminuer' }, 5.5).etat).toBe('au_dessus');
  });

  test('le profil course peut combiner durée, distance, vitesse et fréquence', () => {
    const profil = creerProfilIndicateurs('course', {
      duree: 10,
      distance: 1.3,
      vitesse: 7.6,
      frequence: 2,
    });
    expect(profil.indicateurs.map((i) => i.cle)).toEqual(['duree', 'distance', 'vitesse', 'frequence']);
  });

  test('un idéal non sportif utilise le même moteur sans champs de course', () => {
    const profil = creerProfilIndicateurs('lecture', {
      indicateurs: [
        { cle: 'pages', valeurCible: 20, role: 'principal' },
        { cle: 'frequence', valeurCible: 4 },
      ],
    });
    expect(profil.indicateurs.map((i) => i.cle)).toEqual(['pages', 'frequence']);
    expect(profil.indicateurs.some((i) => i.cle === 'vitesse')).toBe(false);
  });

  test('une progression répétée devient un signal sans changer la cible', () => {
    const profil = creerProfilIndicateurs('course', { duree: 10 });
    const [signal] = construireSignauxIndicateurs(profil, [
      { duree: 14 }, { duree: 13 }, { duree: 10 },
    ]);
    expect(signal.valeurCible).toBe(10);
    expect(signal.favorables).toBe(2);
    expect(signal.progressionRepetee).toBe(true);
  });
});
