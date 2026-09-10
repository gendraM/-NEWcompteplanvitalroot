const fs = require('fs');
const path = require('path');

describe('Raccord des repas repères au planning', () => {
  const page = fs.readFileSync(path.join(__dirname, '../pages/plan.js'), 'utf8');
  const carte = fs.readFileSync(path.join(__dirname, '../components/RepasReperesPlanning.js'), 'utf8');
  const planificateur = fs.readFileSync(path.join(__dirname, '../components/PlanificateurRepas.js'), 'utf8');

  test('détecte les candidats sur quinze jours pour l’utilisateur connecté', () => {
    expect(page).toContain(".from('repas_reels')");
    expect(page).toContain(".eq('user_id', userId)");
    expect(page).toContain('obtenirFenetreRepasReperes(dateDuJour)');
    expect(page).toContain('detecterCandidatsRepasReperes(data || []');
  });

  test('montre une proposition principale et au plus deux propositions secondaires', () => {
    expect(carte).toContain('const propositions = candidats.slice(0, 3)');
    expect(carte).toContain('Une de tes valeurs sûres');
    expect(carte).toContain('Voir ${autres.length} autre');
    expect(carte).toContain('Mes valeurs sûres');
    expect(carte).toContain('Pas cette semaine');
  });

  test('charge l’assiette dans le planificateur sans l’enregistrer automatiquement', () => {
    expect(page).toContain('repasRepereACharger={repasRepereACharger}');
    expect(planificateur).toContain('construireAssietteDepuisRepere(referentiel, repasRepereACharger)');
    expect(planificateur).toContain('setAssiette(resultat.composition)');
    expect(page).toContain('Rien n’est encore enregistré.');
  });

  test('mémorise le refus ou l’utilisation pour la semaine et pour le compte courant', () => {
    expect(page).toContain('obtenirCleSemaineRepasReperes(dateDuJour)');
    expect(page).toContain('plan-vital:repas-reperes:${userId}');
    expect(page).toContain('setRepasReperesMasques(true)');
  });
});
