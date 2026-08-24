import { serialiserQuantitePlanifiee } from './planificationRepas';

function nombreFini(valeur) {
  if (valeur === null || valeur === undefined || String(valeur).trim() === '') return null;
  const nombre = Number(String(valeur).trim().replace(',', '.'));
  return Number.isFinite(nombre) ? nombre : null;
}

export function normaliserComposantRepas(composant, index = 0) {
  const quantite = nombreFini(composant?.quantite ?? composant?.quantite_valeur);
  const kcal = nombreFini(composant?.kcal);
  const qn = nombreFini(composant?.qn);
  return {
    id: composant?.id || `composant-${index + 1}`,
    nom: String(composant?.nom || composant?.aliment || '').trim(),
    categorie: String(composant?.categorie || '').trim(),
    quantite,
    unite: String(composant?.unite || composant?.quantite_unite || '').trim(),
    kcal: kcal === null ? null : Math.round(kcal),
    qn
  };
}

export function validerCompositionRepas(composition = []) {
  const composants = composition.map(normaliserComposantRepas);
  const erreurs = [];
  if (composants.length < 2) erreurs.push('Un repas composé doit contenir au moins deux aliments.');
  composants.forEach((composant, index) => {
    if (!composant.nom) erreurs.push(`Aliment ${index + 1} absent.`);
    if (!composant.categorie) erreurs.push(`Catégorie de ${composant.nom || `l’aliment ${index + 1}`} absente.`);
    if (composant.quantite === null || composant.quantite <= 0 || !composant.unite) {
      erreurs.push(`Quantité ou unité de ${composant.nom || `l’aliment ${index + 1}`} invalide.`);
    }
    if (composant.kcal === null || composant.kcal < 0) {
      erreurs.push(`Calories de ${composant.nom || `l’aliment ${index + 1}`} invalides.`);
    }
  });
  return { valide: erreurs.length === 0, erreurs, composants };
}

export function calculerResumeRepasCompose(composition = []) {
  const composants = composition.map(normaliserComposantRepas);
  const kcalTotal = composants.reduce((total, composant) => total + (composant.kcal || 0), 0);
  const composantsQn = composants.filter(composant => composant.qn !== null && composant.kcal !== null);
  const poidsQn = composantsQn.reduce((total, composant) => total + Math.max(composant.kcal, 1), 0);
  const qnMoyen = poidsQn > 0
    ? Number((composantsQn.reduce((total, composant) => total + composant.qn * Math.max(composant.kcal, 1), 0) / poidsQn).toFixed(2))
    : null;
  return { kcalTotal, qnMoyen, nombreAliments: composants.length };
}

export function construirePayloadRepasCompose({ userId, nom, composition }) {
  const validation = validerCompositionRepas(composition);
  if (!userId) return { valide: false, erreurs: ['Utilisateur non connecté.'], payload: null };
  if (!String(nom || '').trim()) return { valide: false, erreurs: ['Nom du repas absent.'], payload: null };
  if (!validation.valide) return { valide: false, erreurs: validation.erreurs, payload: null };

  const resume = calculerResumeRepasCompose(validation.composants);
  return {
    valide: true,
    erreurs: [],
    payload: {
      user_id: userId,
      nom: String(nom).trim(),
      composition: validation.composants,
      quantite_par_assiette: {
        version: 1,
        portions: validation.composants.map(({ id, nom: aliment, quantite, unite }) => ({ id, aliment, quantite, unite })),
        kcal_total: resume.kcalTotal,
        qn_moyen: resume.qnMoyen
      }
    }
  };
}

export function normaliserRepasCompose(repas) {
  const composition = Array.isArray(repas?.composition)
    ? repas.composition.map(normaliserComposantRepas)
    : [];
  return {
    ...repas,
    nom: String(repas?.nom || 'Repas sans nom').trim(),
    composition,
    resume: calculerResumeRepasCompose(composition)
  };
}

export function construireOccurrencesPlanifiees(repas, { userId, date, type }) {
  const modele = normaliserRepasCompose(repas);
  if (!userId || !date || !type || !validerCompositionRepas(modele.composition).valide) return [];
  return modele.composition.map(composant => ({
    user_id: userId,
    date,
    type,
    aliment: composant.nom,
    categorie: composant.categorie,
    quantite: serialiserQuantitePlanifiee(composant.quantite, composant.unite),
    kcal: composant.kcal,
    combo_valide: true
  }));
}

export function construireOccurrencesReelles(repas, { userId, date, type, heure = null, satiete = '', ressenti = '', note = '' }) {
  const modele = normaliserRepasCompose(repas);
  if (!userId || !date || !type || !validerCompositionRepas(modele.composition).valide) return [];
  const tag = `repas_compose:${repas.id || 'modele'}:${modele.nom}`;
  return modele.composition.map(composant => ({
    user_id: userId,
    date,
    type,
    heure,
    aliment: composant.nom,
    categorie: composant.categorie,
    quantite: serialiserQuantitePlanifiee(composant.quantite, composant.unite),
    kcal: composant.kcal,
    est_extra: false,
    regle_respectee: null,
    satiete,
    ressenti,
    note: note || `Repas composé : ${modele.nom}`,
    tag
  }));
}

export async function listerRepasComposes(supabase, userId) {
  if (!supabase || !userId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('repas_complets')
    .select('id, user_id, nom, composition, quantite_par_assiette, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data: (data || []).map(normaliserRepasCompose), error };
}

export async function creerRepasCompose(supabase, donnees) {
  const resultat = construirePayloadRepasCompose(donnees);
  if (!resultat.valide) return { data: null, error: new Error(resultat.erreurs.join(' ')) };
  const { data, error } = await supabase.from('repas_complets').insert([resultat.payload]).select().single();
  return { data: data ? normaliserRepasCompose(data) : null, error };
}

export async function modifierRepasCompose(supabase, id, donnees) {
  const resultat = construirePayloadRepasCompose(donnees);
  if (!id || !resultat.valide) return { data: null, error: new Error(resultat.erreurs.join(' ') || 'Repas absent.') };
  const { user_id, ...modifications } = resultat.payload;
  const { data, error } = await supabase
    .from('repas_complets')
    .update(modifications)
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .single();
  return { data: data ? normaliserRepasCompose(data) : null, error };
}

export async function supprimerRepasCompose(supabase, id, userId) {
  if (!id || !userId) return { error: new Error('Repas ou utilisateur absent.') };
  return supabase.from('repas_complets').delete().eq('id', id).eq('user_id', userId);
}
