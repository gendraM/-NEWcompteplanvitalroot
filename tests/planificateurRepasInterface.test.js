const fs = require('fs');
const path = require('path');

describe('Interface unifiée de planification du repas', () => {
  const page = fs.readFileSync(path.join(__dirname, '../pages/plan.js'), 'utf8');
  const composant = fs.readFileSync(path.join(__dirname, '../components/PlanificateurRepas.js'), 'utf8');

  test('remplace les deux anciens formulaires par un seul planificateur', () => {
    expect(page).toContain('<PlanificateurRepas');
    expect(page).not.toContain('<GestionRepasComposes');
    expect(page).not.toContain('Ajoute un repas planifié');
  });

  test('compose plusieurs aliments avant une validation unique du planning', () => {
    expect(composant).toContain('Ajouter à mon repas');
    expect(composant).toContain('Enregistrer dans mon planning');
    expect(composant).toContain('enregistrerAssiettePlanifiee');
  });

  test('affiche les calories calculées sans champ libre de correction', () => {
    expect(composant).toContain('Calories calculées');
    expect(composant).not.toContain('aria-label="Calories planifiées"');
  });

  test('propose le repas réutilisable dans le même parcours', () => {
    expect(composant).toContain('Enregistrer aussi ce repas pour le réutiliser');
    expect(composant).toContain('Réutiliser un repas déjà enregistré');
  });
});
