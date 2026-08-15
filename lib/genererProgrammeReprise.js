import alimentsRepriseJeune from '../data/alimentsRepriseJeune';

// ═══════════════════════════════════════════════════════════
// FONCTION PRINCIPALE : GÉNÉRATION DU PROGRAMME DE REPRISE
// ═══════════════════════════════════════════════════════════

/**
 * Génère un programme complet de reprise alimentaire après jeûne
 * @param {Object} params - Paramètres du programme
 * @param {number} params.dureeJeune - Durée du jeûne en jours (3-15)
 * @param {number} params.poidsDepart - Poids au début du jeûne (kg)
 * @param {string} params.dateFin - Date de fin du jeûne (format ISO)
 * @param {Object} params.options - Options supplémentaires (facultatif)
 * @returns {Object} - Programme complet prêt pour insertion en base
 */
export function genererProgrammeReprise({ dureeJeune, poidsDepart, dateFin, options = {} }) {
  // Validation des paramètres
  if (!dureeJeune || dureeJeune < 1 || dureeJeune > 15) {
    throw new Error('Durée de jeûne invalide (doit être entre 1 et 15 jours)');
  }
  if (!dateFin) {
    throw new Error('Date de fin du jeûne requise');
  }

  // Calcul de la durée de reprise (formule médicale : jeûne × 2)
  const dureeReprise = calculerDureeReprise(dureeJeune);

  // Calcul des dates
  const dateFinJeune = new Date(dateFin);
  const dateDebutReprise = new Date(dateFinJeune);
  dateDebutReprise.setDate(dateDebutReprise.getDate() + 1); // Lendemain de fin de jeûne

  const dateFinReprise = new Date(dateDebutReprise);
  dateFinReprise.setDate(dateFinReprise.getDate() + dureeReprise - 1);

  // Découpage en 5 phases médicales
  const phases = decouperEnPhases(dureeReprise);

  // Génération des jours détaillés
  const joursDetailles = [];
  for (let jourNum = 1; jourNum <= dureeReprise; jourNum++) {
    const dateJour = new Date(dateDebutReprise);
    dateJour.setDate(dateJour.getDate() + jourNum - 1);

    // Détermination de la phase du jour
    const phase = getPhaseForJour(jourNum, phases);

    // Récupération des aliments autorisés pour cette phase
    const alimentsAutorises = getAlimentsPhase(phase);

    // Message contextuel du jour
    const messageContextuel = getMessagePhase(phase, jourNum, dureeReprise);

    joursDetailles.push({
      jour_numero: jourNum,
      date: dateJour.toISOString().split('T')[0],
      phase: phase,
      aliments_autorises: alimentsAutorises.map(a => ({
        nom: a.nom,
        categorie: a.categorie,
        portion: a.portionDefaut,
        unite: a.unite,
        conseil: a.conseil,
        favoriseCetose: a.favoriseCetose
      })),
      message_contextuel: messageContextuel
    });
  }

  // Génération de la liste de courses (7 premiers jours)
  const listeCourses = genererListeCourses(joursDetailles.slice(0, 7));

  // Construction de l'objet programme complet
  const programme = {
    duree_jeune_jours: dureeJeune,
    duree_reprise_jours: dureeReprise,
    date_debut_reprise: dateDebutReprise.toISOString().split('T')[0],
    date_fin_reprise: dateFinReprise.toISOString().split('T')[0],
    phases: {
      phase1: {
        nom: 'Liquides',
        debut: phases.phase1.debut,
        fin: phases.phase1.fin,
        objectif: 'Prévenir syndrome de réalimentation, réhydratation progressive'
      },
      phase2: {
        nom: 'Fibres douces',
        debut: phases.phase2.debut,
        fin: phases.phase2.fin,
        objectif: 'Réactivation intestinale douce, fibres cuites uniquement'
      },
      phase3: {
        nom: 'Protéines & Lipides',
        debut: phases.phase3.debut,
        fin: phases.phase3.fin,
        objectif: 'Reconstruction tissulaire, maintien cétose si souhaité'
      },
      phase4: {
        nom: 'Féculents doux',
        debut: phases.phase4.debut,
        fin: phases.phase4.fin,
        objectif: 'Réintroduction progressive glucides, sortie cétose en douceur'
      },
      phase5: {
        nom: 'Alimentation normale contrôlée',
        debut: phases.phase5.debut,
        fin: phases.phase5.fin,
        objectif: 'Réintroduction progressive des aliments complexes, stabilisation durable'
      }
    },
    liste_courses: listeCourses,
    jours_detailles: joursDetailles,
    statut: 'proposition',
    options: options
  };

  return programme;
}

// ═══════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════

/**
 * Calcule la durée de reprise selon la formule médicale
 * @param {number} dureeJeune - Durée du jeûne en jours
 * @returns {number} - Durée de reprise en jours (jeûne × 2)
 */
export function calculerDureeReprise(dureeJeune) {
  return Math.ceil(dureeJeune * 2);
}

/**
 * Découpe la durée de reprise en 5 phases proportionnelles
 * Phase 1 : 10% (Liquides)
 * Phase 2 : 15% (Semi-liquides + premières huiles)
 * Phase 3 : 25% (Solides légers + protéines végétales)
 * Phase 4 : 20% (Protéines animales + crudités douces)
 * Phase 5 : 30% (Alimentation normale contrôlée)
 * 
 * @param {number} dureeReprise - Durée totale de reprise
 * @returns {Object} - Découpage en phases avec début/fin pour chaque phase
 */
export function decouperEnPhases(dureeReprise) {
  // Répartition cible en pourcentages
  const parts = [0.10, 0.15, 0.25, 0.20, 0.30];

  // Calcul des longueurs idéales et arrondies à l'entier le plus proche
  const ideals = parts.map(p => dureeReprise * p);
  let lengths = ideals.map(v => Math.round(v));

  // Assurer minimum 1 jour par phase lorsque dureeReprise >= 5
  if (dureeReprise >= 5) {
    lengths = lengths.map(l => Math.max(1, l));
  }

  // Ajustement pour que la somme égale la durée totale
  let somme = lengths.reduce((a, b) => a + b, 0);
  const diff = dureeReprise - somme;

  if (diff !== 0) {
    // Priorité métier: si on doit retirer, réduire les phases tardives d'abord (5→1)
    // si on doit ajouter, augmenter les phases précoces d'abord (1→5)
    const orderRemove = [4, 3, 2, 1, 0]; // indices pour phases 5,4,3,2,1
    const orderAdd = [0, 1, 2, 3, 4];    // indices pour phases 1,2,3,4,5

    if (diff < 0) {
      let need = Math.abs(diff);
      let cursor = 0;
      while (need > 0 && cursor < 50) {
        for (let k = 0; k < orderRemove.length && need > 0; k++) {
          const idx = orderRemove[k];
          if (lengths[idx] > 1) {
            lengths[idx] -= 1;
            need -= 1;
          }
        }
        cursor++;
      }
    } else if (diff > 0) {
      let need = diff;
      let cursor = 0;
      while (need > 0 && cursor < 50) {
        for (let k = 0; k < orderAdd.length && need > 0; k++) {
          const idx = orderAdd[k];
          lengths[idx] += 1;
          need -= 1;
        }
        cursor++;
      }
    }
  }

  // Calcul des bornes cumulées
  const p1 = lengths[0];
  const p2 = p1 + lengths[1];
  const p3 = p2 + lengths[2];
  const p4 = p3 + lengths[3];
  const p5 = dureeReprise; // s'assure d'atteindre la fin

  return {
    phase1: { debut: 1, fin: p1 },
    phase2: { debut: p1 + 1, fin: p2 },
    phase3: { debut: p2 + 1, fin: p3 },
    phase4: { debut: p3 + 1, fin: p4 },
    phase5: { debut: p4 + 1, fin: p5 }
  };
}

/**
 * Détermine la phase pour un numéro de jour donné
 * @param {number} jourNum - Numéro du jour (1-based)
 * @param {Object} phases - Objet phases retourné par decouperEnPhases()
 * @returns {number} - Numéro de la phase (1-5)
 */
function getPhaseForJour(jourNum, phases) {
  if (jourNum <= phases.phase1.fin) return 1;
  if (jourNum <= phases.phase2.fin) return 2;
  if (jourNum <= phases.phase3.fin) return 3;
  if (jourNum <= phases.phase4.fin) return 4;
  return 5;
}

/**
 * Récupère les aliments autorisés pour une phase donnée
 * @param {number} phase - Numéro de la phase (1-5)
 * @returns {Array} - Tableau d'objets aliments
 */
export function getAlimentsPhase(phase) {
  return alimentsRepriseJeune.filter(aliment => aliment.phase === phase);
}

/**
 * Génère un message contextuel personnalisé selon la phase et le jour
 * @param {number} phase - Numéro de la phase (1-5)
 * @param {number} jour - Numéro du jour dans la reprise
 * @param {number} dureeReprise - Durée totale de la reprise
 * @returns {string} - Message contextuel
 */
export function getMessagePhase(phase, jour, dureeReprise) {
  const messages = {
    phase1: {
      1: `🎉 Bienvenue dans ta reprise alimentaire ! **Jour 1 : LIQUIDES UNIQUEMENT**
      
🕐 **TIMELINE HORAIRES RECOMMANDÉES :**
• **8h00** : 150-200ml bouillon de légumes
• **11h00** : 150ml eau citronnée ou eau de cuisson légumes
• **13h00** : 200ml bouillon 
• **16h00** : 100-150ml jus dilué (50% eau)
• **19h00** : 200ml bouillon

⚠️ **IMPORTANT** : Pas de purées aujourd'hui, que des liquides ! Sirote lentement, écoute ton corps.`,

      2: `💧 **Jour 2 : LIQUIDES + PREMIÈRES PURÉES LISSES**
      
🕐 **TIMELINE HORAIRES RECOMMANDÉES :**
• **8h00** : 150-200ml bouillon de légumes
• **11h00** : 150ml eau citronnée ou eau de cuisson
• **13h00** : 200ml bouillon + **100g purée carotte/courgette lisse**
• **16h00** : 100-150ml jus dilué ou bouillon
• **19h00** : 200ml bouillon + **100-150g purée lisse**

✨ **NOUVEAU** : Tu peux commencer les purées ultra-lisses (texture velours) ! Gargouillements normaux.`,

      default: `💧 Phase liquides (J${jour}/${dureeReprise}). 
      
🕐 **RAPPEL HORAIRES** : 8h → 11h → 13h → 16h → 19h
Garde le rythme : petites quantités, souvent. ${jour > 2 ? 'Purées lisses autorisées.' : 'Liquides uniquement.'} Ton système digestif te remercie !`
    },
    phase2: {
      1: `🥬 Passage aux fibres douces ! Bienvenue aux légumes cuits et poissons blancs vapeur. Mâche lentement, savoure chaque bouchée.`,
      default: `🥬 Phase fibres douces (J${jour}/${dureeReprise}). Tout doit être bien cuit, facile à digérer. Évite les crudités pour l'instant.`
    },
    phase3: {
      1: `🥚 Phase protéines & lipides ! Ton corps reconstruit ses tissus. Œufs, avocats, huiles : tes alliés pour maintenir la cétose si tu le souhaites.`,
      default: `🥚 Phase protéines & lipides (J${jour}/${dureeReprise}). Les bonnes graisses sont tes amies. Écoute ta satiété, ne force rien.`
    },
    phase4: {
      1: `🍠 Réintroduction des féculents doux ! Patate douce, riz complet, quinoa : UNIQUEMENT À MIDI. Commence petit, augmente progressivement.`,
      2: `🍠 Féculents doux (J2). Comment te sens-tu avec les glucides ? Observe ton énergie, ton sommeil. Ajuste si besoin.`,
      default: `🍠 Phase féculents doux (J${jour}/${dureeReprise}). Glucides midi uniquement. Ton corps sort doucement de la cétose. C'est normal et sain.`
    },
    phase5: {
      1: `🍽️ Phase finale ! Réintroduction progressive des aliments complexes. Observe ta tolérance digestive et énergétique. 1 nouveau aliment par jour maximum.`,
      3: `🍽️ Alimentation normale contrôlée (J${jour}/${dureeReprise}). Pain complet, légumineuses, fromages : introduis-les doucement. Continue d'écouter ton corps.`,
      7: `🍽️ Stabilisation (J${jour}/${dureeReprise}). Énergie stable ? Digestion fluide ? Sommeil réparateur ? C'est le moment de consolider tes nouvelles habitudes.`,
      default: `🍽️ Alimentation normale contrôlée (J${jour}/${dureeReprise}). Privilégie toujours la qualité nutritionnelle et l'écoute de ton corps. Tu y es presque !`
    }
  };

  const phaseMessages = messages[`phase${phase}`];
  return phaseMessages ? (phaseMessages[jour] || phaseMessages.default) : `Phase ${phase} (J${jour}/${dureeReprise})`;
}

/**
 * Génère une liste de courses regroupée par catégorie
 * @param {Array} jours - Tableau des jours détaillés (généralement 7 premiers jours)
 * @returns {Array} - Liste de courses avec nom, quantité estimée, catégorie
 */

/**
 * Génère une liste de courses regroupée par catégorie
 * @param {Array} jours - Tableau des jours détaillés (généralement 7 premiers jours)
 * @returns {Array} - Liste de courses avec nom, quantité estimée, catégorie
 */
export function genererListeCourses(jours) {
  const alimentsUniques = new Map();

  // Collecte tous les aliments uniques des jours
  jours.forEach(jour => {
    jour.aliments_autorises.forEach(aliment => {
      if (!alimentsUniques.has(aliment.nom)) {
        alimentsUniques.set(aliment.nom, {
          nom: aliment.nom,
          categorie: aliment.categorie,
          portion: aliment.portion,
          unite: aliment.unite,
          phase: jour.phase,
          frequence: 1
        });
      } else {
        // Incrémente la fréquence si l'aliment apparaît plusieurs fois
        const item = alimentsUniques.get(aliment.nom);
        item.frequence += 1;
      }
    });
  });

  // Conversion en tableau et calcul des quantités
  const listeCourses = Array.from(alimentsUniques.values()).map(item => {
    let quantiteEstimee = '';

    // Estimation intelligente selon la catégorie et fréquence
    if (item.categorie === 'liquide') {
      quantiteEstimee = item.frequence >= 5 ? '2L' : '1L';
    } else if (item.categorie === 'légume') {
      quantiteEstimee = item.frequence >= 3 ? '500g' : '300g';
    } else if (item.categorie === 'protéine') {
      quantiteEstimee = item.frequence >= 3 ? '300g' : '150g';
    } else if (item.categorie === 'lipide') {
      quantiteEstimee = '1 unité';
    } else if (item.categorie === 'féculent') {
      quantiteEstimee = '500g';
    } else if (item.categorie === 'fruit') {
      quantiteEstimee = '3-4 unités';
    } else {
      quantiteEstimee = 'À prévoir';
    }

    return {
      nom: item.nom,
      quantite: quantiteEstimee,
      categorie: item.categorie,
      phase: item.phase,
      priorite: item.phase <= 2 ? 'haute' : 'normale' // Phase 1-2 = haute priorité
    };
  });

  // Tri par phase puis catégorie
  return listeCourses.sort((a, b) => {
    if (a.phase !== b.phase) return a.phase - b.phase;
    return a.categorie.localeCompare(b.categorie);
  });
}

/**
 * Valide qu'un programme est cohérent avant insertion
 * @param {Object} programme - Programme généré
 * @returns {Object} - {valide: boolean, erreurs: Array}
 */
export function validerProgramme(programme) {
  const erreurs = [];

  if (!programme.duree_jeune_jours || programme.duree_jeune_jours < 1) {
    erreurs.push('Durée de jeûne invalide');
  }

  if (!programme.duree_reprise_jours || programme.duree_reprise_jours < 1) {
    erreurs.push('Durée de reprise invalide');
  }

  if (!programme.jours_detailles || programme.jours_detailles.length === 0) {
    erreurs.push('Aucun jour généré');
  }

  if (programme.jours_detailles.length !== programme.duree_reprise_jours) {
    erreurs.push(`Incohérence : ${programme.jours_detailles.length} jours générés pour ${programme.duree_reprise_jours} jours attendus`);
  }

  if (!programme.liste_courses || programme.liste_courses.length === 0) {
    erreurs.push('Liste de courses vide');
  }

  return {
    valide: erreurs.length === 0,
    erreurs
  };
}

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export default {
  genererProgrammeReprise,
  calculerDureeReprise,
  decouperEnPhases,
  getAlimentsPhase,
  getMessagePhase,
  genererListeCourses,
  validerProgramme
};
