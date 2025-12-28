# 🎯 ARCHITECTURE CRITÈRES DYNAMIQUES - CRISTALLISATION

**Date** : 26 décembre 2025  
**Objectif** : Générer critères personnalisés basés sur le bilan_reprise

---

## 🔍 PRINCIPE FONDAMENTAL

### **Les critères de cristallisation sont GÉNÉRÉS à partir des données de la reprise**

```
┌────────────────────────────────────────────────┐
│  REPRISE ALIMENTAIRE (15-30 jours)            │
│  → Collecte données comportementales          │
│  → Détection patterns problématiques          │
│  → Génération bilan_reprise                   │
└────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────┐
│  ANALYSE BILAN_REPRISE                        │
│  → Identifier faiblesses spécifiques          │
│  → Matcher avec référentiel critères          │
│  → Générer critères personnalisés             │
└────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────┐
│  CRISTALLISATION (45 jours)                   │
│  → Appliquer critères personnalisés           │
│  → Tracker progrès quotidien                  │
│  → Mesurer victoires comportementales         │
└────────────────────────────────────────────────┘
```

---

## 📊 STRUCTURE BILAN_REPRISE (Source de données)

### **Données transmises depuis reprise-alimentaire-apres-jeune.js**

```javascript
bilan_reprise = {
  // Métadonnées
  reprise_id: "uuid",
  duree_reprise: 21, // jours
  date_debut: "2025-11-20",
  date_fin: "2025-12-10",
  
  // Données comportementales (SOURCE pour critères)
  comportements_detectes: {
    extras: {
      total: 18, // sur 21 jours
      frequence_moyenne: 0.86, // par jour
      moments_critiques: ["soir", "weekend"],
      progression: "stable" // ou "augmente", "diminue"
    },
    
    feculents_soir: {
      total: 12, // occurrences après 19h
      frequence: 0.57,
      jours_problematiques: ["vendredi", "samedi"]
    },
    
    qualite_nutritionnelle: {
      qn_moyen: 2.8, // sur 5
      evolution: "baisse_semaine_3",
      aliments_problematiques: ["pain_blanc", "desserts", "fromage"]
    },
    
    quantites: {
      respect_portions: 0.65, // 65% des repas OK
      depassements_frequents: ["feculent", "proteine_grasse"],
      moments_exces: ["dejeuner", "weekend"]
    },
    
    jeunes_ponctuels: {
      realises: 2, // sur 3 planifiés
      reussite: 0.66,
      difficultes: ["tentation_soir", "fatigue"]
    },
    
    pratiques_spirituelles: {
      total_meditations: 8,
      total_versets: 5,
      total_intentions: 12,
      regularite: "irreguliere" // ou "reguliere"
    }
  },
  
  // Diagnostics automatiques (générés par IA)
  faiblesses_identifiees: [
    {
      id: "extras_frequents",
      gravite: "elevee", // elevee, moyenne, faible
      description: "Extras quotidiens, surtout le soir",
      donnees_support: {
        occurrences: 18,
        contexte: "stress, ennui"
      }
    },
    {
      id: "feculents_soir",
      gravite: "moyenne",
      description: "Féculents après 19h (12 fois/21j)",
      donnees_support: {
        occurrences: 12,
        impact_poids: "+0.8kg"
      }
    },
    {
      id: "qn_faible",
      gravite: "moyenne",
      description: "QN moyen 2.8/5, baisse en semaine 3",
      donnees_support: {
        qn_moyen: 2.8,
        objectif: 3.5
      }
    }
  ],
  
  // Forces identifiées
  forces_identifiees: [
    {
      id: "hydratation",
      description: "Hydratation excellente (2L/jour)",
      maintenir: true
    },
    {
      id: "legumes",
      description: "Légumes présents à chaque repas",
      maintenir: true
    }
  ],
  
  // Métriques finales
  metriques_finales: {
    poids_debut: 78.5,
    poids_fin: 76.8,
    perte_totale: -1.7,
    stabilisation: true
  }
}
```

---

## 📋 FICHE MÉTIER : RÉFÉRENTIEL CRITÈRES CRISTALLISATION

### **Fichier : `/data/referentiel_criteres_cristallisation.js`**

```javascript
export const REFERENTIEL_CRITERES_CRISTALLISATION = {
  // Catégorie : EXTRAS
  extras_frequents: {
    id: "extras_frequents",
    categorie: "extras",
    nom: "Contrôle des extras",
    description_template: "Maximum {seuil} extras par semaine",
    
    // Conditions déclenchement
    conditions_activation: {
      champ_bilan: "comportements_detectes.extras.total",
      seuil_min: 10, // Si > 10 extras pendant reprise
      gravite_min: "moyenne"
    },
    
    // Configuration dynamique
    configuration: {
      calcul_seuil: (bilanData) => {
        const extrasReprise = bilanData.extras.total;
        const joursReprise = bilanData.duree_reprise;
        const moyenneJour = extrasReprise / joursReprise;
        
        // Objectif : réduire de 50%
        return Math.ceil((moyenneJour * 0.5) * 7); // par semaine
      },
      
      critere_validation_quotidien: (repasJour) => {
        return repasJour.filter(r => r.est_extra).length === 0;
      },
      
      critere_validation_hebdomadaire: (repasSemaine, seuil) => {
        const extrasCount = repasSemaine.filter(r => r.est_extra).length;
        return extrasCount <= seuil;
      }
    },
    
    // Messages personnalisés
    messages: {
      debut: (seuil) => `Tu avais {ancien} extras/semaine pendant la reprise. Objectif : max ${seuil}/semaine.`,
      progress: (actuel, seuil) => `${actuel}/${seuil} extras cette semaine`,
      victoire: "🎉 Victoire ! Tu contrôles parfaitement les extras maintenant.",
      echec: (actuel, seuil) => `${actuel} extras cette semaine (objectif : ${seuil}). Continue tes efforts.`
    }
  },
  
  // Catégorie : FÉCULENTS SOIR
  feculents_soir: {
    id: "feculents_soir",
    categorie: "timing",
    nom: "Pas de féculents après 19h",
    description_template: "Éviter féculents après 19h",
    
    conditions_activation: {
      champ_bilan: "comportements_detectes.feculents_soir.total",
      seuil_min: 5,
      gravite_min: "moyenne"
    },
    
    configuration: {
      critere_validation_quotidien: (repasJour) => {
        return !repasJour.some(r => {
          const heure = parseInt(r.heure.split(':')[0]);
          return heure >= 19 && r.categorie === 'feculent';
        });
      }
    },
    
    messages: {
      debut: (occurrences) => `Tu as mangé des féculents le soir ${occurrences} fois pendant la reprise. Changeons cela !`,
      progress: (joursSansEchec) => `${joursSansEchec} jours consécutifs sans féculents le soir`,
      victoire: "🏆 Nouvelle habitude ancrée : dîners légers sans féculents !",
      echec: "Rappel : féculents le soir perturbent la digestion nocturne."
    }
  },
  
  // Catégorie : QUALITÉ NUTRITIONNELLE
  qn_faible: {
    id: "qn_faible",
    categorie: "qualite",
    nom: "Score QN quotidien",
    description_template: "Maintenir QN moyen ≥ {seuil}/5",
    
    conditions_activation: {
      champ_bilan: "comportements_detectes.qualite_nutritionnelle.qn_moyen",
      seuil_max: 3.2,
      gravite_min: "moyenne"
    },
    
    configuration: {
      calcul_seuil: (bilanData) => {
        const qnReprise = bilanData.qualite_nutritionnelle.qn_moyen;
        // Objectif : +0.5 point minimum
        return Math.min(qnReprise + 0.7, 4.0);
      },
      
      critere_validation_quotidien: (repasJour, seuil) => {
        const qnMoyen = repasJour.reduce((sum, r) => sum + r.qn, 0) / repasJour.length;
        return qnMoyen >= seuil;
      }
    },
    
    messages: {
      debut: (ancien, nouveau) => `QN reprise : ${ancien}/5. Objectif cristallisation : ${nouveau}/5`,
      progress: (actuel, seuil) => `QN aujourd'hui : ${actuel}/5 (objectif : ${seuil})`,
      victoire: "✨ Tu as augmenté durablement la qualité de ton alimentation !",
      conseil: "Focus : plus de légumes, moins d'aliments transformés"
    }
  },
  
  // Catégorie : QUANTITÉS
  quantites_excessives: {
    id: "quantites_excessives",
    categorie: "quantites",
    nom: "Respect des portions",
    description_template: "100% des repas avec portions conformes",
    
    conditions_activation: {
      champ_bilan: "comportements_detectes.quantites.respect_portions",
      seuil_max: 0.75, // Si < 75% conformité
      gravite_min: "moyenne"
    },
    
    configuration: {
      critere_validation_quotidien: (repasJour, portionsRef) => {
        return repasJour.every(repas => {
          const ref = portionsRef[repas.categorie];
          return repas.quantite <= ref.max;
        });
      }
    },
    
    messages: {
      debut: (tauxReprise) => `${Math.round(tauxReprise*100)}% conformité portions pendant reprise. Visons 100% !`,
      progress: (tauxActuel) => `${Math.round(tauxActuel*100)}% repas conformes cette semaine`,
      victoire: "💪 Tu maîtrises parfaitement les portions maintenant !",
      conseil: "Astuce : utilise des assiettes plus petites"
    }
  },
  
  // Catégorie : JEÛNES PONCTUELS
  jeunes_irreguliers: {
    id: "jeunes_irreguliers",
    categorie: "jeunes",
    nom: "Jeûnes ponctuels réguliers",
    description_template: "Réaliser {frequence} jeûne(s) par semaine",
    
    conditions_activation: {
      champ_bilan: "comportements_detectes.jeunes_ponctuels.reussite",
      seuil_max: 0.7, // Si < 70% réussite
      gravite_min: "faible"
    },
    
    configuration: {
      calcul_seuil: (bilanData) => {
        // Progressive : 1 jeûne/semaine minimum
        return 1;
      },
      
      critere_validation_hebdomadaire: (jeunesRealises, seuil) => {
        return jeunesRealises.length >= seuil;
      }
    },
    
    messages: {
      debut: (reussiteReprise) => `${Math.round(reussiteReprise*100)}% jeûnes réussis pendant reprise. Continuons la pratique !`,
      progress: (realises, objectif) => `${realises}/${objectif} jeûne(s) cette semaine`,
      victoire: "🌟 Les jeûnes ponctuels sont devenus naturels pour toi !",
      conseil: "Choisis un jour fixe chaque semaine (ex: lundi)"
    }
  },
  
  // Catégorie : SPIRITUEL
  pratiques_spirituelles_faibles: {
    id: "pratiques_spirituelles_faibles",
    categorie: "spirituel",
    nom: "Pratique spirituelle quotidienne",
    description_template: "Au moins 1 pratique par jour",
    
    conditions_activation: {
      champ_bilan: "comportements_detectes.pratiques_spirituelles.regularite",
      valeur_attendue: "irreguliere",
      gravite_min: "faible"
    },
    
    configuration: {
      critere_validation_quotidien: (pratiquesJour) => {
        return pratiquesJour.length >= 1;
      }
    },
    
    messages: {
      debut: (totalReprise, jours) => `${totalReprise} pratiques en ${jours} jours de reprise. Visons la quotidienneté !`,
      progress: (streak) => `${streak} jours consécutifs avec pratique`,
      victoire: "🙏 La restauration spirituelle fait maintenant partie de ton quotidien !",
      conseil: "Commence par 5 min de méditation le matin"
    }
  }
};
```

---

## 🤖 ALGORITHME GÉNÉRATION CRITÈRES PERSONNALISÉS

### **Fonction : `genererCriteresPersonnalises(bilan_reprise)`**

```javascript
export async function genererCriteresPersonnalises(bilanReprise) {
  const criteresActives = [];
  
  // 1. Parcourir toutes les faiblesses identifiées
  for (const faiblesse of bilanReprise.faiblesses_identifiees) {
    const critereRef = REFERENTIEL_CRITERES_CRISTALLISATION[faiblesse.id];
    
    if (!critereRef) continue; // Pas de critère pour cette faiblesse
    
    // 2. Vérifier conditions activation
    const valeurBilan = getNestedValue(
      bilanReprise, 
      critereRef.conditions_activation.champ_bilan
    );
    
    const conditionsRemplies = verifierConditions(
      valeurBilan,
      critereRef.conditions_activation,
      faiblesse.gravite
    );
    
    if (!conditionsRemplies) continue;
    
    // 3. Calculer paramètres personnalisés
    const seuil = critereRef.configuration.calcul_seuil 
      ? critereRef.configuration.calcul_seuil(bilanReprise.comportements_detectes)
      : null;
    
    // 4. Créer critère personnalisé
    const criterePersonnalise = {
      id: `${critereRef.id}_${Date.now()}`,
      critere_ref_id: critereRef.id,
      nom: critereRef.nom,
      description: critereRef.description_template.replace('{seuil}', seuil),
      categorie: critereRef.categorie,
      
      // Données contextuelles
      contexte: {
        valeur_reprise: valeurBilan,
        objectif_cristallisation: seuil,
        gravite: faiblesse.gravite,
        donnees_support: faiblesse.donnees_support
      },
      
      // Configuration validation
      validation: {
        fonction_quotidienne: critereRef.configuration.critere_validation_quotidien,
        fonction_hebdomadaire: critereRef.configuration.critere_validation_hebdomadaire,
        seuil: seuil
      },
      
      // Messages personnalisés
      messages: {
        debut: critereRef.messages.debut(
          faiblesse.donnees_support.occurrences || valeurBilan,
          seuil
        ),
        progress: critereRef.messages.progress,
        victoire: critereRef.messages.victoire,
        conseil: critereRef.messages.conseil
      },
      
      // État initial
      etat: {
        valide_aujourdhui: false,
        jours_valides: [],
        streak_actuel: 0,
        meilleur_streak: 0,
        derniere_validation: null
      }
    };
    
    criteresActives.push(criterePersonnalise);
  }
  
  // 5. Ajouter critères de maintien (forces)
  for (const force of bilanReprise.forces_identifiees) {
    if (force.maintenir) {
      criteresActives.push(genererCritereMaintien(force));
    }
  }
  
  return criteresActives;
}
```

---

## 🗂️ STRUCTURE DONNÉES PROGRAMME CRISTALLISATION

```javascript
programme_cristallisation = {
  id: "uuid",
  user_id: "laurelle_test_user",
  phase: "cristallisation",
  
  // MÉTADONNÉES
  date_debut: "2025-12-11",
  date_fin: "2026-01-24", // +45 jours
  duree_jours: 45,
  jour_courant: 5,
  
  // BILAN REPRISE (source de vérité)
  bilan_reprise: { /* objet complet */ },
  
  // CRITÈRES PERSONNALISÉS (générés à partir bilan_reprise)
  criteres_personnalises: [
    {
      id: "extras_frequents_1735123456",
      critere_ref_id: "extras_frequents",
      nom: "Contrôle des extras",
      description: "Maximum 3 extras par semaine",
      categorie: "extras",
      
      contexte: {
        valeur_reprise: 18, // extras pendant reprise
        objectif_cristallisation: 3, // par semaine
        gravite: "elevee",
        donnees_support: {
          occurrences: 18,
          contexte: "stress, ennui"
        }
      },
      
      etat: {
        valide_aujourdhui: true,
        jours_valides: [1, 2, 3, 4, 5],
        streak_actuel: 5,
        meilleur_streak: 5,
        derniere_validation: "2025-12-15T14:32:00Z"
      }
    },
    {
      id: "feculents_soir_1735123457",
      critere_ref_id: "feculents_soir",
      nom: "Pas de féculents après 19h",
      description: "Éviter féculents après 19h",
      categorie: "timing",
      
      contexte: {
        valeur_reprise: 12,
        objectif_cristallisation: 0,
        gravite: "moyenne"
      },
      
      etat: {
        valide_aujourdhui: false,
        jours_valides: [1, 2, 4],
        streak_actuel: 0,
        meilleur_streak: 2
      }
    }
    // ... autres critères
  ],
  
  // PROGRESSION GLOBALE
  progression: {
    jours_valides: [1, 2, 3, 4], // Jours avec tous critères OK
    taux_validation_global: 0.88, // 88% critères validés
    criteres_totalement_ancres: ["extras_frequents"], // Critères réussis 21j+
    criteres_en_difficulte: ["feculents_soir"]
  },
  
  // TRACKING COMPORTEMENTS (comparaison reprise vs cristallisation)
  tracking_comportements: {
    extras: {
      reprise: { total: 18, moyenne_jour: 0.86 },
      cristallisation: { total: 2, moyenne_jour: 0.4 },
      evolution: "amelioration_significative", // +53% amélioration
      ancre: false // Pas encore 21j consécutifs
    },
    
    feculents_soir: {
      reprise: { total: 12, moyenne_semaine: 4 },
      cristallisation: { total: 1, moyenne_semaine: 0.5 },
      evolution: "amelioration",
      ancre: false
    },
    
    qualite_nutritionnelle: {
      reprise: { qn_moyen: 2.8 },
      cristallisation: { qn_moyen: 3.6 },
      evolution: "progression_excellente",
      ancre: true // 21j+ avec QN ≥ 3.5
    }
  },
  
  // VICTOIRES & APPRENTISSAGES
  victoires: [
    {
      critere_id: "qn_faible_1735123458",
      date_victoire: "2025-12-28",
      description: "QN moyen ≥ 3.5 pendant 21 jours consécutifs",
      comportement_gagne: "Alimentation de qualité nutritionnelle élevée",
      impact_mesure: "+0.8 point QN vs reprise"
    }
  ],
  
  mauvaises_habitudes_vaincues: [
    {
      habitude: "Extras quotidiens systématiques",
      frequence_avant: 0.86, // par jour
      frequence_apres: 0.2,
      reduction: "77%",
      date_victoire: "2025-12-30",
      methode_utilisee: "Défi '7 jours sans extra' + alternatives préparées"
    }
  ],
  
  statut: "en_cours" // ou "termine"
}
```

---

## 📈 TRACKING PRÉCIS DES PROGRÈS

### **Fonction : `trackComportement(critere, validation)`**

```javascript
export async function trackComportement(critere, validationJour) {
  // 1. Update état critère
  critere.etat.valide_aujourdhui = validationJour.valide;
  
  if (validationJour.valide) {
    critere.etat.jours_valides.push(validationJour.jour);
    critere.etat.streak_actuel++;
    critere.etat.meilleur_streak = Math.max(
      critere.etat.meilleur_streak,
      critere.etat.streak_actuel
    );
  } else {
    critere.etat.streak_actuel = 0;
  }
  
  // 2. Vérifier ancrage (21 jours consécutifs)
  if (critere.etat.streak_actuel >= 21) {
    await declarerComportementAncre(critere);
  }
  
  // 3. Calculer évolution vs reprise
  const evolutionVsReprise = calculerEvolution(
    critere.contexte.valeur_reprise,
    critere.etat.valeur_actuelle_cristallisation
  );
  
  return {
    critere_id: critere.id,
    valide: validationJour.valide,
    streak: critere.etat.streak_actuel,
    evolution: evolutionVsReprise,
    ancre: critere.etat.streak_actuel >= 21
  };
}
```

---

## 🎯 EXEMPLES CONCRETS

### **Exemple 1 : Utilisateur avec beaucoup d'extras pendant reprise**

#### **Bilan reprise**
```javascript
{
  comportements_detectes: {
    extras: {
      total: 22, // sur 21 jours
      frequence_moyenne: 1.05 // > 1/jour !
    }
  },
  faiblesses_identifiees: [
    {
      id: "extras_frequents",
      gravite: "elevee"
    }
  ]
}
```

#### **Critère généré**
```javascript
{
  nom: "Contrôle des extras",
  description: "Maximum 3 extras par semaine", // 22/3 semaines = 7.3 → réduit à 3
  contexte: {
    valeur_reprise: 22,
    objectif_cristallisation: 3
  },
  messages: {
    debut: "Tu avais 22 extras en 21 jours de reprise (1.05/jour). Objectif : max 3/semaine."
  }
}
```

#### **Tracking pendant cristallisation**
```javascript
// Semaine 1
{ extras: 2 } // ✅ Objectif atteint

// Semaine 2
{ extras: 4 } // ⚠️ Légèrement au-dessus

// Semaine 3
{ extras: 1 } // ✅ Excellent

// Bilan 3 semaines : 7 extras (vs 22 pendant reprise = -68%)
```

---

### **Exemple 2 : QN faible pendant reprise**

#### **Bilan reprise**
```javascript
{
  comportements_detectes: {
    qualite_nutritionnelle: {
      qn_moyen: 2.5,
      evolution: "baisse_progressive"
    }
  },
  faiblesses_identifiees: [
    {
      id: "qn_faible",
      gravite: "elevee",
      donnees_support: { qn_moyen: 2.5 }
    }
  ]
}
```

#### **Critère généré**
```javascript
{
  nom: "Score QN quotidien",
  description: "Maintenir QN moyen ≥ 3.2/5", // 2.5 + 0.7 = 3.2
  contexte: {
    valeur_reprise: 2.5,
    objectif_cristallisation: 3.2
  }
}
```

#### **Tracking**
```javascript
// Jour 5 : QN = 3.8 ✅
// Jour 10 : QN = 3.5 ✅
// Jour 15 : QN = 2.9 ❌
// Jour 20 : QN = 3.9 ✅

// Moyenne semaine 3 : 3.6/5
// Évolution vs reprise : +1.1 point (+44%)
```

---

## 🏆 MESURE DES VICTOIRES

### **Conditions de victoire**

```javascript
export function verifierVictoire(critere) {
  // Critère 1 : 21 jours consécutifs
  const ancrageDuree = critere.etat.streak_actuel >= 21;
  
  // Critère 2 : Amélioration significative vs reprise
  const ameliorationSignificative = critere.contexte.valeur_reprise 
    ? (critere.etat.valeur_actuelle_cristallisation / critere.contexte.valeur_reprise) <= 0.5
    : true;
  
  // Critère 3 : Maintien sur dernière semaine
  const maintienRecent = critere.etat.jours_valides_derniere_semaine >= 6;
  
  if (ancrageDuree && ameliorationSignificative && maintienRecent) {
    return {
      victoire: true,
      type: "comportement_ancre",
      description: genererDescriptionVictoire(critere)
    };
  }
  
  return { victoire: false };
}
```

---

## 🎯 RÉPONSE À TES ATTENTES

### ✅ Critères DYNAMIQUES (pas hardcodés)
- Référentiel dans fiche métier (`referentiel_criteres_cristallisation.js`)
- Génération personnalisée à partir bilan_reprise
- Adaptation aux faiblesses RÉELLES de chaque utilisateur

### ✅ Basés sur données REPRISE
- Analyse `bilan_reprise.comportements_detectes`
- Identification automatique faiblesses
- Calcul seuils personnalisés (ex: 22 extras → objectif 3/semaine)

### ✅ Tracking précis
- **Nouveaux comportements développés** : Streak, ancrage 21j
- **Mauvaises habitudes vaincues** : Avant/après mesurable
- **Évolution quantifiable** : % amélioration vs reprise

### ✅ Personnalisation totale
- Chaque cristallisation = critères DIFFÉRENTS
- Selon le vécu de la reprise spécifique
- Messages contextualisés avec données réelles

---

## 🚀 PROCHAINE ÉTAPE

**C'est cette architecture qui te convient ?**

1. ✅ Référentiel critères dans fiche métier
2. ✅ Génération dynamique depuis bilan_reprise
3. ✅ Tracking précis comportements gagnés/vaincus
4. ✅ Personnalisation selon données réelles

**Je crée la fiche métier complète + fonctions de génération ?** 🎯
