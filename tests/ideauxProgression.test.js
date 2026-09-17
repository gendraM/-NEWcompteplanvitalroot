import { chargerIdeauxAvecProgression, rattacherProgressionAuxIdeaux } from '../lib/ideauxProgression';

describe('progression réelle des cartes Idéaux', () => {
  it('rattache les séances au bon idéal et calcule le palier validé', () => {
    const ideaux = [{
      id: 'ideal-1',
      plan_params_valides: { palierDuree: 1 },
      plan_data: {
        mois: [{ numero: 9, annee: 2026, semaines: [{ numero: 1, actions: [{ date: '2026-09-14' }, { date: '2026-09-16' }] }] }],
      },
    }];
    const seances = [
      { ideal_id: 'ideal-1', date_prevue: '2026-09-14', fait: true, bonus: false },
      { ideal_id: 'ideal-1', date_prevue: '2026-09-16', fait: false, bonus: false },
      { ideal_id: 'autre', date_prevue: '2026-09-14', fait: true, bonus: false },
    ];

    const [ideal] = rattacherProgressionAuxIdeaux(ideaux, seances);
    expect(ideal.seances_reelles).toHaveLength(2);
    expect(ideal.progression_palier).toEqual({ total: 2, faites: 1, pourcentage: 50, termine: false });
  });

  it('ne compte ni bonus ni séance hors du palier et termine seulement quand toutes les prévues sont faites', () => {
    const ideaux = [{
      id: 'ideal-1',
      plan_params_valides: { palierDuree: 1 },
      plan_data: {
        mois: [{ numero: 9, annee: 2026, semaines: [{ numero: 1, actions: [{ date: '2026-09-14' }, { date: '2026-09-16' }] }] }],
      },
    }];
    const seances = [
      { ideal_id: 'ideal-1', date_prevue: '2026-09-14', fait: true, bonus: false },
      { ideal_id: 'ideal-1', date_prevue: '2026-09-16', fait: true, bonus: false },
      { ideal_id: 'ideal-1', date_prevue: '2026-09-15', fait: true, bonus: true },
      { ideal_id: 'ideal-1', date_prevue: '2026-09-21', fait: true, bonus: false },
    ];

    const [ideal] = rattacherProgressionAuxIdeaux(ideaux, seances);
    expect(ideal.seances_reelles).toHaveLength(4);
    expect(ideal.progression_palier).toEqual({ total: 2, faites: 2, pourcentage: 100, termine: true });
  });

  it('rattache correctement les identifiants équivalents même si leur type diffère', () => {
    const [ideal] = rattacherProgressionAuxIdeaux([
      { id: 42, plan_params_valides: { palierDuree: 1 }, plan_data: { mois: [] } },
    ], [
      { ideal_id: '42', fait: true },
    ]);

    expect(ideal.seances_reelles).toHaveLength(1);
  });

  it('retourne une progression vide sans interroger les séances quand aucun idéal existe', async () => {
    const appels = [];
    const supabase = {
      from(table) {
        appels.push(table);
        const result = { data: [], error: null };
        const query = {
          select() { return query; },
          order() { return query; },
          then(resolve) { return Promise.resolve(result).then(resolve); },
        };
        return query;
      },
    };

    const resultat = await chargerIdeauxAvecProgression(supabase);
    expect(resultat).toEqual([]);
    expect(appels).toEqual(['ideaux']);
  });

  it('filtre Idéaux et séances par utilisateur lors du chargement', async () => {
    const appels = [];
    const supabase = {
      from(table) {
        const result = table === 'ideaux'
          ? { data: [{ id: 'ideal-1', plan_data: { mois: [] } }], error: null }
          : { data: [], error: null };
        const query = {
          select() { appels.push([table, 'select']); return query; },
          order() { appels.push([table, 'order']); return query; },
          in(column, values) { appels.push([table, 'in', column, values]); return query; },
          eq(column, value) { appels.push([table, 'eq', column, value]); return Promise.resolve(result); },
          then(resolve) { return Promise.resolve(result).then(resolve); },
        };
        return query;
      },
    };

    await chargerIdeauxAvecProgression(supabase, 'user-1');
    expect(appels).toContainEqual(['ideaux', 'eq', 'user_id', 'user-1']);
    expect(appels).toContainEqual(['seances_reelles', 'eq', 'user_id', 'user-1']);
  });

  it('propage les erreurs Supabase au lieu de produire une fausse progression', async () => {
    const erreur = new Error('lecture impossible');
    const supabase = {
      from() {
        const query = {
          select() { return query; },
          order() { return query; },
          then(resolve) { return Promise.resolve({ data: null, error: erreur }).then(resolve); },
        };
        return query;
      },
    };

    await expect(chargerIdeauxAvecProgression(supabase)).rejects.toBe(erreur);
  });
});
