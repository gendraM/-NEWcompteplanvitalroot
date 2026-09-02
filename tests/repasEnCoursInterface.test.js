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

  test('raccorde le repas conforme au handler commun et attend son succès', () => {
    const source = lire('components/RepasBloc.js');
    const debutConforme = source.indexOf('if (repasConforme && repasPlanifieDisponible)');
    const finConforme = source.indexOf('// Enregistrement du repas classique', debutConforme + 1);
    const cheminConforme = source.slice(debutConforme, finConforme);

    expect(source).toContain('const handleSubmit = async (e) =>');
    expect(cheminConforme).toContain('const resultat = await onSave({');
    expect(cheminConforme).toContain('repas_planifie_respecte: true');
    expect(cheminConforme).toContain('if (!resultat?.ok)');
    expect(cheminConforme).not.toContain("from('repas_reels').insert");
    expect(cheminConforme.indexOf('if (!resultat?.ok)')).toBeLessThan(cheminConforme.indexOf("setRepasConforme(false)"));
  });

  test('ne propose pas de déclarer conforme un repas sans planning', () => {
    const source = lire('components/RepasBloc.js');

    expect(source).toContain('const repasPlanifieDisponible = [repasPrevu, categoriePrevu, quantitePrevu, kcalPrevu]');
    expect(source).toContain('if (!repasPlanifieDisponible && repasConforme)');
    expect(source).toContain('{repasPlanifieDisponible && (');
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

  test('affiche toutes les lignes planifiées sans préremplir un repas composé comme une ligne unique', () => {
    const source = lire('pages/suivi.js');

    expect(source).toContain('grouperRepasPlanifiesParType(planData)');
    expect(source).toContain('repasPlanifieSelectionne.map((repas, index) =>');
    expect(source).toContain('repasPlanifieSelectionne.length === 1');
    expect(source).toContain('repasPrevu={typeof repasPlanifieUnique?.aliment');
  });

  test('raccorde la comparaison automatique à l’occurrence complète enregistrée', () => {
    const source = lire('pages/suivi.js');

    expect(source).toContain('classifierAlignementRepas(planDuRepas, repasPayloads)');
    expect(source).toContain('repas_planifie_respecte: true');
    expect(source).toContain('.insert(repasPayloadsAvecAlignement)');
    expect(source).toContain(".select('*')");
    expect(source).toContain('obtenirDerniereOccurrenceRepas(repasSemaine');
  });

  test('fait passer un repas composé réutilisé par le handler commun', () => {
    const saisieComposee = lire('components/SaisieRepasCompose.js');
    const repasBloc = lire('components/RepasBloc.js');

    expect(saisieComposee).toContain('const resultat = await onSave(occurrences)');
    expect(saisieComposee).toContain('if (!resultat?.ok)');
    expect(saisieComposee).not.toContain("from('repas_reels').insert(occurrences)");
    expect(repasBloc).toContain('onSave={onSave}');
  });

  test('affiche les quatre lectures non punitives sans modifier RepasBloc', () => {
    const suivi = lire('pages/suivi.js');
    const repasBloc = lire('components/RepasBloc.js');

    expect(suivi).toContain('LIBELLES_ALIGNEMENT_REPAS[alignementRepasSelectionne.statut]');
    expect(suivi).toContain('Ton repas reste dans la direction que tu avais choisie.');
    expect(suivi).toContain('Tu as conservé une partie de ton intention en l’adaptant.');
    expect(suivi).toContain('Tu as fait un autre choix pour ce repas, sans jugement.');
    expect(suivi).toContain('Aucun repas n’était planifié pour ce moment.');
    expect(repasBloc).not.toContain('classifierAlignementRepas');
  });
});
