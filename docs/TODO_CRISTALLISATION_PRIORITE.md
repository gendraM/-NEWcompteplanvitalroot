# 📋 TODO CRISTALLISATION - ORDRE DE PRIORITÉ

**Date:** 26 Décembre 2025  
**Projet:** Phase Cristallisation (45 jours post-reprise)

---

## 🔍 ANALYSE STRUCTURE SUPABASE

### ✅ **TABLES EXISTANTES UTILISABLES**

| Table | Utilisation Cristallisation |
|-------|------------------------------|
| `repas_reels` | ✅ Analyse patterns (extras, féculents, QN, quantités, heure) |
| `repas_planifies` | ✅ Base pour génération liste courses |
| `historique_poids` | ✅ Suivi poids stable (±300g/semaine) |
| `defis` | ✅ Stockage défis IA + défis personnalisés |
| `journal_defis` | ✅ Suivi quotidien engagements défis |
| `referentiel_aliments` | ✅ BDD alternatives, QN, portions |
| `profil` | ⚠️ À enrichir avec DEJ et objectif poids V2 |

### ❌ **TABLES À CRÉER**

#### **1. `parcours_cristallisation`**
```sql
CREATE TABLE parcours_cristallisation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'laurelle_test_user',
  
  -- Durée et dates
  duree_jours INTEGER NOT NULL DEFAULT 45,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  jour_courant INTEGER DEFAULT 1, -- Calculé auto
  
  -- Bilan reprise (transmis depuis reprise-alimentaire-apres-jeune.js)
  bilan_reprise JSONB NOT NULL, -- {
    -- extras: { total: 22, par_jour: 1.05, types_frequents: ["chocolat", "biscuits"] },
    -- feculents_soir: { occurrences: 12, pourcentage: 57 },
    -- qn_moyen: 3.1,
    -- quantites_excessives: { taux_conformite: 68 },
    -- jeunes_ponctuels: { reussis: 14, taux: 67 },
    -- pratiques_spirituelles: { moyenne_par_jour: 2.3, irregularite: true }
  -- }
  
  -- Critères personnalisés dynamiques (générés depuis bilan_reprise)
  criteres_personnalises JSONB NOT NULL, -- [
    -- {
    --   id: "extras_reduction",
    --   type: "extras_frequents",
    --   titre: "Maximum 3 extras par semaine",
    --   description: "Réduis de 68% tes extras (de 22 à 3/semaine)",
    --   seuil_actuel: 22,
    --   seuil_cible: 3,
    --   validation: "function",
    --   messages: { encouragement, alerte, victoire }
    -- },
    -- ...
  -- ]
  
  -- Progression quotidienne
  progression JSONB DEFAULT '[]', -- [
    -- {
    --   jour: 1,
    --   date: "2025-12-26",
    --   criteres_valides: ["quantites_ok", "pas_feculents_soir", "qn_bon"],
    --   criteres_echoues: ["extra_consomme", "jeune_rate"],
    --   score_jour: 3,
    --   feedback: "Bon démarrage !",
    --   jeune_ponctuel: false,
    --   poids: 76.8
    -- }
  -- ]
  
  -- Tracking nouveaux comportements gagnés
  tracking_comportements JSONB DEFAULT '{}', -- {
    -- "pas_extra_journalier": { 
    --   streak_actuel: 5, 
    --   streak_max: 7, 
    --   dernier_succes: "2025-12-25" 
    -- },
    -- "feculents_timing": { 
    --   streak_actuel: 12, 
    --   streak_max: 12, 
    --   dernier_succes: "2025-12-25" 
    -- }
  -- }
  
  -- Victoires débloquées
  victoires JSONB DEFAULT '[]', -- [
    --   { comportement: "pas_extra_21j", date_obtention: "2025-01-15", badge: "🏆" },
    --   ...
  -- ]
  
  -- Mauvaises habitudes vaincues
  mauvaises_habitudes_vaincues JSONB DEFAULT '[]', -- [
    --   { 
    --     habitude: "extras_frequents", 
    --     taux_reprise: 105, 
    --     taux_cristallisation: 20, 
    --     reduction_pourcent: 81,
    --     date_victoire: "2025-01-20"
    --   }
    -- ]
  
  -- Statut
  statut TEXT DEFAULT 'en_cours', -- en_cours, terminee, abandonnee
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parcours_cristallisation_user_id ON parcours_cristallisation(user_id);
CREATE INDEX idx_parcours_cristallisation_statut ON parcours_cristallisation(statut);
CREATE INDEX idx_parcours_cristallisation_date_debut ON parcours_cristallisation(date_debut);
```

**📌 POURQUOI NÉCESSAIRE:**
- Stocke le programme personnalisé de chaque utilisateur
- Critères dynamiques basés sur `bilan_reprise` (pas hardcodés)
- Tracking précis des comportements (nouveaux gagnés vs mauvaises habitudes vaincues)
- Progression jour par jour sur 45 jours

---

#### **2. `conseils_cristallisation`**
```sql
CREATE TABLE conseils_cristallisation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'laurelle_test_user',
  parcours_id UUID REFERENCES parcours_cristallisation(id) ON DELETE CASCADE,
  
  -- Conseil généré
  date_generation DATE NOT NULL,
  type_repas TEXT NOT NULL, -- dejeuner, diner
  cible TEXT NOT NULL, -- soir (aujourd'hui), lendemain
  
  -- Pattern détecté
  pattern_detecte TEXT NOT NULL, -- extra_frequents, feculents_soir, qn_faible, quantite_excessive
  aliments_triggers JSONB, -- ["chocolat", "biscuits"]
  
  -- Conseil
  message TEXT NOT NULL,
  alternatives_suggerees JSONB, -- [{ nom: "Pomme", qn: 5, portion: "1 unité" }]
  
  -- Suivi application
  applique BOOLEAN DEFAULT false,
  date_application TIMESTAMPTZ,
  repas_reel_id BIGINT, -- Référence à repas_reels si appliqué
  
  -- Reconnaissance
  points_obtenus INTEGER DEFAULT 0, -- +10 si appliqué
  badge_debloque TEXT, -- "🌟 Conseil appliqué"
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conseils_user_date ON conseils_cristallisation(user_id, date_generation);
CREATE INDEX idx_conseils_parcours ON conseils_cristallisation(parcours_id);
CREATE INDEX idx_conseils_appliques ON conseils_cristallisation(applique);
```

**📌 POURQUOI NÉCESSAIRE:**
- 1 conseil MAX par jour et par type de repas (règle stricte)
- Conseil pour NEXT meal (soir ou lendemain), pas pendant saisie (trop tard)
- Tracking si appliqué → +10 points + badge
- Historique des conseils pour éviter répétition

---

#### **3. `listes_courses_generees`**
```sql
CREATE TABLE listes_courses_generees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'laurelle_test_user',
  parcours_id UUID REFERENCES parcours_cristallisation(id) ON DELETE CASCADE,
  
  -- Période planifiée
  semaine_debut DATE NOT NULL,
  semaine_fin DATE NOT NULL,
  
  -- Liste courses (sortie du processus 5 étapes)
  liste_json JSONB NOT NULL, -- {
    -- categories: [
    --   {
    --     nom: "Légumes",
    --     aliments: [
    --       { 
    --         nom: "Courgettes", 
    --         quantite_courses: 1400, 
    --         qn: 5, 
    --         est_trigger: false,
    --         alertes: [],
    --         recommandations: ["Privilégie bio si possible"]
    --       }
    --     ]
    --   }
    -- ],
    -- stats: {
    --   total_aliments: 24,
    --   qn_moyen_prevu: 3.8,
    --   budget_estime: 67.5,
    --   conformite_cristallisation: 92
    -- }
  -- }
  
  -- Contexte cristallisation transmis
  criteres_actifs JSONB, -- ["pas_extras", "feculents_matin_midi_uniquement"]
  aliments_triggers JSONB, -- ["chocolat", "chips"]
  objectif_qn NUMERIC, -- 3.5
  
  -- Export
  pdf_url TEXT,
  email_envoye BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listes_courses_user_date ON listes_courses_generees(user_id, semaine_debut);
CREATE INDEX idx_listes_courses_parcours ON listes_courses_generees(parcours_id);
```

**📌 POURQUOI NÉCESSAIRE:**
- Stocke résultat génération liste courses depuis /plan.js
- Historique des listes générées (révision possible)
- Stats prévisionnelles (QN moyen, conformité)
- Export PDF/Email

---

### ⚠️ **TABLES À ENRICHIR (FUTUR V2 - Pas prioritaire maintenant)**

#### **`profil` - Ajouter colonnes calories + prévision poids**
```sql
-- V2 FUTUR - PAS MAINTENANT
ALTER TABLE profil ADD COLUMN sexe TEXT; -- M/F
ALTER TABLE profil ADD COLUMN niveau_activite TEXT; -- sedentaire, leger, moyen, intense
ALTER TABLE profil ADD COLUMN dej_calculee NUMERIC; -- Dépense Énergétique Journalière
ALTER TABLE profil ADD COLUMN objectif_poids TEXT; -- maintien, perte_douce, stabilisation
ALTER TABLE profil ADD COLUMN variation_poids_cible NUMERIC; -- kg/semaine (-0.3, 0, +0.2)
```

#### **`referentiel_aliments` - Ajouter données calories + portions**
```sql
-- V2 FUTUR - PAS MAINTENANT
ALTER TABLE referentiel_aliments ADD COLUMN calories INTEGER; -- Pour 100g
ALTER TABLE referentiel_aliments ADD COLUMN portion_min INTEGER; -- En grammes
ALTER TABLE referentiel_aliments ADD COLUMN portion_ideale INTEGER;
```

---

## ✅ **RÉCAPITULATIF ANALYSE BDD**

| Type | Nombre | Détails |
|------|--------|---------|
| ✅ **Tables existantes utilisables** | 7 | repas_reels, repas_planifies, historique_poids, defis, journal_defis, referentiel_aliments, profil |
| ❌ **Nouvelles tables à créer** | 3 | parcours_cristallisation, conseils_cristallisation, listes_courses_generees |
| ⚠️ **Tables à enrichir (V2)** | 2 | profil, referentiel_aliments (calories + prévision poids) |

**Total tables à créer MAINTENANT:** **3 tables** ✅

---

## 🎯 TODO - ORDRE DE PRIORITÉ

### **🔴 PRIORITÉ 1 : FONDATIONS (Base de données + Référentiel)**

#### **1.1 - Créer tables Supabase** ⏱️ 1h
```bash
# Script SQL à exécuter dans Supabase SQL Editor
# Créer 3 tables : parcours_cristallisation, conseils_cristallisation, listes_courses_generees
# Désactiver RLS (NO AUTH pattern)
```
**Fichiers:**
- `scripts/create_tables_cristallisation.sql`

**⚠️ CRITIQUE:** Toute l'appli cristallisation dépend de ces tables

---

#### **1.2 - Créer référentiel critères dynamiques** ⏱️ 2h
```javascript
// /data/referentiel_criteres_cristallisation.js
export const REFERENTIEL_CRITERES_CRISTALLISATION = {
  extras_frequents: {
    conditions_activation: {
      seuil_reprise: 10, // Si >10 extras pendant reprise
      formule: "bilan_reprise.extras.total > 10"
    },
    configuration: {
      calcul_seuil: (bilanReprise) => {
        const extrasReprise = bilanReprise.extras.total;
        const reduction = Math.ceil(extrasReprise * 0.68); // -68%
        return {
          seuil_actuel: extrasReprise,
          seuil_cible: Math.max(3, extrasReprise - reduction), // Min 3/semaine
          titre: `Maximum ${Math.max(3, extrasReprise - reduction)} extras par semaine`,
          description: `Réduis de 68% tes extras (de ${extrasReprise} à ${Math.max(3, extrasReprise - reduction)}/semaine)`
        };
      },
      validation_quotidienne: (repasJour) => {
        return repasJour.filter(r => r.est_extra).length === 0;
      }
    },
    messages: {
      encouragement: "Bravo ! Aucun extra aujourd'hui 💪",
      alerte: "⚠️ Extra détecté. Tu as déjà {{nb_extras}} extras cette semaine (max {{seuil_cible}})",
      victoire: "🏆 21 jours sans extras ! Habitude vaincue !"
    }
  },
  // ... 5 autres critères (feculents_soir, qn_faible, etc.)
};
```
**Fichiers:**
- `/data/referentiel_criteres_cristallisation.js`

**⚠️ CRITIQUE:** Génération critères personnalisés dépend de ce référentiel

---

#### **1.3 - Créer API cristallisation (NO AUTH)** ⏱️ 3h
```javascript
// /lib/cristallisationAPI.js
// Pattern identique à journalSpirituelAPI.js
const getLocalUserId = () => 'laurelle_test_user';

export async function getParcoursCristallisationActif() { ... }
export async function createParcoursCristallisation(bilanReprise) { ... }
export async function updateCriteresDuJour(parcoursId, jour, criteresValidation) { ... }
export async function genererCriteresPersonnalises(bilanReprise) { 
  // Utilise REFERENTIEL_CRITERES_CRISTALLISATION
}
export async function trackComportement(parcoursId, comportement, succes) { ... }
export async function verifierVictoire(parcoursId, comportement) { 
  // Streak 21+ jours → Badge
}
```
**Fichiers:**
- `/lib/cristallisationAPI.js`

**Dépendances:** 1.1 (tables), 1.2 (référentiel)

---

### **🟡 PRIORITÉ 2 : PAGES PRINCIPALES**

#### **2.1 - Créer page /cristallisation.js (Dashboard)** ⏱️ 4h
```javascript
// /pages/cristallisation.js
// Reçoit bilan_reprise depuis reprise-alimentaire-apres-jeune.js
// Génère critères dynamiques
// Affiche 6 sections : bilan, poids, QN, jeûnes, défis, spirituel
// Bouton "📅 Mon suivi quotidien" → cristallisation-quotidien
```
**Composants:**
- `BandeauBilanReprise.js` - Affiche résumé reprise (extras, féculents, QN)
- `SuiviPoidsStable.js` - Graphique poids ±300g
- `ScoreQNMoyen.js` - Évolution QN cristallisation vs reprise
- `JeunesPonctuels.js` - Calendrier jeûnes 2/semaine
- `DefisEnCours.js` - 3 défis actifs
- `VoietSpirituel.js` - 5 pratiques quotidiennes

**Dépendances:** 1.1, 1.2, 1.3

---

#### **2.2 - Créer page /cristallisation-quotidien.js** ⏱️ 5h
```javascript
// /pages/cristallisation-quotidien.js
// Calcule jour_courant automatiquement
// Affiche 5 critères quotidiens + 3 hebdomadaires
// Navigation ◀ Jour X | Jour Y | Jour Z ▶
// Section repas du jour (lien vers saisie)
// Bouton "📅 Planifier mes repas" → /plan.js?source=cristallisation
// Feedback quotidien avec score
```
**Composants:**
- `HeaderCristallisation.js` - Jour X/45 + date
- `CartesCriteresDuJour.js` - 5 critères avec validation temps réel
- `RepasAujourdhui.js` - 4 repas + bouton saisie
- `DefisActifs.js` - 3 défis + progression
- `FeedbackJournalier.js` - Score + message personnalisé
- `BoutonPlanifierRepas.js` - Vers /plan.js avec context

**Dépendances:** 1.1, 1.2, 1.3, 2.1

---

### **🟠 PRIORITÉ 3 : INTÉGRATIONS SAISIE REPAS**

#### **3.1 - Intégrer widget flottant dans saisie repas** ⏱️ 3h
```javascript
// Modifier page saisie repas existante
// Détecter phase cristallisation (dateDebutCristallisation in localStorage)
// Afficher bandeau "🏔️ CRISTALLISATION - Jour X/45"
// Widget flottant "Critères du jour" (minimizable)
// Validation temps réel après chaque aliment ajouté
```
**Modifications:**
- Détecter phase cristallisation dans `useEffect`
- Composant `WidgetCriteresCristallisation.js` (flottant)
- Fonction `validerCritereTempsReel(critere, repasEnCours)`
- 4 scénarios alertes : féculent après 19h, extra, QN faible, quantité excessive

**Dépendances:** 1.1, 1.3, 2.2

---

#### **3.2 - Implémenter système conseils NEXT meal** ⏱️ 4h
```javascript
// /lib/conseilsCristallisation.js
export async function genererConseilProchainRepas(patterns, criteresJour) {
  // 1 conseil MAX par jour et par type repas
  // Conseil pour NEXT meal (soir ou lendemain)
  // Éviter répétition (vérifier historique conseils)
}

export async function verifierApplicationConseil(repasReel, conseilId) {
  // 3 conditions : conseil en cours + bon type repas + alternative présente
  // Si OUI → +10 points + badge + notification
}
```
**Modifications:**
- Appeler `genererConseilProchainRepas()` APRÈS saisie repas validée
- Afficher notification conseil pour prochain repas
- Détecter application au prochain repas
- Créer notification reconnaissance (+10 points)

**Dépendances:** 1.1, 1.3, 3.1

---

### **🟢 PRIORITÉ 4 : LISTE COURSES**

#### **4.1 - Ajouter bouton génération liste courses dans /plan.js** ⏱️ 3h
```javascript
// Modifier /pages/plan.js
// Recevoir context cristallisation (query params)
// Ajouter bouton "🛒 Générer liste courses"
// Modal affichage liste (5 sections : légumes, protéines, féculents, fruits, extras)
// Stats : QN moyen prévu, conformité cristallisation, budget estimé
// Export PDF/Email
```
**Modifications:**
- Détecter `source=cristallisation` dans query params
- Récupérer criteres_actifs, aliments_triggers, objectif_qn
- Bouton "🛒 Générer liste courses" (visible si source=cristallisation)
- Fonction `genererListeCourses()` (5 étapes)
- Modal `ModalListeCourses.js`
- Export PDF + Email

**Dépendances:** 1.1, 1.3, 2.2

---

### **🔵 PRIORITÉ 5 : INTELLIGENCE ARTIFICIELLE**

#### **5.1 - Implémenter 7 analyseurs de patterns** ⏱️ 6h
```javascript
// /lib/analyseurPatternsCristallisation.js
export function analyserExtras(repasReels) { 
  // Fréquence, moments critiques, types fréquents, contexte émotionnel
}
export function analyserFeculentsTiming(repasReels) { 
  // Distribution horaire, types problématiques, impact poids
}
export function analyserQualiteNutritionnelle(repasReels) { 
  // QN par semaine, repas faibles, catégories à améliorer
}
export function analyserQuantites(repasReels) { 
  // Taux conformité, catégories excès, moments risque
}
export function analyserVariete(repasReels) { 
  // Score diversité Shannon, monotonie, catégories manquantes
}
export function analyserComportementsTemporels(repasReels) { 
  // Régularité horaires, fenêtre alimentaire, jeûnes spontanés
}
export function analyserNotes(repasReels) { 
  // Émotions fréquentes, corrélations, triggers
}
```
**Dépendances:** 1.1, 1.3

---

#### **5.2 - Créer système génération défis IA** ⏱️ 5h
```javascript
// /lib/defisIntelligentsCristallisation.js
export async function genererDefisIntelligents(patterns, criteres) {
  // Analyse patterns avec 7 analyseurs
  // Génère défis personnalisés
  // Adapte durée selon niveau utilisateur
  // Détecte timing optimal (meilleur jour/moment)
  // Prédit probabilité succès
  // Inclut accompagnement (alternatives, stratégies, messages)
  // Stocke dans table defis avec source="ia_generation"
}
```
**Dépendances:** 1.1, 1.3, 5.1

---

## 📊 ESTIMATION TOTALE

| Priorité | Tâches | Durée estimée |
|----------|--------|---------------|
| 🔴 P1 - Fondations | 3 tâches | 6h |
| 🟡 P2 - Pages | 2 tâches | 9h |
| 🟠 P3 - Intégrations | 2 tâches | 7h |
| 🟢 P4 - Liste courses | 1 tâche | 3h |
| 🔵 P5 - IA | 2 tâches | 11h |
| **TOTAL** | **10 tâches** | **36h** |

---

## 🚀 ORDRE D'EXÉCUTION RECOMMANDÉ

### **🎯 SPRINT 1 : FONDATIONS (Jour 1-2)**
1. ✅ 1.1 - Créer tables Supabase
2. ✅ 1.2 - Créer référentiel critères
3. ✅ 1.3 - Créer API cristallisation

**Livrable:** Base de données + API fonctionnelle NO AUTH

---

### **🎯 SPRINT 2 : DASHBOARD (Jour 3-4)**
4. ✅ 2.1 - Créer page /cristallisation.js (Dashboard)
5. ✅ 2.2 - Créer page /cristallisation-quotidien.js

**Livrable:** 2 pages cristallisation navigables avec critères dynamiques

---

### **🎯 SPRINT 3 : SAISIE REPAS (Jour 5-6)**
6. ✅ 3.1 - Intégrer widget flottant saisie repas
7. ✅ 3.2 - Implémenter conseils NEXT meal

**Livrable:** Saisie repas enrichie + système conseils reconnaissance

---

### **🎯 SPRINT 4 : LISTE COURSES (Jour 7)**
8. ✅ 4.1 - Ajouter bouton génération liste courses /plan.js

**Livrable:** Planification → Liste courses avec stats prévision

---

### **🎯 SPRINT 5 : INTELLIGENCE (Jour 8-9)**
9. ✅ 5.1 - Implémenter 7 analyseurs patterns
10. ✅ 5.2 - Créer système génération défis IA

**Livrable:** Défis personnalisés basés sur patterns réels

---

## ✅ VALIDATION FINALE

### **Checklist avant déploiement:**
- [ ] Tables créées dans Supabase (RLS désactivé)
- [ ] Référentiel critères validé avec 6 types
- [ ] API cristallisation testée (NO AUTH)
- [ ] Page dashboard affiche bilan reprise + critères dynamiques
- [ ] Page quotidien calcule jour_courant automatiquement
- [ ] Widget flottant apparaît pendant saisie repas si cristallisation active
- [ ] Conseils générés APRÈS saisie (pour NEXT meal, pas pendant)
- [ ] 1 conseil MAX par jour vérifié
- [ ] Application conseil détectée → +10 points + badge
- [ ] Liste courses générée depuis /plan.js avec contexte cristallisation
- [ ] 7 analyseurs patterns fonctionnels
- [ ] Défis IA générés avec durée adaptée

---

## 📌 NOTES IMPORTANTES

**NO AUTH PATTERN:**
```javascript
const getLocalUserId = () => 'laurelle_test_user';
```
À utiliser PARTOUT dans cristallisationAPI.js

**Calcul jour_courant automatique:**
```javascript
const aujourdhui = new Date();
const dateDebut = new Date(parcours.date_debut);
const jourCourant = Math.floor((aujourdhui - dateDebut) / (1000 * 60 * 60 * 24)) + 1;
```

**Critères dynamiques JAMAIS hardcodés:**
```javascript
// ❌ MAUVAIS
const criteres = ["pas_extras", "qn_3+", "feculents_matin"];

// ✅ BON
const criteres = genererCriteresPersonnalises(bilan_reprise);
```

**Conseil 1 MAX par jour:**
```javascript
const conseilsAujourdhui = await supabase
  .from('conseils_cristallisation')
  .select('*')
  .eq('user_id', userId)
  .eq('date_generation', aujourdhui)
  .eq('type_repas', typeRepas);

if (conseilsAujourdhui.length > 0) {
  return null; // Déjà un conseil aujourd'hui
}
```

---

**🎯 OBJECTIF FINAL:** Système cristallisation complet, personnalisé, intelligent, intégré aux pages existantes, avec suivi précis des 45 jours.
