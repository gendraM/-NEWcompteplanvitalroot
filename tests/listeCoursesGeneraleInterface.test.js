const fs = require('fs');
const path = require('path');

describe('Interface de la liste de courses générale', () => {
  const composant = fs.readFileSync(path.join(__dirname, '../components/ListeCoursesGeneralePlan.js'), 'utf8');
  const pagePlan = fs.readFileSync(path.join(__dirname, '../pages/plan.js'), 'utf8');
  const pageCristallisation = fs.readFileSync(path.join(__dirname, '../pages/cristallisation.js'), 'utf8');
  const pageCristallisationQuotidien = fs.readFileSync(path.join(__dirname, '../pages/cristallisation-quotidien.js'), 'utf8');

  test('conserve les quatre vues du plan et ajoute le mode courses sans nouvelle route', () => {
    expect(composant).toContain("{ id: 'synthese', libelle: 'Synthèse' }");
    expect(composant).toContain("{ id: 'courses', libelle: 'Courses' }");
    expect(composant).toContain('Commencer mes courses');
    expect(composant).toContain('role="dialog"');
    expect(composant).toContain('Retour au plan');
  });

  test('présente les trois états pratiques validés', () => {
    expect(composant).toContain("['a_acheter', 'À acheter']");
    expect(composant).toContain("['panier', 'Dans mon panier']");
    expect(composant).toContain("['deja_disponible', 'Déjà chez moi']");
  });

  test('ne demande plus une estimation manuelle et conserve seulement le total réellement payé', () => {
    expect(composant).not.toContain('Budget estimé pour toute la liste');
    expect(composant).not.toContain('Un seul montant facultatif pour tout le panier');
    expect(composant).toContain('Total payé à la caisse');
    expect(composant).toContain('placeholder="Facultatif"');
    expect(composant).not.toContain('Magasin');
    expect(composant).not.toContain('Enseigne');
  });

  test('permet de revenir au véritable planificateur', () => {
    expect(pagePlan).toContain('id="planificateur-repas"');
    expect(composant).toContain("getElementById('planificateur-repas')");
  });

  test('distingue le besoin du plan du conditionnement réellement acheté', () => {
    expect(composant).toContain('Besoin du plan :');
    expect(composant).toContain('Format d’achat à choisir');
    expect(composant).toContain('format courant à confirmer');
    expect(composant).toContain('Autre format…');
    expect(composant).toContain('Nombre de paquets à acheter');
    expect(composant).toContain('aucune conversion incompatible ni aucun format commercial ne sont inventés');
  });

  test('récupère et enregistre automatiquement la liste générale dans Supabase', () => {
    expect(composant).toContain('chargerListeCoursesGenerale');
    expect(composant).toContain('sauvegarderListeCoursesGenerale');
    expect(composant).toContain('Liste enregistrée');
    expect(composant).toContain('Enregistrement impossible');
  });

  test('propose une sauvegarde explicite et affiche les informations fiables du référentiel', () => {
    expect(composant).toContain('Enregistrer mes courses');
    expect(composant).toContain('Liste prête à être enregistrée');
    expect(composant).toContain('Qualité nutritionnelle issue du référentiel');
    expect(composant).toContain('QN {qnValide}/5');
    expect(composant).toContain('<InformationsAliment categorie={article.categorie} qn={article.qn} />');
  });

  test('ouvre le même plan depuis les deux écrans de cristallisation', () => {
    expect(pageCristallisation).toContain("/plan?source=cristallisation");
    expect(pageCristallisationQuotidien).toContain("/plan?source=cristallisation");
    expect(pageCristallisation).toContain('Ouvrir mon plan et mes courses');
  });

  test('affiche le contexte sans prétendre appliquer les recommandations avancées', () => {
    expect(pagePlan).toContain('construireContexteCristallisation');
    expect(composant).toContain('Contexte cristallisation actif');
    expect(composant).toContain('aucune recommandation automatique n’est encore appliquée');
  });
});
