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
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.INSUFFICIENT_DATA,
      mode: config.mode,
      raison: 'Aucun déjeuner saisi pour observer le dessert.'
    });
  }

  const desserts = dejeuners.filter(estDessertExplicite);
  const preuveId = `jour:${preuves.date}:dessert-midi`;

  if (!desserts.length) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.VALIDATED,
      mode: config.mode,
      preuveId,
      raison: 'Aucun dessert identifiable n’apparaît dans le déjeuner saisi.',
      donnees: {
        source: 'observation_duration',
        observationSeulement: true,
        date: preuves.date,
        dejeunersObserves: dejeuners.length,
        dessertIdentifie: false
      }
    });
  }

  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
    mode: config.mode,
    preuveId,
    raison: 'Un dessert est identifiable au déjeuner. Une confirmation est nécessaire pour savoir s’il correspondait à une vraie envie ou à une occasion choisie.',
    donnees: {
      source: 'observation_duration',
      observationSeulement: true,
      date: preuves.date,
      dessertIdentifie: true,
      repasIds: desserts.map(item => item.id)
    }
  });
}

function evaluerEcouteVentre(preuves, config) {
  const repas = preuves.repas || [];
  if (!repas.length) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.INSUFFICIENT_DATA,
      mode: config.mode,
      raison: 'Aucun repas saisi pour cette journée.'
    });
  }

  const candidat = [...repas].reverse().find(repasItem => {
    const satiete = normaliser(repasItem.satiete);
    const respectee = repasItem['satiété_respectée'];
    return satiete !== '' || typeof respectee === 'boolean';
  });

  if (!candidat) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
      mode: config.mode,
      raison: 'Le repas est saisi mais la satiété ne permet pas de conclure.'
    });
  }

  const preuveId = `repas:${candidat.id}:satiete`;
  if (preuveDejaValidee(preuves, preuveId)) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.ALREADY_VALIDATED,
      mode: config.mode,
      preuveId,
      raison: 'Ce repas a déjà servi de preuve pour cette étape.'
    });
  }

  const satiete = normaliser(candidat.satiete);
  const respectee = candidat['satiété_respectée'];
  if (respectee === true || satiete === 'oui') {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.VALIDATED,
      mode: config.mode,
      preuveId,
      raison: 'La saisie du repas indique que la satiété a été respectée.',
      donnees: { repasId: candidat.id, satiete: candidat.satiete }
    });
  }

  if (respectee === false || satiete === 'non') {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.NOT_VALIDATED,
      mode: config.mode,
      preuveId,
      raison: 'La saisie indique que la satiété n’a pas été respectée.',
      donnees: { repasId: candidat.id, satiete: candidat.satiete }
    });
  }

  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
    mode: config.mode,
    preuveId,
    raison: 'Une information de satiété existe mais nécessite une confirmation.'
  });
}

function evaluerCruParJour(preuves, config) {
  if (!(preuves.repas || []).length) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.INSUFFICIENT_DATA,
      mode: config.mode,
      raison: 'Aucun repas saisi pour rechercher une preuve alimentaire.'
    });
  }

  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
    mode: config.fallback || VALIDATION_MODE.MIXED,
    preuveId: `jour:${preuves.date}:cru`,
    raison: 'Les données actuelles ne prouvent pas encore de façon fiable le caractère cru et non sucré.'
  });
}

export function evaluerValidationDefi(preuves) {
  const defi = preuves?.defi;
  if (!defi?.id) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.INSUFFICIENT_DATA,
      mode: VALIDATION_MODE.DECLARATIVE,
      raison: 'Défi absent du contexte de validation.'
    });
  }

  const config = getValidationConfig(defi);
  if (!preuves.actif) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.INSUFFICIENT_DATA,
      mode: config.mode,
      raison: 'Le défi n’est pas actif.'
    });
  }

  if (defi.nom === '🍎 Pas de dessert par automatisme') return evaluerPasDessertAutomatisme(preuves, config);
  if (defi.nom === '💡 J’écoute mon ventre') return evaluerEcouteVentre(preuves, config);
  if (defi.nom === '💧 1 cru par jour') return evaluerCruParJour(preuves, config);

  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
    mode: config.mode,
    raison: config.mode === VALIDATION_MODE.DECLARATIVE
      ? 'Ce défi nécessite une déclaration de l’utilisateur.'
      : 'Le validateur spécifique de ce défi n’est pas encore raccordé.'
  });
}
