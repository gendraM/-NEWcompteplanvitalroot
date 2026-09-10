const fs = require('fs');
const path = require('path');

describe('Raccord du point d’ajustement dans le planning', () => {
  const page = fs.readFileSync(path.join(__dirname, '../pages/plan.js'), 'utf8');
  const carte = fs.readFileSync(path.join(__dirname, '../components/PointAjustementPlanning.js'), 'utf8');
  const client = fs.readFileSync(path.join(__dirname, '../lib/pointAjustementClient.js'), 'utf8');
  const api = fs.readFileSync(path.join(__dirname, '../pages/api/plan/point-ajustement.js'), 'utf8');

  test('n’appelle le point que du jeudi au samedi et le mémorise par semaine et par utilisateur', () => {
    expect(page).toContain('obtenirFenetrePointAjustementAlimentaire(dateDuJour)');
    expect(page).toContain('if (!fenetre?.disponible)');
    expect(page).toContain('plan-vital:point-ajustement:${userId}');
    expect(page).toContain('localStorage.setItem(cleStockage, cleSemaine)');
  });

  test('affiche une seule carte avec uniquement les rubriques justifiées', () => {
    expect(page).toContain('<PointAjustementPlanning');
    expect(carte).toContain('Mon point d’ajustement');
    expect(carte).toContain('{carte.ceQuiFonctionne && (');
    expect(carte).toContain('{carte.pointAttention && (');
    expect(carte).toContain('{carte.proposition && (');
    expect(carte).toContain('Je garde ça en tête');
  });

  test('authentifie la requête puis limite explicitement la lecture au propriétaire', () => {
    expect(client).toContain('supabase.auth.getSession()');
    expect(client).toContain('Authorization: `Bearer ${session.access_token}`');
    expect(api).toContain('client.auth.getUser(accessToken)');
    expect(api).toContain(".from('repas_reels')");
    expect(api).toContain(".eq('user_id', user.id)");
  });

  test('n’expose pas la clé OpenAI et ne transmet à l’IA que le contexte calculé', () => {
    expect(client).not.toContain('OPENAI_API_KEY');
    expect(api).toContain('process.env.OPENAI_API_KEY');
    expect(api).toContain('input: JSON.stringify(contexte)');
    expect(api).toContain('validerReponsePointAjustementIA');
  });

  test('réutilise les actions du planning sans écrire automatiquement', () => {
    expect(page).toContain('agirDepuisPointAjustement');
    expect(page).toContain('UTILISER_VALEUR_SURE');
    expect(page).toContain('AJUSTER_REPAS_PLANIFIE');
    expect(page).toContain("document.getElementById('planning-alimentaire-horizon')");
    expect(carte).not.toMatch(/supabase|\.insert\(|\.update\(/);
  });
});
