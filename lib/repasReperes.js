import { regrouperRepasReelsParOccurrence } from './alignementRepas';

export const CONFIG_REPAS_REPERES = Object.freeze({
  fenetreJours: 15,
  occurrencesMinimum: 3,
  resultatsPositifsMinimum: 2
});

const RESSENTIS_FAVORABLES = new Set(['leger', 'satisfait', 'j assume']);

function normaliserTexte(valeur = '') {
  return String(valeur)
    .trim()
    .toLocaleLowerCase('fr')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normaliserDate(date) {
  const correspondance = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ''));
  if (!correspondance) return null;
  const [, annee, mois, jour] = correspondance;
  const instant = Date.UTC(Number(annee), Number(mois) - 1, Number(jour));
  const verification = new Date(instant).toISOString().slice(0, 10);
  return verification === `${annee}-${mois}-${jour}` ? verification : null;
}

function ajouterJours(date, nombreJours) {
  const [annee, mois, jour] = date.split('-').map(Number);
  return new Date(Date.UTC(annee, mois - 1, jour + nombreJours)).toISOString().slice(0, 10);
}

export function obtenirFenetreRepasReperes(dateReference, fenetreJours = CONFIG_REPAS_REPERES.fenetreJours) {
  const fin = normaliserDate(dateReference);
  const duree = Number.isInteger(fenetreJours) && fenetreJours > 0
    ? fenetreJours
    : CONFIG_REPAS_REPERES.fenetreJours;
  if (!fin) return null;
  return { debut: ajouterJours(fin, -(duree - 1)), fin };
}

export function obtenirCleSemaineRepasReperes(dateReference) {
  const date = normaliserDate(dateReference);
  if (!date) return null;
  const [annee, mois, jour] = date.split('-').map(Number);
  const instant = new Date(Date.UTC(annee, mois - 1, jour));
  const decalageLundi = (instant.getUTCDay() + 6) % 7;
  return ajouterJours(date, -decalageLundi);
}

function dateDuJourUtc() {
  return new Date().toISOString().slice(0, 10);
}

function estExtraOuFastFood(ligne) {
  if (ligne?.est_extra === true || ligne?.isFastFood === true || Boolean(ligne?.fastFoodType)) {
    return true;
  }

  return [ligne?.categorie, ligne?.tag, ligne?.type_extra]
    .map(normaliserTexte)
    .some(valeur => valeur.includes('fast food'));
}

function extraireSignauxPositifs(lignes) {
  const valeursSatiete = lignes.flatMap(ligne => [ligne?.satiete, ligne?.['satiété_respectée']]);
  return {
    alignement: lignes.some(ligne => ligne?.repas_planifie_respecte === true),
    satiete: valeursSatiete.some(valeur => valeur === true || normaliserTexte(valeur) === 'oui'),
    ressenti: lignes.some(ligne => RESSENTIS_FAVORABLES.has(normaliserTexte(ligne?.ressenti)))
  };
}

function construireCleComposition(lignes) {
  const aliments = lignes.map(ligne => normaliserTexte(ligne?.aliment)).filter(Boolean);
  if (aliments.length !== lignes.length) return null;
  return aliments.sort().join('|');
}

function dateOccurrence(lignes) {
  const dates = lignes.map(ligne => normaliserDate(ligne?.date)).filter(Boolean);
  return dates.length === lignes.length && new Set(dates).size === 1 ? dates[0] : null;
}

function ordreOccurrence(occurrence) {
  const dateCreation = occurrence.lignes
    .map(ligne => String(ligne?.created_at || ''))
    .sort()
    .at(-1);
  return `${occurrence.date}T${dateCreation || ''}`;
}

function copierComposition(lignes) {
  return lignes.map(ligne => ({
    aliment: ligne.aliment,
    categorie: ligne.categorie ?? null,
    quantite: ligne.quantite ?? null,
    kcal: ligne.kcal ?? null,
    qn: ligne.qn ?? null
  }));
}

function calculerKcalTotal(lignes) {
  const calories = lignes.map(ligne => {
    const valeur = ligne?.kcal;
    if (valeur === null || valeur === undefined || String(valeur).trim() === '') return null;
    const nombre = Number(valeur);
    return Number.isFinite(nombre) ? nombre : null;
  });
  return calories.every(Number.isFinite)
    ? Math.round(calories.reduce((total, kcal) => total + kcal, 0))
    : null;
}

function construireRaison(nombreOccurrences, signaux) {
  const details = [];
  if (signaux.satiete > 0) details.push(`${signaux.satiete} avec une satiété respectée`);
  if (signaux.ressenti > 0) details.push(`${signaux.ressenti} avec un ressenti favorable`);
  if (signaux.alignement > 0) details.push(`${signaux.alignement} aligné${signaux.alignement > 1 ? 's' : ''} avec ton plan`);

  const base = `Tu as choisi cette assiette ${nombreOccurrences} fois ces quinze derniers jours`;
  return details.length > 0 ? `${base}, dont ${details.join(' et ')}.` : `${base}.`;
}

export function detecterCandidatsRepasReperes(repasReels = [], options = {}) {
  const dateReference = normaliserDate(options.dateReference || dateDuJourUtc());
  if (!dateReference) return [];

  const fenetreJours = Number.isInteger(options.fenetreJours) && options.fenetreJours > 0
    ? options.fenetreJours
    : CONFIG_REPAS_REPERES.fenetreJours;
  const occurrencesMinimum = Number.isInteger(options.occurrencesMinimum) && options.occurrencesMinimum > 0
    ? options.occurrencesMinimum
    : CONFIG_REPAS_REPERES.occurrencesMinimum;
  const resultatsPositifsMinimum = Number.isInteger(options.resultatsPositifsMinimum) && options.resultatsPositifsMinimum > 0
    ? options.resultatsPositifsMinimum
    : CONFIG_REPAS_REPERES.resultatsPositifsMinimum;
  const dateDebut = obtenirFenetreRepasReperes(dateReference, fenetreJours).debut;

  const occurrences = regrouperRepasReelsParOccurrence(repasReels)
    .filter(groupe => !String(groupe.cle).startsWith('historique:'))
    .map(groupe => {
      const date = dateOccurrence(groupe.lignes);
      return {
        ...groupe,
        date,
        cleComposition: construireCleComposition(groupe.lignes),
        signaux: extraireSignauxPositifs(groupe.lignes)
      };
    })
    .filter(occurrence =>
      occurrence.lignes.length >= 2
      && occurrence.date
      && occurrence.date >= dateDebut
      && occurrence.date <= dateReference
      && occurrence.cleComposition
      && !occurrence.lignes.some(estExtraOuFastFood)
    );

  const parComposition = new Map();
  occurrences.forEach(occurrence => {
    if (!parComposition.has(occurrence.cleComposition)) parComposition.set(occurrence.cleComposition, []);
    parComposition.get(occurrence.cleComposition).push(occurrence);
  });

  return Array.from(parComposition.entries())
    .map(([cleComposition, occurrencesComparables]) => {
      const positives = occurrencesComparables.filter(occurrence => Object.values(occurrence.signaux).some(Boolean));
      if (
        occurrencesComparables.length < occurrencesMinimum
        || positives.length < resultatsPositifsMinimum
      ) return null;

      const occurrenceReference = [...positives].sort((a, b) => ordreOccurrence(b).localeCompare(ordreOccurrence(a)))[0];
      const signaux = occurrencesComparables.reduce((total, occurrence) => ({
        alignement: total.alignement + Number(occurrence.signaux.alignement),
        satiete: total.satiete + Number(occurrence.signaux.satiete),
        ressenti: total.ressenti + Number(occurrence.signaux.ressenti)
      }), { alignement: 0, satiete: 0, ressenti: 0 });

      return {
        cleComposition,
        nombreOccurrences: occurrencesComparables.length,
        nombreResultatsPositifs: positives.length,
        premiereDate: occurrencesComparables.map(occurrence => occurrence.date).sort()[0],
        derniereDate: occurrencesComparables.map(occurrence => occurrence.date).sort().at(-1),
        composition: copierComposition(occurrenceReference.lignes),
        kcalTotal: calculerKcalTotal(occurrenceReference.lignes),
        signaux,
        raison: construireRaison(occurrencesComparables.length, signaux)
      };
    })
    .filter(Boolean)
    .sort((a, b) =>
      b.nombreOccurrences - a.nombreOccurrences
      || b.nombreResultatsPositifs - a.nombreResultatsPositifs
      || b.derniereDate.localeCompare(a.derniereDate)
    );
}
