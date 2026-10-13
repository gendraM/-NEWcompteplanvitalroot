import { analyserSemaineIdeal } from '../lib/ideauxFeedbackSemaine';

describe('feedback hebdomadaire Idéaux', () => {
  test('oriente vers la première action sans éloge vide', () => {
    const resultat = analyserSemaineIdeal([{ fait: false }, { fait: false }, { fait: false }]);
    expect(resultat.niveau).toBe('a_demarrer');
    expect(resultat.message).toContain('commencer par la première séance');
  });

  test('priorise la prochaine séance même si la vitesse est déjà supérieure', () => {
    const resultat = analyserSemaineIdeal([
      { fait: true, vitesse_prevue: '7,2 km/h', vitesse_reelle: 7.8 },
      { fait: true, vitesse_prevue: '7,2 km/h', vitesse_reelle: 7.6 },
      { fait: false, vitesse_prevue: '7,2 km/h' },
    ]);
    expect(resultat.signalVitesse).toBe(true);
    expect(resultat.message).toContain('priorité reste maintenant de réaliser la prochaine séance');
  });

  test('quantifie une progression répétée sans créer un nouveau standard', () => {
    const resultat = analyserSemaineIdeal([
      { fait: true, duree_prevue: 10, duree_reelle: 12, vitesse_prevue: 7.2, vitesse_reelle: 7.8 },
      { fait: true, duree_prevue: 10, duree_reelle: 13, vitesse_prevue: 7.2, vitesse_reelle: 7.6 },
      { fait: true, duree_prevue: 10, duree_reelle: 10, vitesse_prevue: 7.2, vitesse_reelle: 7.2 },
    ]);
    expect(resultat).toMatchObject({ niveau: 'signal_progression', signalDuree: true, signalVitesse: true, ecartDuree: 1.7, ecartVitesse: 0.3 });
    expect(resultat.message).toContain('pas encore un nouveau standard');
  });

  test('demande de confirmer une semaine simplement tenue', () => {
    const resultat = analyserSemaineIdeal([
      { fait: true, duree_prevue: 10, duree_reelle: 10 },
      { fait: true, duree_prevue: 10, duree_reelle: 10 },
    ]);
    expect(resultat.niveau).toBe('semaine_tenue');
    expect(resultat.message).toContain('reproduire cette régularité');
  });

  test('ne masque pas un repère moyen sous la cible', () => {
    const resultat = analyserSemaineIdeal([
      { fait: true, duree_prevue: 10, duree_reelle: 8 },
      { fait: true, duree_prevue: 10, duree_reelle: 9 },
    ]);
    expect(resultat.message).toContain('reste sous la cible');
  });
});
