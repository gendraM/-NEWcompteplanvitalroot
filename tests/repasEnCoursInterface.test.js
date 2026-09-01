const fs = require('fs');
const path = require('path');

const lire = fichier => fs.readFileSync(path.join(__dirname, '..', fichier), 'utf8');

describe('Interface Mon repas en cours', () => {
  test('préserve le bouton historique mono-aliment dans RepasBloc', () => {
    const source = lire('components/RepasBloc.js');
    expect(source).toContain('nombreAlimentsRepasEnCours === 0');
    expect(source).toContain('Enregistrer ce repas');
  });

  test('expose un point d’extension étroit pour ajouter un aliment validé', () => {
    const source = lire('components/RepasBloc.js');
    expect(source).toContain('onAjouterAlimentAuRepas?.(saisie)');
    expect(source).toContain('form?.reportValidity()');
    expect(source).toContain('+ Ajouter un autre aliment');
    expect(source).toContain('+ Ajouter cet aliment au repas');
  });

  test('initialise le référentiel avant le calcul automatique des calories', () => {
    const source = lire('components/RepasBloc.js');
    const initialisationReferentiel = source.indexOf('const { referentielComplet, referentielCustom');
    const calculCalories = source.indexOf('// Calcul automatique des kcal selon la quantité');

    expect(initialisationReferentiel).toBeGreaterThan(-1);
    expect(calculCalories).toBeGreaterThan(initialisationReferentiel);
  });

  test('affiche, retire, nomme et finalise le repas en cours', () => {
    const source = lire('components/RepasEnCours.js');
    expect(source).toContain('Mon repas en cours');
    expect(source).toContain('onRetirer?.(entree.id)');
    expect(source).toContain('Enregistrer aussi cette assiette pour la réutiliser');
    expect(source).toContain('onFinaliser?.');
  });

  test('raccorde la finalisation au moteur puis au handler commun', () => {
    const source = lire('pages/suivi.js');
    expect(source).toContain('construirePayloadRepasEnCoursDepuisLignes');
    expect(source).toContain('handleSaveRepas(payloads, { afficherSucces: false })');
    expect(source).toContain('creerRepasCompose(supabase');
    expect(source).toContain('nombreAlimentsRepasEnCours={alimentsRepasEnCours.length}');
  });
});
