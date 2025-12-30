# 🟢 PLAN D’IMPLÉMENTATION — Défis comportementaux & Suivi quotidien (Cristallisation)

## Titre de la tâche
Intégration complète des défis comportementaux personnalisés et enrichissement du suivi quotidien dans la phase Cristallisation

---

## Description précise de la modification attendue
- Afficher et gérer les défis comportementaux personnalisés dans la page de suivi quotidien (/cristallisation-quotidien.js)
- Suivre la progression des défis (jours validés, feedback, badges)
- Ajouter un bouton de validation manuelle de la journée et un feedback prédictif
- Intégrer des notifications/toasts et alertes dynamiques lors de la saisie ou validation des critères/repas
- Ajouter des animations visuelles (pulse, barre de progression, etc.)
- Garantir la conformité stricte à la fiche métier et à la template d’implémentation

---

## Fichiers concernés
- /pages/cristallisation-quotidien.js
- /components/DefiCard.js (et potentiellement nouveaux composants)
- /lib/defisCristallisationGenerator.js
- /styles/
- /docs/ANOMALIE_ROLLBACK.md

---

### Etape 1 — Audit des risques préalable
1. Risque technique : régression sur la logique de validation des critères ou des défis
2. Risque UX : surcharge visuelle, confusion entre défis et critères quotidiens
3. Risque robustesse : oubli d’un useEffect ou d’un useState ➔ non mise à jour d’état
4. Risque accessibilité : animations non accessibles, feedback non vocalisé
5. Risque multi-device : désynchronisation des états entre localStorage et Supabase
6. Risque de perte de données ou de progression
7. Risque de conflit avec l’existant (ordre des hooks, handlers)
8. Risque de non-respect du flow initialisation ➔ logique ➔ handler ➔ rendu
9. Risque de non-conformité à la template (absence de checklist, rollback, rapport)

---

### Etape 2 — Sous-checklist à valider systématiquement
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?
- [ ] Tous les handlers/fonctions déclarés avant usage dans le rendu ?
- [ ] Tous les hooks déclarés en haut du composant ?
- [ ] **J’ai relu, ligne par ligne et manuellement, la déclaration de tous les useState et useEffect AVANT chaque appel.**

_Exemple :_
- [ ] useState importé en haut du fichier
- [ ] useEffect importé en haut du fichier
- [ ] Aucune variable d’état utilisée avant déclaration
- [ ] Tous les handlers déclarés avant leur usage dans le rendu

---

### Etape 3 — Checklist stricte sécurité & qualité
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel
- [ ] Séparation stricte des étapes : initialisation ➔ logique ➔ handlers ➔ rendu
- [ ] Vérification de la présence/import de toutes les fonctions, hooks et variables utilisées
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure (cf. fichier ANOMALIE_ROLLBACK.md)
- [ ] Documentation claire de chaque étape, chaque validation, et toute action automatisée
- [ ] Relecture manuelle obligatoire des déclarations de tous les hooks, variables et fonctions AVANT chaque utilisation
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

---

### Etape 4 — Contrôles conformité à réaliser
1. Lire toutes les entrées d’anomalies enregistrées dans le fichier ANOMALIE_ROLLBACK.md
2. Créer une checklist de contrôle à appliquer avant le codage
3. Ajouter l’analyse de l’audit des risques et s’assurer qu’il n’y a aucune anomalie bloquante
4. Si anomalie/bug identifié, proposition immédiate de rollback à l’endroit où l’anomalie a été détectée, à confirmer avec l’utilisateur

---

### Etape 5 — Mise à jour de l’avancement
- [ ] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel : ____ %
- Historique des mises à jour : ___

---

### Etape 6 — Point de vigilance
1. Rapport lié à la lecture des entrées du fichier anomalies rollback
2. Lister les erreurs similaires que la modification pourrait générer
3. Créer la checklist de vérification/point de vigilance, informer l’utilisateur que l’étape a été réalisée et indiquer l’impact attendu

---

### Etape 7 — Proposition de rollback
- Décrire l’action de rollback, son contexte, l’alternative sûre proposée
- Ajouter cette donnée dans le fichier ANOMALIE_ROLLBACK.md : date, heure, détail complet pour traçabilité

---

### Etape 8 — Rapport Markdown Copilot
- Générer un rapport structuré AVANT et APRÈS toute modification (structure, fonctions, hooks, changements, etc.)
- Ce rapport doit permettre une validation éclairée, claire et synthétique
- À valider par l’utilisateur avant code

---

### Etape 9 — Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---

# ⚠️ Aucune modification de code ne sera faite tant que ce plan n’est pas validé explicitement par l’utilisateur.
