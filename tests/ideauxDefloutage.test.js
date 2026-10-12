import { calculerDefloutageIdeal } from '../lib/ideauxDefloutage';

describe('défloutage progressif de l’image Idéaux', () => {
  test('utilise les paliers réels et non les mois du plan', () => {
    const resultat = calculerDefloutageIdeal({
      date_cible: '2026-03-24',
      plan_params_valides: { dateDebut: '2026-01-01', palierDuree: 4 },
      progression_palier: { pourcentage: 50 },
      cycle_paliers: [{ statut: 'realise', bilan: { engagementPourcentage: 100 } }],
    });

    // 1 palier archivé + la moitié du palier courant sur 4 paliers estimés.
    expect(resultat).toMatchObject({ pourcentage: 38, equivalentsRealises: 1.5, totalEstime: 4 });
    expect(resultat.flouPx).toBe(7.5);
  });

  test('conserve la part réellement accomplie d’un palier partiel', () => {
    const resultat = calculerDefloutageIdeal({
      date_cible: '2026-02-25',
      plan_params_valides: { dateDebut: '2026-01-29', palierDuree: 4 },
      progression_palier: { pourcentage: 0 },
      cycle_paliers: [{ statut: 'termine_partiellement', bilan: { engagementPourcentage: 50 } }],
    });

    expect(resultat).toMatchObject({ pourcentage: 25, equivalentsRealises: 0.5, totalEstime: 2 });
  });

  test('rend l’image totalement nette lorsque l’objectif est atteint', () => {
    expect(calculerDefloutageIdeal({ statut: 'atteint' })).toMatchObject({
      pourcentage: 100,
      ratio: 1,
      flouPx: 0,
    });
  });

  test('ignore implicitement les bonus en utilisant la progression métier fournie', () => {
    const resultat = calculerDefloutageIdeal({
      date_cible: '2026-01-28',
      plan_params_valides: { dateDebut: '2026-01-01', palierDuree: 4 },
      progression_palier: { total: 4, faites: 0, pourcentage: 0 },
      seances_reelles: [{ bonus: true, fait: true }],
    });

    expect(resultat.pourcentage).toBe(0);
    expect(resultat.flouPx).toBe(12);
  });
});
