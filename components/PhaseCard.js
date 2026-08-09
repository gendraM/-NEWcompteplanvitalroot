import React, { useState, useEffect } from 'react';

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

  // États pour Critère 3 - Action après repas
  const [engagement3, setEngagement3] = useState(null);
  
  // États pour Critère 6 - Jeûnes plein
  const [config6, setConfig6] = useState(null);
  const [showOptionC, setShowOptionC] = useState(false);

  // Initialisation depuis localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Init Critère 3
    try {
      const saved3 = localStorage.getItem('critere3Engagement');
      if (saved3) setEngagement3(JSON.parse(saved3));
    } catch (e) {
      console.error('Erreur parsing engagement3:', e);
      setEngagement3(null);
    }
    
    // Init Critère 6
    try {
      const saved6 = localStorage.getItem('critere6Config');
      if (saved6) setConfig6(JSON.parse(saved6));
    } catch (e) {
      console.error('Erreur parsing config6:', e);
      setConfig6(null);
    }
  }, []);

  // Handler pour toggler l'expansion d'un critère
  const toggleExpansion = (index) => {
    setExpanded(prev => prev.map((v, i) => i === index ? !v : v));
  };

  // Handler sauvegarde engagement Critère 3
  const saveEngagement3 = (action, dureeMinutes, delaiMax) => {
    const engagement = { action, dureeMinutes, delaiMax };
    setEngagement3(engagement);
    if (typeof window !== 'undefined') {
      localStorage.setItem('critere3Engagement', JSON.stringify(engagement));
    }
  };

  // Handler sauvegarde configuration Critère 6
  const saveConfig6 = (option, nombreJeunes, dureeHeures) => {
    const config = {
      option,
      nombreJeunes,
      dureeHeures,
      jeunes: Array.from({ length: nombreJeunes }, (_, i) => ({
        numero: i + 1,
        datePrevue: null,
        effectue: null,
        complete: false,
        ressenti: ''
      }))
    };
    setConfig6(config);
    if (typeof window !== 'undefined') {
      localStorage.setItem('critere6Config', JSON.stringify(config));
    }
  };

  // Handler mise à jour jeûne Critère 6
  const updateJeune6 = (index, field, value) => {
    if (!config6) return;
    
    const newConfig = { ...config6 };
    newConfig.jeunes[index][field] = value;
    
    // Marquer comme complété si : datePrevue + effectue=true + ressenti rempli
    const jeune = newConfig.jeunes[index];
    if (jeune.datePrevue && jeune.effectue === true && jeune.ressenti) {
      jeune.complete = true;
    } else {
      jeune.complete = false;
    }
    
    setConfig6(newConfig);
    if (typeof window !== 'undefined') {
      localStorage.setItem('critere6Config', JSON.stringify(newConfig));
    }
    
    // Validation auto si tous jeûnes complétés
    const allComplete = newConfig.jeunes.every(j => j.complete);
    if (allComplete && onValider) {
      // Appeler onValider pour le critère 6
      const critere6 = criteres.find(c => c.id === 6);
      if (critere6 && !critere6.valide) {
        onValider(6);
      }
    }
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
      comment: (
        <div>
          <p><strong>BASE RECOMMANDÉE (par jalon) :</strong></p>
          <ul>
            <li>J-17 à J-14 : 10 min de marche après repas</li>
            <li>J-12 à J-7 : 15 min de marche après repas</li>
            <li>J-7 à J-0 : 20 min de marche après repas</li>
          </ul>
          
          <p><strong>📝 PERSONNALISE TON ENGAGEMENT :</strong></p>
          
          {!engagement3 ? (
            <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Action choisie :
                </label>
                <select 
                  id="action3"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">-- Sélectionne une action --</option>
                  <option value="Marche">Marche (intérieur ou extérieur)</option>
                  <option value="Vaisselle">Vaisselle / Rangement</option>
                  <option value="Étirements">Étirements doux</option>
                  <option value="Jardinage">Jardinage léger</option>
                  <option value="Autre">Autre activité légère</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Durée (en minutes) :
                </label>
                <select 
                  id="duree3"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">-- Sélectionne une durée --</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="25">25 minutes (personnalisé)</option>
                  <option value="30">30 minutes (personnalisé)</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Délai maximum après le repas (en minutes) :
                </label>
                <select 
                  id="delai3"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="">-- Sélectionne un délai --</option>
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                </select>
              </div>
              
              <button
                onClick={() => {
                  const action = document.getElementById('action3').value;
                  const duree = parseInt(document.getElementById('duree3').value);
                  const delai = parseInt(document.getElementById('delai3').value);
                  if (action && duree && delai) {
                    saveEngagement3(action, duree, delai);
                  } else {
                    alert('Merci de remplir tous les champs');
                  }
                }}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Valider mon engagement
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
              <p style={{ fontWeight: 'bold', color: '#2e7d32', marginBottom: '10px' }}>
                ✅ TON ENGAGEMENT PERSONNALISÉ :
              </p>
              <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                <li><strong>Action :</strong> {engagement3.action}</li>
                <li><strong>Durée :</strong> {engagement3.dureeMinutes} minutes</li>
                <li><strong>Délai max :</strong> {engagement3.delaiMax} minutes après le repas</li>
              </ul>
              <button
                onClick={() => {
                  if (confirm('Veux-tu modifier ton engagement ?')) {
                    setEngagement3(null);
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('critere3Engagement');
                    }
                  }
                }}
                style={{
                  backgroundColor: '#ff9800',
                  color: 'white',
                  padding: '8px 15px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Modifier mon engagement
              </button>
            </div>
          )}
          
          <p style={{ marginTop: '15px' }}><strong>💡 ASTUCE :</strong></p>
          <p>Programme une alarme "Action post-repas" {engagement3 ? engagement3.delaiMax : '5'} min après la fin de chaque repas</p>
        </div>
      ),
      suivi: `Définis ton engagement personnalisé ci-dessus, puis valide chaque jour : "Aujourd'hui, j'ai fait ${engagement3 ? engagement3.action : '[ton action choisie]'} après chaque repas" → Oui/Non (5/7 jours minimum)`
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
      comment: (
        <div>
          <p><strong>🎯 CHOISIR DURÉE DES JEÛNES :</strong></p>
          
          {!config6 ? (
            <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  <input 
                    type="radio" 
                    name="optionJeune" 
                    value="A"
                    onChange={() => setShowOptionC(false)}
                    style={{ marginRight: '8px' }}
                  />
                  <strong>Option A : 2 jeûnes de 24h (critère officiel)</strong>
                </label>
                <p style={{ marginLeft: '28px', fontSize: '0.95em', color: '#555' }}>
                  Dernier repas 19h J-1 → reprise 19h J0<br/>
                  Idéal pour débutants confirmés
                </p>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  <input 
                    type="radio" 
                    name="optionJeune" 
                    value="B"
                    onChange={() => setShowOptionC(false)}
                    style={{ marginRight: '8px' }}
                  />
                  <strong>Option B : 2 jeûnes de 16h (alternative)</strong>
                </label>
                <p style={{ marginLeft: '28px', fontSize: '0.95em', color: '#555' }}>
                  Dernier repas 20h → petit-déjeuner 12h lendemain<br/>
                  Plus accessible, limite les risques
                </p>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                  <input 
                    type="radio" 
                    name="optionJeune" 
                    value="C"
                    onChange={(e) => setShowOptionC(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  <strong>Option C : Durée personnalisée</strong>
                </label>
                {showOptionC && (
                  <div style={{ marginLeft: '28px', marginTop: '10px' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Nombre de jeûnes :
                      </label>
                      <select 
                        id="nombreJeunes"
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        <option value="2">2 jeûnes</option>
                        <option value="3">3 jeûnes</option>
                        <option value="4">4 jeûnes</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        Durée par jeûne (en heures) :
                      </label>
                      <input 
                        type="number" 
                        id="dureeJeune"
                        min="12" 
                        max="36" 
                        placeholder="Ex: 18"
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', width: '100px' }}
                      />
                    </div>
                    <p style={{ fontSize: '0.9em', color: '#666', marginTop: '8px' }}>
                      💡 Recommandations :<br/>
                      • Débutant : 14-16h<br/>
                      • Intermédiaire : 18-20h<br/>
                      • Avancé : 24h+
                    </p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => {
                  const selectedOption = document.querySelector('input[name="optionJeune"]:checked');
                  if (!selectedOption) {
                    alert('Merci de sélectionner une option');
                    return;
                  }
                  
                  let nombreJeunes, dureeHeures;
                  
                  if (selectedOption.value === 'A') {
                    nombreJeunes = 2;
                    dureeHeures = 24;
                  } else if (selectedOption.value === 'B') {
                    nombreJeunes = 2;
                    dureeHeures = 16;
                  } else if (selectedOption.value === 'C') {
                    nombreJeunes = parseInt(document.getElementById('nombreJeunes').value);
                    dureeHeures = parseInt(document.getElementById('dureeJeune').value);
                    if (!dureeHeures || dureeHeures < 12 || dureeHeures > 36) {
                      alert('Durée invalide (entre 12 et 36 heures)');
                      return;
                    }
                  }
                  
                  saveConfig6(selectedOption.value, nombreJeunes, dureeHeures);
                }}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginTop: '10px'
                }}
              >
                Valider ma configuration
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
              <p style={{ fontWeight: 'bold', color: '#2e7d32', marginBottom: '10px' }}>
                ✅ TA CONFIGURATION : Option {config6.option} ({config6.nombreJeunes} jeûnes de {config6.dureeHeures}h)
              </p>
              
              <div style={{ borderTop: '2px solid #aed581', paddingTop: '15px', marginTop: '15px' }}>
                <h4 style={{ color: '#2e7d32', marginBottom: '15px', fontSize: '1.1em' }}>🎯 TES JEÛNES D'ENTRAÎNEMENT</h4>
                
                {config6.jeunes.map((jeune, idx) => {
                  const isBloque = idx > 0 && !config6.jeunes[idx - 1].complete;
                  const dateMin = idx > 0 && config6.jeunes[idx - 1].datePrevue 
                    ? (() => {
                        const d = new Date(config6.jeunes[idx - 1].datePrevue);
                        d.setDate(d.getDate() + 3);
                        return d.toISOString().split('T')[0];
                      })()
                    : null;
                  
                  // Calculer les horaires selon la durée
                  const heureDebut = config6.dureeHeures === 16 ? '20h' : '19h';
                  const heureFin = config6.dureeHeures === 16 ? '12h' : 
                                   config6.dureeHeures === 24 ? '19h' : 
                                   `${(19 + config6.dureeHeures) % 24}h`;
                  const texteFin = config6.dureeHeures === 16 ? 'Petit-déj' : 'Reprise';
                  
                  return (
                    <div key={idx} style={{ marginBottom: '20px' }}>
                      <div style={{
                        border: jeune.complete ? '2px solid #4CAF50' : '2px solid #dcedc8',
                        borderRadius: '8px',
                        padding: '15px',
                        backgroundColor: jeune.complete ? '#f1f8f4' : isBloque ? '#f5f5f5' : '#fff',
                        opacity: isBloque ? 0.6 : 1
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          marginBottom: '12px',
                          fontSize: '1.05em',
                          fontWeight: 'bold',
                          color: jeune.complete ? '#2e7d32' : '#666'
                        }}>
                          <span style={{ fontSize: '1.5em', marginRight: '10px' }}>
                            {idx === 0 ? '1️⃣' : idx === 1 ? '2️⃣' : idx === 2 ? '3️⃣' : '4️⃣'}
                          </span>
                          JEÛNE {jeune.numero} — {config6.dureeHeures}h ({heureDebut} → {texteFin} {heureFin} lendemain)
                        </div>
                        
                        {jeune.complete ? (
                          // Version compacte si terminé
                          <div style={{ paddingLeft: '45px' }}>
                            <p style={{ margin: '5px 0', color: '#555' }}>
                              📅 {new Date(jeune.datePrevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} | 
                              {jeune.effectue ? ' ✅ Fait' : ' ❌ Non fait'} | 
                              {jeune.ressenti === 'Facile' ? ' 😊 Facile' : 
                               jeune.ressenti === 'Moyen' ? ' 😐 Moyen' : 
                               jeune.ressenti === 'Difficile' ? ' 😓 Difficile' : ' ' + jeune.ressenti}
                            </p>
                            <p style={{ margin: '8px 0 0 0', fontWeight: 'bold', color: '#4CAF50' }}>
                              Statut : ✅ TERMINÉ
                            </p>
                          </div>
                        ) : (
                          // Version détaillée si en cours
                          <div style={{ paddingLeft: '45px' }}>
                            <div style={{ marginBottom: '12px' }}>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
                                📅 Quand ?
                              </label>
                              <input 
                                type="date" 
                                value={jeune.datePrevue || ''}
                                min={dateMin || undefined}
                                disabled={isBloque}
                                onChange={(e) => {
                                  if (dateMin && e.target.value < dateMin) {
                                    alert(`Minimum 3 jours après le jeûne précédent (${new Date(dateMin).toLocaleDateString('fr-FR')})`);
                                    return;
                                  }
                                  updateJeune6(idx, 'datePrevue', e.target.value);
                                }}
                                style={{ 
                                  padding: '8px', 
                                  borderRadius: '4px', 
                                  border: '1px solid #ccc',
                                  width: '200px',
                                  cursor: isBloque ? 'not-allowed' : 'pointer'
                                }}
                              />
                              {dateMin && !isBloque && (
                                <p style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
                                  (Minimum 3 jours après le {new Date(dateMin).toLocaleDateString('fr-FR')})
                                </p>
                              )}
                            </div>
                            
                            <div style={{ marginBottom: '12px' }}>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>
                                ✅ C'est fait ?
                              </label>
                              <label style={{ marginRight: '20px', cursor: isBloque ? 'not-allowed' : 'pointer' }}>
                                <input 
                                  type="radio" 
                                  name={`effectue${idx}`}
                                  checked={jeune.effectue === true}
                                  disabled={isBloque}
                                  onChange={() => updateJeune6(idx, 'effectue', true)}
                                  style={{ marginRight: '5px' }}
                                />
                                Oui
                              </label>
                              <label style={{ cursor: isBloque ? 'not-allowed' : 'pointer' }}>
                                <input 
                                  type="radio" 
                                  name={`effectue${idx}`}
                                  checked={jeune.effectue === false}
                                  disabled={isBloque}
                                  onChange={() => updateJeune6(idx, 'effectue', false)}
                                  style={{ marginRight: '5px' }}
                                />
                                Pas encore
                              </label>
                            </div>
                            
                            <div style={{ marginBottom: '12px' }}>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
                                😊 Comment ça s'est passé ?
                              </label>
                              <select
                                value={jeune.ressenti || ''}
                                disabled={isBloque || jeune.effectue !== true}
                                onChange={(e) => updateJeune6(idx, 'ressenti', e.target.value)}
                                style={{ 
                                  padding: '8px', 
                                  borderRadius: '4px', 
                                  border: '1px solid #ccc',
                                  cursor: (isBloque || jeune.effectue !== true) ? 'not-allowed' : 'pointer',
                                  opacity: (isBloque || jeune.effectue !== true) ? 0.5 : 1
                                }}
                              >
                                <option value="">-- Sélectionne --</option>
                                <option value="Facile">😊 Facile</option>
                                <option value="Moyen">😐 Moyen</option>
                                <option value="Difficile">😓 Difficile</option>
                              </select>
                            </div>
                            
                            <p style={{ 
                              marginTop: '12px', 
                              fontWeight: 'bold',
                              color: isBloque ? '#999' : jeune.complete ? '#4CAF50' : '#ff9800'
                            }}>
                              Statut : {isBloque ? '🔒 BLOQUÉ (Finis d\'abord le Jeûne ' + idx + ')' : 
                                       jeune.complete ? '✅ TERMINÉ' : '⏳ À FAIRE'}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {idx < config6.jeunes.length - 1 && (
                        <div style={{ textAlign: 'center', margin: '10px 0', color: '#666', fontSize: '0.9em' }}>
                          ⏬ Attends au moins 3 jours ⏬
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div style={{ 
                borderTop: '2px solid #aed581', 
                paddingTop: '15px', 
                marginTop: '15px',
                textAlign: 'center'
              }}>
                <p style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '1.05em' }}>
                  📊 TA PROGRESSION
                </p>
                <div style={{ 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: '10px', 
                  height: '30px',
                  overflow: 'hidden',
                  marginBottom: '10px',
                  position: 'relative'
                }}>
                  <div style={{
                    backgroundColor: '#4CAF50',
                    height: '100%',
                    width: `${(config6.jeunes.filter(j => j.complete).length / config6.nombreJeunes) * 100}%`,
                    transition: 'width 0.5s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {config6.jeunes.filter(j => j.complete).length > 0 && 
                      `${Math.round((config6.jeunes.filter(j => j.complete).length / config6.nombreJeunes) * 100)}%`}
                  </div>
                </div>
                <p style={{ color: '#555' }}>
                  {config6.jeunes.filter(j => j.complete).length} / {config6.nombreJeunes} complétés
                  {config6.jeunes.filter(j => j.complete).length === 1 && config6.nombreJeunes === 2 && ' — Plus qu\'un ! 💪'}
                </p>
              </div>
              
              {config6.jeunes.every(j => j.complete) && (
                <div style={{ 
                  backgroundColor: '#fff9e6', 
                  border: '2px solid #ffc107',
                  borderRadius: '8px',
                  padding: '15px',
                  marginTop: '15px',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '1.5em', marginBottom: '10px' }}>🎉</p>
                  <p style={{ fontWeight: 'bold', color: '#f57c00', fontSize: '1.1em' }}>
                    BRAVO ! Tu as réussi tes {config6.nombreJeunes} jeûnes d'entraînement !
                  </p>
                  <p style={{ color: '#666', marginTop: '8px' }}>
                    Critère validé automatiquement ✅
                  </p>
                </div>
              )}
              
              <button
                onClick={() => {
                  if (confirm('Veux-tu modifier ta configuration ? (⚠️ Cela réinitialisera ton tracker)')) {
                    setConfig6(null);
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('critere6Config');
                    }
                  }
                }}
                style={{
                  backgroundColor: '#ff9800',
                  color: 'white',
                  padding: '8px 15px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginTop: '15px',
                  display: 'block'
                }}
              >
                Modifier ma configuration
              </button>
            </div>
          )}
          
          <p style={{ marginTop: '20px' }}><strong>📌 RÈGLES STRICTES :</strong></p>
          <ul>
            <li>Espacement minimum 3 jours entre les jeûnes</li>
            <li>Hydratation continue (eau, tisanes non sucrées)</li>
            <li>Repos si fatigue (pas d'effort physique intense)</li>
            <li>Arrêt immédiat si malaise sévère</li>
          </ul>
          
          <p><strong>💡 ASTUCE :</strong></p>
          <p>Planifie tes jeûnes un week-end calme (moins de sollicitations, possibilité de repos)</p>
        </div>
      ),
      suivi: `Tracker de jeûnes ci-dessus. Validation automatique si ${config6 ? config6.nombreJeunes : '2'} jeûnes complétés selon durée choisie (${config6 ? config6.dureeHeures : '24'}h).`
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap'
        }}
      >
        <span>{phase.nom}</span>
        {phase.resume && (
          <span style={{
            background: '#EEF6FF',
            color: '#2563EB',
            border: '1px solid #BFDBFE',
            borderRadius: 999,
            padding: '6px 10px',
            fontSize: '0.82rem',
            fontWeight: 800
          }}>
            {phase.resume}
          </span>
        )}
      </h2>
      <div style={{ color: '#FFD166', fontWeight: 600, marginBottom: 12, fontSize: '1.01em' }}>Période : {phase.periode}</div>
      <div style={{ color: '#6B778C', marginBottom: 10, fontSize: '1.04em', fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>{phase.explication}</div>
      <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
        {criteres.map((critere, index) => {
          // Calcul du statut dynamique
          const jalon = critere.jalon * -1; // Convertir J-30 → -30
          let statut = 'À VENIR';
          let couleurStatut = '#A0AEC0';
          let actionPossible = false;
          let messageExplicatif = null;
          
          if (jCourant !== null && jCourant !== undefined) {
            // Déterminer la fenêtre de validation pour ce critère
            const fenetre = 
              jalon === -30 ? -18 : 
              [-17, -14, -12].includes(jalon) ? -8 : 
              jalon === -7 ? 0 : jalon;
            
            // 🔍 DEBUG: Logs pour diagnostiquer le problème "DÉPASSÉ"
            if (critere.label && critere.label.includes('Respect strict')) {
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('🔍 [DEBUG PhaseCard] Critère "Respect strict des quantités"');
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('📊 Valeurs reçues:');
              console.log('  • jCourant (relatif):', jCourant);
              console.log('  • critere.jalon (original):', critere.jalon);
              console.log('  • jalon (converti):', jalon);
              console.log('  • fenetre (calculée):', fenetre);
              console.log('');
              console.log('🧪 Tests de condition:');
              console.log('  • jCourant < jalon ?', jCourant < jalon, '→', jCourant < jalon ? 'À VENIR' : 'NON');
              console.log('  • jCourant >= jalon ?', jCourant >= jalon);
              console.log('  • jCourant <= fenetre ?', jCourant <= fenetre);
              console.log('  • (jalon ≤ jCourant ≤ fenetre) ?', jCourant >= jalon && jCourant <= fenetre, '→', jCourant >= jalon && jCourant <= fenetre ? 'ACTIF' : 'NON');
              console.log('  • Sinon → DÉPASSÉ');
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            }
            
            if (jCourant < jalon) {
              // Trop tôt : critère pas encore accessible
              statut = 'À VENIR';
              couleurStatut = '#A0AEC0';
              messageExplicatif = `📅 Ce critère sera accessible à partir de J${jalon} (dans ${Math.abs(jCourant - jalon)} jours).`;
            } else if (jCourant >= jalon && jCourant <= fenetre) {
              // Dans la période : critère actif
              statut = jCourant === jalon ? 'EN COURS' : 'ACTIF';
              couleurStatut = '#43D9A3';
              actionPossible = true;
            } else {
              // Trop tard : période dépassée
              statut = 'DÉPASSÉ';
              couleurStatut = '#FF6B6B';
              const periodeDebut = `J${jalon}`;
              const periodeFin = `J${fenetre}`;
              messageExplicatif = `⏰ Période de validation dépassée (${periodeDebut} à ${periodeFin}). Pour garantir un jeûne optimal, il est recommandé de commencer la préparation dès J-30. Les critères manqués peuvent affecter la qualité de votre jeûne.`;
            }
          }
          
          return (
            <li
              key={critere.id}
              style={{
                marginBottom: 16,
                background: critere.valide ? '#F5F8FA' : statut === 'DÉPASSÉ' ? '#FFF5F5' : '#fff',
                borderRadius: 10,
                boxShadow: critere.valide ? '0 1px 6px 0 rgba(67,217,163,0.08)' : 'none',
                padding: '12px 16px',
                border: critere.valide ? '1px solid #43D9A3' : statut === 'DÉPASSÉ' ? '1px solid #FF6B6B' : '1px solid #E3EAF2',
                transition: 'all 0.2s',
                opacity: statut === 'DÉPASSÉ' && !critere.valide ? 0.7 : 1,
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
                  background: statut === 'DÉPASSÉ' ? '#FFE5E5' : statut === 'À VENIR' ? '#F5F8FA' : '#E5F8F2',
                }}>
                  {statut}
                </span>
              </div>
              <div style={{ color: '#6B778C', fontSize: '0.99em', marginBottom: 2 }}>{critere.conseil}</div>
              <div style={{ color: '#A0AEC0', fontSize: '0.97em', marginBottom: 2 }}>Jalon : J-{critere.jalon}</div>
              
              {/* Message explicatif pour critères À VENIR ou DÉPASSÉ */}
              {messageExplicatif && !critere.valide && (
                <div style={{
                  marginTop: 8,
                  padding: '8px 12px',
                  background: statut === 'DÉPASSÉ' ? '#FFF5F5' : '#F0F4F8',
                  border: `1px solid ${statut === 'DÉPASSÉ' ? '#FFD4D4' : '#CBD5E1'}`,
                  borderRadius: 8,
                  fontSize: '0.92em',
                  color: statut === 'DÉPASSÉ' ? '#DC2626' : '#64748B',
                  lineHeight: 1.5
                }}>
                  {messageExplicatif}
                </div>
              )}
              
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
                      {critere.id === 6 ? (
                        <div>
                          <div>Le detail de configuration du jeûne se fait dans la section dédiée en bas de page.</div>
                          <div style={{ marginTop: 6 }}>Ici, cette carte sert uniquement à comprendre le critère et suivre son statut.</div>
                        </div>
                      ) : Array.isArray(guidancesCriteres[critere.id].comment) ? (
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
                      {critere.id === 6
                        ? 'Suivi du jeûne plein: vérifie dans la section dédiée si un jeûne a été effectué (oui/non) et son état de validation.'
                        : guidancesCriteres[critere.id].suivi}
                    </p>
                  </div>
                </div>
              )}

              {critere.valide ? (
                <span style={{ color: '#43D9A3', fontWeight: 700, fontSize: '0.99em' }}>
                  ✅ Validé le {critere.dateValidation ? new Date(critere.dateValidation).toLocaleDateString('fr-FR') : ''}
                  {critere.typeValidation === 'auto' && (
                    <span style={{ color: '#4F8FFF', marginLeft: '8px', fontSize: '0.9em' }}>
                      (Auto-détecté)
                    </span>
                  )}
                </span>
              ) : statut === 'DÉPASSÉ' ? (
                <div style={{ color: '#FF6B6B', fontSize: '0.95em', marginTop: 6, fontWeight: 600 }}>
                  🔒 Période dépassée. Concentre-toi sur les critères restants et commence plus tôt lors de ta prochaine préparation (J-30 recommandé).
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
