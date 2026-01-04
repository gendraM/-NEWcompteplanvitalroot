import { getFastFoodRewards } from '../lib/fastFoodRewards';
import { useState, useEffect } from 'react'
import FlipNumbers from 'react-flip-numbers'
import referentielAliments from '../data/referentiel';
// import FlipNumbers from 'react-flip-numbers'

// 🐛 DEBUG: Vérifier le référentiel chargé
console.log('🔍 DEBUG RepasBloc - Référentiel chargé:', {
  nombreAliments: referentielAliments.length,
  premiersAliments: referentielAliments.slice(0, 5).map(a => a.nom),
  contientOeuf: referentielAliments.some(a => a.nom.toLowerCase().includes('oeuf') || a.nom.toLowerCase().includes('œuf')),
  alimentsAvecOeuf: referentielAliments.filter(a => a.nom.toLowerCase().includes('oeuf') || a.nom.toLowerCase().includes('œuf')).map(a => a.nom)
});

// Règles de feedback
const rules = [
  {
    check: ({ estExtra, extrasRestants }) => estExtra && extrasRestants <= 0,
    type: "challenge",
    message: "Tu as dépassé ton quota d'extras cette semaine. Prends un instant pour te demander : est-ce le bon moment pour ce plaisir ? Tu pourrais le planifier pour un autre moment, pour le savourer pleinement et sans culpabilité."
  },
  {
    check: ({ satiete }) => satiete === "non",
    type: "defi",
    message: "Défi : Essaie d'écouter ta satiété sur le prochain repas."
  },
  {
    check: ({ categorie, planCategorie }) => categorie !== planCategorie && categorie && planCategorie,
    type: "suggestion",
    message: "Tu as adapté ton repas, pense à garder l’équilibre des catégories."
  },
  {
    check: ({ routineCount }) => routineCount >= 3,
    type: "feedback",
    message: "Bravo, tu ancre ta routine !"
  }
]

// Baromètre d'état alimentaire
const etatsAlimentaires = [
  { label: "Léger", value: "léger", icon: "🌱", color: "#a5d6a7" },
  { label: "Satisfait", value: "satisfait", icon: "😊", color: "#ffe082" },
  { label: "Lourd", value: "lourd", icon: "😑", color: "#ffcc80" },
  { label: "Ballonné", value: "ballonné", icon: "🤢", color: "#ef9a9a" },
  { label: "Je regrette", value: "je regrette", icon: "😔", color: "#b0bec5" },
  { label: "Je culpabilise", value: "je culpabilise", icon: "😟", color: "#b39ddb" },
  { label: "Neutre", value: "neutre", icon: "😐", color: "#bdbdbd" },
  { label: "J’assume", value: "j’assume", icon: "💪", color: "#80cbc4" }
]

// Liste des signaux de satiété
const signauxSatieteList = [
  "Ventre qui se resserre",
  "Perte d’envie de manger",
  "Sensation de lourdeur",
  "Difficulté à avaler",
  "Autre"
]

export default function RepasBloc({
  type,
  date,
  planCategorie,
  routineCount = 0,
  onSave,
  repasSemaine = [],
  extrasRestants,
  // Suppression des props planifiées, retour à la saisie manuelle
  repasPrevu,
  categoriePrevu,
  quantitePrevu,
  kcalPrevu,
  onChangeChampsRepas
}) {
  // Déclaration des hooks d’état PRINCIPAUX tout en haut du composant (checklist React)
  // Ajout d'un état pour afficher l'erreur Supabase (doit être tout en haut)
  const [supabaseError, setSupabaseError] = useState(null);
  const [repasConforme, setRepasConforme] = useState(false);
  const [aliment, setAliment] = useState('');
  const [suggestionsFiltrees, setSuggestionsFiltrees] = useState([]);
  const [afficherSuggestions, setAfficherSuggestions] = useState(false);
    // Champ heure de prise du repas (non obligatoire, pré-rempli à l'heure actuelle)
    const getDefaultHeure = () => {
      const now = new Date();
      return now.toTimeString().slice(0,5);
    };
    const [heureRepas, setHeureRepas] = useState(getDefaultHeure());
  const [categorie, setCategorie] = useState('');
  const [quantite, setQuantite] = useState('');
  const [kcal, setKcal] = useState('');
  // Champ Note pour analyse comportementale
  const [note, setNote] = useState('');
  // Auto-remplissage conditionnel des champs si repas conforme au planning ET données planifiées valides
  useEffect(() => {
    // Mode création strict : aucun champ existant et aucune id de repas (Next.js/edition)
    const isCreation = !aliment && !categorie && !quantite && !kcal && !repasSemaine?.some(r => r.date === date && r.type === type);
    if (repasConforme && isCreation) {
      if (typeof repasPrevu === 'string' && repasPrevu.length > 0) setAliment(repasPrevu);
      if (typeof categoriePrevu === 'string' && categoriePrevu.length > 0) setCategorie(categoriePrevu);
      if ((typeof quantitePrevu === 'string' || typeof quantitePrevu === 'number') && String(quantitePrevu).length > 0) setQuantite(String(quantitePrevu));
      if ((typeof kcalPrevu === 'string' || typeof kcalPrevu === 'number') && String(kcalPrevu).length > 0) setKcal(String(kcalPrevu));
    }
  }, [repasConforme, repasPrevu, categoriePrevu, quantitePrevu, kcalPrevu, aliment, categorie, quantite, kcal, repasSemaine, date, type]);

  // Remonter les valeurs au parent pour coloration contextuelle pastilles
  // onChangeChampsRepas retiré du dependency array (stabilisé par useMemo côté parent)
  useEffect(() => {
    if (onChangeChampsRepas) {
      onChangeChampsRepas({ aliment, quantite, heureRepas, categorie });
    }
  }, [aliment, quantite, heureRepas, categorie]);

  // Ajout Fast food (déclaration unique, checklist respectée)
  const [isFastFood, setIsFastFood] = useState(false);
  const [fastFoodType, setFastFoodType] = useState('');
  const fastFoodList = ["McDo", "KFC", "Kebab", "Burger King", "Subway", "Autre"];
  const [fastFoodHistory, setFastFoodHistory] = useState([]);
  const [fastFoodReward, setFastFoodReward] = useState(false);
  const [fastFoodAliments, setFastFoodAliments] = useState([{ nom: '', quantite: '', kcal: '' }]);

  // Vérification de la règle fast food
  useEffect(() => {
    if (!isFastFood) return;
    // Filtrer l’historique pour ne garder que les fast food
    const fastFoodRepas = repasSemaine.filter(r => r.isFastFood || r.fastFoodType);
    setFastFoodHistory(fastFoodRepas);
    if (fastFoodRepas.length > 0) {
      // Dernier fast food
      const lastFastFood = fastFoodRepas[fastFoodRepas.length - 1];
      const lastDate = new Date(lastFastFood.date);
      const currentDate = new Date(date);
      const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
      // Récompense si délai respecté
      setFastFoodReward(diffDays >= 45);
    } else {
      setFastFoodReward(true); // Premier fast food, récompense
    }
  }, [isFastFood, repasSemaine, date]);

  // Handler pour ajouter un aliment fast food
  const handleAddFastFoodAliment = () => {
    setFastFoodAliments([...fastFoodAliments, { nom: '', quantite: '', kcal: '' }]);
  };

  // ... (suppression du doublon handleChangeFastFoodAliment, version complète plus bas)

  // Auto-remplissage uniquement lors de la création d’un nouveau repas (jamais en édition)
  useEffect(() => {
    const isNew = !aliment && !categorie && !quantite && !kcal;
    if (repasConforme && isNew) {
      if (typeof repasPrevu === 'string' && repasPrevu.length > 0) setAliment(repasPrevu);
      if (typeof categoriePrevu === 'string' && categoriePrevu.length > 0) setCategorie(categoriePrevu);
      if ((typeof quantitePrevu === 'string' || typeof quantitePrevu === 'number') && String(quantitePrevu).length > 0) setQuantite(String(quantitePrevu));
      if ((typeof kcalPrevu === 'string' || typeof kcalPrevu === 'number') && String(kcalPrevu).length > 0) setKcal(String(kcalPrevu));
    }
  }, [repasConforme, repasPrevu, categoriePrevu, quantitePrevu, kcalPrevu, aliment, categorie, quantite, kcal]);

  // Calcul automatique des kcal pour fast food (référentiel) déplacé dans le handler
  const handleChangeFastFoodAliment = (idx, field, value) => {
    const newAliments = fastFoodAliments.map((a, i) => {
      if (i !== idx) return a;
      let updated = { ...a, [field]: value };
      // Calcul automatique des kcal si nom ou quantite modifié
      if ((field === 'nom' || field === 'quantite') && updated.nom && updated.quantite) {
        const found = referentielAliments.find(r => r.nom.toLowerCase() === updated.nom.toLowerCase());
        if (found) {
          updated.kcal = (parseFloat(updated.quantite) * found.kcal).toFixed(0);
        }
      }
      return updated;
    });
    setFastFoodAliments(newAliments);
  };
  // Validation stricte des props
  extrasRestants = typeof extrasRestants === 'number' && !isNaN(extrasRestants) ? extrasRestants : 0;
  const [estExtra, setEstExtra] = useState(false);
  const [satiete, setSatiete] = useState('');
  const [pourquoi, setPourquoi] = useState('');
  const [ressenti, setRessenti] = useState('');
  const [detailsSignaux, setDetailsSignaux] = useState([]);
  const [reactBloc, setReactBloc] = useState([]);
  const [showDefi, setShowDefi] = useState(false);
  const [loadingKcal, setLoadingKcal] = useState(false);
  // Ajout Fast food
  // Ajout pour gestion validation semaine
  const [semaineValidee, setSemaineValidee] = useState(false);
  const semaineCouranteDate = date; // à adapter si besoin (date du dimanche)
  // Charger l'état de validation de la semaine
  useEffect(() => {
    async function fetchValidation() {
      // Remplacer par l'appel réel à Supabase
      // Exemple :
      // const { data } = await supabase.from('semaines_validees').select('validee').eq('weekStart', semaineCouranteDate).single();
      // setSemaineValidee(data?.validee === true);
      // Pour démo, on laisse à false
    }
    fetchValidation();
  }, [semaineCouranteDate]);
  // Handler pour dévalider
  async function handleDevalider() {
    // Remplacer par l'appel réel à Supabase
    // await supabase.from('semaines_validees').update({ validee: false }).eq('weekStart', semaineCouranteDate);
    setSemaineValidee(false);
    // Rafraîchir la liste ou l’état local si besoin
  }
  // Handler pour valider
  async function handleValider() {
    // Remplacer par l'appel réel à Supabase
    // await supabase.from('semaines_validees').upsert({ weekStart: semaineCouranteDate, validee: true });
    setSemaineValidee(true);
    // Rafraîchir la liste ou l’état local si besoin
  }
  // ...existing code...
  // État pour afficher ou masquer l'historique des repas avec note
  const [showNotesHistory, setShowNotesHistory] = useState(false);
// --- Structure IA symbolique pour suggestions/statistiques à partir des notes ---
// Tableau d’analyse des repas (exemple, à remplir dynamiquement depuis la base ou props)
const analyseRepas = [
  // Exemple de structure : chaque repas avec note, date, type, émotions, etc.
  // { date: '2025-09-14', type: 'Déjeuner', note: 'Fatigue, envie de sucre', ressenti: 'lourd', pourquoi: 'stress' }
];

// Base de règles symboliques pour suggestions/statistiques
const iaRules = [
  {
    condition: repas => repas.note && repas.note.toLowerCase().includes('fatigue'),
    suggestion: "Vous avez souvent noté de la fatigue. Pensez à adapter votre rythme de sommeil ou à privilégier des aliments énergétiques."
  },
  {
    condition: repas => repas.pourquoi && repas.pourquoi.toLowerCase().includes('stress'),
    suggestion: "Le stress revient dans vos repas. Essayez de repérer les déclencheurs et d’intégrer des pauses ou des activités relaxantes."
  },
  {
    condition: repas => repas.ressenti === 'lourd',
    suggestion: "Plusieurs repas lourds : surveillez les quantités et la composition pour retrouver un ressenti plus léger."
  }
  // Ajoutez facilement d’autres règles ici
];

// Fonction d’analyse symbolique (retourne suggestions/statistiques)
function getSuggestionsFromNotes(repasList) {
  const suggestions = [];
  iaRules.forEach(rule => {
    repasList.forEach(repas => {
      if (rule.condition(repas)) {
        suggestions.push(rule.suggestion);
      }
    });
  });
  // Suppression des doublons
  return [...new Set(suggestions)];
}

// --- Fin structure IA symbolique ---

  // Suggestion automatique de catégorie et kcal selon l'aliment choisi (référentiel)
  // Remplissage automatique de la catégorie selon l'aliment saisi (référentiel local uniquement)
  useEffect(() => {
    const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase())
    if (found) {
      setCategorie(found.categorie)
    }
  }, [aliment])

  // Calcul automatique des kcal selon la quantité et l'aliment (référentiel)
  useEffect(() => {
    const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase())
    if (found && quantite) {
      const quantiteNum = parseFloat(quantite)
      if (found.kcalParUnite) {
        setKcal((quantiteNum * found.kcalParUnite).toFixed(0))
      } else {
        // Fallback pour anciens aliments sans kcalParUnite
        setKcal((quantiteNum * found.kcal).toFixed(0))
      }
    } else if (!found) {
      setKcal('')
    }
  }, [aliment, quantite])



  // ...existing code...

  useEffect(() => {
    const context = { estExtra, satiete, categorie, planCategorie, routineCount, extrasRestants }
    const blocs = rules.filter(rule => rule.check(context))
    setReactBloc(blocs)
  }, [estExtra, satiete, categorie, planCategorie, routineCount, extrasRestants])

  const handleSubmit = (e) => {
    e.preventDefault();
    // Enregistrement du repas classique
    // Si repas conforme au planning, enregistrement automatique
    if (repasConforme) {
      let kcalPlanning = kcal;
      if (!kcalPlanning) {
        alert("Merci de saisir manuellement les kcal du repas prévu pour le suivi.");
        return;
      }
      let alimentFinal = aliment;
      let categorieFinal = categorie;
      let quantiteFinal = quantite;
      let kcalFinal = kcalPlanning;
      if (!alimentFinal && typeof repasPrevu === 'string' && repasPrevu.length > 0) alimentFinal = repasPrevu;
      if (!categorieFinal && typeof categoriePrevu === 'string' && categoriePrevu.length > 0) categorieFinal = categoriePrevu;
      if (!quantiteFinal && typeof quantitePrevu === 'string' && quantitePrevu.length > 0) quantiteFinal = quantitePrevu;
      if (!kcalFinal && typeof kcalPrevu === 'string' && kcalPrevu.length > 0) kcalFinal = kcalPrevu;
      // --- Correction logique Jeûne ---
      const isJeune = categorieFinal === 'Jeûne';
      if (!isJeune && (!alimentFinal || !categorieFinal || !quantiteFinal || !kcalFinal)) {
        alert("Merci de remplir manuellement les champs manquants (aliment, catégorie, quantité, kcal) pour assurer le suivi.");
        return;
      }
      // Si Jeûne, on autorise l'enregistrement même si les champs sont vides
      import('../lib/supabaseClient').then(({ supabase }) => {
        supabase.auth.getUser().then(({ data: userData }) => {
          const user_id = userData?.user?.id || null;
          supabase.from('repas_reels').insert([
            {
              user_id,
              date,
              type,
              aliment: isJeune ? '' : alimentFinal,
              categorie: isJeune ? 'Jeûne' : categorieFinal,
              quantite: isJeune ? null : (quantiteFinal === '' ? null : isNaN(Number(quantiteFinal)) ? quantiteFinal : Number(quantiteFinal)),
              kcal: isJeune ? null : (kcalFinal === '' ? null : isNaN(Number(kcalFinal)) ? kcalFinal : Number(kcalFinal)),
              est_extra: false,
              satiete,
              pourquoi,
              ressenti,
              details_signaux: detailsSignaux,
              repas_planifie_respecte: true,
              note
            }
          ]).then(({ error }) => {
            if (error) {
              setSupabaseError(error.message);
            } else {
              setSupabaseError(null);
            }
          });
        });
      });
      setRepasConforme(false);
      setAliment('');
      setCategorie('');
      setQuantite('');
      setKcal('');
      setEstExtra(false);
      setSatiete('');
      setPourquoi('');
      setRessenti('');
      setDetailsSignaux([]);
      setNote('');
      return;
    }
    // Enregistrement du repas classique
    onSave && onSave({
      // Correction : si Jeûne, envoyer null pour quantite/kcal et '' pour aliment
      type,
      date,
      aliment: categorie === 'Jeûne' ? '' : aliment,
      categorie: categorie === 'Jeûne' ? 'Jeûne' : categorie,
      quantite: categorie === 'Jeûne' ? null : (quantite === '' ? null : isNaN(Number(quantite)) ? quantite : Number(quantite)),
      kcal: categorie === 'Jeûne' ? null : (kcal === '' ? null : isNaN(Number(kcal)) ? kcal : Number(kcal)),
      est_extra: estExtra,
      satiete,
      pourquoi,
      ressenti,
      details_signaux: detailsSignaux,
      note
    });
    // Enregistrement du fast food dans Supabase si sélectionné
    if (isFastFood) {
      import('../lib/supabaseClient').then(({ supabase }) => {
        supabase.auth.getUser().then(({ data: userData }) => {
          const user_id = userData?.user?.id || null;
          supabase.from('fast_food_history').insert([
            {
              user_id,
              date,
              restaurant: fastFoodType,
              aliments: fastFoodAliments,
              kcal: fastFoodAliments.reduce((sum, a) => sum + (parseInt(a.kcal) || 0), 0),
              badge: fastFoodReward ? 'ok' : null
            }
          ]).then(({ error }) => {
            if (error) {
              alert('Erreur Supabase (fast food): ' + error.message);
            }
          });
        });
      });
    }
    // Reset des hooks pour garder la fonctionnalité existante
    setAliment('');
    setCategorie('');
    setQuantite('');
    setKcal('');
    setEstExtra(false);
    setSatiete('');
    setPourquoi('');
    setRessenti('');
    setDetailsSignaux([]);
    setNote('');
    // setSuggestions([])
  }

  const handleAccepteDefi = () => {
    setShowDefi(false)
    // Logique pour accepter le défi
  }

  // Sélection d'un état alimentaire dans le baromètre
  const handleSelectEtat = (value) => {
    setRessenti(value)
  }

  // Gestion des signaux de satiété ignorés
  const handleCheckSignal = (signal) => {
    if (detailsSignaux.includes(signal)) {
      setDetailsSignaux(detailsSignaux.filter(s => s !== signal))
    } else {
      setDetailsSignaux([...detailsSignaux, signal])
    }
  }

  return (
  <div>
      {/* Compteur flipboard stylisé pour extras restants */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Extras restants</span>
        <FlipNumbers
          height={40}
          width={30}
          color={extrasRestants > 0 ? "#1976d2" : "#b71c1c"}
          background="#fff"
          play
          numbers={`${extrasRestants}`}
        />
      </div>

  <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        {/* Affichage du message d’erreur Supabase */}
        {supabaseError && (
          <div style={{ color: '#b71c1c', background: '#ffebee', padding: 8, borderRadius: 6, marginBottom: 12 }}>
            <strong>Erreur d’enregistrement Supabase :</strong> {supabaseError}
          </div>
        )}
        {/* Champ Note pour analyse comportementale */}
        <label>Note (contexte, analyse, réflexion)</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Ex : contexte, émotions, réflexion, objectif, etc."
          rows={2}
          style={{ width: '100%', marginBottom: 12 }}
        />
        {/* Case à cocher Repas conforme au planning */}
        <label style={{ display: 'block', marginBottom: 8 }}>
          <input type="checkbox" checked={repasConforme} onChange={e => setRepasConforme(e.target.checked)} />
          Repas conforme au planning
        </label>
        {/* Message d’avertissement et suggestion si règle non respectée */}
        {isFastFood && fastFoodHistory.length > 0 && (
          (() => {
            const lastFastFood = fastFoodHistory[fastFoodHistory.length - 1];
            const lastDate = new Date(lastFastFood.date);
            const currentDate = new Date(date);
            const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
            if (diffDays < 45) {
              return (
                <div style={{ background: '#fff3e0', color: '#e65100', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                  <strong>Attention :</strong> Tu as consommé un fast food il y a {diffDays} jours.<br />
                  Il est recommandé d’attendre 45 jours entre deux fast food pour préserver ton équilibre alimentaire.<br />
                  <span style={{ fontWeight: 500 }}>Planifie ton prochain fast food pour maximiser ta récompense !</span>
                </div>
              );
            }
            return null;
          })()
        )}
        {/* Récompense si délai respecté */}
        {isFastFood && fastFoodReward && (
          <div style={{ background: '#e8f5e9', color: '#388e3c', padding: 12, borderRadius: 8, marginBottom: 12 }}>
            🎉 Bravo ! Tu as respecté le délai entre deux fast food.<br />
            Tu débloques une récompense et tu progresses vers une meilleure alimentation !
          </div>
        )}
          {/* Message de félicitations et suggestion de planification (fusion dynamique + astuce) */}
          {isFastFood && (
            (() => {
              const rewards = getFastFoodRewards(fastFoodHistory);
              let astuce = null;
              if (fastFoodReward) {
                astuce = <><br /><span style={{ fontWeight: 500 }}>Astuce : note la date du prochain créneau dans ton agenda pour maximiser ta récompense !</span></>;
              } else if (fastFoodHistory.length > 0) {
                const lastFastFood = fastFoodHistory[fastFoodHistory.length - 1];
                const lastDate = new Date(lastFastFood.date);
                const currentDate = new Date(date);
                const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
                astuce = <><br /><span style={{ fontWeight: 500 }}>Suggestion : planifie le prochain fast food dans {45 - diffDays} jours.</span></>;
              }
              return (
                <div style={{ background: rewards.confettis ? '#e8f5e9' : '#e3f2fd', color: rewards.confettis ? '#388e3c' : '#1976d2', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                  {rewards.message}
                  {astuce}
                  {rewards.confettis && <div style={{marginTop:8}}>🎉 Confettis ! Tu as débloqué le badge spécial Fast Food !</div>}
                </div>
              );
            })()
          )}
        {/* Saisie des aliments fast food si mode activé */}
        {isFastFood && (
          <div style={{ marginBottom: 16 }}>
            <label>Aliments consommés (Fast food)</label>
            {fastFoodAliments.map((a, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="Aliment"
                  value={a.nom}
                  onChange={e => handleChangeFastFoodAliment(idx, 'nom', e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Quantité"
                  value={a.quantite}
                  onChange={e => handleChangeFastFoodAliment(idx, 'quantite', e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Kcal"
                  value={a.kcal}
                  onChange={e => handleChangeFastFoodAliment(idx, 'kcal', e.target.value)}
                  required
                />
              </div>
            ))}
            <button type="button" onClick={handleAddFastFoodAliment} style={{ marginTop: 4 }}>Ajouter un aliment</button>
          </div>
        )}
        {/* Case à cocher Fast food */}
        <label>
          <input type="checkbox" checked={isFastFood} onChange={e => setIsFastFood(e.target.checked)} />
          Fast food ?
        </label>
        {/* Liste déroulante des restaurants si Fast food coché */}
        {isFastFood && (
          <div style={{ marginBottom: 12 }}>
            <label>Choix du restaurant</label>
            <select value={fastFoodType} onChange={e => setFastFoodType(e.target.value)} required>
              <option value="">Sélectionner…</option>
              {fastFoodList.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {/* Saisie manuelle si "Autre" */}
            {fastFoodType === "Autre" && (
              <input
                type="text"
                placeholder="Nom du restaurant"
                value={fastFoodType}
                onChange={e => setFastFoodType(e.target.value)}
                style={{ marginTop: 8 }}
              />
            )}
          </div>
        )}
        <h3>{type} du {date}</h3>
        <label>Aliment mangé</label>
        <div style={{ position: 'relative' }}>
          <input
            value={aliment}
            onChange={e => {
              const val = e.target.value;
              setAliment(val);
              
              // Filtrer les suggestions
              if (val.length >= 1) {
                const normaliser = (str) => str.toLowerCase()
                  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                  .replace(/œ/g, 'oe');
                
                const valNormalisee = normaliser(val);
                const filtrees = referentielAliments.filter(a => 
                  normaliser(a.nom).includes(valNormalisee)
                ).slice(0, 10); // Max 10 suggestions
                
                setSuggestionsFiltrees(filtrees);
                setAfficherSuggestions(true);
              } else {
                setSuggestionsFiltrees([]);
                setAfficherSuggestions(false);
              }
            }}
            onFocus={() => {
              if (aliment.length >= 1 && suggestionsFiltrees.length > 0) {
                setAfficherSuggestions(true);
              }
            }}
            onBlur={() => {
              // Délai pour permettre le clic sur une suggestion
              setTimeout(() => setAfficherSuggestions(false), 200);
            }}
            placeholder="Saisissez un aliment (ex: oeuf, riz, poulet...)"
            required={categorie !== 'Jeûne'}
            style={{ marginBottom: 0, width: '100%' }}
          />
          
          {afficherSuggestions && suggestionsFiltrees.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderTop: 'none',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {suggestionsFiltrees.map((a, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setAliment(a.nom);
                    setAfficherSuggestions(false);
                  }}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderBottom: idx < suggestionsFiltrees.length - 1 ? '1px solid #eee' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div>
                    <strong>{a.nom}</strong>
                    {a.portionDefaut && (
                      <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                        ({a.portionDefaut})
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: 13, 
                    fontWeight: 'bold',
                    color: a.qn >= 4 ? '#22c55e' : a.qn >= 3 ? '#f59e0b' : '#ef4444'
                  }}>
                    QN: {a.qn || '?'}/5
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {(() => {
          const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase());
          return found && found.portionDefaut ? (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4, marginBottom: 8 }}>
              📏 Portion recommandée : {found.portionDefaut}
            </div>
          ) : null;
        })()}
        {/* ...existing code... */}

        <label>Catégorie</label>
        <input
          list="categories"
          value={categorie}
          onChange={e => setCategorie(e.target.value)}
          required={categorie !== 'Jeûne'}
        />
        <datalist id="categories">
          <option value="féculent" />
          <option value="protéines" />
          <option value="légumes" />
          <option value="fruit" />
          <option value="extra" />
          <option value="poisson" />
          <option value="volaille" />
          <option value="viande" />
          <option value="autres" />
          <option value="fromage" />
          <option value="boisson" />
          <option value="produit laitier" />
          <option value="Jeûne" />
        </datalist>

        <label>Quantité{(() => {
          const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase());
          if (found && found.unite) {
            const uniteLabel = {
              'CS': 'cuillère(s) à soupe',
              'piece': 'pièce(s)',
              'g': 'gramme(s)',
              'tranche': 'tranche(s)',
              'pot': 'pot(s)',
              'portion': 'portion(s)',
              'boule': 'boule(s)',
              'carre': 'carré(s)',
              'verre': 'verre(s)',
              'combo': 'menu(s)'
            }[found.unite] || found.unite;
            return ` (${uniteLabel})`;
          }
          return '';
        })()}</label>
        <input value={quantite} onChange={e => setQuantite(e.target.value)} required={categorie !== 'Jeûne'} />
        {categorie !== 'Jeûne' && (
          <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 2, marginBottom: 8 }}>
            ⚠️ Utilisez un <strong>point</strong> pour les décimales (ex: 0.5 et non 0,5)
          </div>
        )}

        <label>Kcal {loadingKcal && "(recherche...)"}</label>
        <input 
          value={kcal} 
          onChange={e => setKcal(e.target.value)}
          readOnly={(() => {
            const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase());
            return found && found.kcalParUnite && quantite;
          })()}
          style={(() => {
            const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase());
            return (found && found.kcalParUnite && quantite) ? { background: '#f0f0f0' } : {};
          })()}
        />
        {(() => {
          const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase());
          return (found && found.kcalParUnite && quantite) ? (
            <div style={{ fontSize: 12, color: '#4caf50', marginTop: 4 }}>
              ✨ Calculé automatiquement
            </div>
          ) : null;
        })()}

        {/* Message d'aide si kcal non trouvées automatiquement */}
        {aliment && quantite && !kcal && (
          <div style={{ color: "#b71c1c", marginBottom: 8 }}>
            Calories non trouvées dans le référentiel. Merci de les saisir manuellement.
          </div>
        )}

        {categorie !== 'Jeûne' && (
          <label>
            <input type="checkbox" checked={estExtra} onChange={e => setEstExtra(e.target.checked)} />
            Cet aliment est-il un extra ?
          </label>
        )}

        {categorie !== 'Jeûne' && <label>Satiété respectée ?</label>}
        {categorie !== 'Jeûne' && (
          <select value={satiete} onChange={e => setSatiete(e.target.value)} required>
            <option value="">Choisir…</option>
            <option value="oui">Oui, j'ai respecté ma satiété</option>
            <option value="non">Non, j'ai dépassé ma satiété</option>
            <option value="pas de faim">Je n'ai pas mangé par faim</option>
          </select>
        )}

        {/* Suite logique si NON */}
        {satiete === "non" && (
          <>
            <label>Quels signaux de satiété as-tu ignorés ?</label>
            <div style={{ display: "flex", flexDirection: "column", marginBottom: 8 }}>
              {signauxSatieteList.map(signal => (
                <label key={signal} style={{ fontWeight: "normal" }}>
                  <input
                    type="checkbox"
                    checked={detailsSignaux.includes(signal)}
                    onChange={() => handleCheckSignal(signal)}
                  />
                  {signal}
                </label>
              ))}
            </div>
            <label>Pourquoi as-tu continué à manger ?</label>
            <input
              value={pourquoi}
              onChange={e => setPourquoi(e.target.value)}
              placeholder="Ex : gourmandise, stress, habitude…"
            />
          </>
        )}

        {/* Suite logique si PAS DE FAIM */}
        {satiete === "pas de faim" && (
          <>
            <label>Pourquoi as-tu mangé ?</label>
            <input
              value={pourquoi}
              onChange={e => setPourquoi(e.target.value)}
              placeholder="Ex : stress, habitude, social…"
            />
          </>
        )}

        {/* Baromètre d'état alimentaire */}
        {categorie !== 'Jeûne' && (
          <>
            <label style={{ marginTop: 16, display: "block" }}>Ressenti physique après le repas</label>
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {etatsAlimentaires.map(etat => (
            <button
              key={etat.value}
              type="button"
              onClick={() => handleSelectEtat(etat.value)}
              style={{
                background: ressenti === etat.value ? etat.color : "#f5f5f5",
                border: ressenti === etat.value ? "2px solid #1976d2" : "1px solid #ccc",
                borderRadius: "50%",
                width: 56,
                height: 56,
                fontSize: "2rem",
                cursor: "pointer",
                outline: "none",
                transition: "all 0.2s"
              }}
              aria-label={etat.label}
              title={etat.label}
            >
              {etat.icon}
            </button>
          ))}
        </div>
            {ressenti && (
              <div style={{ marginBottom: 16, color: "#1976d2" }}>
                Ton ressenti : <b>{etatsAlimentaires.find(e => e.value === ressenti)?.label}</b>
              </div>
            )}
          </>
        )}

        {/* Affichage dynamique des feedbacks/challenges/défis */}
        {reactBloc.map((bloc, i) => (
          <div key={i} style={{
            background: bloc.type === "challenge" ? "#ffe0b2" :
                        bloc.type === "defi" ? "#e1f5fe" :
                        bloc.type === "feedback" ? "#e8f5e9" : "#f3e5f5",
            color: "#222", borderRadius: 8, padding: 10, margin: "12px 0"
          }}>
            {bloc.message}
          </div>
        ))}

        {showDefi && (
          <div style={{ background: "#e1f5fe", borderRadius: 8, padding: 10, margin: "12px 0" }}>
            Défi : Essaie d'écouter ta satiété sur les 3 prochains repas.
            <button onClick={handleAccepteDefi} style={{ marginLeft: 10 }}>Accepter le défi</button>
          </div>
        )}

        <button type="submit" style={{ marginTop: 16 }}>Enregistrer ce repas</button>
      </form>
      {/* Suggestions IA issues des notes (analyse symbolique) */}
      {repasSemaine.length > 0 && (
        (() => {
          const suggestions = getSuggestionsFromNotes(repasSemaine);
          if (suggestions.length === 0) return null;
          return (
            <div style={{ background: '#f3e5f5', borderRadius: 8, padding: 10, margin: '12px 0' }}>
              <b>Suggestions IA :</b>
              <ul>
                {suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          );
        })()
      )}
    </div>
  )
}