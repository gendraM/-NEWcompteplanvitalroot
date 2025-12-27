// ============================================
// GESTION INDEXEDDB POUR AUDIOS
// ============================================
// Stockage audios volumineux (localStorage limité à 5-10 MB)
// IndexedDB permet de stocker jusqu'à 500 MB+ selon navigateur

const DB_NAME = 'JournalSpirituelDB';
const DB_VERSION = 1;
const STORE_NAME = 'audios';

// Ouvrir/créer base de données
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    // Création du store si première fois
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        
        // Index pour recherches rapides
        objectStore.createIndex('date', 'date', { unique: false });
        objectStore.createIndex('type', 'type', { unique: false });
        objectStore.createIndex('jourJeune', 'jourJeune', { unique: false });
      }
    };
  });
};

// Sauvegarder audio
export const sauvegarderAudio = async (audioData) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const audio = {
      id: Date.now(),
      blob: audioData.blob,
      type: audioData.type, // meditation, priere, reflexion, libre
      titre: audioData.titre || 'Sans titre',
      note: audioData.note || '',
      tags: audioData.tags || [],
      duree: audioData.duree, // en secondes
      date: new Date().toISOString(),
      dateFormatee: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      jourJeune: audioData.jourJeune,
      taille: audioData.blob.size // en bytes
    };

    return new Promise((resolve, reject) => {
      const request = store.add(audio);
      request.onsuccess = () => resolve(audio.id);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Erreur sauvegarde audio:', error);
    throw error;
  }
};

// Récupérer tous les audios
export const recupererTousLesAudios = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Erreur récupération audios:', error);
    return [];
  }
};

// Récupérer un audio par ID
export const recupererAudio = async (id) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Erreur récupération audio:', error);
    return null;
  }
};

// Supprimer audio
export const supprimerAudio = async (id) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Erreur suppression audio:', error);
    return false;
  }
};

// Récupérer audios par type
export const recupererAudiosParType = async (type) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('type');

    return new Promise((resolve, reject) => {
      const request = index.getAll(type);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Erreur récupération audios par type:', error);
    return [];
  }
};

// Calculer espace utilisé
export const calculerEspaceUtilise = async () => {
  try {
    const audios = await recupererTousLesAudios();
    const tailleTotal = audios.reduce((total, audio) => total + (audio.taille || 0), 0);
    
    return {
      nombreAudios: audios.length,
      tailleBytes: tailleTotal,
      tailleMB: (tailleTotal / (1024 * 1024)).toFixed(2),
      tailleGB: (tailleTotal / (1024 * 1024 * 1024)).toFixed(3)
    };
  } catch (error) {
    console.error('Erreur calcul espace:', error);
    return { nombreAudios: 0, tailleBytes: 0, tailleMB: '0', tailleGB: '0' };
  }
};

// Vérifier quota disponible (si API disponible)
export const verifierQuotaDisponible = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimation = await navigator.storage.estimate();
      const pourcentageUtilise = ((estimation.usage / estimation.quota) * 100).toFixed(2);
      
      return {
        quota: estimation.quota,
        usage: estimation.usage,
        quotaMB: (estimation.quota / (1024 * 1024)).toFixed(0),
        usageMB: (estimation.usage / (1024 * 1024)).toFixed(2),
        pourcentageUtilise: pourcentageUtilise,
        disponible: estimation.quota - estimation.usage
      };
    } catch (error) {
      console.error('Erreur vérification quota:', error);
      return null;
    }
  }
  return null;
};

// Nettoyer vieux audios (garde les 50 plus récents)
export const nettoyerVieuxAudios = async (limite = 50) => {
  try {
    const audios = await recupererTousLesAudios();
    
    if (audios.length <= limite) {
      return { supprime: 0, conserve: audios.length };
    }

    // Trier par date (plus récent en premier)
    const audiosTries = audios.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Supprimer les audios au-delà de la limite
    const audiosASupprimer = audiosTries.slice(limite);
    
    for (const audio of audiosASupprimer) {
      await supprimerAudio(audio.id);
    }

    return {
      supprime: audiosASupprimer.length,
      conserve: limite,
      espaceLibereMB: (audiosASupprimer.reduce((total, a) => total + a.taille, 0) / (1024 * 1024)).toFixed(2)
    };
  } catch (error) {
    console.error('Erreur nettoyage audios:', error);
    return { supprime: 0, conserve: 0 };
  }
};

// Exporter audio (téléchargement)
export const exporterAudio = async (id) => {
  try {
    const audio = await recupererAudio(id);
    if (!audio) return false;

    const url = URL.createObjectURL(audio.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${audio.titre.replace(/[^a-z0-9]/gi, '_')}_${audio.dateFormatee.replace(/[^0-9]/g, '')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Erreur export audio:', error);
    return false;
  }
};

// ============================================
// FONCTIONS D'ARCHIVAGE POUR HISTORIQUE JEÛNES
// ============================================

// Récupérer audios d'un jeûne spécifique par plage de dates
export const recupererAudiosParJeune = async (dateDebut, dateFin) => {
  try {
    const audios = await recupererTousLesAudios();
    
    // Filtrer par date de création entre dateDebut et dateFin
    const dateDebutObj = new Date(dateDebut);
    const dateFinObj = new Date(dateFin);
    
    return audios.filter(audio => {
      const dateAudio = new Date(audio.date);
      return dateAudio >= dateDebutObj && dateAudio <= dateFinObj;
    });
  } catch (error) {
    console.error('Erreur récupération audios par jeûne:', error);
    return [];
  }
};

// Archiver audios d'un jeûne (copier vers store d'archives)
export const archiverAudiosJeune = async (dateDebut, dateFin, idJeune) => {
  try {
    const audios = await recupererAudiosParJeune(dateDebut, dateFin);
    
    if (audios.length === 0) {
      return { success: true, count: 0 };
    }

    // Ajouter l'identifiant du jeûne archivé à chaque audio
    const audiosArchives = audios.map(audio => ({
      ...audio,
      idJeuneArchive: idJeune,
      dateArchivage: new Date().toISOString()
    }));

    // Sauvegarder dans localStorage (métadonnées légères)
    const archivesExistantes = JSON.parse(localStorage.getItem('audiosArchives') || '{}');
    archivesExistantes[idJeune] = audiosArchives.map(a => ({
      id: a.id,
      titre: a.titre,
      type: a.type,
      duree: a.duree,
      date: a.date,
      jourJeune: a.jourJeune,
      taille: a.taille,
      note: a.note,
      tags: a.tags
      // On ne stocke PAS le blob dans localStorage
    }));
    localStorage.setItem('audiosArchives', JSON.stringify(archivesExistantes));

    console.log(`✅ ${audios.length} audios archivés pour jeûne ${idJeune}`);
    return { success: true, count: audios.length };
  } catch (error) {
    console.error('Erreur archivage audios:', error);
    return { success: false, count: 0, error: error.message };
  }
};

// Récupérer métadonnées audios archivés d'un jeûne
export const recupererAudiosArchives = async (idJeune) => {
  try {
    const archives = JSON.parse(localStorage.getItem('audiosArchives') || '{}');
    return archives[idJeune] || [];
  } catch (error) {
    console.error('Erreur récupération audios archivés:', error);
    return [];
  }
};

// Restaurer audio complet d'un jeûne archivé (si toujours dans IndexedDB)
export const restaurerAudioArchive = async (idAudio) => {
  try {
    return await recupererAudio(idAudio);
  } catch (error) {
    console.error('Erreur restauration audio:', error);
    return null;
  }
};
