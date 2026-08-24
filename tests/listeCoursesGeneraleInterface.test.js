const fs = require('fs');
const path = require('path');

describe('Interface de la liste de courses générale', () => {
  const composant = fs.readFileSync(path.join(__dirname, '../components/ListeCoursesGeneralePlan.js'), 'utf8');
  const pagePlan = fs.readFileSync(path.join(__dirname, '../pages/plan.js'), 'utf8');

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

  test('rend un seul budget estimé et un seul total payé pour toute la liste', () => {
    expect(composant).toContain('Budget estimé pour toute la liste');
    expect(composant).toContain('Un seul montant facultatif pour tout le panier');
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
});
