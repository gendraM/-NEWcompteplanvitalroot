import { getFastFoodRewards } from '../lib/fastFoodRewards';
import { useSupabase } from '../lib/supabaseClient';
import { useState, useEffect, useCallback } from 'react'
import FlipNumbers from 'react-flip-numbers'
import referentielAliments from '../data/referentiel';
import { TYPES_EXTRAS, detecterTypeExtra, getOptionsExtras } from '../lib/extras';
import useUserReferentiel from '../lib/useUserReferentiel';
import FormAjoutAliment from './FormAjoutAliment';
// import foodsUser from '../data/foods_user';
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
}) {  // Hook Supabase avec contexte (doit être en premier)
  // (supabase déjà déclaré plus bas, ne pas redéclarer ici)
  // État pour afficher le formulaire d’ajout personnalisé
  const [showFormAjoutAliment, setShowFormAjoutAliment] = useState(false);
  const [alimentPropose, setAlimentPropose] = useState('');
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
  // --- DEBUG: log avant render (hors JSX)
  // (ce log sera exécuté à chaque render, avant le return)
  console.log('[DEBUG] Avant render champ Kcal :', kcal);
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
  
  // États pour auto-détection fast food Option B
  const [dernierFastFood, setDernierFastFood] = useState(null);
  const [prochainCreneau, setProchainCreneau] = useState(null);
  const [joursRestants, setJoursRestants] = useState(null);
  const [delaiRespected, setDelaiRespected] = useState(false);

  // Handler pour ajouter un aliment fast food
  const handleAddFastFoodAliment = () => {
    setFastFoodAliments([...fastFoodAliments, { nom: '', quantite: '', kcal: '' }]);
  };

  // Handler pour modifier un aliment fast food
  const handleChangeFastFoodAliment = (idx, field, value) => {
    const newAliments = fastFoodAliments.map((a, i) => i === idx ? { ...a, [field]: value } : a);
    setFastFoodAliments(newAliments);
  };

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

  // Validation stricte des props
  extrasRestants = typeof extrasRestants === 'number' && !isNaN(extrasRestants) ? extrasRestants : 0;
  const [estExtra, setEstExtra] = useState(false);
  const [typeExtra, setTypeExtra] = useState(''); // Sera calculé automatiquement
  const [satiete, setSatiete] = useState('');
  const [pourquoi, setPourquoi] = useState('');
  const [ressenti, setRessenti] = useState('');
  const [detailsSignaux, setDetailsSignaux] = useState([]);
  const [reactBloc, setReactBloc] = useState([]);
  const [showDefi, setShowDefi] = useState(false);
  const [loadingKcal, setLoadingKcal] = useState(false);
  
  // Auto-détection du type d'extra selon les kcal
  useEffect(() => {
    if (estExtra && kcal) {
      const type = detecterTypeExtra(kcal);
      setTypeExtra(type);
    } else {
      setTypeExtra('');
    }
  }, [estExtra, kcal]);
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

  // Fonction chargement dernier fast food (Option B auto-détection)
  const fetchDernierFastFood = useCallback(async () => {
    console.log('🔍 DEBUG fetchDernierFastFood - Début', { date });
    try {
      // App SANS authentification → Requête BDD sans user_id (RLS disabled)
      console.log('🔍 DEBUG fetchDernierFastFood - Chargement BDD sans user_id');
      
      const { data, error } = await supabase
        .from('repas_reels')
        .select('*')
        .or('categorie.eq.fast-food,tag.not.is.null')
        .order('date', { ascending: false });
      
      console.log('🔍 DEBUG fetchDernierFastFood - Requête terminée:', { 
        error, 
        nbResultats: data?.length || 0, 
        premiersResultats: data?.slice(0, 3).map(d => ({ date: d.date, aliment: d.aliment, categorie: d.categorie, tag: d.tag })) 
      });
      
      if (error) {
        console.error('Erreur chargement dernier fast food:', error);
        return;
      }
      
      if (data && data.length > 0) {
        console.log('\u2705 DEBUG fetchDernierFastFood - Historique trouvé:', data.length, 'fast foods');
        setFastFoodHistory(data);
        
        const dernier = data[0];
        setDernierFastFood(dernier);
        
        // Calculer prochain créneau
        const dernierDate = new Date(dernier.date);
        const prochainDate = new Date(dernierDate);
        prochainDate.setDate(dernierDate.getDate() + 45);
        setProchainCreneau(prochainDate.toLocaleDateString('fr-FR'));
        
        // Calculer jours restants
        const today = new Date();
        const diffMs = prochainDate - today;
        const jours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        setJoursRestants(jours);
        setDelaiRespected(jours === 0);
        
        // Calculer récompense : délai respecté si ≥45 jours depuis dernier
        const currentDate = new Date(date);
        const diffDays = Math.floor((currentDate - dernierDate) / (1000 * 60 * 60 * 24));
        console.log('\ud83d\udd0d DEBUG fetchDernierFastFood - Calcul récompense:', { 
          dernierDate: dernierDate.toISOString(), 
          currentDate: currentDate.toISOString(), 
          diffDays, 
          recompense: diffDays >= 45 
        });
        setFastFoodReward(diffDays >= 45);
      } else {
        console.log('\ud83c\udf89 DEBUG fetchDernierFastFood - AUCUN historique, premier fast food !');
        // Aucun historique BDD → premier fast food → récompense automatique
        setFastFoodReward(true);
      }
    } catch (err) {
      console.error('Erreur fetchDernierFastFood:', err);
    }
  }, [date]);

  // Auto-détection fast food Option B (basée sur categorie référentiel)
  useEffect(() => {
    console.log('\ud83d\udd0d DEBUG Auto-détection - aliment:', aliment);
    
    if (aliment && aliment.trim() !== '') {
      const found = referentielAliments.find(
        r => r.nom.toLowerCase() === aliment.toLowerCase()
      );
      
      console.log('\ud83d\udd0d DEBUG Auto-détection - found:', found ? { nom: found.nom, categorie: found.categorie, marque: found.marque } : null);
      
      if (found && found.categorie === 'fast-food') {
        console.log('\u2705 DEBUG Auto-détection - FAST FOOD détecté ! Appel fetchDernierFastFood()');
        // Auto-activer tracking (silencieux)
        setIsFastFood(true);
        setFastFoodType(found.marque || 'Non identifié');
        
        // Charger dernier fast food pour infos UX
        fetchDernierFastFood();
      } else {
        console.log('\u274c DEBUG Auto-détection - Pas fast food');
        setIsFastFood(false);
        setFastFoodType('');
        setDernierFastFood(null);
      }
    }
  }, [aliment, fetchDernierFastFood]);

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

  // DEBUG: Chargement du référentiel fusionné
  // Récupération de l'user_id réel via Supabase Auth
  const supabase = useSupabase();
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    async function fetchUserId() {
      const { data: userData } = await supabase.auth.getUser();
      if (userData && userData.user && userData.user.id) {
        setUserId(userData.user.id);
      }
    }
    fetchUserId();
  }, [supabase]);
  const { referentielComplet, referentielCustom, refresh: refreshReferentiel } = useUserReferentiel(userId);
  const [ajoutSucces, setAjoutSucces] = useState(null); // message de succès/erreur inline
  console.log('🔍 DEBUG RepasBloc - Référentiel fusionné:', {
    nombreAliments: referentielComplet.length,
    premiersAliments: referentielComplet.slice(0, 5).map(a => a.nom),
    contientOeuf: referentielComplet.some(a => a.nom.toLowerCase().includes('oeuf') || a.nom.toLowerCase().includes('œuf')),
    alimentsAvecOeuf: referentielComplet.filter(a => a.nom.toLowerCase().includes('oeuf') || a.nom.toLowerCase().includes('œuf')).map(a => a.nom)
  });

  // Fonction utilitaire pour normaliser le nom d'un aliment (anti-doublon)
  function normalizeNomAliment(nom) {
    return nom.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  // FUSION AUTOCOMPLETE : suggestions issues du référentiel global + custom user
  function getSuggestions(input) {
    if (!input || input.length < 2) return [];
    const inputNorm = normalizeNomAliment(input);
    // On fusionne les deux référentiels, puis on filtre sur le nom
    const fusion = Array.isArray(referentielComplet) ? referentielComplet : referentielAliments;
    const suggestions = fusion.filter(alim =>
      normalizeNomAliment(alim.nom).includes(inputNorm)
    );
    // DEBUG
    console.log('🔍 DEBUG getSuggestions:', {
      input,
      inputNorm,
      fusionLength: fusion.length,
      suggestionsLength: suggestions.length,
      suggestions: suggestions.map(a => a.nom),
      fusionPreview: fusion.slice(0, 5).map(a => a.nom)
    });
    return suggestions;
  }

  // Contrôle anti-doublon lors de l'ajout custom
  function existeDejaDansCustom(nom) {
    if (!Array.isArray(referentielCustom)) return false;
    const nomNorm = normalizeNomAliment(nom);
    return referentielCustom.some(alim => normalizeNomAliment(alim.nom) === nomNorm);
  }

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
              categorie: isJeune ? 'Jeûne' : (isFastFood ? 'fast-food' : categorieFinal),
              quantite: isJeune ? null : (quantiteFinal === '' ? null : isNaN(Number(quantiteFinal)) ? quantiteFinal : Number(quantiteFinal)),
              kcal: isJeune ? null : (kcalFinal === '' ? null : isNaN(Number(kcalFinal)) ? kcalFinal : Number(kcalFinal)),
              est_extra: false,
              satiete,
              pourquoi,
              ressenti,
              details_signaux: detailsSignaux,
              repas_planifie_respecte: true,
              note,
              tag: isFastFood ? fastFoodType : null
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
      setTypeExtra('');
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
      categorie: categorie === 'Jeûne' ? 'Jeûne' : (isFastFood ? 'fast-food' : categorie),
      quantite: categorie === 'Jeûne' ? null : (quantite === '' ? null : isNaN(Number(quantite)) ? quantite : Number(quantite)),
      kcal: categorie === 'Jeûne' ? null : (kcal === '' ? null : isNaN(Number(kcal)) ? kcal : Number(kcal)),
      est_extra: estExtra,
      satiete,
      pourquoi,
      ressenti,
      details_signaux: detailsSignaux,
      note,
      tag: isFastFood ? fastFoodType : null
    });
    
    // Rechargement de l'historique fast food après enregistrement
    if (isFastFood) {
      fetchDernierFastFood();
    }
    
    // Reset des hooks pour garder la fonctionnalité existante
    setAliment('');
    setCategorie('');
    setQuantite('');
    setKcal('');
    setEstExtra(false);
    setTypeExtra('');
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

  // Handler pour ajout d'un aliment personnalisé en BDD Supabase
  async function handleAjoutAlimentPerso(data) {
    setAjoutSucces(null);
    try {
      if (!userId) {
        setAjoutSucces({ type: 'erreur', message: "Utilisateur non authentifié : impossible d'ajouter l'aliment personnalisé." });
        return;
      }
      // Insertion dans Supabase
      const { error } = await supabase
        .from('referentiel_user_custom')
        .insert([
          {
            user_id: userId,
            aliment_data: data,
            statut: 'en_attente',
            date_ajout: new Date().toISOString()
          }
        ]);
      if (error) {
        setAjoutSucces({ type: 'erreur', message: "Erreur lors de l'ajout de l'aliment personnalisé : " + error.message });
        return;
      }
      // Fermeture du formulaire
      setShowFormAjoutAliment(false);
      // Pré-remplissage immédiat des champs avec les données saisies
      setAliment(data.nom);
      if (data.categorie) setCategorie(data.categorie);
      if (data.quantite) setQuantite(String(data.quantite));
      if (data.kcalParUnite) setKcal(String(Number(data.kcalParUnite)));
      else if (data.kcal) setKcal(String(Number(data.kcal)));
      setSuggestionsFiltrees([]);
      setAfficherSuggestions(false);
      // Rafraîchissement du référentiel pour disponibilité immédiate en suggestions
      refreshReferentiel();
      setAjoutSucces({ type: 'succes', message: "Aliment personnalisé ajouté ! Il est disponible dans vos repas (en attente de modération)." });
      // Focus automatique sur l'input principal après fermeture (UX)
      setTimeout(() => {
        const input = document.querySelector('input[name="aliment"]');
        if (input) input.focus();
      }, 200);
    } catch (e) {
      setAjoutSucces({ type: 'erreur', message: "Erreur technique lors de l'ajout de l'aliment personnalisé." });
      console.error(e);
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
            const lastFastFood = fastFoodHistory[0]; // Plus récent (ORDER DESC)
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
        {(() => {
          console.log('🔍 DEBUG Récompense - Conditions:', { isFastFood, fastFoodReward });
          return isFastFood && fastFoodReward && (
            <div style={{ background: '#e8f5e9', color: '#388e3c', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              🎉 Bravo ! Tu as respecté le délai entre deux fast food.<br />
              Tu débloques une récompense et tu progresses vers une meilleure alimentation !
            </div>
          );
        })()}
          {/* Message de félicitations et suggestion de planification (fusion dynamique + astuce) */}
          {(() => {
            console.log('🔍 DEBUG Message fusion - isFastFood:', isFastFood, 'fastFoodHistory.length:', fastFoodHistory.length);
            return isFastFood && (
            (() => {
              // getFastFoodRewards attend ORDER ASC, on inverse l'array DESC de la BDD
              const rewards = getFastFoodRewards([...fastFoodHistory].reverse());
              console.log('🔍 DEBUG getFastFoodRewards - Résultat:', rewards);
              let astuce = null;
              if (fastFoodReward) {
                astuce = <><br /><span style={{ fontWeight: 500 }}>Astuce : note la date du prochain créneau dans ton agenda pour maximiser ta récompense !</span></>;
              } else if (fastFoodHistory.length > 0) {
                const lastFastFood = fastFoodHistory[0]; // Plus récent (ORDER DESC)
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
            );
          })()}
        {/* Section Fast Food détaillée masquée - Auto-détection via saisie normale suffit */}
        
        <h3>{type} du {date}</h3>
        <label>Aliment mangé</label>
        <div style={{ position: 'relative' }}>
          {/* DEBUG affichage état formulaire ajout personnalisé */}
          <div style={{ fontSize: 12, color: '#b71c1c', marginBottom: 4 }}>
            <b>DEBUG formulaire ajout :</b> showFormAjoutAliment={String(showFormAjoutAliment)} | alimentPropose="{alimentPropose}"<br/>
            Suggestions ({suggestionsFiltrees.length}) : [{suggestionsFiltrees.map(s => s.nom).join(', ')}]
          </div>
          <input
            value={aliment}
            onChange={e => {
              const val = e.target.value;
              setAliment(val);
              const normaliser = (str) => str.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/œ/g, 'oe');
              const valNormalisee = normaliser(val);
              let filtrees = [];
              if (val.length >= 1) {
                filtrees = referentielComplet.filter(a => 
                  normaliser(a.nom).includes(valNormalisee)
                ).slice(0, 10); // Max 10 suggestions
                setSuggestionsFiltrees(filtrees);
                setAfficherSuggestions(true);
              } else {
                setSuggestionsFiltrees([]);
                setAfficherSuggestions(false);
              }
              // Détection aliment inconnu (toujours mise à jour)
              const found = referentielComplet.find(a => normaliser(a.nom) === valNormalisee);
              setShowFormAjoutAliment(!found && val.length > 2);
              setAlimentPropose(val);
            }}
            onFocus={() => {
              if (aliment.length >= 1 && suggestionsFiltrees.length > 0) {
                setAfficherSuggestions(true);
              }
            }}
            onBlur={() => {
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
                    // Pré-remplissage des champs à partir du référentiel complet (global + custom)
                    const found = referentielComplet.find(alim => alim.nom && alim.nom.toLowerCase() === a.nom.toLowerCase());
                    console.log('[DEBUG RepasBloc] Aliment sélectionné:', found);
                    if (found) {
                      if (found.categorie) setCategorie(found.categorie);
                      if (found.quantite) setQuantite(String(found.quantite));
                      // Correction : remplir Kcal avec kcal ou kcalParUnite
                      if (found.kcalParUnite) {
                        setKcal(String(Number(found.kcalParUnite)));
                        console.log('[DEBUG] setKcal appelé avec (kcalParUnite):', found.kcalParUnite);
                      } else if (found.kcal) {
                        setKcal(String(Number(found.kcal)));
                        console.log('[DEBUG] setKcal appelé avec (kcal):', found.kcal);
                      }
                      // Ajout d'autres champs si besoin (unite, portionDefaut...)
                    }
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
          {/* Affichage du formulaire d’ajout personnalisé si aliment inconnu */}
          {showFormAjoutAliment && (
            <div style={{ marginTop: 16, background: '#fffbe6', border: '1px solid #ffe082', borderRadius: 8, padding: 16 }}>
              <FormAjoutAliment
                nomInitial={alimentPropose}
                onSave={handleAjoutAlimentPerso}
                onCancel={() => setShowFormAjoutAliment(false)}
              />
            </div>
          )}
          {/* Message de retour inline (succès ou erreur) */}
          {ajoutSucces && (
            <div style={{
              marginTop: 10,
              padding: '10px 14px',
              borderRadius: 6,
              background: ajoutSucces.type === 'succes' ? '#e8f5e9' : '#ffebee',
              color: ajoutSucces.type === 'succes' ? '#2e7d32' : '#b71c1c',
              border: `1px solid ${ajoutSucces.type === 'succes' ? '#a5d6a7' : '#ef9a9a'}`,
              fontSize: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{ajoutSucces.type === 'succes' ? '✅ ' : '❌ '}{ajoutSucces.message}</span>
              <button type="button" onClick={() => setAjoutSucces(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          )}
        </div>
        {(() => {
          // Recherche dans le référentiel complet (global + custom)
          const found = referentielComplet.find(a => a.nom && a.nom.toLowerCase() === aliment.toLowerCase());
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
          const found = referentielComplet.find(a => a.nom && a.nom.toLowerCase() === aliment.toLowerCase());
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
            const found = referentielComplet.find(a => a.nom && a.nom.toLowerCase() === aliment.toLowerCase());
            // Autorise le calcul automatique si kcalParUnite ou kcal sont présents
            return found && ((found.kcalParUnite || found.kcal) && quantite);
          })()}
          style={(() => {
            const found = referentielComplet.find(a => a.nom && a.nom.toLowerCase() === aliment.toLowerCase());
            return (found && (found.kcalParUnite || found.kcal) && quantite) ? { background: '#f0f0f0' } : {};
          })()}
        />
        {(() => {
          const found = referentielComplet.find(a => a.nom && a.nom.toLowerCase() === aliment.toLowerCase());
          return (found && (found.kcalParUnite || found.kcal) && quantite) ? (
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

        {/* Encadré pédagogique + Type d'extra (auto-détecté) */}
        {estExtra && categorie !== 'Jeûne' && (
          <div style={{
            marginTop: '1rem',
            marginBottom: '1rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 12,
            color: '#fff',
            fontSize: '0.9rem',
            lineHeight: '1.6'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              🎁 C'est quoi un EXTRA ?
            </div>
            
            <div style={{ marginBottom: '1rem', opacity: 0.95 }}>
              Un extra = <strong>moment de plaisir planifié et conscient</strong>, consommé <strong>HORS des repas équilibrés</strong> (dessert ajouté, viennoiserie, chocolat, apéritif, pop-corn, confiserie…).
            </div>
            
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.15)', borderRadius: 8 }}>
              ⚠️ <strong>Un extra ne remplace jamais un repas.</strong><br/>
              S'il remplace un repas, ce n'est plus un extra.
            </div>
            
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,200,100,0.2)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)' }}>
              <strong>📌 Rappel important</strong><br/>
              <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.95 }}>
                Assurez-vous que la consommation saisie est bien un extra (cf. règle extra).<br/>
                ⚠️ Les <strong>fast-foods ne sont pas des extras</strong>.<br/>
                → Utilisez la catégorie appropriée (Fast-food, Déjeuner, Dîner, etc.) et <strong>décochez la case extra</strong>.
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '1rem' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🎯 L'art de l'équilibre alimentaire</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                La gestion des extras repose sur la <strong>régularité</strong>, pas sur la privation.<br/>
                ✓ Constance et ancrage d'habitudes durables<br/>
                ✓ Conscience du plaisir (sans automatisme)<br/>
                ✓ Liberté mentale (sans peur de manquer)<br/>
                ✓ Zéro culpabilité, zéro compensation<br/><br/>
                <em>Dire non maintenant, ce n'est pas dire non pour toujours.</em><br/>
                C'est choisir le meilleur moment pour consommer ce qui vous fait envie,<br/>
                en vous permettant de vous rapprocher plus rapidement de votre objectif.
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '1rem' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>✨ Pourquoi ce système fonctionne</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                Le type d'extra vous aide à :<br/>
                ✓ <strong>Distinguer clairement</strong> repas et plaisirs hors repas<br/>
                ✓ <strong>Organiser</strong> vos extras sans les subir<br/>
                ✓ <strong>Visualiser</strong> vos habitudes (petits plaisirs et moments festifs)<br/>
                ✓ <strong>Rester alignée</strong> avec votre objectif de perte de poids<br/><br/>
                <em style={{ opacity: 0.95 }}>Un extra bien géré ne freine pas la perte.<br/>
                Ce sont les accumulations non conscientes qui la bloquent.</em>
              </div>
            </div>
            
            {kcal && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.2)', borderRadius: 8 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  📊 Type d'extra (calculé automatiquement)
                </div>
                
                {typeExtra && (
                  <>
                    <div style={{ 
                      fontSize: '1.1rem', 
                      padding: '0.75rem', 
                      background: typeExtra === 'majeur' ? 'rgba(255,107,107,0.3)' : 'rgba(255,255,255,0.25)', 
                      borderRadius: 6, 
                      marginBottom: '0.5rem',
                      border: typeExtra === 'majeur' ? '2px solid #ff6b6b' : 'none'
                    }}>
                      {TYPES_EXTRAS[typeExtra].emoji} <strong>{TYPES_EXTRAS[typeExtra].label}</strong> ({TYPES_EXTRAS[typeExtra].seuil_min}-{TYPES_EXTRAS[typeExtra].seuil_max === 99999 ? '∞' : TYPES_EXTRAS[typeExtra].seuil_max} kcal)
                    </div>
                    
                    <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                      <strong>→</strong> {TYPES_EXTRAS[typeExtra].description}<br/>
                      <em>Exemples : {TYPES_EXTRAS[typeExtra].exemples}</em>
                    </div>
                    
                    {typeExtra === 'majeur' && (
                      <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.2)', borderRadius: 6, marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        <strong>⚠️ Impact très élevé sur le budget</strong><br/>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', opacity: 0.95 }}>
                          Un extra reste un extra quelle que soit sa valeur calorique.<br/>
                          Les calories servent uniquement à mesurer l'impact sur votre budget hebdomadaire.<br/><br/>
                          💡 <strong>Rappel</strong> : Si cela <strong>remplace</strong> un repas (restaurant, fast-food, brunch), utilisez la catégorie repas appropriée, pas "extra".
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            {!kcal && (
              <div style={{ fontSize: '0.85rem', opacity: 0.8, fontStyle: 'italic', marginTop: '1rem' }}>
                💡 Saisissez les kcal pour voir le type d'extra auto-détecté
              </div>
            )}
          </div>
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