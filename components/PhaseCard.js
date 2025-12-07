import React, { useState } from 'react';

/**
 * PhaseCard — Composant dynamique
 * Affiche une phase de préparation, son titre, sa période, et ses critères.
 * Props :
 *   - phase (object) : { nom, explication, periode, criteres }
 *   - criteres (array) : [{ id, titre, conseil, jalon, valide, dateValidation, statut }]
 *   - onValider (function) : callback pour valider un critère (optionnel)
 *   - jCourant (number) : jour courant relatif (ex: -25, -17, -10)
 */
export default function PhaseCard({ phase, criteres = [], onValider, jCourant }) {
  // État d'expansion pour chaque critère (blocs "En savoir plus")
  const [expanded, setExpanded] = useState(criteres.map(() => false));

  // Handler pour toggler l'expansion d'un critère
  const toggleExpansion = (index) => {
    setExpanded(prev => prev.map((v, i) => i === index ? !v : v));
  };

  // Guidances pédagogiques POURQUOI/COMMENT/SUIVI pour chaque critère
  const guidancesCriteres = {
    1: {
      pourquoi: "Ton corps a perdu ses repères de satiété (tu manges trop sans t'en rendre compte). Des portions adaptées évitent de surcharger ton système digestif. Pendant le jeûne, ton estomac sera habitué à des quantités normales, ce qui rendra la transition plus facile.",
      comment: [
        "🧩 REPÈRES VISUELS SIMPLES :",
        "",
        "🤜 TON POING = 1 portion de féculents",
        "• Riz, pâtes, pommes de terre cuites",
        "• Équivalence : 6-8 cuillères à soupe bombées",
        "• Exemple : 1 poing de riz basmati = 6 c.à.s bombées",
        "",
        "🥄 1 CUILLÈRE À SOUPE = portion matières grasses",
        "• Huile d'olive, beurre, avocat",
        "• Exemple : 1 c.à.s huile d'olive pour assaisonner",
        "",
        "🍴 3-4 FOURCHETTES = portion protéines",
        "• Viande, poisson, œuf",
        "• Équivalence : paume de main (sans doigts) OU épaisseur d'un jeu de cartes",
        "• Exemple : blanc de poulet = taille de ta paume OU 4 fourchettes",
        "",
        "🥗 TES 2 MAINS EN COUPE = portion légumes",
        "• Crus ou cuits",
        "• Équivalence : 1 assiette à dessert remplie OU 10-12 cuillères à soupe",
        "• Exemple : salade verte, haricots verts, tomates",
        "",
        "💡 ASTUCE :",
        "Avant chaque repas, prépare ton assiette en visualisant ces repères. Prends le temps de mâcher (20 min minimum par repas)."
      ],
      suivi: "Tu pourras saisir tes repas quotidiens dans la page Suivi pour valider automatiquement ce critère (système de détection des portions). En attendant : question quotidienne \"Aujourd'hui, j'ai utilisé les repères visuels pour mes 3 repas\" → Oui/Non (6/7 jours minimum)"
    },
    2: {
      pourquoi: "Les féculents (pain, pâtes, riz, pommes de terre) sont riches en glucides complexes qui se transforment en glucose. Le soir, ton corps a moins besoin d'énergie car tu vas dormir. Si tu manges beaucoup de féculents tard, ton pancréas doit produire de l'insuline pour gérer ce surplus de glucose, mais comme tu ne bouges pas, le glucose est stocké en graisse. Limiter les féculents le soir habitue ton pancréas à travailler moins intensément la nuit, ce qui le prépare au repos complet pendant le jeûne.",
      comment: [
        "REPAS DU SOIR SANS FÉCULENT :",
        "Remplace par des légumes + protéines",
        "",
        "✅ EXEMPLES VALIDÉS :",
        "• Poisson + légumes vapeur + salade",
        "• Poulet + ratatouille + brocolis",
        "• Omelette + courgettes + tomates",
        "• Viande + haricots verts + carottes",
        "",
        "❌ À ÉVITER LE SOIR :",
        "• Pâtes, riz, pain, pommes de terre",
        "• Quinoa, boulgour, semoule",
        "• Pizza, sandwich, burger",
        "",
        "⚠️ SI VRAIMENT NÉCESSAIRE (faim intense) :",
        "• Maximum 3 cuillères à soupe de féculent complet (riz brun, quinoa)",
        "• Accompagné de beaucoup de légumes (2/3 de l'assiette = légumes)",
        "",
        "💡 ASTUCE :",
        "Privilégie les féculents au déjeuner (midi), moment où ton corps en a vraiment besoin pour l'énergie de l'après-midi"
      ],
      suivi: "Question quotidienne : \"Ce soir, j'ai mangé un repas sans féculent (ou maximum 3 c.à.s si nécessaire)\" → Oui/Non (5/7 jours minimum). Note : Critère automatisable via page saisie (à traiter plus tard)"
    },
    3: {
      pourquoi: "Après un repas, ton corps concentre beaucoup d'énergie sur la digestion. Si tu restes immobile (assis ou allongé), la digestion devient lente et difficile. Une activité légère juste après manger aide ton intestin à mieux fonctionner et évite les sensations de lourdeur. Pendant le jeûne, ton corps aura déjà cette bonne habitude.",
      comment: [
        "BASE RECOMMANDÉE (par jalon) :",
        "• J-17 à J-14 : 10 min de marche après repas",
        "• J-12 à J-7 : 15 min de marche après repas",
        "• J-7 à J-0 : 20 min de marche après repas",
        "",
        "📝 PERSONNALISE TON ENGAGEMENT :",
        "",
        "Action choisie : [Clique pour choisir]",
        "→ Marche / Vaisselle / Étirements / Jardinage / Autre",
        "",
        "Durée : [Clique pour choisir] minutes",
        "→ 10 min / 15 min / 20 min / Personnalisé",
        "",
        "Délai après repas : [Clique pour choisir] minutes max",
        "→ 5 min / 10 min / 15 min",
        "",
        "Exemples d'actions possibles :",
        "• Marche (intérieur ou extérieur)",
        "• Vaisselle / Rangement",
        "• Étirements doux",
        "• Jardinage léger",
        "",
        "💡 ASTUCE :",
        "Programme une alarme \"Action post-repas\" 5 min après la fin de chaque repas"
      ],
      suivi: "Définis ton engagement personnalisé ci-dessus, puis valide chaque jour : \"Aujourd'hui, j'ai fait [ton action choisie] après chaque repas\" → Oui/Non (5/7 jours minimum)"
    },
    4: {
      pourquoi: "Les produits ultra-transformés contiennent des additifs (E-, conservateurs, colorants) que ton corps ne reconnaît pas comme de la nourriture. Ton foie doit travailler en sur-régime pour éliminer ces substances. Pendant un jeûne, ton foie va se concentrer sur la détoxification naturelle : s'il est déjà fatigué par les toxines accumulées avant, il sera dépassé.",
      comment: [
        "🎯 LA RÈGLE DES 5 INGRÉDIENTS :",
        "Si l'étiquette liste + de 5 ingrédients → PRODUIT TRANSFORMÉ",
        "",
        "✅ CE QUI EST OK :",
        "• Aliments bruts (fruits, légumes, viande, poisson, œufs)",
        "• Aliments avec liste courte (ex: pain = farine, eau, sel, levure)",
        "• Fait maison > industriel (toujours)",
        "",
        "❌ À ÉLIMINER :",
        "• Plats préparés industriels (lasagnes, pizzas surgelées)",
        "• Biscuits/gâteaux emballés (> 10 ingrédients dont E-)",
        "• Charcuteries industrielles (nitrites, conservateurs)",
        "• Sauces industrielles (additifs, sucres cachés)",
        "• Snacks salés (chips, biscuits apéro)",
        "",
        "💡 ASTUCE :",
        "Lis systématiquement les étiquettes. Si tu ne comprends pas un nom d'ingrédient (ex: E621, hydroxyanisole...), ne l'achète pas."
      ],
      suivi: "Question quotidienne : \"Aujourd'hui, j'ai appliqué la règle des 5 ingrédients pour tous mes achats/repas\" → Oui/Non (5/7 jours minimum)"
    },
    5: {
      pourquoi: "Les sucreries (bonbons, chocolat, gâteaux, glaces) provoquent des pics de glycémie violents : ton taux de sucre dans le sang monte très vite, puis redescend brutalement. Cela fatigue énormément ton pancréas qui doit produire beaucoup d'insuline d'un coup. Pendant le jeûne, ton pancréas va se reposer complètement. Si tu ne l'habitues pas avant à fonctionner sans ces pics de sucre, la transition sera difficile et tu risques des malaises (hypoglycémie).",
      comment: [
        "SUPPRIMER PROGRESSIVEMENT :",
        "",
        "📅 J-14 à J-12 (3 jours) :",
        "   Maximum 1 sucrerie par jour",
        "   → Uniquement après le déjeuner (12h-14h)",
        "   → Jamais à jeun ou le soir",
        "",
        "📅 J-12 à J-7 (5 jours) :",
        "   Maximum 1 sucrerie tous les 2 jours",
        "   → Toujours après un repas complet",
        "",
        "📅 J-7 à J-0 (7 jours) :",
        "   ZÉRO sucrerie",
        "   → Transition finale avant le jeûne",
        "",
        "✅ ALTERNATIVES NATURELLES :",
        "• 1 fruit frais entier (pomme, poire, orange)",
        "• 2 dattes maximum par jour",
        "• 2 carrés de chocolat noir 70% minimum",
        "• Compote sans sucre ajouté",
        "",
        "❌ À ÉVITER COMPLÈTEMENT :",
        "• Gâteaux industriels (très transformés)",
        "• Bonbons, dragées, chewing-gums sucrés",
        "• Glaces (pics de sucre + froid)",
        "• Sodas et jus de fruits industriels",
        "• Pâtes à tartiner sucrées",
        "",
        "💡 ASTUCE :",
        "Si envie de sucré intense : bois un grand verre d'eau puis attends 10 minutes. L'envie diminue souvent naturellement (confusion soif/faim)"
      ],
      suivi: "Question quotidienne adaptée au jalon : \"Aujourd'hui, j'ai respecté mon objectif sucreries selon ma phase\" → Oui/Non (5/7 jours minimum). Note : Critère automatisable via page saisie (à traiter plus tard)"
    },
    6: {
      pourquoi: "Un jeûne de plusieurs jours (5-10 jours) représente un choc métabolique majeur pour ton corps. Sans test préalable, tu risques des malaises, vertiges, nausées sévères dès le 2e jour. Les 2 jeûnes d'entraînement permettent de vérifier ta tolérance, d'identifier tes limites, et de préparer ton métabolisme à basculer en mode \"cétose\" (utilisation des graisses comme énergie) sans danger.",
      comment: [
        "🎯 CHOISIR DURÉE DES JEÛNES :",
        "",
        "○ Option A : 2 jeûnes de 24h (critère officiel)",
        "  • Dernier repas 19h J-1 → reprise 19h J0",
        "  • Idéal pour débutants confirmés",
        "",
        "○ Option B : 2 jeûnes de 16h (alternative)",
        "  • Dernier repas 20h → petit-déjeuner 12h lendemain",
        "  • Plus accessible, limite les risques",
        "",
        "○ Option C : Durée personnalisée",
        "  ┌────────────────────────────────┐",
        "  │ Nombre de jeûnes : [2] ▼       │",
        "  │ Durée par jeûne : [18] heures  │",
        "  │                                │",
        "  │ 💡 Recommandations :           │",
        "  │    Débutant : 14-16h           │",
        "  │    Intermédiaire : 18-20h      │",
        "  │    Avancé : 24h+               │",
        "  └────────────────────────────────┘",
        "",
        "📌 RÈGLES STRICTES :",
        "• Espacement minimum 3 jours entre les 2 jeûnes",
        "• Hydratation continue (eau, tisanes non sucrées)",
        "• Repos si fatigue (pas d'effort physique intense)",
        "• Arrêt immédiat si malaise sévère",
        "",
        "💡 ASTUCE :",
        "Planifie tes jeûnes un week-end calme (moins de sollicitations, possibilité de repos)"
      ],
      suivi: "Tracker de jeûnes : Jeûne 1 (date, durée, ressenti) + Jeûne 2 (date, durée, ressenti). Validation si 2 jeûnes complétés selon durée choisie."
    },
    7: {
      pourquoi: "L'eau permet à tes reins d'évacuer les déchets que ton corps produit naturellement. Pendant un jeûne, ton organisme va puiser dans ses réserves (graisse, protéines) et cela crée beaucoup de déchets métaboliques à éliminer. Si tes reins et ton foie ne sont pas habitués à une bonne hydratation avant le jeûne, ils seront débordés pendant. Boire 2 litres par jour les prépare progressivement à cette mission d'élimination intensive.",
      comment: [
        "RÉPARTIR SUR 4 MOMENTS CLÉS :",
        "",
        "🕐 Au réveil (8h) :",
        "   1 grande bouteille OU 2 grands verres",
        "   → Réveille tes reins et active l'élimination",
        "",
        "🕐 Avant/pendant déjeuner (12h) :",
        "   1 grande bouteille OU 2 grands verres",
        "   → Aide la digestion",
        "",
        "🕐 Milieu d'après-midi (16h) :",
        "   1 grande bouteille OU 2 grands verres",
        "   → Évite la déshydratation",
        "",
        "🕐 Avant/pendant dîner (19h) :",
        "   1 grande bouteille OU 2 grands verres",
        "   → Dernière hydratation de la journée",
        "",
        "REPÈRES SIMPLES :",
        "• 1 grande bouteille = 500ml (Évian, Vittel)",
        "• 1 grand verre = 250ml (verre à eau)",
        "• OBJECTIF : 4 bouteilles OU 8 grands verres",
        "",
        "✅ CE QUI COMPTE :",
        "• Eau plate ou gazeuse",
        "• Tisanes (camomille, menthe, verveine)",
        "• Thé vert ou noir SANS sucre",
        "• Infusions de fruits SANS sucre",
        "",
        "❌ CE QUI NE COMPTE PAS :",
        "• Café (diurétique = perte d'eau)",
        "• Sodas/Jus industriels (sucre = déshydratation)",
        "• Alcool (déshydrate fortement)",
        "",
        "💡 ASTUCE :",
        "Prépare 4 bouteilles d'eau le matin et pose-les à des endroits stratégiques (bureau, cuisine, sac). Progression visuelle : 4 pleines le matin → 4 vides le soir = objectif atteint !"
      ],
      suivi: "Question quotidienne : \"Aujourd'hui, j'ai bu au minimum 2 litres d'eau/tisanes/thé sans sucre (= 4 bouteilles ou 8 grands verres)\" → Oui/Non (5/7 jours minimum). Note : Critère automatisable via page suivi (à traiter plus tard)"
    },
    8: {
      pourquoi: "Ton système digestif a besoin de 3-4 heures pour digérer un repas complet. Si tu manges après 19h et que tu te couches vers 22h-23h, ton corps digère encore pendant ton sommeil. Cela perturbe la qualité de ton sommeil (sommeil moins réparateur) et fatigue ton foie qui devrait se concentrer sur la détoxification nocturne. Manger avant 19h permet une digestion complète avant le coucher et prépare ton corps au rythme du jeûne où les horaires sont très importants.",
      comment: [
        "🎯 OBJECTIF STRICT :",
        "Dernier repas terminé avant 19h00",
        "",
        "✅ HORAIRES IDÉAUX :",
        "• Dîner entre 18h00 et 18h45",
        "• Dernière bouchée avalée avant 19h00 max",
        "",
        "📋 ORGANISATION PRATIQUE :",
        "• Prépare ton repas à l'avance si tu rentres tard du travail",
        "• Batch cooking le week-end pour la semaine (tupperware prêts au frigo)",
        "• Privilégie des repas simples et rapides :",
        "  - Salade composée (légumes + protéine)",
        "  - Omelette + légumes vapeur",
        "  - Soupe + blanc de poulet",
        "  - Poisson + crudités",
        "",
        "⚠️ SI VRAIMENT IMPOSSIBLE UN SOIR :",
        "• Opte pour un repas ultra-léger :",
        "  - Soupe de légumes + 1 fruit",
        "  - Salade verte + 1 œuf dur",
        "• ⚠️ Ce jour ne comptera pas dans la validation",
        "",
        "💡 ASTUCE :",
        "Mets une alarme à 18h15 intitulée \"Préparer dîner MAINTENANT\" pour ne pas oublier"
      ],
      suivi: "Question quotidienne : \"Ce soir, j'ai terminé mon dernier repas avant 19h00 (dernière bouchée avalée)\" → Oui/Non (5/7 jours minimum). Note : Critère automatisable via page saisie (à traiter plus tard)"
    },
    9: {
      pourquoi: "Le grignotage prolongé (manger sur 2-3h) maintient ton système digestif en activité constante, ce qui l'épuise. Ton insuline reste élevée en permanence, favorisant le stockage des graisses. Manger en 45 min max crée des fenêtres de repos digestif claires, habitue ton corps à des cycles alimentation/repos nets (essentiel pour le jeûne).",
      comment: [
        "🎯 OBJECTIF : 3 CRÉNEAUX FIXES PAR JOUR",
        "",
        "🕐 PETIT-DÉJEUNER : 8h00-9h00 (1h max)",
        "   → Commence à 8h précises",
        "   → Termine avant 9h",
        "",
        "🕐 DÉJEUNER : 12h00-13h00 (1h max)",
        "   → Commence à 12h précises",
        "   → Termine avant 13h",
        "",
        "🕐 DÎNER : 19h00-20h00 (1h max)",
        "   → Commence à 19h précises",
        "   → Termine avant 20h (idéal 18h-19h, voir Critère 8)",
        "",
        "📌 RÈGLES STRICTES :",
        "• ZÉRO grignotage entre les créneaux",
        "• Eau/tisanes autorisées en permanence",
        "• Si faim entre repas → bois 1 grand verre d'eau et attends 10 min",
        "",
        "💡 ASTUCE :",
        "Programme 3 alarmes quotidiennes :",
        "• 8h00 : \"Début petit-déjeuner\"",
        "• 12h00 : \"Début déjeuner\"",
        "• 19h00 : \"Début dîner\"",
        "",
        "Ton corps va rapidement s'habituer à ces horaires fixes et la sensation de faim se synchronisera naturellement."
      ],
      suivi: "Question quotidienne : \"Aujourd'hui, j'ai respecté mes 3 créneaux horaires fixes (petit-déj 8h-9h, déj 12h-13h, dîner 19h-20h)\" → Oui/Non (5/7 jours minimum)"
    }
  };

  return (
    <section
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '28px 24px 18px 24px',
        marginBottom: 28,
        boxShadow: '0 2px 16px 0 rgba(79,143,255,0.07)',
        border: '1px solid #E3EAF2',
        maxWidth: 700,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      <h2
        style={{
          color: '#4F8FFF',
          fontWeight: 800,
          fontSize: '1.35rem',
          fontFamily: 'Inter, Roboto, Arial, sans-serif',
          marginBottom: 6,
        }}
      >
        {phase.nom}
      </h2>
      <div style={{ color: '#6B778C', marginBottom: 10, fontSize: '1.04em', fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>{phase.explication}</div>
      <div style={{ color: '#FFD166', fontWeight: 600, marginBottom: 12, fontSize: '1.01em' }}>Période : {phase.periode}</div>
      <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
        {criteres.map((critere, index) => {
          // Calcul du statut dynamique
          const jalon = critere.jalon * -1; // Convertir J-30 → -30
          let statut = 'À VENIR';
          let couleurStatut = '#A0AEC0';
          let actionPossible = false;
          
          if (jCourant !== null && jCourant !== undefined) {
            if (jCourant < jalon) {
              statut = 'À VENIR';
              couleurStatut = '#A0AEC0';
            } else {
              // Vérifier si dans la fenêtre de validation
              const fenetre = 
                jalon === -30 ? -18 : 
                [-17, -14, -12].includes(jalon) ? -8 : 
                jalon === -7 ? 0 : jalon;
              
              if (jCourant >= jalon && jCourant <= fenetre) {
                statut = jCourant === jalon ? 'EN COURS' : 'ACTIF';
                couleurStatut = '#43D9A3';
                actionPossible = true;
              } else {
                statut = 'VERROUILLÉ';
                couleurStatut = '#FF6B6B';
              }
            }
          }
          
          return (
            <li
              key={critere.id}
              style={{
                marginBottom: 16,
                background: critere.valide ? '#F5F8FA' : statut === 'VERROUILLÉ' ? '#FFF5F5' : '#fff',
                borderRadius: 10,
                boxShadow: critere.valide ? '0 1px 6px 0 rgba(67,217,163,0.08)' : 'none',
                padding: '12px 16px',
                border: critere.valide ? '1px solid #43D9A3' : statut === 'VERROUILLÉ' ? '1px solid #FF6B6B' : '1px solid #E3EAF2',
                transition: 'all 0.2s',
                opacity: statut === 'VERROUILLÉ' && !critere.valide ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontWeight: 700, color: '#4F8FFF', fontSize: '1.07em' }}>{critere.titre}</div>
                <span style={{ 
                  fontWeight: 700, 
                  fontSize: '0.88em', 
                  color: couleurStatut,
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: statut === 'VERROUILLÉ' ? '#FFE5E5' : statut === 'À VENIR' ? '#F5F8FA' : '#E5F8F2',
                }}>
                  {statut}
                </span>
              </div>
              <div style={{ color: '#6B778C', fontSize: '0.99em', marginBottom: 2 }}>{critere.conseil}</div>
              <div style={{ color: '#A0AEC0', fontSize: '0.97em', marginBottom: 2 }}>Jalon : J-{critere.jalon}</div>
              
              {/* Bouton "En savoir plus" / "Replier" */}
              {guidancesCriteres[critere.id] && (
                <button
                  onClick={() => toggleExpansion(index)}
                  style={{
                    background: 'transparent',
                    color: '#4F8FFF',
                    border: '1px solid #4F8FFF',
                    borderRadius: 6,
                    padding: '4px 12px',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    marginTop: 6,
                    fontFamily: 'Inter, Roboto, Arial, sans-serif',
                    transition: 'all 0.2s',
                  }}
                  aria-expanded={expanded[index]}
                  aria-controls={`guidance-${critere.id}`}
                >
                  {expanded[index] ? '▲ Replier' : '▼ En savoir plus'}
                </button>
              )}

              {/* Bloc guidance expandable */}
              {expanded[index] && guidancesCriteres[critere.id] && (
                <div
                  id={`guidance-${critere.id}`}
                  style={{
                    marginTop: 12,
                    padding: 16,
                    background: '#F9FAFB',
                    borderRadius: 8,
                    border: '1px solid #E3EAF2',
                  }}
                >
                  {/* POURQUOI */}
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ color: '#4F8FFF', fontWeight: 700, fontSize: '0.95em', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: 6 }}>🧭</span> POURQUOI ?
                    </h4>
                    <p style={{ color: '#6B778C', fontSize: '0.93em', lineHeight: 1.6, margin: 0 }}>
                      {guidancesCriteres[critere.id].pourquoi}
                    </p>
                  </div>

                  {/* COMMENT FAIRE */}
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ color: '#4F8FFF', fontWeight: 700, fontSize: '0.95em', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: 6 }}>🛠️</span> COMMENT FAIRE ?
                    </h4>
                    <div style={{ color: '#6B778C', fontSize: '0.93em', lineHeight: 1.6 }}>
                      {Array.isArray(guidancesCriteres[critere.id].comment) ? (
                        guidancesCriteres[critere.id].comment.map((ligne, i) => (
                          <div key={i} style={{ marginBottom: ligne === '' ? 8 : 2 }}>
                            {ligne}
                          </div>
                        ))
                      ) : (
                        <p style={{ margin: 0 }}>{guidancesCriteres[critere.id].comment}</p>
                      )}
                    </div>
                  </div>

                  {/* SUIVI QUOTIDIEN */}
                  <div>
                    <h4 style={{ color: '#4F8FFF', fontWeight: 700, fontSize: '0.95em', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: 6 }}>📊</span> SUIVI QUOTIDIEN
                    </h4>
                    <p style={{ color: '#6B778C', fontSize: '0.93em', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                      {guidancesCriteres[critere.id].suivi}
                    </p>
                  </div>
                </div>
              )}

              {critere.valide ? (
                <span style={{ color: '#43D9A3', fontWeight: 700, fontSize: '0.99em' }}>✅ Validé le {critere.dateValidation ? new Date(critere.dateValidation).toLocaleDateString('fr-FR') : ''}</span>
              ) : statut === 'VERROUILLÉ' ? (
                <div style={{ color: '#FF6B6B', fontSize: '0.95em', marginTop: 6, fontWeight: 600 }}>
                  🔒 Ce critère devait démarrer à J-{critere.jalon}. Concentre-toi sur les critères restants.
                </div>
              ) : (
                onValider && actionPossible && (
                  <button
                    onClick={() => onValider(critere.id)}
                    style={{
                      background: '#4F8FFF',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '7px 22px',
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: 'pointer',
                      marginTop: 6,
                      boxShadow: '0 2px 8px 0 rgba(79,143,255,0.10)',
                      fontFamily: 'Inter, Roboto, Arial, sans-serif',
                      transition: 'background 0.2s',
                    }}
                    aria-label={`Valider le critère ${critere.titre}`}
                  >
                    Valider ce critère
                  </button>
                )
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
