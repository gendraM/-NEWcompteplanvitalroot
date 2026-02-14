// Gestion des données d’historique des préparations
// Structure inspirée de la préparation jeune existante

// Exemple de structure d'une préparation terminée
// {
//   id: string,
//   userId: string | null,
//   dateDebut: string (ISO),
//   dateFin: string (ISO),
//   tauxReussite: number,
//   nbCriteresValides: number,
//   nbCriteresTotal: number,
//   criteres: [{ id, label, valide, dateValidation }],
//   messagePerso: string,
//   axesAmelioration: string[],
//   conseils: string[],
//   notesPerso: string,
//   createdAt: string (ISO)
// }

// --- Fonctions CRUD de base ---

const STORAGE_KEY = 'historiquePreparationsJeune';

// Récupérer tout l'historique (localStorage)
export function getHistoriquePreparationsJeune() {
	if (typeof window === 'undefined') return [];
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	} catch (e) {
		console.warn('Erreur lecture historique préparations jeune', e);
		return [];
	}
}

// Ajouter une préparation terminée à l'historique (localStorage)
export function ajouterPreparationHistorique(preparation) {
	if (typeof window === 'undefined') return;
	const historique = getHistoriquePreparationsJeune();
	historique.push({ ...preparation, id: preparation.id || Date.now().toString(), createdAt: new Date().toISOString() });
	localStorage.setItem(STORAGE_KEY, JSON.stringify(historique));
}

// Supprimer une préparation de l'historique (soft delete → corbeille)
export function supprimerPreparationHistorique(id) {
	if (typeof window === 'undefined') return;
	const historique = getHistoriquePreparationsJeune();
	const prepIndex = historique.findIndex(p => p.id === id);
	if (prepIndex === -1) return;
	const prepASupprimer = historique[prepIndex];
	prepASupprimer.dateSuppression = new Date().toISOString();
	// Retirer de l'historique
	historique.splice(prepIndex, 1);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(historique));
	// Ajouter à la corbeille
	const corbeille = JSON.parse(localStorage.getItem('preparationsJeuneSupprimees') || '[]');
	corbeille.unshift(prepASupprimer);
	localStorage.setItem('preparationsJeuneSupprimees', JSON.stringify(corbeille));
}

// Restaurer une préparation depuis la corbeille
export function restaurerPreparationJeune(id) {
	if (typeof window === 'undefined') return;
	const corbeille = JSON.parse(localStorage.getItem('preparationsJeuneSupprimees') || '[]');
	const prepIndex = corbeille.findIndex(p => p.id === id);
	if (prepIndex === -1) return;
	const prepARestaurer = corbeille[prepIndex];
	delete prepARestaurer.dateSuppression;
	// Retirer de la corbeille
	corbeille.splice(prepIndex, 1);
	localStorage.setItem('preparationsJeuneSupprimees', JSON.stringify(corbeille));
	// Ajouter à l'historique
	const historique = getHistoriquePreparationsJeune();
	historique.unshift(prepARestaurer);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(historique));
}

// Suppression définitive (hard delete) depuis la corbeille
export function supprimerPreparationJeuneDefinitivement(id) {
	if (typeof window === 'undefined') return;
	const corbeille = JSON.parse(localStorage.getItem('preparationsJeuneSupprimees') || '[]');
	const newCorbeille = corbeille.filter(p => p.id !== id);
	localStorage.setItem('preparationsJeuneSupprimees', JSON.stringify(newCorbeille));
}


// --- Fonctions Supabase ---

import { supabase } from './supabaseClient';

// --- Traducteur camelCase → snake_case pour Supabase ---
// Convertit les données camelCase du code en snake_case pour la BD
export function transformToSnakeCaseForPreparation(preparation) {
	const transformed = {};
	
	// Mapping des champs camelCase (code) → snake_case (BD)
	const fieldMapping = {
		id: 'id',
		userId: 'user_id',
		startDate: 'date_debut_jeune',
		duration: 'duree_jeune_jours',
		goal: 'objectif_jeune',
		messagePerso: 'message_personnel',
		msgTexte: 'message_personnel',
		poids: 'poids_depart',
		poidsDepart: 'poids_depart',
		dateDebut: 'date_debut_jeune',
		dateFin: 'date_fin_jeune',
		dureeReprise: 'duree_reprise_jours',
		dateDebutReprise: 'date_debut_reprise',
		dateFinReprise: 'date_fin_reprise',
		phases: 'phases',
		options: 'options',
		listeCourses: 'liste_courses',
		planGenereL: 'plan_genere_le',
		planValidL: 'plan_valide_le',
		repriseCommenceeL: 'reprise_commencee_le',
		repriseTermineL: 'reprise_terminee_le',
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		jeuneId: 'jeune_id',
	};
	
	// Parcourir tous les champs de la préparation
	for (const [camelKey, value] of Object.entries(preparation)) {
		const snakeKey = fieldMapping[camelKey] || camelKey;
		transformed[snakeKey] = value;
	}
	
	return transformed;
}

// --- Traducteur inverse : snake_case → camelCase ---
// Convertit les données snake_case (BD) en camelCase (code)
export function transformToCamelCaseFromPreparation(preparation) {
	if (!preparation) return null;
	
	const transformed = {};
	
	// Mapping des champs snake_case (BD) → camelCase (code)
	const fieldMapping = {
		id: 'id',
		user_id: 'userId',
		date_debut_jeune: 'startDate',
		duree_jeune_jours: 'duration',
		objectif_jeune: 'goal',
		message_personnel: 'messagePerso',
		poids_depart: 'poidsDepart',
		date_fin_jeune: 'dateFin',
		duree_reprise_jours: 'dureeReprise',
		date_debut_reprise: 'dateDebutReprise',
		date_fin_reprise: 'dateFinReprise',
		phases: 'phases',
		options: 'options',
		liste_courses: 'listeCourses',
		plan_genere_le: 'planGenereL',
		plan_valide_le: 'planValidL',
		reprise_commencee_le: 'repriseCommenceeL',
		reprise_terminee_le: 'repriseTermineL',
		created_at: 'createdAt',
		updated_at: 'updatedAt',
		jeune_id: 'jeuneId',
	};
	
	// Parcourir tous les champs de la préparation
	for (const [snakeKey, value] of Object.entries(preparation)) {
		const camelKey = fieldMapping[snakeKey] || snakeKey;
		transformed[camelKey] = value;
	}
	
	return transformed;
}

// Générer un ID uuid-like si absent
export function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0;
		const v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

// Récupérer l'historique des préparations depuis Supabase
export async function getHistoriquePreparationsJeuneSupabase(userId) {
	if (!userId) return [];
	try {
		const { data, error } = await supabase
			.from('preparations_jeune')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: true });
		if (error) throw error;
		return data || [];
	} catch (e) {
		console.warn('Erreur lecture Supabase historique préparations jeune', e);
		return [];
	}
}

// Sauvegarder (ajouter ou mettre à jour) une préparation dans Supabase (synchronisation quotidienne)
export async function savePreparationJeuneSupabase(userId, preparation) {
	if (!userId || !preparation) return null;
	
	// ⚠️ VALIDATIONS MINIMALES - Refuser les données incomplètes
	if (!preparation.startDate || !preparation.duration) {
		console.warn('⚠️ [savePreparationJeuneSupabase] Données incomplètes - REFUSÉE:', {
			startDate: preparation.startDate,
			duration: preparation.duration,
		});
		return null; // Pas de sauvegarde si données manquantes
	}
	
	try {
		console.log('💾 [savePreparationJeuneSupabase] ENTREE - preparation reçue:', {
			id: preparation.id,
			startDate: preparation.startDate,
			duration: preparation.duration,
			allKeys: Object.keys(preparation)
		});
		
		// Ajout/MAJ du champ updatedAt à chaque sauvegarde
		const now = new Date().toISOString();
		const prepToSave = { ...preparation, userId, updatedAt: now };
		
		// Générer un ID si absent (UUID type)
		if (!prepToSave.id) {
			prepToSave.id = generateUUID();
			console.log('⚠️ [savePreparationJeuneSupabase] ID ABSENT! Generé un UUID:', prepToSave.id);
		}
		
		// Transformer camelCase → snake_case pour Supabase
		const prepTransformed = transformToSnakeCaseForPreparation(prepToSave);
		
		// ⚠️ Filtrer les colonnes qui existent réellement dans la BD
		const colonnesValides = [
			'id', 'user_id', 'jeune_id', 'duree_jeune_jours', 'poids_depart',
			'date_debut_jeune', 'date_fin_jeune', 'duree_reprise_jours',
			'date_debut_reprise', 'date_fin_reprise', 'phases', 'options',
			'liste_courses', 'message_personnel', 'statut',
			'plan_genere_le', 'plan_valide_le', 'reprise_commencee_le',
			'reprise_terminee_le', 'created_at', 'updated_at', 'objectif_jeune'
		];
		const prepFiltered = {};
		for (const [key, value] of Object.entries(prepTransformed)) {
			if (colonnesValides.includes(key)) {
				prepFiltered[key] = value;
			}
		}
		
		console.log('💾 Données avant upsert (snake_case, filtrées):', {
			id: prepFiltered.id,
			user_id: prepFiltered.user_id,
			date_debut_jeune: prepFiltered.date_debut_jeune,
			duree_jeune_jours: prepFiltered.duree_jeune_jours,
		});
		
		const { data, error } = await supabase
			.from('preparations_jeune')
			.upsert([prepFiltered], { onConflict: ['id'] });
		if (error) throw error;
		return data;
	} catch (e) {
		console.error('❌ Erreur sauvegarde Supabase préparation jeune:', {
			message: e?.message,
			code: e?.code,
			status: e?.status,
			details: e?.details,
			hint: e?.hint,
			fullError: e
		});
		return null;
	}
}

// Récupérer la version la plus récente (cloud vs local) selon updatedAt
export async function getPreparationJeuneSync(userId, localPreparation) {
	if (!userId) return localPreparation;
	try {
		const { data, error } = await supabase
			.from('preparations_jeune')
			.select('*')
			.eq('user_id', userId)
			.order('updated_at', { ascending: false })
			.limit(1);
		if (error) throw error;
		const cloudPrep = data && data[0] ? data[0] : null;
		if (!cloudPrep) return localPreparation;
		
		// ✅ Transformer les données snake_case → camelCase
		const cloudPrepCamelCase = transformToCamelCaseFromPreparation(cloudPrep);
		
		if (!localPreparation) return cloudPrepCamelCase;
		// Comparaison des dates (cloud et local tous deux en camelCase maintenant)
		const localDate = new Date(localPreparation.updatedAt || localPreparation.createdAt || 0);
		const cloudDate = new Date(cloudPrepCamelCase.updatedAt || cloudPrepCamelCase.createdAt || 0);
		return cloudDate > localDate ? cloudPrepCamelCase : localPreparation;
	} catch (e) {
		console.warn('Erreur synchronisation préparation jeune (cloud vs local)', e);
		return localPreparation;
	}
}

// Supprimer une préparation de Supabase
export async function supprimerPreparationJeuneSupabase(userId, id) {
	if (!userId || !id) return null;
	try {
		const { error } = await supabase
			.from('preparations_jeune')
			.delete()
			.eq('userId', userId)
			.eq('id', id);
		if (error) throw error;
		return true;
	} catch (e) {
		console.warn('Erreur suppression Supabase préparation jeune', e);
		return false;
	}
}
