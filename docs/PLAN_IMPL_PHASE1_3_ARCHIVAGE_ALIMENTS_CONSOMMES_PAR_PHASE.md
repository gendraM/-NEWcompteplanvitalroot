# 🟢 PLAN D’IMPLÉMENTATION — ARCHIVAGE DES ALIMENTS CONSOMMÉS PAR PHASE

## Titre de la tâche
Ajouter l’archivage des aliments consommés par phase dans chaque reprise alimentaire

---

## **Description précise de la modification attendue**
Permettre d’archiver, pour chaque reprise alimentaire, la liste des aliments effectivement consommés, regroupés par phase (1 à 5). L’objectif est de pouvoir analyser la conformité, la diversité et la progression alimentaire pour chaque phase, et d’afficher ces données dans l’historique ou le bilan.

---

## **Fichiers concernés**
- `/pages/reprise-alimentaire-apres-jeune.js`
- `/data/alimentsRepriseJeune.js` (lecture référentielle)
- `/components/HistoriqueReprisesModal.js` (affichage)

---

### Etape 1 — **Audit des risques préalable**
1. Risque technique : structure d’archive modifiée, risque de régression sur l’historique ou le bilan.
2. Risque UX : affichage incorrect ou incomplet des aliments consommés par phase.
3. Risque robustesse : oubli d’un aliment ou d’une phase lors de l’archivage.
4. Risque rétrocompatibilité : anciennes archives sans ce champ, gestion des cas manquants.
5. Risque performance : surcharge de l’objet archive si la liste est trop volumineuse.
6. Risque accessibilité : affichage non lisible ou non filtré dans la modal historique.
7. Vérification stricte de l’ordre des hooks React (useState, useEffect, etc.) dans tous les composants modifiés.
8. Consultation et lecture du fichier d’anomalies rollback avant toute modification. Exemple : 21/11/2025 — Entrée rollback : erreur SSR car useEffect appelé dans une boucle. Checklist créée : vérifier appel de tous les hooks en haut du composant.

---

### Etape 2 — **Sous-checklist à valider systématiquement**
- [ ] Vérification de la présence/import de toutes les fonctions, hooks et variables utilisées dans le code modifié
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?

---

### Etape 3 — **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel, jamais dans une fonction, une boucle, un map, un if, etc.
   - [ ] **Aucune variable d’état ou de hook n’est utilisée avant sa déclaration, y compris dans les dépendances d’autres hooks (ex : tableau de dépendances de useEffect).**
- [ ] Séparation stricte des étapes : d’abord initialisation (useState, useEffect…), puis logique calculée, puis handlers/fonctions, puis rendu
- [ ] Vérification : toute fonction ou handler utilisé dans le rendu est présent et initialisé avant usage
- [ ] Ordre et portée logiques stricts (jamais déclaration, appel ou usage prématuré)
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes : aucune suppression destructrice, aucune perte de comportement
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure (cf. fichier ANOMALIE)
- [ ] Documentation claire de chaque étape, chaque validation, et toute action automatisée (Copilot/IA)
- [ ] Relecture **manuelle obligatoire** des déclarations de tous les hooks, variables et fonctions AVANT chaque utilisation. NE PAS se baser sur la mémoire du modèle Copilot.
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation
- [ ] Toutes les cases ci-dessus doivent être cochées et documentées avant de poursuivre.

---

### Etape 4 — **Contrôles conformité à réaliser (en suivant l’ordre ci-dessous)**
1. Lire toutes les entrées d'anomalies enregistrées dans le fichier anomalies rollback afin d’identifier les points de vigilance pour anticiper le risque d’erreur similaire lors du codage de cette modification. Exemple : 21/11/2025 — Entrée rollback : erreur SSR car useEffect appelé dans une boucle.
2. Suite à cette analyse, créer une checklist de contrôle à appliquer avant le codage pour s'assurer d'un codage conforme, à ajouter dans la section Point de vigilance.
3. Ajouter l’analyse de l’audit des risques et s’assurer qu'il n’y a aucune anomalie bloquante avant d’implémenter la modification.
4. Si à ce stade une anomalie/bug est identifié, proposition immédiate de rollback à l’endroit où l'anomalie a été détectée (pour revenir à l’état où il n’y avait pas de bug) à confirmer avec l’utilisateur (ou revenir à l’état initial du code avant modification), documenter automatiquement dans le fichier Anomalie rollback avec date et heure.

---

### Etape 5 — **Mise à jour de l’avancement**
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel (**à MAJ à chaque étape**) : 0 %
- Historique des mises à jour : 30/12/2025, démarrage

---

### Etape 6 — **Point de vigilance**
1. Rapport lié à la lecture des entrées du fichier anomalies rollback adapté à la mise à jour actuelle (cf. Etape 4). Exemple : 21/11/2025 — Entrée rollback : erreur SSR car useEffect appelé dans une boucle.
2. Lister les erreurs similaires que la modification pourrait générer, suite au retour d’expérience documenté dans le fichier, afin de les éviter.
   - Vérifier qu’aucune variable d’état ou de hook n’est utilisée avant sa déclaration, y compris dans les dépendances d’autres hooks (ex : tableau de dépendances de useEffect).
3. Créer la checklist de vérification/point de vigilance, informer l’utilisateur que l’étape a été réalisée et indiquer l’impact attendu.

---

### Etape 7 — **Proposition de rollback**
- Décrire l’action de rollback, son contexte (fichier, modification en cause), l’alternative sûre proposée.
- Ajouter cette donnée dans le fichier ANOMALIE rollback : date, heure, détail complet pour traçabilité.
- Aucune suppression dans le fichier, toujours ajouter à la suite.
- Exemple : Rollback déclenché le 22/11/2025, 12h41 — raison : apparition erreur SSR sur composant, retour à la version taguée v1.7.0.

---

### Etape 8 — **Rapport Markdown Copilot**
#### AVANT
- Structure archive sans alimentsConsommesParPhase
- Affichage historique sans détail aliments consommés
- Hooks et états non adaptés à la nouvelle structure

#### APRÈS
- Structure archive enrichie avec alimentsConsommesParPhase
- Affichage historique avec détail aliments consommés par phase
- Hooks et états adaptés, déclarés en haut du composant
- Aucun doublon, aucune déclaration prématurée
- Tests sur cas limites et rétrocompatibilité

---

### Etape 9 — **Validation explicite de l’utilisateur (OBLIGATOIRE)**
- [ ] Plan validé par l’utilisateur à la date : ___

---

## Structure cible proposée

```js
repriseArchive = {
  // ...autres champs...
  alimentsConsommesParPhase: {
    1: [/* aliments phase 1 */],
    2: [/* aliments phase 2 */],
    3: [/* aliments phase 3 */],
    4: [/* aliments phase 4 */],
    5: [/* aliments phase 5 */]
  }
  // ...autres champs...
}
```

---

## Rapport de conformité template
- Lecture et respect strict du template Copilot (aucun écart)
- Toutes les étapes du template sont présentes et structurées
- Prêt pour validation utilisateur
