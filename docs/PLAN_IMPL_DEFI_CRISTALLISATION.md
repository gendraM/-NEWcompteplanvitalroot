# 🟢 PLAN D’IMPLÉMENTATION COPILOT — Génération de défis comportementaux personnalisés pour la cristallisation

## Titre de la tâche
Ajouter la génération dynamique de défis comportementaux personnalisés pour la phase de cristallisation, basée sur les difficultés et contextes détectés lors du bilan de reprise, sans enrichissement global ni dépendance à un système de connexion.

---

## **Description précise de la modification attendue**
- Créer une fonction qui génère une liste de défis comportementaux adaptés au contexte et aux difficultés de l’utilisateur, à partir d’un référentiel local, pour la phase de cristallisation.
- Ces défis sont strictement disponibles uniquement pendant la phase cristallisation : ils ne doivent pas apparaître si la phase cristallisation n’est pas active.
- Ils sont générés spécifiquement et de façon personnalisée, en lien direct avec le vécu et le profil de l’utilisateur lors de la reprise alimentaire.
- Les défis doivent être strictement adaptés à chaque utilisateur, sans widget flottant, sans mode discret, sans enrichissement automatique du référentiel, et sans dépendance à un système de connexion.
- Respecter la séparation TEST/PROD, rollback, et la gestion locale des profils/reprises.
- Intégrer la logique dans un module transverse (ex : `/lib/defisCristallisationGenerator.js`), réutilisable dans la page cristallisation.

---

## **Fichiers concernés**
- `/lib/defisCristallisationGenerator.js` (nouveau)
- `/pages/cristallisation.js`
- `/components/PopUpDefi.js` (si affichage modifié)

---

### Etape 1 — **Audit des risques préalable**
1. Risque de conflit avec la logique existante de gestion des défis (localStorage, rollback, TEST/PROD)
2. Risque d’erreur si le référentiel local n’est pas respecté (pas d’enrichissement global)
3. Risque de régression sur l’affichage ou la sauvegarde des défis
4. Risque d’utilisation incorrecte des hooks React (à vérifier dans les composants concernés)
5. Risque de perte de données si la logique de rollback n’est pas respectée
6. Vérifier le fichier d’anomalies rollback avant toute modification

---

### Etape 2 — **Sous-checklist à valider systématiquement**
- [ ] Vérification de la présence/import de toutes les fonctions, hooks et variables utilisées
- [ ] Respect du référentiel local (pas d’enrichissement automatique)
- [ ] Respect de la séparation TEST/PROD et rollback

---

### Etape 3 — **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel
- [ ] Séparation stricte des étapes : initialisation, logique calculée, handlers, rendu
- [ ] Vérification de la présence et de l’initialisation de chaque fonction/handler utilisé dans le rendu
- [ ] Ordre et portée logiques stricts
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure
- [ ] Documentation claire de chaque étape, chaque validation, et toute action automatisée
- [ ] Relecture manuelle obligatoire des hooks, variables et fonctions AVANT chaque utilisation
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

---

### Etape 4 — **Contrôles conformité à réaliser (en suivant l’ordre ci-dessous)**
1. Lire toutes les entrées d'anomalies enregistrées dans le fichier anomalies rollback
2. Créer une checklist de contrôle à appliquer avant le codage
3. Ajouter l’analyse de l’audit des risques et s’assurer qu'il n’y a aucune anomalie bloquante
4. Si anomalie/bug identifié, proposition immédiate de rollback à confirmer avec l’utilisateur

---

### Etape 5 — **Mise à jour de l’avancement**
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel : 0 %
- Historique des mises à jour : 28/12/2025, plan initial

---

### Etape 6 — **Point de vigilance**
1. Respect strict du référentiel local (pas d’enrichissement global)
2. Pas de dépendance à un système de connexion
3. Respect de la logique rollback et TEST/PROD
4. Vérification de la gestion des hooks React dans les composants concernés
5. Contrôle de la sauvegarde locale des défis (localStorage)

---

### Etape 7 — **Proposition de rollback**
- Si anomalie détectée (ex : perte de défis, bug d’affichage, conflit rollback), retour immédiat à l’état précédent, ajout d’une entrée dans le fichier ANOMALIE rollback, et validation utilisateur requise.

---

### Etape 8 — **Rapport Markdown Copilot**
#### AVANT
- Pas de génération dynamique des défis comportementaux personnalisés pour la cristallisation
- Logique de défis basée sur un référentiel statique

#### APRÈS
- Génération dynamique des défis comportementaux personnalisés selon le contexte et les difficultés détectées
- Respect du référentiel local, pas d’enrichissement global
- Intégration dans la page cristallisation et affichage adapté

---

### Etape 9 — **Validation explicite de l’utilisateur (OBLIGATOIRE)**
- [ ] Plan validé par l’utilisateur à la date : ___

---

**⚠️ Aucune modification de code ne sera produite tant que ce plan n’aura pas été validé explicitement par l’utilisateur.**
