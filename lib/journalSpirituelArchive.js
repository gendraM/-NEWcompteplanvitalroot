/**
 * Gestion de l'archivage des données du journal spirituel
 * Inclut : méditations, versets, questions, intentions, écritures, audios
 */

import { archiverAudiosJeune, recupererAudiosArchives } from './audioStorage';

/**
 * Archiver toutes les données spirituelles d'un jeûne
 */
export const archiverDonneesSpirituellesJeune = async (dateDebut, dateFin, idJeune) => {
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
    const meditationsLS = JSON.parse(localStorage.getItem('meditationsHistorique') || '[]');
    const meditationsJeune = filtrerParDates(meditationsLS, dateDebut, dateFin);
    if (meditationsJeune.length > 0) {
      const archivesMeditations = JSON.parse(localStorage.getItem('meditationsArchives') || '{}');
      archivesMeditations[idJeune] = meditationsJeune;
      localStorage.setItem('meditationsArchives', JSON.stringify(archivesMeditations));
      resultat.meditations = meditationsJeune.length;
    }

    // 2. VERSETS (localStorage)
    const versetsLS = JSON.parse(localStorage.getItem('versets') || '[]');
    const versetsJeune = filtrerParDates(versetsLS, dateDebut, dateFin);
    if (versetsJeune.length > 0) {
      const archivesVersets = JSON.parse(localStorage.getItem('versetsArchives') || '{}');
      archivesVersets[idJeune] = versetsJeune;
      localStorage.setItem('versetsArchives', JSON.stringify(archivesVersets));
      resultat.versets = versetsJeune.length;
    }

    // 3. QUESTIONS-RÉPONSES (localStorage)
    const questionsLS = JSON.parse(localStorage.getItem('questionsReponses') || '[]');
    const questionsJeune = filtrerParDates(questionsLS, dateDebut, dateFin);
    if (questionsJeune.length > 0) {
      const archivesQuestions = JSON.parse(localStorage.getItem('questionsArchives') || '{}');
      archivesQuestions[idJeune] = questionsJeune;
      localStorage.setItem('questionsArchives', JSON.stringify(archivesQuestions));
      resultat.questions = questionsJeune.length;
    }

    // 4. INTENTIONS (localStorage)
    const intentionsLS = JSON.parse(localStorage.getItem('intentions') || '[]');
    const intentionsJeune = filtrerParDates(intentionsLS, dateDebut, dateFin);
    if (intentionsJeune.length > 0) {
      const archivesIntentions = JSON.parse(localStorage.getItem('intentionsArchives') || '{}');
      archivesIntentions[idJeune] = intentionsJeune;
      localStorage.setItem('intentionsArchives', JSON.stringify(archivesIntentions));
      resultat.intentions = intentionsJeune.length;
    }

    // 5. ÉCRITURES LIBRES (localStorage)
    const ecrituresLS = JSON.parse(localStorage.getItem('ecritures') || '[]');
    const ecrituresJeune = filtrerParDates(ecrituresLS, dateDebut, dateFin);
    if (ecrituresJeune.length > 0) {
      const archivesEcritures = JSON.parse(localStorage.getItem('ecrituresArchives') || '{}');
      archivesEcritures[idJeune] = ecrituresJeune;
      localStorage.setItem('ecrituresArchives', JSON.stringify(archivesEcritures));
      resultat.ecritures = ecrituresJeune.length;
    }

    // 6. AUDIOS (IndexedDB via audioStorage)
    const resultAudios = await archiverAudiosJeune(dateDebut, dateFin, idJeune);
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
export const recupererDonneesSpirituellesArchivees = async (idJeune) => {
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
    const archivesMeditations = JSON.parse(localStorage.getItem('meditationsArchives') || '{}');
    donnees.meditations = archivesMeditations[idJeune] || [];

    // Versets
    const archivesVersets = JSON.parse(localStorage.getItem('versetsArchives') || '{}');
    donnees.versets = archivesVersets[idJeune] || [];

    // Questions
    const archivesQuestions = JSON.parse(localStorage.getItem('questionsArchives') || '{}');
    donnees.questions = archivesQuestions[idJeune] || [];

    // Intentions
    const archivesIntentions = JSON.parse(localStorage.getItem('intentionsArchives') || '{}');
    donnees.intentions = archivesIntentions[idJeune] || [];

    // Écritures
    const archivesEcritures = JSON.parse(localStorage.getItem('ecrituresArchives') || '{}');
    donnees.ecritures = archivesEcritures[idJeune] || [];

    // Audios
    donnees.audios = await recupererAudiosArchives(idJeune);

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
export const compterDonneesSpirituellesArchivees = async (idJeune) => {
  const donnees = await recupererDonneesSpirituellesArchivees(idJeune);
  
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
export const supprimerDonneesSpirituellesArchivees = (idJeune) => {
  try {
    // Méditations
    const archivesMeditations = JSON.parse(localStorage.getItem('meditationsArchives') || '{}');
    delete archivesMeditations[idJeune];
    localStorage.setItem('meditationsArchives', JSON.stringify(archivesMeditations));

    // Versets
    const archivesVersets = JSON.parse(localStorage.getItem('versetsArchives') || '{}');
    delete archivesVersets[idJeune];
    localStorage.setItem('versetsArchives', JSON.stringify(archivesVersets));

    // Questions
    const archivesQuestions = JSON.parse(localStorage.getItem('questionsArchives') || '{}');
    delete archivesQuestions[idJeune];
    localStorage.setItem('questionsArchives', JSON.stringify(archivesQuestions));

    // Intentions
    const archivesIntentions = JSON.parse(localStorage.getItem('intentionsArchives') || '{}');
    delete archivesIntentions[idJeune];
    localStorage.setItem('intentionsArchives', JSON.stringify(archivesIntentions));

    // Écritures
    const archivesEcritures = JSON.parse(localStorage.getItem('ecrituresArchives') || '{}');
    delete archivesEcritures[idJeune];
    localStorage.setItem('ecrituresArchives', JSON.stringify(archivesEcritures));

    // Audios
    const archivesAudios = JSON.parse(localStorage.getItem('audiosArchives') || '{}');
    delete archivesAudios[idJeune];
    localStorage.setItem('audiosArchives', JSON.stringify(archivesAudios));

    console.log(`✅ Données spirituelles supprimées pour jeûne ${idJeune}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur suppression données spirituelles:', error);
    return false;
  }
};
