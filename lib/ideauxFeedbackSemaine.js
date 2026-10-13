function nombre(valeur) {
  if (valeur === null || valeur === undefined || valeur === '') return null;
  if (typeof valeur === 'string') valeur = valeur.replace(',', '.').match(/\d+(?:\.\d+)?/)?.[0];
  const resultat = Number(valeur);
  return Number.isFinite(resultat) ? resultat : null;
}

function moyenne(valeurs) {
  const nombres = valeurs.filter((valeur) => valeur !== null);
  if (!nombres.length) return null;
  return Math.round((nombres.reduce((total, valeur) => total + valeur, 0) / nombres.length) * 10) / 10;
}

function formater(valeur) {
  return String(valeur).replace('.', ',');
}

export function analyserSemaineIdeal(seances = []) {
  const prevues = seances.filter((seance) => seance?.bonus !== true);
  const realisees = prevues.filter((seance) => seance?.fait === true);
  const dureeMoyenne = moyenne(realisees.map((seance) => nombre(seance.duree_reelle)));
  const vitesseMoyenne = moyenne(realisees.map((seance) => nombre(seance.vitesse_reelle)));
  const dureeCible = moyenne(realisees.map((seance) => nombre(seance.duree_prevue)));
  const vitesseCible = moyenne(realisees.map((seance) => nombre(seance.vitesse_prevue)));
  const dureesMesurees = realisees.filter((seance) => nombre(seance.duree_reelle) !== null && nombre(seance.duree_prevue) !== null);
  const vitessesMesurees = realisees.filter((seance) => nombre(seance.vitesse_reelle) !== null && nombre(seance.vitesse_prevue) !== null);
  const dureesSuperieures = dureesMesurees.filter((seance) => nombre(seance.duree_reelle) > nombre(seance.duree_prevue)).length;
  const vitessesSuperieures = vitessesMesurees.filter((seance) => nombre(seance.vitesse_reelle) >= nombre(seance.vitesse_prevue) + 0.1).length;
  const signalDuree = dureesMesurees.length >= 2 && dureesSuperieures / dureesMesurees.length >= 0.6;
  const signalVitesse = vitessesMesurees.length >= 2 && vitessesSuperieures / vitessesMesurees.length >= 0.6;
  const ecartDuree = dureeMoyenne !== null && dureeCible !== null ? Math.round((dureeMoyenne - dureeCible) * 10) / 10 : null;
  const ecartVitesse = vitesseMoyenne !== null && vitesseCible !== null ? Math.round((vitesseMoyenne - vitesseCible) * 10) / 10 : null;

  let message;
  let niveau = 'a_demarrer';
  if (!realisees.length) {
    message = `0/${prevues.length} séance réalisée. Prochaine action : commencer par la première séance prévue, sans chercher à rattraper toute la semaine d’un coup.`;
  } else if (realisees.length < prevues.length) {
    niveau = 'en_cours';
    const performance = signalVitesse
      ? ` La vitesse moyenne est déjà supérieure de ${formater(ecartVitesse)} km/h au repère.`
      : signalDuree ? ` La durée moyenne dépasse déjà le repère de ${formater(ecartDuree)} min.` : '';
    message = `${realisees.length}/${prevues.length} séances réalisées.${performance} La priorité reste maintenant de réaliser la prochaine séance prévue.`;
  } else if (signalVitesse || signalDuree) {
    niveau = 'signal_progression';
    const constats = [];
    if (signalDuree) constats.push(`durée moyenne +${formater(ecartDuree)} min`);
    if (signalVitesse) constats.push(`vitesse moyenne +${formater(ecartVitesse)} km/h`);
    message = `Semaine tenue. Écart répété observé : ${constats.join(' et ')}. C’est un signal de progression, pas encore un nouveau standard : le prochain palier ne montera que si cette évolution se répète sans perdre en régularité.`;
  } else {
    niveau = 'semaine_tenue';
    const sousRepere = (ecartDuree !== null && ecartDuree < 0) || (ecartVitesse !== null && ecartVitesse < 0);
    message = sousRepere
      ? 'Toutes les séances sont réalisées, mais un repère moyen reste sous la cible. Prochaine étape : consolider ce repère avant d’augmenter la difficulté.'
      : 'Semaine tenue au niveau prévu. L’étape suivante est de reproduire cette régularité ; la difficulté n’augmentera qu’après confirmation sur plusieurs séances.';
  }

  return {
    prevues: prevues.length,
    realisees: realisees.length,
    dureeMoyenne,
    vitesseMoyenne,
    dureeCible,
    vitesseCible,
    ecartDuree,
    ecartVitesse,
    signalDuree,
    signalVitesse,
    niveau,
    message,
  };
}
