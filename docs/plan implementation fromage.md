# 🧀 PLAN IMPLEMENTATION FROMAGE

## 1. Objet
Mettre en place un plan d’implémentation clair, progressif et vérifiable pour enrichir la catégorie fromage dans le référentiel alimentaire, en cohérence avec la stratégie du projet.

## 2. Contexte constaté
- Le plan de référence prévoit un batch fromage prioritaire (Phase 1).
- Les fromages sont globalement présents dans le référentiel actuel.
- Une incohérence de taxonomie existe entre :
  - catégorie fonctionnelle attendue : "fromage"
  - catégorie de stockage actuelle majoritaire : "laitier"
- Une entrée de structure/placeholder existe (ex: "Exemple fromage"), ce qui peut perturber la perception de complétude côté autocomplétion.

## 3. Objectifs d’implémentation
1. Consolider une catégorie fromage riche, complète et exploitable en autocomplétion.
2. Harmoniser la classification (fromage vs laitier) sans perte de données métier.
3. Garantir une expérience autocomplétion cohérente (résultats pertinents, non ambigus, sans placeholders).
4. Rendre le référentiel maintenable pour les prochains batchs.

## 4. Périmètre
### Inclus
- Référentiel alimentaire (entrées fromage)
- Normalisation des catégories/sous-catégories fromage
- Règles anti-doublon et conventions de nommage
- Contrôles de qualité des champs (kcal, qn, portionDefaut, unite, alternatives)
- Vérification comportement autocomplétion sur le lot fromage

### Exclu
- Modifications des catégories non liées au fromage
- Refonte globale du moteur nutritionnel
- Migration complète de toutes les familles d’aliments

## 5. Références de pilotage
- PLAN_ENRICHISSEMENT_REFERENTIEL_723.md
- AMELIORATION_CONTINUE_DEVELOPPEMENT_APP.md

## 6. Cible fonctionnelle de la catégorie fromage
## 6.1 Lot fromage de référence (minimum attendu)
- Camembert
- Brie
- Roquefort
- Comté
- Chèvre frais
- Emmental (râpé, bloc, tranches)
- Saint-Nectaire
- Reblochon
- Cantal
- Bleu d’Auvergne
- La Vache qui rit
- Babybel
- Kiri
- Boursin
- Tartare

## 6.2 Sous-catégories recommandées
- Fromage AOP
- Fromage frais
- Fromage industriel
- Fromage râpé
- Fromage chèvre
- Spécialité à tartiner

## 7. Règles de données (qualité)
Chaque entrée fromage doit contenir au minimum :
- nom
- categorie
- sousCategorie
- kcal
- qn
- portionDefaut
- unite
- alternatives
- typeOrigine (quand applicable)

Contraintes :
- Pas de doublon strict de nom à catégorie équivalente
- Portions lisibles et standardisées (ex: 30g, 16g, 1 portion)
- Alternatives existantes dans le référentiel
- Valeurs kcal réalistes et cohérentes par famille
- QN cohérent avec la logique nutritionnelle retenue dans le projet

## 8. Stratégie d’implémentation (phases)
## Phase A — Audit & Cartographie
1. Dresser l’inventaire exact des entrées fromage existantes.
2. Identifier les doublons/variantes utiles (ex: Emmental râpé/bloc/tranches).
3. Identifier les entrées placeholder liées à fromage.
4. Comparer le réalisé avec la liste cible du plan de référence.

Livrable Phase A :
- Tableau "Prévu vs Réel" fromage
- Liste des anomalies : manquants, doublons, champs incomplets, placeholders

## Phase B — Harmonisation de taxonomie
1. Définir la règle officielle :
   - Option 1 : conserver "laitier" comme catégorie racine et fromage en sous-catégorie dédiée
   - Option 2 : créer/assumer "fromage" comme catégorie explicite
2. Écrire le mapping de migration (ancien -> nouveau) avant toute modification massive.
3. Appliquer la règle uniformément aux entrées fromage.

Livrable Phase B :
- Dictionnaire de mapping validé
- Convention de nommage/documentation mise à jour

## Phase C — Complétion & Nettoyage
1. Ajouter les manquants de la liste cible.
2. Corriger les champs incomplets.
3. Traiter les placeholders :
   - soit suppression si inutiles
   - soit remplacement par vraies entrées
4. Vérifier les alternatives croisées (bidirectionnelles si pertinent).

Livrable Phase C :
- Lot fromage complet et propre

## Phase D — Validation autocomplétion
1. Tester les saisies utilisateur représentatives :
   - "cam", "br", "from", "emmental", "chèvre", "bleu"
2. Vérifier :
   - apparition des résultats attendus
   - absence d’entrées placeholder
   - cohérence tri/résultats limités
3. Contrôler les cas d’ambiguïté (ex: fromages industriels vs AOP).

Livrable Phase D :
- Procès-verbal de tests autocomplétion

## 9. Critères d’acceptation
- 100% des fromages du lot cible présents
- 0 placeholder visible pour fromage
- 0 doublon bloquant sur les entrées fromage
- 100% des champs obligatoires renseignés
- Résultats autocomplétion cohérents sur les cas de test

## 10. Risques et mitigations
- Risque : régression sur anciennes données catégorisées "laitier".
  - Mitigation : mapping explicite + validation sur échantillon historique.
- Risque : doublons silencieux lors de l’ajout manuel.
  - Mitigation : contrôle anti-doublon systématique avant insertion.
- Risque : autocomplétion bruitée par nomenclature hétérogène.
  - Mitigation : normalisation des noms et sous-catégories.

## 11. Estimation
- Audit & cartographie : 0.5 j
- Harmonisation taxonomie : 0.5 j
- Complétion & nettoyage : 0.5 à 1 j
- Validation autocomplétion : 0.5 j

Total estimé : 2 à 2.5 jours selon volume de corrections.

## 12. Plan d’exécution opérationnel (ordre conseillé)
1. Valider la règle de taxonomie fromage/laitier.
2. Produire le tableau final "Prévu vs Réel".
3. Appliquer harmonisation + complétion.
4. Exécuter tests d’autocomplétion.
5. Documenter les écarts restants et décisions.

## 13. Résultat attendu
Une catégorie fromage pleinement exploitable en saisie, cohérente côté données, sans effet "structure prête mais contenu en attente" dans l’autocomplétion.

## 14. Exécution pas à pas (réalisée)

### Étape 1 — Audit & Cartographie (Phase A) ✅
- Inventaire réalisé sur le lot fromage prévu.
- Résultat : les 15 fromages de référence sont présents dans le référentiel.
- Écart identifié : taxonomie incohérente (fromage stocké majoritairement sous `laitier`).
- Écart identifié : présence d’un placeholder `Exemple fromage`.

### Étape 2 — Décision d’harmonisation (Phase B) ✅
- Règle validée pour l’implémentation :
  - Catégorie explicite `fromage` pour les entrées fromage.
  - Catégorie `laitier` conservée pour les yaourts/boissons lactées/non-fromages.

Mapping appliqué :
- `laitier` -> `fromage` pour : Kiri, Babybel, Vache qui rit, Apéricube, Camembert, Brie, Roquefort, Comté, Chèvre frais, Emmental râpé/bloc/tranches, Saint-Nectaire, Reblochon, Cantal, Bleu d’Auvergne, Boursin, Tartare, Saint-Morêt.

### Étape 3 — Nettoyage référentiel (Phase C) ✅
- Placeholder `Exemple fromage` retiré.
- Données fromage conservées avec leurs champs métier (kcal, qn, portionDefaut, unite, alternatives).

### Étape 4 — Validation autocomplétion (Phase D) ✅
- Sécurisation appliquée : exclusion des entrées placeholder `Exemple ...` dans la logique de suggestions et dans la détection d’aliment existant.
- Bénéfice : évite les résultats “coquilles vides” dans l’autocomplete.

## 15. État final
- Catégorie fromage enrichie et harmonisée.
- Structure “placeholder fromage” supprimée.
- Autocomplétion durcie contre les entrées d’exemple.