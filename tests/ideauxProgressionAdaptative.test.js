import { construirePropositionProgression, choisirDimensionProgression } from '../lib/ideauxProgressionAdaptative';

describe('progression adaptative Idéaux', () => {
  test('priorise la dimension principale quand plusieurs progressent', () => {
    const choisi = choisirDimensionProgression([
      { cle: 'vitesse', role: 'secondaire', observations: 4, progressionRepetee: true },
      { cle: 'duree', role: 'principal', observations: 4, progressionRepetee: true },
    ]);
    expect(choisi.cle).toBe('duree');
  });

  test('ne change aucune cible après une surperformance isolée', () => {
    const profil = { indicateurs: [{ cle: 'duree', valeurCible: 10, direction: 'augmenter', role: 'principal' }] };
    const proposition = construirePropositionProgression(profil, [
      { ...profil.indicateurs[0], observations: 3, moyenneReelle: 11.3, progressionRepetee: false },
    ]);
    expect(proposition.type).toBe('consolider');
    expect(proposition.indicateurs[0].valeurCible).toBe(10);
  });

  test('fait progresser une seule dimension sans absorber toute la surperformance', () => {
    const profil = { indicateurs: [
      { cle: 'duree', valeurCible: 10, direction: 'augmenter', role: 'principal' },
      { cle: 'vitesse', valeurCible: 7.6, direction: 'augmenter', role: 'secondaire' },
    ] };
    const proposition = construirePropositionProgression(profil, [
      { ...profil.indicateurs[0], observations: 4, moyenneReelle: 14, progressionRepetee: true },
      { ...profil.indicateurs[1], observations: 4, moyenneReelle: 8.2, progressionRepetee: true },
    ]);
    expect(proposition.dimension).toBe('duree');
    expect(proposition.nouvelleCible).toBe(12);
    expect(proposition.indicateurs[1].valeurCible).toBe(7.6);
  });

  test('fonctionne aussi avec un indicateur non sportif', () => {
    const profil = { indicateurs: [{ cle: 'pages', valeurCible: 20, direction: 'augmenter', role: 'principal' }] };
    const proposition = construirePropositionProgression(profil, [
      { ...profil.indicateurs[0], observations: 4, moyenneReelle: 32, progressionRepetee: true },
    ]);
    expect(proposition.type).toBe('progresser');
    expect(proposition.dimension).toBe('pages');
    expect(proposition.nouvelleCible).toBeGreaterThan(20);
    expect(proposition.nouvelleCible).toBeLessThan(32);
  });

  test('gère une mesure où diminuer signifie progresser', () => {
    const profil = { indicateurs: [{ cle: 'allure', valeurCible: 6, direction: 'diminuer', role: 'principal' }] };
    const proposition = construirePropositionProgression(profil, [
      { ...profil.indicateurs[0], observations: 4, moyenneReelle: 5.4, progressionRepetee: true },
    ]);
    expect(proposition.nouvelleCible).toBeLessThan(6);
    expect(proposition.nouvelleCible).toBeGreaterThanOrEqual(5.4);
  });
});
