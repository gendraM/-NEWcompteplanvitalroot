import {
  VALIDATION_DECISION,
  VALIDATION_MODE,
  creerDecisionValidation,
  getValidationConfig
} from './defisValidationReferentiel';

const normaliser = (valeur) => String(valeur ?? '').trim().toLowerCase();

function preuveDejaValidee(preuves, preuveId) {
  if (!preuveId) return false;
  return (preuves?.journal || []).some(entree => {
    if (!entree?.valide) return false;
    const engagements = Array.isArray(entree.engagements) ? entree.engagements : [];
    return engagements.some(engagement => engagement?.preuve_id === preuveId);
  });
}

function estDejeuner(repasItem) {
  const type = normaliser(repasItem?.type_repas || repasItem?.type);
  return type === 'dejeuner' || type === 'déjeuner' || type === 'midi';
}

function texteRepas(repasItem) {
  return [repasItem?.aliment, repasItem?.categorie, repasItem?.note]
    .map(normaliser)
    .filter(Boolean)
    .join(' ');
}

function estDessertExplicite(repasItem) {
  const texte = texteRepas(repasItem);
  if (!texte) return false;
  return /(^|\s)(dessert|gateau|gâteau|tarte|glace|patisserie|pâtisserie|mousse|brownie|cookie|biscuit|flan|creme dessert|crème dessert)(\s|$)/.test(texte);
}

function evaluerPasDessertAutomatisme(preuves, config) {
  const dejeuners = (preuves.repas || []).filter(estDejeuner);
  if (!dejeuners.length) {
    return creerDecisionValidation({ decision: VALIDATION_DECISION.INSUFFICIENT_DATA, mode: config.mode, raison: 'Aucun déjeuner saisi pour observer le dessert.' });
  }

  const desserts = dejeuners.filter(estDessertExplicite);
  const preuveId = `jour:${preuves.date}:dessert-midi`;
  if (!desserts.length) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.VALIDATED,
      mode: config.mode,
      preuveId,
      raison: 'Aucun dessert identifiable n’apparaît dans le déjeuner saisi.',
      donnees: { source: 'observation_duration', observationSeulement: true, date: preuves.date, dejeunersObserves: dejeuners.length, dessertIdentifie: false }
    });
  }

  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
    mode: config.mode,
    preuveId,
    raison: 'Un dessert est identifiable au déjeuner. Une confirmation est nécessaire pour savoir s’il correspondait à une vraie envie ou à une occasion choisie.',
    donnees: { source: 'observation_duration', observationSeulement: true, date: preuves.date, dessertIdentifie: true, repasIds: desserts.map(item => item.id) }
  });
}

function regrouperRepas(repas = []) {
  const groupes = new Map();
  for (const item of repas) {
    const cle = item?.occurrence_repas_id || `${item?.date || 'sans-date'}:${item?.type_repas || item?.type || 'repas'}:${item?.heure || 'sans-heure'}`;
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle).push(item);
  }
  return [...groupes.entries()].map(([cle, lignes]) => ({ cle, lignes }));
}

function mentionSecondePortion(item) {
  const texte = [item?.note, item?.ressenti, item?.pourquoi].map(normaliser).filter(Boolean).join(' ');
  if (!texte) return false;
  return /(deuxieme|deuxième|2e|seconde)\s+(portion|assiette|service)|resservi|resservie|repris une portion|repris une assiette/.test(texte);
}

function evaluerUnePortion(preuves, config) {
  const repas = preuves.repas || [];
  if (!repas.length) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.INSUFFICIENT_DATA,
      mode: config.mode,
      raison: 'Aucun repas saisi pour observer le nombre de portions.'
    });
  }

  const groupes = regrouperRepas(repas);
  const groupesAvecSecondePortion = groupes.filter(groupe => groupe.lignes.some(mentionSecondePortion));
  const preuveId = `jour:${preuves.date}:portion`;

  if (groupesAvecSecondePortion.length) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
      mode: config.mode,
      preuveId,
      raison: 'Une seconde portion semble explicitement mentionnée dans la saisie. Une confirmation permet de vérifier le contexte sans interpréter une quantité comme un échec.',
      donnees: {
        source: 'observation_duration',
        observationSeulement: true,
        date: preuves.date,
        secondePortionMentionnee: true,
        repas: groupesAvecSecondePortion.map(groupe => groupe.cle)
      }
    });
  }

  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
    mode: config.mode,
    preuveId,
    raison: 'Les repas sont saisis, mais les quantités ou grammes ne permettent pas de savoir combien de portions ont réellement été prises.',
    donnees: {
      source: 'observation_duration',
      observationSeulement: true,
      date: preuves.date,
      secondePortionMentionnee: false,
      repasObserves: groupes.length
    }
  });
}

function evaluerFauxAllie(preuves, config) {
  const extras = preuves.extras || [];
  const repas = preuves.repas || [];

  if (!extras.length) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.INSUFFICIENT_DATA,
      mode: config.mode,
      raison: 'Aucun extra saisi sur la période pour observer une éventuelle substitution.'
    });
  }

  const observations = extras.map(extra => {
    const repasLie = extra?.lie_a_repas_id
      ? repas.find(item => String(item?.id) === String(extra.lie_a_repas_id))
      : null;

    return {
      extraId: extra.id,
      date: extra.date,
      heure: extra.heure || null,
      aliment: extra.aliment || extra.type || null,
      contexte: extra.contexte || null,
      commentaire: extra.commentaire || null,
      repasLieId: repasLie?.id || null
    };
  });

  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
    mode: config.mode,
    preuveId: `periode:${preuves.periode?.debut || preuves.date}:faux-allie`,
    raison: 'Des extras sont présents, mais les données ne permettent pas de savoir s’ils ont servi à compenser ou remplacer un autre extra. Une confirmation est nécessaire.',
    donnees: {
      source: 'observation_duration',
      observationSeulement: true,
      extrasObserves: observations,
      intentionCompensationInferee: false
    }
  });
}

function evaluerEcouteVentre(preuves, config) {
  const repas = preuves.repas || [];
  if (!repas.length) return creerDecisionValidation({ decision: VALIDATION_DECISION.INSUFFICIENT_DATA, mode: config.mode, raison: 'Aucun repas saisi pour cette journée.' });

  const candidat = [...repas].reverse().find(repasItem => {
    const satiete = normaliser(repasItem.satiete);
    const respectee = repasItem['satiété_respectée'];
    return satiete !== '' || typeof respectee === 'boolean';
  });
  if (!candidat) return creerDecisionValidation({ decision: VALIDATION_DECISION.NEEDS_CONFIRMATION, mode: config.mode, raison: 'Le repas est saisi mais la satiété ne permet pas de conclure.' });

  const preuveId = `repas:${candidat.id}:satiete`;
  if (preuveDejaValidee(preuves, preuveId)) return creerDecisionValidation({ decision: VALIDATION_DECISION.ALREADY_VALIDATED, mode: config.mode, preuveId, raison: 'Ce repas a déjà servi de preuve pour cette étape.' });

  const satiete = normaliser(candidat.satiete);
  const respectee = candidat['satiété_respectée'];
  if (respectee === true || satiete === 'oui') return creerDecisionValidation({ decision: VALIDATION_DECISION.VALIDATED, mode: config.mode, preuveId, raison: 'La saisie du repas indique que la satiété a été respectée.', donnees: { repasId: candidat.id, satiete: candidat.satiete } });
  if (respectee === false || satiete === 'non') return creerDecisionValidation({ decision: VALIDATION_DECISION.NOT_VALIDATED, mode: config.mode, preuveId, raison: 'La saisie indique que la satiété n’a pas été respectée.', donnees: { repasId: candidat.id, satiete: candidat.satiete } });
  return creerDecisionValidation({ decision: VALIDATION_DECISION.NEEDS_CONFIRMATION, mode: config.mode, preuveId, raison: 'Une information de satiété existe mais nécessite une confirmation.' });
}

function evaluerCruParJour(preuves, config) {
  if (!(preuves.repas || []).length) return creerDecisionValidation({ decision: VALIDATION_DECISION.INSUFFICIENT_DATA, mode: config.mode, raison: 'Aucun repas saisi pour rechercher une preuve alimentaire.' });
  return creerDecisionValidation({ decision: VALIDATION_DECISION.NEEDS_CONFIRMATION, mode: config.fallback || VALIDATION_MODE.MIXED, preuveId: `jour:${preuves.date}:cru`, raison: 'Les données actuelles ne prouvent pas encore de façon fiable le caractère cru et non sucré.' });
}

export function evaluerValidationDefi(preuves) {
  const defi = preuves?.defi;
  if (!defi?.id) return creerDecisionValidation({ decision: VALIDATION_DECISION.INSUFFICIENT_DATA, mode: VALIDATION_MODE.DECLARATIVE, raison: 'Défi absent du contexte de validation.' });

  const config = getValidationConfig(defi);
  if (!preuves.actif) return creerDecisionValidation({ decision: VALIDATION_DECISION.INSUFFICIENT_DATA, mode: config.mode, raison: 'Le défi n’est pas actif.' });

  if (defi.nom === '🍎 Pas de dessert par automatisme') return evaluerPasDessertAutomatisme(preuves, config);
  if (defi.nom === '🧀 1 portion ça suffit') return evaluerUnePortion(preuves, config);
  if (defi.nom === '🚫 Le faux allié') return evaluerFauxAllie(preuves, config);
  if (defi.nom === '💡 J’écoute mon ventre') return evaluerEcouteVentre(preuves, config);
  if (defi.nom === '💧 1 cru par jour') return evaluerCruParJour(preuves, config);

  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
    mode: config.mode,
    raison: config.mode === VALIDATION_MODE.DECLARATIVE ? 'Ce défi nécessite une déclaration de l’utilisateur.' : 'Le validateur spécifique de ce défi n’est pas encore raccordé.'
  });
}
