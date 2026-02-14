MOTEUR CALORIQUE + TENDANCE (PERTE / MAINTIEN / SURPLUS) — VERSION CONSOLIDÉE
0) Objectif du module
Permettre à l’app :
de calculer automatiquement, pour n’importe quel profil, les calories de maintien (TDEE)


de classer la tendance en perte / maintien / surplus via une moyenne glissante


de convertir une partie des apports en unités visuelles (ex : féculents en cuillères à soupe – CAS)


de produire des signaux et des ajustements pour les repas suivants (sans attendre le changement de poids)



1) Entrées utilisateur (profil)
sexe (F/H)


âge (années)


taille (cm)


poids (kg)


niveau d’activité (sédentaire / faible / modéré / élevé / très élevé)


objectif (perte / maintien / surplus)


unité visuelle préférée (ici : CAS pour féculents cuits)



2) Calcul du métabolisme de base (BMR) — Mifflin–St Jeor
Référence clinique courante.
Femme :
BMR = (10 × poids_kg) + (6,25 × taille_cm) − (5 × âge) − 161
Homme :
BMR = (10 × poids_kg) + (6,25 × taille_cm) − (5 × âge) + 5

3) Calcul du maintien calorique (TDEE)
TDEE = BMR × facteur_activité
Facteurs usuels :
sédentaire : 1.2


faible : 1.375


modéré : 1.55


élevé : 1.725


très élevé : 1.9


Sortie : TDEE_kcal_jour
Note app : le “maintien réel” se confirme par observation sur 2–3 semaines, mais le TDEE est le point de départ scientifique.

4) Calcul du bilan énergétique quotidien
Chaque jour, l’app calcule :
écart_jour = apports_jour_kcal − TDEE_kcal_jour
écart_jour < 0 : déficit


écart_jour ≈ 0 : maintien


écart_jour > 0 : surplus



5) Fenêtres temporelles (échelle de temps / timer)
Principe : le corps réagit sur des moyennes, pas sur une journée.
Fenêtres recommandées :
24h : info (ne pas décider)


3 jours : alerte douce (signal faible)


7 jours : décision (signal fiable)


14–21 jours : validation (tendance réelle)


À calculer :
cumul_3j = somme(écart_jour sur les 3 derniers jours)


cumul_7j = somme(écart_jour sur les 7 derniers jours)


option : cumul_14j



6) Règle énergie ↔ poids (projection)
Constante pratique :
~ 7700 kcal ≈ 1 kg de masse grasse (approximation utile pour projection)


Projection hebdo :
kg_théorique_7j = cumul_7j / 7700
Important UX : afficher comme tendance, pas comme vérité absolue (eau/glycogène influencent le poids court terme).

7) Classification tendance (sur 7 jours)
Seuils (pragmatiques, stables, faciles à interpréter) :
Tendance perte si cumul_7j ≤ −1500 kcal


Tendance maintien si −500 kcal ≤ cumul_7j ≤ +500 kcal


Tendance surplus si cumul_7j ≥ +1500 kcal


Zones intermédiaires (entre −1500 et −500 / entre +500 et +1500) :
classer “léger déficit” / “léger surplus” ou “zone grise”


afficher un message “tendance faible, à confirmer”



8) Conversion visuelle : féculents en cuillères à soupe (CAS)
Objectif : guider sans balance.
Définition (féculents cuits) :
1 CAS rase ≈ 20–25 g cuits


Base énergie simplifiée pour l’app : 1 CAS ≈ 25 kcal (moyenne utile)


Calcul :
kcal_féculents = CAS_féculents × 25
Note : plus tard, l’app peut proposer un coefficient par aliment (riz/pâtes/lentilles), mais la base à 25 kcal/CAS permet la stabilité et la simplicité.

9) Règles CAS par objectif (repères journaliers)
Ces repères servent à “re-cadrer” l’utilisateur sans compter finement.
Perte : 6 à 10 CAS / jour


Maintien : 14 à 18 CAS / jour


Surplus : 20 CAS et + / jour


Répartition conseillée (optionnelle) :
Perte : midi 6–8 CAS, soir 0–2 CAS


Maintien : midi 8–9 CAS, soir 6–8 CAS



10) Système de signaux (anticipation)
L’app déclenche des signaux avant que le poids change.
Exemples :
Si cumul_3j > +600 kcal → signal “orange” (tendance hausse probable si ça continue)


Si cumul_7j > +1500 kcal → signal “rouge” (surplus net)


Si cumul_7j < −2000 kcal → signal “bleu foncé” (déficit fort : risque fatigue / adaptation)


Règle UX : jamais de message définitif sur 24h. Toujours “si tu continues…”

11) Ajustements automatiques pour le prochain repas (pilotage)
Objectif : corriger la trajectoire, pas punir.
Si tendance = surplus :
option A : retirer −2 CAS au prochain repas


option B : retirer −1 CAS + réduire la graisse visible (ex : −1 CAC huile)


option C : remplacer 2 CAS féculents par légumes (volume)


Si tendance = déficit fort :
ajouter +2 CAS sur un repas


ou répartir +1 CAS sur 2 repas


Règle : ajustements petits mais constants > gros changements.

12) Sorties du module (ce que l’app affiche)
TDEE estimé (kcal/jour)


écart_jour (kcal)


cumul_3j / cumul_7j


classification : perte / maintien / surplus (+ intensité : faible, net)


projection kg_théorique_7j (optionnelle, présentée comme tendance)


compteur de féculents en CAS/jour + position par rapport à l’objectif (perte/maintien/surplus)


recommandation simple pour le prochain repas (ajustement en CAS et/ou en graisse)



13) Garde-fous (important)
Le poids journalier fluctue (eau/glycogène) : ne pas “réagir” sur une pesée isolée


Toujours privilégier l’interprétation sur 7 jours minimum


Le module donne une trajectoire probabiliste, pas une promesse


