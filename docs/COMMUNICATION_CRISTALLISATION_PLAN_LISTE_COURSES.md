# 🔄 COMMUNICATION CRISTALLISATION ↔ PLAN ↔ LISTE COURSES

**Date** : 26 décembre 2025  
**Objectif** : Expliquer flux de données entre pages

---

## 📂 PAGES IMPLIQUÉES

### **✅ Pages existantes**
- `/pages/plan.js` - Planification mensuelle repas
- Table BDD : `repas_planifies`

### **🆕 Pages à créer**
- `/pages/cristallisation.js` - Vue d'ensemble
- `/pages/cristallisation-quotidien.js` - Suivi quotidien

---

## 🔄 WORKFLOW COMPLET

```
┌─────────────────────────────────────────────────┐
│  PAGE 1 : /cristallisation-quotidien.js        │
│  (Suivi quotidien)                              │
│                                                 │
│  Affiche recommandations :                     │
│  💡 "Cette semaine, privilégie légumes +       │
│      protéines maigres pour atteindre QN 3.5"  │
│                                                 │
│  [📅 Planifier mes repas] ← Bouton            │
└─────────────────────────────────────────────────┘
               ↓ router.push('/plan?source=cristallisation')
               ↓ Transmet : critères actifs + aliments triggers
┌─────────────────────────────────────────────────┐
│  PAGE 2 : /plan.js (EXISTANTE)                 │
│  (Planification mensuelle repas)               │
│                                                 │
│  • Drag & drop repas dans calendrier           │
│  • Enregistre dans repas_planifies            │
│                                                 │
│  [🛒 Générer liste courses] ← NOUVEAU bouton  │
└─────────────────────────────────────────────────┘
               ↓ Génère liste depuis repas_planifies
┌─────────────────────────────────────────────────┐
│  MODAL : Liste courses                         │
│                                                 │
│  • Agrège aliments planifiés                   │
│  • Enrichit avec BDD alimentaire               │
│  • Filtre selon critères cristallisation       │
│  • Export PDF/Email                            │
└─────────────────────────────────────────────────┘
               ↓ Retour
┌─────────────────────────────────────────────────┐
│  Retour vers /cristallisation-quotidien.js     │
│  (avec notification "Liste prête ✅")           │
└─────────────────────────────────────────────────┘
```

---

## 📊 DONNÉES ÉCHANGÉES

### **1. Cristallisation → Plan**

```javascript
// Dans /cristallisation-quotidien.js
const allerPlanification = () => {
  const criteres = getCriteresActifs(); // Ex: amélioration QN, réduction extras
  const triggers = getAlimentsTriggers(); // Ex: gâteau chocolat, glace
  
  router.push({
    pathname: '/plan',
    query: {
      source: 'cristallisation',
      criteres_actifs: JSON.stringify(criteres),
      aliments_triggers: JSON.stringify(triggers),
      objectif_qn: 3.5
    }
  });
};

// Données transmises :
{
  source: "cristallisation",
  criteres_actifs: [
    { id: "amelioration_qn", objectif: 3.5 },
    { id: "reduction_extras", max_semaine: 3 }
  ],
  aliments_triggers: ["gâteau chocolat", "glace", "pain blanc"],
  objectif_qn: 3.5
}
```

---

### **2. Plan → Génération liste courses**

```javascript
// Dans /plan.js (nouveau bouton à ajouter)
const genererListeCourses = async () => {
  // ÉTAPE 1 : Récupérer repas planifiés de la semaine
  const debutSemaine = getDebutSemaine(); // Lundi prochain
  const finSemaine = getFinSemaine();     // Dimanche prochain
  
  const { data: repasPlanifies } = await supabase
    .from('repas_planifies')
    .select('*')
    .gte('date', debutSemaine)
    .lte('date', finSemaine)
    .eq('user_id', 'laurelle_test_user');
  
  // Exemple données :
  // [
  //   { date: "2025-12-30", type: "Déjeuner", aliment: "Poulet", categorie: "proteine" },
  //   { date: "2025-12-30", type: "Déjeuner", aliment: "Brocolis", categorie: "legume" },
  //   { date: "2025-12-31", type: "Dîner", aliment: "Saumon", categorie: "proteine" }
  // ]
  
  // ÉTAPE 2 : Agréger aliments identiques
  const agregation = agregerAliments(repasPlanifies);
  // Résultat :
  // {
  //   "Poulet": { quantite_totale: 450g, occurrences: 3 },
  //   "Brocolis": { quantite_totale: 600g, occurrences: 3 }
  // }
  
  // ÉTAPE 3 : Enrichir avec BDD + contexte cristallisation
  const listeEnrichie = await enrichirAvecBDD(agregation);
  // Ajoute : QN, catégorie, alertes si trigger, alternatives
  
  // ÉTAPE 4 : Filtrer selon critères cristallisation
  const listeFiltree = filtrerSelonCriteres(listeEnrichie);
  // Ajoute recommandations : "Remplace pain blanc par pain complet"
  
  // ÉTAPE 5 : Générer liste finale
  const listefinale = genererListeFinale(listeFiltree);
  
  // Afficher modal avec liste
  setModalListeCourses(listefinale);
};
```

---

## 🛒 GÉNÉRATION LISTE COURSES (Détail)

### **Étape 1 : Récupération repas planifiés**

```sql
-- Requête Supabase
SELECT * FROM repas_planifies
WHERE date >= '2025-12-30'
  AND date <= '2026-01-05'
  AND user_id = 'laurelle_test_user'
ORDER BY date, type;
```

**Données récupérées :**
```javascript
[
  { id: 1, date: "2025-12-30", type: "Déjeuner", aliment: "Poulet", categorie: "proteine", quantite: 150 },
  { id: 2, date: "2025-12-30", type: "Déjeuner", aliment: "Brocolis", categorie: "legume", quantite: 200 },
  { id: 3, date: "2025-12-30", type: "Dîner", aliment: "Saumon", categorie: "proteine", quantite: 150 },
  { id: 4, date: "2025-12-31", type: "Déjeuner", aliment: "Poulet", categorie: "proteine", quantite: 150 },
  { id: 5, date: "2025-12-31", type: "Dîner", aliment: "Poulet", categorie: "proteine", quantite: 150 },
  { id: 6, date: "2026-01-01", type: "Déjeuner", aliment: "Saumon", categorie: "proteine", quantite: 150 }
]
```

---

### **Étape 2 : Agrégation aliments**

```javascript
function agregerAliments(repasPlanifies) {
  const agregation = {};
  
  repasPlanifies.forEach(repas => {
    const aliment = repas.aliment;
    const quantite = repas.quantite || 0;
    
    if (!agregation[aliment]) {
      agregation[aliment] = {
        nom: aliment,
        quantite_totale: 0,
        occurrences: 0,
        categorie: repas.categorie
      };
    }
    
    agregation[aliment].quantite_totale += quantite;
    agregation[aliment].occurrences += 1;
  });
  
  return Object.values(agregation);
}

// Résultat :
[
  { nom: "Poulet", quantite_totale: 450, occurrences: 3, categorie: "proteine" },
  { nom: "Brocolis", quantite_totale: 200, occurrences: 1, categorie: "legume" },
  { nom: "Saumon", quantite_totale: 300, occurrences: 2, categorie: "proteine" }
]
```

---

### **Étape 3 : Enrichissement BDD + Contexte cristallisation**

```javascript
async function enrichirAvecBDD(alimentsAgreges) {
  // Récupérer contexte cristallisation depuis query params ou localStorage
  const contexteCristal = {
    criteres_actifs: JSON.parse(localStorage.getItem('criteres_cristallisation')),
    aliments_triggers: JSON.parse(localStorage.getItem('aliments_triggers')),
    objectif_qn: parseFloat(localStorage.getItem('objectif_qn'))
  };
  
  const listeEnrichie = await Promise.all(
    alimentsAgreges.map(async (aliment) => {
      // Récupérer info depuis BDD alimentaire
      const infoBDD = referentielAliments.find(a => a.nom === aliment.nom);
      
      // Vérifier si aliment trigger
      const estTrigger = contexteCristal.aliments_triggers?.includes(aliment.nom);
      
      // Calculer quantité courses (arrondir)
      const quantiteCourses = calculerQuantiteCourses(aliment.quantite_totale);
      
      return {
        ...aliment,
        
        // Info BDD
        qn: infoBDD?.qn || 3,
        calories: infoBDD?.calories || 0,
        
        // Quantité ajustée
        quantite_courses: quantiteCourses,
        
        // Alertes cristallisation
        alerte: estTrigger ? {
          type: "trigger",
          message: `⚠️ Aliment trigger (éviter pendant cristallisation)`,
          alternative: infoBDD?.alternatives_meilleures?.[0]?.nom || "Voir alternatives"
        } : null,
        
        // Recommandations QN
        recommandation_qn: infoBDD?.qn < 3 ? {
          type: "amelioration_qn",
          message: `💡 QN faible (${infoBDD.qn}/5)`,
          alternative: `Remplace par ${infoBDD.alternatives_meilleures?.[0]?.nom} (QN ${infoBDD.alternatives_meilleures?.[0]?.qn})`
        } : null
      };
    })
  );
  
  return listeEnrichie;
}

function calculerQuantiteCourses(quantiteTotale) {
  // Arrondir pour achats réels
  if (quantiteTotale <= 250) return "250g (1 petite portion)";
  if (quantiteTotale <= 500) return "500g (1 portion standard)";
  if (quantiteTotale <= 1000) return "1kg";
  return `${Math.ceil(quantiteTotale / 1000)}kg`;
}

// Résultat :
[
  {
    nom: "Poulet",
    quantite_totale: 450,
    quantite_courses: "500g (1 portion standard)",
    occurrences: 3,
    categorie: "proteine",
    qn: 3,
    alerte: null,
    recommandation_qn: null
  },
  {
    nom: "Pain blanc",
    quantite_totale: 300,
    quantite_courses: "500g",
    occurrences: 3,
    categorie: "feculent",
    qn: 2,
    alerte: { type: "trigger", message: "⚠️ Aliment trigger", alternative: "Pain complet" },
    recommandation_qn: { type: "amelioration_qn", message: "💡 QN faible (2/5)", alternative: "Pain complet (QN 3)" }
  }
]
```

---

### **Étape 4 : Génération liste finale**

```javascript
function genererListeFinale(listeEnrichie) {
  // Organiser par catégories
  const parCategorie = {
    legumes: listeEnrichie.filter(a => a.categorie === "legume"),
    proteines: listeEnrichie.filter(a => a.categorie === "proteine"),
    feculents: listeEnrichie.filter(a => a.categorie === "feculent"),
    fruits: listeEnrichie.filter(a => a.categorie === "fruit"),
    extras: listeEnrichie.filter(a => a.categorie === "extra")
  };
  
  // Calculer stats
  const stats = {
    total_aliments: listeEnrichie.length,
    qn_moyen_prevu: calculerQNMoyen(listeEnrichie),
    budget_estime: calculerBudget(listeEnrichie),
    alertes_count: listeEnrichie.filter(a => a.alerte).length,
    recommandations_count: listeEnrichie.filter(a => a.recommandation_qn).length
  };
  
  return {
    categories: parCategorie,
    stats: stats,
    conformite_cristallisation: calculerConformite(listeEnrichie)
  };
}

function calculerQNMoyen(liste) {
  const total = liste.reduce((sum, a) => sum + (a.qn * a.occurrences), 0);
  const occurrencesTotal = liste.reduce((sum, a) => sum + a.occurrences, 0);
  return (total / occurrencesTotal).toFixed(1);
}

function calculerConformite(liste) {
  const alertes = liste.filter(a => a.alerte).length;
  const total = liste.length;
  return Math.round(((total - alertes) / total) * 100);
}
```

---

## 📱 AFFICHAGE LISTE COURSES

```
┌─────────────────────────────────────────────────────────┐
│  🛒 LISTE COURSES SEMAINE 1                            │
│  Du 30/12/2025 au 05/01/2026                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🥦 LÉGUMES (QN moyen : 5/5)                           │
│  ☐ Brocolis : 600g                                     │
│  ☐ Courgettes : 1kg                                    │
│  ☐ Haricots verts : 500g                               │
│                                                         │
│  🐟 PROTÉINES (QN moyen : 3.5/5)                       │
│  ☐ Poulet : 500g                                       │
│  ☐ Saumon : 300g                                       │
│  ☐ Œufs : 12 unités                                    │
│                                                         │
│  🌾 FÉCULENTS (QN moyen : 2.5/5)                       │
│  ☐ Pain blanc : 500g                                   │
│  ⚠️ ALERTE : Aliment trigger détecté                    │
│  💡 CONSEIL : Remplace par pain complet (QN 3 vs 2)    │
│                                                         │
│  🍎 FRUITS (QN moyen : 4/5)                            │
│  ☐ Pommes : 1kg                                        │
│  ☐ Bananes : 6 unités                                  │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                         │
│  📊 PRÉVISIONS SEMAINE                                  │
│  • QN moyen prévu : 3.6/5 (objectif : 3.5) ✅          │
│  • Budget estimé : 45-50€                              │
│  • Conformité cristallisation : 90% ✅                  │
│  • Alertes : 1 (pain blanc)                            │
│  • Recommandations : 1 amélioration possible           │
│                                                         │
│  [📥 Télécharger PDF] [📧 Envoyer par email]           │
│  [✏️ Modifier planification] [✅ Valider]              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔙 RETOUR VERS CRISTALLISATION

```javascript
// Après validation liste courses
const retourCristallisation = () => {
  router.push({
    pathname: '/cristallisation-quotidien',
    query: {
      liste_courses_generee: true,
      qn_prevu: stats.qn_moyen_prevu,
      conformite: stats.conformite_cristallisation
    }
  });
};

// Dans /cristallisation-quotidien.js
useEffect(() => {
  if (query.liste_courses_generee) {
    showNotification({
      type: "success",
      title: "✅ Liste courses prête !",
      message: `QN prévu : ${query.qn_prevu}/5 | Conformité : ${query.conformite}%`,
      duration: 5000
    });
  }
}, [query]);
```

---

## 🎯 RÉSUMÉ FLUX DONNÉES

| Étape | Page | Action | Données |
|-------|------|--------|---------|
| 1 | `/cristallisation-quotidien.js` | Clic "Planifier repas" | Transmet critères + triggers |
| 2 | `/plan.js` | Affiche calendrier + reçoit contexte | Reçoit critères cristallisation |
| 3 | `/plan.js` | Utilisateur planifie repas | Enregistre dans `repas_planifies` |
| 4 | `/plan.js` | Clic "Générer liste courses" | Récupère `repas_planifies` |
| 5 | Fonction | Agrégation + enrichissement | Calcule quantités + analyse BDD |
| 6 | Modal | Affiche liste courses | Liste enrichie + alertes + stats |
| 7 | Modal | Export PDF/Email | Génère document |
| 8 | `/cristallisation-quotidien.js` | Retour avec notification | Confirmation liste prête |

**Clair maintenant ?** 🎯
