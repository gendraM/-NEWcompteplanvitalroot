import { chargerProfilNavigation, chargerDefisNavigation } from '../lib/navigationOwnedData';

function client(userId, failed = false) {
  const rows = {
    profil: [{ user_id: 'alice', sexe: 'F', niveau_activite: 'modere', created_at: '2026-01-01' }, { user_id: 'bob', sexe: 'M', niveau_activite: 'actif', created_at: '2026-10-13' }],
    defis: [{ user_id: 'alice', nom: 'Marcher', status: 'en cours' }, { user_id: 'bob', nom: 'Courir', status: 'en cours' }],
  };
  return {
    auth: { getUser: async () => ({ data: { user: userId ? { id: userId } : null } }) },
    from: jest.fn(table => {
      let data = rows[table];
      let single = false;
      const query = {
        select: () => query,
        eq: (key, value) => { data = data.filter(row => row[key] === value); return query; },
        order: () => query,
        limit: count => { data = data.slice(0, count); return query; },
        maybeSingle: () => { single = true; return query; },
        then: resolve => Promise.resolve({ data: single ? data[0] : data, error: failed ? {} : null }).then(resolve),
      };
      return query;
    }),
  };
}

test.each([chargerProfilNavigation, chargerDefisNavigation])('la lecture partagée bloque sans compte authentifié', async read => {
  const fake = client(null);
  await expect(read(fake, 'alice')).rejects.toThrow('Connexion requise');
  expect(fake.from).not.toHaveBeenCalled();
});
test.each([chargerProfilNavigation, chargerDefisNavigation])('une session différente de celle attendue bloque la lecture', async read => {
  const fake = client('bob');
  await expect(read(fake, 'alice')).rejects.toThrow();
  expect(fake.from).not.toHaveBeenCalled();
});
test('chaque compte reçoit son profil et ses défis, pas le dernier profil global', async () => {
  const alice = client('alice'), bob = client('bob');
  expect(await chargerProfilNavigation(alice, 'alice')).toMatchObject({ sexe: 'F' });
  expect(await chargerProfilNavigation(bob, 'bob')).toMatchObject({ sexe: 'M' });
  expect((await chargerDefisNavigation(alice, 'alice')).map(row => row.nom)).toEqual(['Marcher']);
  expect((await chargerDefisNavigation(bob, 'bob')).map(row => row.nom)).toEqual(['Courir']);
});
test.each([chargerProfilNavigation, chargerDefisNavigation])('une source en erreur n’est pas une lecture vide réussie', async read => {
  await expect(read(client('alice', true), 'alice')).rejects.toThrow('indisponible');
});
