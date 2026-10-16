const JOUR_MS = 24 * 60 * 60 * 1000;

function nombreDepuisTexte(valeur) {
  if (typeof valeur === 'number') return Number.isFinite(valeur) ? valeur : null;
  if (typeof valeur !== 'string') return null;
  const match = valeur.replace(',', '.').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function arrondir(valeur, decimales = 1) {
  if (!Number.isFinite(valeur)) return null;
  const facteur = 10 ** decimales;
  return Math.round(valeur * facteur) / facteur;
}

function moyenne(valeurs) {
  const nombres = valeurs.filter(Number.isFinite);
  return nombres.length ? nombres.reduce((total, valeur) => total + valeur, 0) / nombres.length : null;
}

function dateValide(valeur) {
  if (!valeur) return null;
  const date = new Date(`${String(valeur).slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function extraireObjectifCourse(texte) {
  if (typeof texte !== 'string' || !texte.trim()) return {};
  const normalise = texte.toLowerCase().replace(',', '.');
  const distance = normalise.match(/(\d+(?:\.\d+)?)\s*km(?!\s*\/\s*h)/);
  const vitesse = normalise.match(/(\d+(?:\.\d+)?)\s*km\s*\/\s*h/);
  const duree = normalise.match(/(\d+(?:\.\d+)?)\s*(?:min(?:ute)?s?)/);
  const frequence = normalise.match(/(\d+)\s*(?:séance(?:s)?|fois|x)?\s*(?:par|\/)\s*semaine/);
  return {
    texte,
    distanceKm: distance ? Number(distance[1]) : null,
    vitesseKmh: vitesse ? Number(vitesse[1]) : null,
    dureeMinutes: duree ? Number(duree[1]) : null,
    frequenceHebdomadaire: frequence ? Number(frequence[1]) : null,
  };
}

function resumerSeances(seances = [], numeroPalier) {
  const prevues = seances.filter((seance) => seance?.bonus !== true && Number(seance?.palier_numero || 1) === Number(numeroPalier));
  const faites = prevues.filter((seance) => seance?.fait === true);
  return {
    numero: Number(numeroPalier),
    prevues: prevues.length,
    faites: faites.length,
    regularitePourcentage: prevues.length ? Math.round((faites.length / prevues.length) * 100) : 0,
    dureeMoyenne: arrondir(moyenne(faites.map((seance) => nombreDepuisTexte(seance?.duree_reelle))), 1),
    vitesseMoyenne: arrondir(moyenne(faites.map((seance) => nombreDepuisTexte(seance?.vitesse ?? seance?.intensite))), 2),
    distanceMoyenne: arrondir(moyenne(faites.map((seance) => nombreDepuisTexte(seance?.distance_km))), 2),
  };
}

function ecart(valeur, precedente, decimales = 1) {
  return Number.isFinite(valeur) && Number.isFinite(precedente) ? arrondir(valeur - precedente, decimales) : null;
}

export function construireTrajectoireIdeal(ideal) {
  const numero = Number(ideal?.palier_numero || 1);
  const toutes = ideal?.historique_seances_reelles || ideal?.seances_reelles || [];
  const courant = resumerSeances(toutes, numero);
  const precedent = numero > 1 ? resumerSeances(toutes, numero - 1) : null;
  const comparaison = precedent && precedent.prevues > 0 ? {
    regularitePoints: courant.regularitePourcentage - precedent.regularitePourcentage,
    dureeMinutes: ecart(courant.dureeMoyenne, precedent.dureeMoyenne),
    vitesseKmh: ecart(courant.vitesseMoyenne, precedent.vitesseMoyenne, 2),
    distanceKm: ecart(courant.distanceMoyenne, precedent.distanceMoyenne, 2),
  } : null;
  const capFinal = extraireObjectifCourse(ideal?.titre || '');
  const sousObjectif = extraireObjectifCourse(ideal?.indicateur_principal || '');
  const dureeRequise = capFinal.distanceKm && capFinal.vitesseKmh ? arrondir((capFinal.distanceKm / capFinal.vitesseKmh) * 60, 1) : null;
  const finPalier = dateValide(ideal?.cycle_palier?.finPalier);
  const dateCible = dateValide(ideal?.date_cible);
  const dureePalier = Math.max(1, Number(ideal?.plan_params_valides?.palierDuree || 4));
  const paliersRestants = finPalier && dateCible && dateCible > finPalier ? Math.floor((dateCible - finPalier) / JOUR_MS / (dureePalier * 7)) : 0;
  const dureeCourante = Number(ideal?.plan_params_valides?.duree) || courant.dureeMoyenne;
  const vitesseCourante = nombreDepuisTexte(ideal?.plan_params_valides?.intensite) || courant.vitesseMoyenne;
  const progression = ideal?.proposition_progression;
  const pasDuree = progression?.type === 'progresser' && progression?.dimension === 'duree' ? Math.max(0, Number(progression.nouvelleCible) - Number(progression.ancienneCible)) : 0;
  const pasVitesse = progression?.type === 'progresser' && progression?.dimension === 'vitesse' ? Math.max(0, Number(progression.nouvelleCible) - Number(progression.ancienneCible)) : 0;
  const dureeProjetee = Number.isFinite(dureeCourante) ? arrondir(dureeCourante + pasDuree * paliersRestants, 1) : null;
  const vitesseProjetee = Number.isFinite(vitesseCourante) ? arrondir(vitesseCourante + pasVitesse * paliersRestants, 2) : null;
  const objectifMesurable = Number.isFinite(dureeRequise) && Number.isFinite(dureeProjetee) && Number.isFinite(capFinal.vitesseKmh);
  return {
    capFinal, sousObjectif, courant, precedent, comparaison,
    projection: {
      dureeRequise, paliersRestants, dureeProjetee, vitesseProjetee,
      objectifAtteignable: objectifMesurable ? dureeProjetee >= dureeRequise && Number(vitesseProjetee) >= capFinal.vitesseKmh : null,
    },
    sousObjectifAtteint: {
      duree: Number.isFinite(sousObjectif.dureeMinutes) && Number.isFinite(courant.dureeMoyenne) ? courant.dureeMoyenne >= sousObjectif.dureeMinutes : null,
      vitesse: Number.isFinite(sousObjectif.vitesseKmh) && Number.isFinite(courant.vitesseMoyenne) ? courant.vitesseMoyenne >= sousObjectif.vitesseKmh : null,
    },
  };
}
