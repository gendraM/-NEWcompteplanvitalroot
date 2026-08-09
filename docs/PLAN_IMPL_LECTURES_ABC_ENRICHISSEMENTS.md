# 🟢 PLAN D'IMPLÉMENTATION — Lectures ABC + Enrichissements Bilan Hebdo

## Titre de la tâche
Implémenter les 3 lectures dynamiques (A, B, C) du bilan hebdomadaire + enrichissements critiques (streaks, fragilités, objectif personnalisé), en conformité stricte avec la fiche métier "maj bilan hebdo" et la méthodologie Copilot.

---

## Description précise de la modification attendue

### Objectif global
Améliorer le bilan hebdomadaire pour qu'il ne "punisse" pas une semaine majoritairement alignée à cause d'une seule journée déviante, et valoriser les points positifs de l'utilisateur.

### Modifications à implémenter

#### 🔵 Lectures de base (fiche "maj bilan hebdo")

**Lecture A — Répartition des jours vs objectif**
- Catégoriser chaque jour de la semaine (sous/proche/léger dépassement/débordement)
- Afficher synthèse : "Sur 7 jours : X jours sous ou proches, Y jours légèrement au-dessus, Z débordement"
- Verbatim dynamique selon profil semaine
- Garde-fou : Afficher "Lecture partielle" si ≥2 jours incomplets

**Lecture B — Jour(s) qui pèsent dans l'écart**
- Identifier le jour le plus lourd et sa part dans l'excédent total (%)
- Distinguer "concentré" (≥50%), "fort" (30-50%), "diffus" (<30%)
- Verbatim : "1 journée explique ~60% de l'excédent" OU "excédent réparti sur plusieurs jours"
- Message Plan Vital : "Ce n'est pas une semaine ratée, c'est un point à sécuriser"

**Lecture C — Évolution extras vs semaine précédente**
- Comparer kcal extras et nombre extras (N vs N-1)
- Déterminer tendance : Progrès net / Stable / Plus présent
- Verbatim : "Extras mieux maîtrisés" OU "Extras plus présents"
- Rendre visible la régulation même si l'écart global augmente

#### 🟡 Enrichissements critiques (besoins utilisateur)

**Enrichissement 1 — Valorisation streaks réussis**
- Détecter séries de jours consécutifs alignés avec l'objectif (≥3 jours)
- Afficher encouragement : "✅ 6 jours consécutifs alignés. Cette régularité est ta vraie force."
- Intégré dans Lecture A

**Enrichissement 2 — Analyse fragilités + typologie repas**
- Identifier jours de débordement et extraire repas problématiques (top 3 plus lourds)
- Détecter typologie : cumul repas+extras / extras nombreux / repas trop lourds
- Détecter moment fragile (soir, après-midi, nuit)
- Affichage rétractable : "🔍 Zones de vigilance"
- Verbatim : "Sur dimanche 25 janv : Pizza 1200 kcal + Extras soir 500 kcal + Burger 800 kcal"

**Enrichissement 3 — Objectif personnalisé semaine prochaine**
- Bloc en fin de modale : champ libre textarea
- Utilisateur note son objectif ("Plus de journée comme dimanche 25 janvier !")
- Sauvegarde localStorage + optionnel Supabase
- Réaffichage en début de semaine suivante (bandeau page suivi)

### Principes Plan Vital (OBLIGATOIRES)
- ❌ Jamais de jugement ("bien/mal")
- ❌ Jamais d'ordres ("tu devrais")
- ❌ Mots interdits : "alerte", "risque", "déséquilibre", "attention"
- ✅ Toujours parler en : trajectoire, direction, continuité, rythme, construction
- ✅ Phrase socle : "Une journée ne décide rien. Une semaine oriente. Deux semaines commencent à s'imprimer."

---

## Fichiers concernés

| Fichier | Rôle | Modifications attendues |
|---------|------|------------------------|
| `/lib/validationSemaine.js` | Logique calculs | +5 nouvelles fonctions (A, B, C, streaks, fragilités) |
| `/pages/suivi.js` | Génération bilan | Enrichir objet `bilanData` dans `handleValiderSemaine` |
| `/components/BilanHebdoModal.js` | Affichage modal | +5 nouveaux blocs composants |
| `/docs/maj bilan hebdo` | Référence métier | Lecture seule (conformité stricte) |
| `/docs/ANALYSE_BESOINS_vs_MAJ_BILAN_HEBDO.md` | Analyse besoins | Lecture seule (guide enrichissements) |

---

## Etape 1 — Audit des risques préalable

### 1.1 Risques UX

**Risque de surcharge visuelle**
- Symptôme : Trop de blocs d'analyse affichés d'un coup
- Impact : Utilisateur submergé, ne lit rien
- Mitigation : 1 phrase max par lecture, blocs visuellement distincts, espacement 1.5rem

**Risque de confusion temporelle**
- Symptôme : Utilisateur ne comprend pas si c'est 7j, 14j ou comparaison N/N-1
- Impact : Perte de confiance dans l'app
- Mitigation : Labels explicites ("Cette semaine", "Vs semaine dernière", "Sur 14 jours")

**Risque de démotivation**
- Symptôme : Message culpabilisant malgré verbatims Plan Vital
- Impact : Abandon de l'app
- Mitigation : Double validation verbatims, tests utilisateurs réels, toujours valoriser points positifs

**Risque de non-lisibilité mobile**
- Symptôme : Blocs trop larges, texte trop petit
- Impact : UX dégradée sur mobile (principal device utilisateur)
- Mitigation : Tests responsive, max-width, font-size adaptatif

### 1.2 Risques techniques

**Risque de calcul incorrect**
- Symptôme : Catégorisation jours fausse, % jour lourd erroné
- Impact : Utilisateur perd confiance, données trompeuses
- Mitigation : Tests unitaires exhaustifs, validation calculs manuellement sur vraies données

**Risque de données manquantes**
- Symptôme : Semaine N-1 absente, jours incomplets non détectés
- Impact : Crash app, affichage NaN ou undefined
- Mitigation : Garde-fous systématiques, affichage "Lecture partielle" ou masquage bloc

**Risque de régression Section 1**
- Symptôme : Section 1 (validée 18/01/2026) modifiée involontairement
- Impact : Perte de conformité métier validée
- Mitigation : Aucune modification de Section 1, tests de non-régression

**Risque de performance**
- Symptôme : Calculs lourds (boucles sur 7j, agrégation repas) ralentissent affichage
- Impact : Modal lent à s'ouvrir (>1s)
- Mitigation : Calculs optimisés, mise en cache si possible, lazy loading blocs

**Risque de synchronisation état**
- Symptôme : Hooks mal déclarés, variables d'état utilisées avant initialisation
- Impact : Erreurs React, affichage incorrect
- Mitigation : Checklist hooks stricte (étape 2), relecture manuelle obligatoire

### 1.3 Risques de conformité métier

**Risque de verbatim non conforme**
- Symptôme : Phrase ajoutée qui ne respecte pas ton Plan Vital
- Impact : Rupture cohérence philosophie app
- Mitigation : Validation stricte verbatims ligne par ligne avec fiche métier

**Risque de seuils incorrects**
- Symptôme : Seuils catégorisation (±100, ±300 kcal) non respectés
- Impact : Diagnostic faux (jour "proche" alors que débordement)
- Mitigation : Tests avec données extrêmes, validation seuils avec métier

**Risque de message culpabilisant**
- Symptôme : Utilisation mots interdits ("tu devrais", "alerte", "risque")
- Impact : Utilisateur se sent jugé, abandon
- Mitigation : Relecture systématique, liste mots interdits, tests utilisateurs

### 1.4 Risques d'accessibilité

**Risque de navigation clavier impossible**
- Symptôme : Focus non visible, blocs rétractables non accessibles au clavier
- Impact : Utilisateurs handicapés exclus
- Mitigation : Tests navigation Tab complète, attributs ARIA obligatoires

**Risque de contraste insuffisant**
- Symptôme : Couleurs ne respectent pas WCAG AA (ratio <4.5:1)
- Impact : Lisibilité réduite, exclusion malvoyants
- Mitigation : Vérification Contrast Checker, ajustement couleurs si besoin

**Risque de screen reader incompatible**
- Symptôme : Structure sémantique incorrecte, labels manquants
- Impact : Utilisateurs aveugles ne comprennent pas
- Mitigation : Tests NVDA/VoiceOver, aria-label sur tous les blocs

### 1.5 Risques de rollback

**Risque de perte de code en cas d'anomalie**
- Symptôme : Bug bloquant détecté, besoin de revenir en arrière
- Impact : Temps perdu si rollback mal géré
- Mitigation : Commits atomiques par phase, fichier rollback actualisé, branches Git

**Consultation fichier anomalies rollback**
- Avant toute modification : Lire historique des rollbacks passés
- Identifier patterns d'erreurs récurrents
- Appliquer correctifs préventifs

---

## Etape 2 — Sous-checklist à valider systématiquement

### 2.1 Imports et hooks (fichier BilanHebdoModal.js)

- [ ] `useState` importé en haut du fichier (ligne ~1)
- [ ] `useEffect` importé si nécessaire
- [ ] `React` importé
- [ ] Toutes les variables d'état déclarées AVANT premier usage
- [ ] Hooks jamais dans conditions, boucles, ou fonctions imbriquées

### 2.2 Fonctions de calcul (fichier lib/validationSemaine.js)

- [ ] Fonction `calculerRepartitionJours` exportée
- [ ] Fonction `calculerImpactJours` exportée
- [ ] Fonction `calculerEvolutionExtras` exportée
- [ ] Fonction `detecterStreaksReussis` exportée
- [ ] Fonction `analyserFragilites` exportée
- [ ] Toutes les fonctions testées unitairement avant intégration

### 2.3 Intégration dans pages/suivi.js

- [ ] Imports des 5 nouvelles fonctions depuis `lib/validationSemaine`
- [ ] Appels dans fonction `handleValiderSemaine` (après ligne 1100)
- [ ] Objet `bilanData` enrichi avec nouvelles clés (voir structure détaillée étape 5.2)
- [ ] Pas d'effet de bord sur calculs existants (apportsTotaux, kcalExtras, etc.)

### 2.4 Props et typage

- [ ] Props `bilan` bien typées (objet avec toutes les clés nécessaires)
- [ ] Destructuration props claire et lisible
- [ ] Valeurs par défaut pour toutes les props optionnelles
- [ ] PropTypes documentés (ou TypeScript si migration future)

### 2.5 Accessibilité

- [ ] Bloc rétractable : `aria-expanded`, `aria-controls`
- [ ] Boutons : `aria-label` descriptifs
- [ ] Sections : `role="region"` si pertinent
- [ ] Navigation clavier : Tab, Enter, Escape fonctionnels

### 2.6 Verbatims et conformité métier

- [ ] Aucun mot interdit : "tu devrais", "alerte", "risque", "déséquilibre", "attention"
- [ ] Tous les verbatims proviennent de la fiche métier "maj bilan hebdo"
- [ ] Phrase socle Plan Vital présente au moins 1 fois
- [ ] Ton respecté : trajectoire, direction, continuité

---

## Etape 3 — Checklist stricte sécurité & qualité

### 3.1 Lecture complète du code concerné

**Avant toute modification :**
- [ ] Lire `BilanHebdoModal.js` lignes 1-713 (code actuel complet)
- [ ] Lire `validationSemaine.js` lignes 1-582 (helpers existants)
- [ ] Lire `pages/suivi.js` fonction `handleValiderSemaine` lignes 1016-1300
- [ ] Identifier toutes les variables globales et hooks existants
- [ ] Repérer les dépendances entre fonctions (qui appelle quoi)

### 3.2 Initialisation systématique

**Règle d'or : Toute variable doit être initialisée AVANT usage**
- [ ] Variables d'état : `useState(valeurParDefaut)` toujours avec valeur défaut
- [ ] Props : destructuration avec valeurs par défaut (`const { bilan = {} } = props`)
- [ ] Calculs : vérifier que toutes les données sources existent avant calcul
- [ ] Affichage : `bilan?.cle` ou `bilan && bilan.cle` systématiquement

### 3.3 Hooks déclarés en haut du composant

**Ordre strict dans BilanHebdoModal.js :**
```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';

// 2. Composant principal
export default function BilanHebdoModal({ open, onClose, bilan, selectedDate }) {
  // 3. Hooks d'état (tous en haut, avant toute logique)
  const [showSavoirPlus, setShowSavoirPlus] = useState(false);
  const [showStreaksDetail, setShowStreaksDetail] = useState(false);
  const [objectifPerso, setObjectifPerso] = useState('');
  
  // 4. useEffect si nécessaire
  useEffect(() => {
    // ...
  }, [dependencies]);
  
  // 5. Fonctions helpers et handlers
  function BlocRepartitionJours() { /* ... */ }
  function BlocImpactJours() { /* ... */ }
  
  // 6. Rendu JSX
  return (
    // ...
  );
}
```

**Interdictions absolues :**
- ❌ Hooks dans des `if`, `for`, `map`, fonctions imbriquées
- ❌ Hooks conditionnels (sauf si toujours dans le même ordre)
- ❌ Variables utilisées avant déclaration

### 3.4 Séparation stricte des étapes

**Organisation du code dans chaque fichier :**

1. **Initialisation** (imports, constantes, hooks)
2. **Logique calculée** (fonctions de calcul, helpers)
3. **Handlers** (fonctions événements, interactions utilisateur)
4. **Rendu** (JSX, affichage)

**Exemple dans lib/validationSemaine.js :**
```javascript
// 1. Imports et helpers date existants (déjà présents)

// 2. Nouvelles fonctions de calcul (notre ajout)
export function calculerRepartitionJours(repasReels, weekStart, objectifHebdo) {
  // Logique pure, pas d'effet de bord
  return { joursCategories, joursIncomplets, detailsJours };
}

export function calculerImpactJours(detailsJours) {
  // Logique pure
  return { surplusTotal, jourPlusLourd, repartition };
}

// Pas de code dans le global scope
```

### 3.5 Contrôle d'erreur systématique

**À chaque étape de calcul :**
- [ ] Vérifier que les données sources existent (`if (!repasReels || !Array.isArray(repasReels))`)
- [ ] Gérer les cas limites (0 repas, semaine incomplète, N-1 absente)
- [ ] Retourner des valeurs par défaut sûres (objet vide, null, 0) jamais undefined
- [ ] Logger les erreurs en console pour debug (`console.error('[calculerRepartitionJours] Erreur:', error)`)

**Gestion N-1 absente (exemple Lecture C) :**
```javascript
// Dans BilanHebdoModal.js
function BlocEvolutionExtras() {
  const { extrasKcalN1, extrasNbN1 } = bilan || {};
  
  // Garde-fou : Si données N-1 absentes, ne pas afficher le bloc
  if (extrasKcalN1 === undefined || extrasNbN1 === undefined) {
    return null; // Ou message pédagogique
  }
  
  // Suite de la logique...
}
```

### 3.6 Tests sur tous les cas d'usage

**Scénarios à tester obligatoirement :**

**Lecture A (Répartition jours) :**
- [ ] 7 jours complets, tous conformes
- [ ] 7 jours complets, 1 jour débordement
- [ ] 7 jours complets, 3+ jours débordement
- [ ] 2+ jours incomplets (affichage "Lecture partielle")
- [ ] 0 repas saisis (aucune lecture)

**Lecture B (Impact jours) :**
- [ ] 1 jour concentre 60%+ du surplus
- [ ] Surplus diffus (<30% sur un jour)
- [ ] Aucun surplus (tous jours sous objectif) → Bloc masqué ou message positif

**Lecture C (Évolution extras) :**
- [ ] Extras en progrès (N < N-1)
- [ ] Extras stables (N ≈ N-1)
- [ ] Extras plus présents (N > N-1)
- [ ] Semaine N-1 absente → Bloc masqué

**Enrichissement Streaks :**
- [ ] Streak de 6 jours consécutifs
- [ ] Streak de 3 jours
- [ ] Aucun streak (alternance conforme/non-conforme)

**Enrichissement Fragilités :**
- [ ] 1 jour débordement avec détail repas
- [ ] Plusieurs jours débordement
- [ ] Aucun jour débordement → Bloc masqué

**Enrichissement Objectif perso :**
- [ ] Saisie + sauvegarde localStorage
- [ ] Réaffichage semaine suivante
- [ ] Édition objectif existant

### 3.7 Préservation stricte fonctionnalités existantes

**Section 1 (Signal énergétique) — INTOUCHABLE**
- [ ] Tester que tous les blocs Section 1 s'affichent correctement après ajout ABC
- [ ] Vérifier que "En savoir plus" fonctionne toujours
- [ ] Vérifier que "Lecture de la semaine" reste identique
- [ ] Aucune modification même mineure dans Section 1

**Section 2 (Tendance trajectoire) — COHABITATION**
- [ ] Vérifier que blocs ABC ne perturbent pas Section 2
- [ ] Ordre d'affichage logique (Section 1 → ABC → Section 2)
- [ ] Pas de doublon de message

**Section 7 (Comment j'ai mangé) — PRÉSERVER**
- [ ] Bloc reste fonctionnel après ajout ABC et enrichissements
- [ ] Données dynamiques Section 7 (TODO PLAN_IMPL_SECTION2) indépendantes de ABC

### 3.8 Documentation claire de chaque étape

**Commentaires obligatoires dans le code :**
```javascript
// ═══════════════════════════════════════════════════════════
// LECTURE A — RÉPARTITION JOURS VS OBJECTIF
// Ajouté le : 01/02/2026
// Conforme à : /docs/maj bilan hebdo Section 3
// ═══════════════════════════════════════════════════════════

export function calculerRepartitionJours(repasReels, weekStart, objectifHebdo) {
  /**
   * Catégorise chaque jour de la semaine selon son écart avec l'objectif journalier.
   * 
   * @param {Array} repasReels - Tous les repas de l'utilisateur
   * @param {string} weekStart - Date début semaine (format YYYY-MM-DD)
   * @param {number} objectifHebdo - Objectif calorique hebdomadaire (ex: 12110)
   * 
   * @returns {Object} {
   *   joursCategories: { sous, proches, legerDepassement, debordement },
   *   joursIncomplets: number,
   *   detailsJours: [{ date, kcal_total, ecart, categorie, incomplet }]
   * }
   */
  
  // 1. Initialisation
  const objectifJour = Math.round(objectifHebdo / 7);
  // ...suite
}
```

**Changelog à maintenir :**
- Créer `/docs/CHANGELOG_LECTURES_ABC.md`
- Noter chaque modification avec date, fichier, fonction

### 3.9 Relecture manuelle obligatoire

**Avant chaque commit :**
- [ ] Relire ligne par ligne les fonctions ajoutées
- [ ] Vérifier imports en haut des fichiers
- [ ] Vérifier ordre des hooks
- [ ] Vérifier destructuration props
- [ ] Vérifier garde-fous données manquantes
- [ ] Vérifier verbatims (conformité métier)
- [ ] Vérifier pas de régression Section 1

### 3.10 Validation utilisateur OBLIGATOIRE

**À chaque fin de phase :**
- [ ] Générer rapport Markdown (étape 8)
- [ ] Présenter à l'utilisateur
- [ ] Attendre validation explicite AVANT de passer à la phase suivante
- [ ] Si refus : rollback (étape 7) et ajustement

---

## Etape 4 — Contrôles conformité à réaliser

### 4.1 Lecture fichier anomalies rollback

**Avant toute implémentation :**
- [ ] Lire `/docs/HISTORIQUE_ROLLBACK.md` (ou équivalent si existe)
- [ ] Identifier les erreurs passées sur le bilan hebdo
- [ ] Lister les points de vigilance récurrents
- [ ] Appliquer correctifs préventifs

**Patterns d'erreurs courantes à surveiller :**
- Hooks mal placés (cause de régression fréquente)
- Calcul sur données nulles (crash app)
- Verbatims non conformes (détecté en revue utilisateur)
- Affichage conditionnel oublié (blocs vides affichés)

### 4.2 Checklist de contrôle avant codage

**Créer `/docs/CHECKLIST_CONFORMITE_ABC.md` avec :**

#### Données disponibles
- [ ] Table `repas_reels` contient bien `date`, `kcal`, `est_extra`, `type`
- [ ] Table `semaines_validees` contient bien semaines N-1 pour comparaison
- [ ] Données repas semaine courante accessibles via `repasSemaine` (state suivi.js)

#### Seuils métier validés
- [ ] SOUS : écart ≤ -100 kcal
- [ ] PROCHE : -100 < écart < +100 kcal
- [ ] LEGER_DEPASSEMENT : +100 ≤ écart < +300 kcal
- [ ] DEBORDEMENT : écart ≥ +300 kcal
- [ ] Jour incomplet : <2 repas saisis sur 4 (petit-dej, déj, collation, dîner)

#### Verbatims préparés
- [ ] Lecture A : 3 verbatims selon profil (majoritaire tenue, débordements répétés, régulière)
- [ ] Lecture B : 2 verbatims (concentré, diffus)
- [ ] Lecture C : 3 verbatims (progrès, stable, plus présent)
- [ ] Enrichissement Streaks : 2 verbatims (long streak, court streak)
- [ ] Enrichissement Fragilités : 3 verbatims (cumul, extras nombreux, repas lourds)

#### Structure objet bilanData
```javascript
// Structure complète attendue dans pages/suivi.js
const bilanData = {
  // Existant (Section 1)
  apportsTotaux: number,
  objectifHebdo: number,
  kcalExtras: number,
  extras: number,
  budgetExtras: number,
  
  // Nouveau : Lecture A
  objectifJournalier: number,
  joursCategories: {
    sous: number,
    proches: number,
    legerDepassement: number,
    debordement: number
  },
  joursIncomplets: number,
  detailsJours: [
    { date, kcal_total, ecart, categorie, incomplet }
  ],
  
  // Nouveau : Enrichissement Streaks (intégré Lecture A)
  longestStreak: number,
  streaks: [3, 2, 4], // Liste des streaks de la semaine
  
  // Nouveau : Lecture B
  surplusTotal: number,
  jourPlusLourd: {
    date: string,
    ecart: number,
    part: number // 0-1
  },
  repartition: 'concentre' | 'fort' | 'diffus',
  
  // Nouveau : Lecture C
  extrasKcalN: number,
  extrasNbN: number,
  extrasKcalN1: number,
  extrasNbN1: number,
  deltaKcal: number,
  deltaNb: number,
  tendanceExtras: 'progres' | 'stable' | 'plus_present',
  
  // Nouveau : Enrichissement Fragilités
  fragilites: {
    joursDebordement: [
      {
        date: string,
        kcal_total: number,
        ecart: number,
        repasProblematiques: [
          { type, kcal, aliment, est_extra }
        ]
      }
    ],
    typologieProblematique: 'cumul_repas_extras' | 'extras_nombreux' | 'repas_trop_lourds',
    momentFragile: 'soir' | 'dejeuner' | 'apres-midi' | 'nuit'
  }
};
```

### 4.3 Audit des risques validé

- [ ] Tous les risques listés à l'étape 1 ont été lus et compris
- [ ] Plan de mitigation défini pour chaque risque critique
- [ ] Aucun risque bloquant identifié (si bloquant → stop et escalade utilisateur)

### 4.4 Conformité accessibilité

**Checklist WCAG 2.1 AA :**
- [ ] Contraste couleurs ≥ 4.5:1 pour texte normal
- [ ] Contraste couleurs ≥ 3:1 pour texte large (≥18pt)
- [ ] Navigation clavier complète (Tab, Enter, Escape)
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Pas de piège clavier (focus trap bien géré dans modale)
- [ ] Screen reader compatible (attributs ARIA)

**Outils de test à utiliser :**
- Contrast Checker : https://webaim.org/resources/contrastchecker/
- axe DevTools : Extension navigateur pour audit automatique
- NVDA / JAWS : Screen readers pour tests manuels

### 4.5 Proposition de rollback (préparation)

**Créer procédure rollback AVANT implémentation :**

#### Si anomalie détectée Phase 1 (Calculs)
1. Supprimer fichier `/lib/validationSemaine.js.backup` (backup avant modif)
2. Restaurer version précédente
3. Ajouter entrée dans `/docs/HISTORIQUE_ROLLBACK.md`
4. Analyser cause de l'anomalie
5. Corriger et re-tester unitairement avant nouvelle tentative

#### Si anomalie détectée Phase 2 (Intégration)
1. Rollback Git : `git reset --hard <commit-avant-phase2>`
2. Vérifier que Phase 1 fonctionne toujours isolément
3. Débugger intégration pages/suivi.js
4. Ajouter entrée rollback

#### Si anomalie détectée Phase 3 (Affichage)
1. Masquer blocs problématiques via `display: none` temporaire
2. Débugger en isolation (storybook ou page test dédiée)
3. Re-intégrer une fois corrigé
4. Ajouter entrée rollback

**Format entrée rollback :**
```markdown
---
Date : 01/02/2026 14:35
Phase : 2 - Intégration pages/suivi.js
Anomalie : Objet bilanData malformé, clé 'joursCategories' undefined
Impact : Crash modale bilan, utilisateur ne peut pas valider semaine
Cause : Oubli d'appel fonction calculerRepartitionJours dans handleValiderSemaine
Action : Rollback git commit abc123, ajout appel fonction, re-test
Statut : Résolu
---
```

---

## Etape 5 — Mise à jour de l'avancement

### 5.1 Tableau de suivi

| Étape | Statut | Date | Responsable | Commentaire |
|-------|--------|------|-------------|-------------|
| Création plan complet | ✅ Terminé | 01/02/2026 | Copilot | Document 30+ pages, validation utilisateur requise |
| Validation plan utilisateur | ⏳ En attente | - | Utilisateur | BLOQUANT : Pas de code avant validation |
| Phase 1 - Calculs | ⬜ Non commencé | - | Copilot | lib/validationSemaine.js - 5 fonctions |
| Phase 1 - Tests unitaires | ⬜ Non commencé | - | Copilot | Tests Jest ou manuels |
| Phase 1 - Rapport | ⬜ Non commencé | - | Copilot | Markdown avant/après |
| Phase 1 - Validation utilisateur | ⬜ Non commencé | - | Utilisateur | BLOQUANT avant Phase 2 |
| Phase 2 - Intégration | ⬜ Non commencé | - | Copilot | pages/suivi.js - enrichir bilanData |
| Phase 2 - Tests intégration | ⬜ Non commencé | - | Copilot | Vérifier génération bilan |
| Phase 2 - Rapport | ⬜ Non commencé | - | Copilot | Markdown avant/après |
| Phase 2 - Validation utilisateur | ⬜ Non commencé | - | Utilisateur | BLOQUANT avant Phase 3 |
| Phase 3 - Affichage blocs | ⬜ Non commencé | - | Copilot | BilanHebdoModal.js - 5 blocs |
| Phase 3 - Tests UI | ⬜ Non commencé | - | Copilot | Vérifier rendu tous cas |
| Phase 3 - Rapport | ⬜ Non commencé | - | Copilot | Markdown avant/après |
| Phase 3 - Validation utilisateur | ⬜ Non commencé | - | Utilisateur | BLOQUANT avant Phase 4 |
| Phase 4 - Tests accessibilité | ⬜ Non commencé | - | Copilot | WCAG AA, screen reader |
| Phase 4 - Tests responsive | ⬜ Non commencé | - | Copilot | Mobile, tablette, desktop |
| Phase 4 - Tests cas limites | ⬜ Non commencé | - | Copilot | Données manquantes, etc. |
| Phase 4 - Validation utilisateur FINALE | ⬜ Non commencé | - | Utilisateur | Go/No-go production |

### 5.2 Avancement détaillé par phase

#### Phase 1 — Calculs (lib/validationSemaine.js)

**TODO 1.1 : Fonction `calculerRepartitionJours`**
- Statut : ⬜ Non commencé
- Fichier : `/lib/validationSemaine.js` (après ligne 580)
- Durée estimée : 1h30
- Dépendances : Helpers date existants (getMonday, addDays, formatDate)
- Tests requis : 5 scénarios (voir étape 3.6)

**TODO 1.2 : Fonction `calculerImpactJours`**
- Statut : ⬜ Non commencé
- Fichier : `/lib/validationSemaine.js` (après calculerRepartitionJours)
- Durée estimée : 1h
- Dépendances : detailsJours (output de calculerRepartitionJours)
- Tests requis : 3 scénarios

**TODO 1.3 : Fonction `calculerEvolutionExtras`**
- Statut : ⬜ Non commencé
- Fichier : `/lib/validationSemaine.js` (après calculerImpactJours)
- Durée estimée : 45min
- Dépendances : Données N-1 depuis Supabase (fetch dans pages/suivi.js)
- Tests requis : 4 scénarios

**TODO 1.4 : Fonction `detecterStreaksReussis`**
- Statut : ⬜ Non commencé
- Fichier : `/lib/validationSemaine.js` (intégré dans calculerRepartitionJours)
- Durée estimée : 45min
- Dépendances : detailsJours
- Tests requis : 3 scénarios

**TODO 1.5 : Fonction `analyserFragilites`**
- Statut : ⬜ Non commencé
- Fichier : `/lib/validationSemaine.js` (après detecterStreaksReussis)
- Durée estimée : 2h
- Dépendances : detailsJours, repasReels complets
- Tests requis : 4 scénarios

**Avancement Phase 1 : 0% (0h sur 6h estimées)**

#### Phase 2 — Intégration (pages/suivi.js)

**TODO 2.1 : Imports fonctions**
- Statut : ⬜ Non commencé
- Fichier : `/pages/suivi.js` (ligne ~30, avec autres imports)
- Durée estimée : 5min
- Code :
```javascript
import {
  calculerRepartitionJours,
  calculerImpactJours,
  calculerEvolutionExtras,
  analyserFragilites
} from '../lib/validationSemaine';
```

**TODO 2.2 : Appels fonctions dans handleValiderSemaine**
- Statut : ⬜ Non commencé
- Fichier : `/pages/suivi.js` (fonction handleValiderSemaine, après ligne 1100)
- Durée estimée : 1h
- Emplacement : Après calcul apportsTotaux, kcalExtras, extras existants
- Ordre des appels :
  1. calculerRepartitionJours (inclut streaks)
  2. calculerImpactJours
  3. calculerEvolutionExtras (fetch N-1 avant)
  4. analyserFragilites

**TODO 2.3 : Enrichir objet bilanData**
- Statut : ⬜ Non commencé
- Fichier : `/pages/suivi.js` (objet bilanData dans handleValiderSemaine)
- Durée estimée : 30min
- Vérifier : Toutes les clés présentes (voir structure étape 4.2)

**TODO 2.4 : Fetch données N-1**
- Statut : ⬜ Non commencé
- Fichier : `/pages/suivi.js` (dans handleValiderSemaine, avant calculerEvolutionExtras)
- Durée estimée : 30min
- Code :
```javascript
// Fetch semaine N-1 pour comparaison extras
const dateN1 = new Date(selectedWeekStart);
dateN1.setDate(dateN1.getDate() - 7);
const weekStartN1 = formatDate(dateN1, 'yyyy-MM-dd');

const { data: semaineN1 } = await supabase
  .from('semaines_validees')
  .select('kcal_extras, extras')
  .eq('weekStart', weekStartN1)
  .single();

const extrasKcalN1 = semaineN1?.kcal_extras || null;
const extrasNbN1 = semaineN1?.extras || null;
```

**TODO 2.5 : Tests intégration**
- Statut : ⬜ Non commencé
- Durée estimée : 1h
- Vérifier : bilanData bien formé, pas de crash, console propre

**Avancement Phase 2 : 0% (0h sur 3h estimées)**

#### Phase 3 — Affichage (BilanHebdoModal.js)

**TODO 3.1 : Bloc `BlocRepartitionJours` (Lecture A + Streaks)**
- Statut : ⬜ Non commencé
- Fichier : `/components/BilanHebdoModal.js` (après BlocLectureSemaine, ligne ~176)
- Durée estimée : 2h
- Éléments :
  - Phrase synthèse répartition
  - Verbatim dynamique selon profil
  - Encadré valorisation streaks (si longestStreak ≥ 3)
  - Garde-fou "Lecture partielle" (si joursIncomplets ≥ 2)

**TODO 3.2 : Bloc `BlocImpactJours` (Lecture B)**
- Statut : ⬜ Non commencé
- Fichier : `/components/BilanHebdoModal.js` (après BlocRepartitionJours, ligne ~220)
- Durée estimée : 1h30
- Éléments :
  - Phrase impact (% jour lourd)
  - Verbatim "concentré" ou "diffus"
  - Garde-fou : Masquer si surplusTotal === 0

**TODO 3.3 : Bloc `BlocEvolutionExtras` (Lecture C)**
- Statut : ⬜ Non commencé
- Fichier : `/components/BilanHebdoModal.js` (après BlocImpactJours, ligne ~260)
- Durée estimée : 1h
- Éléments :
  - Verbatim selon tendanceExtras
  - Couleur dynamique (vert/orange)
  - Garde-fou : Masquer si N-1 absente

**TODO 3.4 : Bloc `BlocAnalyseFragilites` (Section D)**
- Statut : ⬜ Non commencé
- Fichier : `/components/BilanHebdoModal.js` (après BlocEvolutionExtras, ligne ~300)
- Durée estimée : 2h30
- Éléments :
  - Titre "🔍 Zones de vigilance"
  - Verbatim typologie problématique
  - Détails jours débordement (rétractable)
  - Garde-fou : Masquer si aucun débordement

**TODO 3.5 : Bloc `BlocObjectifSemaineProchaine` (fin modale)**
- Statut : ⬜ Non commencé
- Fichier : `/components/BilanHebdoModal.js` (après Section 7, ligne ~713)
- Durée estimée : 1h30
- Éléments :
  - Textarea champ libre
  - Bouton "Enregistrer mon objectif"
  - Sauvegarde localStorage
  - Hook useEffect pour charger objectif existant

**TODO 3.6 : Intégrer dans rendu principal**
- Statut : ⬜ Non commencé
- Fichier : `/components/BilanHebdoModal.js` (fonction return, ligne ~400)
- Durée estimée : 30min
- Ordre d'affichage :
  1. Section 1 (existant)
  2. BlocRepartitionJours
  3. BlocImpactJours
  4. BlocEvolutionExtras
  5. BlocAnalyseFragilites
  6. Section 2 (existant)
  7. Section 7 (existant)
  8. BlocObjectifSemaineProchaine

**TODO 3.7 : Affichage objectif en page suivi**
- Statut : ⬜ Non commencé
- Fichier : `/pages/suivi.js` (en haut de page, ligne ~300)
- Durée estimée : 45min
- Bandeau début de semaine (lundi-mardi) si objectif existe

**TODO 3.8 : Tests UI**
- Statut : ⬜ Non commencé
- Durée estimée : 1h
- Vérifier : Tous les blocs s'affichent, pas de doublon, espacement OK

**Avancement Phase 3 : 0% (0h sur 10h45 estimées)**

#### Phase 4 — Tests & Validation

**TODO 4.1 : Tests accessibilité**
- Statut : ⬜ Non commencé
- Durée estimée : 1h30
- Checklist : Navigation clavier, ARIA, contraste, screen reader

**TODO 4.2 : Tests responsive**
- Statut : ⬜ Non commencé
- Durée estimée : 1h
- Devices : Mobile (375px), Tablette (768px), Desktop (1440px)

**TODO 4.3 : Tests cas limites**
- Statut : ⬜ Non commencé
- Durée estimée : 1h30
- Scénarios : Voir étape 3.6 (tous les cas A, B, C, enrichissements)

**TODO 4.4 : Tests performance**
- Statut : ⬜ Non commencé
- Durée estimée : 30min
- Vérifier : Temps ouverture modale <1s, pas de lag

**TODO 4.5 : Validation utilisateur finale**
- Statut : ⬜ Non commencé
- Durée estimée : Variable
- Go/No-go pour mise en production

**Avancement Phase 4 : 0% (0h sur 4h30 estimées)**

### 5.3 Avancement global

**Pourcentage réel : 5%** (Plan créé, validation utilisateur en attente)

**Temps écoulé : 1h** (Création plan)  
**Temps restant estimé : 24h15**  
**Temps total estimé : 25h15**

### 5.4 Historique des mises à jour

| Date | Heure | Événement | Avancement |
|------|-------|-----------|------------|
| 01/02/2026 | 15:00 | Création plan complet | 5% |
| - | - | (à compléter au fil de l'eau) | - |

---

## Etape 6 — Points de vigilance

### 6.1 Données obligatoires pour chaque jour

**Vérifications préalables dans pages/suivi.js :**

```javascript
// Dans handleValiderSemaine, avant appel calculerRepartitionJours

// Vérifier que repasReels contient bien les champs requis
const repasSemaineValides = repasSemaine.filter(r => {
  // Vérifier présence des champs essentiels
  if (!r.date || !r.kcal || r.type === undefined) {
    console.warn('[Bilan] Repas invalide détecté:', r);
    return false;
  }
  return true;
});

// Vérifier que la semaine a au moins quelques données
if (repasSemaineValides.length < 7) { // Moins de 7 repas sur toute la semaine
  console.warn('[Bilan] Semaine très incomplète, certaines lectures seront masquées');
}
```

**Champs requis par repas :**
- `date` : Date du repas (format YYYY-MM-DD)
- `kcal` : Calories du repas (number)
- `type` : Type de repas (Petit-déjeuner, Déjeuner, Collation, Dîner)
- `est_extra` : Booléen (pour calcul extras)

**Champs optionnels mais recommandés :**
- `aliment` : Nom du plat (pour analyse fragilités)
- `satiete` : Note 1-5 (pour Section 7)
- `humeur_associee` : String (pour Section 7)

### 6.2 Garde-fous "données incomplètes"

**Règle métier stricte : Si ≥2 jours incomplets, afficher "Lecture partielle"**

**Définition jour incomplet :**
- <2 repas saisis sur les 4 moments (petit-déj, déj, collation, dîner)
- OU kcal_total_jour < 800 (seuil suspicieusement bas)
- OU date absente dans repasReels pour ce jour de la semaine

**Implémentation dans calculerRepartitionJours :**
```javascript
// Pour chaque jour de la semaine
const repasDuJour = repasReels.filter(r => r.date === dateJour);
const jour_incomplet = repasDuJour.length < 2 || 
                       repasDuJour.reduce((sum, r) => sum + (r.kcal || 0), 0) < 800;
```

**Affichage dans BilanHebdoModal.js :**
```javascript
function MessageLecturePartielle() {
  return (
    <div style={{
      background: '#fffbeb',
      border: '2px solid #fbbf24',
      borderRadius: 10,
      padding: '1rem 1.2rem',
      margin: '1rem 0',
      color: '#92400e'
    }}>
      <b>📋 Lecture partielle</b>
      <p style={{marginTop: '0.5rem', fontSize: '0.95rem'}}>
        Certains jours ne sont pas suffisamment renseignés.
        La trajectoire se lit mieux quand la semaine est complète.
      </p>
    </div>
  );
}

function BlocRepartitionJours() {
  const { joursIncomplets } = bilan || {};
  
  if (joursIncomplets >= 2) {
    return <MessageLecturePartielle />;
  }
  
  // Suite normale...
}
```

### 6.3 Non-régression Section 1

**Tests de non-régression OBLIGATOIRES après chaque phase :**

1. **Ouvrir modale bilan sur une semaine validée**
2. **Vérifier visuellement :**
   - Bloc "En savoir plus" fonctionne (clic ouvre/ferme)
   - Données affichées (apports, extras, budget) identiques à avant
   - Bloc "Lecture de la semaine" affiche verbatims corrects
   - Aucun message dupliqué
3. **Vérifier console :**
   - Aucune erreur React
   - Aucun warning sur props manquantes
4. **Si anomalie détectée :**
   - STOP immédiat
   - Rollback de la phase en cours
   - Analyse cause racine
   - Correction avant de reprendre

### 6.4 Gestion semaine N-1 absente

**Cas possibles :**
- Première semaine validée de l'utilisateur (aucune N-1)
- Semaine N-1 non validée (sautée)
- Erreur fetch Supabase

**Stratégie d'affichage :**

**Lecture C (Évolution extras) :**
```javascript
function BlocEvolutionExtras() {
  const { extrasKcalN1, extrasNbN1, tendanceExtras } = bilan || {};
  
  // Si N-1 absente, ne pas afficher le bloc
  if (extrasKcalN1 === undefined || extrasKcalN1 === null) {
    return null; // Ou message pédagogique optionnel
  }
  
  // Suite normale...
}
```

**Message pédagogique optionnel (si souhaité) :**
```javascript
if (extrasKcalN1 === undefined || extrasKcalN1 === null) {
  return (
    <div style={{
      background: '#f3f4f6',
      borderRadius: 10,
      padding: '1rem',
      color: '#6b7280',
      fontSize: '0.95rem',
      fontStyle: 'italic'
    }}>
      📊 Comparaison avec la semaine précédente non disponible.
      (Première semaine validée ou semaine précédente non validée)
    </div>
  );
}
```

### 6.5 Gestion aucun surplus (Lecture B)

**Cas : Tous les jours sont sous ou proches de l'objectif**
- surplusTotal === 0
- Aucun jour de débordement

**Stratégie d'affichage :**
```javascript
function BlocImpactJours() {
  const { surplusTotal, jourPlusLourd } = bilan || {};
  
  // Si aucun surplus, afficher message positif
  if (!surplusTotal || surplusTotal === 0) {
    return (
      <section style={{
        marginTop: '1.5rem',
        padding: '1rem 1.2rem',
        background: '#f0fdf4',
        borderRadius: 10,
        border: '2px solid #22c55e'
      }}>
        <h4 style={{color: '#15803d', fontSize: '1.1rem', marginBottom: '0.5rem'}}>
          ✅ Semaine équilibrée
        </h4>
        <p style={{color: '#166534'}}>
          Aucune journée n'a généré d'excédent significatif.
          La régularité est là, continue ainsi.
        </p>
      </section>
    );
  }
  
  // Suite normale (cas surplus existant)...
}
```

### 6.6 Ordre d'affichage et espacement

**Structure visuelle recommandée :**

```jsx
<div className={styles.modalContent}>
  {/* Section 1 — Signal énergétique (EXISTANT) */}
  <section style={{marginBottom: '2rem'}}>
    {/* Blocs Section 1 */}
  </section>
  
  {/* NOUVEAUX BLOCS (espacés de 1.5rem entre eux) */}
  <BlocRepartitionJours />
  <BlocImpactJours />
  <BlocEvolutionExtras />
  <BlocAnalyseFragilites />
  
  {/* Section 2 — Tendance trajectoire (EXISTANT) */}
  <section style={{marginTop: '2rem'}}>
    <AccordionTendance />
  </section>
  
  {/* Section 7 — Comment j'ai mangé (EXISTANT) */}
  <section style={{marginTop: '2rem'}}>
    <SectionCommentMange />
  </section>
  
  {/* Objectif semaine prochaine (NOUVEAU, en fin) */}
  <BlocObjectifSemaineProchaine />
</div>
```

**Espacement recommandé :**
- Entre Section 1 et nouveaux blocs : `2rem`
- Entre chaque nouveau bloc : `1.5rem`
- Entre derniers nouveaux blocs et Section 2 : `2rem`

### 6.7 Accessibilité clavier et focus

**Navigation attendue (ordre Tab) :**
1. Bouton fermeture modale (×)
2. Bouton "En savoir plus" (Section 1)
3. Bouton "Voir détail streaks" (si présent)
4. Bouton "Voir détail fragilités" (si présent)
5. Bouton "Voir le détail" (Section 2)
6. Bouton "Comment j'ai mangé" (Section 7)
7. Textarea objectif perso
8. Bouton "Enregistrer objectif"

**Focus trap dans modale :**
```javascript
// Dans BilanHebdoModal, gérer focus trap
useEffect(() => {
  if (open) {
    // Focus sur premier élément interactif
    const firstFocusable = modalRef.current?.querySelector('button, textarea, input');
    firstFocusable?.focus();
    
    // Écouter Escape pour fermer
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    
    return () => document.removeEventListener('keydown', handleEscape);
  }
}, [open, onClose]);
```

### 6.8 Performance et optimisation

**Calculs à optimiser :**
- Éviter boucles imbriquées dans calculerRepartitionJours
- Utiliser `.reduce()` plutôt que `.forEach()` + push
- Mémoïser les calculs lourds si possible (React.useMemo)

**Exemple optimisation :**
```javascript
// ❌ Moins performant
const repasDuJour = [];
repasReels.forEach(r => {
  if (r.date === dateJour) {
    repasDuJour.push(r);
  }
});

// ✅ Plus performant
const repasDuJour = repasReels.filter(r => r.date === dateJour);
```

### 6.9 Conformité stricte verbatims

**Relecture obligatoire avec liste mots interdits :**

**❌ INTERDITS (à détecter et corriger immédiatement) :**
- "tu devrais"
- "il faut"
- "attention"
- "alerte"
- "risque"
- "déséquilibre"
- "vigilance" (sauf dans titre bloc "Zones de vigilance", accepté)
- "problème"
- "erreur"
- "échec"

**✅ REQUIS (à utiliser systématiquement) :**
- "trajectoire"
- "direction"
- "continuité"
- "rythme"
- "construction"
- "répétition"
- "orienter"
- "s'imprimer"
- "percevoir" (ex: "le corps perçoit")

**Phrase socle à afficher au moins 1 fois :**
> "Une journée ne décide rien. Une semaine oriente. Deux semaines commencent à s'imprimer."

**Emplacement recommandé :**
- En fin de Bloc Analyse Fragilités (clôture pédagogique)
- Ou en fin de Bloc Objectif Semaine Prochaine (ouverture vers futur)

### 6.10 Rollback et traçabilité

**À chaque commit Git :**
- Message clair : `[BILAN ABC] Phase 1 - Ajout calculerRepartitionJours`
- Tag si phase complète : `v1.0-phase1-calculs`
- Branch dédiée recommandée : `feature/bilan-lectures-abc`

**Fichier rollback à maintenir :**
- `/docs/HISTORIQUE_ROLLBACK_BILAN_ABC.md`
- Mise à jour immédiate en cas d'anomalie
- Format structuré (voir étape 4.5)

---

## Etape 7 — Proposition de rollback

### 7.1 Procédure rollback par phase

#### Phase 1 — Rollback calculs (lib/validationSemaine.js)

**Si anomalie détectée :**
1. Identifier le commit avant Phase 1 : `git log --oneline`
2. Revenir à ce commit : `git reset --hard <commit-hash>`
3. Ou supprimer manuellement les 5 fonctions ajoutées
4. Vérifier que fonctions existantes fonctionnent : Tests manuels
5. Ajouter entrée rollback détaillée

**Backup préventif avant Phase 1 :**
```bash
# Créer backup du fichier
cp lib/validationSemaine.js lib/validationSemaine.js.backup-avant-phase1
```

#### Phase 2 — Rollback intégration (pages/suivi.js)

**Si anomalie détectée :**
1. Rollback Git : `git reset --hard <commit-avant-phase2>`
2. Vérifier que Phase 1 fonctionne toujours isolément (tests unitaires)
3. Analyser cause : Import manquant ? Appel fonction incorrect ? bilanData malformé ?
4. Corriger et re-tester en isolation avant nouvelle tentative
5. Ajouter entrée rollback

**Tests avant rollback :**
- Vérifier que Section 1 fonctionne encore (validation semaine, affichage bilan)
- Vérifier console propre (pas d'erreurs React)

#### Phase 3 — Rollback affichage (BilanHebdoModal.js)

**Si anomalie détectée :**
1. Option A : Masquer blocs problématiques temporairement
   ```javascript
   // Masquage temporaire pour débug
   function BlocRepartitionJours() {
     return null; // TODO: Debug et réactiver
   }
   ```
2. Option B : Rollback Git complet
3. Option C : Débugger en isolation (Storybook ou page test dédiée)
4. Une fois corrigé, re-intégrer progressivement bloc par bloc
5. Ajouter entrée rollback

**Stratégie de rollback progressif :**
- Ne pas supprimer tout le code Phase 3 d'un coup
- Isoler le bloc problématique uniquement
- Les autres blocs fonctionnels restent actifs

#### Phase 4 — Rollback tests (pas de code à rollback)

- Si tests révèlent bugs, retour Phase 2 ou 3 selon origine
- Pas de rollback spécifique Phase 4

### 7.2 Format entrée fichier rollback

**Fichier : `/docs/HISTORIQUE_ROLLBACK_BILAN_ABC.md`**

```markdown
# Historique Rollback — Bilan Hebdo Lectures ABC

---

## Entrée #1

**Date** : 02/02/2026 11:45  
**Phase concernée** : Phase 2 - Intégration pages/suivi.js  
**Anomalie détectée** :
- Description : Objet bilanData contient clé 'joursCategories' undefined
- Impact utilisateur : Crash modale bilan à l'ouverture, impossible de valider semaine
- Gravité : 🔴 Bloquante

**Contexte technique** :
- Fichier : `/pages/suivi.js`
- Fonction : `handleValiderSemaine`
- Ligne : ~1120
- Erreur console : `Cannot read property 'sous' of undefined`

**Cause racine** :
- Oubli d'appel fonction `calculerRepartitionJours` dans `handleValiderSemaine`
- Clé `joursCategories` ajoutée à bilanData mais jamais populée

**Action corrective** :
1. Rollback commit : `git reset --hard abc123`
2. Ajout appel fonction : `const repartition = calculerRepartitionJours(repasSemaine, weekStart, objectifHebdo);`
3. Population bilanData : `joursCategories: repartition.joursCategories`
4. Re-test : ✅ Fonctionnel

**Temps perdu** : 30 min  
**Statut** : ✅ Résolu  
**Commit correctif** : `def456`

**Leçon apprise** :
- Toujours tester localement génération bilan avant commit
- Ajouter test unitaire pour vérifier structure bilanData

---

## Entrée #2

(Prochaine anomalie)

---
```

### 7.3 Critères de déclenchement rollback

**Rollback IMMÉDIAT si :**
- ❌ Crash app (erreur bloquante)
- ❌ Perte de données utilisateur
- ❌ Régression Section 1 (Section validée impactée)
- ❌ Impossible de valider semaine
- ❌ Modale ne s'ouvre plus

**Rollback APRÈS ANALYSE si :**
- ⚠️ Affichage incorrect (verbatim erroné, calcul faux)
- ⚠️ Performance dégradée (>1s ouverture modale)
- ⚠️ Accessibilité rompue (navigation clavier KO)
- ⚠️ Tests échec partiel (1-2 scénarios KO)

**Pas de rollback, simple ajustement si :**
- 🟡 Verbatim à reformuler (pas d'erreur technique)
- 🟡 Espacement visuel à ajuster
- 🟡 Couleur à changer (contraste OK)

### 7.4 Communication utilisateur en cas de rollback

**Template message utilisateur :**

```
🔄 Rollback Phase X effectué

Une anomalie a été détectée lors de l'implémentation :
[Description courte de l'anomalie]

Impact : [Description impact utilisateur]

Action prise : Retour à la version précédente stable.

Prochaine étape : Analyse cause racine + correctif + re-test avant nouvelle tentative.

Temps estimé avant reprise : [X heures]

L'historique détaillé est disponible dans docs/HISTORIQUE_ROLLBACK_BILAN_ABC.md
```

### 7.5 Prévention rollback (bonnes pratiques)

**Avant chaque phase :**
- [ ] Relire checklist complète (étapes 2 et 3)
- [ ] Backup fichiers concernés
- [ ] Commit atomique (1 phase = 1 commit)
- [ ] Branch dédiée (pas direct sur main)

**Pendant implémentation :**
- [ ] Tester fréquemment (pas attendre fin phase)
- [ ] Console propre (0 erreur, 0 warning)
- [ ] Validation incrémentale (fonction par fonction)

**Après chaque phase :**
- [ ] Tests exhaustifs (tous scénarios)
- [ ] Validation utilisateur AVANT phase suivante
- [ ] Documentation à jour (changelog, rollback)

---

## Etape 8 — Rapport Markdown Copilot

### 8.1 Structure rapport AVANT implémentation

**Fichier : `/docs/RAPPORT_AVANT_PHASE_X.md`**

```markdown
# Rapport AVANT Phase X — [Titre phase]

**Date** : [Date]  
**Phase concernée** : Phase X - [Nom]  
**Fichiers concernés** : [Liste]

---

## État actuel du code

### Fichier 1 : [Nom fichier]

**Structure actuelle :**
- Lignes 1-100 : [Description]
- Fonctions présentes : [Liste]
- Hooks déclarés : [Liste]
- Dépendances : [Liste]

**Points d'attention :**
- [Point 1]
- [Point 2]

### Fichier 2 : [Nom fichier]

(Idem)

---

## Modifications prévues

### Fichier 1

**Ajouts :**
- Nouvelle fonction `nomFonction` (ligne ~XXX)
- Nouveau hook `useState` (ligne ~YYY)

**Modifications :**
- Aucune (si applicable)

**Suppressions :**
- Aucune (si applicable)

---

## Risques identifiés

1. **Risque 1** : [Description]
   - Mitigation : [Plan]
2. **Risque 2** : [Description]
   - Mitigation : [Plan]

---

## Checklist pré-implémentation

- [ ] Tous les hooks identifiés
- [ ] Toutes les dépendances listées
- [ ] Backup fichiers créé
- [ ] Commit atomique préparé
- [ ] Tests préparés

---

**Validation utilisateur requise avant implémentation.**
```

### 8.2 Structure rapport APRÈS implémentation

**Fichier : `/docs/RAPPORT_APRES_PHASE_X.md`**

```markdown
# Rapport APRÈS Phase X — [Titre phase]

**Date** : [Date]  
**Phase concernée** : Phase X - [Nom]  
**Statut** : ✅ Succès / ⚠️ Avec ajustements / ❌ Échec (rollback)

---

## Modifications effectuées

### Fichier 1 : [Nom fichier]

**Ajouts réalisés :**
- ✅ Fonction `nomFonction` (lignes XXX-YYY)
  - Code : [Snippet clé]
  - Tests : [Résultats]
- ✅ Hook `useState` (ligne ZZZ)
  - Initialisé avec : [Valeur]

**Modifications réalisées :**
- ✅ [Modification 1]

**Suppressions réalisées :**
- N/A

### Fichier 2 : [Nom fichier]

(Idem)

---

## Tests effectués

### Tests unitaires

| Test | Scénario | Résultat | Commentaire |
|------|----------|----------|-------------|
| Test 1 | [Description] | ✅ Passé | - |
| Test 2 | [Description] | ✅ Passé | - |
| Test 3 | [Description] | ⚠️ Ajusté | [Détail ajustement] |

### Tests intégration

- ✅ Génération bilanData complète
- ✅ Affichage modale sans erreur
- ✅ Console propre (0 erreur)

### Tests UI

- ✅ Tous blocs s'affichent
- ✅ Espacement correct
- ✅ Responsive mobile OK

---

## Conformité métier

- ✅ Verbatims strictement alignés fiche métier
- ✅ Aucun mot interdit détecté
- ✅ Phrase socle Plan Vital présente
- ✅ Ton respecté (trajectoire, direction)

---

## Non-régression

- ✅ Section 1 intacte (tests manuels)
- ✅ Validation semaine fonctionne
- ✅ Aucun effet de bord détecté

---

## Anomalies détectées et corrigées

1. **Anomalie 1** : [Description]
   - Correction : [Action]
   - Commit : [Hash]

2. **Aucune anomalie** (si applicable)

---

## Temps réel vs estimé

- **Temps estimé** : Xh
- **Temps réel** : Yh
- **Écart** : +Zh (explications si écart >20%)

---

## Prochaines étapes

- [ ] Validation utilisateur de cette phase
- [ ] Passage Phase suivante (si validation OK)
- [ ] Ajustements (si demandés par utilisateur)

---

**Validation utilisateur requise avant phase suivante.**
```

### 8.3 Fréquence rapports

**AVANT chaque phase :**
- Rapport AVANT obligatoire
- Validation utilisateur OBLIGATOIRE

**APRÈS chaque phase :**
- Rapport APRÈS obligatoire
- Validation utilisateur OBLIGATOIRE avant phase suivante

**Pas de rapport intermédiaire** (sauf si phase >5h, alors rapport mi-parcours)

### 8.4 Diffusion rapports

**Emplacement :**
- `/docs/RAPPORT_AVANT_PHASE_1.md`
- `/docs/RAPPORT_APRES_PHASE_1.md`
- `/docs/RAPPORT_AVANT_PHASE_2.md`
- Etc.

**Notification utilisateur :**
- Message chat : "📄 Rapport Phase X généré, validation requise"
- Lien direct vers fichier
- Résumé 3 lignes dans le chat

---

## Etape 9 — Validation explicite de l'utilisateur (OBLIGATOIRE)

### 9.1 Validation plan global

- [ ] **Plan d'implémentation complet lu et compris**
  - Date validation : ________________
  - Signature utilisateur : ________________

- [ ] **Approche méthodologique validée** (phases, rapports, rollback)
  - Commentaire utilisateur : ________________________________

- [ ] **Ordre de priorité validé** (voir étape 10)
  - Ajustements demandés : ________________________________

- [ ] **Durées estimées acceptables**
  - Total : ~25h sur 4 phases
  - Commentaire : ________________________________

### 9.2 Validation avant chaque phase

**Phase 1 — Calculs**
- [ ] Rapport AVANT Phase 1 validé
- [ ] Fonctions à créer approuvées (5 fonctions)
- [ ] Tests unitaires définis approuvés
- [ ] GO utilisateur pour démarrer Phase 1
- Date : ________________

**Phase 2 — Intégration**
- [ ] Rapport APRÈS Phase 1 validé
- [ ] Rapport AVANT Phase 2 validé
- [ ] Approche intégration pages/suivi.js approuvée
- [ ] Structure bilanData validée
- [ ] GO utilisateur pour démarrer Phase 2
- Date : ________________

**Phase 3 — Affichage**
- [ ] Rapport APRÈS Phase 2 validé
- [ ] Rapport AVANT Phase 3 validé
- [ ] Wireframes blocs validés (optionnel mais recommandé)
- [ ] Verbatims finaux validés un par un
- [ ] GO utilisateur pour démarrer Phase 3
- Date : ________________

**Phase 4 — Tests & Validation**
- [ ] Rapport APRÈS Phase 3 validé
- [ ] Rapport AVANT Phase 4 validé
- [ ] Checklist tests approuvée
- [ ] GO utilisateur pour démarrer Phase 4
- Date : ________________

### 9.3 Validation finale

**Après Phase 4 complète :**
- [ ] Rapport APRÈS Phase 4 validé
- [ ] Tests accessibilité OK
- [ ] Tests responsive OK
- [ ] Tests cas limites OK
- [ ] Tests performance OK
- [ ] Conformité métier totale validée
- [ ] Non-régression Section 1 confirmée
- [ ] **GO PRODUCTION**
- Date : ________________

### 9.4 Clause d'arrêt

**L'utilisateur peut demander l'arrêt à tout moment :**
- Arrêt immédiat si demandé
- Rollback de la phase en cours
- Rapport état des lieux
- Débriefing cause arrêt
- Plan ajusté si reprise souhaitée ultérieurement

**Motifs légitimes d'arrêt :**
- Changement de priorités
- Anomalie bloquante récurrente
- Approche méthodologique à revoir
- Durées dépassées significativement
- Résultat intermédiaire non satisfaisant

---

## Etape 10 — Ordre de priorité recommandé

### 10.1 Séquence optimale (justifiée)

#### 🥇 PRIORITÉ 1 — Phase 1 : Calculs (lib/validationSemaine.js)

**Pourquoi en premier :**
- Fondation technique de tout le reste
- Aucune dépendance externe (travail isolé)
- Testable unitairement sans UI
- Erreurs détectables tôt

**Ordre interne Phase 1 :**
1. `calculerRepartitionJours` (inclut `detecterStreaksReussis`)
2. `calculerImpactJours` (dépend de detailsJours)
3. `calculerEvolutionExtras` (indépendant)
4. `analyserFragilites` (dépend de detailsJours)

**Durée** : 6h

#### 🥈 PRIORITÉ 2 — Phase 2 : Intégration (pages/suivi.js)

**Pourquoi après Phase 1 :**
- Nécessite fonctions Phase 1 terminées
- Génération objet bilanData complet indispensable pour affichage
- Tests intégration valident calculs en contexte réel

**Durée** : 3h

#### 🥉 PRIORITÉ 3 — Phase 3 : Affichage (BilanHebdoModal.js)

**Pourquoi après Phase 2 :**
- Nécessite bilanData enrichi (Phase 2 complète)
- Blocs affichage consomment données calculées
- Visible par utilisateur final (feedback immédiat possible)

**Ordre interne Phase 3 :**
1. `BlocRepartitionJours` (Lecture A + Streaks) — Quick win, très visible
2. `BlocImpactJours` (Lecture B) — Répond au besoin utilisateur critique
3. `BlocEvolutionExtras` (Lecture C) — Complète les 3 lectures de base
4. `BlocAnalyseFragilites` — Enrichissement critique
5. `BlocObjectifSemaineProchaine` — Enrichissement appropriation

**Durée** : 10h45

#### 🏁 PRIORITÉ 4 — Phase 4 : Tests & Validation

**Pourquoi en dernier :**
- Nécessite toutes les phases précédentes terminées
- Validation globale (accessibilité, responsive, cas limites)
- Go/No-go production

**Durée** : 4h30

### 10.2 Jalons intermédiaires (checkpoints)

**Checkpoint 1 — Fin Phase 1**
- ✅ Les 5 fonctions de calcul existent et fonctionnent
- ✅ Tests unitaires passent
- ✅ Aucune régression fonctions existantes
- **Décision** : GO Phase 2 / Ajustements / Arrêt

**Checkpoint 2 — Fin Phase 2**
- ✅ Objet bilanData enrichi correctement
- ✅ Validation semaine génère bilan complet
- ✅ Console propre, aucune erreur
- **Décision** : GO Phase 3 / Ajustements / Arrêt

**Checkpoint 3 — Fin Phase 3**
- ✅ Les 5 blocs s'affichent correctement
- ✅ Verbatims conformes métier
- ✅ Aucune régression Section 1
- **Décision** : GO Phase 4 / Ajustements / Arrêt

**Checkpoint 4 — Fin Phase 4**
- ✅ Tous les tests passent (accessibilité, responsive, cas limites)
- ✅ Conformité métier totale
- ✅ Performance OK (<1s ouverture modale)
- **Décision** : GO PRODUCTION / Ajustements / Arrêt

### 10.3 Variante accélérée (si contrainte temps)

**Si besoin de réduire le scope :**

**MVP (Minimum Viable Product) :**
- Phase 1 : Seulement calculerRepartitionJours + calculerImpactJours (Lectures A et B)
- Phase 2 : Intégration minimale (juste A et B)
- Phase 3 : Juste BlocRepartitionJours + BlocImpactJours
- Phase 4 : Tests essentiels uniquement

**Durée MVP** : ~10h (au lieu de 25h)

**Avantages MVP :**
- Répond au besoin critique utilisateur (valoriser jours réussis, identifier jour lourd)
- Livrable rapidement
- Feedback utilisateur réel possible
- Enrichissements (C, streaks, fragilités, objectif) reportés itération suivante

**Inconvénients MVP :**
- Fonctionnalités incomplètes (pas de Lecture C, pas d'analyse fragilités)
- Nécessite 2ème itération pour compléter

**Recommandation :**
- Implémenter PLAN COMPLET si temps disponible (25h)
- Sinon, opter pour MVP puis itération 2

### 10.4 Dépendances critiques

**Bloquantes (ne peut pas avancer sans) :**
- Phase 2 bloquée tant que Phase 1 non terminée
- Phase 3 bloquée tant que Phase 2 non terminée
- Phase 4 bloquée tant que Phase 3 non terminée

**Non-bloquantes (peuvent être parallélisées) :**
- Tests unitaires Phase 1 (pendant codage)
- Wireframes blocs Phase 3 (pendant Phase 2)
- Préparation checklist tests Phase 4 (pendant Phase 3)

**Dépendances externes :**
- Table Supabase `semaines_validees` doit contenir données N-1
- Table Supabase `repas_reels` doit contenir champs requis
- Aucune autre dépendance externe identifiée

---

## Etape 11 — Récapitulatif durées et planning

### 11.1 Tableau durées détaillé

| Phase | Sous-tâche | Durée estimée | Durée réelle | Écart |
|-------|-----------|---------------|--------------|-------|
| **Phase 0** | **Création plan** | 1h | - | - |
| Phase 0 | Rédaction plan complet | 1h | - | - |
| **Phase 1** | **Calculs (lib/validationSemaine.js)** | **6h** | - | - |
| Phase 1.1 | calculerRepartitionJours | 1h30 | - | - |
| Phase 1.2 | calculerImpactJours | 1h | - | - |
| Phase 1.3 | calculerEvolutionExtras | 45min | - | - |
| Phase 1.4 | detecterStreaksReussis | 45min | - | - |
| Phase 1.5 | analyserFragilites | 2h | - | - |
| **Phase 2** | **Intégration (pages/suivi.js)** | **3h** | - | - |
| Phase 2.1 | Imports fonctions | 5min | - | - |
| Phase 2.2 | Appels dans handleValiderSemaine | 1h | - | - |
| Phase 2.3 | Enrichir objet bilanData | 30min | - | - |
| Phase 2.4 | Fetch données N-1 | 30min | - | - |
| Phase 2.5 | Tests intégration | 1h | - | - |
| **Phase 3** | **Affichage (BilanHebdoModal.js)** | **10h45** | - | - |
| Phase 3.1 | BlocRepartitionJours | 2h | - | - |
| Phase 3.2 | BlocImpactJours | 1h30 | - | - |
| Phase 3.3 | BlocEvolutionExtras | 1h | - | - |
| Phase 3.4 | BlocAnalyseFragilites | 2h30 | - | - |
| Phase 3.5 | BlocObjectifSemaineProchaine | 1h30 | - | - |
| Phase 3.6 | Intégration rendu principal | 30min | - | - |
| Phase 3.7 | Affichage objectif page suivi | 45min | - | - |
| Phase 3.8 | Tests UI | 1h | - | - |
| **Phase 4** | **Tests & Validation** | **4h30** | - | - |
| Phase 4.1 | Tests accessibilité | 1h30 | - | - |
| Phase 4.2 | Tests responsive | 1h | - | - |
| Phase 4.3 | Tests cas limites | 1h30 | - | - |
| Phase 4.4 | Tests performance | 30min | - | - |
| **TOTAL** | | **25h15** | **-** | **-** |

### 11.2 Planning recommandé (exemple)

**Hypothèse : 5h de travail effectif par jour**

| Jour | Heures | Phase | Livrables |
|------|--------|-------|-----------|
| J1 | 1h + 4h | Phase 0 + Phase 1 (début) | Plan validé + 2 fonctions |
| J2 | 5h | Phase 1 (fin) | 5 fonctions terminées + tests |
| J3 | 3h + 2h | Phase 1 validation + Phase 2 (début) | Rapport Phase 1 + Intégration |
| J4 | 3h | Phase 2 (fin) + validation | bilanData enrichi |
| J5 | 5h | Phase 3 (début) | 2 blocs affichés |
| J6 | 5h | Phase 3 (suite) | 5 blocs affichés |
| J7 | 2h45 + 2h15 | Phase 3 (fin) + Phase 4 (début) | UI complète + Tests début |
| J8 | 2h15 + validation | Phase 4 (fin) | Tests OK + GO PROD |

**Durée totale : 8 jours** (si 5h/jour)

**Variantes :**
- Si 8h/jour : 3-4 jours
- Si 2h/jour : 12-13 jours
- Si sessions longues (10h) : 2-3 jours

### 11.3 Flexibilité planning

**Adaptations possibles :**
- Pause entre phases (recommandé pour validation utilisateur)
- Itérations courtes (1 phase/semaine si contraintes)
- Sprints dédiés (week-end intensif si urgence)

**Points de synchronisation obligatoires :**
- Fin de chaque phase : Validation utilisateur (peut prendre 1-24h)
- Checkpoint mi-Phase 3 : Revue UI (30min présentation à utilisateur)

---

## Etape 12 — Checklist finale avant démarrage

### 12.1 Prérequis techniques

- [ ] VS Code ouvert avec workspace NEWcompteplanvitalroot
- [ ] Node.js et npm installés et fonctionnels
- [ ] Supabase accessible (connexion OK)
- [ ] Branch Git dédiée créée : `feature/bilan-lectures-abc`
- [ ] Backup fichiers créé (validationSemaine.js, BilanHebdoModal.js, suivi.js)

### 12.2 Prérequis documentaires

- [ ] Fiche métier "maj bilan hebdo" lue et comprise
- [ ] Analyse besoins utilisateur lue (ANALYSE_BESOINS_vs_MAJ_BILAN_HEBDO.md)
- [ ] Plan d'implémentation (ce document) lu intégralement
- [ ] Fichier PLAN_IMPL_SECTION2 lu (pour contexte Section 2 existante)
- [ ] Fichier ETAT_ACTUEL_CODE lu (pour état des lieux)

### 12.3 Validation utilisateur

- [ ] **PLAN GLOBAL VALIDÉ PAR UTILISATEUR** (BLOQUANT)
  - Date : ________________
  - Signature : ________________
  - Commentaires/ajustements : ________________________________

### 12.4 Environnement de travail

- [ ] Codespace actif (si applicable)
- [ ] Keepalive lancé si session longue (voir discussion codespace)
- [ ] Connexion stable
- [ ] Aucune tâche bloquante en parallèle

### 12.5 Communication

- [ ] Utilisateur disponible pour validations intermédiaires
- [ ] Modalités de communication définies (chat, etc.)
- [ ] Fréquence checkpoints définie (ex: 1 fois/jour)

---

## Etape 13 — Conclusion et prochaines étapes

### 13.1 Résumé du plan

Ce plan d'implémentation couvre l'ajout de **3 lectures dynamiques** (A, B, C) et **3 enrichissements critiques** (streaks, fragilités, objectif perso) au bilan hebdomadaire de l'application Plan Vital.

**Objectif principal :** Ne plus "punir" une semaine majoritairement alignée à cause d'une seule journée déviante.

**Approche :** Implémentation progressive en 4 phases (calculs → intégration → affichage → tests), avec validation utilisateur OBLIGATOIRE à chaque étape.

**Durée totale estimée :** 25h15 (hors validation utilisateur)

**Conformité métier :** Stricte, verbatims issus de la fiche "maj bilan hebdo", ton Plan Vital respecté (trajectoire, direction, continuité).

### 13.2 Points forts de ce plan

✅ **Méthodologie rigoureuse** : Audit risques, checklists, rollback, rapports
✅ **Validation continue** : Utilisateur impliqué à chaque étape
✅ **Non-régression garantie** : Section 1 préservée, tests exhaustifs
✅ **Traçabilité** : Changelog, rollback, commits atomiques
✅ **Accessibilité** : WCAG AA, tests clavier, screen reader
✅ **Conformité métier** : Verbatims validés, seuils métier respectés

### 13.3 Prochaines actions immédiates

**SI PLAN VALIDÉ PAR UTILISATEUR :**

1. **Créer branch Git**
   ```bash
   git checkout -b feature/bilan-lectures-abc
   ```

2. **Créer fichiers rollback et changelog**
   ```bash
   touch docs/HISTORIQUE_ROLLBACK_BILAN_ABC.md
   touch docs/CHANGELOG_LECTURES_ABC.md
   ```

3. **Backup fichiers**
   ```bash
   cp lib/validationSemaine.js lib/validationSemaine.js.backup-avant-abc
   cp components/BilanHebdoModal.js components/BilanHebdoModal.js.backup-avant-abc
   cp pages/suivi.js pages/suivi.js.backup-avant-abc
   ```

4. **Générer rapport AVANT Phase 1**
   - Fichier : `/docs/RAPPORT_AVANT_PHASE_1.md`
   - Présenter à utilisateur pour validation

5. **Démarrer Phase 1** (si validation rapport AVANT OK)

**SI PLAN NON VALIDÉ OU AJUSTEMENTS DEMANDÉS :**

1. **Intégrer retours utilisateur**
2. **Ajuster plan en conséquence**
3. **Régénérer sections modifiées**
4. **Revalider avec utilisateur**

### 13.4 Contact et support

**En cas de questions ou blocages durant l'implémentation :**
- Revenir vers utilisateur pour clarification
- Ne jamais avancer en cas de doute (principe de précaution)
- Documenter systématiquement les décisions prises

**En cas d'anomalie bloquante :**
- Rollback immédiat
- Rapport détaillé à utilisateur
- Proposition correctif ou arrêt phase

---

## 📝 Signatures et validations

### Validation plan d'implémentation global

**Plan créé par :** GitHub Copilot  
**Date création :** 01/02/2026  
**Version plan :** 1.0

**Validé par utilisateur :**
- Nom : ________________
- Date : ________________
- Signature : ________________

**Commentaires/ajustements demandés :**
________________________________________
________________________________________
________________________________________

### Autorisation démarrage Phase 1

- [ ] **GO POUR PHASE 1** (cocher si validé)
- Date autorisation : ________________

---

**FIN DU PLAN D'IMPLÉMENTATION**

**Rappel : Aucune ligne de code ne sera écrite avant validation explicite de ce plan par l'utilisateur.**

---

*Document généré le 01/02/2026 par GitHub Copilot*  
*Conforme aux templates : PLAN_IMPL_SECTION2_BILAN_HEBDO.md*  
*Références métier : maj bilan hebdo, ANALYSE_BESOINS_vs_MAJ_BILAN_HEBDO.md*
