import { normaliserRepasPlanifie } from './planificationRepas';
import { calculerProfilComplet } from './routeurPoids';

const ORDRE_REPAS = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'];

function dateIsoValide(valeur) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(valeur || ''))) return false;
  const [annee, mois, jour] = valeur.split('-').map(Number);
  const date = new Date(Date.UTC(annee, mois - 1, jour));
  return date.getUTCFullYear() === annee && date.getUTCMonth() === mois - 1 && date.getUTCDate() === jour;
}

function datesInclusives(debut, fin) {
  const dates = [];
  const [annee, mois, jour] = debut.split('-').map(Number);
  const date = new Date(Date.UTC(annee, mois - 1, jour));
  while (date.toISOString().slice(0, 10) <= fin) {
    dates.push(date.toISOString().slice(0, 10));
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return dates;
}

function nombrePositif(valeur) {
  const nombre = Number(valeur);
  return Number.isFinite(nombre) && nombre > 0 ? Math.round(nombre) : null;
}

function ordreType(type) {
  const position = ORDRE_REPAS.indexOf(type);
  return position === -1 ? ORDRE_REPAS.length : position;
}

export function validerPeriodeBudget(debut, fin) {
  if (!dateIsoValide(debut) || !dateIsoValide(fin)) {
    return { valide: false, erreur: 'Choisis une date de début et une date de fin valides.' };
  }
  if (debut > fin) {
    return { valide: false, erreur: 'La date de fin doit être postérieure à la date de début.' };
  }
  return { valide: true, erreur: null };
}

export function determinerObjectifCaloriqueProfil(profil) {
  if (!profil) return { disponible: false, objectif_calorique_jour: null, raison: 'Profil absent.' };

  const poidsDepart = Number(profil.poids_de_depart);
  const poidsObjectif = Number(profil.objectif);
  if (!Number.isFinite(poidsDepart) || !Number.isFinite(poidsObjectif)) {
    return { disponible: false, objectif_calorique_jour: null, raison: 'Poids de départ ou objectif absent.' };
  }

  const objectif = poidsDepart > poidsObjectif ? 'perte' : poidsDepart < poidsObjectif ? 'prise' : 'maintien';
  const calculs = calculerProfilComplet({ ...profil, objectif });
  const cible = nombrePositif(calculs?.apport_calorique_cible);
  if (cible === null) {
    return { disponible: false, objectif_calorique_jour: null, raison: 'Profil incomplet pour calculer l’objectif calorique.' };
  }

  return {
    disponible: true,
    objectif_calorique_jour: cible,
    raison: null,
    source: 'routeur_poids',
    type_objectif: objectif
  };
}

export async function chargerObjectifCaloriqueProfil(supabase, userId) {
  if (!supabase || !userId) {
    return { disponible: false, objectif_calorique_jour: null, raison: 'Utilisateur non connecté.', error: null };
  }

  const { data, error } = await supabase
    .from('profil')
    .select('user_id, sexe, age, taille, poids_de_depart, niveau_activite, objectif, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    return { disponible: false, objectif_calorique_jour: null, raison: 'Profil impossible à charger.', error };
  }
  return { ...determinerObjectifCaloriqueProfil(data?.[0] || null), error: null };
}

function construireIngredient(ligne, referentiel) {
  const normalisee = normaliserRepasPlanifie(ligne, referentiel);
  return {
    id: ligne?.id || null,
    aliment: String(ligne?.aliment || '').trim() || 'Aliment non renseigné',
    categorie: String(ligne?.categorie || '').trim() || null,
    quantite: normalisee.quantite_affichee,
    kcal: normalisee.kcal_calculees,
    calories_connues: normalisee.kcal_calculees !== null,
    donnees_completes: normalisee.donnees_completes,
    combo_valide: Boolean(ligne?.combo_valide)
  };
}

function construireJour(date, lignes, referentiel, objectifCaloriqueJour) {
  const groupes = new Map();
  lignes.forEach(ligne => {
    const type = String(ligne?.type || '').trim() || 'Repas non renseigné';
    if (!groupes.has(type)) groupes.set(type, []);
    groupes.get(type).push(construireIngredient(ligne, referentiel));
  });

  const repas = Array.from(groupes.entries())
    .map(([type, ingredients]) => {
      const elementsConnus = ingredients.filter(item => item.calories_connues).length;
      return {
        type,
        ingredients,
        total_kcal_connues: ingredients.reduce((total, item) => total + (item.kcal || 0), 0),
        elements_connus: elementsConnus,
        elements_total: ingredients.length,
        complet: elementsConnus === ingredients.length
      };
    })
    .sort((a, b) => ordreType(a.type) - ordreType(b.type) || a.type.localeCompare(b.type, 'fr'));

  const elementsTotal = repas.reduce((total, item) => total + item.elements_total, 0);
  const elementsConnus = repas.reduce((total, item) => total + item.elements_connus, 0);
  const totalKcalConnues = repas.reduce((total, item) => total + item.total_kcal_connues, 0);
  const statut = elementsTotal === 0 ? 'vide' : elementsConnus === elementsTotal ? 'complet' : 'incomplet';
  const comparable = statut === 'complet' && objectifCaloriqueJour !== null;

  return {
    date,
    repas,
    total_kcal_connues: totalKcalConnues,
    elements_connus: elementsConnus,
    elements_total: elementsTotal,
    statut,
    objectif_calorique: objectifCaloriqueJour,
    ecart_calorique: comparable ? totalKcalConnues - objectifCaloriqueJour : null
  };
}

export function construireBudgetCaloriquePlan(repasPlanifies = [], {
  debut,
  fin,
  referentiel = [],
  objectifCaloriqueJour = null
} = {}) {
  const periode = validerPeriodeBudget(debut, fin);
  if (!periode.valide) {
    return { valide: false, erreur: periode.erreur, periode: null, jours: [], resume: null };
  }

  const objectif = nombrePositif(objectifCaloriqueJour);
  const idsVus = new Set();
  const lignes = (repasPlanifies || []).filter((ligne, index) => {
    if (!ligne || !dateIsoValide(ligne.date) || ligne.date < debut || ligne.date > fin) return false;
    const cle = ligne.id ? `id:${ligne.id}` : `ligne:${index}`;
    if (idsVus.has(cle)) return false;
    idsVus.add(cle);
    return true;
  });

  const lignesParDate = lignes.reduce((groupes, ligne) => {
    if (!groupes[ligne.date]) groupes[ligne.date] = [];
    groupes[ligne.date].push(ligne);
    return groupes;
  }, {});
  const jours = datesInclusives(debut, fin).map(date =>
    construireJour(date, lignesParDate[date] || [], referentiel, objectif)
  );

  const totalKcalConnues = jours.reduce((total, jour) => total + jour.total_kcal_connues, 0);
  const joursRenseignes = jours.filter(jour => jour.statut !== 'vide').length;
  const joursComplets = jours.filter(jour => jour.statut === 'complet').length;
  const joursIncomplets = jours.filter(jour => jour.statut === 'incomplet').length;
  const periodeComplete = joursComplets === jours.length;
  const objectifPeriode = objectif === null ? null : objectif * jours.length;

  return {
    valide: true,
    erreur: null,
    periode: { debut, fin, nombre_jours: jours.length },
    jours,
    resume: {
      total_kcal_connues: totalKcalConnues,
      moyenne_kcal_par_jour_periode: Math.round(totalKcalConnues / jours.length),
      moyenne_kcal_par_jour_renseigne: joursRenseignes ? Math.round(totalKcalConnues / joursRenseignes) : null,
      objectif_calorique_jour: objectif,
      objectif_calorique_periode: objectifPeriode,
      ecart_calorique_periode: periodeComplete && objectifPeriode !== null ? totalKcalConnues - objectifPeriode : null,
      jours_renseignes: joursRenseignes,
      jours_complets: joursComplets,
      jours_incomplets: joursIncomplets,
      jours_vides: jours.length - joursRenseignes,
      periode_complete: periodeComplete,
      lignes_planifiees: lignes.length
    }
  };
}
