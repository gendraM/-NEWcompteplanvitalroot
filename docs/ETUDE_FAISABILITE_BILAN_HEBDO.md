# Étude de faisabilité - Bilan Hebdomadaire Alimentaire

## 1. Synthèse métier

Le bilan hebdomadaire doit permettre à l’utilisateur de visualiser la trajectoire de son corps, sans jugement, en s’appuyant sur des moyennes et des signaux énergétiques. Il se structure en plusieurs sections :
- Signal énergétique de la semaine (déficit, maintien, surplus)
- Comparaison semaine N vs N-1
- Trajectoire sur 14 jours glissants
- Analyse des extras (budget, consommé, répartition, moments planifiés/impulsifs)
- Moments forts et fragilités
- Ressenti (satiété, humeur, notes)
- Synthèse et conseils
- Projection pour la semaine suivante

## 2. Données actuellement disponibles dans l’app

- **Apports totaux de la semaine** (kcal)
- **Objectif hebdo** (calculé via profil et routeur poids)
- **Écart hebdo** (calculé)
- **Budget extras hebdo** (calculé)
- **Extras consommés** (calculé via repas_reels)
- **Répartition des extras** (par type, moments, planifiés/impulsifs)
- **Comparaison avec semaine précédente** (apports, évolution)
- **Moyenne énergétique sur 14 jours**
- **Positionnement sur 14 jours** (déficit, maintien, surplus)
- **Moments favorables/fragilité** (à enrichir)
- **Ressenti utilisateur** (satiété, humeur, notes)

## 3. Faisabilité immédiate

### Ce qui est faisable dès maintenant
- Génération du bilan à la validation manuelle de la semaine (aucune condition métier requise)
- Affichage des signaux énergétiques, extras, comparaisons, projections, synthèse
- Utilisation des données du profil, des repas, des extras, des historiques
- Affichage des graphiques d’évolution (si données disponibles)

### Limites actuelles
- Les "moments favorables" et "moments de fragilité" sont à enrichir (actuellement peu de logique comportementale)
- Les schémas récurrents et l’ancrage sont à développer
- Les conseils personnalisés sont basiques
- La distinction entre "tableau de bord" et "page statistique" reste à clarifier

## 4. Tâches à réaliser pour le bon fonctionnement

1. **Formaliser la structure du bilan** (sections, titres, wording)
2. **Vérifier la disponibilité des données pour chaque section**
3. **Enrichir la logique de détection des moments forts/fragilité**
4. **Développer la logique d’ancrage et schémas récurrents**
5. **Améliorer la personnalisation des conseils**
6. **Clarifier le rôle de la page statistique vs tableau de bord**
7. **Prévoir l’automatisation de la génération du bilan (optionnel)**
8. **Documenter les besoins pour les tests et logs (optionnel)**

## 5. Prochaines étapes
- Valider la structure métier avec l’équipe
- Prioriser l’enrichissement des données comportementales
- Définir les specs pour la page statistique
- Préparer l’automatisation si besoin

---

**Sources consultées :**
- [docs/Fiche métier bilan de la semaine](docs/Fiche%20m%C3%A9tier%20bilan%20de%20la%20semaine)
- [components/BilanHebdoModal.js](components/BilanHebdoModal.js)
- [components/BudgetExtrasCard.js](components/BudgetExtrasCard.js)
- [components/DrawerValidation.js](components/DrawerValidation.js)

---

*Document à enrichir au fil des retours et des évolutions métier.*
