/**
 * Gestion de l'archivage des données du journal spirituel
 * Inclut : méditations, versets, questions, intentions, écritures, audios
 */

import { archiverAudiosJeune, recupererAudiosArchives } from './audioStorage';

const getArchiveStorageKey = (key, userId) => (userId ? `${key}_${userId}` : key);

/**
 * Archiver toutes les données spirituelles d'un jeûne
 */
export const archiverDonneesSpirituellesJeune = async (dateDebut, dateFin, idJeune, userId = null) => {
  try {
    const resultat = {
      meditations: 0,
      versets: 0,
      questions: 0,
      intentions: 0,
      ecritures: 0,
      audios: 0
    };

    // 1. MÉDITATIONS (localStorage)
    const meditationsLS = JSON.parse(localStorage.getItem(getArchiveStorageKey('meditationsHistorique', userId)) || '[]');
    const meditationsJeune = filtrerParDates(meditationsLS, dateDebut, dateFin);
    if (meditationsJeune.length > 0) {
      const archivesMeditations = JSON.parse(localStorage.getItem(getArchiveStorageKey('meditationsArchives', userId)) || '{}');
      archivesMeditations[idJeune] = meditationsJeune;
      localStorage.setItem(getArchiveStorageKey('meditationsArchives', userId), JSON.stringify(archivesMeditations));
      resultat.meditations = meditationsJeune.length;
    }

    // 2. VERSETS (localStorage)
    const versetsLS = JSON.parse(localStorage.getItem(getArchiveStorageKey('versets', userId)) || '[]');
    const versetsJeune = filtrerParDates(versetsLS, dateDebut, dateFin);
    if (versetsJeune.length > 0) {
      const archivesVersets = JSON.parse(localStorage.getItem(getArchiveStorageKey('versetsArchives', userId)) || '{}');
      archivesVersets[idJeune] = versetsJeune;
      localStorage.setItem(getArchiveStorageKey('versetsArchives', userId), JSON.stringify(archivesVersets));
      resultat.versets = versetsJeune.length;
    }

    // 3. QUESTIONS-RÉPONSES (localStorage)
    const questionsLS = JSON.parse(localStorage.getItem(getArchiveStorageKey('questionsReponses', userId)) || '[]');
    const questionsJeune = filtrerParDates(questionsLS, dateDebut, dateFin);
    if (questionsJeune.length > 0) {
      const archivesQuestions = JSON.parse(localStorage.getItem(getArchiveStorageKey('questionsArchives', userId)) || '{}');
      archivesQuestions[idJeune] = questionsJeune;
      localStorage.setItem(getArchiveStorageKey('questionsArchives', userId), JSON.stringify(archivesQuestions));
      resultat.questions = questionsJeune.length;
    }

    // 4. INTENTIONS (localStorage)
    const intentionsLS = JSON.parse(localStorage.getItem(getArchiveStorageKey('intentions', userId)) || '[]');
    const intentionsJeune = filtrerParDates(intentionsLS, dateDebut, dateFin);
    if (intentionsJeune.length > 0) {
      const archivesIntentions = JSON.parse(localStorage.getItem(getArchiveStorageKey('intentionsArchives', userId)) || '{}');
      archivesIntentions[idJeune] = intentionsJeune;
      localStorage.setItem(getArchiveStorageKey('intentionsArchives', userId), JSON.stringify(archivesIntentions));
      resultat.intentions = intentionsJeune.length;
    }

    // 5. ÉCRITURES LIBRES (localStorage)
    const ecrituresLS = JSON.parse(localStorage.getItem(getArchiveStorageKey('ecritures', userId)) || '[]');
    const ecrituresJeune = filtrerParDates(ecrituresLS, dateDebut, dateFin);
    if (ecrituresJeune.length > 0) {
      const archivesEcritures = JSON.parse(localStorage.getItem(getArchiveStorageKey('ecrituresArchives', userId)) || '{}');
      archivesEcritures[idJeune] = ecrituresJeune;
      localStorage.setItem(getArchiveStorageKey('ecrituresArchives', userId), JSON.stringify(archivesEcritures));
      resultat.ecritures = ecrituresJeune.length;
    }

    // 6. AUDIOS (IndexedDB via audioStorage)
    const resultAudios = await archiverAudiosJeune(dateDebut, dateFin, idJeune, userId);
    resultat.audios = resultAudios.count;

    console.log('✅ Données spirituelles archivées:', resultat);
    return resultat;
  } catch (error) {
    console.error('❌ Erreur archivage données spirituelles:', error);
    return null;
  }
};

/**
 * Récupérer toutes les données spirituelles archivées d'un jeûne
 */
export const recupererDonneesSpirituellesArchivees = async (idJeune, userId = null) => {
  try {
    const donnees = {
      meditations: [],
      versets: [],
      questions: [],
      intentions: [],
      ecritures: [],
      audios: []
    };

    // Méditations
    const archivesMeditations = JSON.parse(localStorage.getItem(getArchiveStorageKey('meditationsArchives', userId)) || '{}');
    donnees.meditations = archivesMeditations[idJeune] || [];

    // Versets
    const archivesVersets = JSON.parse(localStorage.getItem(getArchiveStorageKey('versetsArchives', userId)) || '{}');
    donnees.versets = archivesVersets[idJeune] || [];

    // Questions
    const archivesQuestions = JSON.parse(localStorage.getItem(getArchiveStorageKey('questionsArchives', userId)) || '{}');
    donnees.questions = archivesQuestions[idJeune] || [];

    // Intentions
    const archivesIntentions = JSON.parse(localStorage.getItem(getArchiveStorageKey('intentionsArchives', userId)) || '{}');
    donnees.intentions = archivesIntentions[idJeune] || [];

    // Écritures
    const archivesEcritures = JSON.parse(localStorage.getItem(getArchiveStorageKey('ecrituresArchives', userId)) || '{}');
    donnees.ecritures = archivesEcritures[idJeune] || [];

    // Audios
    donnees.audios = await recupererAudiosArchives(idJeune, userId);

    return donnees;
  } catch (error) {
    console.error('❌ Erreur récupération données spirituelles archivées:', error);
    return null;
  }
};

/**
 * Filtrer éléments par plage de dates
 */
const filtrerParDates = (items, dateDebut, dateFin) => {
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  
  return items.filter(item => {
    const dateItem = new Date(item.date || item.created_at);
    return dateItem >= debut && dateItem <= fin;
  });
};

/**
 * Compter les données spirituelles archivées
 */
export const compterDonneesSpirituellesArchivees = async (idJeune, userId = null) => {
  const donnees = await recupererDonneesSpirituellesArchivees(idJeune, userId);
  
  if (!donnees) return 0;
  
  return (
    donnees.meditations.length +
    donnees.versets.length +
    donnees.questions.length +
    donnees.intentions.length +
    donnees.ecritures.length +
    donnees.audios.length
  );
};

/**
 * Supprimer données spirituelles archivées d'un jeûne
 */
export const supprimerDonneesSpirituellesArchivees = (idJeune, userId = null) => {
  try {
    // Méditations
    const archivesMeditations = JSON.parse(localStorage.getItem(getArchiveStorageKey('meditationsArchives', userId)) || '{}');
    delete archivesMeditations[idJeune];
    localStorage.setItem(getArchiveStorageKey('meditationsArchives', userId), JSON.stringify(archivesMeditations));

    // Versets
    const archivesVersets = JSON.parse(localStorage.getItem(getArchiveStorageKey('versetsArchives', userId)) || '{}');
    delete archivesVersets[idJeune];
    localStorage.setItem(getArchiveStorageKey('versetsArchives', userId), JSON.stringify(archivesVersets));

    // Questions
    const archivesQuestions = JSON.parse(localStorage.getItem(getArchiveStorageKey('questionsArchives', userId)) || '{}');
    delete archivesQuestions[idJeune];
    localStorage.setItem(getArchiveStorageKey('questionsArchives', userId), JSON.stringify(archivesQuestions));

    // Intentions
    const archivesIntentions = JSON.parse(localStorage.getItem(getArchiveStorageKey('intentionsArchives', userId)) || '{}');
    delete archivesIntentions[idJeune];
    localStorage.setItem(getArchiveStorageKey('intentionsArchives', userId), JSON.stringify(archivesIntentions));

    // Écritures
    const archivesEcritures = JSON.parse(localStorage.getItem(getArchiveStorageKey('ecrituresArchives', userId)) || '{}');
    delete archivesEcritures[idJeune];
    localStorage.setItem(getArchiveStorageKey('ecrituresArchives', userId), JSON.stringify(archivesEcritures));

    // Audios
    const archivesAudios = JSON.parse(localStorage.getItem(getArchiveStorageKey('audiosArchives', userId)) || '{}');
    delete archivesAudios[idJeune];
    localStorage.setItem(getArchiveStorageKey('audiosArchives', userId), JSON.stringify(archivesAudios));

    console.log(`✅ Données spirituelles supprimées pour jeûne ${idJeune}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur suppression données spirituelles:', error);
    return false;
  }
};
