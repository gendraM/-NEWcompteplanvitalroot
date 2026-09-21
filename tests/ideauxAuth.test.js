import { obtenirUserIdIdeaux } from '../lib/ideauxAuth';

describe('obtenirUserIdIdeaux', () => {
  test('retourne l’identifiant de l’utilisateur authentifié', async () => {
    const supabase = { auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }) } };
    await expect(obtenirUserIdIdeaux(supabase)).resolves.toBe('user-1');
  });

  test('refuse de continuer sans utilisateur connecté', async () => {
    const supabase = { auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) } };
    await expect(obtenirUserIdIdeaux(supabase)).rejects.toThrow('Utilisateur non connecté');
  });

  test('propage une erreur Supabase Auth', async () => {
    const erreur = new Error('session invalide');
    const supabase = { auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: erreur }) } };
    await expect(obtenirUserIdIdeaux(supabase)).rejects.toBe(erreur);
  });
});
