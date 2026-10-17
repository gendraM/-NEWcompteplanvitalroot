import { chargerDonneesDashboard } from '../lib/dashboardData';

function clientSynthetique(userId = 'alice', { failures = [] } = {}) {
  const tables = {
    historique_poids: [
      { user_id: 'alice', date: '2026-10-12', poids: 81 },
      { user_id: 'bob', date: '2026-10-12', poids: 103 },
    ],
    repas_reels: [
      { id: 'a', user_id: 'alice', date: '2026-10-12', aliment: 'riz' },
      { id: 'b', user_id: 'bob', date: '2026-10-12', categorie: 'fast-food' },
      { id: 'c', user_id: 'alice', date: '2026-08-01', categorie: 'fast-food' },
    ],
    profil: [{ user_id: 'alice', poids_de_depart: 90, objectif: 70, fast_food_interval_days: 21 }],
    semaines_validees: [{ user_id: 'alice', weekStart: '2026-08-03', validee: true }],
    ideaux: [{ id: 'ia', user_id: 'alice', statut: 'en cours' }, { id: 'ib', user_id: 'bob' }],
    seances_reelles: [{ user_id: 'bob', ideal_id: 'ia', fait: true }],
    humeur_checkin: [{ user_id: 'alice', date: '2026-10-12', humeur: 'Calme' }, { user_id: 'bob', date: '2026-10-12', humeur: 'Fatigué' }],
    badges: [{ user_id: 'alice', nom: 'A' }, { user_id: 'bob', nom: 'B' }],
    defis: [{ user_id: 'alice', nom: 'Marcher', status: 'en cours' }, { user_id: 'bob', nom: 'Courir' }],
    extras_palier_events: [{ user_id: 'alice', semaine_decisive: '2026-08-03' }],
    suivi_periodes_estimees: [{ user_id: 'alice', date_debut: '2026-08-01', date_fin: '2026-08-07', statut: 'reconstituee' }],
  };
  const calls = [];
  return {
    calls,
    auth: { getUser: jest.fn(async () => ({ data: { user: userId ? { id: userId } : null } })) },
    from: jest.fn(table => {
      let data = [...(tables[table] || [])];
      let single = false;
      const call = { table, filters: [] };
      calls.push(call);
      const query = {
        select: () => query,
        eq: (key, value) => { call.filters.push([key, value]); data = data.filter(r => r[key] === value); return query; },
        in: (key, values) => { data = data.filter(r => values.includes(r[key])); return query; },
        gte: (key, value) => { data = data.filter(r => r[key] >= value); return query; },
        lte: (key, value) => { data = data.filter(r => r[key] <= value); return query; },
        order: (key, { ascending }) => { data.sort((a, b) => String(a[key]).localeCompare(String(b[key])) * (ascending ? 1 : -1)); return query; },
        limit: count => { data = data.slice(0, count); return query; },
        maybeSingle: () => { single = true; return query; },
        then: resolve => Promise.resolve({ data: single ? data[0] || null : data, error: failures.includes(table) ? { message: 'synthetic error' } : null }).then(resolve),
      };
      return query;
    }),
  };
}
const period = { debut: '2026-10-12', fin: '2026-10-18' };

test('sans identité, aucune table propriétaire n’est lue', async () => {
  const client = clientSynthetique(null);
  await expect(chargerDonneesDashboard(client, period)).rejects.toThrow('Connexion requise');
  expect(client.from).not.toHaveBeenCalled();
});
test('une identité différente de la session attendue bloque les lectures', async () => {
  const client = clientSynthetique('bob');
  await expect(chargerDonneesDashboard(client, { ...period, expectedUserId: 'alice' })).rejects.toThrow();
  expect(client.from).not.toHaveBeenCalled();
});
test('les comptes synthétiques reçoivent leurs observations et jamais celles de l’autre compte', async () => {
  const alice = clientSynthetique();
  const bob = clientSynthetique('bob');
  const [a, b] = await Promise.all([chargerDonneesDashboard(alice, period), chargerDonneesDashboard(bob, period)]);
  expect(a.poids.map(p => p.poids)).toEqual([81]);
  expect(b.poids.map(p => p.poids)).toEqual([103]);
  expect(a.repas.map(r => r.id)).toEqual(['a']);
  expect(b.repas.map(r => r.id)).toEqual(['b']);
  expect(a.ideaux[0].seances_reelles).toEqual([]);
  expect(a.defis.map(d => d.nom)).toEqual(['Marcher']);
  expect(a.badges.map(d => d.nom)).toEqual(['A']);
  expect(a.humeurs.map(d => d.humeur)).toEqual(['Calme']);
  for (const call of alice.calls) expect(call.filters).toContainEqual(['user_id', 'alice']);
  for (const call of bob.calls) expect(call.filters).toContainEqual(['user_id', 'bob']);
  expect(a.errors).toEqual([]);
});
test('le dernier Fast-food global et le palier ne disparaissent pas hors période', async () => {
  const a = await chargerDonneesDashboard(clientSynthetique(), period);
  expect(a.repas.some(r => r.categorie === 'fast-food')).toBe(false);
  expect(a.dernierFastFood.date).toBe('2026-08-01');
  expect(a.semaines[0].weekStart).toBe('2026-08-03');
  expect(a.profil).toMatchObject({ poids_de_depart: 90, objectif: 70, fast_food_interval_days: 21 });
});
test('une source en erreur reste explicitement indisponible, jamais une période vide certifiée', async () => {
  const a = await chargerDonneesDashboard(clientSynthetique('alice', { failures: ['historique_poids', 'suivi_periodes_estimees'] }), period);
  expect(a.errors).toEqual(expect.arrayContaining(['poids', 'periodes']));
  expect(a.poids).toEqual([]);
  expect(a.repas).toHaveLength(1);
});
