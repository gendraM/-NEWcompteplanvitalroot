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

function texteObservation(item) {
  return [
    item?.aliment,
    item?.type,
    item?.categorie,
    item?.tag,
    item?.contexte,
    item?.commentaire,
    item?.note
  ].map(normaliser).filter(Boolean).join(' ');
}

function categorieSucreeExplicite(item) {
  const texte = texteObservation(item);
  return /(^|\s)(sucre|sucré|sucree|sucrée|dessert|gateau|gâteau|cookie|biscuit|chocolat|bonbon|glace|patisserie|pâtisserie|viennoiserie)(\s|$)/.test(texte);
}

function categorieGrasseExplicite(item) {
  const texte = texteObservation(item);
  return /(^|\s)(fromage|charcuterie|chips|friture|frit|gras|grasse|beurre)(\s|$)/.test(texte);
}

function minuteJour(heure) {
  const match = String(heure || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function evaluerBriseChaine(preuves, config) {
  const evenements = [
    ...(preuves.repas || []).map(item => ({ ...item, sourceType: 'repas' })),
    ...(preuves.extras || []).map(item => ({ ...item, sourceType: 'extra' }))
  ].filter(item => item?.date && (categorieSucreeExplicite(item) || categorieGrasseExplicite(item)));

  if (evenements.length < 2) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.INSUFFICIENT_DATA,
      mode: config.mode,
      raison: 'Pas assez d’éléments alimentaires explicites pour observer une éventuelle séquence sucre-gras.'
    });
  }

  const tries = [...evenements].sort((a, b) => {
    const dateCompare = String(a.date).localeCompare(String(b.date));
    if (dateCompare !== 0) return dateCompare;
    const aMinute = minuteJour(a.heure);
    const bMinute = minuteJour(b.heure);
    if (aMinute == null || bMinute == null) return 0;
    return aMinute - bMinute;
  });

  const sequences = [];
  for (let i = 0; i < tries.length - 1; i += 1) {
    const premier = tries[i];
    const suivant = tries[i + 1];
    if (premier.date !== suivant.date) continue;
    if (!categorieSucreeExplicite(premier) || !categorieGrasseExplicite(suivant)) continue;

    const debut = minuteJour(premier.heure);
    const fin = minuteJour(suivant.heure);
    const delaiMinutes = debut != null && fin != null ? fin - debut : null;

    sequences.push({
      premier: { id: premier.id, source: premier.sourceType, aliment: premier.aliment || premier.type || null, heure: premier.heure || null },
      suivant: { id: suivant.id, source: suivant.sourceType, aliment: suivant.aliment || suivant.type || null, heure: suivant.heure || null },
      date: premier.date,
      delaiMinutes
    });
  }

  if (!sequences.length) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.INSUFFICIENT_DATA,
      mode: config.mode,
      raison: 'Aucune séquence sucre puis gras n’est explicitement identifiable dans les saisies disponibles.'
    });
  }

  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
    mode: config.mode,
    preuveId: `periode:${preuves.periode?.debut || preuves.date}:brise-chaine`,
    raison: 'Une séquence sucre puis gras est identifiable. Une confirmation reste nécessaire pour savoir s’il s’agissait réellement de l’enchaînement visé par le défi et si une pause consciente a eu lieu.',
    donnees: {
      source: 'observation_duration',
      observationSeulement: true,
      sequencesObservees: sequences,
      intentionInferee: false,
      pauseInferee: false
    }
  });
}

function extraSemblePlanifie(extra) {
  const texte = [extra?.tag, extra?.contexte, extra?.commentaire].map(normaliser).filter(Boolean).join(' ');
  return /(^|\s)(planifie|planifié|prevu|prévu|programme|programmé|anticipe|anticipé)(\s|$)/.test(texte);
}

function evaluerPlaisirProgramme(preuves, config) {
  const extras = preuves.extras || [];
  if (!extras.length) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
      mode: config.mode,
      preuveId: `periode:${preuves.periode?.debut || preuves.date}:plaisir-programme`,
      raison: 'Aucun extra consommé n’est visible sur la semaine. Les données disponibles ne permettent pas de savoir si un plaisir avait été planifié puis modifié ou non réalisé.',
      donnees: {
        source: 'observation_duration',
        observationSeulement: true,
        extraRealiseIdentifie: false,
        planificationIdentifiable: false
      }
    });
  }

  const extrasPlanifiesIdentifiables = extras.filter(extraSemblePlanifie);
  if (extrasPlanifiesIdentifiables.length) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.VALIDATED,
      mode: config.mode,
      preuveId: `periode:${preuves.periode?.debut || preuves.date}:plaisir-programme`,
      raison: 'Au moins un extra consommé comporte une indication explicite qu’il avait été planifié.',
      donnees: {
        source: 'observation_duration',
        observationSeulement: true,
        extraRealiseIdentifie: true,
        planificationIdentifiable: true,
        extras: extrasPlanifiesIdentifiables.map(extra => ({
          id: extra.id,
          date: extra.date,
          heure: extra.heure || null,
          aliment: extra.aliment || extra.type || null
        }))
      }
    });
  }

  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
    mode: config.mode,
    preuveId: `periode:${preuves.periode?.debut || preuves.date}:plaisir-programme`,
    raison: 'Un ou plusieurs extras ont été consommés, mais les données actuelles ne prouvent pas qu’ils avaient été planifiés. Une confirmation est nécessaire.',
    donnees: {
      source: 'observation_duration',
      observationSeulement: true,
      extraRealiseIdentifie: true,
      planificationIdentifiable: false,
      extras: extras.map(extra => ({
        id: extra.id,
        date: extra.date,
        heure: extra.heure || null,
        aliment: extra.aliment || extra.type || null
      }))
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
  const repas = preuves.repas || [];
  if (!repas.length) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.INSUFFICIENT_DATA,
      mode: config.mode,
      raison: 'Aucun repas saisi pour rechercher un aliment cru et non sucré.'
    });
  }

  // Le schéma repas_reels expose l'aliment/catégorie mais aucun attribut fiable
  // décrivant la cuisson ou le caractère cru. Un nom d'aliment seul ne suffit pas :
  // tomate, carotte, fruit, etc. peuvent être consommés crus, cuits ou préparés.
  const candidats = repas
    .filter(item => normaliser(item?.aliment || item?.categorie))
    .map(item => ({
      id: item.id,
      date: item.date,
      typeRepas: item.type_repas || item.type || null,
      aliment: item.aliment || null,
      categorie: item.categorie || null
    }));

  if (!candidats.length) {
    return creerDecisionValidation({
      decision: VALIDATION_DECISION.INSUFFICIENT_DATA,
      mode: config.fallback || VALIDATION_MODE.MIXED,
      raison: 'Les repas existent mais aucun aliment exploitable n’est renseigné pour observer ce défi.'
    });
  }

  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
    mode: config.fallback || VALIDATION_MODE.MIXED,
    preuveId: `jour:${preuves.date}:cru`,
    raison: 'Des aliments sont saisis, mais les données actuelles ne permettent pas de prouver à la fois qu’un aliment était cru et non sucré. Une confirmation courte est nécessaire.',
    donnees: {
      source: 'observation_duration',
      observationSeulement: true,
      candidats,
      cruInfere: false,
      nonSucreInfere: false
    }
  });
}

function evaluerExcuses(preuves, config) {
  const repas = preuves.repas || [];
  if (!repas.length) return creerDecisionValidation({ decision: VALIDATION_DECISION.INSUFFICIENT_DATA, mode: config.mode, raison: 'Aucun repas saisi pour rattacher une observation à une situation réelle.' });
  const candidat = [...repas].reverse()[0];
  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION, mode: config.mode,
    preuveId: `repas:${candidat.id}:excuse`,
    raison: 'La présence d’un repas ne permet pas de savoir si une excuse ou un automatisme a été dépassé. Une confirmation personnelle est nécessaire.',
    donnees: { source: 'repas_reels', repasId: candidat.id, date: candidat.date }
  });
}

function evaluerChaudDoux(preuves, config) {
  const diners = (preuves.repas || []).filter(item => ['diner','dîner','soir'].includes(normaliser(item?.type_repas || item?.type)));
  if (!diners.length) return creerDecisionValidation({ decision: VALIDATION_DECISION.INSUFFICIENT_DATA, mode: config.mode, raison: 'Aucun dîner saisi pour observer cette occurrence.' });
  const candidat = diners[diners.length - 1];
  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION, mode: config.mode,
    preuveId: `repas:${candidat.occurrence_repas_id || candidat.id}:chaud-doux`,
    raison: 'Le dîner est identifiable, mais les données alimentaires ne suffisent pas à conclure que l’action attendue par le défi a été réalisée.',
    donnees: { source: 'repas_reels', repasId: candidat.id, occurrenceRepasId: candidat.occurrence_repas_id || null, date: candidat.date }
  });
}

function evaluerVraieFaimVraiRepas(preuves, config) {
  const repas = preuves.repas || [];
  if (!repas.length) return creerDecisionValidation({ decision: VALIDATION_DECISION.INSUFFICIENT_DATA, mode: config.mode, raison: 'Aucun repas saisi pour rattacher une tentative à une situation réelle.' });
  const candidat = [...repas].reverse()[0];
  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION, mode: config.mode,
    preuveId: `repas:${candidat.occurrence_repas_id || candidat.id}:vraie-faim`,
    raison: 'Un repas est présent, mais les données disponibles ne permettent pas de déduire à elles seules qu’il répondait à une vraie faim. Une confirmation est nécessaire.',
    donnees: { source: 'repas_reels', repasId: candidat.id, occurrenceRepasId: candidat.occurrence_repas_id || null, date: candidat.date }
  });
}

export function evaluerValidationDefi(preuves) {
  const defi = preuves?.defi;
  if (!defi?.id) return creerDecisionValidation({ decision: VALIDATION_DECISION.INSUFFICIENT_DATA, mode: VALIDATION_MODE.DECLARATIVE, raison: 'Défi absent du contexte de validation.' });

  const config = getValidationConfig(defi);
  if (!preuves.actif) return creerDecisionValidation({ decision: VALIDATION_DECISION.INSUFFICIENT_DATA, mode: config.mode, raison: 'Le défi n’est pas actif.' });

  if (defi.nom === '🍎 Pas de dessert par automatisme') return evaluerPasDessertAutomatisme(preuves, config);
  if (defi.nom === '🧠 Je suis plus fort·e que mes excuses') return evaluerExcuses(preuves, config);
  if (defi.nom === '🌡️ Chaud devant… mais doux !') return evaluerChaudDoux(preuves, config);
  if (defi.nom === '🔥 1 vraie faim = 1 vrai repas') return evaluerVraieFaimVraiRepas(preuves, config);
  if (defi.nom === '🧀 1 portion ça suffit') return evaluerUnePortion(preuves, config);
  if (defi.nom === '🚫 Le faux allié') return evaluerFauxAllie(preuves, config);
  if (defi.nom === '🔄 Je brise la chaîne') return evaluerBriseChaine(preuves, config);
  if (defi.nom === '✨ Je me programme du plaisir') return evaluerPlaisirProgramme(preuves, config);
  if (defi.nom === '💡 J’écoute mon ventre') return evaluerEcouteVentre(preuves, config);
  if (defi.nom === '💧 1 cru par jour') return evaluerCruParJour(preuves, config);

  return creerDecisionValidation({
    decision: VALIDATION_DECISION.NEEDS_CONFIRMATION,
    mode: config.mode,
    raison: config.mode === VALIDATION_MODE.DECLARATIVE ? 'Ce défi nécessite une déclaration de l’utilisateur.' : 'Le validateur spécifique de ce défi n’est pas encore raccordé.'
  });
}
