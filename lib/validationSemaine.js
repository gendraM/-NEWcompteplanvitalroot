/**
 * Helpers pour la gestion de la validation des semaines
 * Calculs d'extras, génération de feedback, détection semaines non validées
 */

// ═══════════════════════════════════════════════════════════
// HELPERS DATE JAVASCRIPT NATIF (EXPORTÉS POUR RÉUTILISATION)
// Pas de dépendance externe, gestion erreurs robuste
// ═══════════════════════════════════════════════════════════

/**
 * Formate une date selon un pattern spécifié
 * @param {Date|string} date - Date à formater
 * @param {string} formatStr - Pattern de format
 * @returns {string} - Date formatée ou string vide si invalide
 */
export function formatDate(date, formatStr) {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return ''; // Date invalide
    
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const mois = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
    const moisComplet = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    if (formatStr === 'yyyy-MM-dd') {
      return d.toISOString().slice(0, 10);
    }
    if (formatStr === "d MMMM yyyy 'à' HH:mm") {
      const jour = d.getDate();
      const moisNom = moisComplet[d.getMonth()];
      const annee = d.getFullYear();
      const heure = String(d.getHours()).padStart(2, '0');
      const minute = String(d.getMinutes()).padStart(2, '0');
      return `${jour} ${moisNom} ${annee} à ${heure}:${minute}`;
    }
    if (formatStr === 'd MMMM yyyy') {
      const jour = d.getDate();
      const moisNom = moisComplet[d.getMonth()];
      const annee = d.getFullYear();
      return `${jour} ${moisNom} ${annee}`;
    }
    if (formatStr === 'EEEE d MMM') {
      return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`;
    }
    if (formatStr === 'd MMM') {
      return `${d.getDate()} ${mois[d.getMonth()]}`;
    }
    if (formatStr === 'd MMM yyyy') {
      return `${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;
    }
    return d.toISOString();
  } catch (error) {
    console.error('Erreur formatDate:', error);
    return '';
  }
}

/**
 * Retourne le lundi de la semaine d'une date donnée
 * @param {Date|string} date - Date de référence
 * @returns {Date} - Lundi de la semaine (00:00:00)
 */
export function getMonday(date) {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) throw new Error('Date invalide');
    
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d); // Créer nouvelle instance AVANT setDate
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  } catch (error) {
    console.error('Erreur getMonday:', error);
    return new Date(); // Fallback: aujourd'hui
  }
}

/**
 * Ajoute des jours à une date
 * @param {Date|string} date - Date de départ
 * @param {number} days - Nombre de jours (peut être négatif)
 * @returns {Date} - Nouvelle date
 */
export function addDays(date, days) {
  try {
    const result = new Date(date);
    if (isNaN(result.getTime())) throw new Error('Date invalide');
    result.setDate(result.getDate() + days);
    return result;
  } catch (error) {
    console.error('Erreur addDays:', error);
    return new Date();
  }
}

/**
 * Vérifie si une date est dans un intervalle
 * @param {Date|string} date - Date à tester
 * @param {Date|string} start - Date de début (inclusive)
 * @param {Date|string} end - Date de fin (inclusive)
 * @returns {boolean}
 */
export function isDateInRange(date, start, end) {
  try {
    const d = new Date(date);
    const s = new Date(start);
    const e = new Date(end);
    
    if (isNaN(d.getTime()) || isNaN(s.getTime()) || isNaN(e.getTime())) {
      return false;
    }
    
    return d >= s && d <= e;
  } catch (error) {
    console.error('Erreur isDateInRange:', error);
    return false;
  }
}

/**
 * Calcule les extras d'une semaine donnée
 * @param {string} weekStart - Date de début de semaine (format ISO "YYYY-MM-DD")
 * @param {Array} repasReels - Liste complète des repas avec tags fast-food
 * @returns {Object} - { count: number, details: Array, variation: number }
 */
export function calculerExtrasSemaine(weekStart, repasReels) {
  if (!weekStart || !repasReels || !Array.isArray(repasReels)) {
    return { count: 0, details: [], variation: 0 };
  }

  try {
    const debut = new Date(weekStart);
    const fin = addDays(debut, 6); // Lundi à Dimanche (7 jours)

    // Filtrer les repas de la semaine
    const repasDesSemaine = repasReels.filter(repas => {
      const dateRepas = new Date(repas.date);
      return isDateInRange(dateRepas, debut, fin);
    });

    // Détecter les extras (fast-food)
    // Conditions : categorie='fast-food' OU tag fast-food présent
    const extras = repasDesSemaine.filter(repas => {
      return repas.categorie === 'fast-food' || 
             (repas.tag && repas.tag.toLowerCase().includes('fast-food'));
    });

    // Construire les détails
    const details = extras.map(extra => ({
      type: 'fast-food',
      nom: extra.nom || extra.description || 'Repas fast-food',
      date: extra.date,
      moment: extra.moment || 'inconnu', // Déjeuner, Dîner, etc.
    }));

    // Dédupliquer si nécessaire (même date + moment)
    const detailsUniques = details.reduce((acc, current) => {
      const existe = acc.find(
        item => item.date === current.date && item.moment === current.moment
      );
      if (!existe) {
        acc.push(current);
      }
      return acc;
    }, []);

    return {
      count: detailsUniques.length,
      details: detailsUniques,
      variation: 0, // Sera calculé lors de l'enregistrement (comparaison avec semaine précédente)
    };
  } catch (error) {
    console.error('Erreur calculerExtrasSemaine:', error);
    return { count: 0, details: [], variation: 0 };
  }
}

/**
 * Génère un message de feedback personnalisé selon le nombre d'extras
 * @param {number} extrasCount - Nombre d'extras détectés
 * @param {number} quota - Quota d'extras autorisés (par défaut 2)
 * @returns {string} - Message personnalisé
 */
export function genererMessageFeedback(extrasCount, quota = 2) {
  if (extrasCount === 0) {
    return "🎉 Incroyable ! Aucun extra cette semaine, c'est parfait !";
  }

  if (extrasCount === 1) {
    return "👏 Excellent travail ! 1 seul extra, tu restes dans le quota.";
  }

  if (extrasCount <= quota) {
    return `✅ Bravo ! ${extrasCount} extras, quota respecté (${quota} max).`;
  }

  if (extrasCount === quota + 1) {
    return `⚠️ Attention : ${extrasCount} extras, léger dépassement du quota (${quota} max).`;
  }

  // Dépassement significatif
  const difference = extrasCount - quota;
  return `🚨 Dépassement : ${extrasCount} extras au lieu de ${quota} max (+${difference}). Reprends le contrôle la semaine prochaine !`;
}

/**
 * Calcule la variation d'extras par rapport à la semaine précédente
 * @param {number} extrasActuels - Extras de la semaine actuelle
 * @param {Array} semainesValidees - Liste des semaines déjà validées
 * @param {string} weekStart - Date de début de semaine actuelle
 * @returns {number} - Variation (ex: +1, -2, 0)
 */
export function calculerVariation(extrasActuels, semainesValidees, weekStart) {
  if (!semainesValidees || semainesValidees.length === 0) {
    return 0; // Première semaine validée
  }

  try {
    const dateActuelle = new Date(weekStart);
    
    // Trouver la semaine précédente validée (la plus récente avant weekStart)
    const semainePrecedente = semainesValidees
      .filter(s => new Date(s.weekStart) < dateActuelle)
      .sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart))[0];

    if (!semainePrecedente || semainePrecedente.extras_count === null) {
      return 0;
    }

    return extrasActuels - semainePrecedente.extras_count;
  } catch (error) {
    console.error('Erreur calculerVariation:', error);
    return 0;
  }
}

/**
 * Récupère les semaines non validées parmi les N dernières semaines
 * @param {Array} semainesValidees - Liste des semaines déjà validées
 * @param {number} nbSemaines - Nombre de semaines à analyser (par défaut 4)
 * @returns {Array} - Liste des semaines non validées avec infos
 */
export function getSemainesNonValidees(semainesValidees = [], nbSemaines = 4) {
  try {
    const aujourdHui = new Date();
    const semaines = [];

    // Générer les N dernières semaines (lundi de chaque semaine)
    for (let i = 0; i < nbSemaines; i++) {
      const dateSemaine = addDays(aujourdHui, -7 * i);
      const lundi = getMonday(dateSemaine);
      const lundiFormate = formatDate(lundi, 'yyyy-MM-dd');

      // Vérifier si déjà validée (présence dans la table = validée)
      const estValidee = semainesValidees.some(
        s => s.semaine_debut === lundiFormate || s.weekStart === lundiFormate
      );

      if (!estValidee) {
        // Calculer le label de la semaine
        const finSemaine = addDays(lundi, 6);
        const label = `${formatDate(lundi, 'd MMM')} - ${formatDate(finSemaine, 'd MMM yyyy')}`;

        semaines.push({
          weekStart: lundiFormate,
          label,
          estSemaineActuelle: i === 0,
        });
      }
    }

    return semaines;
  } catch (error) {
    console.error('Erreur getSemainesNonValidees:', error);
    return [];
  }
}

/**
 * Formatte les détails d'extras pour affichage
 * @param {Array} details - Liste des détails d'extras
 * @returns {string} - Texte formatté pour affichage
 */
export function formatterDetailsExtras(details) {
  if (!details || details.length === 0) {
    return 'Aucun extra détecté';
  }

  return details
    .map((extra, index) => {
      const dateFormatee = formatDate(new Date(extra.date), 'EEEE d MMM');
      return `${index + 1}. ${extra.nom} - ${dateFormatee} (${extra.moment})`;
    })
    .join('\n');
}

/**
 * Détermine l'emoji selon la performance de la semaine
 * @param {number} extrasCount - Nombre d'extras
 * @param {number} quota - Quota autorisé
 * @returns {string} - Emoji représentatif
 */
export function getEmojiPerformance(extrasCount, quota = 2) {
  if (extrasCount === 0) return '🏆';
  if (extrasCount <= quota) return '✅';
  if (extrasCount === quota + 1) return '⚠️';
  return '🚨';
}

/**
 * Génère un message pour validation multiple (batch)
 * @param {number} nbSemainesValidees - Nombre de semaines validées d'un coup
 * @param {number} extrasTotal - Total d'extras sur toutes les semaines
 * @returns {string} - Message de synthèse
 */
export function genererMessageBatch(nbSemainesValidees, extrasTotal) {
  if (nbSemainesValidees === 0) {
    return 'Aucune semaine sélectionnée';
  }

  if (nbSemainesValidees === 1) {
    return '1 semaine validée avec succès';
  }

  const moyenne = Math.round(extrasTotal / nbSemainesValidees * 10) / 10;
  return `${nbSemainesValidees} semaines validées ! Moyenne : ${moyenne} extras/semaine`;
}
