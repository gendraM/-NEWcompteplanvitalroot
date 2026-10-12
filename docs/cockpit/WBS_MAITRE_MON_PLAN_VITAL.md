# Mon Plan Vital — WBS maître / Cockpit

**Version de référence :** 2026-10-12 · **Version :** 1.0 (publiée en branche documentaire GitHub ; non intégrée) · **Référence source :** audit de phase 1 du 2026-10-12.

> Ce cockpit constitue une **photographie documentée** et non un signal que des agents travaillent actuellement. Il n’a pas modifié les branches ni les données.

## 1. Résultat de la phase 2

- **18 domaines**, **53 actions WBS**, **49 branches**, **13 PR historiques**, **8 règles d’alerte** et **6 décisions/arbitrages**.
- Répartition technique : P0 = **11**, P1 = **35**, P2 = **7**. Les priorités ne sont pas des validations produit et ne représentent pas des engagements de calendrier.
- Aucun pourcentage d’avancement inventé. Le statut du code, de l’intégration et du test est séparé.
- Les propriétaires de conversations listés sont **historiques**, non des agents confirmés actifs.
- Les relevés de phase 1 n'ont pas modifié le code. La publication des documents de phase 2 utilise uniquement `cockpit-wbs-phase2` ; aucun merge, migration ou déploiement.

## 2. Règle de reprise de l’existant

1. **Ne pas demander** à l’utilisatrice de clôturer les anciens chantiers avant le cockpit.
2. **Garder** les branches existantes comme archives de fonctionnalités; ne pas les supprimer ni les reset.
3. **Qualifier** chaque différence via patch/code réel plutôt que les nombres ahead/behind.
4. **Identifier** les actions déjà reprises dans la consolidation, les doublons et les lacunes réelles.
5. **Mandater** les travaux restants par fiche WBS, sur branche isolée et sans double écriture avec l’ancien chantier.
6. **Ne solliciter** la responsable produit que pour concept nouveau, conflit non réconciliable, suppression, décision sensible, production/merge autorisé.

## 3. Hiérarchie des 18 domaines

| Code | Domaine | Ancien responsable (historique) | Fiches |
|---|---|---|---:|
| `GOV` | Gouvernance du cockpit | Présente conversation — Cockpit Mon Plan Vital (pilote de conception, non exécutant permanent) | 5 |
| `SEC` | Sécurité et droits d’accès | Non attribué — supervision sécurité / intégration | 5 |
| `INT` | Intégration et non-régression | MAIN CONSO/Chat ; Archives/Gestion consolidation vers Main/Work | 5 |
| `AUTH` | Authentification, profil et poids | Chantiers Supabase/Auth historiques — conversation active inconnue | 1 |
| `FOOD` | Suivi alimentaire et repas | État des lieux persistance repas/Work ; chantier Plan alimentaire intelligent | 2 |
| `PLAN` | Plan alimentaire, planification et recettes | Conversations Planification / lot 2.3 ; planification-gamification | 5 |
| `REF` | Référentiel, QN et calories | Chantier Référentiel alimentaire — titre exact/activité non certifiés | 2 |
| `EXTRA` | Extras et constance | Suite/Extras/Work | 2 |
| `FF` | Fast-food | Audit gestion fast food | 2 |
| `IDEAUX` | Idéaux et paliers | Work/ chantier IDÉAUX | 4 |
| `ALIGN` | My Way et Align-Life | Validation P5.4 Align-Life (strictement distinct d’Idéaux) | 3 |
| `DEFIS` | Défis V2 | Conversation spécialisée Défis V2 — identification exacte non vérifiée | 4 |
| `DASH` | Tableau de bord V2 | Chantier tableau de bord V2 — conversation exacte non vérifiée | 2 |
| `PER` | Interruptions et reconstitution | État des lieux persistance repas/Work ; gestion des périodes | 2 |
| `JEUNE` | Préparation et jeûne | Conversations Jeûne / Préparation — propriétaires historiques multiples | 3 |
| `REPRISE` | Reprise alimentaire | Conversations Reprise alimentaire — propriétaires historiques multiples | 2 |
| `CRIST` | Cristallisation | Conversations Cristallisation — historique partiel | 2 |
| `BILAN` | Bilans hebdomadaires et mensuels | Chantiers Bilan hebdo / Bilan mensuel — propriétaire actuel inconnu | 2 |

## 4. État de référence / contraintes

- `main` = `7cd9ed91310e3e5288504b089083e02b0944af44` ; `main-consolidation` = `23f27e3b59f0ea6a3e3f987a1c433602a0fba6bb`.
- Ne jamais assimiler Vercel READY à READY métier : l’un valide la construction, l’autre exige tests UX et données.
- `main-consolidation` est la référence de comparaison, pas une autorisation d’y fusionner.
- Idéaux et Align-Life ont deux propriétaires et deux périmètres distincts : signaler une rupture de contrat au lieu de toucher à l’autre branche.
- Aucune suppression de données, code, ancienne branche, PR, fonctionnalité ou historique sans accord explicite.
- Sécurité `SEC-01` (fichier .env) et `SEC-02` (RLS) traitées comme risques P0 sous audit préalable.

## 5. Registre exécutable des actions

Lecture : **A** = audit non destructif / documentation autonome ; **B** = réalisation technique sur périmètre autorisé ; **C** = intervention soumise à validation explicite.
Les actions codées À TESTER peuvent avoir été réalisées dans une branche différente; cela ne certifie pas la conformité de `main-consolidation`.

### GOV — Gouvernance du cockpit

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-GOV-01` | P0 | Constituer le WBS, registres et règles de passage | À TESTER | HORS GITHUB | B | **OUI** |
| `MPV-GOV-02` | P0 | Établir les responsabilités et le protocole de passation | À QUALIFIER | NON APPLICABLE | A | Non à ce stade |
| `MPV-GOV-03` | P0 | Publier registre partagé isolé sur GitHub | À PRODUIRE | NON INTÉGRÉ | C | **OUI** |
| `MPV-GOV-04` | P1 | Synchroniser les changements des chantiers avec le WBS | CONCEPTION | NON APPLICABLE | B | Non à ce stade |
| `MPV-GOV-05` | P1 | Préparer alertes et synthèses automatiques par exception | CONCEPTION | NON APPLICABLE | B | Non à ce stade |

**Dépendances et READY :**

- **`MPV-GOV-01`** — WBS complet, métadonnées, risques, dépendances et règles cohérents et acceptés. Dépendances : Aucune bloquante identifiée.
- **`MPV-GOV-02`** — Chaque domaine a un propriétaire historique, un exécutant confirmé ou inconnu, une méthode de reprise et une interdiction de double écriture. Dépendances : `MPV-GOV-01`.
- **`MPV-GOV-03`** — Fichiers WBS/versionnés accessibles aux agents, HEAD vérifié, aucune modification de main/main-consolidation, PR draft si autorisée. Dépendances : `MPV-GOV-01`, `MPV-GOV-02`.
- **`MPV-GOV-04`** — À chaque livraison : commit, PR, preuves CI, déploiement, écarts, risques et décision en attente inscrits dans registre. Dépendances : `MPV-GOV-03`.
- **`MPV-GOV-05`** — Chaque alerte a niveau, cause, lien source, impact, action attendue ; aucun faux message de succès. Dépendances : `MPV-GOV-03`, `MPV-INT-01`.

### SEC — Sécurité et droits d’accès

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-SEC-01` | P0 | Auditer le fichier .env.local suivi par Git sans exposer ses valeurs | À QUALIFIER | NON APPLICABLE | A | **OUI** |
| `MPV-SEC-02` | P0 | Analyser droits Supabase anonymes et plan de correction RLS | À QUALIFIER | NON APPLICABLE | C | **OUI** |
| `MPV-SEC-03` | P0 | Proposer protections des branches et clarification branche par défaut | À PRODUIRE | NON APPLICABLE | C | **OUI** |
| `MPV-SEC-04` | P1 | Réexaminer contrôle d’accès et données antérieures de l’auth | À QUALIFIER | PARTIEL/INCONNU | B | Non à ce stade |
| `MPV-SEC-05` | P1 | Qualifier la PR CVE historique et les versions réellement déployées | À QUALIFIER | NON INTÉGRÉ | A | Non à ce stade |

**Dépendances et READY :**

- **`MPV-SEC-01`** — Déterminer présence de secrets et historique d’exposition sans publier les valeurs ; procédure de rotation/assainissement validée avant exécution. Dépendances : Aucune bloquante identifiée.
- **`MPV-SEC-02`** — Risque d’exposition et usages existants cartographiés, plan de sauvegarde et compatibilité, remédiation uniquement après GO utilisateur. Dépendances : Aucune bloquante identifiée.
- **`MPV-SEC-03`** — Politique branch protection et règles de PR documentées et validées, aucun changement avant accord. Dépendances : Aucune bloquante identifiée.
- **`MPV-SEC-04`** — Couverture read/write user_id, tests multi-comptes et plan de restauration sans perte ; aucune donnée personnelle divulguée. Dépendances : `MPV-SEC-02`.
- **`MPV-SEC-05`** — Comparer versions packages production/consolidation, advisories, tests et risque de changement de dépendance. Dépendances : Aucune bloquante identifiée.

### INT — Intégration et non-régression

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-INT-01` | P0 | Tenir miroir des SHA main, main-consolidation et déploiements | À TESTER | ÉCART 171 COMMITS | A | Non à ce stade |
| `MPV-INT-02` | P0 | Cartographier les deltas réels indépendamment des PR historiques | À QUALIFIER | DIVERGENCES | A | Non à ce stade |
| `MPV-INT-03` | P0 | Définir une chaîne intégration additive et QA indépendante | À PRODUIRE | EN CADRAGE | C | **OUI** |
| `MPV-INT-04` | P1 | Cartographier les projets Vercel et URL canoniques | À QUALIFIER | NON APPLICABLE | A | Non à ce stade |
| `MPV-INT-05` | P1 | Rendre la CI de référence vérifiable avant intégration | À QUALIFIER | NON APPLICABLE | B | Non à ce stade |

**Dépendances et READY :**

- **`MPV-INT-01`** — Rapport horodaté avec SHA des refs, Vercel project, target, preview READY, état production. Dépendances : Aucune bloquante identifiée.
- **`MPV-INT-02`** — Un tableau par PR/fonction : déjà présent, manquant, conflit, remplacé volontairement ou régression suspectée. Dépendances : `MPV-INT-01`.
- **`MPV-INT-03`** — Aucune suppression/réécriture historique/merge sans autorisation ; contrôles independent et traçabilité. Dépendances : `MPV-GOV-01`.
- **`MPV-INT-04`** — Référence explicite projet/branche/environnement/test, liens stables distingués des déploiements immuables. Dépendances : `MPV-INT-01`.
- **`MPV-INT-05`** — Chaque candidat donne résultats datés, SHA correspondant, scénarios vérifiés, verdict prêt/non prêt. Dépendances : `MPV-GOV-04`, `MPV-REF-01`.

### AUTH — Authentification, profil et poids

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-AUTH-01` | P1 | Valider la propriété des données utilisateur et la restauration de l’historique | À QUALIFIER | PRÉSENT CONSO | B | Non à ce stade |

**Dépendances et READY :**

- **`MPV-AUTH-01`** — Tests authentifiés multi-compte + conservation données anciennes + réouverture session. Dépendances : `MPV-SEC-02`, `MPV-SEC-04`.

### FOOD — Suivi alimentaire et repas

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-FOOD-01` | P1 | Vérifier l’unicité de sauvegarde des repas mono et multi-aliments | À TESTER | SOUTENU EN CONSO | B | Non à ce stade |
| `MPV-FOOD-02` | P1 | Vérifier la lecture des repas dans statistiques et bilans | À QUALIFIER | PARTIEL/INCONNU | B | Non à ce stade |

**Dépendances et READY :**

- **`MPV-FOOD-01`** — Chaque chemin persiste une fois, retourne succès réel, rafraîchit suivi, préserve historique, contrôle échec et authentification. Dépendances : `MPV-AUTH-01`.
- **`MPV-FOOD-02`** — Tests sur mono/multi, repas composés et données historiques sans double comptage. Dépendances : `MPV-FOOD-01`, `MPV-BILAN-01`.

### PLAN — Plan alimentaire, planification et recettes

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-PLAN-01` | P1 | Qualifier et intégrer la branche plan alimentaire intelligent | À TESTER | NON INTÉGRÉ EN TOTALITÉ | B | Non à ce stade |
| `MPV-PLAN-02` | P1 | Qualifier le planning 7/15 jours et les gestes mobiles | À QUALIFIER | NON CERTIFIÉ | B | Non à ce stade |
| `MPV-PLAN-03` | P1 | Vérifier le socle de liste de courses générale | À TESTER | ANCÊTRE DE CONSO | B | Non à ce stade |
| `MPV-PLAN-04` | P2 | Concevoir les ajustements intelligents et le coût réel des courses | CONCEPTION | NON INTÉGRÉ | C | **OUI** |
| `MPV-PLAN-05` | P2 | Qualifier gamification « composer → expérimenter → observer » | À QUALIFIER | NON CERTIFIÉ | B | Non à ce stade |

**Dépendances et READY :**

- **`MPV-PLAN-01`** — Delta non régressif, CI verte, test mobile authentifié, contrôle de la persistance. Dépendances : `MPV-REF-01`, `MPV-FOOD-01`, `MPV-INT-02`.
- **`MPV-PLAN-02`** — Cycle mobile 7 jours/15 jours, modification et relecture après actualisation, aucun conflit d’enregistrement. Dépendances : `MPV-PLAN-01`.
- **`MPV-PLAN-03`** — Repas modifiés reflétés dans liste, quantités non inventées et anciennes lignes lisibles. Dépendances : `MPV-PLAN-01`.
- **`MPV-PLAN-04`** — Points d’ajustement non culpabilisants, coût mesurable explicite, action facultative. Dépendances : `MPV-PLAN-03`.
- **`MPV-PLAN-05`** — Contrat des moteurs réutilisé, propositions facultatives, tests du parcours et UX. Dépendances : `MPV-PLAN-02`, `MPV-DEFIS-01`.

### REF — Référentiel, QN et calories

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-REF-01` | P0 | Diagnostiquer le test 616 attendu contre 674 observés | À QUALIFIER | NON APPLICABLE | A | Non à ce stade |
| `MPV-REF-02` | P1 | Consolider QN, portions et rôles d’assiette | À QUALIFIER | DIVERGENT | B | Non à ce stade |

**Dépendances et READY :**

- **`MPV-REF-01`** — Déterminer si attente figée ou corruption référentiel ; proposer test robuste et recontrôle CI. Dépendances : Aucune bloquante identifiée.
- **`MPV-REF-02`** — Tests des aliments, valeurs et dédoublonnage, compatibilité avec la gamification. Dépendances : `MPV-REF-01`.

### EXTRA — Extras et constance

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-EXTRA-01` | P1 | Certifier la constance Extras déjà intégrée | À TESTER | INTÉGRÉ EN CONSO | B | Non à ce stade |
| `MPV-EXTRA-02` | P1 | Qualifier la meilleure période de constance (PR #10) | À TESTER | PAS FUSIONNÉ | B | Non à ce stade |

**Dépendances et READY :**

- **`MPV-EXTRA-01`** — Calcul lunes-dimanches, régression 3 semaines, historiques, badge unique, RLS, navigation mobile. Dépendances : Aucune bloquante identifiée.
- **`MPV-EXTRA-02`** — Best streak correcte au palier, sans inventer de semaines manquantes, non-régression des badges. Dépendances : `MPV-EXTRA-01`, `MPV-INT-02`.

### FF — Fast-food

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-FF-01` | P1 | Contrôler le délai Fast-food 21/30/45/personnalisé | À QUALIFIER | NON CONSOLIDÉ | B | Non à ce stade |
| `MPV-FF-02` | P1 | Raccorder le délai aux vues RepasBloc et tableau de bord | À PRODUIRE | NON CONSOLIDÉ | B | Non à ce stade |

**Dépendances et READY :**

- **`MPV-FF-01`** — Options et enregistrement validés, dates exactes sans ambiguïté, historique inchangé. Dépendances : Aucune bloquante identifiée.
- **`MPV-FF-02`** — Même valeur calculée dans RepasBloc, dashboard et historique, test de période 21/30/45/personnalisé. Dépendances : `MPV-FF-01`, `MPV-DASH-01`.

### IDEAUX — Idéaux et paliers

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-IDEAUX-01` | P0 | Réconcilier les PR #12/#13 avec Idéaux déjà dans conso | À QUALIFIER | INTÉGRATION PARTIELLE | B | Non à ce stade |
| `MPV-IDEAUX-02` | P1 | Rejouer les scénarios séances déplacées et sauvegarde | À TESTER | PARTIEL | B | Non à ce stade |
| `MPV-IDEAUX-03` | P1 | Vérifier paliers adaptatifs et longue interruption | À TESTER | PARTIEL | B | Non à ce stade |
| `MPV-IDEAUX-04` | P2 | Qualifier le défloutage de l’image motivante | À QUALIFIER | INCONNU | A | Non à ce stade |

**Dépendances et READY :**

- **`MPV-IDEAUX-01`** — Comparatif fonction par fonction, conflits et tests, aucune perte dans conso ni Idéaux. Dépendances : `MPV-INT-02`, `MPV-INT-03`.
- **`MPV-IDEAUX-02`** — Test sur le même jour, autre jour, réouverture, palier arrivé à terme, aucune double séance. Dépendances : `MPV-IDEAUX-01`.
- **`MPV-IDEAUX-03`** — Règles de reprise, statistiques, bilan, adaptation cohérentes après mois sans saisie. Dépendances : `MPV-IDEAUX-02`.
- **`MPV-IDEAUX-04`** — Comparer code actuel et besoin validé et consigner résultat ; aucune modification Align-Life. Dépendances : `MPV-IDEAUX-02`.

### ALIGN — My Way et Align-Life

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-ALIGN-01` | P1 | Valider P5/P5.1/P5.2 Align-Life sur branche et runtime | À TESTER | NON CONSOLIDÉ | B | Non à ce stade |
| `MPV-ALIGN-02` | P1 | Préparer intégration Align-Life sans modifier Idéaux | À QUALIFIER | NON CONSOLIDÉ | B | Non à ce stade |
| `MPV-ALIGN-03` | P2 | Cadrer le GROW comportemental | CONCEPTION | NON INTÉGRÉ | C | **OUI** |

**Dépendances et READY :**

- **`MPV-ALIGN-01`** — Test mobile My Way complet, données suffisantes/insuffisantes, aucun questionnaire imposé. Dépendances : Aucune bloquante identifiée.
- **`MPV-ALIGN-02`** — Comparatif fonctionnel et technique, passerelle avec données Idéaux validées ; isolation des périmètres. Dépendances : `MPV-ALIGN-01`, `MPV-IDEAUX-02`.
- **`MPV-ALIGN-03`** — Concept proposé, cas admissibles et non-intervention, validation explicite de vision. Dépendances : `MPV-ALIGN-02`.

### DEFIS — Défis V2

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-DEFIS-01` | P1 | Vérifier moteur DURATION vs OCCURRENCES | À TESTER | NON FUSIONNÉ | B | Non à ce stade |
| `MPV-DEFIS-02` | P1 | Vérifier migrations, RLS et isolation du moteur | À QUALIFIER | PARTIEL | B | Non à ce stade |
| `MPV-DEFIS-03` | P1 | Préparer intégration PR #9 additive et non destructive | À PRODUIRE | CONFLITS | C | **OUI** |
| `MPV-DEFIS-04` | P2 | Cadrer moteur de suggestions de défis utiles | CONCEPTION | NON INTÉGRÉ | C | **OUI** |

**Dépendances et READY :**

- **`MPV-DEFIS-01`** — Scénarios structurés automatiques et manuels sans badge infondé, test multi-utilisateur. Dépendances : Aucune bloquante identifiée.
- **`MPV-DEFIS-02`** — Rapport de compatibilité données, backup/rollback et absence de fuite ou duplication. Dépendances : `MPV-SEC-02`, `MPV-DEFIS-01`.
- **`MPV-DEFIS-03`** — Tests complets, déploiement READY, accord explicite avant merge. Dépendances : `MPV-DEFIS-01`, `MPV-DEFIS-02`, `MPV-INT-03`.
- **`MPV-DEFIS-04`** — Critères fonctionnels, exclusions, bénéfice utilisateur validés. Dépendances : `MPV-DEFIS-03`.

### DASH — Tableau de bord V2

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-DASH-01` | P1 | Vérifier sources métier canoniques du dashboard | À QUALIFIER | NON INTÉGRÉ | B | Non à ce stade |
| `MPV-DASH-02` | P1 | Conserver les deux niveaux Vue principale / Détails | À TESTER | NON INTÉGRÉ | B | Non à ce stade |

**Dépendances et READY :**

- **`MPV-DASH-01`** — Cartographie source/date/période + données insuffisantes = neutre, test cross-module. Dépendances : `MPV-IDEAUX-02`, `MPV-EXTRA-01`, `MPV-DEFIS-01`.
- **`MPV-DASH-02`** — Mobile lisible, pas de perte de fonctionnalité, indicateurs dynamiques pertinents. Dépendances : `MPV-DASH-01`.

### PER — Interruptions et reconstitution

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-PER-01` | P1 | Valider PR #8 reconstitution des interruptions | À TESTER | NON FUSIONNÉ | B | Non à ce stade |
| `MPV-PER-02` | P1 | Raccorder les périodes estimées aux bilans | À QUALIFIER | PARTIEL/INCONNU | B | Non à ce stade |

**Dépendances et READY :**

- **`MPV-PER-01`** — Persistance, réouverture, zéro double période, contrôles sur dates historiques. Dépendances : `MPV-FOOD-01`.
- **`MPV-PER-02`** — Bilans mensuels différencient estimé/observé, aucune valeur fictive générée. Dépendances : `MPV-PER-01`, `MPV-BILAN-02`.

### JEUNE — Préparation et jeûne

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-JEUNE-01` | P1 | Réévaluer le fonctionnement préparation → jeûne | À QUALIFIER | DANS CONSO | B | Non à ce stade |
| `MPV-JEUNE-02` | P1 | Consolider fin de jeûne vers reprise | À QUALIFIER | DANS CONSO | B | Non à ce stade |
| `MPV-JEUNE-03` | P2 | Maintenir la séparation Journal spirituel / My Way | À TESTER | SOUTENU EN CONSO | A | Non à ce stade |

**Dépendances et READY :**

- **`MPV-JEUNE-01`** — Scénarios transitions et plusieurs durées, état repris après nouvelle session. Dépendances : `MPV-AUTH-01`, `MPV-SEC-02`.
- **`MPV-JEUNE-02`** — Fin du parcours sans perte de données, ouverture de la reprise attendue. Dépendances : `MPV-JEUNE-01`, `MPV-REPRISE-01`.
- **`MPV-JEUNE-03`** — Navigation et données ne sont ni dupliquées ni confondues. Dépendances : `MPV-JEUNE-01`, `MPV-ALIGN-01`.

### REPRISE — Reprise alimentaire

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-REPRISE-01` | P1 | Réévaluer les cinq phases selon les règles métier d’août | À QUALIFIER | DANS CONSO | B | Non à ce stade |
| `MPV-REPRISE-02` | P1 | Garantir persistance repas/bilan et transmission cristallisation | À QUALIFIER | DANS CONSO | B | Non à ce stade |

**Dépendances et READY :**

- **`MPV-REPRISE-01`** — Contenu par phase, jours, portions et bilan vérifiés, dates et états cohérents. Dépendances : `MPV-AUTH-01`.
- **`MPV-REPRISE-02`** — 5 phases, reprises après interruption, bilan et passage au parcours suivant testés. Dépendances : `MPV-REPRISE-01`, `MPV-FOOD-01`.

### CRIST — Cristallisation

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-CRIST-01` | P1 | Requalifier l’existant Cristallisation sans suivre les vieux TODO | À QUALIFIER | DANS CONSO | A | Non à ce stade |
| `MPV-CRIST-02` | P2 | Cadrer génération dynamique des critères et suivi 45 jours | CONCEPTION | NON QUALIFIÉ | C | **OUI** |

**Dépendances et READY :**

- **`MPV-CRIST-01`** — État réellement codé/migré/testé ; critères dynamiques manquants identifiés par preuves. Dépendances : `MPV-SEC-02`, `MPV-REPRISE-02`.
- **`MPV-CRIST-02`** — Règles métier explicitement validées, transitions et données vérifiables. Dépendances : `MPV-CRIST-01`.

### BILAN — Bilans hebdomadaires et mensuels

| ID | Priorité | Action / résultat attendu | État travail | Intégration | Mode | Décision |
|---|---|---|---|---|---|---|
| `MPV-BILAN-01` | P1 | Qualifier le bilan hebdomadaire / validations semaine | À QUALIFIER | DANS CONSO | B | Non à ce stade |
| `MPV-BILAN-02` | P1 | Qualifier le bilan mensuel et ses déclencheurs | À QUALIFIER | DANS CONSO | B | Non à ce stade |

**Dépendances et READY :**

- **`MPV-BILAN-01`** — Tests semaine complète/incomplète, anciens enregistrements, rapport fidèle. Dépendances : `MPV-FOOD-01`, `MPV-EXTRA-01`.
- **`MPV-BILAN-02`** — Mois sans saisie, période historique, navigation retour, pas de nouvelle demande si déjà enregistré. Dépendances : `MPV-BILAN-01`, `MPV-PER-01`.

## 6. Matrice PR → chantiers

| PR | Thème | État constaté | Destination |
|---:|---|---|---|
| [#1](https://github.com/gendraM/-NEWcompteplanvitalroot/pull/1) | Reprise jeûne | FUSIONNÉE | `main` |
| [#2](https://github.com/gendraM/-NEWcompteplanvitalroot/pull/2) | Migration user_id (documentation) | DRAFT OUVERTE | `AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS` |
| [#3](https://github.com/gendraM/-NEWcompteplanvitalroot/pull/3) | Template Copilot | DRAFT OUVERTE | `AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS` |
| [#4](https://github.com/gendraM/-NEWcompteplanvitalroot/pull/4) | CVE | DRAFT OUVERTE | `AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS` |
| [#5](https://github.com/gendraM/-NEWcompteplanvitalroot/pull/5) | Reprise intelligente | DRAFT OUVERTE | `AVANCEMENT-IDEAUX-/TBS-OBJECTIF-POIDS` |
| [#6](https://github.com/gendraM/-NEWcompteplanvitalroot/pull/6) | Extras conformité | FUSIONNÉE | `main-consolidation` |
| [#7](https://github.com/gendraM/-NEWcompteplanvitalroot/pull/7) | Extras constance | FUSIONNÉE | `main-consolidation` |
| [#8](https://github.com/gendraM/-NEWcompteplanvitalroot/pull/8) | Interruptions | DRAFT OUVERTE | `main-consolidation` |
| [#9](https://github.com/gendraM/-NEWcompteplanvitalroot/pull/9) | Défis V2 | DRAFT OUVERTE — CONFLITS | `main-consolidation` |
| [#10](https://github.com/gendraM/-NEWcompteplanvitalroot/pull/10) | Extras meilleure constance | DRAFT OUVERTE | `main-consolidation` |
| [#11](https://github.com/gendraM/-NEWcompteplanvitalroot/pull/11) | Preview Extras | FUSIONNÉE | `extras-constance-recente` |
| [#12](https://github.com/gendraM/-NEWcompteplanvitalroot/pull/12) | Idéaux paliers | DRAFT OUVERTE — CONFLITS | `main-consolidation` |
| [#13](https://github.com/gendraM/-NEWcompteplanvitalroot/pull/13) | Idéaux delta adaptatif | DRAFT OUVERTE — CONFLITS | `main-consolidation` |

## 7. Alertes initiales

| ID | Priorité | Signal | Action |
|---|---|---|---|
| `ALERT-SEC-01` | P0 | Présence de secret plausible dans historique public Git; NE PAS afficher de valeurs | Audit discret, déterminer rotation/assainissement, demande GO avant modification |
| `ALERT-SEC-02` | P0 | Table propriétaire accessible via rôle anon alors que RLS désactivée | Analyse d’impact, plan rollback, GO explicite avant toute DDL |
| `ALERT-INT-01` | P0 | PR conflictuelle, suppression, réécriture de données, ou contrat métier incompatible | STOP ciblé et rapport de conflit, aucune résolution destructive sans autorisation |
| `ALERT-INT-02` | P1 | Nouvel échec de test/build ou test obsolète sur branche en attente | Identifier job/SHA/test et proposer correction ciblée, ne pas supprimer de données |
| `ALERT-INT-03` | P1 | Déploiement READY absent ou SHA Vercel différent du HEAD cible | Rapport branch/SHA cible, attendre READY correct avant QA |
| `ALERT-WBS-01` | P1 | Commit/PR sans propriétaire, critères READY, rapport ou dépendance | Mettre en quarantaine administrative la livraison jusqu’à clarification |
| `ALERT-WBS-02` | P1 | Deux agents prétendent écrire simultanément les mêmes fichiers/branche | STOP les écritures concurrentes ; identifier propriétaire canonique |
| `ALERT-UX-01` | P1 | PR prête au merge sans test utilisateur requis ou avec preuve de build seule | Marquer À TESTER et demander preuve correspondante |

## 8. Conditions de diffusion du cockpit

- Ce WBS devient réellement inter-agents lorsqu’il est publié dans un espace central stable et que les exécutants acceptent de mettre leurs passations à jour.
- La création d’une branche documentaire et un commit GitHub sont **en attente d’accord explicite** selon tes règles historiques.
- Aucun agent ne peut recevoir un message depuis ce chat par magie ; il doit lire la fiche commune ou recevoir une tâche Work/Codex rattachée à GitHub.

## 9. Jalons d’activation

1. **Phase 2 locale (fait)** : fiches, dépendances, niveaux de délégation, alertes et décisions rédigés.
2. **Publication centrale (non fait)** : branche GitHub isolée + vérification SHA + PR documentaire draft, uniquement sur autorisation.
3. **Phase 3 (non faite)** : affectation des agents Codex/Work, autorisations d’exécution à portée limitée.
4. **Phase 4 (non faite)** : remontées d’événements, alertes et rapports récurrents.

## 10. Liens et preuves

- [Audit phase 1](https://github.com/gendraM/-NEWcompteplanvitalroot/tree/main-consolidation) : rapport local joint séparément.
- [GitHub PR](https://github.com/gendraM/-NEWcompteplanvitalroot/pulls) ; [Actions](https://github.com/gendraM/-NEWcompteplanvitalroot/actions) ; [Branches](https://github.com/gendraM/-NEWcompteplanvitalroot/branches).
- Source structurée : `REGISTRE_COCKPIT_MPV.json` (états détaillés, SHAs, historiques, dépendances).
