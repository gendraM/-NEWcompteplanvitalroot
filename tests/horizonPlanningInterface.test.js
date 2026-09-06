const fs = require('fs');
const path = require('path');

describe('Interface mobile du planning alimentaire', () => {
  const page = fs.readFileSync(path.join(__dirname, '../pages/plan.js'), 'utf8');
  const horizon = fs.readFileSync(path.join(__dirname, '../components/HorizonPlanning.js'), 'utf8');

  test('propose la semaine par défaut, les 15 jours et un aperçu mensuel compact', () => {
    expect(page).toContain('useState(MODES_HORIZON_PLANNING.SEMAINE)');
    expect(page).toContain('<HorizonPlanning');
    expect(horizon).toContain('Cette semaine');
    expect(horizon).toContain('15 prochains jours');
    expect(horizon).toContain('Aperçu du mois');
    expect(horizon).toContain('grid-template-columns: repeat(7');
  });

  test('rend chaque journée vide utilisable comme zone de dépôt', () => {
    expect(horizon).toContain('<Droppable droppableId={date}>');
    expect(horizon).toContain('.zone-depot) { min-height: 76px');
    expect(horizon).toContain('Dépose un repas ici ou choisis ce jour');
  });

  test('offre une action explicite de déplacement et déplace toutes les lignes du groupe', () => {
    expect(horizon).toContain('Déplacer toute l’assiette');
    expect(horizon).toContain('onMove(groupe.lignes, nouvelleDate)');
    expect(page).toContain('deplacerRepasPlanifie(supabase, lignes, nouvelleDate, userId)');
  });

  test('retire l’ancien tableau mensuel large et le faux score de repas respectés', () => {
    expect(page).not.toContain('minWidth: 700');
    expect(page).not.toContain('Repas respectés cette semaine');
    expect(page).not.toContain('comparaison.semaineActuelle');
  });
});
