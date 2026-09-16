const fs = require('fs');
const path = require('path');

const racine = path.join(__dirname, '..');
const lire = chemin => fs.readFileSync(path.join(racine, chemin), 'utf8');

describe('Intégration du mode trou de suivi', () => {
  test('raccorde le questionnaire au suivi sans utilisateur de secours', () => {
    const page = lire('pages/suivi.js');
    const persistence = lire('lib/trouSuiviPersistence.js');

    expect(page).toContain('<ModeTrouSuiviCard');
    expect(page).toContain('sauvegarderPeriodeReconstituee(supabase, userId, payload)');
    expect(`${page}\n${persistence}`).not.toContain('laurelle_test_user');
  });

  test('persiste séparément les jours sans donnée', () => {
    const page = lire('pages/suivi.js');
    const migration = lire('supabase/migrations/20260916203542_create_suivi_periodes_reconstituees.sql');

    expect(page).toContain('jours_sans_donnee: couvertureSemaine.joursSansDonnee');
    expect(migration).toContain('add column if not exists jours_sans_donnee');
  });

  test('protège les périodes par utilisateur avec RLS', () => {
    const migration = lire('supabase/migrations/20260916203542_create_suivi_periodes_reconstituees.sql');

    expect(migration).toContain('enable row level security');
    expect(migration).toContain('using ((select auth.uid()) = user_id)');
    expect(migration).toContain('with check ((select auth.uid()) = user_id)');
  });
});
