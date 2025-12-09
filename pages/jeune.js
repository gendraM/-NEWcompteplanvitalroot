import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import { genererProgrammeReprise } from "../lib/genererProgrammeReprise";
import { genererEtSauvegarderProgramme } from "../lib/jeuneUtils";
import ChecklistConseilsActivation from "../components/ChecklistConseilsActivation";
import MessageSoutien from "../components/MessageSoutien";
import AnalyseComportementale from "../components/AnalyseComportementale";
import PertePoidsEstimee from "../components/PertePoidsEstimee";

// --- Données statiques pour chaque jour de jeûne (exemple jusqu'à 10 jours, à compléter si besoin) ---
const JEUNE_DAYS_CONTENT = {
  1: {
    titre: "Jour 1 – Sortir du pilotage automatique",
    corps: [
      "🧠 Esprit : Tu remarques les automatismes, les rituels qui tournent en boucle. C'est normal : pendant des années, tu as relié certaines émotions, certains moments de ta journée, à un geste alimentaire. Là, tu ne réponds plus à ces impulsions.",
      "🧬 Corps : Ton corps utilise encore les réserves de sucre stockées dans ton foie et tes muscles (glycogène), donc tu n'es pas encore en cétose. Tu peux ressentir une envie de manger, mais c'est plus une habitude de confort qu'un vrai besoin physiologique.",
      "❤️ Ce que tu peux ressentir : De la faim mentale, un peu d'anxiété, des envies de mâcher, une sensation de manque. Ces signaux ne viennent pas toujours du corps, ils viennent de ton histoire avec la nourriture.",
      "📿 Sens & conscience : Ce jour-là, tu observes combien de fois tu as envie de manger sans avoir faim physiquement. Tu vois la différence entre un réflexe et un besoin.",
      "🧰 Outil du jour : Dès qu'une envie de manger surgit, pose-toi trois questions : 'Est-ce que j'ai vraiment faim ?' 'Quelle émotion je ressens maintenant ?' 'Qu'est-ce que je cherche vraiment à remplir ?'",
      "💡 Conseil : Note chaque fois que tu sens l'envie de manger. Écris ce qui se passait juste avant. Tu vas découvrir des patterns."
    ],
    message: "Tu sors d'un mode automatique. Là, tu vois tes habitudes en face.",
    conseilsActivation: {
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { id: 1, conseil: "Bien dormir 2 à 3 nuits de suite", benefice: "↘ cortisol, ↗ déstockage", actif: true },
        { id: 2, conseil: "Boire 2 à 3 L d'eau pure par jour", benefice: "↘ rétention, ↘ inflammation", actif: true }
      ]
    }
  },
  2: {
    titre: "Jour 2 – La transition intérieure commence",
    corps: [
      "🧠 Esprit : Tes pensées sont encore assez bruyantes. Tu peux sentir des doutes (« Pourquoi je fais ça ? »), de l'ennui, ou une envie d'abandonner. C'est le mental qui résiste, parce qu'il a perdu un outil de régulation : la nourriture.",
      "🧬 Corps : Le glycogène commence à s'épuiser. Ton foie entame la fabrication de cétones (des molécules issues de la dégradation des graisses) pour nourrir ton cerveau. Tu es entre deux mondes : tu n'es plus en mode sucre, mais pas encore pleinement en cétose.",
      "❤️ Ce que tu peux ressentir : Une petite fatigue, peut-être un léger mal de tête ou une langue chargée. C'est le signe que ton corps passe en mode nettoyage. La faim psychologique peut encore être forte.",
      "📿 Sens & conscience : C'est le moment où tu vois combien de fois la nourriture était un refuge, un calme artificiel. Tu es en train de perdre ce repère.",
      "🧰 Outil du jour : Quand une envie forte monte, prends 5 grandes respirations abdominales avant de faire quoi que ce soit. Pose ta main sur ton ventre, connecte-toi à ton corps réel.",
      "💡 Conseil : Hydrate-toi beaucoup, repose-toi, évite les situations stressantes ou les tentations inutiles. Tu passes une étape fragile."
    ],
    message: "Tu lâches un ancien réflexe. Ton corps s'adapte, ton mental négocie encore. Ça passera.",
    conseilsActivation: {
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { id: 1, conseil: "Bien dormir 2 à 3 nuits de suite", benefice: "↘ cortisol, ↗ déstockage", actif: true },
        { id: 2, conseil: "Boire 2 à 3 L d'eau pure par jour", benefice: "↘ rétention, ↘ inflammation", actif: true }
      ]
    }
  },
  3: {
    titre: "Jour 3 – Entrer dans le vrai calme du corps",
    corps: [
      "🧠 Esprit : Tes pensées commencent à ralentir. Il y a plus d'espace entre deux idées, moins de bruit de fond. Certaines personnes ressentent une forme de clarté mentale légère, d'autres juste une baisse du brouhaha intérieur.",
      "🧬 Corps : Tu commences à être en cétose plus stable. Ton foie produit maintenant régulièrement des cétones pour nourrir ton cerveau. L'autophagie (le processus où tes cellules recyclent leurs déchets internes) démarre doucement.",
      "❤️ Ce que tu peux ressentir : Moins de faim mécanique, une énergie stable (sans les hauts et les bas liés au sucre). Tu peux aussi sentir une sorte de paix inhabituelle, ou au contraire une petite tristesse diffuse.",
      "📿 Sens & conscience : Ce jour-là, tu réalises que tu peux vivre sans remplir chaque silence, chaque creux. C'est une information essentielle pour la suite.",
      "🧰 Outil du jour : Prends 10 minutes dans la journée pour t'asseoir dans le silence, sans téléphone, sans distraction. Juste toi et ton souffle.",
      "💡 Conseil : N'essaie pas de 'combler' cette journée avec mille projets. Laisse le vide être là, c'est lui qui permet au corps de faire son travail."
    ],
    message: "Tu n'es plus en lutte. Tu es en observation. Le calme commence à s'installer.",
    conseilsActivation: {
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { id: 1, conseil: "Bien dormir 2 à 3 nuits de suite", benefice: "↘ cortisol, ↗ déstockage", actif: true },
        { id: 2, conseil: "Boire 2 à 3 L d'eau pure par jour", benefice: "↘ rétention, ↘ inflammation", actif: true }
      ]
    }
  },
  4: {
    titre: "Jour 4 – Le corps répare, l'esprit respire",
    corps: [
      "🧠 Esprit : Ton système nerveux commence vraiment à se reposer. Moins de pics de stress, moins de réactions impulsives. Tu peux sentir que tes émotions sont un peu plus stables, ou au contraire qu'une vieille émotion refait surface.",
      "🧬 Corps : L'autophagie tourne maintenant à fond. Ton organisme démonte les cellules abîmées, les protéines mal formées, les débris accumulés. C'est une réparation intérieure profonde, invisible, mais essentielle.",
      "❤️ Ce que tu peux ressentir : Parfois une grosse fatigue, une envie de pleurer sans raison, ou au contraire une sensation de libération douce. Le jeûne ne fait pas que nettoyer le corps : il libère aussi des mémoires émotionnelles enfouies.",
      "📿 Sens & conscience : Ce jour-là, tu peux voir combien tu utilisais la nourriture pour gérer tes émotions. Là, tu les ressens en direct, sans coussin.",
      "🧰 Outil du jour : Si une émotion monte (tristesse, colère, peur), au lieu de la bloquer, laisse-la traverser. Pose un nom dessus : 'Là, je ressens de la tristesse.' C'est déjà beaucoup.",
      "💡 Conseil : Repose-toi, limite les stimulations (écrans, bruit, foule). Tu es en réparation intérieure, ton système nerveux a besoin de douceur, pas de dispersion."
    ],
    message: "Tu libères des couches émotionnelles anciennes. C'est normal si c'est intense.",
    conseilsActivation: {
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { id: 1, conseil: "Bien dormir 2 à 3 nuits de suite", benefice: "↘ cortisol, ↗ déstockage", actif: true },
        { id: 2, conseil: "Boire 2 à 3 L d'eau pure par jour", benefice: "↘ rétention, ↘ inflammation", actif: true },
        { id: 3, conseil: "Éviter le stress / drames / tensions", benefice: "↘ stockage ventre", actif: true },
        { id: 4, conseil: "Faire 45 min de marche douce par jour", benefice: "↗ lipolyse, ↗ énergie", actif: true }
      ]
    }
  },
  5: {
    titre: "Jour 5 – Nettoyage cellulaire & apaisement profond",
    corps: [
      "🧠 Esprit : Tu n'es plus dans l'effort. Il y a une forme d'acceptation, de lâcher-prise. Les pensées parasites diminuent. Tu es là, simplement.",
      "🧬 Corps : L'autophagie continue son travail de tri et de recyclage. Ton corps élimine les cellules endommagées, réduit l'inflammation de fond, répare les tissus. C'est un travail invisible mais fondamental.",
      "🧬 Corps (inflammation) : L'inflammation chronique commence à baisser. Tes articulations peuvent te sembler plus légères, ta peau plus nette, ton sommeil plus profond.",
      "❤️ Ce que tu peux ressentir : Une sensation de légèreté, parfois même de joie discrète sans raison. Ou au contraire une grande fatigue, un besoin de dormir beaucoup. Les deux sont normaux.",
      "📿 Sens & conscience : Tu réalises que tu peux vivre sans te remplir tout le temps. C'est une liberté nouvelle, parfois un peu vertigineuse.",
      "🧰 Outil du jour : Écris trois choses que ce jeûne t'a déjà apprises sur toi (ton rapport à la nourriture, tes émotions, tes automatismes). C'est précieux pour la suite.",
      "💡 Conseil : Continue de te reposer, de boire beaucoup, de rester dans la douceur. Tu n'es pas en train de 'performer', tu laisses ton corps faire ce qu'il sait faire."
    ],
    message: "Tu te libères d'habitudes profondes. Ton corps nettoie, ton esprit s'allège.",
    conseilsActivation: {
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { id: 1, conseil: "Bien dormir 2 à 3 nuits de suite", benefice: "↘ cortisol, ↗ déstockage", actif: true },
        { id: 2, conseil: "Boire 2 à 3 L d'eau pure par jour", benefice: "↘ rétention, ↘ inflammation", actif: true },
        { id: 3, conseil: "Éviter le stress / drames / tensions", benefice: "↘ stockage ventre", actif: true },
        { id: 4, conseil: "Faire 45 min de marche douce par jour", benefice: "↗ lipolyse, ↗ énergie", actif: true }
      ]
    }
  },
  6: {
    titre: "Jour 6 – Nettoyage profond & tri intérieur",
    corps: [
      "🧠 Esprit : Tu n'es plus en mode 'je teste', tu es en mode 'je traverse'. Ton mental est plus calme, mais il peut lancer quelques pensées du type « ça suffit, tu as assez fait ». Ce sont des réflexes de protection, pas une vérité.",
      "🧬 Corps : L'autophagie tourne à plein régime. L'autophagie, c'est ton service de ménage cellulaire : ton corps démonte les cellules fatiguées, abîmées ou inutiles pour en récupérer les bonnes pièces. Il recycle l'ancien pour construire du plus sain.",
      "🧬 Corps (suite) : Ta principale source d'énergie, ce ne sont plus les sucres mais les graisses. Le foie fabrique des corps cétoniques qui alimentent ton cerveau et tes muscles de façon plus stable. Tu es en mode énergie lente, propre et profonde.",
      "❤️ Ce que tu peux ressentir : Une fatigue propre, une sorte de lenteur lucide. Tu peux aussi sentir une fierté tranquille : tu as déjà laissé derrière toi plusieurs couches d'automatismes.",
      "📿 Sens & conscience : Ce jour-là, tu ne fais pas « juste un jeûne ». Tu permets à ton corps d'évacuer ce qu'il gardait par défaut. Tu libères de la place pour une nouvelle façon de fonctionner.",
      "🧰 Outil du jour : Si la lassitude arrive, pose une main sur ton ventre, respire profondément, et dis-toi : « Là, maintenant, mon corps démonte l'ancien. Je n'ai rien à faire, juste le laisser travailler. »",
      "💡 Conseil : Ne remplis pas ta journée pour fuir. Choisis des activités douces (lecture, marche lente, rangements simples) qui accompagnent ce tri intérieur au lieu de le masquer."
    ],
    message: "Tu ne forces plus ton corps, tu lui laisses enfin de l'espace pour faire son ménage en profondeur.",
    conseilsActivation: {
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { id: 1, conseil: "Bien dormir 2 à 3 nuits de suite", benefice: "↘ cortisol, ↗ déstockage", actif: true },
        { id: 2, conseil: "Boire 2 à 3 L d'eau pure par jour", benefice: "↘ rétention, ↘ inflammation", actif: true },
        { id: 3, conseil: "Éviter le stress / drames / tensions", benefice: "↘ stockage ventre", actif: true },
        { id: 4, conseil: "Faire 45 min de marche douce par jour", benefice: "↗ lipolyse, ↗ énergie", actif: true }
      ]
    }
  },
  7: {
    titre: "Jour 7 – Autophagie maximale & reset de l'inflammation",
    corps: [
      "🧠 Esprit : Tu bascules d'un 'effort' ponctuel vers une nouvelle normalité intérieure. Tu te rends compte que tu peux vivre sans répondre à chaque envie. C'est une information énorme pour la suite.",
      "🧬 Corps : Ton corps continue l'autophagie, mais à ce stade il s'attaque à des choses plus profondes : protéines abîmées, déchets accumulés, cellules qui ne fonctionnent plus bien. C'est un vrai tri biologique.",
      "🧬 Corps (inflammation) : Les marqueurs de l'inflammation diminuent. Concrètement, cela prépare moins de douleurs de fond, moins de fatigue diffuse, moins de réactions excessives. Tu construis un terrain plus tranquille pour la suite de ta vie.",
      "🛡 Immunité : Ton système immunitaire profite du jeûne pour se réorganiser : les cellules immunitaires les plus faibles sont éliminées pour laisser la place à des cellules plus efficaces. Tu ne le vois pas, mais tu renforces tes défenses.",
      "❤️ Ce que tu peux ressentir : Un mélange de fatigue, de paix, et parfois une émotion qui remonte sans raison claire. Laisse-la traverser. Elle fait partie du tri.",
      "📿 Sens & conscience : Dans beaucoup de traditions, 7 symbolise l'achèvement d'un cycle. Ici, c'est un palier : ton corps t'a fait confiance pendant 7 jours, tu peux maintenant lui faire confiance aussi.",
      "🧰 Outil du jour : Prends quelques minutes pour noter noir sur blanc ce que tu sens de différent depuis le jour 1 (corps, émotions, pensées). Tu donnes un visage concret à ce que ton jeûne est en train de transformer.",
      "💡 Conseil : Aujourd'hui, l'erreur serait de te dire « bon, c'est bon, j'ai assez fait ». Tu es justement au moment où le travail devient le plus utile en profondeur."
    ],
    message: "Tu n'es plus dans la lutte contre un ancien toi. Tu commences à vivre avec un corps qui se nettoie vraiment.",
    conseilsActivation: {
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { id: 1, conseil: "Bien dormir 2 à 3 nuits de suite", benefice: "↘ cortisol, ↗ déstockage", actif: true },
        { id: 2, conseil: "Boire 2 à 3 L d'eau pure par jour", benefice: "↘ rétention, ↘ inflammation", actif: true },
        { id: 3, conseil: "Éviter le stress / drames / tensions", benefice: "↘ stockage ventre", actif: true },
        { id: 4, conseil: "Faire 45 min de marche douce par jour", benefice: "↗ lipolyse, ↗ énergie", actif: true }
      ]
    }
  },
  8: {
    titre: "Jour 8 – Sobriété intelligente & réparation silencieuse",
    corps: [
      "🧠 Esprit : Tu peux ressentir une forme d'ennui, ou un grand calme. L'ennui, ce n'est pas un problème : c'est l'espace qui se crée quand tu ne remplis plus tout par la nourriture ou les distractions.",
      "🧬 Corps : Ton organisme s'est adapté à la cétose. Il brûle les graisses de façon plus efficace, avec moins de variations d'énergie. Il n'est plus en panique, il est en mode économie intelligente : tout ce qui est inutile est mis de côté.",
      "🧬 Corps (réparation) : Pendant que tu ne manges pas, ton système digestif, tes muqueuses et ta paroi intestinale ont enfin le temps de se réparer. C'est comme fermer un chantier au public pour faire de vrais travaux.",
      "❤️ Ce que tu peux ressentir : Une sensation de vide propre, parfois accompagnée d'une légère tristesse ou nostalgie. C'est normal : tu t'es longtemps rempli pour ne pas sentir ces zones-là. Maintenant, tu les vois.",
      "📿 Sens & conscience : Tu n'es pas en manque, tu es en simplification. Tu apprends à vivre en contact direct avec tes sensations, sans coussin alimentaire par-dessus.",
      "🧰 Outil du jour : Quand l'ennui, la tristesse ou le vide se pointent, au lieu de les fuir, nomme-les : « Là, je ressens du vide », « Là, je ressens de la tristesse ». Tu les regardes, tu ne les manges plus.",
      "💡 Conseil : Ne rajoute pas 1000 projets pour combler ce vide. Laisse-toi au moins un moment dans la journée où il ne se passe 'rien'. C'est là que ton jeûne travaille aussi sur ta vie intérieure."
    ],
    message: "Tu apprends à ne plus remplir systématiquement le vide. Tu le regardes, et c'est déjà une transformation majeure.",
    conseilsActivation: {
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { id: 1, conseil: "Bien dormir 2 à 3 nuits de suite", benefice: "↘ cortisol, ↗ déstockage", actif: true },
        { id: 2, conseil: "Boire 2 à 3 L d'eau pure par jour", benefice: "↘ rétention, ↘ inflammation", actif: true },
        { id: 3, conseil: "Éviter le stress / drames / tensions", benefice: "↘ stockage ventre", actif: true },
        { id: 4, conseil: "Faire 45 min de marche douce par jour", benefice: "↗ lipolyse, ↗ énergie", actif: true },
        { id: 5, conseil: "Continuer encore 1-2 jours de jeûne", benefice: "↗ transition vers déstockage profond", actif: true }
      ]
    }
  },
  9: {
    titre: "Jour 9 – Cerveau clair & énergie épurée",
    corps: [
      "🧠 Esprit : Ton cerveau fonctionne depuis plusieurs jours aux corps cétoniques. C'est un carburant plus stable que le sucre : moins de montagnes russes émotionnelles, plus de continuité, plus de recul.",
      "🧬 Corps : L'autophagie continue son travail de fond, mais le bénéfice le plus visible ici est souvent dans le mental : capacité de concentration plus longue, pensées plus organisées, décisions plus simples.",
      "🧬 Corps (protection) : Les cétones ont aussi un rôle protecteur pour les neurones. Tu n'es pas en train d'« épuiser ton cerveau », tu lui offres un environnement différent, plus calme et moins agressé par les variations de sucre.",
      "❤️ Ce que tu peux ressentir : Une impression de voir plus clair sur certaines choses de ta vie (relations, habitudes, projets). Comme si le brouillard tombait doucement.",
      "📿 Sens & conscience : Ce jour-là, le jeûne n'est plus seulement un travail sur le corps. Il devient un espace de discernement : ce qui est aligné ressort, ce qui ne l'est pas se voit davantage.",
      "🧰 Outil du jour : Note trois choses que tu vois plus clairement aujourd'hui (une vérité sur ton corps, une vérité sur ton alimentation, une vérité sur ta vie). Ce sont des trésors de cette période.",
      "💡 Conseil : Ne prends pas encore de grandes décisions pratiques (rupture, déménagement, etc.). Contente-toi d'observer ce qui se clarifie. Les décisions viendront plus tard, avec la reprise."
    ],
    message: "Ce n'est pas seulement ton corps qui se nettoie. C'est aussi ta façon de voir ta vie qui devient plus nette.",
    conseilsActivation: {
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { id: 1, conseil: "Bien dormir 2 à 3 nuits de suite", benefice: "↘ cortisol, ↗ déstockage", actif: true },
        { id: 2, conseil: "Boire 2 à 3 L d'eau pure par jour", benefice: "↘ rétention, ↘ inflammation", actif: true },
        { id: 3, conseil: "Éviter le stress / drames / tensions", benefice: "↘ stockage ventre", actif: true },
        { id: 4, conseil: "Faire 45 min de marche douce par jour", benefice: "↗ lipolyse, ↗ énergie", actif: true },
        { id: 5, conseil: "Continuer encore 1-2 jours de jeûne", benefice: "↗ transition vers déstockage profond", actif: true }
      ]
    }
  },
  10: {
    titre: "Jour 10 – Ralentissement sacré & protection de l'avenir",
    corps: [
      "🧠 Esprit : Tu peux te sentir très calme, ou au contraire un peu las. Ce n'est pas de la déprime, c'est souvent le signe que ton système a ralenti pour économiser l'énergie pendant qu'il finit son travail intérieur.",
      "🧬 Corps : Ton métabolisme de base peut légèrement baisser pour protéger tes réserves. Ce n'est pas un 'bug', c'est une stratégie de survie intelligente : ton corps gère au mieux avec ce que tu lui donnes (ou plutôt ce que tu ne lui donnes pas).",
      "🧬 Corps (bilan) : Tu as laissé plusieurs jours d'autophagie faire son œuvre, diminué l'inflammation, laissé ton système digestif se reposer, permis à ton immunité de se réorganiser. Ce sont des bases de long terme, pas juste un 'coup de detox'.",
      "❤️ Ce que tu peux ressentir : Une grande envie que ce soit bientôt fini, mélangée à la conscience que quelque chose d'important s'est passé en toi. C'est normal d'être ambivalente à ce stade.",
      "📿 Sens & conscience : Le 10ᵉ jour n'est pas le moment de te prouver quelque chose. C'est le moment de reconnaître ce qui a été vécu. Tu n'es plus la personne du jour 0, même si le miroir ne te montre pas encore tout.",
      "🧰 Outil du jour : Prends un temps au calme pour répondre à ces deux questions : « Qu'est-ce que ce jeûne m'a appris sur mon corps ? » et « Qu'est-ce qu'il m'a appris sur ma façon de me nourrir (au sens large) ? »",
      "💡 Conseil : Commence à préparer intérieurement ta reprise. La façon dont tu vas remettre les aliments compte autant que le jeûne lui-même. Tu n'es pas en train de 'finir un challenge', tu es en train de préparer une nouvelle base."
    ],
    message: "Tu n'es pas allée 'au bout de toi'. Tu as posé des fondations. La suite va dépendre de la façon dont tu vas en prendre soin.",
    conseilsActivation: {
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { id: 1, conseil: "Bien dormir 2 à 3 nuits de suite", benefice: "↘ cortisol, ↗ déstockage", actif: true },
        { id: 2, conseil: "Boire 2 à 3 L d'eau pure par jour", benefice: "↘ rétention, ↘ inflammation", actif: true },
        { id: 3, conseil: "Éviter le stress / drames / tensions", benefice: "↘ stockage ventre", actif: true },
        { id: 4, conseil: "Faire 45 min de marche douce par jour", benefice: "↗ lipolyse, ↗ énergie", actif: true },
        { id: 5, conseil: "Continuer encore 1-2 jours de jeûne", benefice: "↗ transition vers déstockage profond", actif: true }
      ]
    }
  },
  11: {
    titre: "Jour 11 – Corps allégé, esprit lucide",
    corps: [
      "🧠 Esprit : Tu perçois plus finement ce qui t'habite. Les pensées parasites sont moins nombreuses, comme si tu avais plus d'espace dedans. Tu remarques plus facilement ce qui t'alourdit… et ce qui te fait du bien.",
      "🧬 Corps : Le travail de tri cellulaire se poursuit. L'autophagie ne s'arrête pas brusquement : elle continue tant qu'il y a des cellules inutiles ou fatiguées à recycler. C'est un entretien profond, pas un sprint.",
      "🧬 Corps (énergie) : Tes réserves de sucre sont à zéro depuis longtemps, mais ton cerveau utilise des corps cétoniques de manière fluide. C'est pour cela que tu peux te sentir plus stable, moins dans le 'haut/bas'.",
      "❤️ Ce que tu peux ressentir : Une sensation de simplicité intérieure. Comme si beaucoup de choses devenaient évidentes sans effort. Parfois aussi un petit vertige face à ce calme.",
      "📿 Sens & conscience : Aujourd'hui, tu vois la réalité de ton corps sans filtre. Pas ce que la faim te dicte, pas ce que les émotions réclament : ce qui est là, vraiment.",
      "🧰 Outil du jour : Écris une phrase commençant par \'Je me sens…\' et laisse ton corps continuer la phrase. Pas ton mental. Ta sensation. Ton état du moment.",
      "💡 Conseil : Ne remplis pas ce calme. Laisse-le s'installer. C'est un des plus grands bénéfices du jeûne long : un esprit moins bruyant."
    ],
    message: "Ton corps fait le ménage. Ton esprit voit plus clair parce qu'il n'est plus encombré.",
    conseilsActivation: {
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { id: 1, conseil: "Bien dormir 2 à 3 nuits de suite", benefice: "↘ cortisol, ↗ déstockage", actif: true },
        { id: 2, conseil: "Boire 2 à 3 L d'eau pure par jour", benefice: "↘ rétention, ↘ inflammation", actif: true },
        { id: 3, conseil: "Éviter le stress / drames / tensions", benefice: "↘ stockage ventre", actif: true },
        { id: 4, conseil: "Faire 45 min de marche douce par jour", benefice: "↗ lipolyse, ↗ énergie", actif: true },
        { id: 5, conseil: "Continuer encore 1-2 jours de jeûne", benefice: "↗ transition vers déstockage profond", actif: true }
      ]
    }
  },
  12: {
    titre: "Jour 12 – Réparation silencieuse & vérité intérieure",
    corps: [
      "🧠 Esprit : Tu remarques peut-être que certaines choses qui te stressaient beaucoup te touchent différemment. Tu as plus de recul, plus de hauteur. C'est normal : sans digestion permanente, ton système nerveux est moins surchargé.",
      "🧬 Corps : Tes cellules continuent de recycler leurs déchets internes. C'est comme si ton organisme vidait une cave où tu n'allais jamais. Il enlève ce qui nuisait, nettoie ce qui stagnait.",
      "🧬 Corps (neurologie) : Les cétones servent aussi de carburant aux neurones. Elles stabilisent l'humeur et soutiennent la concentration. Tu n'es pas 'affaibli', tu fonctionnes juste autrement, avec un carburant plus propre.",
      "❤️ Ce que tu peux ressentir : Des souvenirs, des intuitions, ou des prises de conscience spontanées. Quand le corps nettoie, l'esprit libère aussi ce qui était en arrière-plan.",
      "📿 Sens & conscience : Ce jour-là, beaucoup de personnes ressentent une vérité intérieure plus nette. Pas des grandes révélations, juste une honnêteté avec soi qu'on ne sent pas d'habitude.",
      "🧰 Outil du jour : Demande-toi : « Qu'est-ce que mon corps essaie de me dire aujourd'hui ? ». Juste ça. Et écris la première idée qui vient.",
      "💡 Conseil : Protège ton énergie. Évite les discussions lourdes, les écrans agressifs, les sollicitations inutiles. Tu es en profondeur : reste-y."
    ],
    message: "Quand ton corps nettoie, ton esprit dit la vérité. C'est une porte précieuse.",
    conseilsActivation: {
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { id: 1, conseil: "Bien dormir 2 à 3 nuits de suite", benefice: "↘ cortisol, ↗ déstockage", actif: true },
        { id: 2, conseil: "Boire 2 à 3 L d'eau pure par jour", benefice: "↘ rétention, ↘ inflammation", actif: true },
        { id: 3, conseil: "Éviter le stress / drames / tensions", benefice: "↘ stockage ventre", actif: true },
        { id: 4, conseil: "Faire 45 min de marche douce par jour", benefice: "↗ lipolyse, ↗ énergie", actif: true },
        { id: 5, conseil: "Continuer encore 1-2 jours de jeûne", benefice: "↗ transition vers déstockage profond", actif: true }
      ]
    }
  },
  13: {
    titre: "Jour 13 – Transition intérieure & vigilance consciente",
    corps: [
      "🧠 Esprit : Tu ressens une forme de maturité émotionnelle. Tu ne réagis pas comme avant. Tu observes avant d'agir. C'est un signe que ton système nerveux est stabilisé.",
      "🧬 Corps : L'autophagie ralentit doucement, mais ne s'arrête pas. Le corps continue d'économiser l'énergie pour réparer en profondeur. C'est une phase de 'finition', pas un arrêt.",
      "🧬 Corps (digestion) : Ton système digestif est totalement au repos depuis plusieurs jours. C'est une chance rare : il a reconstruit ses muqueuses, apaisé les irritations, rééquilibré une partie du microbiote.",
      "❤️ Ce que tu peux ressentir : Un mélange de fragilité et de force. Comme si tu étais plus sensible, mais aussi plus centrée.",
      "📿 Sens & conscience : Tu perçois que tu arrives à la limite d'un cycle, mais tu n'y es pas encore. C'est comme marcher sur la ligne entre la fin et le nouveau départ.",
      "🧰 Outil du jour : Prépare ton premier repas dans ta tête. Imagine-le. Visualise-le. Cela t'évite de sortir du jeûne dans la précipitation ou l'incohérence.",
      "💡 Conseil : Aujourd'hui, la vigilance est ta meilleure alliée. Ce n'est pas le moment d'être impulsive ou dispersée. Tu arrives dans une zone sensible."
    ],
    message: "Tu n'es pas faible. Tu es en transition. Et une transition, ça demande douceur et vigilance.",
    conseilsActivation: {
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { id: 1, conseil: "Bien dormir 2 à 3 nuits de suite", benefice: "↘ cortisol, ↗ déstockage", actif: true },
        { id: 2, conseil: "Boire 2 à 3 L d'eau pure par jour", benefice: "↘ rétention, ↘ inflammation", actif: true },
        { id: 3, conseil: "Éviter le stress / drames / tensions", benefice: "↘ stockage ventre", actif: true },
        { id: 4, conseil: "Faire 45 min de marche douce par jour", benefice: "↗ lipolyse, ↗ énergie", actif: true },
        { id: 5, conseil: "Continuer encore 1-2 jours de jeûne", benefice: "↗ transition vers déstockage profond", actif: true }
      ]
    }
  },
  13: {
    titre: "Jour 14 – Zone sacrée & sortie maîtrisée",
    corps: [
      "🧠 Esprit : Tu peux ressentir une forme de paix que tu ne ressens pas souvent. Ce n'est pas un miracle : c'est le résultat de 14 jours sans surcharge, sans pics glycémiques, sans digestion continue.",
      "🧬 Corps : Le rythme interne ralentit volontairement pour te protéger. Tu es dans une zone où chaque décision compte. Ton corps n'est plus en urgence, mais en finesse.",
      "🧬 Corps (pré-reprise) : Les organes sont prêts à redémarrer, mais doucement. Il ne faut pas les brusquer : la première bouchée doit être une ouverture, pas une agression.",
      "❤️ Ce que tu peux ressentir : Une grande fierté, une émotion douce, et en même temps une petite peur de 'mal sortir'. C'est normal : tu protèges ce que tu as construit.",
      "📿 Sens & conscience : Le 14ᵉ jour est une zone sacrée. C'est la fin d'une traversée intérieure. Tu quittes un espace où ton corps t'a montré ce qu'il sait faire quand on lui laisse de la place.",
      "🧰 Outil du jour : Prépare ton bouillon, tes légumes cuits, ton eau tiède. Prépare aussi ton état d'esprit : reprends comme quelqu'un qui respecte son corps, pas comme quelqu'un qui a 'tenu un challenge'.",
      "💡 Conseil : La sortie du jeûne est une continuité, pas une rupture. Garde le même esprit de connexion pour les premières bouchées. Elles comptent autant que les 14 jours."
    ],
    message: "Tu quittes le désert. Mais tu n'en perds pas la paix. Ramène-la avec toi dans ton assiette.",
    conseilsActivation: {
      titre: "💪 Conseils d'activation (booste les bénéfices)",
      items: [
        { id: 1, conseil: "Bien dormir 2 à 3 nuits de suite", benefice: "↘ cortisol, ↗ déstockage", actif: true },
        { id: 2, conseil: "Boire 2 à 3 L d'eau pure par jour", benefice: "↘ rétention, ↘ inflammation", actif: true },
        { id: 3, conseil: "Éviter le stress / drames / tensions", benefice: "↘ stockage ventre", actif: true },
        { id: 4, conseil: "Faire 45 min de marche douce par jour", benefice: "↗ lipolyse, ↗ énergie", actif: true },
        { id: 5, conseil: "Continuer encore 1-2 jours de jeûne", benefice: "↗ transition vers déstockage profond", actif: true }
      ]
    }
  }
};

const SUPPORT_MESSAGES = [
  "Ce n’est pas l’absence de nourriture qui est difficile, c’est la négociation intérieure. Tu tiens ton cap.",
  "Chaque heure passée est une victoire sur tes anciens schémas.",
  "Ton corps apprend à se libérer, ton esprit à s’apaiser.",
  "Tu n’es pas en restriction. Tu es en libération.",
  "Tiens-toi droite, tu nettoies ce que ton mental ne pouvait plus porter seul."
];

const OUTILS_SUGGESTIONS = [
  "Respiration profonde",
  "Lecture inspirante",
  "Prière ou méditation",
  "Marche en nature",
  "Écriture d’un journal",
  "Musique apaisante",
  "Soutien d’un proche"
];
// === FONCTIONS ASYNC SUPABASE (REMPLACENT MOCKDATA) ===
async function getRepasRecentsAsync() {
  const { data } = await supabase
    .from('repas_reels')
    .select('aliment, categorie, est_extra')
    .order('date', { ascending: false })
    .limit(3);
  
  return data || [];
}

async function fetchPoidsDepart() {
  const { data: profil } = await supabase
    .from('profil')
    .select('poids_de_depart')
    .limit(1)
    .single();
  
  if (profil?.poids_de_depart) return profil.poids_de_depart;
  
  const { data: historique } = await supabase
    .from('historique_poids')
    .select('poids')
    .order('date', { ascending: false })
    .limit(1)
    .single();
  
  if (historique?.poids) return historique.poids;
  
  return null;
}

async function getDernierRepasAsync() {
  const { data } = await supabase
    .from('repas_reels')
    .select('aliment, categorie')
    .order('date', { ascending: false })
    .limit(1)
    .single();
  
  return data || null;
}
// === FIN FONCTIONS ASYNC ===


function analyseComportementale(repasRecents = []) {
  const extras = repasRecents.reduce((acc, r) => acc + (r.est_extra ? 1 : 0), 0);
  const categories = {};
  repasRecents.forEach(r => {
    categories[r.categorie] = (categories[r.categorie] || 0) + 1;
  });
  let dominant = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || "équilibre";
  return {
    repasRecents,
    extras,
    dominant,
    message: `Tu avais consommé ${extras} extras sur les 3 derniers jours. Catégorie dominante : ${dominant}. Ce jeûne est une vraie rupture. Tu es en train de couper une boucle.`
  };
}

function pertePoidsEstimee(poids, duree) {
  if (!poids || !duree) return null;
  const min = parseFloat((duree * 0.3).toFixed(1));
  const max = parseFloat((duree * 0.45).toFixed(1));
  const moyenne = parseFloat(((min + max) / 2).toFixed(1));
  return {
    poids,
    duree,
    min,
    max,
    moyenne
  };
}

function getRepasRecents() {
  return [
    { est_extra: true, categorie: "féculent" },
    { est_extra: false, categorie: "sucre" },
    { est_extra: true, categorie: "féculent" }
  ];
}

function getPoidsDepart() {
  return 72.4;
}

function getDernierRepas() {
  return { aliment: "Pâtes", categorie: "féculent" };
}

function loadState(key, def) {
  if (typeof window === "undefined") return def;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : def;
  } catch {
    return def;
  }
}
function saveState(key, val) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

export default function Jeune() {
  // Méthodologie : hooks d'état en premier
  const router = useRouter();
  // === HOOKS D'ÉTAT (INITIALISATION EN PREMIER) ===
  // Initialisation avec valeurs par défaut (pas localStorage pour éviter hydration error)
  const [dureeJeune, setDureeJeune] = useState(5);
  const [jourEnCours, setJourEnCours] = useState(1);
  const [joursValides, setJoursValides] = useState([]);
  const [poidsInitial, setPoidsInitial] = useState(0);
  const [messagePerso, setMessagePerso] = useState("");
  const [showMessagePerso, setShowMessagePerso] = useState(false);
  const [outils, setOutils] = useState({});
  const [outilInput, setOutilInput] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [dateDebutJeune, setDateDebutJeune] = useState(null);
  const [programmeReprise, setProgrammeReprise] = useState(null);
  const [alerteJ3, setAlerteJ3] = useState(null);
  const [loadingProgramme, setLoadingProgramme] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [planRepriseValide, setPlanRepriseValide] = useState(null);
  const [planValideCoherent, setPlanValideCoherent] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Hooks pour données Supabase réelles
  const [repasRecentsSupabase, setRepasRecentsSupabase] = useState([]);
  const [poidsDepart, setPoidsDepart] = useState(null);
  const [dernierRepasSupabase, setDernierRepasSupabase] = useState(null);
  const [loadingDonneesJeune, setLoadingDonneesJeune] = useState(true);
  const [donneesManquantes, setDonneesManquantes] = useState({ poids: false, repas: false });

  // === NOUVEAUX HOOKS POUR LES 4 AJOUTS ===
  const [conseilsActivation, setConseilsActivation] = useState({});
  const [messagePersoJour, setMessagePersoJour] = useState({});
  const [analyseComportementaleData, setAnalyseComportementaleData] = useState(null);
  const [pertePoidsEstimeeData, setPertePoidsEstimeeData] = useState(null);

  // === VARIABLES CALCULÉES ===
  const repasRecents = loadingDonneesJeune 
    ? getRepasRecents() 
    : (repasRecentsSupabase.length > 0 ? repasRecentsSupabase : getRepasRecents());
  
  const analyse = analyseComportementale(repasRecents);
  
  const dernierRepas = loadingDonneesJeune 
    ? getDernierRepas() 
    : (dernierRepasSupabase || getDernierRepas());

  // === EFFETS (APRÈS HOOKS) ===
  // Charger depuis localStorage au montage client (évite hydration error)
  useEffect(() => {
    setIsClient(true);
    
    // Récupération du bilan de préparation au jeûne
    let bilanPrepa = null;
    try {
      const bilanStr = loadState("bilanPreparationJeune", null);
      if (bilanStr) {
        bilanPrepa = typeof bilanStr === 'string' ? JSON.parse(bilanStr) : bilanStr;
      }
    } catch (e) {
      console.error("⚠️ Bilan préparation corrompu :", e);
    }
    
    // CORRECTION: Lire la durée depuis preparationData.duration (source fiable)
    let dureeFiable = bilanPrepa?.dureeJeune || 5;
    try {
      const prepDataStr = localStorage.getItem("preparationData");
      if (prepDataStr) {
        const prepData = JSON.parse(prepDataStr);
        if (prepData.duration) {
          dureeFiable = prepData.duration;
        }
      }
    } catch (e) {
      console.error("⚠️ preparationData corrompu lors lecture durée :", e);
    }
    
    setDureeJeune(loadState("dureeJeune", dureeFiable));
    
    // Lire la date depuis preparationData.startDate (source fiable)
    let dateDebut = null;
    
    // Priorité 1 : preparationData.startDate (date de début de préparation = date de début de jeûne)
    try {
      const prepDataStr = localStorage.getItem("preparationData");
      if (prepDataStr) {
        const prepData = JSON.parse(prepDataStr);
        dateDebut = prepData.startDate || null;
      }
    } catch (e) {
      console.error("⚠️ preparationData corrompu :", e);
    }
    
    // Priorité 2 : dateDebutJeune dans localStorage
    if (!dateDebut && typeof window !== "undefined") {
      const dateFromStorage = localStorage.getItem("dateDebutJeune");
      if (dateFromStorage) {
        let dateClean = dateFromStorage.replace(/^"|"$/g, '');
        dateDebut = dateClean.split('T')[0];
      }
    }
    
    setDateDebutJeune(dateDebut);
    
    // Calcul du jour en cours depuis la date réelle de début
    if (dateDebut) {
      const diffMs = Date.now() - new Date(dateDebut).getTime();
      const diffJours = Math.floor(diffMs / (1000*60*60*24)) + 1;
      const duree = loadState("dureeJeune", dureeFiable); // Utiliser la durée déjà calculée
      const jourCalcule = Math.max(1, Math.min(diffJours, duree));
      setJourEnCours(jourCalcule);
    } else {
      setJourEnCours(loadState("jourEnCours", 1));
    }
    
    // CORRECTION: Vérifier si c'est une nouvelle préparation (reset nécessaire)
    let joursValidesActuels = loadState("joursValides", []);
    try {
      const prepDataStr = localStorage.getItem("preparationData");
      const dernierePrepStr = localStorage.getItem("dernierePreparationId");
      
      if (prepDataStr) {
        const prepData = JSON.parse(prepDataStr);
        const prepId = `${prepData.startDate}_${prepData.duration}`;
        
        // Si changement de préparation (date ou durée différente), reset
        if (dernierePrepStr !== prepId) {
          console.log("🔄 Nouvelle préparation détectée, réinitialisation des jours validés");
          joursValidesActuels = [];
          localStorage.setItem("dernierePreparationId", prepId);
          localStorage.setItem("joursValides", JSON.stringify([]));
        }
      }
    } catch (e) {
      console.error("⚠️ Erreur détection nouvelle préparation:", e);
    }
    
    // Nettoyer les jours validés supérieurs à la durée actuelle (données corrompues)
    const joursValidesNettoyes = joursValidesActuels.filter(j => j <= dureeFiable);
    if (joursValidesNettoyes.length !== joursValidesActuels.length) {
      console.log(`🧹 Nettoyage: ${joursValidesActuels.length - joursValidesNettoyes.length} jours invalides supprimés`);
      joursValidesActuels = joursValidesNettoyes;
      localStorage.setItem("joursValides", JSON.stringify(joursValidesNettoyes));
    }
    
    setJoursValides(joursValidesActuels);
    console.log(`📊 Initialisation: ${joursValidesActuels.length} jours validés sur ${dureeFiable} jours total`);
    
    setPoidsInitial(loadState("poidsDepart", bilanPrepa?.poids_depart || 0));
    
    // Récupération du message personnel depuis le bilan de préparation
    const msgPerso = bilanPrepa?.messagePerso || loadState("messagePerso", "");
    setMessagePerso(msgPerso);
    
    setOutils(loadState("outilsJeune", {}));
    const savedProgramme = loadState("programmeReprise", null);
    if (savedProgramme) setProgrammeReprise(savedProgramme);
    // Lire le plan validé si présent et vérifier la cohérence
    try {
      const planValide = localStorage.getItem("programmeRepriseValide");
      if (planValide) {
        const parsed = JSON.parse(planValide);
        setPlanRepriseValide(parsed);
        // Vérification stricte de cohérence (dates et durée)
        const jeuneDuree = loadState("dureeJeune", 5);
        const jeuneDebut = loadState("dateDebutJeune", null);
        if (
          parsed &&
          parsed.duree_jeune_jours === jeuneDuree &&
          parsed.date_debut_jeune === jeuneDebut
        ) {
          setPlanValideCoherent(true);
        } else {
          // Purge si incohérent
          localStorage.removeItem("programmeRepriseValide");
          setPlanRepriseValide(null);
          setPlanValideCoherent(false);
        }
      } else {
        setPlanValideCoherent(false);
      }
    } catch {
      setPlanValideCoherent(false);
    }
  }, []);

  // Afficher le modal de validation si retour de validation
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.validation === "success") {
      setShowValidationModal(true);
    }
  }, [router.isReady, router.query.validation]);

  // Sauvegarder dans localStorage quand les valeurs changent
  useEffect(() => { if (isClient) saveState("dureeJeune", dureeJeune); }, [dureeJeune, isClient]);
  useEffect(() => { if (isClient) saveState("jourEnCours", jourEnCours); }, [jourEnCours, isClient]);
  useEffect(() => { if (isClient) saveState("joursValides", joursValides); }, [joursValides, isClient]);
  useEffect(() => { if (isClient) saveState("poidsDepart", poidsDepart); }, [poidsDepart, isClient]);
  useEffect(() => { if (isClient) saveState("messagePerso", messagePerso); }, [messagePerso, isClient]);
  useEffect(() => { if (isClient) saveState("outilsJeune", outils); }, [outils, isClient]);
  useEffect(() => { if (isClient) saveState("dateDebutJeune", dateDebutJeune); }, [dateDebutJeune, isClient]);

  // Chargement des données Supabase au montage (mono-utilisateur)
  useEffect(() => {
    if (!isClient) return; // Attendre montage client (éviter SSR)
    
    async function chargerDonneesJeune() {
      setLoadingDonneesJeune(true);
      
      // Charger en parallèle
      const [repas, poids, dernierRepas] = await Promise.all([
        getRepasRecentsAsync(),
        fetchPoidsDepart(),
        getDernierRepasAsync()
      ]);
      
      setRepasRecentsSupabase(repas);
      setDernierRepasSupabase(dernierRepas);
      
      // Détecter données manquantes
      const manquantes = {
        poids: poids === null,
        repas: repas.length === 0
      };
      setDonneesManquantes(manquantes);
      
      // Si poids manquant, rediriger vers profil
      if (poids === null) {
        alert("Veuillez renseigner votre poids de départ pour commencer le jeûne.");
        router.push('/profil');
        return;
      }
      
      setPoidsDepart(poids);
      setLoadingDonneesJeune(false);
    }
    
    chargerDonneesJeune();
  }, [isClient, router]);

  // Initialiser date de début du jeûne si pas définie
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard
    
    // Ne pas écraser si date vient de preparationData
    const prepDataStr = localStorage.getItem("preparationData");
    const hasPreparationDate = prepDataStr && JSON.parse(prepDataStr)?.startDate;
    
    if (!dateDebutJeune && jourEnCours === 1 && !hasPreparationDate) {
      const aujourdhui = new Date().toISOString().split('T')[0];
      setDateDebutJeune(aujourdhui);
    }
  }, [dateDebutJeune, jourEnCours]);

  // Vérification J-3 (détection automatique)
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard
    if (!dateDebutJeune || !dureeJeune) return;

    const dateFin = new Date(dateDebutJeune);
    dateFin.setDate(dateFin.getDate() + dureeJeune - 1);
    const dateFinStr = dateFin.toISOString().split('T')[0];

    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    const fin = new Date(dateFinStr);
    fin.setHours(0, 0, 0, 0);
    const diffTime = fin - aujourdhui;
    const joursRestants = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Détection J-3, J-2, J-1
    if (joursRestants >= 0 && joursRestants <= 3 && !programmeReprise) {
      const urgence = joursRestants < 3;
      setAlerteJ3({
        joursRestants,
        urgence,
        message: urgence 
          ? `⚠️ URGENT : J-${joursRestants} ! Génère ton programme de reprise MAINTENANT.`
          : `🎯 J-${joursRestants} ! C'est le moment de préparer ta reprise alimentaire.`
      });
    } else {
      setAlerteJ3(null);
    }
  }, [dateDebutJeune, dureeJeune, jourEnCours, programmeReprise]);

  // === NOUVEAUX EFFETS POUR LES 4 AJOUTS ===
  
  // Charger les conseils d'activation depuis localStorage
  useEffect(() => {
    if (isClient) {
      const conseils = loadState('conseilsActivationJeune', {});
      setConseilsActivation(conseils);
    }
  }, [isClient]);

  // Sauvegarder les conseils d'activation
  useEffect(() => {
    if (isClient && Object.keys(conseilsActivation).length > 0) {
      saveState('conseilsActivationJeune', conseilsActivation);
    }
  }, [conseilsActivation, isClient]);

  // Charger les messages personnalisés
  useEffect(() => {
    if (isClient) {
      const messages = loadState('messagesPersoJeune', {});
      setMessagePersoJour(messages);
    }
  }, [isClient]);

  // Sauvegarder les messages personnalisés
  useEffect(() => {
    if (isClient && Object.keys(messagePersoJour).length > 0) {
      saveState('messagesPersoJeune', messagePersoJour);
    }
  }, [messagePersoJour, isClient]);

  // Calculer l'analyse comportementale et la perte de poids estimée
  useEffect(() => {
    if (repasRecentsSupabase.length > 0 && poidsDepart) {
      const analyse = analyseComportementale(repasRecentsSupabase);
      setAnalyseComportementaleData(analyse);
      
      const perte = pertePoidsEstimee(poidsDepart, dureeJeune);
      setPertePoidsEstimeeData(perte);
    }
  }, [repasRecentsSupabase, poidsDepart, dureeJeune]);

  // === FONCTIONS HANDLERS (AVANT LE RENDER) ===

  const validerJour = () => {
    // Vérifier que le jour affiché n'est pas dans le futur
    if (dateDebutJeune) {
      const aujourdhui = new Date();
      const debut = new Date(dateDebutJeune);
      const joursEcoules = Math.floor((aujourdhui - debut) / (1000*60*60*24)) + 1;
      
      if (jourEnCours > joursEcoules) {
        alert(`⚠️ Tu ne peux pas valider le jour ${jourEnCours} car nous sommes seulement au jour ${joursEcoules} du jeûne.`);
        return;
      }
    }
    
    // Vérification séquentielle : tous les jours précédents doivent être validés
    for (let j = 1; j < jourEnCours; j++) {
      if (!joursValides.includes(j)) {
        alert(`⚠️ Tu dois d'abord valider le jour ${j} avant de valider le jour ${jourEnCours}.\n\nUtilise les boutons "← Jour précédent" pour revenir en arrière.`);
        return;
      }
    }
    
    if (!joursValides.includes(jourEnCours)) {
      const nv = [...joursValides, jourEnCours].sort((a, b) => a - b);
      setJoursValides(nv);
      
      // Avancer automatiquement au jour suivant si possible
      if (jourEnCours < dureeJeune) {
        setJourEnCours(jourEnCours + 1);
      }
    }
  };

  const ajouterOutil = () => {
    if (!outilInput.trim()) return;
    setOutils({
      ...outils,
      [jourEnCours]: [...(outils[jourEnCours] || []), outilInput.trim()]
    });
    setOutilInput("");
  };

  const genererProgrammeRepriseManuel = async () => {
    if (!dateDebutJeune || !dureeJeune) {
      alert("Données manquantes pour générer le programme");
      return;
    }

    setLoadingProgramme(true);
    try {
      const dateFin = new Date(dateDebutJeune);
      dateFin.setDate(dateFin.getDate() + dureeJeune - 1);
      const dateFinStr = dateFin.toISOString().split('T')[0];

      // Tenter de récupérer l'utilisateur, mais ne pas bloquer si absent
      let userId;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      } catch {}

      let programmeSauvegarde;
      if (userId) {
        // Utilisateur connecté : sauvegarde Supabase
        programmeSauvegarde = await genererEtSauvegarderProgramme(userId, {
          id: null,
          duree_jours: dureeJeune,
          date_fin: dateFinStr,
          poids_depart: poidsDepart
        });
        if (!programmeSauvegarde) throw new Error("Échec de la sauvegarde du programme");
        setProgrammeReprise(programmeSauvegarde);
        saveState("programmeReprise", programmeSauvegarde);
        setAlerteJ3(null);
        alert(`✅ Programme généré et sauvegardé ! ${programmeSauvegarde.duree_reprise_jours} jours de reprise créés.`);
      } else {
        // Génération locale strictement sans userId (comme ideaux)
        const programme = genererProgrammeReprise({
          dureeJeune,
          poidsDepart,
          dateFin: dateFinStr,
          options: {
            genere_automatiquement: true,
            genere_le: new Date().toISOString()
          }
        });
        programmeSauvegarde = {
          ...programme,
          id: null,
          statut: 'proposition',
          plan_genere_le: new Date().toISOString()
        };
        setProgrammeReprise(programmeSauvegarde);
        saveState("programmeReprise", programmeSauvegarde);
        setAlerteJ3(null);
        alert(`✅ Programme généré localement ! ${programmeSauvegarde.duree_reprise_jours} jours de reprise créés. Connecte-toi pour sauvegarder définitivement.`);
      }
    } catch (error) {
      console.error("Erreur génération:", error);
      alert(`❌ Erreur : ${error.message}`);
    } finally {
      setLoadingProgramme(false);
    }
  };

  const resetJeune = () => {
    setDureeJeune(5);
    setJourEnCours(1);
    setJoursValides([]);
    setPoidsDepart(getPoidsDepart());
    setMessagePerso("");
    setOutils({});
    setDateDebutJeune(null);
    setProgrammeReprise(null);
    setAlerteJ3(null);
    localStorage.removeItem("programmeReprise");
  };

  // === NOUVEAUX HANDLERS POUR LES 4 AJOUTS ===

  const toggleConseil = (conseilId) => {
    setConseilsActivation(prev => ({
      ...prev,
      [jourEnCours]: {
        ...(prev[jourEnCours] || {}),
        [conseilId]: !(prev[jourEnCours]?.[conseilId])
      }
    }));
  };

  const saveMessagePerso = (message) => {
    const newMessages = {
      ...messagePersoJour,
      [jourEnCours]: message
    };
    setMessagePersoJour(newMessages);
    saveState('messagesPersoJeune', newMessages);
  };

  // === VARIABLES CALCULÉES DE RENDU (APRÈS TOUS LES HOOKS) ===

  const isFini = joursValides.length >= dureeJeune;

  // Redirection automatique vers la page de reprise alimentaire après jeûne quand le jeûne est fini
  useEffect(() => {
    if (isFini && programmeReprise) {
      // Sauvegarder le plan validé dans localStorage (clé dédiée)
      localStorage.setItem('programmeRepriseValide', JSON.stringify(programmeReprise));
      // Rediriger automatiquement (URL conforme Next.js)
      window.location.href = '/reprise-alimentaire-apres-jeune';
    }
  }, [isFini, programmeReprise]);
  // Affiche la préparation à la reprise à partir de la moitié du jeûne ou du J4
  const showReprise = !isFini && (jourEnCours >= Math.max(4, Math.ceil(dureeJeune / 2)));

  const contenuJour = JEUNE_DAYS_CONTENT[jourEnCours] || {
    titre: `Jour ${jourEnCours}`,
    corps: ["Contenu à compléter pour ce jour."],
    message: SUPPORT_MESSAGES[(jourEnCours - 1) % SUPPORT_MESSAGES.length]
  };

  // Guard SSR: afficher loader jusqu'au montage client (évite hydration error)
  if (!isClient) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", padding: 24, fontFamily: "system-ui, Arial, sans-serif", textAlign: "center" }}>
        <h1 style={{ marginBottom: 12 }}>🌙 Mon jeûne en cours</h1>
        <div style={{ padding: "3rem", color: "#666" }}>
          ⏳ Chargement...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24, fontFamily: "system-ui, Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: 12 }}>🌙 Mon jeûne en cours</h1>

      {/* Bandeau informatif si jeûne long sans préparation */}
      {dureeJeune > 2 && !loadState("bilanPreparationJeune", null) && (
        <div style={{
          background: "#fff3cd", 
          border: "1px solid #ffc107", 
          borderRadius: 8, 
          padding: 14, 
          marginBottom: 18,
          display: "flex",
          alignItems: "start",
          gap: 10
        }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <div style={{ flex: 1, fontSize: 14, lineHeight: 1.5, color: "#856404" }}>
            <strong>Conseil :</strong> Pour un jeûne de plus de 2 jours, une préparation de 7 jours est recommandée pour optimiser les résultats et limiter les risques. Tu pourras en faire une la prochaine fois !
          </div>
        </div>
      )}

      {/* --- Accueil du jeûne actif --- */}
      <div style={{
        background: "#e3f2fd", borderRadius: 12, padding: 18, marginBottom: 18, boxShadow: "0 1px 6px #90caf9aa"
      }}>
        {/* Navigation entre les jours */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button
            onClick={() => setJourEnCours(Math.max(1, jourEnCours - 1))}
            disabled={jourEnCours === 1}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #1976d2",
              background: jourEnCours === 1 ? "#e0e0e0" : "white",
              color: jourEnCours === 1 ? "#9e9e9e" : "#1976d2",
              cursor: jourEnCours === 1 ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
              opacity: jourEnCours === 1 ? 0.5 : 1
            }}
          >
            ← Jour précédent
          </button>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0d47a1" }}>
            📆 Jour {jourEnCours} / {dureeJeune}
          </div>
          <button
            onClick={() => setJourEnCours(Math.min(dureeJeune, jourEnCours + 1))}
            disabled={jourEnCours === dureeJeune}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #1976d2",
              background: jourEnCours === dureeJeune ? "#e0e0e0" : "white",
              color: jourEnCours === dureeJeune ? "#9e9e9e" : "#1976d2",
              cursor: jourEnCours === dureeJeune ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
              opacity: jourEnCours === dureeJeune ? 0.5 : 1
            }}
          >
            Jour suivant →
          </button>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1565c0", marginBottom: 8 }}>
          {contenuJour.titre}
        </div>
        {(() => {
          // SOLUTION OPTION B : Lire directement localStorage sans passer par state React
          let dateDebut = null;
          
          try {
            // Priorité 1 : preparationData.startDate (source fiable)
            const prepDataStr = typeof window !== "undefined" ? localStorage.getItem("preparationData") : null;
            if (prepDataStr) {
              const prepData = JSON.parse(prepDataStr);
              dateDebut = prepData?.startDate;
            }
          } catch (e) {
            console.error("⚠️ Erreur lecture preparationData:", e);
          }
          
          // Priorité 2 : dateDebutJeune directe
          if (!dateDebut && typeof window !== "undefined") {
            const dateFromStorage = localStorage.getItem("dateDebutJeune");
            if (dateFromStorage) {
              let dateClean = dateFromStorage.replace(/^"|"$/g, '');
              dateDebut = dateClean.split('T')[0];
            }
          }
          
          if (!dateDebut) return null;
          
          const dateDebutObj = new Date(dateDebut);
          const dateFinPrevue = new Date(dateDebutObj.getTime() + (dureeJeune - 1) * 24 * 60 * 60 * 1000);
          
          return (
            <div style={{ marginTop: 8, fontSize: 14, color: "#1565c0", display: "flex", flexDirection: "column", gap: 4 }}>
              <div>
                🗓️ Commencé le {dateDebutObj.toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
              <div style={{ fontSize: 13, color: "#64b5f6" }}>
                Aujourd'hui : {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long',
                  day: 'numeric', 
                  month: 'long'
                })} • Fin prévue le {dateFinPrevue.toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long'
                })}
              </div>
            </div>
          );
        })()}
        <div style={{ marginTop: 6, color: "#1976d2" }}>
          {contenuJour.message}
        </div>
        <div style={{ marginTop: 10 }}>
          ⚖️ Poids de départ : <b>{poidsDepart ? `${poidsDepart} kg` : "Non renseigné"}</b>
        </div>
        <div style={{ marginTop: 4 }}>
          🍽️ Dernier repas analysé : <b>{dernierRepas.aliment}</b> ({dernierRepas.categorie})<br />
          <span style={{ color: "#888" }}>
            {dernierRepas.categorie === "féculent"
              ? "Ton dernier repas était riche en féculents. Ton foie est en train de basculer en mode cétose."
              : "Ton dernier repas était léger. Ton corps démarre le jeûne en douceur."}
          </span>
        </div>
      </div>

      {/* --- Alerte J-3 (détection automatique) --- */}
      {alerteJ3 && (
        <div style={{
          background: alerteJ3.urgence ? "#ffebee" : "#fff3e0",
          border: alerteJ3.urgence ? "2px solid #f44336" : "2px solid #ff9800",
          borderRadius: 12,
          padding: 18,
          marginBottom: 18,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: alerteJ3.urgence ? "#c62828" : "#e65100" }}>
            {alerteJ3.message}
          </div>
          <div style={{ marginBottom: 12 }}>
            {alerteJ3.urgence 
              ? "Tu dois MAINTENANT préparer ta sortie de jeûne pour éviter le syndrome de réalimentation."
              : "Profite de ces 3 derniers jours pour préparer mentalement et logistiquement ta reprise."}
          </div>
          <button
            onClick={genererProgrammeRepriseManuel}
            disabled={loadingProgramme || programmeReprise}
            style={{
              background: programmeReprise ? "#4caf50" : (alerteJ3.urgence ? "#f44336" : "#ff9800"),
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              fontWeight: 700,
              fontSize: 16,
              cursor: programmeReprise ? "default" : "pointer",
              opacity: loadingProgramme ? 0.6 : 1
            }}
          >
            {loadingProgramme ? "Génération..." : (programmeReprise ? "✅ Programme généré" : "Générer mon programme de reprise")}
          </button>
          {programmeReprise && (
            <div style={{ marginTop: 12, padding: 12, background: "#fff", borderRadius: 8 }}>
              <strong>Programme créé :</strong><br />
              {programmeReprise.duree_reprise_jours} jours de reprise<br />
              Du {programmeReprise.date_debut_reprise} au {programmeReprise.date_fin_reprise}<br />
              <button
                onClick={() => {
                  // Sauvegarder le plan validé dans localStorage (clé dédiée)
                  localStorage.setItem('programmeRepriseValide', JSON.stringify(programmeReprise));
                  window.location.href = '/reprise alimentaire après jeûne';
                }}
                style={{
                  marginTop: 8,
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  cursor: "pointer"
                }}
              >
                👀 Visualiser le plan validé
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- Indicateur chargement données --- */}
      {loadingDonneesJeune && (
        <div style={{ 
          padding: '12px', 
          background: '#fff3cd', 
          border: '1px solid #ffc107',
          borderRadius: '8px',
          marginBottom: '15px',
          fontSize: '14px',
          color: '#856404'
        }}>
          ⏳ Chargement de vos données personnelles...
        </div>
      )}

      {/* --- Invitation saisir repas si données manquantes --- */}
      {donneesManquantes.repas && jourEnCours === 1 && !loadingDonneesJeune && (
        <div style={{
          background: "#e3f2fd", border: "1px solid #64b5f6", borderRadius: 12, padding: 16, marginBottom: 18
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>📋 Améliorer votre analyse</div>
          <div style={{ marginBottom: 10 }}>
            Pour une meilleure analyse comportementale, renseignez vos 3 derniers repas avant le jeûne.
          </div>
          <button
            onClick={() => router.push('/suivi')}
            style={{
              background: "#2196f3", color: "#fff", border: "none", borderRadius: 8,
              padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14
            }}
          >
            Saisir mes repas
          </button>
        </div>
      )}

      {/* --- Analyse comportementale pré-jeûne (Jour 1 uniquement) --- */}
      {jourEnCours === 1 && !donneesManquantes.repas && (
        <div style={{
          background: "#fffde7", border: "1px solid #ffe082", borderRadius: 12, padding: 16, marginBottom: 18
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>🧾 Analyse comportementale pré-jeûne</div>
          <div>
            {analyse.message}
          </div>
        </div>
      )}

      {/* --- Message personnel (bonus) --- */}
      <div style={{ marginBottom: 18 }}>
        <button
          style={{
            background: "#ede7f6", color: "#4d148c", border: "none", borderRadius: 8,
            padding: "6px 16px", fontWeight: 600, cursor: "pointer"
          }}
          onClick={() => setShowMessagePerso(s => !s)}
        >
          {showMessagePerso ? "Masquer mon message à moi-même" : "🪞 Je me parle"}
        </button>
        {showMessagePerso && (
          <div style={{ marginTop: 8 }}>
            <textarea
              value={messagePerso}
              onChange={e => setMessagePerso(e.target.value)}
              placeholder="Écris-toi un message d’encouragement ou d’intention pour ce jeûne…"
              style={{ width: "100%", minHeight: 60, borderRadius: 8, border: "1px solid #b39ddb", padding: 8 }}
            />
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
              Ce message te sera réaffiché le jour de la reprise.
            </div>
          </div>
        )}
      </div>

      {/* --- Contenu du jour --- */}
      <div style={{
        background: "#fff", borderRadius: 12, padding: 18, marginBottom: 18, boxShadow: "0 1px 6px #bdbdbd22"
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
          {contenuJour.titre}
        </div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {contenuJour.corps.map((bloc, i) => (
            <li key={i} style={{ marginBottom: 6 }}>{bloc}</li>
          ))}
        </ul>
        <div style={{ marginTop: 12, fontStyle: "italic", color: "#1976d2" }}>
          {SUPPORT_MESSAGES[((jourEnCours - 1 + SUPPORT_MESSAGES.length) % SUPPORT_MESSAGES.length)]}
        </div>
      </div>

      {/* 🆕 AJOUT #1 : Conseils d'Activation */}
      {contenuJour.conseilsActivation && (
        <ChecklistConseilsActivation
          conseils={contenuJour.conseilsActivation.items}
          etatConseils={conseilsActivation[jourEnCours] || {}}
          onToggle={toggleConseil}
          jourEnCours={jourEnCours}
        />
      )}

      {/* 🆕 AJOUT #2 : Message de Soutien */}
      <MessageSoutien
        messageDefaut={contenuJour.message}
        messagePerso={messagePersoJour[jourEnCours] || ""}
        onSave={saveMessagePerso}
        jourEnCours={jourEnCours}
      />

      {/* --- Boîte à outils personnelle --- */}
      <div style={{
        background: "#e0f2f1", borderRadius: 12, padding: 16, marginBottom: 18
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>🧰 Ma boîte à outils du jour</div>
        <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
          Qu’est-ce qui t’a aidé aujourd’hui à tenir ?
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            value={outilInput}
            onChange={e => setOutilInput(e.target.value)}
            placeholder="Ex : respiration, prière, marche…"
            style={{ flex: 1, borderRadius: 6, border: "1px solid #80cbc4", padding: 6 }}
          />
          <button
            onClick={ajouterOutil}
            style={{
              background: "#00897b", color: "#fff", border: "none", borderRadius: 6,
              padding: "6px 14px", fontWeight: 600, cursor: "pointer"
            }}
          >
            Ajouter
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {OUTILS_SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => setOutilInput(s)}
              style={{
                background: "#fff", border: "1px solid #b2dfdb", borderRadius: 6,
                padding: "4px 10px", fontSize: 13, color: "#00897b", cursor: "pointer"
              }}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
        {outils[jourEnCours]?.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Outils utilisés aujourd’hui :</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {outils[jourEnCours].map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 🆕 AJOUT #3 : Analyse Comportementale */}
      {analyseComportementaleData && (
        <AnalyseComportementale data={analyseComportementaleData} />
      )}

      {/* 🆕 AJOUT #4 : Perte de Poids Estimée */}
      {pertePoidsEstimeeData && (
        <PertePoidsEstimee data={pertePoidsEstimeeData} />
      )}

      {/* 🆕 AJOUT #5 : Bouton Journal Spirituel */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.25)",
        textAlign: "center"
      }}>
        <button
          onClick={() => router.push('/journal-spirituel')}
          style={{
            background: "white",
            color: "#667eea",
            border: "none",
            borderRadius: 12,
            padding: "16px 32px",
            fontSize: 18,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease",
            width: "100%",
            maxWidth: 400
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          }}
        >
          🎙️ Accéder à ma restauration spirituelle
        </button>
        <p style={{ color: "white", marginTop: 12, fontSize: 14, opacity: 0.95 }}>
          💡 Enregistre tes pensées vocalement, méditations, versets...
        </p>
      </div>

      {/* --- Bloc “En savoir plus” --- */}
      <div style={{
        background: "#f3e5f5", borderRadius: 12, padding: 16, marginBottom: 18
      }}>
        <button
          style={{
            background: "#7e57c2", color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 18px", fontWeight: 600, cursor: "pointer"
          }}
          onClick={() => setShowInfo(true)}
        >
          🧬 En savoir plus sur ce qui se passe dans ton corps
        </button>
        {showInfo && (
          <div style={{
            marginTop: 12, background: "#fff", borderRadius: 8, padding: 16, boxShadow: "0 2px 8px #b39ddb33"
          }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
              {contenuJour.titre}
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {contenuJour.corps.map((bloc, i) => (
                <li key={i}>{bloc}</li>
              ))}
            </ul>
            <button
              style={{
                marginTop: 12, background: "#b39ddb", color: "#fff", border: "none", borderRadius: 8,
                padding: "6px 16px", fontWeight: 600, cursor: "pointer"
              }}
              onClick={() => setShowInfo(false)}
            >
              Fermer
            </button>
          </div>
        )}
      </div>

      {/* --- Préparation à la reprise (à partir de J4 ou moitié du jeûne) --- */}
      {showReprise && (
        <div style={{
          background: "#fffde7", border: "1px solid #ffe082", borderRadius: 12, padding: 16, marginBottom: 18
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            Préparation à la reprise alimentaire
          </div>
          <div>
            Dans {dureeJeune - jourEnCours + 1} jours, tu sortiras de ce jeûne. Ce n’est pas une fin, c’est une entrée vers une alimentation consciente.<br />
            <button
              style={{
                marginTop: 8, background: loadingProgramme ? "#90caf9" : "#1976d2", color: "#fff", border: "none", borderRadius: 8,
                padding: "6px 16px", fontWeight: 600, cursor: loadingProgramme ? "not-allowed" : "pointer", opacity: loadingProgramme ? 0.7 : 1
              }}
              disabled={loadingProgramme || planValideCoherent}
              onClick={async () => {
                setLoadingProgramme(true);
                try {
                  const dateFin = new Date(dateDebutJeune);
                  dateFin.setDate(dateFin.getDate() + dureeJeune - 1);
                  const dateFinStr = dateFin.toISOString().split('T')[0];
                  // Validation 100% locale
                  const programme = genererProgrammeReprise({
                    dureeJeune,
                    poidsDepart,
                    dateFin: dateFinStr,
                    options: {
                      genere_automatiquement: true,
                      genere_le: new Date().toISOString()
                    }
                  });
                  const programmeSauvegarde = {
                    ...programme,
                    id: null,
                    statut: 'proposition',
                    plan_genere_le: new Date().toISOString(),
                    date_debut_jeune: dateDebutJeune,
                    duree_jeune_jours: dureeJeune
                  };
                  setProgrammeReprise(programmeSauvegarde);
                  saveState("programmeReprise", programmeSauvegarde);
                  setAlerteJ3(null);
                  alert(`✅ Programme généré ! ${programmeSauvegarde.duree_reprise_jours} jours de reprise créés.`);
                  window.location.href = "/validation-plan-reprise";
                } catch (err) {
                  alert("❌ Erreur inattendue : " + err.message);
                } finally {
                  setLoadingProgramme(false);
                }
              }}
            >
              {planValideCoherent ? "Plan de reprise déjà validé" : (loadingProgramme ? "Génération du plan en cours..." : "Générer mon plan de reprise")}
            </button>
          </div>
        </div>
      )}

      {/* --- Accès au plan validé (en bas de page) --- */}
      {planValideCoherent && planRepriseValide && (
        <div style={{
          background: '#e8f5e9', border: '2px solid #43cea2', borderRadius: 12, padding: 18, margin: '32px auto 0 auto', textAlign: 'center', maxWidth: 500
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#388e3c', marginBottom: 8 }}>
            🎉 Plan de reprise validé pour ce jeûne
          </div>
          <div style={{ marginBottom: 12 }}>
            Tu peux le consulter à tout moment.
          </div>
          <button
            style={{
              background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '0.75rem 2rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(67,206,162,0.08)'
            }}
            onClick={() => {
              window.location.href = '/reprise-alimentaire-apres-jeune';
            }}
          >
            👀 Visualiser mon plan validé
          </button>
        </div>
      )}

      {/* --- Modal/encart de validation après validation --- */}
      {showValidationModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 32px #0002', minWidth: 320, maxWidth: 400, textAlign: 'center'
          }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#388e3c', marginBottom: 16 }}>
              ✅ Plan de reprise validé !
            </div>
            <div style={{ marginBottom: 24, color: '#333', fontSize: 16 }}>
              Tu peux maintenant consulter ton plan validé ou revenir à ton suivi de jeûne.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button
                style={{
                  background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
                  color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'
                }}
                onClick={() => {
                  setShowValidationModal(false);
                  window.location.href = '/reprise-alimentaire-apres-jeune';
                }}
              >
                👀 Visualiser mon plan validé
              </button>
              <button
                style={{
                  background: '#e0e0e0', color: '#333', border: 'none', borderRadius: 8, padding: '0.75rem 2rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'
                }}
                onClick={() => setShowValidationModal(false)}
              >
                ← Retour au jeûne
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Passerelle automatique vers la reprise --- */}
      {isFini && (
        <div style={{
          background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 12, padding: 20, marginBottom: 18
        }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#388e3c", marginBottom: 8 }}>
            🎉 Bravo, tu as terminé ton jeûne !
          </div>
          <div>
            Demain, tu commences ta reprise guidée de {dureeJeune * 2} jours.<br />
            Les repas sont déjà préparés dans ton planning. Tu n’as plus qu’à les suivre.
          </div>
          {messagePerso && (
            <div style={{
              marginTop: 14, background: "#fff", borderRadius: 8, padding: 12, border: "1px solid #bdbdbd"
            }}>
              <b>Ton message à toi-même :</b>
              <div style={{ marginTop: 6, color: "#4d148c" }}>{messagePerso}</div>
            </div>
          )}
          {Object.keys(outils).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <b>Voici les outils que tu as mobilisés pendant ton jeûne :</b>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {Object.entries(outils).map(([jour, outs]) =>
                  outs.map((o, i) => (
                    <li key={jour + "-" + i}>
                      Jour {jour} : {o}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
          {/* Bouton d'accès manuel à la reprise alimentaire */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button
              style={{
                background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '0.75rem 2rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(67,206,162,0.08)'
              }}
              onClick={() => {
                window.location.href = '/reprise-alimentaire-apres-jeune';
              }}
            >
              👀 Accéder à ma reprise alimentaire
            </button>
          </div>
        </div>
      )}

      {/* --- Suivi de progression --- */}
      <div style={{
        marginTop: 24, marginBottom: 18, background: "#f5f5f5", borderRadius: 8, padding: 12, textAlign: "center"
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>
          Progression : {joursValides.length} / {dureeJeune} jours validés
        </div>
        <div style={{
          height: 12, background: "#e0e0e0", borderRadius: 6, overflow: "hidden", margin: "8px 0"
        }}>
          <div style={{
            width: `${(joursValides.length / dureeJeune) * 100}%`,
            background: "#1976d2", height: "100%", borderRadius: 6, transition: "width 0.4s"
          }} />
        </div>
        <div style={{ fontSize: 13, color: "#888" }}>
          {joursValides.length < dureeJeune
            ? "Valide chaque jour pour suivre ta progression."
            : "Jeûne terminé ! Prends soin de ta reprise."}
        </div>
        
        <button
          style={{
            marginTop: 16, 
            background: joursValides.includes(jourEnCours) ? "#9e9e9e" : "#43a047", 
            color: "#fff", 
            border: "none",
            borderRadius: 8, 
            padding: "12px 28px", 
            fontWeight: 700, 
            fontSize: 16, 
            cursor: joursValides.includes(jourEnCours) ? "not-allowed" : "pointer"
          }}
          onClick={validerJour}
          disabled={joursValides.includes(jourEnCours)}
        >
          {joursValides.includes(jourEnCours) 
            ? `✅ Jour ${jourEnCours} déjà validé` 
            : `Valider le jour ${jourEnCours}`}
        </button>
        
        {/* Aide visuelle */}
        {!joursValides.includes(jourEnCours) && (() => {
          // Vérifier s'il manque des jours précédents
          const joursManquants = [];
          for (let j = 1; j < jourEnCours; j++) {
            if (!joursValides.includes(j)) {
              joursManquants.push(j);
            }
          }
          
          if (joursManquants.length > 0) {
            return (
              <div style={{ 
                marginTop: 8, 
                fontSize: 13, 
                color: "#f57c00", 
                background: "#fff3e0", 
                padding: "8px 12px", 
                borderRadius: 6,
                border: "1px solid #ffb74d"
              }}>
                ⚠️ Valide d'abord {joursManquants.length === 1 ? 'le jour' : 'les jours'} {joursManquants.join(', ')} 
                {' '}(utilise "← Jour précédent")
              </div>
            );
          }
          
          return null;
        })()}
      </div>

      {/* --- Paramètres et reset (pour tests) --- */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <label>
          Durée du jeûne (jours) :
          <input
            type="number"
            min={1}
            max={20}
            value={dureeJeune}
            onChange={e => setDureeJeune(Math.max(1, Number(e.target.value)))}
            style={{ marginLeft: 8, width: 60 }}
            disabled={joursValides.length > 0}
          />
        </label>
        <button
          style={{
            marginLeft: 16, background: "#f44336", color: "#fff", border: "none", borderRadius: 8,
            padding: "6px 16px", fontWeight: 600, cursor: "pointer"
          }}
          onClick={resetJeune}
        >
          Réinitialiser le jeûne
        </button>
      </div>
    </div>
  );
}
