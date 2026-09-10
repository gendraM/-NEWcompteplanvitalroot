const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerModule() {
  const contexteAlignement = { module: { exports: {} }, exports: {} };
  vm.createContext(contexteAlignement);
  const alignement = fs.readFileSync(path.join(__dirname, '../lib/alignementRepas.js'), 'utf8')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { regrouperRepasReelsParOccurrence };');
  vm.runInContext(alignement, contexteAlignement, { filename: 'alignementRepas.js' });

  const contexte = {
    module: { exports: {} },
    exports: {},
    __alignement: contexteAlignement.module.exports
  };
  vm.createContext(contexte);
  const source = fs.readFileSync(path.join(__dirname, '../lib/pointAjustementAlimentaire.js'), 'utf8')
    .replace("import { regrouperRepasReelsParOccurrence } from './alignementRepas';", 'const { regrouperRepasReelsParOccurrence } = __alignement;')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { ACTIONS_POINT_AJUSTEMENT_AUTORISEES, STATUTS_POINT_AJUSTEMENT_ALIMENTAIRE, obtenirFenetrePointAjustementAlimentaire, estActionPointAjustementAutorisee, analyserPointAjustementAlimentaire };');
  vm.runInContext(source, contexte, { filename: 'pointAjustementAlimentaire.js' });
  return contexte.module.exports;
}

const {
  ACTIONS_POINT_AJUSTEMENT_AUTORISEES,
  analyserPointAjustementAlimentaire,
  estActionPointAjustementAutorisee,
  obtenirFenetrePointAjustementAlimentaire
} = chargerModule();

function occurrence(id, date, contexte = {}, aliments = ['Poisson blanc', 'Haricots verts']) {
  return aliments.map((aliment, index) => ({
    id: `${id}-${index}`,
    occurrence_repas_id: id,
    date,
    type: 'Dîner',
    aliment,
    quantite: index === 0 ? '120 g' : '150 g',
    kcal: index === 0 ? 110 : 45,
    created_at: `${date}T19:00:0${index}Z`,
    ...contexte
  }));
}

describe('Point d’ajustement alimentaire déterministe', () => {
  test('observe lundi à mercredi et devient disponible du jeudi au samedi', () => {
    expect(obtenirFenetrePointAjustementAlimentaire('2026-09-10')).toEqual({
      dateReference: '2026-09-10',
      observation: { debut: '2026-09-07', fin: '2026-09-09' },
      historique: { debut: '2026-08-26', fin: '2026-09-09' },
      affichage: { debut: '2026-09-10', fin: '2026-09-12' },
      disponible: true
    });
    expect(obtenirFenetrePointAjustementAlimentaire('2026-09-09').disponible).toBe(false);
    expect(obtenirFenetrePointAjustementAlimentaire('2026-09-12').disponible).toBe(true);
    expect(obtenirFenetrePointAjustementAlimentaire('2026-09-13').disponible).toBe(false);
  });

  test('retourne NO_INTERVENTION hors de la période prévue', () => {
    const resultat = analyserPointAjustementAlimentaire([], { dateReference: '2026-09-09' });
    expect(resultat).toMatchObject({ statut: 'NO_INTERVENTION', raison: 'hors_periode' });
  });

  test('retourne NO_INTERVENTION quand moins de trois repas ont été observés', () => {
    const lignes = [
      ...occurrence('occ-1', '2026-09-07', { satiete: 'oui' }),
      ...occurrence('occ-2', '2026-09-08', { ressenti: 'satisfait' })
    ];
    const resultat = analyserPointAjustementAlimentaire(lignes, { dateReference: '2026-09-10' });
    expect(resultat).toMatchObject({ statut: 'NO_INTERVENTION', raison: 'donnees_insuffisantes' });
    expect(resultat.occurrencesObservees).toHaveLength(2);
  });

  test('compte une assiette composée comme une seule occurrence et déduplique son contexte', () => {
    const lignes = [
      ...occurrence('occ-1', '2026-09-07', { satiete: 'oui', note: 'Repas calme' }),
      ...occurrence('occ-2', '2026-09-08', { satiete: 'oui', note: 'Repas calme' }),
      ...occurrence('occ-3', '2026-09-09', { ressenti: 'léger', note: 'Bonne énergie' })
    ];
    const resultat = analyserPointAjustementAlimentaire(lignes, { dateReference: '2026-09-10' });

    expect(resultat.statut).toBe('PRET');
    expect(resultat.occurrencesObservees).toHaveLength(3);
    expect(resultat.occurrencesObservees[0]).toMatchObject({
      occurrenceId: 'occ-1',
      aliments: ['Poisson blanc', 'Haricots verts'],
      kcalTotal: 155,
      composition: [
        expect.objectContaining({ aliment: 'Poisson blanc', quantite: '120 g', kcal: 110 }),
        expect.objectContaining({ aliment: 'Haricots verts', quantite: '150 g', kcal: 45 })
      ],
      notesUtilisateur: ['Repas calme'],
      signauxPositifs: ['satiete_respectee']
    });
  });

  test('écarte la note automatique des repas composés sans supprimer une note écrite', () => {
    const lignes = [
      ...occurrence('occ-1', '2026-09-07', { note: 'Repas composé : assiette saumon' }),
      ...occurrence('occ-2', '2026-09-08', { note: 'Digestion facile' }),
      ...occurrence('occ-3', '2026-09-09', { satiete: 'oui' })
    ];
    const resultat = analyserPointAjustementAlimentaire(lignes, { dateReference: '2026-09-10' });

    expect(resultat.occurrencesObservees[0].notesUtilisateur).toEqual([]);
    expect(resultat.occurrencesObservees[1].notesUtilisateur).toEqual(['Digestion facile']);
  });

  test('ne signale une vigilance qu’après trois occurrences comparables dont deux avec le même signal', () => {
    const lignes = [
      ...occurrence('ancien-1', '2026-08-28', { ressenti: 'lourd' }),
      ...occurrence('ancien-2', '2026-09-02', { ressenti: 'lourd' }),
      ...occurrence('occ-1', '2026-09-07', { satiete: 'oui' }),
      ...occurrence('occ-2', '2026-09-08', { note: 'Journée chargée' }),
      ...occurrence('occ-3', '2026-09-09', { ressenti: 'neutre' })
    ];
    const resultat = analyserPointAjustementAlimentaire(lignes, { dateReference: '2026-09-10' });

    expect(resultat.vigilances).toEqual([
      expect.objectContaining({
        type: 'Dîner',
        signal: 'ressenti:lourd',
        occurrencesComparables: 5,
        occurrencesAvecSignal: 2,
        formulation: 'association_repetee_non_causale'
      })
    ]);
  });

  test('ne mélange pas des types de repas différents pour atteindre le seuil', () => {
    const lignes = [
      ...occurrence('diner-1', '2026-08-28', { ressenti: 'lourd' }),
      ...occurrence('diner-2', '2026-09-02', { ressenti: 'lourd' }),
      ...occurrence('dej-1', '2026-09-07', { type: 'Déjeuner', ressenti: 'lourd' }),
      ...occurrence('dej-2', '2026-09-08', { type: 'Déjeuner', satiete: 'oui' }),
      ...occurrence('dej-3', '2026-09-09', { type: 'Déjeuner', note: 'RAS' })
    ];
    const resultat = analyserPointAjustementAlimentaire(lignes, { dateReference: '2026-09-10' });
    expect(resultat.vigilances).toEqual([]);
  });

  test('identifie un élément positif répété sans le transformer en conseil', () => {
    const lignes = [
      ...occurrence('occ-1', '2026-09-07', { satiete: 'oui' }),
      ...occurrence('occ-2', '2026-09-08', { satiete: 'oui' }),
      ...occurrence('occ-3', '2026-09-09', { ressenti: 'neutre' })
    ];
    const resultat = analyserPointAjustementAlimentaire(lignes, { dateReference: '2026-09-10' });
    expect(resultat.elementsPositifs).toEqual([
      expect.objectContaining({
        type: 'Dîner',
        signal: 'satiete_respectee',
        occurrencesComparables: 3,
        occurrencesAvecSignal: 2
      })
    ]);
  });

  test('n’accepte que les actions prévues par la structure actuelle de l’application', () => {
    Object.values(ACTIONS_POINT_AJUSTEMENT_AUTORISEES).forEach(action => {
      expect(estActionPointAjustementAutorisee(action)).toBe(true);
    });
    expect(estActionPointAjustementAutorisee('interdire_un_aliment')).toBe(false);
    expect(estActionPointAjustementAutorisee('inventer_un_conseil')).toBe(false);
  });

  test('ne modifie pas les repas reçus', () => {
    const lignes = [
      ...occurrence('occ-1', '2026-09-07', { satiete: 'oui' }),
      ...occurrence('occ-2', '2026-09-08', { satiete: 'oui' }),
      ...occurrence('occ-3', '2026-09-09', { note: 'RAS' })
    ];
    const origine = JSON.parse(JSON.stringify(lignes));
    analyserPointAjustementAlimentaire(lignes, { dateReference: '2026-09-10' });
    expect(lignes).toEqual(origine);
  });
});
