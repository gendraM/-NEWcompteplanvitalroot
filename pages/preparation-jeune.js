// === DEBUG PERSISTANCE PRÉPARATION JEÛNE ===
function DebugPreparationJeune() {
  const [debugData, setDebugData] = useState({});
  const refreshDebug = () => {
    if (typeof window !== 'undefined') {
      setDebugData({
        preparationActive: localStorage.getItem('preparationActive'),
        preparationData: localStorage.getItem('preparationData'),
        criteresPreparation: localStorage.getItem('criteresPreparation'),
        messagePersoPreparation: localStorage.getItem('messagePersoPreparation'),
        phaseJeuneCommencee: localStorage.getItem('phaseJeuneCommencee'),
        dateDebutJeune: localStorage.getItem('dateDebutJeune'),
        bilanPreparationJeune: localStorage.getItem('bilanPreparationJeune'),
      });
    }
  };
  useEffect(() => { refreshDebug(); }, []);
  return (
    <div style={{background:'#f1f5f9',border:'1px solid #38bdf8',borderRadius:8,padding:12,margin:'18px 0',fontSize:13}}>
      <b>DEBUG PRÉPARATION JEÛNE (localStorage)</b>
      <button style={{marginLeft:12,padding:'2px 8px',fontSize:12}} onClick={refreshDebug}>Rafraîchir</button>
      <ul style={{margin:'8px 0 0 0',paddingLeft:18}}>
        {Object.entries(debugData).map(([k,v]) => (
          <li key={k}><b>{k}</b> : <span style={{color:'#0ea5e9'}}>{v ? v : <i>vide</i>}</span></li>
        ))}
      </ul>
    </div>
  );
}
// ...existing code...

  // === PHASES MÉTIER PARTAGÉES (source unique, cf. lib/preparationJeuneMetier.js) ===
  import {
    CRITERES_PREPARATION,
    getPhasesPreparation,
    getPhaseDuJour,
    getCriteresDuJour,
    validerCriteresDuJour
  } from '../lib/preparationJeuneMetier';

  const phasesMetier = getPhasesPreparation();
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { validerCritereAuto, getStatutCritereAuto } from '../lib/validerCriterePreparation';
import { getCritereIdFromLabel } from '../lib/validerCriterePreparation';
import { getCriteresPreparation, isPeriodeActive, validerCriterePreparation, calculerJourRelatif, getFenetreValidation, evaluerRespectPortionRepas, getResumePortionParJour, calculerVolumeHydratationRepas, getSeuilCritereAuto } from "../lib/validerCriterePreparation";
import { savePreparationJeuneSupabase, getPreparationJeuneSync } from '../lib/preparationsJeune';
import { createParcoursJeune, demarrerPhaseJeune } from '../lib/parcoursJeuneAPI';
import referentielAliments from '../data/referentiel';
import HeaderPreparation from '../components/HeaderPreparation';
import TimelinePreparation from '../components/TimelinePreparation';
import ProgressBar from '../components/ProgressBar';
import PhaseCard from '../components/PhaseCard';
// PhaseDatesBar retiré selon demande utilisateur
import Feedback from '../components/Feedback';
import Navigation from '../components/Navigation';
import StartPreparationModal from '../components/StartPreparationModal';
import { useSupabase } from '../lib/supabaseClient';
// ...existing code...

export default function PreparationJeune() {
  // Hook pour le bouton de démarrage du jeûne (doit être en haut)
  const [loadingJeune, setLoadingJeune] = useState(false);
  // Récupération du userId via Supabase
  const supabase = useSupabase();
  const [userId, setUserId] = useState(null);
  const [authError, setAuthError] = useState(null);
  useEffect(() => {
    let ignore = false;
    async function fetchUser() {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      let user = sessionData?.session?.user || null;
      let error = sessionError;

      if (!user && !sessionError) {
        const userResult = await supabase.auth.getUser();
        user = userResult.data?.user || null;
        error = userResult.error;
      }

      if (!ignore) {
        if (error || !user) {
          setUserId(null);
          setAuthError("Vous devez être connecté pour démarrer la préparation et voir l'analyse des repas.");
        } else {
          setUserId(user.id);
          setAuthError(null);
        }
      }
    }
    fetchUser();
    return () => { ignore = true; };
  }, [supabase]);
  // === ÉTAT POUR L’EXPANSION/RÉDUCTION DES PHASES ===
  const [phasesOuvertes, setPhasesOuvertes] = useState(phasesMetier.map(() => false));

  // Handler pour toggler l’état d’une phase
  const togglePhase = idx => {
    setPhasesOuvertes(prev => prev.map((open, i) => (i === idx ? !open : false)));
  };

  // === HOOKS & VARIABLES (ordre strict) ===
  // Date du jeûne, durée, jour courant
  const [dateJeune, setDateJeune] = useState(null);
  const [dureeJeune, setDureeJeune] = useState(null);
  const [aujourdhui, setAujourdhui] = useState(new Date());
  const [jCourant, setJCourant] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Mettre à jour la date du jour à minuit (pour recalculer jCourant automatiquement)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0); // Minuit suivant
    const msUntilMidnight = tomorrow - now;
    
    const timer = setTimeout(() => {
      setAujourdhui(new Date());
      // Relancer le timer pour le jour suivant
      const updateDaily = setInterval(() => {
        setAujourdhui(new Date());
      }, 24 * 60 * 60 * 1000);
      return () => clearInterval(updateDaily);
    }, msUntilMidnight);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (dateJeune) {
      // jour relatif = nombre de jours avant J0 (ex: -10)
      // Utiliser le state aujourdhui pour cohérence
      const today = new Date(aujourdhui);
      today.setHours(0,0,0,0);
      const dateJ0 = new Date(dateJeune);
      dateJ0.setHours(0,0,0,0);
      const diffJours = Math.max(0, Math.round((dateJ0 - today) / (1000 * 60 * 60 * 24)));
      setJCourant(-diffJours);
    }
  }, [dateJeune, aujourdhui]);

  // Critères de préparation (statut dynamique)
  // État de démarrage du suivi de préparation (workflow interactif)
  const [preparationActive, setPreparationActive] = useState(false);
  const [statutsValidationAutoPrep, setStatutsValidationAutoPrep] = useState({});
  const [joursFenetre7j, setJoursFenetre7j] = useState([]);
  const [repasAutoValidation, setRepasAutoValidation] = useState([]);
  const [repasHistoriqueBrut, setRepasHistoriqueBrut] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preparationData, setPreparationData] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [suiviPreparationOuvert, setSuiviPreparationOuvert] = useState(true);
  const [configJeuneCritere, setConfigJeuneCritere] = useState({
    nombreJeunes: 2,
    dureeHeures: 24,
    option: 'A'
  });
  // Modèle unique partagé (lib/preparationJeuneMetier.js) : plus de définition locale dupliquée
  const criteresMetier = CRITERES_PREPARATION;
  const phasesAvecCriteres = phasesMetier;
  const autoValidationConfig = [
    { id: 1, label: 'Portions', mode: 'auto', conseil: 'Utilise les repères visuels à chacun de tes repas aujourd’hui.' },
    { id: 2, label: 'Féculents le soir', mode: 'auto', conseil: 'Prévois ce soir un dîner sans féculents.' },
    { id: 3, label: 'Transformés & sucreries', mode: 'auto', conseil: 'Remplace les produits transformés/sucrés par des alternatives brutes aujourd’hui.' },
    { id: 4, label: `Jeûnes réalisés (${configJeuneCritere.nombreJeunes} x ${configJeuneCritere.dureeHeures}h)`, mode: 'auto', conseil: 'Suis le réalisé selon ta configuration validée (catégorie Jeûne).' },
    { id: 5, label: 'Transition pré-jeûne', mode: 'auto', conseil: 'Reste sur des catégories de transition (brut, léger, sans ultra-transformé).' },
    { id: 7, label: 'Hydratation', mode: 'auto', conseil: 'Bois 2L d’eau aujourd’hui pour consolider ton rythme.' },
    { id: 8, label: 'Pas après 19h', mode: 'auto', conseil: 'Termine ton dîner avant 19h pour valider ce critère.' },
    { id: 9, label: 'Repas ≤ 45 min', mode: 'auto', conseil: 'Garde un repas simple et concentré pour rester sous 45 minutes.' }
  ];
  const [criteres, setCriteres] = useState([]); // Liste dynamique avec statut validé
  const [progression, setProgression] = useState(0); // Nombre de critères validés
  const [messagePerso, setMessagePerso] = useState("");
  const [syntheseVisible, setSyntheseVisible] = useState(false);

  // === INITIALISATION (ordre strict) ===
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncConfigJeuneCritere = () => {
      try {
        const raw = localStorage.getItem('critere6Config');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const nombreJeunes = Number.parseInt(parsed?.nombreJeunes, 10);
        const dureeHeures = Number.parseInt(parsed?.dureeHeures, 10);
        setConfigJeuneCritere({
          nombreJeunes: Number.isFinite(nombreJeunes) && nombreJeunes > 0 ? nombreJeunes : 2,
          dureeHeures: Number.isFinite(dureeHeures) && dureeHeures > 0 ? dureeHeures : 24,
          option: parsed?.option || 'A'
        });
      } catch (e) {
        console.warn('[Préparation] Lecture critere6Config impossible:', e);
      }
    };

    syncConfigJeuneCritere();
    window.addEventListener('storage', syncConfigJeuneCritere);
    return () => window.removeEventListener('storage', syncConfigJeuneCritere);
  }, []);

  useEffect(() => {
    // Synchronisation cloud/local à l’ouverture (si connecté)
    async function syncPreparation() {
      let localPrep = null;
      if (typeof window !== 'undefined') {
        const prepData = window.localStorage.getItem('preparationData');
        if (prepData) {
          try { localPrep = JSON.parse(prepData); } catch {}
        }
      }
      let prep = localPrep;
      if (userId) {
        prep = await getPreparationJeuneSync(userId, localPrep);
      }
      if (prep && prep.startDate) {
        setPreparationData(prep);
        const dateJeuneObj = new Date(prep.startDate);
        setDateJeune(dateJeuneObj);
        setDureeJeune(prep.duration || 'X');
        setAujourdhui(new Date());
        const diff = calculerJourRelatif(prep.startDate, new Date());
        setJCourant(diff);
        setPreparationActive(true);
        if (Array.isArray(prep.criteres) && prep.criteres.length > 0) {
          const criteresNormalises = prep.criteres.map(c => ({
            ...c,
            validé: Boolean(c.validé || c.valide),
            valide: Boolean(c.validé || c.valide),
          }));
          setCriteres(criteresNormalises);
        } else {
          const criteresStorage = getCriteresPreparation();
          const criteresInit = criteresMetier.map(c => {
            const saved = criteresStorage[c.id] || {};
            const estValide = Boolean(saved.validé || saved.valide);
            return {
              ...c,
              validé: estValide,
              valide: estValide,
              dateValidation: saved.dateValidation || null,
              typeValidation: saved.typeValidation || null,
            };
          });
          setCriteres(criteresInit);
        }
        if (prep.messagePerso) setMessagePerso(prep.messagePerso);
        // Mise à jour localStorage si cloud plus récent
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('preparationData', JSON.stringify(prep));
        }
      } else {
        setFeedbackMessage("⛔ Veuillez renseigner la date de début de jeûne pour activer le suivi et la progression.");
        setPreparationActive(false);
      }
    }
    syncPreparation();
    // eslint-disable-next-line
  }, [userId]);

  // Auto-détection des critères via repas_reels (7 derniers jours)
  useEffect(() => {
    async function analyserRepas7Jours() {
      try {
        if (!preparationActive) return;
        if (!userId) return; // Pas d'utilisateur connecté : pas de repas à analyser
        // Charger les repas récents (uniquement ceux de l'utilisateur connecté)
        const { data: repasData, error } = await supabase
          .from('repas_reels')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(200);
        if (error) return;
        setRepasHistoriqueBrut(repasData || []);
        const today = new Date();
        const sourceActivation = preparationData?.createdAt || preparationData?.updatedAt || null;
        const dateActivation = sourceActivation ? new Date(sourceActivation) : null;
        if (dateActivation && !Number.isNaN(dateActivation.getTime())) {
          dateActivation.setHours(0, 0, 0, 0);
        }
        const repas7j = (repasData || []).filter(r => {
          const d = new Date(r.date);
          const diff = Math.floor((today - d) / (1000*60*60*24));
          if (diff < 0 || diff >= 7) return false;
          if (dateActivation && !Number.isNaN(dateActivation.getTime()) && d < dateActivation) return false;
          return true;
        });
        setRepasAutoValidation(repas7j);
        // Générer la fenêtre J-6 -> J-0 pour affichage
        const jours = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
          return { label: `J-${6 - i}`, date: d.toISOString().slice(0,10), affichage: dateStr };
        });
        setJoursFenetre7j(jours);

        const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const statuts = {};
        ids.forEach(id => {
          statuts[id] = getStatutCritereAuto(id, repas7j, referentielAliments, {
            jeuneConfig: configJeuneCritere,
          });
          if (id !== 6 && statuts[id].validé) {
            validerCritereAuto(id);
          }
        });
        setStatutsValidationAutoPrep(statuts);
      } catch(e) {
        console.error('[Préparation] Auto-validation repas 7j:', e);
      }
    }
    analyserRepas7Jours();
  }, [preparationActive, dateJeune, userId, configJeuneCritere, preparationData]);

  // Helpers formatage période/date
  function addDays(baseDate, offset) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + offset);
    return d;
  }
  function formatJourFr(d) {
    return d.toLocaleDateString('fr-FR', { weekday: 'long' });
  }
  function formatDateFR(d) {
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }
  function formatDateHeureFR(iso) {
    try {
      const d = new Date(iso);
      const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
      const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `${date} à ${time}`;
    } catch { return iso; }
  }
  function formatISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function formatPeriodePhase(dateJeuneLocal, debut, fin) {
    const start = addDays(dateJeuneLocal, debut);
    const end = addDays(dateJeuneLocal, fin);
    return `${formatJourFr(start)} ${formatDateFR(start)} → ${formatJourFr(end)} ${formatDateFR(end)}`;
  }

  // Handler pour démarrer le suivi de préparation (doit être accessible dans le rendu)
  function handleStartPreparation() {
    setPreparationActive(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('preparationActive', 'true');
    }
  }

  // === LOGIQUE MÉTIER ===
  // Calcul de la progression réelle
  useEffect(() => {
    console.log('🔍 [useEffect criteres] Déclenché - criteres a changé');
    const nbValid = criteres.filter(c => c.valide).length;
    setProgression(nbValid);
    setSyntheseVisible(nbValid === criteresMetier.length);
    // Sauvegarde cloud + local à chaque modification
    async function syncCriteres() {
      if (typeof window !== 'undefined') {
        const prepData = window.localStorage.getItem('preparationData');
        let prep = prepData ? JSON.parse(prepData) : {};
        prep.criteres = criteres;
        prep.updatedAt = new Date().toISOString();
        window.localStorage.setItem('preparationData', JSON.stringify(prep));
        console.log('🔍 [useEffect criteres] avant savePreparationJeuneSupabase, prep.id =', prep.id);
        console.log('🔍 [useEffect criteres] avant savePreparationJeuneSupabase, prep.startDate =', prep.startDate);
        if (userId) {
          console.log('💾 [useEffect criteres] Appelant savePreparationJeuneSupabase avec userId:', userId);
          await savePreparationJeuneSupabase(userId, prep);
        }
      }
    }
    syncCriteres();
    // eslint-disable-next-line
  }, [criteres, userId]);

  // Handler de validation d’un critère (manuel, à améliorer avec auto-validation plus tard)
  function validerCritere(id) {
    console.log('[validerCritere] Appelée pour id:', id);
    const critere = criteresMetier.find(c => c.id === id);
    if (!critere) {
      setFeedbackMessage("❌ Critère introuvable.");
      console.error('[validerCritere] Critère introuvable pour id:', id);
      return;
    }
    console.log('[validerCritere] Critère trouvé:', critere);
    // Vérification de la période active
    if (!isPeriodeActive(critere.jalon, jCourant)) {
      setFeedbackMessage("⛔ Validation impossible : la période pour ce critère n'est pas encore active ou est verrouillée. Veuillez respecter le calendrier de préparation.");
      console.warn('[validerCritere] Période non active pour critère:', critere, 'jCourant:', jCourant);
      return;
    }
    const dateValidation = new Date().toISOString();
    try {
      validerCriterePreparation(id, dateValidation);
      console.log('[validerCritere] Appel validerCriterePreparation OK pour id:', id, 'date:', dateValidation);
    } catch (e) {
      setFeedbackMessage("❌ Erreur lors de la sauvegarde du critère.");
      console.error('[validerCritere] Erreur validerCriterePreparation:', e);
      return;
    }
    setCriteres(prev => {
      const newCriteres = prev.map(c => c.id === id ? { ...c, valide: true, validé: true, dateValidation } : c);
      console.log('[validerCritere] setCriteres (nouvel état):', newCriteres);
      return newCriteres;
    });
    setFeedbackMessage("✅ Critère validé avec succès.");
    console.log('[validerCritere] Succès: Critère validé pour id:', id);
  }

  // Handler de modification du message personnel
  function handleMessageChange(e) {
    setMessagePerso(e.target.value);
    if (typeof window !== 'undefined') {
      const prepData = window.localStorage.getItem('preparationData');
      let prep = prepData ? JSON.parse(prepData) : {};
      prep.messagePerso = e.target.value;
      prep.updatedAt = new Date().toISOString();
      window.localStorage.setItem('preparationData', JSON.stringify(prep));
      if (userId) {
        savePreparationJeuneSupabase(userId, prep);
      }
    }
  }

  // Fonction statut dynamique avec fenêtres de validation
  function getStatut(jalonJ) {
    if (jCourant === null) return '[À VENIR]';
    
    const jalon = jalonJ * -1; // Convertir J-30 → -30
    const fenetre = getFenetreValidation(jalon);
    
    // Critère pas encore atteint
    if (jCourant < jalon) {
      return '[À VENIR]';
    }
    
    // Critère dans la fenêtre de validation
    if (jCourant >= jalon && jCourant <= fenetre) {
      return jCourant === jalon ? '[EN COURS]' : '[ACTIF]';
    }
    
    // Critère verrouillé (hors fenêtre)
    return '[VERROUILLÉ]';
  }

  // Helpers pour affichage date
  function formatDate(date) {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  // Handler pour validation de la modale et activation complète du workflow
  async function handleStartPreparationModal(data) {
    console.log('🔍 [handleStartPreparationModal] Données reçues de la modale:', data);

    let preparationEnrichie = { ...data };

    // Le parcours central est créé dès le début de la préparation.
    // En cas d'indisponibilité Supabase, la préparation locale reste utilisable
    // et aucune donnée locale n'est effacée.
    if (userId) {
      try {
        const dateDebutPreparation = new Date().toISOString().slice(0, 10);
        const parcours = await createParcoursJeune({
          type: 'preparation',
          date_debut: dateDebutPreparation,
          date_debut_preparation: dateDebutPreparation,
          date_debut_jeune: data.startDate || null,
          duree_jours: Number(data.duration) || null,
          statut: 'en_cours',
          progression: { source: 'preparation-jeune' }
        }, userId);

        preparationEnrichie = {
          ...preparationEnrichie,
          parcoursId: parcours.id,
          jeuneId: parcours.id
        };

        const preparationSauvegardee = await savePreparationJeuneSupabase(
          userId,
          preparationEnrichie
        );
        if (preparationSauvegardee?.id) {
          preparationEnrichie.id = preparationSauvegardee.id;
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('parcoursJeuneActifId', parcours.id);
        }
      } catch (error) {
        console.error('[Préparation] Création du parcours central impossible:', error);
        setFeedbackMessage(
          '⚠️ La préparation reste enregistrée localement, mais la synchronisation du parcours a échoué.'
        );
      }
    }

    setPreparationData(preparationEnrichie);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preparationData', JSON.stringify(preparationEnrichie));
      localStorage.setItem('preparationActive', 'true');
      localStorage.setItem('dateJeune', preparationEnrichie.startDate);
      localStorage.setItem('dureeJeune', preparationEnrichie.duration);
    }

    setPreparationActive(true);
    const criteresInit = criteresMetier.map(c => ({
      ...c,
      valide: false,
      validé: false,
      dateValidation: null
    }));
    setCriteres(criteresInit);

    if (typeof window !== 'undefined') {
      localStorage.setItem('criteresPreparation', JSON.stringify(criteresInit));
    }

    setFeedbackMessage('✅ Préparation activée ! Suivi et critères disponibles.');
  }

  // Handler pour réinitialiser toute la préparation
  function handleResetPreparation() {
    setPreparationData(null);
    setPreparationActive(false);
    setCriteres([]);
    setProgression(0);
    setMessagePerso("");
    setSyntheseVisible(false);
    setDateJeune(null);
    setDureeJeune(null);
    setJCourant(null);
    setFeedbackMessage("Préparation réinitialisée. Vous pouvez recommencer le suivi.");
    if (typeof window !== 'undefined') {
      localStorage.removeItem('preparationData');
      localStorage.removeItem('preparationActive');
      localStorage.removeItem('criteresPreparation');
      localStorage.removeItem('dateJeune');
      localStorage.removeItem('dureeJeune');
      localStorage.removeItem('messagePersoPreparation');
    }
    // Feedback visuel (console)
    console.log('Préparation réinitialisée. Source : action utilisateur, bouton réinitialisation.');
  };
  // === FIN DEBUG PANEL ===
  // Ajoute ceci dans le corps du composant PreparationJeune (avant le return)
React.useEffect(() => {
  console.log('[DEBUG] Date lue (state):', dateJeune);
  if (typeof window !== 'undefined') {
    console.log('[DEBUG] Date lue (localStorage):', window.localStorage.getItem('dateJeune'));
  }
  console.log('[DEBUG] Jour courant (jCourant):', jCourant);
  console.log('[DEBUG] Progression:', progression);
  console.log('[DEBUG] preparationActive:', preparationActive);
  console.log('[DEBUG] Feedback:', feedbackMessage);
  console.log('[DEBUG] Critères:', criteres);
}, [dateJeune, jCourant, progression, preparationActive, feedbackMessage, criteres]);

const DebugPanel = () => (
  <div style={{background:'#ffe',border:'2px solid #fc0',padding:'12px',marginBottom:'18px',fontSize:'15px'}}>
    <strong>DEBUG PANEL</strong><br/>
    Date lue (state): {dateJeune ? dateJeune.toString() : 'null'}<br/>
    Date lue (localStorage): {typeof window !== 'undefined' ? window.localStorage.getItem('dateJeune') : 'n/a'}<br/>
    Jour courant (jCourant): {jCourant !== null ? jCourant : 'null'}<br/>
    Progression: {progression}<br/>
    preparationActive: {preparationActive ? 'true' : 'false'}<br/>
    Feedback: {feedbackMessage}<br/>
    Critères: <pre style={{fontSize:'13px',background:'#fff',padding:'6px',border:'1px solid #ccc'}}>{JSON.stringify(criteres, null, 2)}</pre>
  </div>
);

  // Fonction utilitaire pour calculer la date réelle d'un jalon
  function getDateFromJalon(jalon) {
    if (!dateJeune) return null;
    const d = new Date(dateJeune);
    d.setDate(d.getDate() - (jCourant - jalon));
    return d;
  }

  // Fonction pour formater une date
  function formatDateAffichage(date) {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  const criteresParId = criteres.reduce((acc, critere) => {
    acc[critere.id] = critere;
    return acc;
  }, {});

  function normaliserDateBilan(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function getDateActivationPrepa() {
    const source = preparationData?.createdAt || preparationData?.updatedAt || null;
    return normaliserDateBilan(source);
  }

  function filtrerRepasSurFenetre(repasList, dateMin, dateMax) {
    if (!Array.isArray(repasList) || repasList.length === 0) return [];
    return repasList.filter(repas => {
      const dateRepas = normaliserDateBilan(repas?.date);
      if (!dateRepas) return false;
      if (dateMin && dateRepas < dateMin) return false;
      if (dateMax && dateRepas > dateMax) return false;
      return true;
    });
  }

  function construireStatutsCritereParIds(repasList) {
    const ids = [1, 2, 3, 4, 5, 7, 8, 9];
    return ids.reduce((acc, id) => {
      acc[id] = getStatutCritereAuto(id, repasList, referentielAliments, {
        jeuneConfig: configJeuneCritere,
      });
      return acc;
    }, {});
  }

  function construireTexteCritere(cle, statuts) {
    if (!statuts) return null;
    if (cle === 1) {
      return statuts.joursRespectés > 0
        ? `${statuts.joursRespectés} jour(s) conforme(s) sur la période`
        : 'Aucun jour conforme sur cette période.';
    }
    if (cle === 2) {
      return statuts.joursRespectés > 0
        ? `${statuts.joursRespectés} jour(s) sans féculent le soir`
        : 'Aucun dîner conforme sur cette période.';
    }
    if (cle === 3) {
      return `${statuts.joursRespectés || 0} jour(s) conformes, ${statuts.joursNonConformes || 0} non conformes`;
    }
    if (cle === 4) {
      return `${statuts.joursRespectés || 0}/${statuts.seuil || configJeuneCritere.nombreJeunes} jeûne(s) détecté(s)`;
    }
    if (cle === 5) {
      return `${statuts.joursRespectés || 0} jour(s) de transition conformes`;
    }
    if (cle === 7) {
      return `${statuts.joursRespectés || 0} jour(s) à 2L d’eau`;
    }
    if (cle === 8) {
      return `${statuts.joursRespectés || 0} jour(s) avec dernier repas avant 19h`;
    }
    if (cle === 9) {
      return `${statuts.joursRespectés || 0} jour(s) avec repas ≤ 45 min`;
    }
    return null;
  }

  const dateActivationPrepa = getDateActivationPrepa();
  const dateAvantActivation = dateActivationPrepa ? new Date(dateActivationPrepa) : null;
  if (dateAvantActivation) {
    dateAvantActivation.setDate(dateAvantActivation.getDate() - 1);
  }
  const dateDebutBaseline = dateActivationPrepa ? new Date(dateActivationPrepa) : null;
  if (dateDebutBaseline) {
    dateDebutBaseline.setDate(dateDebutBaseline.getDate() - 7);
  }

  const repasBaseline = dateActivationPrepa
    ? filtrerRepasSurFenetre(repasHistoriqueBrut, dateDebutBaseline, dateAvantActivation)
    : [];

  const statutsBaseline = dateActivationPrepa
    ? construireStatutsCritereParIds(repasBaseline)
    : {};

  const bilanComparatif = (() => {
    const ids = [1, 2, 3, 4, 5, 7, 8, 9];
    const lignes = ids.map(id => {
      const avant = statutsBaseline[id] || { joursRespectés: 0, validé: false, seuil: getSeuilCritereAuto(id) };
      const apres = statutsValidationAutoPrep[id] || { joursRespectés: 0, validé: false, seuil: getSeuilCritereAuto(id) };
      const delta = (apres.joursRespectés || 0) - (avant.joursRespectés || 0);
      const ecartApres = Math.max(0, (apres.seuil || getSeuilCritereAuto(id)) - (apres.joursRespectés || 0));
      return {
        id,
        label: criteresMetier.find(c => c.id === id)?.label || `Critère ${id}`,
        avant,
        apres,
        delta,
        ecartApres,
        libelleAvant: construireTexteCritere(id, avant),
        libelleApres: construireTexteCritere(id, apres),
      };
    });

    const meilleurProgres = lignes
      .filter(ligne => ligne.delta > 0)
      .sort((a, b) => b.delta - a.delta || a.ecartApres - b.ecartApres)[0]
      || lignes
        .filter(ligne => (ligne.apres.joursRespectes || 0) > 0)
        .sort((a, b) => (b.apres.joursRespectes || 0) - (a.apres.joursRespectes || 0))[0]
      || null;

    const axes = lignes
      .filter(ligne => ligne.ecartApres > 0)
      .sort((a, b) => b.ecartApres - a.ecartApres || a.delta - b.delta)
      .slice(0, 2);

    const priorite = axes[0] || meilleurProgres;

    return {
      ligneComparaison: meilleurProgres,
      axes,
      priorite,
      toutRespecte: lignes.every(ligne => ligne.ecartApres === 0),
      lignes,
    };
  })();

  const bilanPhraseFinale = bilanComparatif.toutRespecte
    ? 'Bravo, tu as très bien suivi ta préparation. Tu peux démarrer la phase de jeûne en confiance.'
    : 'Même si tout n’est pas parfait, chaque préparation est un progrès. Tu pourras faire encore mieux la prochaine fois.';

  function estCritereValide(critere) {
    return Boolean(critere?.validé || critere?.valide);
  }

  const criteresBilan = criteresMetier.map(base => {
    const local = criteresParId[base.id] || {};
    return {
      ...base,
      ...local,
      validé: estCritereValide(local),
      valide: estCritereValide(local),
    };
  });
  const criteresValidesBilan = criteresBilan.filter(c => c.validé);
  const criteresNonValidesBilan = criteresBilan.filter(c => !c.validé);

  const aujourdHuiIso = formatISODate(aujourdhui);
  const repasAujourdhui = repasAutoValidation.filter(repas => repas.date === aujourdHuiIso);
  const resumePortionsParJour = getResumePortionParJour(repasAutoValidation, referentielAliments);

  function getResumeCritereDuJour(critereId) {
    if (repasAujourdhui.length === 0) {
      return {
        titre: 'Aujourd’hui',
        detail: 'Aucun repas saisi aujourd’hui.',
        ton: '#64748B'
      };
    }

    if (critereId === 1) {
      const resumeJour = resumePortionsParJour[aujourdHuiIso];
      if (!resumeJour || resumeJour.repasAnalysables === 0) {
        return {
          titre: 'Aujourd’hui',
          detail: 'Aucun repas analysable aujourd’hui.',
          ton: '#64748B'
        };
      }
      return {
        titre: 'Aujourd’hui',
        detail: `${resumeJour.repasConformes}/${resumeJour.repasAnalysables} repas conformes • ${resumeJour.alimentsConformes}/${resumeJour.alimentsAnalysables} aliments dans la bonne portion`,
        ton: resumeJour.repasConformes === resumeJour.repasAnalysables ? '#059669' : '#475569'
      };
    }

    if (critereId === 2) {
      const diners = repasAujourdhui.filter(repas => repas.type === 'Dîner' || repas.type === 'Diner');
      if (diners.length === 0) {
        return { titre: 'Aujourd’hui', detail: 'Aucun dîner saisi pour ce critère.', ton: '#64748B' };
      }
      const feculents = ['pain', 'pâtes', 'pate', 'riz', 'pomme de terre', 'pommes de terre', 'quinoa', 'boulgour', 'semoule', 'couscous', 'féculent', 'feculent'];
      const contientFeculent = diners.some(diner => {
        const aliment = String(diner.aliment || '').toLowerCase();
        const categorie = String(diner.categorie || '').toLowerCase();
        return feculents.some(fec => aliment.includes(fec) || categorie.includes(fec));
      });
      return {
        titre: 'Aujourd’hui',
        detail: contientFeculent ? 'Dîner avec féculent détecté.' : 'Dîner saisi sans féculent détecté.',
        ton: contientFeculent ? '#B45309' : '#059669'
      };
    }

    if (critereId === 3) {
      const statut3 = statutsValidationAutoPrep[3];
      if (!statut3) {
        return { titre: 'Aujourd’hui', detail: 'Analyse transformés/sucreries en attente.', ton: '#64748B' };
      }
      const nonConformes = statut3.joursNonConformes || 0;
      const ambigus = statut3.joursAmbigus || 0;
      if (nonConformes > 0) {
        return {
          titre: 'Fenêtre 7 jours',
          detail: `${nonConformes} jour(s) non conforme(s) détecté(s) (transformés/sucreries).`,
          ton: '#B45309'
        };
      }
      if (ambigus > 0) {
        return {
          titre: 'Fenêtre 7 jours',
          detail: `${ambigus} jour(s) ambigus à confirmer (données incomplètes).`,
          ton: '#64748B'
        };
      }
      return {
        titre: 'Fenêtre 7 jours',
        detail: 'Aucun jour non conforme détecté sur produits transformés/sucreries.',
        ton: '#059669'
      };
    }

    if (critereId === 4) {
      const statut4 = statutsValidationAutoPrep[4];
      if (!statut4) {
        return { titre: 'Fenêtre 7 jours', detail: 'Analyse des jeûnes réalisés en attente.', ton: '#64748B' };
      }
      if ((statut4.joursAmbigus || 0) > 0) {
        return {
          titre: 'Fenêtre 7 jours',
          detail: `${statut4.joursAmbigus} jour(s) ambigus (données incomplètes).`,
          ton: '#64748B'
        };
      }
      return {
        titre: 'Fenêtre 7 jours',
        detail: `${statut4.joursRespectés || 0}/${statut4.seuil || configJeuneCritere.nombreJeunes} jeûne(s) détecté(s) selon ta configuration.`,
        ton: '#059669'
      };
    }

    if (critereId === 5) {
      const statut5 = statutsValidationAutoPrep[5];
      if (!statut5) {
        return { titre: 'Fenêtre 7 jours', detail: 'Analyse de transition pré-jeûne en attente.', ton: '#64748B' };
      }
      if ((statut5.joursNonConformes || 0) > 0) {
        return {
          titre: 'Fenêtre 7 jours',
          detail: `${statut5.joursNonConformes} jour(s) non conforme(s) dans la transition.`,
          ton: '#B45309'
        };
      }
      if ((statut5.joursAmbigus || 0) > 0) {
        return {
          titre: 'Fenêtre 7 jours',
          detail: `${statut5.joursAmbigus} jour(s) ambigus à confirmer.`,
          ton: '#64748B'
        };
      }
      return {
        titre: 'Fenêtre 7 jours',
        detail: `Transition conforme sur ${statut5.joursRespectés || 0} jour(s).`,
        ton: '#059669'
      };
    }

    if (critereId === 6) {
      const statut6 = statutsValidationAutoPrep[6];
      if (!statut6) {
        return { titre: 'Assistance', detail: 'Pré-analyse de validation assistée en attente.', ton: '#64748B' };
      }
      return {
        titre: 'Assistance',
        detail: statut6.eligibleValidationAssistee
          ? '2 jours détectés: critère prêt pour validation assistée.'
          : `${statut6.joursRespectés || 0}/2 jours détectés pour activer la validation assistée.`,
        ton: statut6.eligibleValidationAssistee ? '#059669' : '#475569'
      };
    }

    if (critereId === 7) {
      const totalMl = repasAujourdhui.reduce((sum, repas) => sum + calculerVolumeHydratationRepas(repas, referentielAliments), 0);
      return {
        titre: 'Aujourd’hui',
        detail: `${totalMl} ml détectés sur 2000 ml requis.`,
        ton: totalMl >= 2000 ? '#059669' : '#475569'
      };
    }

    if (critereId === 8) {
      const heures = repasAujourdhui.map(repas => repas.heureRepas || repas.heure_repas || repas.heure).filter(Boolean).sort();
      if (heures.length === 0) {
        return { titre: 'Aujourd’hui', detail: 'Aucune heure de repas détectée.', ton: '#64748B' };
      }
      const derniereHeure = heures[heures.length - 1];
      return {
        titre: 'Aujourd’hui',
        detail: `Dernier repas détecté à ${derniereHeure}.`,
        ton: derniereHeure < '19:00' ? '#059669' : '#B45309'
      };
    }

    if (critereId === 9) {
      const groupes = {};
      repasAujourdhui.forEach(repas => {
        const cle = repas.type || 'Repas';
        if (!groupes[cle]) groupes[cle] = [];
        groupes[cle].push(repas);
      });
      const resumes = Object.entries(groupes).map(([type, repas]) => {
        const heures = repas.map(item => item.heureRepas || item.heure_repas || item.heure).filter(Boolean).sort();
        if (heures.length <= 1) return `${type}: ${repas.length} saisie${repas.length > 1 ? 's' : ''} (provisoirement OK)`;
        const [h1, m1] = heures[0].split(':').map(Number);
        const [h2, m2] = heures[heures.length - 1].split(':').map(Number);
        const duree = (h2 * 60 + m2) - (h1 * 60 + m1);
        return `${type}: ${duree} min`;
      });
      return {
        titre: 'Aujourd’hui',
        detail: resumes.join(' • '),
        ton: '#475569'
      };
    }

    return {
      titre: 'Aujourd’hui',
      detail: 'Analyse du jour indisponible.',
      ton: '#64748B'
    };
  }

  const autoValidationRows = autoValidationConfig.map(config => {
    const statut = statutsValidationAutoPrep[config.id] || { joursRespectés: 0, validé: false, seuil: getSeuilCritereAuto(config.id) };
    const critereMetier = criteresMetier.find(c => c.id === config.id) || null;
    const phaseOrigine = critereMetier
      ? phasesMetier.find(phase => (phase.jalons || []).includes(critereMetier.jalon))
      : null;
    const seuil = statut.seuil || getSeuilCritereAuto(config.id);
    const reste = Math.max(0, seuil - (statut.joursRespectés || 0));
    const resumeJour = getResumeCritereDuJour(config.id);

    return {
      ...config,
      jalon: critereMetier?.jalon || null,
      phaseOrigineNom: phaseOrigine?.nom || 'Phase non déterminée',
      seuil,
      joursRespectes: statut.joursRespectés || 0,
      valide: Boolean(statut.validé),
      reste,
      typeValidation: statut.typeValidation || null,
      joursAmbigus: statut.joursAmbigus || 0,
      joursNonConformes: statut.joursNonConformes || 0,
      validationAssisteeRequise: Boolean(statut.validationAssisteeRequise),
      eligibleValidationAssistee: Boolean(statut.eligibleValidationAssistee),
      resumeJour
    };
  });

  function getEtatGuidage(row) {
    if ((row.joursNonConformes || 0) > 0 || (row.joursAmbigus || 0) > 0) {
      return { label: 'Point de vigilance', color: '#B45309', bg: '#FFF7ED' };
    }
    if (row.valide || row.joursRespectes > 0) {
      return { label: 'En bonne voie', color: '#047857', bg: '#ECFDF5' };
    }
    return { label: 'A faire aujourd’hui', color: '#1D4ED8', bg: '#EFF6FF' };
  }

  const phaseActive = typeof jCourant === 'number' ? getPhaseDuJour(jCourant) : null;
  const jalonsPhaseActive = new Set(phaseActive?.jalons || []);
  const rowsPhaseActive = autoValidationRows.filter(row => row.jalon && jalonsPhaseActive.has(row.jalon));
  const rowsHorsPhaseActive = autoValidationRows.filter(row => !row.jalon || !jalonsPhaseActive.has(row.jalon));
  const autoValidationRowsAffichees = rowsPhaseActive.length > 0 ? rowsPhaseActive : autoValidationRows;

  const rowsAutresPhasesPassees = rowsHorsPhaseActive.filter(row => {
    if (typeof jCourant !== 'number') return false;
    const phaseOrigine = phasesMetier.find(phase => phase.nom === row.phaseOrigineNom);
    if (!phaseOrigine || typeof phaseOrigine.fin !== 'number') return false;
    return phaseOrigine.fin < jCourant;
  });

  const rowsAutresPhasesFutures = rowsHorsPhaseActive.filter(row => {
    if (typeof jCourant !== 'number') return false;
    const phaseOrigine = phasesMetier.find(phase => phase.nom === row.phaseOrigineNom);
    if (!phaseOrigine || typeof phaseOrigine.debut !== 'number') return false;
    return phaseOrigine.debut > jCourant;
  });

  function getPeriodeLabelPhase(phase) {
    if (!phase) return 'Période non définie';
    if (dateJeune && typeof phase.debut === 'number' && typeof phase.fin === 'number') {
      return formatPeriodePhase(dateJeune, phase.debut, phase.fin);
    }
    return `J${phase.debut} à J${phase.fin}`;
  }

  const phaseActivePeriode = getPeriodeLabelPhase(phaseActive);

  const phaseActiveIndex = phasesAvecCriteres.findIndex(phase => phase.id === phaseActive?.id);
  const prochainePhase = typeof jCourant === 'number'
    ? phasesAvecCriteres
      .filter(phase => typeof phase.debut === 'number' && phase.debut > jCourant)
      .sort((a, b) => a.debut - b.debut)[0]
    : null;
  const joursAvantProchainePhase = prochainePhase && typeof jCourant === 'number'
    ? Math.max(0, prochainePhase.debut - jCourant)
    : null;
  const afficherApercuProchainePhase = Number.isFinite(joursAvantProchainePhase) && joursAvantProchainePhase > 0 && joursAvantProchainePhase <= 5;

  useEffect(() => {
    if (phaseActiveIndex < 0) return;
    setPhasesOuvertes(prev => {
      if (prev.some(Boolean)) return prev;
      return prev.map((_, i) => i === phaseActiveIndex);
    });
  }, [phaseActiveIndex]);

  const prochainGeste = autoValidationRows
    .filter(row => !row.valide)
    .sort((a, b) => (b.joursRespectes - a.joursRespectes) || (a.reste - b.reste))[0];

  return (
    <div style={{ background: '#F5F8FA', minHeight: '100vh', paddingBottom: 40 }}>
      <Navigation />
      <HeaderPreparation />
      {/* Bouton d'accès à l'historique des préparations */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0' }}>
        <Link href="/historique-preparations-jeune" passHref legacyBehavior>
          <a
            style={{
              background: 'linear-gradient(90deg, #4F8FFF 0%, #43D9A3 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 32px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px 0 rgba(79,143,255,0.10)',
              fontFamily: 'Inter, Roboto, Arial, sans-serif',
              letterSpacing: 0.5,
              outline: 'none',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            aria-label="Voir mon historique de préparations"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}
          >
            Voir mon historique de préparations
          </a>
        </Link>
      </div>
      
      {/* Bannière date/heure actuelle - EN HAUT SOUS HEADER */}
      {dateJeune && (
        <div style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: '#fff',
          padding: '14px 20px',
          margin: '0 auto 20px auto',
          textAlign: 'center',
          maxWidth: 900,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: '0.3px',
          borderRadius: 8
        }}>
          ☀️ Lever de soleil — {aujourdhui.toLocaleDateString('fr-FR', {
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} à {aujourdhui.toLocaleTimeString('fr-FR', {
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      )}
      
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 12px' }}>
        {/* Feedback global */}
        {feedbackMessage && (
          <Feedback type={feedbackMessage.startsWith('✅') ? 'success' : feedbackMessage.startsWith('⛔') || feedbackMessage.startsWith('❌') ? 'error' : 'info'}>
            {feedbackMessage}
          </Feedback>
        )}
        {/* Date de début de jeûne */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 22px', marginBottom: 24, fontWeight: 600, fontSize: '1.08em', color: '#4F8FFF', boxShadow: '0 2px 8px 0 rgba(79,143,255,0.07)', border: '1px solid #E3EAF2', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          Date de début de jeûne : {dateJeune ? formatDateAffichage(dateJeune) : <span style={{ color: '#FF6B6B' }}>Non renseignée</span>}
        </div>
        {/* Progression globale */}
        <ProgressBar value={progression} max={criteresMetier.length} />
        {preparationActive && (
          <section style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f4fbff 100%)',
            borderRadius: 16,
            padding: '20px 22px',
            margin: '22px auto 24px auto',
            boxShadow: '0 6px 18px rgba(79,143,255,0.08)',
            border: '1px solid #DCEBFA',
            maxWidth: 760
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
              <div>
                <h3 style={{ color: '#2563EB', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Suivi préparation jeûne</h3>
                <div style={{ color: '#64748B', fontSize: '0.96rem', marginTop: 4 }}>
                  {phaseActive
                    ? `Phase active : ${phaseActive.nom} • ${phaseActivePeriode}`
                    : 'Tes repas mettent a jour automatiquement les criteres lies au suivi.'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSuiviPreparationOuvert(v => !v)}
                  style={{
                    background: '#2563EB',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 999,
                    padding: '8px 12px',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  {suiviPreparationOuvert ? 'Replier le suivi' : 'Déplier le suivi'}
                </button>
                <a href="/suivi" style={{ background: '#E8F3FF', color: '#2563EB', textDecoration: 'none', padding: '8px 12px', borderRadius: 999, fontWeight: 700, fontSize: 13 }}>Voir mon suivi repas</a>
              </div>
            </div>

            {suiviPreparationOuvert && (
              <>

            {phaseActive?.id === 'phase2-intensification' ? (
              <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
                {[
                  { id: 'bloc-soir', titre: '1) Alimentation du soir', ids: [2] },
                  { id: 'bloc-qualite', titre: '2) Qualité alimentaire', ids: [3, 5] },
                  { id: 'bloc-jeune', titre: '3) Jeûne d\'entraînement (config validée)', ids: [4] },
                ].map(bloc => {
                  const rowsBloc = autoValidationRowsAffichees.filter(row => bloc.ids.includes(row.id));
                  if (rowsBloc.length === 0) return null;
                  return (
                    <div key={bloc.id} style={{ background: '#FFFFFF', border: '1px solid #D9E7F5', borderRadius: 12, padding: '12px 14px' }}>
                      <div style={{ color: '#1E40AF', fontWeight: 800, fontSize: 14, marginBottom: 10 }}>{bloc.titre}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                        {rowsBloc.map(row => {
                          const etat = getEtatGuidage(row);
                          return (
                            <div key={row.id} style={{
                              background: row.valide ? '#ECFDF5' : '#FFFFFF',
                              border: `1px solid ${row.valide ? '#A7F3D0' : '#D9E7F5'}`,
                              borderRadius: 12,
                              padding: '12px 14px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                                <span style={{ color: '#0F172A', fontWeight: 700, fontSize: 14 }}>{row.label}</span>
                                <span style={{ color: row.valide ? '#059669' : '#2563EB', fontWeight: 800, fontSize: 13 }}>
                                  {row.joursRespectes}/{row.seuil}
                                </span>
                              </div>
                              <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: etat.color, background: etat.bg }}>
                                {etat.label}
                              </div>
                              <div style={{ marginTop: 8, color: row.valide ? '#047857' : '#475569', fontSize: 13, fontWeight: 600 }}>
                                {row.valide ? '✅ Auto-validé' : `⏳ Encore ${row.reste} jour${row.reste > 1 ? 's' : ''}`}
                              </div>
                              <div style={{ marginTop: 8, background: '#F8FAFC', borderRadius: 10, padding: '8px 10px', border: '1px solid #E2E8F0' }}>
                                <div style={{ color: '#2563EB', fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{row.resumeJour.titre}</div>
                                <div style={{ color: row.resumeJour.ton, fontSize: 12, lineHeight: 1.4 }}>{row.resumeJour.detail}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginTop: 14 }}>
                {autoValidationRowsAffichees.map(row => {
                  const etat = getEtatGuidage(row);
                  return (
                    <div key={row.id} style={{
                      background: row.valide ? '#ECFDF5' : '#FFFFFF',
                      border: `1px solid ${row.valide ? '#A7F3D0' : '#D9E7F5'}`,
                      borderRadius: 12,
                      padding: '12px 14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                        <span style={{ color: '#0F172A', fontWeight: 700, fontSize: 14 }}>{row.label}</span>
                        <span style={{ color: row.valide ? '#059669' : '#2563EB', fontWeight: 800, fontSize: 13 }}>
                          {row.joursRespectes}/{row.seuil}
                        </span>
                      </div>
                      <div style={{ marginTop: 6, color: '#475569', fontSize: 12, fontWeight: 700 }}>
                        {row.phaseOrigineNom}
                      </div>
                      <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: etat.color, background: etat.bg }}>
                        {etat.label}
                      </div>
                      <div style={{ marginTop: 8, color: row.valide ? '#047857' : '#475569', fontSize: 13, fontWeight: 600 }}>
                        {row.valide ? '✅ Auto-validé' : `⏳ Encore ${row.reste} jour${row.reste > 1 ? 's' : ''}`}
                      </div>
                      <div style={{ marginTop: 8, background: '#F8FAFC', borderRadius: 10, padding: '8px 10px', border: '1px solid #E2E8F0' }}>
                        <div style={{ color: '#2563EB', fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{row.resumeJour.titre}</div>
                        <div style={{ color: row.resumeJour.ton, fontSize: 12, lineHeight: 1.4 }}>{row.resumeJour.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {rowsAutresPhasesPassees.length > 0 && rowsPhaseActive.length > 0 && (
              <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: 'pointer', color: '#2563EB', fontWeight: 700, fontSize: 13 }}>
                  Voir aussi les routines déjà introduites ({rowsAutresPhasesPassees.length})
                </summary>
                <div style={{ marginTop: 8, color: '#64748B', fontSize: 12, lineHeight: 1.5 }}>
                  Ce bloc montre uniquement les critères auto des phases déjà passées.
                  En phase 2, cela correspond principalement aux routines de la phase 1.
                  Les critères auto de la phase active restent au-dessus, et ceux des phases futures restent masqués jusqu'à J-5.
                </div>
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  {rowsAutresPhasesPassees.map(row => {
                    const phaseOrigineMeta = phasesMetier.find(phase => phase.nom === row.phaseOrigineNom) || null;
                    const phaseOriginePeriode = getPeriodeLabelPhase(phaseOrigineMeta);
                    const routineMaintenue = Boolean(row.valide || (row.joursRespectes || 0) > 0);
                    return (
                    <div key={`autre-phase-${row.id}`} style={{
                      background: '#FFFFFF',
                      border: '1px solid #D9E7F5',
                      borderRadius: 12,
                      padding: '12px 14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                        <span style={{ color: '#0F172A', fontWeight: 700, fontSize: 14 }}>{row.label}</span>
                        <span style={{ color: row.valide ? '#059669' : '#2563EB', fontWeight: 800, fontSize: 13 }}>
                          {row.joursRespectes}/{row.seuil}
                        </span>
                      </div>
                      <div style={{ marginTop: 6, color: '#475569', fontSize: 12, fontWeight: 700 }}>
                        {row.phaseOrigineNom}
                      </div>
                      <div style={{ marginTop: 2, color: '#94A3B8', fontSize: 12, fontWeight: 600 }}>
                        {phaseOriginePeriode}
                      </div>
                      {routineMaintenue ? (
                        <div style={{ marginTop: 8 }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: '#ECFDF5',
                            color: '#047857',
                            border: '1px solid #A7F3D0',
                            borderRadius: 999,
                            padding: '3px 8px',
                            fontSize: 11,
                            fontWeight: 800
                          }}>
                            Routine maintenue
                          </span>
                        </div>
                      ) : (
                        <div style={{ marginTop: 8 }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: '#FFF7ED',
                            color: '#B45309',
                            border: '1px solid #FCD34D',
                            borderRadius: 999,
                            padding: '3px 8px',
                            fontSize: 11,
                            fontWeight: 800
                          }}>
                            Routine à relancer
                          </span>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </details>
            )}

            {rowsAutresPhasesFutures.length > 0 && !afficherApercuProchainePhase && (
              <div style={{ marginTop: 10, color: '#64748B', fontSize: 12 }}>
                Les critères des phases à venir restent masqués pour préserver le focus. Ils apparaîtront à J-5.
              </div>
            )}

            <div style={{ marginTop: 14, background: '#F8FAFC', border: '1px dashed #BFDBFE', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ color: '#2563EB', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>Prochain meilleur geste</div>
              <div style={{ color: '#334155', fontSize: 14 }}>
                {prochainGeste ? prochainGeste.conseil : 'Tous les criteres auto sont deja valides. Continue sur ce rythme.'}
              </div>
            </div>

            {afficherApercuProchainePhase && prochainePhase && (
              <div style={{ marginTop: 12, background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ color: '#9A3412', fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
                  Vision phase à venir (J-{joursAvantProchainePhase})
                </div>
                <div style={{ color: '#7C2D12', fontSize: 14, marginBottom: 8 }}>
                  {prochainePhase.nom} • {getPeriodeLabelPhase(prochainePhase)} démarre bientôt. Prépare-toi progressivement sans perdre le focus sur aujourd'hui.
                </div>
                <button
                  onClick={() => {
                    const idx = phasesAvecCriteres.findIndex(p => p.id === prochainePhase.id);
                    if (idx >= 0) {
                      setPhasesOuvertes(prev => prev.map((_, i) => i === idx));
                    }
                  }}
                  style={{
                    background: '#EA580C',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Ouvrir la phase à venir
                </button>
              </div>
            )}
              </>
            )}
          </section>
        )}
        {/* Phases et critères (harmonisé avec module métier) */}
        {phasesAvecCriteres.map((phase, idx) => {
          // Lire dateJeune depuis state OU localStorage en fallback
          let dateJeuneLocal = dateJeune;
          if (!dateJeuneLocal && isMounted && typeof window !== 'undefined') {
            try {
              const prepDataStr = localStorage.getItem('preparationData');
              if (prepDataStr) {
                const prepData = JSON.parse(prepDataStr);
                dateJeuneLocal = prepData.startDate ? new Date(prepData.startDate) : null;
              }
            } catch(e) { console.warn('[Pastille période] Lecture preparationData échouée:', e); }
          }
          
          const hasValidDates = dateJeuneLocal && typeof phase.debut === 'number' && typeof phase.fin === 'number';
          const periodeText = hasValidDates ? formatPeriodePhase(dateJeuneLocal, phase.debut, phase.fin) : `J${phase.debut} à J${phase.fin}`;
          const phaseEstActive = typeof jCourant === 'number' && typeof phase.debut === 'number' && typeof phase.fin === 'number' && jCourant >= phase.debut && jCourant <= phase.fin;
          
          // Formater les dates pour affichage compact (ex: "Du 09/12 au 21/12/2025")
          let datesCompactes = '';
          if (hasValidDates) {
            const dateDebut = new Date(dateJeuneLocal);
            dateDebut.setDate(dateDebut.getDate() + phase.debut);
            const dateFin = new Date(dateJeuneLocal);
            dateFin.setDate(dateFin.getDate() + phase.fin);
            
            const jourDebut = String(dateDebut.getDate()).padStart(2, '0');
            const moisDebut = String(dateDebut.getMonth() + 1).padStart(2, '0');
            const jourFin = String(dateFin.getDate()).padStart(2, '0');
            const moisFin = String(dateFin.getMonth() + 1).padStart(2, '0');
            const annee = dateFin.getFullYear();
            
            datesCompactes = `Du ${jourDebut}/${moisDebut} au ${jourFin}/${moisFin}/${annee}`;
          }

          const criteresPhase = (phase.criteres || []).map(criterePhase => {
            const critereCourant = criteresParId[criterePhase.id] || {};
            return {
              ...criterePhase,
              valide: estCritereValide(critereCourant),
              dateValidation: critereCourant.dateValidation || null,
              typeValidation: critereCourant.typeValidation || null
            };
          });

          const nbValidesPhase = criteresPhase.filter(c => c.valide).length;
          const resumePhase = `${nbValidesPhase}/${criteresPhase.length} validé${nbValidesPhase > 1 ? 's' : ''}`;

          let etatPhase = 'À venir';
          let couleurEtat = '#64748B';
          let fondEtat = '#F1F5F9';
          if (typeof jCourant === 'number') {
            if (jCourant > phase.fin) {
              etatPhase = 'Passée';
              couleurEtat = '#7C2D12';
              fondEtat = '#FFEDD5';
            } else if (jCourant >= phase.debut && jCourant <= phase.fin) {
              etatPhase = 'Active';
              couleurEtat = '#065F46';
              fondEtat = '#D1FAE5';
            }
          }

          const isOpen = Boolean(phasesOuvertes[idx]);
          
          return (
          <div key={phase.id || phase.nom} style={{
            marginBottom: 24,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 8px 0 rgba(79,143,255,0.07)',
            border: '1px solid #E3EAF2',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => togglePhase(idx)}
              style={{
                width: '100%',
                textAlign: 'left',
                border: 'none',
                background: '#F8FAFC',
                padding: '14px 16px',
                cursor: 'pointer',
                borderBottom: isOpen ? '1px solid #E3EAF2' : 'none'
              }}
              aria-expanded={isOpen}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ color: '#1D4ED8', fontWeight: 800, fontSize: 16 }}>
                  {datesCompactes ? `${phase.nom} • ${datesCompactes}` : phase.nom}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    background: fondEtat,
                    color: couleurEtat,
                    borderRadius: 999,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 800
                  }}>
                    {etatPhase}
                  </span>
                  <span style={{
                    background: '#EEF6FF',
                    color: '#2563EB',
                    border: '1px solid #BFDBFE',
                    borderRadius: 999,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 800
                  }}>
                    {resumePhase}
                  </span>
                </div>
              </div>
              <div style={{ color: '#64748B', fontSize: 13, marginTop: 6 }}>
                {phase.objectif || phase.explication}
              </div>
              <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>
                {isOpen ? 'Masquer le détail de la phase' : 'Afficher le détail de la phase'}
              </div>
            </button>

            {isOpen && (
              <>
                <PhaseCard
                  phase={{
                    nom: datesCompactes ? `${phase.nom}  •  ${datesCompactes}` : phase.nom,
                    explication: phase.objectif || phase.explication,
                    periode: `${phase.debut !== undefined && phase.fin !== undefined ? `J${phase.debut} à J${phase.fin}` : ''}`,
                    resume: resumePhase
                  }}
                  criteres={criteresPhase}
                  onValider={preparationActive ? validerCritere : undefined}
                  jCourant={jCourant}
                />
                {/* Bouton "Période & critères" en bas de la carte */}
                <div style={{padding:'8px 16px',background:'#FAFBFC',borderTop:'1px solid #E3EAF2'}}>
                  <details style={{marginLeft:'auto',width:'100%'}}>
                    <summary style={{cursor:'pointer',background:'#4F8FFF',color:'#fff',border:'none',borderRadius:8,padding:'8px 12px',fontWeight:700,fontSize:13,textAlign:'center'}}>Critères détaillés</summary>
                    <div style={{marginTop:10,padding:10,background:'#f9fafb',borderRadius:8}}>
                      {(phase.criteres || []).map((c, i) => {
                        const id = getCritereIdFromLabel(c?.label);
                        const s = criteres?.[id] || {};
                        const etat = s.validé ? '✅ Validé' : '⏳ En cours';
                        const quand = s.validé && s.dateValidation ? ` • Validé ${formatDateHeureFR(s.dateValidation)} (${s.typeValidation||'auto'})` : '';
                        return (
                          <div key={c?.label||i} style={{display:'flex',justifyContent:'space-between',fontSize:14,margin:'6px 0',padding:'6px 8px',background:'#fff',borderRadius:6}}>
                            <span>{c?.label || `Critère ${id}`}</span>
                            <span style={{fontWeight:600}}>{etat}{quand}</span>
                          </div>
                        );
                      })}
                      {hasValidDates && (
                        <div style={{marginTop:12,display:'flex',gap:8}}>
                          <a href={`/suivi?from=${formatISODate(addDays(dateJeuneLocal, phase.debut))}&to=${formatISODate(addDays(dateJeuneLocal, phase.fin))}`} style={{background:'#10B981',color:'#fff',textDecoration:'none',padding:'8px 12px',borderRadius:8,fontSize:13,fontWeight:700}}>Voir mes repas (semaine)</a>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              </>
            )}
          </div>
          );
        })}
        {/* Message personnel */}
        <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px 0 rgba(79,143,255,0.07)', border: '1px solid #E3EAF2', padding: '18px 22px', margin: '32px 0', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          <h3 style={{ color: '#4F8FFF', fontWeight: 700, fontSize: '1.13rem', marginBottom: 8 }}>📝 Mon message à moi-même pour le jour du jeûne</h3>
          <textarea
            value={messagePerso}
            onChange={handleMessageChange}
            placeholder="Écris-toi un message de motivation pour le jour J..."
            style={{ width: '100%', minHeight: 60, borderRadius: 8, border: '1.5px solid #E3EAF2', padding: 10, fontSize: '1.05em', fontFamily: 'Inter, Roboto, Arial, sans-serif', marginBottom: 6 }}
          />
          <div style={{ color: '#6B778C', fontSize: '0.98em' }}>Ce message te sera rappelé le jour J pour renforcer ta motivation.</div>
        </section>
        {/* Bloc de démarrage, réinitialisation ou bilan de la préparation */}
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          {!preparationActive ? (
            <>
              <button
                onClick={() => setIsModalOpen(true)}
                aria-label="Démarrer mon suivi de préparation"
                style={{
                  background: 'linear-gradient(90deg, #4F8FFF 0%, #43D9A3 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '14px 36px',
                  fontWeight: 800,
                  fontSize: 18,
                  cursor: 'pointer',
                  marginBottom: 8,
                  boxShadow: '0 2px 8px 0 rgba(79,143,255,0.10)',
                  fontFamily: 'Inter, Roboto, Arial, sans-serif',
                  letterSpacing: 0.5
                }}
                autoFocus
                type="button"
              >
                Démarrer mon suivi de préparation
              </button>
              <StartPreparationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleStartPreparationModal}
                userId={userId}
              />
              {authError && (
                <div style={{color:'#FF6B6B',fontWeight:700,marginTop:12}}>{authError}</div>
              )}
              <div aria-live="polite" style={{ minHeight: 24, marginTop: 8 }}>
                {/* Zone de feedback dynamique pour lecteurs d’écran */}
              </div>
            </>
          ) : (
            <>
              {/* Bilan dynamique de la préparation — affiché à partir de J-0 */}
              {/* Nettoyage demandé: panneau auto-détection 7j et pastilles retirés */}
              {jCourant !== null && jCourant >= 0 ? (
              <div style={{background:'#f8fafc',border:'2px solid #38bdf8',borderRadius:12,padding:'24px 18px',maxWidth:520,margin:'0 auto 24px auto',boxShadow:'0 2px 8px 0 rgba(56,189,248,0.07)'}}>
                <h2 style={{color:'#0ea5e9',fontWeight:800,marginBottom:12}}>🎉 Bilan de ta préparation au jeûne</h2>
                {dateActivationPrepa && bilanComparatif.ligneComparaison && (
                  <div style={{marginBottom:16,background:'#fff',border:'1px solid #dbeafe',borderRadius:10,padding:'12px 14px'}}>
                    <b style={{color:'#2563eb'}}>🔎 Comparaison avant prépa / fin de prépa</b>
                    <div style={{marginTop:8,color:'#334155',fontSize:14,lineHeight:1.45}}>
                      <div><b>Avant :</b> {bilanComparatif.ligneComparaison.libelleAvant || 'Aucun repère analysable sur la baseline.'}</div>
                      <div><b>Fin de prépa :</b> {bilanComparatif.ligneComparaison.libelleApres || 'Aucune donnée analysable sur la période finale.'}</div>
                    </div>
                  </div>
                )}
                <div style={{marginBottom:14}}>
                  <b style={{color:'#22c55e'}}>✅ Point fort</b>
                  <div style={{textAlign:'left',marginTop:8,color:'#16a34a',fontWeight:600,lineHeight:1.45}}>
                    {bilanComparatif.ligneComparaison
                      ? `${bilanComparatif.ligneComparaison.label} : progression de ${bilanComparatif.ligneComparaison.delta > 0 ? '+' : ''}${bilanComparatif.ligneComparaison.delta} point(s) entre le début et la fin de la préparation.`
                      : (criteresValidesBilan.length > 0
                        ? `${criteresValidesBilan[0].label} est bien installé.`
                        : 'Aucun point fort net détecté sur cette période.')}
                  </div>
                </div>
                <div style={{marginBottom:14}}>
                  <b style={{color:'#f59e42'}}>⚠️ Axes d’amélioration</b>
                  <ul style={{textAlign:'left',margin:'8px 0 0 0',paddingLeft:22}}>
                    {(bilanComparatif.axes.length > 0 ? bilanComparatif.axes : criteresNonValidesBilan.slice(0, 2)).slice(0, 2).map(c=>(
                      <li key={c.id} style={{color:'#f59e42',fontWeight:600}}>
                        {c.label.includes('féculent') && 'Pas de féculents le soir.'}
                        {c.label.includes('hydratation') && 'Hydratation encore irrégulière.'}
                        {c.label.includes('sucreries') && 'Réduire les sucreries.'}
                        {c.label.includes('19h') && 'Finir le dîner avant 19h.'}
                        {c.label.includes('45') && 'Stabiliser la durée des repas sous 45 minutes.'}
                        {c.label.includes('jeûne plein') && 'Consolider les jours de jeûne plein.'}
                        {!c.label.includes('féculent') && !c.label.includes('hydratation') && !c.label.includes('sucreries') && !c.label.includes('19h') && !c.label.includes('45') && !c.label.includes('jeûne plein') && c.label}
                      </li>
                    ))}
                    {(bilanComparatif.axes.length === 0 && criteresNonValidesBilan.length === 0) && (
                      <li style={{color:'#64748b'}}>Aucun axe majeur détecté.</li>
                    )}
                  </ul>
                </div>
                <div style={{marginBottom:18}}>
                  <b style={{color:'#0ea5e9'}}>🎯 Priorité</b>
                  <div style={{textAlign:'left',marginTop:8,color:'#0ea5e9',fontWeight:600,lineHeight:1.45}}>
                    {bilanComparatif.priorite
                      ? (bilanComparatif.priorite.label.includes('19h')
                        ? 'Finir le dîner avant 19h et boire régulièrement chaque jour.'
                        : bilanComparatif.priorite.label.includes('hydratation')
                          ? 'Boire régulièrement chaque jour pour stabiliser l’hydratation.'
                          : bilanComparatif.priorite.label.includes('45')
                            ? 'Garder des repas simples et courts pour rester sous 45 minutes.'
                            : bilanComparatif.priorite.label)
                      : 'Conserver la routine la plus stable possible.'}
                  </div>
                </div>
                <div style={{margin:'18px 0 0 0',fontWeight:600,color:'#0ea5e9',fontSize:'1.08em'}}>{bilanPhraseFinale}</div>
                <div style={{margin:'8px 0 0 0',color:'#64748b',fontSize:'0.98em'}}>Le bilan compare ton point de départ à la fin de la préparation pour t’aider à passer au jeûne avec une lecture simple et honnête.</div>
                <button
                  style={{marginTop:'18px',background:'linear-gradient(90deg,#38bdf8 60%,#0ea5e9 100%)',color:'#fff',fontWeight:700,padding:'12px 32px',border:'none',borderRadius:8,fontSize:'1.1em',cursor:loadingJeune ? 'not-allowed' : 'pointer', opacity:loadingJeune ? 0.7 : 1}}
                  disabled={loadingJeune}
                  onClick={async () => {
                    setLoadingJeune(true);
                    setFeedbackMessage('⏳ Enregistrement du bilan et démarrage du jeûne...');
                    try {
                      // Préparation des données bilan (sans userId si non connecté)
                      const bilan = {
                        user_id: userId || null,
                        date_fin_preparation: new Date().toISOString(),
                        criteres_valides: criteresValidesBilan.map(c=>c.label),
                        criteres_non_valides: criteresNonValidesBilan.map(c=>c.label),
                        message_perso: messagePerso,
                        axes_amelioration: criteresNonValidesBilan.map(c=>c.label),
                        conseils: criteresNonValidesBilan.map(c=>{
                          if (c.label.includes('féculent')) return "Essaie d’anticiper tes repas pour éviter les féculents le soir.";
                          if (c.label.includes('jeûne plein')) return "Planifie un week-end pour tester le jeûne plein la prochaine fois.";
                          if (c.label.includes('sucreries')) return "Remplace les desserts sucrés par des fruits ou yaourts nature.";
                          if (c.label.includes('hydratation')) return "Continue à bien t’hydrater : c’est déjà acquis !";
                          return "Pense à valider ce critère la prochaine fois pour progresser !";
                        })
                      };
                      // --- Archivage automatique dans l'historique local ---
                      try {
                        const { ajouterPreparationHistorique, savePreparationJeuneSupabase } = await import('../lib/preparationsJeune');
                        // Construction de la préparation archivée (historique)
                        const preparationArchivee = {
                          id: preparationData?.id || undefined,
                          userId: userId || null,
                          parcoursId: preparationData?.parcoursId
                            || (typeof window !== 'undefined'
                              ? localStorage.getItem('parcoursJeuneActifId')
                              : null),
                          jeuneId: preparationData?.parcoursId
                            || (typeof window !== 'undefined'
                              ? localStorage.getItem('parcoursJeuneActifId')
                              : null),
                          dateDebut: dateJeune,
                          dateFin: new Date().toISOString(),
                          tauxReussite: criteresValidesBilan.length / criteresMetier.length * 100,
                          nbCriteresValides: criteresValidesBilan.length,
                          nbCriteresTotal: criteresMetier.length,
                          criteres: criteresBilan,
                          messagePerso,
                          axesAmelioration: criteresNonValidesBilan.map(c=>c.label),
                          conseils: criteresNonValidesBilan.map(c=>c.conseil),
                          notesPerso: '',
                          createdAt: new Date().toISOString(),
                        };
                        // Archivage local systématique
                        ajouterPreparationHistorique(preparationArchivee);
                        // Synchronisation cloud uniquement à la fin (si connecté)
                        if (userId) {
                          const res = await savePreparationJeuneSupabase(userId, preparationArchivee);
                          if (!res) throw new Error('Erreur lors de la sauvegarde Supabase de la préparation.');
                        }
                      } catch (err) {
                        console.warn('Erreur lors de l’archivage de la préparation :', err);
                        setFeedbackMessage('❌ Erreur lors de l’archivage de la préparation : ' + err.message);
                      }
                      // Démarrage du jeûne sur le même parcours central.
                      try {
                        const parcoursId = preparationData?.parcoursId
                          || preparationArchivee.parcoursId
                          || (typeof window !== 'undefined'
                            ? localStorage.getItem('parcoursJeuneActifId')
                            : null);

                        if (userId && !parcoursId) {
                          throw new Error(
                            'Aucun parcours central associé à cette préparation. Relance la préparation avant de démarrer le jeûne.'
                          );
                        }

                        const dateDebutJeune = new Date().toISOString().slice(0, 10);

                        if (userId && parcoursId) {
                          await demarrerPhaseJeune(parcoursId, userId, {
                            date_debut_jeune: dateDebutJeune,
                            date_fin_preparation: dateDebutJeune,
                            duree_jours: Number(
                              preparationData?.duration
                                || localStorage.getItem('dureeJeune')
                            ) || null,
                            message_perso: messagePerso
                          });
                        }

                        const preparationLiee = {
                          ...preparationArchivee,
                          parcoursId: parcoursId || null,
                          jeuneId: parcoursId || null
                        };

                        if (userId && parcoursId) {
                          await savePreparationJeuneSupabase(userId, preparationLiee);
                        }

                        if (typeof window !== 'undefined') {
                          localStorage.setItem('phaseJeuneCommencee', 'true');
                          localStorage.setItem('dateDebutJeune', new Date().toISOString());
                          localStorage.setItem('bilanPreparationJeune', JSON.stringify(preparationLiee));
                          if (parcoursId) {
                            localStorage.setItem('parcoursJeuneActifId', parcoursId);
                          }
                        }

                        setFeedbackMessage('✅ Bilan enregistré et jeûne démarré ! Redirection...');
                      } catch (err) {
                        setFeedbackMessage('❌ ' + err.message);
                        return;
                      }
                      setTimeout(() => {
                        window.location.href = '/jeune';
                      }, 1200);
                    } catch (err) {
                      setFeedbackMessage('❌ ' + err.message);
                    } finally {
                      setLoadingJeune(false);
                    }
                  }}
                >
                  {loadingJeune ? 'Démarrage...' : 'Démarrer mon jeûne'}
                </button>
              </div>
              ) : (
                <div style={{textAlign:'center',marginTop:32}}>
                  <div style={{
                    background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius:'16px',
                    padding:'24px',
                    maxWidth:520,
                    margin:'0 auto',
                    color:'#fff',
                    boxShadow:'0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}>
                    <div style={{fontSize:'3rem',marginBottom:12}}>⏳</div>
                    <div style={{fontSize:'1.3rem',fontWeight:700,marginBottom:8}}>
                      Préparation en cours
                    </div>
                    <div style={{fontSize:'1.05rem',opacity:0.95,marginBottom:12}}>
                      Continue à valider tes critères !
                    </div>
                    <div style={{
                      background:'rgba(255,255,255,0.25)',
                      borderRadius:'12px',
                      padding:'16px',
                      backdropFilter:'blur(10px)'
                    }}>
                      <div style={{fontSize:'2.5rem',fontWeight:800,lineHeight:1}}>
                        J{jCourant}
                      </div>
                      <div style={{fontSize:'0.95rem',opacity:0.9,marginTop:6}}>
                        Le bilan sera disponible le jour de ton jeûne
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Boutons toujours accessibles, en dehors de tout conditionnel */}
          <button
            onClick={async () => {
                      setFeedbackMessage('⏳ Archivage de la préparation en cours...');
                      try {
                        const { ajouterPreparationHistorique, savePreparationJeuneSupabase } = await import('../lib/preparationsJeune');
                        // Construction du bilan complet
                    const preparationArchivee = {
                      userId: userId || null,
                      dateDebut: dateJeune,
                      dateFin: new Date().toISOString(),
                      tauxReussite: criteresValidesBilan.length / criteresMetier.length * 100,
                      nbCriteresValides: criteresValidesBilan.length,
                      nbCriteresTotal: criteresMetier.length,
                      criteres: criteresBilan,
                      messagePerso,
                      axesAmelioration: criteresNonValidesBilan.map(c=>c.label),
                      conseils: criteresNonValidesBilan.map(c=>c.conseil),
                      notesPerso: '',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    // Archivage local systématique
                    ajouterPreparationHistorique(preparationArchivee);
                    // Synchronisation cloud (si connecté)
                    if (userId) {
                      const res = await savePreparationJeuneSupabase(userId, preparationArchivee);
                      if (!res) throw new Error('Erreur lors de la sauvegarde Supabase de la préparation.');
                    }
                    // Réinitialisation du workflow
                    setPreparationData(null);
                    setPreparationActive(false);
                    setCriteres([]);
                    setProgression(0);
                    setMessagePerso("");
                    setSyntheseVisible(false);
                    setDateJeune(null);
                    setDureeJeune(null);
                    setJCourant(null);
                    setFeedbackMessage('✅ Préparation archivée avec succès. Tu peux recommencer un nouveau cycle !');
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('preparationData');
                      localStorage.removeItem('preparationActive');
                      localStorage.removeItem('criteresPreparation');
                      localStorage.removeItem('dateJeune');
                      localStorage.removeItem('dureeJeune');
                      localStorage.removeItem('messagePersoPreparation');
                      localStorage.setItem('bilanPreparationJeune', JSON.stringify(preparationArchivee));
                    }
                  } catch (err) {
                    setFeedbackMessage('❌ Erreur lors de l’archivage : ' + err.message);
                  }
                }}
                style={{ marginTop: '14px', backgroundColor: '#43D9A3', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: 16, fontFamily: 'Inter, Roboto, Arial, sans-serif' }}
              >
                Finaliser ma préparation jeune
              </button>
                  <button onClick={handleResetPreparation} style={{ marginTop: '14px', backgroundColor: '#FF6B6B', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: 16, fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
                    Réinitialiser ma préparation
                  </button>
        </div>
      </div>
    </div>
  );
}
