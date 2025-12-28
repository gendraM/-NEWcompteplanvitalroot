import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { CRITERES_CRISTALLISATION } from '../data/referentiel';
import { analyserCriteresAutomatiques } from '../lib/analyseRepas3Jours';

export default function CristallisationQuotidien() {
  // Déclarer tous les hooks d'état AVANT tout usage dans les hooks ou dépendances
  const [isClient, setIsClient] = useState(false);
  const [jourAffiche, setJourAffiche] = useState(1); // DÉPLACÉ EN HAUT
  const router = useRouter();
  // === PROGRAMME ===
  const [dateDebut, setDateDebut] = useState(null);
  const [jourActuel, setJourActuel] = useState(1);
  const [totalJours] = useState(45);

  // === HANDLERS POUR DÉFIS PERSONNALISÉS ET BADGES ===
  // Sélectionner un défi personnalisé pour affichage ou validation
  const handleSelectDefi = (defi) => {
    setDefiSelectionne(defi);
    // Charger le journal du défi sélectionné (exemple : depuis localStorage ou Supabase)
    try {
      const journalStr = localStorage.getItem(`journalDefi_${defi?.id}_${jourAffiche}`);
      if (journalStr) {
        setJournalDefi(JSON.parse(journalStr));
      } else {
        setJournalDefi({});
      }
    } catch (e) {
      setJournalDefi({});
    }
  };

  // Valider une étape ou un défi personnalisé
  const handleValiderDefi = (defiId, etape) => {
    // Exemple : marquer l’étape comme validée dans le journal, puis sauvegarder
    const journalKey = `journalDefi_${defiId}_${jourAffiche}`;
    let journal = {};
    try {
      const journalStr = localStorage.getItem(journalKey);
      journal = journalStr ? JSON.parse(journalStr) : {};
    } catch (e) { journal = {}; }
    journal[etape] = true;
    localStorage.setItem(journalKey, JSON.stringify(journal));
    setJournalDefi(journal);
  };

  // Attribuer un badge après validation d’un défi ou d’un palier
  const handleAttribuerBadge = (badge) => {
    const badges = [...badgesObtenus, badge];
    localStorage.setItem('badgesObtenusCristallisation', JSON.stringify(badges));
    setBadgesObtenus(badges);
    setBadgeJustUnlocked(badge);
  };

  // === LOGIQUE DE CHARGEMENT DES DÉFIS PERSONNALISÉS ET BADGES ===
  useEffect(() => {
    if (!isClient || !jourAffiche) return;
    // Charger les défis personnalisés du jour (exemple : depuis localStorage ou Supabase)
    try {
      const defisStr = localStorage.getItem(`defisPersonnalises_${jourAffiche}`);
      if (defisStr) {
        setDefisPersonnalises(JSON.parse(defisStr));
      } else {
        setDefisPersonnalises([]);
      }
    } catch (e) {
      setDefisPersonnalises([]);
    }

    // Charger les badges obtenus (exemple : depuis localStorage ou Supabase)
    try {
      const badgesStr = localStorage.getItem('badgesObtenusCristallisation');
      if (badgesStr) {
        setBadgesObtenus(JSON.parse(badgesStr));
      } else {
        setBadgesObtenus([]);
      }
    } catch (e) {
      setBadgesObtenus([]);
    }
  }, [isClient, jourAffiche]);


  // === VALIDATION ===
  const [joursValides, setJoursValides] = useState({});
  const [criteresJour, setCriteresJour] = useState([]);
  const [validationJour, setValidationJour] = useState({});

  // === REPAS DU JOUR ===
  const [repasDuJour, setRepasDuJour] = useState([]);
  const [chargement, setChargement] = useState(true);

  // === SUGGESTIONS AUTO-VALIDATION ===
  const [suggestionsCriteres, setSuggestionsCriteres] = useState({});

  // === DÉFIS PERSONNALISÉS ===
  const [defisPersonnalises, setDefisPersonnalises] = useState([]); // Liste des défis personnalisés du jour
  const [defiSelectionne, setDefiSelectionne] = useState(null); // Défi sélectionné pour affichage ou validation
  const [journalDefi, setJournalDefi] = useState({}); // Journal de suivi du défi personnalisé

  // === BADGES ===
  const [badgesObtenus, setBadgesObtenus] = useState([]); // Liste des badges obtenus
  const [badgeJustUnlocked, setBadgeJustUnlocked] = useState(null); // Badge débloqué à l’instant


  // === CLIENT DETECTION ===
  useEffect(() => {
    setIsClient(true);
  }, []);

  // === CHARGEMENT INITIAL ===
  useEffect(() => {
    if (!isClient) return;
    chargerProgramme();
  }, [isClient]);

  // === CHARGEMENT JOUR AFFICHÉ ===
  useEffect(() => {
    if (!isClient || !dateDebut) return;
    chargerJourAffiche();
  }, [jourAffiche, dateDebut, isClient]);

  const chargerProgramme = () => {
    try {
      const programmeStr = localStorage.getItem('programmeCristallisation');
      if (!programmeStr) {
        router.push('/cristallisation');
        return;
      }

      const programme = JSON.parse(programmeStr);
      setDateDebut(programme.dateDebut);

      // Calculer jour actuel
      const debut = new Date(programme.dateDebut);
      const aujourdhui = new Date();
      const diffJours = Math.floor((aujourdhui - debut) / (1000 * 60 * 60 * 24));
      const jour = Math.min(diffJours + 1, 45);
      setJourActuel(jour);
      setJourAffiche(jour);

      // Charger jours validés
      const joursStr = localStorage.getItem('joursValidesCristallisation');
      if (joursStr) {
        setJoursValides(JSON.parse(joursStr));
      }

    } catch (error) {
      console.error('Erreur chargement programme:', error);
    }
  };

  const chargerJourAffiche = async () => {
    try {
      setChargement(true);

      // 1️⃣ Récupérer critères du jour depuis referentiel
      const criteres = getCriteresDuJour(jourAffiche);
      setCriteresJour(criteres);

      // 2️⃣ Charger validation du jour
      const validationStr = localStorage.getItem(`validationCristallisation_${jourAffiche}`);
      if (validationStr) {
        setValidationJour(JSON.parse(validationStr));
      } else {
        setValidationJour({});
      }

      // 3️⃣ Charger repas du jour depuis Supabase
      const dateJour = getDateDuJour(jourAffiche);
      const { data: repas } = await supabase
        .from('repas_reels')
        .select('*')
        .eq('date', dateJour)
        .order('heure', { ascending: true });
      
      setRepasDuJour(repas || []);

    } catch (error) {
      console.error('Erreur chargement jour:', error);
    } finally {
      setChargement(false);
    }
  };

  // === NOUVEAU (P2) : ANALYSE AUTOMATIQUE POUR SUGGESTIONS ===
  useEffect(() => {
    if (!isClient || !criteresJour || criteresJour.length === 0) return;
    if (!repasDuJour || repasDuJour.length === 0) {
      // Pas de repas = pas de suggestion
      setSuggestionsCriteres({});
      return;
    }

    try {
      console.log('[AUTO-VALIDATION] Analyse critères jour', jourAffiche, 'avec', repasDuJour.length, 'repas');
      const suggestions = analyserCriteresAutomatiques(criteresJour, repasDuJour);
      console.log('[AUTO-VALIDATION] Suggestions générées:', suggestions);
      setSuggestionsCriteres(suggestions);
    } catch (error) {
      console.error('[AUTO-VALIDATION] Erreur analyse:', error);
      setSuggestionsCriteres({});
    }
  }, [repasDuJour, criteresJour, jourAffiche, isClient]);

  const getCriteresDuJour = (jour) => {
    // Récupérer 5 critères pour ce jour depuis CRITERES_CRISTALLISATION
    if (!CRITERES_CRISTALLISATION?.criteres_quotidiens) {
      return [];
    }

    // Rotation circulaire des critères (45 jours, ~200 critères)
    const tousLesCriteres = CRITERES_CRISTALLISATION.criteres_quotidiens;
    const criteresDuJour = [];
    
    for (let i = 0; i < 5; i++) {
      const index = ((jour - 1) * 5 + i) % tousLesCriteres.length;
      criteresDuJour.push({
        id: `c${jour}_${i + 1}`,
        ...tousLesCriteres[index]
      });
    }

    return criteresDuJour;
  };

  const getDateDuJour = (jour) => {
    if (!dateDebut) return null;
    const date = new Date(dateDebut);
    date.setDate(date.getDate() + (jour - 1));
    return date.toISOString().split('T')[0];
  };

  const jourPrecedent = () => {
    if (jourAffiche > 1) {
      setJourAffiche(jourAffiche - 1);
    }
  };

  const jourSuivant = () => {
    if (jourAffiche < totalJours && jourAffiche < jourActuel) {
      setJourAffiche(jourAffiche + 1);
    }
  };

  const toggleCritere = (critereId) => {
    // Ne peut modifier que le jour actuel
    if (jourAffiche !== jourActuel) return;

    const nouvelleValidation = {
      ...validationJour,
      [critereId]: !validationJour[critereId]
    };

    setValidationJour(nouvelleValidation);
    localStorage.setItem(`validationCristallisation_${jourActuel}`, JSON.stringify(nouvelleValidation));

    // Vérifier si jour complet
    const nbValides = Object.values(nouvelleValidation).filter(v => v).length;
    if (nbValides === 5) {
      validerJour();
    }
  };

  // === NOUVEAU (P2) : ACCEPTER UNE SUGGESTION ===
  const accepterSuggestion = (critereId) => {
    console.log('[AUTO-VALIDATION] Acceptation suggestion critère:', critereId);
    
    // Valider le critère (même logique que toggleCritere)
    toggleCritere(critereId);
    
    // Retirer la suggestion
    setSuggestionsCriteres(prev => ({
      ...prev,
      [critereId]: { ...prev[critereId], suggere: false }
    }));
  };

  // === NOUVEAU (P2) : REFUSER UNE SUGGESTION ===
  const refuserSuggestion = (critereId) => {
    console.log('[AUTO-VALIDATION] Refus suggestion critère:', critereId);
    
    // Marquer comme refusé (ne plus suggérer)
    setSuggestionsCriteres(prev => ({
      ...prev,
      [critereId]: { ...prev[critereId], suggere: false }
    }));
  };

  const validerJour = () => {
    const nouveauxJoursValides = {
      ...joursValides,
      [jourActuel]: true
    };
    setJoursValides(nouveauxJoursValides);
    localStorage.setItem('joursValidesCristallisation', JSON.stringify(nouveauxJoursValides));
  };

  const getScoreJour = () => {
    return Object.values(validationJour).filter(v => v).length;
  };

  const getEmojiScore = (score) => {
    if (score === 5) return '🏆';
    if (score >= 3) return '✅';
    if (score >= 1) return '🟡';
    return '⚪';
  };

  const getFeedbackJour = () => {
    const score = getScoreJour();
    const repasExtras = repasDuJour.filter(r => r.est_extra).length;
    
    if (score === 5 && repasExtras === 0) {
      return {
        type: 'success',
        message: '🎉 Journée parfaite ! Tu cristallises de bonnes habitudes.',
        color: '#4caf50'
      };
    }
    
    if (score >= 3) {
      return {
        type: 'good',
        message: '✅ Bonne journée ! Continue sur cette lancée.',
        color: '#66bb6a'
      };
    }
    
    if (score >= 1) {
      return {
        type: 'warning',
        message: '🟡 Encore quelques efforts pour valider cette journée.',
        color: '#ff9800'
      };
    }
    
    return {
      type: 'neutral',
      message: '⚪ Commence à valider tes critères pour suivre ta progression.',
      color: '#9e9e9e'
    };
  };

  const getConseilNextMeal = () => {
    const repasExtras = repasDuJour.filter(r => r.est_extra).length;
    const heureActuelle = new Date().getHours();
    
    if (repasExtras >= 2) {
      return '🚫 Tu as déjà 2 extras aujourd\'hui. Prochain repas : CONFORME impératif.';
    }
    
    if (repasExtras === 1) {
      return '⚠️ 1 extra aujourd\'hui. Privilégie des repas conformes pour le reste de la journée.';
    }
    
    if (heureActuelle < 12) {
      return '☀️ Bon matin ! Démarre avec un petit-déjeuner conforme.';
    }
    
    if (heureActuelle < 18) {
      return '🌤️ Après-midi : choisis un déjeuner conforme avec légumes et protéines.';
    }
    
    return '🌙 Soir : privilégie un repas léger et conforme.';
  };

  if (!isClient || chargement) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  const feedback = getFeedbackJour();
  const dateAffichee = getDateDuJour(jourAffiche);
  const jourEstActuel = jourAffiche === jourActuel;
  const jourEstFutur = jourAffiche > jourActuel;

  return (
    <div>
      {/* Rendu complet uniquement côté client pour éviter l’erreur d’hydratation */}
      {isClient ? (
        <>
          {/* ...tout le contenu existant... */}
          {/* HEADER, NAVIGATION, FEEDBACK, CONSEIL, CRITÈRES, REPAS, DÉFIS, BADGES, MESSAGE CONSTRUCTION */}
        </>
      ) : null}
    </div>
  );
}
