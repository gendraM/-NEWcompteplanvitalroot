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
