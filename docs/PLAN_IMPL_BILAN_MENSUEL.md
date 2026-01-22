# 🟢 PLAN D'IMPLÉMENTATION — Bilan Mensuel

**Date création :** 21 janvier 2026  
**Statut :** ⏳ À valider par utilisateur  
**Priorité :** 🟡 Moyenne (fonctionnalité future)

---

## Titre de la tâche  
Créer système de bilan mensuel avec vision macro-tendances et projection mois suivant

---

## **Description précise de la modification attendue**

### Objectif
Implémenter un bilan mensuel automatique qui s'affiche après validation de la dernière semaine du mois, offrant une vision macro (tendances, patterns, projection) complémentaire aux bilans hebdomadaires détaillés.

### Fonctionnalités attendues

**1. Détection automatique fin de mois**
- Identifier quand validation semaine = dernière du mois
- Logique : Si lundi suivant est dans mois suivant → déclencher bilan mensuel
- Fonctionne quel que soit jour fin de mois (28, 29, 30, 31)

**2. Pop-up notification**
- Après validation bilan hebdo dernière semaine
- Message : "Bravo ! Ton bilan mensuel de [Mois] est maintenant disponible"
- Bouton : "Voir mon bilan du mois"

**3. Modale bilan mensuel (6 sections)**
- Section 1 : Tendance Poids & Objectif (évolution, trajectoire, projection)
- Section 2 : Budget Calorique Mensuel (total consommé vs budget, répartition repas/extras)
- Section 3 : Patterns Comportementaux (forces, points amélioration, insights temporels)
- Section 4 : Qualité Nutritionnelle Globale (répartition QN, progression vs N-1)
- Section 5 : Ressenti & Bien-être (humeur/satiété agrégés, identification semaines critiques)
- Section 6 : Projection Mois Prochain (objectifs, ajustements stratégiques, points contrôle)

**4. Accès bilan hebdo depuis bilan mensuel**
- Lien/bouton : "Consulter aussi : Bilan détaillé de la semaine X"
- Permet navigation entre vision macro (mensuel) et micro (hebdo)

**5. Historique bilans mensuels**
- Archivage bilans mensuels précédents
- Consultation mois antérieurs (janvier, décembre, novembre...)
- Comparaison N vs N-1 possible

### Approche technique validée

**Option A : Semaines fixes + Filtrage date précis**
- Validation hebdo : Toujours dimanche (ex: S4 = 27 janv - 2 fév)
- Stats mensuelles : Filtrage par date calendaire exacte (1er-31 janvier)
- Pas de semaines courtes, cohérence statistique garantie
- Simplicité UX : Routine validation claire pour utilisateur

---

## **Fichiers concernés**

### Fichiers à créer
- `/components/BilanMensuelModal.js` (nouveau composant modale)
- `/components/PopupBilanMensuel.js` (nouveau composant pop-up notification)
- `/lib/calculsBilanMensuel.js` (fonctions agrégation stats mensuelles)
- `/lib/detectionFinMois.js` (logique détection dernière semaine)

### Fichiers à modifier
- `/pages/suivi.js` (intégration détection + déclenchement pop-up)
- `/lib/validationSemaine.js` (ajout fonction `estDerniereValidationDuMois`)
- `/components/BilanHebdoModal.js` (ajout lien accès depuis bilan mensuel)

### Fichiers à consulter
- `/lib/routeurPoids.js` (calculs BMR/TDEE/objectifs)
- `/data/referentiel.js` (scores QN pour agrégation)

---

## Etape 1 — **Audit des risques préalable**

**Date audit :** 21/01/2026  
**Auditeur :** Copilot + Utilisateur  
**Nombre total risques identifiés :** 24

---

### 🔴 Risques techniques (10 risques)

**1. Performance base de données - Requêtes agrégation**
- **Gravité :** 🔴 CRITIQUE
- **Probabilité :** 🟠 MOYENNE (60%)
- **Risque :** Requête agrégation 30 jours (93 repas) peut être lente, surtout si utilisateur a 4-5 repas/jour (120-150 repas/mois)
- **Impact :** Chargement bilan mensuel > 3 secondes → Utilisateur pense que app freeze
- **Détection :** Tests performance avec dataset 150 repas
- **Mitigation préventive :** 
  - Indexation colonne `date` table `repas_reels` (CREATE INDEX)
  - Indexation composite `(user_id, date)` pour filtrage optimisé
  - Pagination requêtes (charger par semaine)
  - Mise en cache résultats (1h validity)
- **Mitigation curative :** Affichage progressif sections (skeleton loader)
- **Coût mitigation :** 2h (création index + tests)

**2. Calculs statistiques complexes - Données manquantes**
- **Gravité :** 🟠 HAUTE
- **Probabilité :** 🟠 MOYENNE (50%)
- **Risque :** Calcul mode statistique (humeur dominante), médiane, patterns temporels peuvent crasher avec données nulles/incomplètes
- **Impact :** Affichage données incohérentes, erreurs runtime (Cannot read property of undefined)
- **Scénarios critiques :**
  - Aucun repas avec humeur saisie → `humeurDominante = null`
  - 1 seul repas ce mois → Pas de patterns détectables
  - Tous extras au même moment → Division par zéro calcul répartition
- **Détection :** Tests unitaires avec datasets incomplets (0, 1, 5, 10, 30 repas)
- **Mitigation préventive :**
  - Validation données avant calcul (`if (!array || array.length === 0) return null`)
  - Valeurs par défaut systématiques
  - Try/catch autour calculs statistiques
  - Messages explicites "Données insuffisantes pour ce mois"
- **Mitigation curative :** Fallback sur message pédagogique au lieu de section vide
- **Coût mitigation :** 3h (gestion cas limites + tests)

**3. Chevauchement semaine/mois - Double comptage**
- **Gravité :** 🔴 CRITIQUE
- **Probabilité :** 🔴 ÉLEVÉE (80%)
- **Risque :** Semaine 4 (27 janv - 2 fév) : 5 jours en janvier, 2 en février → Double comptage repas dans stats janvier ET février
- **Impact :** Stats mensuelles faussées (budget consommé incorrect, QN moyen erroné)
- **Exemple concret :**
  - Repas 1er février compté dans S4 janvier (bilan hebdo)
  - Même repas compté dans février (bilan mensuel)
  - Résultat : Utilisateur voit 2× même repas dans budgets
- **Détection :** Tests avec semaines chevauchantes (fin janvier, fin février)
- **Mitigation préventive :**
  - Filtrage strict par date calendaire (WHERE date BETWEEN '2026-01-01' AND '2026-01-31')
  - Tests unitaires vérification aucun doublon
  - Logs détaillés comptage repas
- **Mitigation curative :** Script détection doublons + correction rétroactive
- **Coût mitigation :** 2h (filtrage strict + tests)

**4. Synchronisation états React - Conflits modales**
- **Gravité :** 🟠 HAUTE
- **Probabilité :** 🟡 FAIBLE (30%)
- **Risque :** Pop-up s'affiche avant fermeture complète modale hebdo → Modales superposées, scroll bloqué
- **Impact :** UX dégradée, utilisateur ne peut pas fermer ni l'une ni l'autre
- **Détection :** Tests manuels enchaînement validation hebdo → pop-up
- **Mitigation préventive :**
  - setTimeout 500ms après fermeture modale hebdo
  - État global `isModalOpen` pour bloquer ouverture simultanée
  - Z-index cohérents (hebdo: 1000, mensuel: 1001, pop-up: 1002)
- **Mitigation curative :** Bouton "Forcer fermeture" si détection conflit
- **Coût mitigation :** 1h (gestion états + tests)

**5. Détection fin mois - Faux positifs**
- **Gravité :** 🟠 HAUTE
- **Probabilité :** 🟠 MOYENNE (40%)
- **Risque :** Fonction `estDerniereValidationDuMois` retourne `true` pour mauvaises semaines (bug logique mois/année)
- **Impact :** Pop-up bilan mensuel affiché en milieu de mois (S2, S3) → Confusion utilisateur
- **Scénarios critiques :**
  - Validation S4 décembre → Détection janvier (changement année non géré)
  - Validation semaine partielle (3 jours au lieu de 7)
  - Validation en retard (10 février, mais semaine janvier)
- **Détection :** Tests unitaires 15 cas (tous mois année, semaines courtes, retards)
- **Mitigation préventive :**
  - Vérification mois ET année dans comparaison
  - Logs détaillés (console.log date détectée)
  - Tests automatisés couvrant 12 mois
- **Mitigation curative :** Désactivation pop-up si incohérence détectée
- **Coût mitigation :** 2h (logique robuste + tests)

**6. Volumétrie données - Gros utilisateurs**
- **Gravité :** 🟡 MOYENNE
- **Probabilité :** 🟡 FAIBLE (20%)
- **Risque :** Utilisateur avec 6 mois+ historique (500+ repas) → Chargement historique très lent
- **Impact :** Section "Historique bilans mensuels" freeze ou timeout
- **Détection :** Tests avec dataset 1000 repas
- **Mitigation préventive :**
  - Pagination historique (3 mois affichés par défaut)
  - Bouton "Charger mois précédents"
  - Limite max requête (6 derniers mois)
- **Mitigation curative :** Message "Chargement historique en cours..."
- **Coût mitigation :** 1h30 (pagination)

**7. Fuseaux horaires - Incohérence dates**
- **Gravité :** 🟡 MOYENNE
- **Probabilité :** 🟡 FAIBLE (10%)
- **Risque :** Utilisateur voyage (changement fuseau horaire) → Dates repas incohérentes (repas 31 janvier devient 1er février)
- **Impact :** Stats mensuelles faussées, repas "perdus"
- **Détection :** Tests avec dates UTC vs locales
- **Mitigation préventive :**
  - Stockage dates en UTC systématiquement
  - Conversion locale uniquement affichage
  - Validation cohérence dates avant calculs
- **Mitigation curative :** Script détection anomalies temporelles
- **Coût mitigation :** 2h (gestion fuseaux)

**8. Migration données anciennes - Incompatibilité format**
- **Gravité :** 🟠 HAUTE
- **Probabilité :** 🟠 MOYENNE (50%)
- **Risque :** Bilans hebdo anciens (format avant migration) non compatibles avec agrégation mensuelle
- **Impact :** Bilan mensuel vide pour mois passés (décembre 2025, novembre 2025)
- **Détection :** Tests avec données anciennes format V1
- **Mitigation préventive :**
  - Script migration format V1 → V2
  - Génération rétroactive bilans mensuels si données disponibles
  - Vérification schéma avant agrégation
- **Mitigation curative :** Message "Bilans mensuels disponibles à partir de janvier 2026"
- **Coût mitigation :** 3h (script migration)

**9. Requêtes Supabase - Rate limiting**
- **Gravité :** 🟡 MOYENNE
- **Probabilité :** 🟡 FAIBLE (15%)
- **Risque :** 6 sections = 6 requêtes agrégation → Dépassement quota Supabase (50 req/min)
- **Impact :** Erreur 429 Too Many Requests, sections vides
- **Détection :** Tests charge (10 utilisateurs simultanés)
- **Mitigation préventive :**
  - Regrouper requêtes (1 seule requête pour toutes sections)
  - Mise en cache résultats côté serveur
  - Retry exponential backoff si 429
- **Mitigation curative :** Message "Trop de connexions, réessaie dans 1 minute"
- **Coût mitigation :** 2h (optimisation requêtes)

**10. Memory leaks React - Composant non démonté**
- **Gravité :** 🟡 MOYENNE
- **Probabilité :** 🟠 MOYENNE (40%)
- **Risque :** Modale ouverte → Requêtes en cours → Fermeture modale → setState sur composant démonté
- **Impact :** Warning console, potentiel memory leak, crash après 10+ ouvertures
- **Détection :** Tests 20 ouvertures/fermetures modale
- **Mitigation préventive :**
  - Cleanup useEffect systématique (`return () => { isMounted = false }`)
  - AbortController pour annuler requêtes
  - Vérification `isMounted` avant setState
- **Mitigation curative :** Logs détection leaks + correction
- **Coût mitigation :** 1h30 (cleanup hooks)

### 🟠 Risques UX (6 risques)

**1. Confusion utilisateur - Différence hebdo/mensuel**
- **Gravité :** 🟠 HAUTE
- **Probabilité :** 🔴 ÉLEVÉE (70%)
- **Risque :** Utilisateur ne comprend pas différence bilan hebdo (micro) vs mensuel (macro)
- **Impact :** Consultation répétée même bilan, incompréhension données, perte de confiance app
- **Scénarios critiques :**
  - Utilisateur cherche détails repas dans bilan mensuel (données agrégées)
  - Utilisateur compare chiffres hebdo vs mensuel sans comprendre périmètre
  - Utilisateur pense que bilan mensuel remplace hebdo
- **Détection :** Tests utilisateurs (5 personnes), feedback session
- **Mitigation préventive :**
  - Message explicatif dans pop-up : "Le bilan mensuel complète les bilans hebdo avec une vision long terme"
  - Section aide "Quelle différence ?" accessible depuis modale
  - Tooltip/icône info sur titre modale
  - Comparaison visuelle (tableau hebdo vs mensuel)
- **🟡 Risques robustesse (5 risques)

**1. Données incomplètes - Mois partiel**
- **Gravité :** 🟠 HAUTE
- **Probabilité :** 🔴 ÉLEVÉE (80%)
- **Risque :** Mois avec seulement 10 jours de données (utilisateur commence app en cours de mois)
- **Impact :** Stats faussées (moyennes non représentatives), insights erronés
- **Exemple :** Utilisateur crée compte 22 janvier → Bilan janvier = 10 jours → Budget mensuel divisé par 3
- **Détection :** Tests avec datasets partiels (5, 10, 15, 20 jours)
- **Mitigation préventive :**
  - Affichage "Données partielles : 10/31 jours" en haut modale
  - Message avertissement : "Ce bilan est basé sur une période incomplète"
  - Calculs proratisés (budget mensuel × 10/31)
  - Sections désactivées si < 15 jours (patterns, comparaison N-1)
- **Mitigation curative :** Génération bilan complet mois suivant
- **Coût mitigation :** 1h30 (gestion cas partiels)

**2. Migration anciens bilans - Format incompatible**
- **Gravité :** 🟡 MOYENNE
- **Probabilité :** 🟠 MOYENNE (50%)
- **Risque :** Bilans hebdo existants (format avant migration) non migrables vers format agrégeable
- **Impact :** Bilan mensuel vide pour mois passés (décembre 2025, novembre 2025)
- **Détection :** Tests migration données réelles production
- **Mitigation préventive :**
  - Script migration format V1 → V2 avec validation
  - Génération rétroactive bilans mensuels si > 15 jours données
  - Vérification schéma avant agrégation (try/catch)
  - Logs détaillés migrations réussies/échouées
- **Mitigation curative :** Message "Bilans mensuels disponibles à partir de [Date]"
- **Coût mitigation :** 3h (script migration robuste)

**3. Premier mois utilisateur - Comparaison impossible**
- **Gravité :** 🟡 MOYENNE
- **Probabilité :** 🔴 ÉLEVÉE (90%)
- **Risque :** Utilisateur crée compte 20 janvier → bilan mensuel 20-31 = 11 jours → Comparaison N vs N-1 impossible
- **Impact :** Section 4 (QN progression) vide, utilisateur déçu
- **Détection :** Tests nouveau compte
- **Mitigation préventive :**
  - Message "Premier mois incomplet, comparaison disponible dès février"
  - Affichage QN actuel sans comparaison
  - Encouragement : "Continue ainsi, tu pourras comparer dès le mois prochain !"
  - Badge "Nouveau" sur profil
- **Mitigation curative :** Génération insights alternatifs (sans comparaison)
- **Coût mitigation :** 1h (gestion premier mois)

**4. Cohérence inter-bilans - Divergence chiffres**
- **Gravité :** 🔴 CRITIQUE
- **Probabilité :** 🟠 MOYENNE (40%)
- **Risque :** Somme bilans hebdo ≠ bilan mensuel (double comptage ou exclusion)
- **Impact :** Perte confiance utilisateur, données perçues comme fausses
- **Exemple :** Bilan S1+S2+S3+S4 = 8200 kcal, Bilan mensuel = 8450 kcal → Écart inexpliqué
- **Détection :** Tests vérification cohérence automatiques
- **Mitigation préventive :**
  - Calculs identiques hebdo/mensuel (même fonctions)
  - Validation cohérence automatique après génération
  - Logs détaillés écarts détectés
  - Tests unitaires vérification sommes
- **Mitigation curative :** Script détection + correction divergences
- **Coût mitigation :** 2h30 (validation cohérence)

**5. Gestion erreurs réseau - Offline**
- **Gravité :** 🟡 MOYENNE
- **Probabilité :** 🟡 FAIBLE (20%)
- **Risque :** Utilisateur ouvre bilan mensuel sans connexion → Données vides ou anciennes
- **Impact :** Frustration, sentiment app cassée
- **Détection :** Tests mode avion / throttling réseau
- **Mitigation préventive :**
  - Détection offline avant chargement
  - Message "Connexion requise pour bilan mensuel"
  - Mise en cache dernière version (consultation offline possible)
  - Retry automatique quand connexion rétablie
- **Mitigation curative :** Sync automatique en arrière-plan
- **Coût mitigation :** 2h (gestion offline)

**3. Surcharge informations - Abandon lecture**
- **Gravité :** 🟠 HAUTE
- **Probabilité :** 🟠 MOYENNE (60%)
- **Risque :** 6 sections + verbatims longs = trop d'infos d'un coup → Utilisateur ferme sans lire
- **Impact :** Abandon lecture, non-appropriation insights, bilan inutile
- **Détection :** Analytics temps lecture modale (< 30s = abandon)
- **Mitigation préventive :**
  - Sections collapsibles (accordéon), 1 seule ouverte par défaut (Section 1)
  - Résumé 3 lignes par section avant "Voir détails"
  - Progression lecture (1/6, 2/6... sections lues)
  - Mise en avant insight principal (encadré coloré)
  - Verbatims courts (< 200 caractères)
- **Mitigation curative :** A/B testing longueur verbatims
- **Coût mitigation :** 2h (accordéon + résumés)

**4. Pop-up intrusif - Moment inadapté**
- **Gravité :** 🟡 MOYENNE
- **Probabilité :** 🟠 MOYENNE (40%)
- **Risque :** Pop-up s'affiche alors que utilisateur pressé ou veut juste valider rapidement
- **Impact :** Agacement, clic "Plus tard" systématique, bilan jamais consulté
- **Détection :** Tracking taux clic "Plus tard" (> 70% = problème)
- **Mitigation préventive :**
  - Bouton "Plus tard" bien visible
  - Notification badge persistant "Bilan mensuel disponible" si refusé
  - Possibilité désactiver pop-up (paramètres)
  - Envoi email alternatif lendemain si non consulté
- **Mitigation curative :** Ajustement timing pop-up (pas le dimanche soir 23h)
- **Coût mitigation :** 1h (bouton + notification)

**5. Verbatims inadaptés - Ton décalé**
- **Gravité :** 🟡 MOYENNE
- **Probabilité :** 🟡 FAIBLE (30%)
- **Risque :** Messages motivationnels génériques ou ton moralisateur → Utilisateur se sent jugé
- **Impact :** Démotivation, sentiment culpabilité, abandon app
- **Scénarios critiques :**
  - Mois difficile (objectif non atteint) → Message perçu comme reproche
  - Surplus extras → "Tu as dépassé ton budget" = ton accusateur
  - Comparaison N/N-1 négative → Sentiment échec
- **Détection :** Tests utilisateurs avec verbatims (5 personnes)
- **Mitigation préventive :**
  - Validation verbatims par utilisateur AVANT implémentation
  - Ton bienveillant systématique ("Cette semaine a été plus riche" vs "Tu as trop mangé")
  - Contextualisation ("C'est normal après période fêtes" vs jugement brut)
  - Valorisation petits progrès
- **Mitigation curative :** Ajustement verbatims suite feedback
- **Coût mitigation :** 2h (rédaction verbatims)

**6. Temps chargement perçu - Impatience**
- **Gravité :** 🟡 MOYENNE
- **Probabilité :** 🟠 MOYENNE (50%)
- **Risque :** Chargement 2-3 secondes sans feedback → Utilisateur pense que rien ne se passe
- **Impact :** Clics répétés, frustration, fermeture modale prématurée
- **Détection :** Tests avec throttling réseau (3G)
- **Mitigation préventive :**
  - Skeleton loader pendant chargement
  - Pourcentage progression (Chargement 40%...)
  - Animation sections (apparition progressive)
  - Message "Analyse de tes 30 derniers jours en cours..."
- **Mitigation curative :** Optimisation requêtes si chargement > 3s
- **Coût mitigation :** 1h30 (loaders)

### Risques robustesse

**1. Données incomplètes**
- **Risque :** Mois avec seulement 10 jours de données (utilisateur commence app en cours de mois)
- **Impact :** Stats faussées, moyennes non représentatives
- **Mitigation :** Affichage "Données partielles : 10/30 jours" + message avertissement

**2. Migration anciens bilans**
- **Risque :** Bilans hebdo existants non migrés vers format agrégeable
- **Impact :** Bilan mensuel vide pour mois passés
- **Mitigation :** Script migration base données, génération rétroactive si données disponibles

**3. Cas mois incomplet (premier mois utilisateur)**
- **Risque :** Utilisateur crée compte 20 janvier → bilan mensuel 20-31 = 11 jours seulement
- **Impact :** Comparaison N vs N-1 impossible, moyennes biaisées
- **Mitigation :** Message "Premier mois incomplet, comparaison disponible dès février"

### 🔒 Risques sécurité (3 risques)

**1. Injection SQL agrégation - Filtres vulnérables**
- **Gravité :** 🔴 CRITIQUE
- **Probabilité :** 🟡 FAIBLE (10%)
- **Risque :** Filtres date/mois vulnérables si non paramétrés → Injection SQL possible
- **Impact :** Faille sécurité critique, accès données autres utilisateurs, corruption base
- **Scénarios d'attaque :**
  - URL manipulée : `/bilan-mensuel?mois=1' OR '1'='1`
  - Payload dans localStorage
  - Manipulation requête via DevTools
- **Détection :** Tests injection (OWASP Top 10)
- **Mitigation préventive :**
  - Utilisation requêtes préparées Supabase systématiquement
  - Validation côté serveur (RLS Supabase)
  - Paramètres liés (pas de concaténation SQL)
  - Sanitization inputs (mois, annee, user_id)
  - Logs tentatives injection détectées
- **Mitigation curative :** WAF (Web Application Firewall) si attaques détectées
- **Coût mitigation :** 2h (sécurisation requêtes)

**2. Exposition données autres utilisateurs - Fuite confidentialité**
- **Gravité :** 🔴 CRITIQUE
- **Probabilité :** 🟡 FAIBLE (15%)
- **Risque :** Requête agrégation sans filtre user_id → Données tous utilisateurs exposées
- **Impact :** Fuite données confidentielles (poids, repas, extras), violation RGPD
- **Scénarios critiques :**
  - Oubli clause WHERE user_id dans requête
  - Bug RLS Supabase (règles mal configurées)
  - Session utilisateur corrompue (user_id null)
- **Détection :** Tests avec comptes multiples, vérification RLS
- **Mitigation préventive :**
  - Clause WHERE user_id systématique dans TOUTES requêtes
  - Vérification RLS Supabase activé (CREATE POLICY)
  - Tests automatisés isolation données
  - Logs accès données sensibles
  - Session validation côté serveur
- **Mitigation curative :** Audit logs si fuite détectée + notification CNIL
- **Coût mitigation :** 2h30 (RLS + tests)

**3. XSS dans verbatims dynamiques - Injection code**
- **Gravité :** 🟠 HAUTE
- **Probabilité :** 🟡 FAIBLE (5%)
- **Risque :** Verbatims générés contiennent données utilisateur non échappées → Injection JavaScript
- **Impact :** Exécution code malveillant, vol session, phishing
- **Exemple :** Nom utilisateur = `<script>alert('XSS')</script>` affiché dans verbatim
- **Détection :** Tests injection XSS (payload OWASP)
- **Mitigation préventive :**
  - Échappement systématique HTML (React fait déjà mais vérifier)
  - Sanitization inputs utilisateur
  - CSP (Content Security Policy) strict
  - Pas de dangerouslySetInnerHTML
- **Mitigation curative :** Audit code + correction failles
- **Coût mitigation :** 1h30 (sanitization)

### ♿ Risques accessibilité (3 risques)

**1. Navigation clavier pop-up/modale - Utilisateurs non-voyants bloqués**
- **Gravité :** 🟠 HAUTE
- **Probabilité :** 🔴 ÉLEVÉE (60%)
- **Risque :** Pop-up/modale non accessible Tab/Enter/Escape → Utilisateurs clavier/screen reader bloqués
- **Impact :** Non-conformité WCAG AA, utilisateurs handicapés exclus
- **Tests conformité :**
  - Tab : Focus suit ordre logique (titre → boutons → sections)
  - Enter : Ouvre sections accordéon
  - Escape : Ferme modale immédiatement
  - Shift+Tab : Focus inverse fonctionne
  - Focus trap : Focus reste dans modale ouverte
- **Détection :** Tests manuels clavier uniquement (sans souris)
- **Mitigation préventive :**
  - Attributs ARIA complets (aria-label, aria-expanded, aria-controls, role)
  - Focus trap implémenté (focus-trap-react)
  - Gestion Escape key
  - Ordre DOM logique (pas de CSS absolute désordonné)
  - Focus visible (outline 2px bleu)
- **Mitigation curative :** Audit accessibilité + corrections
- **Coût mitigation :** 2h (ARIA + tests)

**2. Contraste couleurs sections - Non-conformité WCAG**
- **Gravité :** 🟠 HAUTE
- **Probabilité :** 🟠 MOYENNE (50%)
- **Risque :** Graphiques/badges/verbatims faible contraste → Non-lisible malvoyants
- **Impact :** Non-conformité WCAG AA (ratio < 4.5:1), exclusion utilisateurs
- **Éléments à vérifier :**
  - Titres sections (bleu sur fond gris clair)
  - Badges QN (couleurs vives)
  - Graphiques (barres, camembert)
  - Verbatims (texte gris sur fond blanc)
- **Détection :** Tests contraste automatiques (WebAIM Contrast Checker)
- **Mitigation préventive :**
  - Tests contraste systématiques (ratio ≥ 4.5:1)
  - Palette couleurs accessible validée
  - Mode sombre alternatif
  - Pas uniquement couleur (icônes + texte)
- **Mitigation curative :** Ajustement couleurs si non-conforme
- **Coût mitigation :** 1h30 (tests contraste)

**3. Screen reader annonces - Navigation confuse**
- **Gravité :** 🟡 MOYENNE
- **Probabilité :** 🟠 MOYENNE (40%)
- **Risque :** Screen reader (NVDA/JAWS/VoiceOver) annonce mal sections ou saute contenu
- **Impact :** Utilisateurs aveugles ne comprennent pas structure, abandonnent
- **Tests requis :**
  - NVDA (Windows) : Navigation sections, lecture verbatims
  - JAWS (Windows) : Idem
  - VoiceOver (macOS/iOS) : Navigation tactile
  - TalkBack (Android) : Si app mobile future
- **Détection :** Tests avec utilisateurs aveugles ou simulation
- **Mitigation préventive :**
  - Structure sémantique HTML (h1, h2, section, article)
  - Aria-live pour mises à jour dynamiques
  - Aria-label descriptifs (pas juste "Voir plus")
  - Landmarks ARIA (navigation, main, complementary)
- **Mitigation curative :** Corrections suite tests utilisateurs
- **Coût mitigation :** 2h (tests screen readers)

### Ordre hooks React

**⚠️ VIGILANCE CRITIQUE :** Tous les hooks doivent être déclarés en haut du composant AVANT toute utilisation

**BilanMensuelModal.js (nouveau composant) :**
```javascript
// ✅ ORDRE CORRECT
function BilanMensuelModal({ mois, annee, onClose }) {
  // 1. TOUS LES HOOKS D'ABORD
  const [sectionOuverte, setSectionOuverte] = useState(null);
  const [donneesMensuelles, setDonneesMensuelles] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    chargerDonneesMensuelles();
  }, [mois, annee]); // ✅ Dépendances déclarées APRÈS hooks
  
  // 2. FONCTIONS MÉTIER
  const chargerDonneesMensuelles = async () => { ... };
  const calculerTendancePoids = () => { ... };
  
  // 3. HANDLERS
  const handleToggleSection = (section) => { ... };
  const handleConsulterBilanHebdo = () => { ... };
  
  // 4. RENDU
  return (...);
}
```

**pages/suivi.js (modification existante) :**
- ⚠️ **VÉRIFIER** : `useState` pour pop-up déclaré AVANT tous les useEffect existants
- ⚠️ **VÉRIFIER** : Fonction `estDerniereValidationDuMois` importée AVANT utilisation dans useEffect

### Risques de régression

**1. Bilan hebdo existant**
- **Risque :** Modifications pages/suivi.js cassent logique validation hebdo
- **Impact :** Perte fonctionnalité critique
- **Mitigation :** Tests non-régression complets, validation S1-S4 avant/après

**2. Performance page suivi**
- **Risque :** Ajout requêtes détection fin mois ralentit chargement page
- **Impact :** UX dégradée sur page principale
- **Mitigation :** Requête détection uniquement si validation en cours (conditional)

---

## Etape 2 — **Sous-checklist à valider systématiquement**

### Imports et dépendances

- [ ] `useState`, `useEffect`, `useCallback` importés dans BilanMensuelModal.js
- [ ] `supabase` importé et initialisé
- [ ] Fonction `estDerniereValidationDuMois` importée dans suivi.js depuis validationSemaine.js
- [ ] Fonctions calcul agrégé importées depuis calculsBilanMensuel.js
- [ ] Composant `PopupBilanMensuel` importé dans suivi.js
- [ ] Composant `BilanMensuelModal` importé dans suivi.js

### Déclarations avant usage

- [ ] Tous les `useState` déclarés en haut de chaque composant
- [ ] Tous les `useEffect` déclarés APRÈS tous les useState
- [ ] Toutes les fonctions métier déclarées AVANT leur utilisation dans hooks
- [ ] Tous les handlers déclarés AVANT leur utilisation dans rendu JSX
- [ ] Variables `mois`, `annee` passées en props AVANT leur utilisation dans calculs

### Gestion états asynchrones

- [ ] État `loading` initialisé à `true` pour chaque requête asynchrone
- [ ] État `error` géré avec message utilisateur clair
- [ ] Cleanup useEffect pour requêtes annulées (éviter memory leaks)
- [ ] Gestion cas données vides (aucun repas ce mois)

### Validation données

- [ ] Vérification `mois` valide (1-12)
- [ ] Vérification `annee` valide (> 2020, < 2100)
- [ ] Vérification résultat requête non null avant calculs
- [ ] Gestion cas tableau vide (0 repas) sans crash

---

## Etape 3 — **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**

### Lecture code existant

- [ ] Lecture complète `pages/suivi.js` (lignes validation semaine, setBilanData)
- [ ] Lecture complète `lib/validationSemaine.js` (fonctions existantes, exports)
- [ ] Identification tous les hooks existants dans suivi.js (ordre actuel)
- [ ] Identification dépendances critiques (Supabase, routeurPoids, referentiel)

### Initialisation avant usage

- [ ] Tous les hooks React déclarés uniquement en haut du corps du composant fonctionnel
- [ ] Jamais de hook dans fonction, boucle, map, if, condition
- [ ] **Aucune variable d'état ou de hook utilisée avant sa déclaration, y compris dans dépendances autres hooks**
- [ ] Ordre strict : useState → useEffect → fonctions métier → handlers → rendu

### Séparation étapes

- [ ] Initialisation (useState, useEffect) : lignes 1-50
- [ ] Logique calculée (fonctions métier) : lignes 51-150
- [ ] Handlers (onClick, onChange) : lignes 151-200
- [ ] Rendu JSX : lignes 201+

### Vérifications fonctions/handlers

- [ ] Toute fonction utilisée dans rendu est présente et initialisée avant usage
- [ ] Toute fonction asynchrone gère try/catch avec message erreur utilisateur
- [ ] Pas de déclaration fonction dans boucle ou condition

### Ordre et portée logiques

- [ ] Jamais déclaration prématurée (variable utilisée avant création)
- [ ] Jamais appel prématuré (fonction appelée avant déclaration)
- [ ] Portée variables respectée (pas de variable locale utilisée en global)

### Doublons et superflu

- [ ] Pas de doublons `useState` (même variable déclarée 2×)
- [ ] Pas de doublons `useEffect` (même logique 2×)
- [ ] Pas de déclarations superflues (variables jamais utilisées)

### Contrôles d'erreur

- [ ] Compilation : `npm run build` sans erreur
- [ ] Runtime : Tests navigateur sans ReferenceError, TypeError
- [ ] SSR : Tests avec `npm run start` (si applicable)
- [ ] Console : Aucun warning React (hooks, dépendances, etc.)

### Tests rendu

- [ ] Cas nominal : Mois complet 30 jours, toutes données présentes
- [ ] Cas limite 1 : Mois incomplet (10 jours seulement)
- [ ] Cas limite 2 : Aucun repas saisi ce mois
- [ ] Cas limite 3 : Validation en retard (5 février, mais validation janvier)
- [ ] Cas limite 4 : Premier mois utilisateur (pas de comparaison N-1)

### Préservation fonctionnalités existantes

- [ ] Validation bilan hebdo fonctionne toujours (S1-S4)
- [ ] Calculs apportsTotaux, extrasInfo, joursRespectes inchangés
- [ ] Modale bilan hebdo s'affiche toujours correctement
- [ ] Pas de suppression code existant sans justification documentée

### Mise à jour avancement

- [ ] Pourcentage avancement MAJ après chaque étape (détection, pop-up, modale, historique)
- [ ] Historique dates modifications documenté

### Anomalies et rollback

- [ ] Toute anomalie → Rollback immédiat
- [ ] Rapport anomalie avec contexte, date, heure dans fichier ANOMALIE
- [ ] Aucune suppression dans fichier anomalie (ajout fin de fichier uniquement)

### Documentation

- [ ] Chaque étape documentée (détection, calculs, affichage)
- [ ] Chaque validation documentée (tests, cas limites)
- [ ] Chaque action automatisée documentée (génération stats, pop-up)

### Relecture manuelle

- [ ] Relecture **manuelle ligne par ligne** déclarations hooks AVANT chaque utilisation
- [ ] NE PAS se baser sur mémoire modèle Copilot
- [ ] Vérification visuelle ordre hooks dans fichier

### Validation utilisateur

- [ ] Plan complet présenté à utilisateur AVANT toute implémentation
- [ ] Validation explicite utilisateur requise
- [ ] Toutes cases ci-dessus cochées et documentées avant de poursuivre

---

## Etape 4 — **Contrôles conformité à réaliser (en suivant l'ordre ci-dessous)**

### 4.1 - Lecture fichier anomalies rollback

**Action :** Consulter `/docs/ANOMALIE_ROLLBACK.md` (ou équivalent) pour identifier anomalies passées similaires

**Points de vigilance identifiés :**
- Vérifier si anomalies ordre hooks déjà rencontrées (ex: RepasBloc.js)
- Vérifier si problèmes performance requêtes agrégation déjà signalés
- Vérifier si conflits modales superposées déjà documentés

**Résultat attendu :** Liste anomalies pertinentes + checklist prévention

### 4.2 - Création checklist prévention

**Basé sur analyse anomalies passées :**

- [ ] Hook utilisé avant déclaration → Vérifier ordre hooks avant commit
- [ ] Requête lente agrégation → Tester performance avec 100+ repas
- [ ] Modale superposée → Tester setTimeout fermeture avant ouverture suivante
- [ ] Memory leak useEffect → Vérifier cleanup fonction retour
- [ ] Données manquantes crash → Gestion cas null/undefined systématique

### 4.3 - Analyse audit risques

**Anomalies bloquantes identifiées :**
- ❌ AUCUNE pour l'instant (fonctionnalité nouvelle)

**Anomalies non-bloquantes à surveiller :**
- ⚠️ Performance requête agrégation (migration si besoin)
- ⚠️ Chevauchement semaine/mois (tests validation critiques)

**Décision :** ✅ Aucune anomalie bloquante, implémentation peut démarrer après validation utilisateur

### 4.4 - Proposition rollback si anomalie détectée

**Scénario 1 : Erreur compilation après ajout détection fin mois**
- **Rollback :** `git revert` commit ajout fonction `estDerniereValidationDuMois`
- **Alternative :** Corriger fonction avant nouveau commit
- **Documentation :** Anomalie + date/heure dans fichier rollback

**Scénario 2 : Pop-up bloque interface (modal freeze)**
- **Rollback :** Désactiver déclenchement pop-up (commentaire code)
- **Alternative :** Revoir logique setTimeout + gestion états
- **Documentation :** Anomalie + capture écran + logs console

**Scénario 3 : Requête agrégation timeout (>5s)**
- **Rollback :** Désactiver calculs lourds (patterns, QN)
- **Alternative :** Optimiser requête (index, pagination)
- **Documentation :** Anomalie + explain plan SQL

### 4.5 - Tests conformité

**Tests sauvegarde/restauration :**
- [ ] Bilans mensuels sauvegardés en base données (table `bilans_mensuels`)
- [ ] Consultation bilans mois antérieurs fonctionne
- [ ] Pas de perte données si fermeture modale avant fin chargement

**Tests accessibilité :**
- [ ] Navigation clavier (Tab, Enter, Escape) pop-up + modale
- [ ] Attributs ARIA (aria-label, aria-expanded, role)
- [ ] Contraste couleurs WCAG AA (≥ 4.5:1)
- [ ] Screen reader annonce sections correctement

**Tests non-régression :**
- [ ] Bilan hebdo S1-S4 fonctionne toujours
- [ ] Validation semaine en milieu de mois ne déclenche pas pop-up
- [ ] Calculs apportsTotaux, extras inchangés

**Tests performance :**
- [ ] Chargement bilan mensuel < 2 secondes (93 repas)
- [ ] Page suivi.js pas ralentie par ajout détection
- [ ] Pas de memory leak (test 10 ouvertures/fermetures modale)

**Tests multi-device :**
- [ ] Affichage responsive mobile (accordéon sections)
- [ ] Pop-up adapté petits écrans
- [ ] Graphiques lisibles sur tablette

**Tests compatibilité :**
- [ ] Navigateurs : Chrome, Firefox, Safari, Edge
- [ ] React versions : Vérifier compatibilité hooks
- [ ] Supabase : Requêtes compatibles version actuelle

**Tests robustesse :**
- [ ] Données manquantes (0 repas) : Message explicite, pas de crash
- [ ] Mois incomplet (15 jours) : Avertissement affiché
- [ ] Premier mois utilisateur : Pas de comparaison N-1 affichée
- [ ] Validation retard (10 février, bilan janvier) : Bilan généré correctement

**Tests cas limites :**
- [ ] Validation dimanche 31 décembre : Détection fin année correcte
- [ ] Mois février 28/29 jours : Pas d'erreur calcul
- [ ] Utilisateur crée compte dernier jour mois : Bilan 1 jour affiché avec message

---

## Etape 5 — **Mise à jour de l'avancement**

### Statut actuel
- [x] Non commencé  
- [ ] En cours  
- [ ] Terminé  

### Avancement précis/Pourcentage réel : **0%**

### Historique des mises à jour

**21/01/2026 - 0% - Plan d'implémentation créé**
- Création document plan complet
- Audit risques effectué (10 risques identifiés)
- Checklist stricte établie (45 points contrôle)
- En attente validation utilisateur

---

## Etape 6 — **Point de vigilance**

### 6.1 - Rapport lecture fichier anomalies rollback

**Fichier consulté :** `/docs/ANOMALIE_ROLLBACK.md` (à confirmer existence)

**Entrées pertinentes identifiées :**

*Note : À compléter après consultation fichier réel. Exemple anticipé :*

**Entrée #12 (09/01/2026) : Ordre hooks RepasBloc.js**
- Problème : `fetchDernierFastFood` utilisé dans useEffect avant déclaration
- Impact : ReferenceError runtime
- Solution : Déplacement fonction avant useEffect
- **Leçon :** Toujours déclarer fonctions/hooks AVANT utilisation dans dépendances

**Entrée #08 (05/01/2026) : Performance requête repas_reels**
- Problème : Requête sans index sur colonne `date` → 2.3s chargement
- Impact : UX dégradée page suivi
- Solution : Ajout index `CREATE INDEX idx_repas_reels_date ON repas_reels(date)`
- **Leçon :** Indexer colonnes utilisées dans filtres agrégation

### 6.2 - Erreurs similaires à éviter

**Basé sur retour d'expérience documenté :**

**Erreur 1 : Hook utilisé avant déclaration**
```javascript
// ❌ INTERDIT
useEffect(() => {
  calculerStats(); // Fonction pas encore déclarée !
}, [mois]);

const calculerStats = () => { ... }; // Déclaration APRÈS

// ✅ CORRECT
const calculerStats = () => { ... }; // Déclaration AVANT

useEffect(() => {
  calculerStats();
}, [mois]);
```

**Erreur 2 : Requête sans gestion erreur**
```javascript
// ❌ INTERDIT
const { data } = await supabase.from('repas_reels').select('*');
setDonnees(data); // Crash si erreur réseau !

// ✅ CORRECT
const { data, error } = await supabase.from('repas_reels').select('*');
if (error) {
  console.error('Erreur chargement:', error);
  setError('Impossible de charger les données. Réessaie plus tard.');
  return;
}
setDonnees(data);
```

**Erreur 3 : Memory leak useEffect**
```javascript
// ❌ INTERDIT
useEffect(() => {
  const timer = setTimeout(() => { ... }, 1000);
  // Pas de cleanup !
}, []);

// ✅ CORRECT
useEffect(() => {
  const timer = setTimeout(() => { ... }, 1000);
  return () => clearTimeout(timer); // Cleanup
}, []);
```

**Erreur 4 : Données null non gérées**
```javascript
// ❌ INTERDIT
const moyenne = repas.reduce((sum, r) => sum + r.kcal, 0) / repas.length;
// Crash si repas = null ou vide !

// ✅ CORRECT
const moyenne = repas && repas.length > 0
  ? repas.reduce((sum, r) => sum + r.kcal, 0) / repas.length
  : 0;
```

### 6.3 - Checklist prévention spécifique

**À appliquer AVANT chaque commit :**

- [ ] **Ordre hooks :** Vérification visuelle fichier (useState → useEffect → fonctions → handlers → rendu)
- [ ] **Gestion erreur :** Tous les `await` ont `try/catch` ou vérification `error`
- [ ] **Cleanup :** Tous les `useEffect` avec timers/subscriptions ont `return () => cleanup`
- [ ] **Données null :** Tous les `.map`, `.reduce`, `.filter` vérifiés avec `Array.isArray()` ou `?.length`
- [ ] **Performance :** Requêtes agrégation testées avec 100+ lignes
- [ ] **Console :** Aucun warning React hooks, dépendances, etc.

### 6.4 - Impact attendu de l'ajout

**Positif :**
- ✅ Vision macro-tendances pour utilisateur
- ✅ Motivation long terme (progression 30 jours)
- ✅ Identification patterns invisibles en hebdo
- ✅ Projection mois suivant = cap clair

**Négatif potentiel :**
- ⚠️ Complexité code augmentée (3 nouveaux composants)
- ⚠️ Requêtes base données supplémentaires (agrégation)
- ⚠️ Risque confusion utilisateur si messages pas clairs

**Mitigation impacts négatifs :**
- Tests exhaustifs (15 cas limite)
- Messages explicatifs dans modale
- Documentation utilisateur (FAQ "Quelle différence hebdo/mensuel ?")

---

## Etape 7 — **Proposition de rollback**

### Scénario 1 : Erreur critique détection fin mois

**Contexte :**
- Modification `lib/validationSemaine.js` : Ajout fonction `estDerniereValidationDuMois`
- Erreur : Fonction retourne `true` pour toutes les semaines (bug logique)
- Impact : Pop-up bilan mensuel affiché chaque validation hebdo (S1, S2, S3, S4)

**Action rollback :**
```bash
# Revenir au commit avant ajout fonction
git revert <commit-hash-ajout-detection>

# Alternative : Corriger logique immédiatement
# Fichier : lib/validationSemaine.js
# Ligne problématique : return dateLundiSuivant.getMonth() !== dateSemaine.getMonth();
# Correction : Vérifier aussi année (cas décembre/janvier)
```

**Documentation anomalie :**
```markdown
## Anomalie #XX - Détection fin mois incorrecte
**Date :** 21/01/2026 14:23
**Fichier :** lib/validationSemaine.js
**Ligne :** 542
**Problème :** Fonction `estDerniereValidationDuMois` ne gère pas changement année
**Impact :** Pop-up affiché à tort en décembre pour toutes semaines
**Solution :** Ajout vérification année en plus du mois
**Rollback :** git revert abc123
**Statut :** ✅ Corrigé
```

### Scénario 2 : Performance requête agrégation inacceptable

**Contexte :**
- Modification `lib/calculsBilanMensuel.js` : Requête agrégation 30 jours
- Erreur : Temps chargement 8 secondes (utilisateur avec 120 repas/mois)
- Impact : Interface bloquée, utilisateur pense que app a planté

**Action rollback :**
```bash
# Désactiver temporairement bilan mensuel
# Fichier : pages/suivi.js
# Commenter déclenchement pop-up en attendant optimisation
```

**Alternative sans rollback :**
- Ajouter index base données : `CREATE INDEX idx_repas_date_user ON repas_reels(date, user_id)`
- Pagination résultats (charger par semaine, agréger côté client)
- Affichage progressif (sections chargées une par une)

**Documentation anomalie :**
```markdown
## Anomalie #XX - Performance bilan mensuel
**Date :** 21/01/2026 16:45
**Fichier :** lib/calculsBilanMensuel.js
**Ligne :** Requête ligne 28
**Problème :** Agrégation 120 repas sans index → 8s
**Impact :** UX dégradée, interface bloquée
**Solution temporaire :** Désactivation pop-up bilan mensuel
**Solution définitive :** Index BDD + pagination
**Rollback :** Commentaire ligne 243 suivi.js
**Statut :** ⏳ En cours optimisation
```

### Scénario 3 : Modale bilan mensuel casse bilan hebdo

**Contexte :**
- Modification `components/BilanHebdoModal.js` : Ajout lien vers bilan mensuel
- Erreur : Conflit états, fermeture bilan hebdo ferme aussi bilan mensuel
- Impact : Utilisateur ne peut plus consulter aucun bilan

**Action rollback :**
```bash
# Rollback complet ajout lien
git revert <commit-hash-ajout-lien>

# Alternative : Isoler états modales
# Utiliser 2 états séparés au lieu de 1 état partagé
```

**Documentation anomalie :**
```markdown
## Anomalie #XX - Conflit états modales
**Date :** 21/01/2026 18:12
**Fichier :** components/BilanHebdoModal.js
**Ligne :** 45 (useState partagé)
**Problème :** État `modalOpen` partagé entre 2 modales
**Impact :** Fermeture cascade, bilans inaccessibles
**Solution :** Séparer états (modalHebdoOpen, modalMensuelOpen)
**Rollback :** git revert def456
**Statut :** ✅ Corrigé
```

### Procédure rollback automatique

**Déclenchement automatique si :**
- Erreur compilation (npm run build échoue)
- Erreur runtime bloquante (app crash au chargement)
- Tests non-régression échouent (bilan hebdo cassé)

**Actions automatiques :**
1. `git revert` dernier commit
2. Notification utilisateur : "Rollback automatique effectué - Anomalie détectée"
3. Création entrée fichier `ANOMALIE_ROLLBACK.md` (fin de fichier, pas de suppression)
4. Log console détaillé (stack trace, contexte)

---

## Etape 8 — **Rapport Markdown Copilot**

### 8.1 - Rapport AVANT modification

**État actuel application :**

#### Structure fichiers concernés

**`pages/suivi.js` (2138 lignes)**
- **Hooks existants :**
  - Ligne 38 : Imports validationSemaine
  - Ligne 80-126 : 15 useState déclarés (objectifCaloriqueJour, repasData, etc.)
  - Ligne 161-360 : 8 useEffect (chargement données, détection fin semaine, etc.)
- **Fonctions validation semaine :**
  - Ligne 1050-1180 : Calculs bilan hebdo (apportsTotaux, extras, satieteMoyenne, etc.)
  - Ligne 1235 : setBilanData (déclenchement modale bilan hebdo)
- **Pas de logique détection fin mois actuellement**
- **Pas de pop-up notification actuellement**

**`lib/validationSemaine.js` (583 lignes)**
- **Fonctions existantes :**
  - Ligne 35 : `getMonday(date)` - Calcul lundi semaine
  - Ligne 48 : `addDays(date, days)` - Ajout jours à date
  - Ligne 67 : `formatDate(date)` - Formatage date français
  - Ligne 531 : `categoriserMomentJournee(type)` - Catégorisation temporelle
  - Ligne 559 : `calculerRepartitionExtrasTemporelle(repasExtras)` - Répartition extras
- **Fonction `estDerniereValidationDuMois` : NON EXISTANTE (à créer)**

**`components/BilanHebdoModal.js` (695 lignes)**
- **Structure actuelle :**
  - Ligne 38 : Imports useState, React
  - Ligne 45-52 : Props bilan, selectedDate, onClose
  - Ligne 60-102 : Section 1 - Validation hebdomadaire
  - Ligne 104-158 : Section 2 - Comparaison N/N-1
  - Ligne 160-245 : Section 3 - Évolution 14 jours
  - Ligne 247-338 : Section 4 - Budget extras
  - Ligne 340-452 : Section 5 - Synthèse nutritionnelle
  - Ligne 454-569 : Section 6 - Jours respectés
  - Ligne 611-691 : Section 7 - Comment j'ai mangé
- **Pas de lien vers bilan mensuel actuellement**

#### Composants à créer

**`components/BilanMensuelModal.js` : NON EXISTANT**
**`components/PopupBilanMensuel.js` : NON EXISTANT**
**`lib/calculsBilanMensuel.js` : NON EXISTANT**
**`lib/detectionFinMois.js` : NON EXISTANT**

#### Base de données actuelle

**Table `repas_reels` (existante)**
- Colonnes : id, user_id, date, type, aliment, kcal, est_extra, satiete, ressenti, etc.
- Index actuel : PRIMARY KEY (id), FOREIGN KEY user_id
- **Index manquant : `date` (requis pour performance agrégation)**

**Table `bilans_mensuels` : NON EXISTANTE (à créer)**

#### Fonctionnalités actuelles

✅ **Validation bilan hebdo** : Fonctionne (S1-S4)  
✅ **Calculs agrégés semaine** : Fonctionne (apports, extras, satiété)  
✅ **Modale bilan hebdo** : Fonctionne (7 sections)  
❌ **Détection fin mois** : Non implémenté  
❌ **Pop-up notification** : Non implémenté  
❌ **Bilan mensuel** : Non implémenté  
❌ **Historique bilans mensuels** : Non implémenté

---

### 8.2 - Rapport APRÈS modification (anticipé)

*Note : Ce rapport sera généré APRÈS implémentation et validation utilisateur*

#### Nouveaux fichiers créés

**`components/BilanMensuelModal.js` (estimé 450 lignes)**
```javascript
// Structure anticipée
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { calculerTendancePoids, calculerPatterns, genererProjection } from '../lib/calculsBilanMensuel';

function BilanMensuelModal({ mois, annee, user, onClose, onConsulterHebdo }) {
  // Hooks (lignes 1-25)
  const [loading, setLoading] = useState(true);
  const [donneesMensuelles, setDonneesMensuelles] = useState(null);
  const [sectionOuverte, setSectionOuverte] = useState(null);
  const [error, setError] = useState(null);
  
  // useEffect chargement données (lignes 27-50)
  useEffect(() => {
    chargerDonneesMensuelles();
  }, [mois, annee, user.id]);
  
  // Fonctions métier (lignes 52-250)
  const chargerDonneesMensuelles = async () => { ... };
  const calculerSection1 = () => { ... }; // Tendance poids
  const calculerSection2 = () => { ... }; // Budget calorique
  const calculerSection3 = () => { ... }; // Patterns
  const calculerSection4 = () => { ... }; // Qualité nutritionnelle
  const calculerSection5 = () => { ... }; // Ressenti
  const calculerSection6 = () => { ... }; // Projection
  
  // Handlers (lignes 252-280)
  const handleToggleSection = (section) => { ... };
  const handleClose = () => { ... };
  
  // Rendu JSX (lignes 282-450)
  return (
    <div className="modale-bilan-mensuel">
      <h2>📊 Bilan Mensuel - {mois} {annee}</h2>
      {/* 6 sections accordéon */}
      <button onClick={() => onConsulterHebdo(derniereSemaine)}>
        Consulter bilan semaine {derniereSemaine}
      </button>
    </div>
  );
}
```

**`components/PopupBilanMensuel.js` (estimé 80 lignes)**
```javascript
// Pop-up notification simple
function PopupBilanMensuel({ mois, annee, onVoir, onPlusTard }) {
  return (
    <div className="popup-overlay">
      <div className="popup-bilan-mensuel">
        <h3>🎉 Bravo !</h3>
        <p>Tu viens de terminer le mois de {mois}.</p>
        <p>Ton bilan mensuel est maintenant disponible.</p>
        <button onClick={onVoir}>Voir mon bilan du mois →</button>
        <button onClick={onPlusTard}>Plus tard</button>
      </div>
    </div>
  );
}
```

**`lib/calculsBilanMensuel.js` (estimé 350 lignes)**
```javascript
// Fonctions agrégation stats mensuelles
export function calculerTendancePoids(donneesPoids, objectif) { ... }
export function calculerBudgetMensuel(repas, budgetJournalier) { ... }
export function calculerPatterns(repas) { ... }
export function calculerQualiteMoyenne(repas, referentiel) { ... }
export function calculerRessentiGlobal(repas) { ... }
export function genererProjection(statsMois, objectif) { ... }
```

**`lib/detectionFinMois.js` (estimé 60 lignes)**
```javascript
// Logique détection dernière semaine mois
export function estDerniereValidationDuMois(dateSemaine) {
  const dateFinMois = new Date(dateSemaine.getFullYear(), dateSemaine.getMonth() + 1, 0);
  const dateLundiSuivant = new Date(dateSemaine);
  dateLundiSuivant.setDate(dateLundiSuivant.getDate() + 7);
  
  // Si lundi suivant = mois suivant → dernière semaine
  return dateLundiSuivant.getMonth() !== dateSemaine.getMonth() ||
         dateLundiSuivant.getFullYear() !== dateSemaine.getFullYear(); // Gestion décembre/janvier
}
```

#### Modifications fichiers existants

**`pages/suivi.js`**
- **Ligne 38 :** Ajout import `estDerniereValidationDuMois` depuis detectionFinMois.js
- **Ligne 40 :** Ajout imports `BilanMensuelModal`, `PopupBilanMensuel`
- **Ligne 135 :** Ajout `useState` pour pop-up : `const [showPopupMensuel, setShowPopupMensuel] = useState(false)`
- **Ligne 136 :** Ajout `useState` pour modale mensuel : `const [showBilanMensuel, setShowBilanMensuel] = useState(false)`
- **Ligne 137 :** Ajout `useState` pour mois/annee : `const [moisBilan, setMoisBilan] = useState({ mois: '', annee: null })`
- **Ligne 1240 :** Ajout détection après setBilanData :
  ```javascript
  // Détection fin mois
  if (estDerniereValidationDuMois(selectedWeekStart)) {
    const dateMois = new Date(selectedWeekStart);
    const nomMois = dateMois.toLocaleDateString('fr-FR', { month: 'long' });
    const annee = dateMois.getFullYear();
    
    setMoisBilan({ mois: nomMois, annee });
    
    setTimeout(() => {
      setShowPopupMensuel(true);
    }, 500); // Après fermeture modale hebdo
  }
  ```
- **Ligne 2100 :** Ajout rendu conditionnel pop-up + modale :
  ```javascript
  {showPopupMensuel && (
    <PopupBilanMensuel 
      mois={moisBilan.mois}
      annee={moisBilan.annee}
      onVoir={() => {
        setShowPopupMensuel(false);
        setShowBilanMensuel(true);
      }}
      onPlusTard={() => setShowPopupMensuel(false)}
    />
  )}
  
  {showBilanMensuel && (
    <BilanMensuelModal
      mois={moisBilan.mois}
      annee={moisBilan.annee}
      user={user}
      onClose={() => setShowBilanMensuel(false)}
      onConsulterHebdo={(semaine) => {
        setShowBilanMensuel(false);
        // Logique ouverture bilan hebdo semaine spécifique
      }}
    />
  )}
  ```

**`lib/validationSemaine.js`**
- **Ligne 590 :** Ajout fonction `estDerniereValidationDuMois` (déplacée depuis detectionFinMois.js pour centralisation)
- **Ligne 38 :** Ajout export dans liste exports

**`components/BilanHebdoModal.js`**
- **Ligne 695 :** Ajout lien en bas de modale :
  ```javascript
  <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
    💡 <a href="#" onClick={(e) => { e.preventDefault(); onConsulterMensuel(); }}>
      Consulter aussi ton bilan mensuel si disponible
    </a>
  </div>
  ```
- **Ligne 45 :** Ajout prop `onConsulterMensuel` dans signature fonction

#### Base de données modifiée

**Migration SQL créée : `add_bilans_mensuels_table.sql`**
```sql
CREATE TABLE bilans_mensuels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profil(id) ON DELETE CASCADE,
  mois INTEGER NOT NULL CHECK (mois BETWEEN 1 AND 12),
  annee INTEGER NOT NULL CHECK (annee > 2020),
  date_creation TIMESTAMP DEFAULT NOW(),
  
  -- Section 1 : Tendance poids
  poids_debut DECIMAL(5,2),
  poids_fin DECIMAL(5,2),
  evolution_kg DECIMAL(5,2),
  objectif_kg DECIMAL(5,2),
  pourcentage_atteint INTEGER,
  rythme_moyen DECIMAL(4,2),
  
  -- Section 2 : Budget calorique
  budget_total INTEGER,
  consomme_total INTEGER,
  solde_kcal INTEGER,
  repartition_repas INTEGER,
  repartition_extras INTEGER,
  
  -- Section 3 : Patterns (JSON)
  patterns JSONB,
  
  -- Section 4 : Qualité nutritionnelle
  qn_moyen DECIMAL(3,2),
  distribution_qn JSONB,
  
  -- Section 5 : Ressenti (JSON)
  ressentis JSONB,
  
  -- Section 6 : Projection (JSON)
  projection JSONB,
  
  UNIQUE(user_id, mois, annee)
);

CREATE INDEX idx_bilans_mensuels_user_date ON bilans_mensuels(user_id, annee, mois);

-- Index performance requêtes agrégation
CREATE INDEX idx_repas_reels_date ON repas_reels(date);
CREATE INDEX idx_repas_reels_user_date ON repas_reels(user_id, date);
```

#### Changements comportementaux

**AVANT :**
- Validation semaine → Modale bilan hebdo → Fermeture
- Pas de différenciation dernière semaine mois

**APRÈS :**
- Validation semaine milieu mois → Modale bilan hebdo → Fermeture (inchangé)
- Validation dernière semaine mois → Modale bilan hebdo → Fermeture → Pop-up bilan mensuel (500ms après) → Modale bilan mensuel (si clic "Voir")
- Accès bilan mensuel depuis lien dans bilan hebdo

#### Tests effectués

- [ ] Cas nominal : Validation S4 janvier → Pop-up affiché → Modale mensuel OK
- [ ] Cas limite : Validation S2 janvier → Pas de pop-up (correct)
- [ ] Cas limite : Mois 10 jours seulement → Message "Données partielles" affiché
- [ ] Cas limite : Premier mois utilisateur → Pas de comparaison N-1
- [ ] Non-régression : Bilan hebdo S1-S3 fonctionne toujours
- [ ] Performance : Chargement bilan mensuel < 2s (100 repas)
- [ ] Accessibilité : Navigation clavier pop-up + modale OK
- [ ] Mobile : Affichage responsive sections accordéon OK

#### Anomalies détectées et corrigées

*À compléter pendant implémentation*

---

## Etape 9 — **Validation explicite de l'utilisateur (OBLIGATOIRE)**

### Validation requise AVANT implémentation

- [ ] **Plan d'implémentation complet lu et approuvé par utilisateur**
- [ ] **Audit risques validé (10 risques identifiés acceptables)**
- [ ] **Checklist 45 points conformité acceptée**
- [ ] **Approche technique (semaines fixes + filtrage) validée**
- [ ] **Structure 6 sections bilan mensuel validée**
- [ ] **Flow UX (pop-up → modale → lien hebdo) validé**
- [ ] **Migration base données (table bilans_mensuels) validée**
- [ ] **Effort estimé (4 jours développement + 2 jours tests) validé**

### Validation post-implémentation requise

- [ ] **Tests 15 cas limite effectués et validés**
- [ ] **Rapport Markdown APRÈS modification validé**
- [ ] **Aucune anomalie bloquante détectée**
- [ ] **Performance acceptable (< 2s chargement)**
- [ ] **Accessibilité conforme WCAG AA**

### Signatures

**Plan validé par l'utilisateur à la date :** _______________

**Implémentation démarrée le :** _______________

**Implémentation terminée le :** _______________

**Validation finale utilisateur le :** _______________

---

## � PLAN D'ACTION ÉTAPE PAR ÉTAPE (Approche Incrémentale)

### Méthodologie inspirée Section 1 Bilan Hebdo
- **Validation utilisateur à chaque étape AVANT passage suivante**
- **Tests indépendants après chaque sous-étape**
- **Affichage progressif et testable au fil de l'eau**
- **Rollback immédiat si anomalie détectée**

---

### 📅 PHASE 1 : Détection & Pop-up (Jour 1 - 6h)

**Objectif :** Détecter dernière semaine mois et afficher pop-up notification

#### Étape 1.1 : Créer fonction détection (1h30)
- [ ] Créer fichier `/lib/detectionFinMois.js`
- [ ] Implémenter `estDerniereValidationDuMois(dateSemaine)`
- [ ] Gérer cas particuliers (décembre/janvier, février 28/29 jours)
- [ ] Tests unitaires fonction (10 cas)
- [ ] **VALIDATION UTILISATEUR** : Tests passent ✅

#### Étape 1.2 : Intégrer détection dans suivi.js (1h30)
- [ ] Importer fonction dans `pages/suivi.js`
- [ ] Ajouter `useState` pour états pop-up/modale (ligne ~135)
- [ ] Appeler détection après `setBilanData` (ligne ~1240)
- [ ] Extraire mois/année de `selectedWeekStart`
- [ ] Déclencher setTimeout 500ms si dernière semaine
- [ ] **VALIDATION UTILISATEUR** : Console.log affiche mois détecté ✅

#### Étape 1.3 : Créer composant pop-up (2h)
- [ ] Créer fichier `/components/PopupBilanMensuel.js`
- [ ] Implémenter structure (overlay + carte centrée)
- [ ] Ajouter titre, message, 2 boutons (Voir/Plus tard)
- [ ] Styles CSS responsive mobile/desktop
- [ ] Accessibilité (Tab, Enter, Escape, ARIA)
- [ ] **VALIDATION UTILISATEUR** : Pop-up s'affiche après validation S4 ✅

#### Étape 1.4 : Tests intégration Phase 1 (1h)
- [ ] Test : Validation S1-S3 → Pas de pop-up
- [ ] Test : Validation S4 janvier → Pop-up affiché
- [ ] Test : Clic "Plus tard" → Pop-up ferme
- [ ] Test : Clic "Voir" → Prépare Phase 2
- [ ] Test : Navigation clavier pop-up
- [ ] **VALIDATION UTILISATEUR** : Phase 1 complète ✅

---

### 📊 PHASE 2 : Structure Modale Vide (Jour 1 - 3h)

**Objectif :** Afficher modale bilan mensuel vide avec structure 6 sections

#### Étape 2.1 : Créer composant modale (1h30)
- [ ] Créer fichier `/components/BilanMensuelModal.js`
- [ ] Implémenter structure hooks (useState loading, donnees, error)
- [ ] Ajouter header modale (titre "Bilan Mensuel - Janvier 2026")
- [ ] Créer structure 6 sections accordéon (titres uniquement)
- [ ] Bouton fermeture (X) et "Consulter bilan S4"
- [ ] **VALIDATION UTILISATEUR** : Modale vide s'affiche ✅

#### Étape 2.2 : Intégrer modale dans suivi.js (1h)
- [ ] Importer `BilanMensuelModal` dans suivi.js
- [ ] Ajouter rendu conditionnel (ligne ~2100)
- [ ] Connecter états `showBilanMensuel`, `moisBilan`
- [ ] Handler fermeture modale
- [ ] Handler "Consulter bilan S4" (TODO Phase 6)
- [ ] **VALIDATION UTILISATEUR** : Clic "Voir" pop-up → Modale ouvre ✅

#### Étape 2.3 : Tests navigation (30min)
- [ ] Test : Fermeture modale (bouton X)
- [ ] Test : Fermeture modale (clic overlay)
- [ ] Test : Escape ferme modale
- [ ] Test : Sections accordéon (open/close)
- [ ] **VALIDATION UTILISATEUR** : Navigation fluide ✅

---

### 🧮 PHASE 3 : Section 1 - Tendance Poids (Jour 2 - 4h)

**Objectif :** Afficher évolution poids, objectif, trajectoire

#### Étape 3.1 : Créer fonctions calcul (1h30)
- [ ] Créer fichier `/lib/calculsBilanMensuel.js`
- [ ] Fonction `calculerTendancePoids(repas, profil)`
- [ ] Extraire poids début/fin mois depuis profil
- [ ] Calculer évolution kg, pourcentage atteint
- [ ] Calculer rythme moyen kg/semaine
- [ ] Tests unitaires (5 cas)
- [ ] **VALIDATION UTILISATEUR** : Console.log valeurs correctes ✅

#### Étape 3.2 : Requête données poids (1h)
- [ ] useEffect chargement données dans BilanMensuelModal
- [ ] Requête Supabase : profil + historique poids mois
- [ ] Gestion loading/error états
- [ ] Appel `calculerTendancePoids` avec données
- [ ] **VALIDATION UTILISATEUR** : Logs montrent données chargées ✅

#### Étape 3.3 : Affichage Section 1 (1h)
- [ ] Créer composant `<SectionTendancePoids />`
- [ ] Afficher évolution (-2.8 kg, de 78.5 → 75.7 kg)
- [ ] Afficher objectif (Réalisé à 93%)
- [ ] Afficher rythme moyen (-0.7 kg/semaine)
- [ ] Verbatim dynamique trajectoire (sur la bonne voie / à ajuster)
- [ ] **VALIDATION UTILISATEUR** : Section 1 complète et cohérente ✅

#### Étape 3.4 : Tests cas limites (30min)
- [ ] Test : Perte poids > objectif → Message adaptation
- [ ] Test : Prise poids (objectif surplus) → Message cohérent
- [ ] Test : Pas de pesées ce mois → Message "Données manquantes"
- [ ] **VALIDATION UTILISATEUR** : Tous cas gérés ✅

---

### 💰 PHASE 4 : Section 2 - Budget Calorique (Jour 2 - 3h)

**Objectif :** Afficher budget vs consommé, répartition repas/extras

#### Étape 4.1 : Créer fonctions calcul (1h)
- [ ] Fonction `calculerBudgetMensuel(repas, budgetJournalier)`
- [ ] Calculer budget total mois (budgetJournalier × nb jours)
- [ ] Calculer consommé total (sum kcal tous repas)
- [ ] Calculer solde (consommé - budget)
- [ ] Calculer répartition repas/extras (pourcentages)
- [ ] **VALIDATION UTILISATEUR** : Console.log calculs OK ✅

#### Étape 4.2 : Requête données repas (1h)
- [ ] Requête Supabase : tous repas du mois (filtrage date exact)
- [ ] Filtrage par date calendaire (1er-31 janvier)
- [ ] Gestion chevauchement semaine/mois
- [ ] Appel `calculerBudgetMensuel`
- [ ] **VALIDATION UTILISATEUR** : Logs montrent repas filtrés ✅

#### Étape 4.3 : Affichage Section 2 (1h)
- [ ] Créer composant `<SectionBudgetCalorique />`
- [ ] Afficher budget total, consommé, solde
- [ ] Afficher répartition repas/extras (91% / 9%)
- [ ] Verbatim dynamique dépassement extras
- [ ] Code couleur solde (vert/orange/rouge)
- [ ] **VALIDATION UTILISATEUR** : Section 2 claire ✅

---

### 🔍 PHASE 5 : Section 3 - Patterns Comportementaux (Jour 3 - 4h)

**Objectif :** Identifier forces, points amélioration, insights temporels

#### Étape 5.1 : Créer fonctions analyse patterns (2h)
- [ ] Fonction `calculerPatterns(repas)`
- [ ] Détecter jours avec repas structurés (%)
- [ ] Analyser répartition temporelle extras (matin/midi/soir/nuit)
- [ ] Identifier jours récurrents difficiles (ex: jeudis)
- [ ] Corréler humeur/extras par semaine
- [ ] Calculer satiété moyenne mensuelle
- [ ] **VALIDATION UTILISATEUR** : Logs patterns détectés ✅

#### Étape 5.2 : Affichage Section 3 (1h30)
- [ ] Créer composant `<SectionPatterns />`
- [ ] Bloc "Forces" (liste points positifs)
- [ ] Bloc "Points amélioration" (liste vigilances)
- [ ] Bloc "Insight" (message clé personnalisé)
- [ ] Verbatims dynamiques selon patterns détectés
- [ ] **VALIDATION UTILISATEUR** : Insights pertinents ✅

#### Étape 5.3 : Tests patterns (30min)
- [ ] Test : Mois parfait → Uniquement forces affichées
- [ ] Test : Extras concentrés soir → Insight ciblé
- [ ] Test : Corrélation humeur/extras → Message adapté
- [ ] **VALIDATION UTILISATEUR** : Tous scénarios OK ✅

---

### 🥗 PHASE 6 : Section 4 - Qualité Nutritionnelle (Jour 3 - 3h)

**Objectif :** Afficher répartition QN, progression vs N-1

#### Étape 6.1 : Créer fonctions calcul QN (1h30)
- [ ] Fonction `calculerQualiteMoyenne(repas, referentiel)`
- [ ] Mapper QN aliments (join avec referentiel.js)
- [ ] Calculer QN moyen mensuel (moyenne pondérée)
- [ ] Calculer distribution QN (% QN1 à QN5)
- [ ] Comparer vs mois précédent (progression)
- [ ] **VALIDATION UTILISATEUR** : Console.log QN OK ✅

#### Étape 6.2 : Affichage Section 4 (1h)
- [ ] Créer composant `<SectionQualiteNutritionnelle />`
- [ ] Afficher QN moyen (3.8/5)
- [ ] Graphique distribution QN (barres ou camembert)
- [ ] Afficher progression vs N-1 (+5% QN5)
- [ ] Verbatim encouragement progression
- [ ] **VALIDATION UTILISATEUR** : Section 4 lisible ✅

#### Étape 6.3 : Tests QN (30min)
- [ ] Test : Mois sans QN → Message "Données manquantes"
- [ ] Test : Premier mois → Pas de comparaison N-1
- [ ] Test : Progression négative → Message adapté
- [ ] **VALIDATION UTILISATEUR** : Gestion cas limites ✅

---

### 😊 PHASE 7 : Section 5 - Ressenti & Bien-être (Jour 4 - 2h30)

**Objectif :** Agréger humeur/satiété, identifier semaines critiques

#### Étape 7.1 : Créer fonctions agrégation (1h)
- [ ] Fonction `calculerRessentiGlobal(repas)`
- [ ] Calculer humeur dominante mensuelle (mode)
- [ ] Calculer satiété moyenne mensuelle
- [ ] Agréger ressentis par semaine
- [ ] Identifier semaines critiques (humeur basse, satiété faible)
- [ ] **VALIDATION UTILISATEUR** : Console.log ressentis ✅

#### Étape 7.2 : Affichage Section 5 (1h)
- [ ] Créer composant `<SectionRessenti />`
- [ ] Afficher humeur dominante (Satisfait 45%)
- [ ] Afficher satiété moyenne (4.2/5)
- [ ] Timeline 4 semaines (mini-graphique évolution)
- [ ] Verbatim capacité rebond après semaine difficile
- [ ] **VALIDATION UTILISATEUR** : Section 5 cohérente ✅

#### Étape 7.3 : Tests ressenti (30min)
- [ ] Test : Mois sans ressenti → Message adapté
- [ ] Test : Semaine critique identifiée → Mise en avant
- [ ] **VALIDATION UTILISATEUR** : Gestion OK ✅

---

### 🎯 PHASE 8 : Section 6 - Projection Mois Prochain (Jour 4 - 4h)

**Objectif :** Objectifs, ajustements stratégiques, points contrôle

#### Étape 8.1 : Créer fonctions projection (2h)
- [ ] Fonction `genererProjection(statsMois, objectif, profil)`
- [ ] Définir objectif poids mois suivant (routeurPoids.js)
- [ ] Calculer budget extras mensuel recommandé
- [ ] Générer défi personnalisé (ex: "Jeudis protégés")
- [ ] Proposer 3 ajustements stratégiques
- [ ] Planifier 4 points contrôle hebdomadaires
- [ ] **VALIDATION UTILISATEUR** : Console.log projection ✅

#### Étape 8.2 : Affichage Section 6 (1h30)
- [ ] Créer composant `<SectionProjection />`
- [ ] Bloc objectifs (perte, budget extras, défi)
- [ ] Bloc ajustements recommandés (3 actions)
- [ ] Bloc points contrôle (timeline 4 semaines)
- [ ] Verbatim motivation final
- [ ] **VALIDATION UTILISATEUR** : Section 6 inspirante ✅

#### Étape 8.3 : Tests projection (30min)
- [ ] Test : Objectif maintien → Ajustements adaptés
- [ ] Test : Objectif surplus → Projection cohérente
- [ ] **VALIDATION UTILISATEUR** : Tous objectifs OK ✅

---

### 🔗 PHASE 9 : Lien Bilan Hebdo & Historique (Jour 5 - 3h)

**Objectif :** Navigation bilan mensuel ↔ hebdo, archivage

#### Étape 9.1 : Lien consultation bilan hebdo (1h)
- [ ] Ajouter bouton "Consulter bilan semaine X" en bas modale
- [ ] Handler fermeture bilan mensuel + ouverture bilan hebdo
- [ ] Passer `selectedWeekStart` correspondant à S4
- [ ] Test navigation modale → modale
- [ ] **VALIDATION UTILISATEUR** : Navigation fluide ✅

#### Étape 9.2 : Sauvegarde base données (1h)
- [ ] Migration table `bilans_mensuels` (SQL)
- [ ] Ajout index performance
- [ ] Fonction sauvegarde après calculs
- [ ] Test insertion/lecture BDD
- [ ] **VALIDATION UTILISATEUR** : Données persistées ✅

#### Étape 9.3 : Historique bilans mensuels (1h)
- [ ] Ajouter section "Historique" dans modale ou page dédiée
- [ ] Requête bilans mois antérieurs (user_id)
- [ ] Affichage liste cliquable (Janvier, Décembre, Novembre...)
- [ ] Test consultation ancien bilan
- [ ] **VALIDATION UTILISATEUR** : Historique accessible ✅

---

### ✅ PHASE 10 : Tests Finaux & Validation (Jour 5 - 4h)

**Objectif :** Tests complets, non-régression, accessibilité, performance

#### Étape 10.1 : Tests 15 cas limite (2h)
- [ ] Cas 1 : Mois complet 30j → OK
- [ ] Cas 2 : Mois incomplet 10j → Message "Données partielles"
- [ ] Cas 3 : Aucun repas → Message explicite
- [ ] Cas 4 : Validation retard (10 fév, bilan janv) → OK
- [ ] Cas 5 : Premier mois utilisateur → Pas comparaison N-1
- [ ] Cas 6 : Validation 31 décembre → Détection année OK
- [ ] Cas 7 : Février 28j → Pas d'erreur
- [ ] Cas 8 : Utilisateur compte dernier jour mois → OK
- [ ] Cas 9 : Extras > budget → Alerte visuelle
- [ ] Cas 10 : Objectif surplus → Projection cohérente
- [ ] Cas 11 : QN manquant → Section 4 adaptée
- [ ] Cas 12 : Ressenti vide → Section 5 adaptée
- [ ] Cas 13 : Performance 150 repas → < 2s
- [ ] Cas 14 : Mobile responsive → OK
- [ ] Cas 15 : Navigation clavier → Accessible
- [ ] **VALIDATION UTILISATEUR** : 15/15 cas passent ✅

#### Étape 10.2 : Tests non-régression (1h)
- [ ] Bilan hebdo S1-S4 fonctionne toujours
- [ ] Validation semaine S2 → Pas de pop-up mensuel
- [ ] Calculs apportsTotaux, extras inchangés
- [ ] Performance page suivi.js normale
- [ ] **VALIDATION UTILISATEUR** : Aucune régression ✅

#### Étape 10.3 : Tests accessibilité (1h)
- [ ] Navigation Tab/Enter/Escape (pop-up + modale)
- [ ] Attributs ARIA complets
- [ ] Contraste couleurs WCAG AA (≥ 4.5:1)
- [ ] Test screen reader (NVDA/VoiceOver)
- [ ] **VALIDATION UTILISATEUR** : Accessible ✅

---

## 📊 RÉCAPITULATIF ESTIMATION

| Phase | Objectif | Durée | Jour |
|-------|----------|-------|------|
| Phase 1 | Détection & Pop-up | 6h | Jour 1 |
| Phase 2 | Structure Modale Vide | 3h | Jour 1 |
| Phase 3 | Section 1 - Tendance Poids | 4h | Jour 2 |
| Phase 4 | Section 2 - Budget Calorique | 3h | Jour 2 |
| Phase 5 | Section 3 - Patterns | 4h | Jour 3 |
| Phase 6 | Section 4 - Qualité Nutritionnelle | 3h | Jour 3 |
| Phase 7 | Section 5 - Ressenti | 2h30 | Jour 4 |
| Phase 8 | Section 6 - Projection | 4h | Jour 4 |
| Phase 9 | Liens & Historique | 3h | Jour 5 |
| Phase 10 | Tests Finaux | 4h | Jour 5 |
| **TOTAL** | **10 Phases** | **36h30** | **~5 jours** |

---

## ✅ CHECKLIST VALIDATION PROGRESSIVE

**Chaque phase nécessite validation utilisateur AVANT passage suivante :**

- [ ] Phase 1 validée : Détection + Pop-up ✅
- [ ] Phase 2 validée : Modale structure vide ✅
- [ ] Phase 3 validée : Section 1 Tendance Poids ✅
- [ ] Phase 4 validée : Section 2 Budget ✅
- [ ] Phase 5 validée : Section 3 Patterns ✅
- [ ] Phase 6 validée : Section 4 QN ✅
- [ ] Phase 7 validée : Section 5 Ressenti ✅
- [ ] Phase 8 validée : Section 6 Projection ✅
- [ ] Phase 9 validée : Liens & Historique ✅
- [ ] Phase 10 validée : Tests finaux ✅

**Validation finale utilisateur :**
- [ ] Toutes phases complètes et fonctionnelles
- [ ] Aucune régression détectée
- [ ] Performance acceptable (< 2s)
- [ ] Accessibilité conforme WCAG AA
- [ ] **Merge branche main autorisé** ✅

---

## 🎯 PROCHAINES ÉTAPES

**Après validation utilisateur de ce plan :**

1. **Backup base données** (critique avant toute modif)
2. **Créer branche Git :** `feature/bilan-mensuel`
3. **Implémenter Phase 1** (détection fin mois)
4. **Tests Phase 1** → Validation avant Phase 2
5. **Implémenter Phase 2-6** (itératif avec validations intermédiaires)
6. **Tests complets Phase 6**
7. **Validation finale utilisateur**
8. **Merge branche main**

---

**⚠️ RAPPEL : Aucune ligne de code ne sera produite tant que ce plan n'est pas explicitement validé par l'utilisateur.**

---

*Plan d'implémentation créé le 21 janvier 2026*  
*Conforme Template Copilot strict*  
*En attente validation utilisateur*
