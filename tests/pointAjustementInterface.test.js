const fs = require('fs');
const path = require('path');

describe('Raccord du point d’ajustement après la saisie d’un repas', () => {
  const suivi = fs.readFileSync(path.join(__dirname, '../pages/suivi.js'), 'utf8');
  const plan = fs.readFileSync(path.join(__dirname, '../pages/plan.js'), 'utf8');
  const carte = fs.readFileSync(path.join(__dirname, '../components/PointAjustementPlanning.js'), 'utf8');
  const client = fs.readFileSync(path.join(__dirname, '../lib/pointAjustementClient.js'), 'utf8');
  const api = fs.readFileSync(path.join(__dirname, '../pages/api/plan/point-ajustement.js'), 'utf8');

  test('n’appelle le point que du jeudi au samedi et le persiste par semaine et par utilisateur', () => {
    expect(suivi).toContain('obtenirFenetrePointAjustementAlimentaire(dateDuJour)');
    expect(suivi).toContain('if (!fenetre?.disponible) return');
    expect(suivi).not.toContain('plan-vital:point-ajustement:${userIdActif}');
    expect(suivi).toContain('lirePointAjustementAlimentaire(dateDuJour)');
    expect(api).toContain(".from('points_ajustement_alimentaires')");
    expect(api).toContain(".eq('user_id', user.id)");
    expect(api).toContain('semaine_debut: fenetre.observation.debut');
  });

  test('affiche la carte dans le suivi uniquement après une sauvegarde réussie', () => {
    expect(suivi).toContain('<PointAjustementPlanning');
    expect(suivi).toContain('void essayerAfficherPointAjustement(user?.id || userId)');
    expect(suivi.indexOf('if (error) {')).toBeLessThan(suivi.indexOf('void essayerAfficherPointAjustement(user?.id || userId)'));
    expect(plan).not.toContain('<PointAjustementPlanning');
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

  test('ferme durablement une carte sans empêcher une nouvelle tentative après un échec', () => {
    expect(client).toContain("appelerPointAjustement(dateReference, 'fermer')");
    expect(api).toContain(".update({ ferme_le: new Date().toISOString() })");
    expect(suivi).toContain('onDismiss={fermerPointAjustement}');
    expect(suivi).not.toContain('localStorage.setItem(cleStockage, cleSemaine)');
  });

  test('n’expose pas la clé OpenAI et ne transmet à l’IA que le contexte calculé', () => {
    expect(client).not.toContain('OPENAI_API_KEY');
    expect(api).toContain('process.env.OPENAI_API_KEY');
    expect(api).toContain('input: JSON.stringify(contexte)');
    expect(api).toContain('validerReponsePointAjustementIA');
  });

  test('réutilise les actions du planning sans écrire automatiquement', () => {
    expect(suivi).toContain('agirDepuisPointAjustement');
    expect(suivi).toContain('UTILISER_VALEUR_SURE');
    expect(suivi).toContain('AJUSTER_REPAS_PLANIFIE');
    expect(suivi).toContain("router.push('/plan#planning-alimentaire-horizon')");
    expect(suivi).toContain("router.push('/plan?source=point-ajustement')");
    expect(plan).toContain("sessionStorage.getItem(cleTransfert)");
    expect(plan).toContain('setRepasRepereACharger({');
    expect(carte).not.toMatch(/supabase|\.insert\(|\.update\(/);
  });
});
