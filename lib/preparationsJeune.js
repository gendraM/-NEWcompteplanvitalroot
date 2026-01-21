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

// Récupérer l'historique des préparations depuis Supabase
export async function getHistoriquePreparationsJeuneSupabase(userId) {
	if (!userId) return [];
	try {
		const { data, error } = await supabase
			.from('preparations_jeune')
			.select('*')
			.eq('userId', userId)
			.order('createdAt', { ascending: true });
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
	try {
		// Ajout/MAJ du champ updatedAt à chaque sauvegarde
		const now = new Date().toISOString();
		const prepToSave = { ...preparation, userId, updatedAt: now };
		const { data, error } = await supabase
			.from('preparations_jeune')
			.upsert([prepToSave], { onConflict: ['id'] });
		if (error) throw error;
		return data;
	} catch (e) {
		console.warn('Erreur sauvegarde Supabase préparation jeune', e);
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
			.eq('userId', userId)
			.order('updatedAt', { ascending: false })
			.limit(1);
		if (error) throw error;
		const cloudPrep = data && data[0] ? data[0] : null;
		if (!cloudPrep) return localPreparation;
		if (!localPreparation) return cloudPrep;
		// Comparaison des dates
		const localDate = new Date(localPreparation.updatedAt || localPreparation.createdAt || 0);
		const cloudDate = new Date(cloudPrep.updatedAt || cloudPrep.createdAt || 0);
		return cloudDate > localDate ? cloudPrep : localPreparation;
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
