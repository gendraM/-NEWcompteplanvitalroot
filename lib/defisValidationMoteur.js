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

function evaluerEcouteVentre(preuves, config) {
  const repas = preuves.repas || [];
  if (!repas.length) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.INSUFFICIENT_DATA,
      mode: config.mode,
      raison: 'Aucun repas saisi pour cette journée.'
    });
  }

  // Un repas constitue l'unité de preuve. On cherche le plus récent qui contient
  // réellement une information de satiété exploitable.
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
  // Les champs actuellement collectés ne prouvent pas de manière fiable qu'un aliment
  // est à la fois cru et non sucré. L'automatique doit donc rester prudent et basculer
  // vers la confirmation plutôt que produire un faux positif.
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
