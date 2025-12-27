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

  // === PHASES MÉTIER PARTAGÉES ===
  import {
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
import { getCriteresPreparation, isPeriodeActive, validerCriterePreparation, calculerJourRelatif, getFenetreValidation } from "../lib/validerCriterePreparation";
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
      const { data, error } = await supabase.auth.getUser();
      if (!ignore) {
        if (error || !data?.user) {
          setUserId(null);
          setAuthError("Vous devez être connecté pour démarrer la préparation et voir l'analyse des repas.");
        } else {
          setUserId(data.user.id);
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
    setPhasesOuvertes(prev => prev.map((open, i) => i === idx ? !open : open));
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preparationData, setPreparationData] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const criteresMetier = [
    { id: 1, label: "Respect strict des quantités à chaque repas", jalon: 30, description: "Réapprendre à ton corps ce qu'est une vraie portion", titre: "Respect strict des quantités", conseil: "Réapprendre à ton corps ce qu'est une vraie portion" },
    { id: 2, label: "Supprimer les féculents le soir (lun-dim)", jalon: 17, description: "Alléger la digestion le soir pour préparer le jeûne", titre: "Supprimer les féculents le soir", conseil: "Alléger la digestion le soir pour préparer le jeûne" },
    { id: 3, label: "Action immédiate après le repas (marche/ménage)", jalon: 17, description: "Activer la digestion et éviter le stockage", titre: "Action immédiate après le repas", conseil: "Activer la digestion et éviter le stockage (marche/ménage)" },
    { id: 4, label: "Éliminer tous produits transformés", jalon: 14, description: "Limiter les toxines et l'inflammation", titre: "Éliminer tous produits transformés", conseil: "Limiter les toxines et l'inflammation" },
    { id: 5, label: "Éliminer toutes sucreries", jalon: 14, description: "Stabiliser la glycémie et l'énergie", titre: "Éliminer toutes sucreries", conseil: "Stabiliser la glycémie et l'énergie" },
    { id: 6, label: "2 jours de jeûne plein (préparation métabolique)", jalon: 12, description: "Tester la tolérance au jeûne", titre: "2 jours de jeûne plein", conseil: "Tester la tolérance au jeûne (préparation métabolique)" },
    { id: 7, label: "2 litres d'eau par jour (suivi automatique)", jalon: 7, description: "Hydratation optimale avant le jeûne", titre: "2 litres d'eau par jour", conseil: "Hydratation optimale avant le jeûne (suivi automatique)" },
    { id: 8, label: "Pas de repas après 19h00", jalon: 7, description: "Préparer le système digestif au jeûne", titre: "Pas de repas après 19h00", conseil: "Préparer le système digestif au jeûne" },
    { id: 9, label: "Plage alimentaire limitée à 45 minutes par repas", jalon: 7, description: "Limiter le grignotage et améliorer la digestion", titre: "Plage alimentaire 45 min max", conseil: "Limiter le grignotage et améliorer la digestion" },
  ];

  // Organisation des critères par phase (selon les jalons)
  const phasesAvecCriteres = [
    {
      id: 'phase1-fondation',
      nom: 'Phase 1 : Allègement',
      debut: -30,
      fin: -18,
      objectif: 'Rééquilibrer l\'alimentation et limiter les excès',
      criteres: criteresMetier.filter(c => c.jalon === 30)
    },
    {
      id: 'phase2-intensification',
      nom: 'Phase 2 : Végétalisation',
      debut: -17,
      fin: -8,
      objectif: 'Alléger la digestion et supprimer les toxines',
      criteres: criteresMetier.filter(c => [17, 14, 12].includes(c.jalon))
    },
    {
      id: 'phase3-prejeune',
      nom: 'Phase 3 : Pré-jeûne',
      debut: -7,
      fin: 0,
      objectif: 'Préparer le corps au jeûne immédiat',
      criteres: criteresMetier.filter(c => c.jalon === 7)
    }
  ];
  const [criteres, setCriteres] = useState([]); // Liste dynamique avec statut validé
  const [progression, setProgression] = useState(0); // Nombre de critères validés
  const [messagePerso, setMessagePerso] = useState("");
  const [syntheseVisible, setSyntheseVisible] = useState(false);

  // === INITIALISATION (ordre strict) ===
  useEffect(() => {
    // Initialisation de l’état preparationActive depuis localStorage
    if (typeof window !== 'undefined') {
      const active = window.localStorage.getItem('preparationActive');
      setPreparationActive(active === 'true');
    }
    // Lecture date du jeûne et durée depuis preparationData (source unique de vérité)
    if (typeof window !== 'undefined') {
      const prepData = window.localStorage.getItem('preparationData');
      if (prepData) {
        try {
          const parsed = JSON.parse(prepData);
          if (parsed.startDate) {
            const dateJeuneObj = new Date(parsed.startDate);
            setDateJeune(dateJeuneObj);
            setDureeJeune(parsed.duration || 'X');
            setAujourdhui(new Date());
            // Calcul du J-XX courant
            const diff = calculerJourRelatif(parsed.startDate, new Date());
            setJCourant(diff);
          }
        } catch (e) {
          console.error('Erreur parsing preparationData:', e);
          setFeedbackMessage("⛔ Erreur de lecture des données de préparation.");
          setPreparationActive(false);
        }
      } else {
        setFeedbackMessage("⛔ Veuillez renseigner la date de début de jeûne pour activer le suivi et la progression.");
        setPreparationActive(false);
      }
    }
    // Initialisation des critères (localStorage ou valeurs métier)
    let criteresInit = criteresMetier.map(c => ({ ...c, valide: false, dateValidation: null }));
    if (typeof window !== 'undefined') {
      const saved = getCriteresPreparation();
      if (saved && Object.keys(saved).length === criteresMetier.length) {
        criteresInit = criteresMetier.map(c => {
          const crit = saved[c.id];
          return crit ? { ...c, valide: !!crit.validé, dateValidation: crit.dateValidation } : { ...c, valide: false, dateValidation: null };
        });
      }
      const msg = window.localStorage.getItem('messagePersoPreparation');
      if (msg) setMessagePerso(msg);
    }
    setCriteres(criteresInit);
  }, []);

  // Auto-détection des critères via repas_reels (7 derniers jours)
  useEffect(() => {
    async function analyserRepas7Jours() {
      try {
        if (!preparationActive) return;
        // Charger les repas récents
        const { data: repasData, error } = await supabase
          .from('repas_reels')
          .select('*')
          .order('date', { ascending: false })
          .limit(200);
        if (error) return;
        const today = new Date();
        const repas7j = (repasData || []).filter(r => {
          const d = new Date(r.date);
          const diff = Math.floor((today - d) / (1000*60*60*24));
          return diff >= 0 && diff < 7;
        });
        // Générer la fenêtre J-6 -> J-0 pour affichage
        const jours = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
          return { label: `J-${6 - i}`, date: d.toISOString().slice(0,10), affichage: dateStr };
        });
        setJoursFenetre7j(jours);

        const ids = [1, 2, 7, 8, 9];
        const statuts = {};
        ids.forEach(id => {
          statuts[id] = getStatutCritereAuto(id, repas7j);
          if (statuts[id].validé) {
            validerCritereAuto(id);
          }
        });
        setStatutsValidationAutoPrep(statuts);
      } catch(e) {
        console.error('[Préparation] Auto-validation repas 7j:', e);
      }
    }
    analyserRepas7Jours();
  }, [preparationActive, dateJeune]);

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
    const nbValid = criteres.filter(c => c.valide).length;
    setProgression(nbValid);
    // Affichage synthèse si tous les critères sont validés
    setSyntheseVisible(nbValid === criteresMetier.length);
    // Sauvegarde dans localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('criteresPreparation', JSON.stringify(criteres));
    }
  }, [criteres]);

  // Handler de validation d’un critère (manuel, à améliorer avec auto-validation plus tard)
  function validerCritere(id) {
    const critere = criteresMetier.find(c => c.id === id);
    if (!critere) {
      setFeedbackMessage("❌ Critère introuvable.");
      return;
    }
    // Vérification de la période active
    if (!isPeriodeActive(critere.jalon, jCourant)) {
      setFeedbackMessage("⛔ Validation impossible : la période pour ce critère n'est pas encore active ou est verrouillée. Veuillez respecter le calendrier de préparation.");
      return;
    }
    const dateValidation = new Date().toISOString();
    validerCriterePreparation(id, dateValidation);
    setCriteres(prev => prev.map(c => c.id === id ? { ...c, valide: true, dateValidation } : c));
    setFeedbackMessage("✅ Critère validé avec succès.");
  }

  // Handler de modification du message personnel
  function handleMessageChange(e) {
    setMessagePerso(e.target.value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('messagePersoPreparation', e.target.value);
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
  function handleStartPreparationModal(data) {
    // Sauvegarde des données de préparation
    setPreparationData(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preparationData', JSON.stringify(data));
      localStorage.setItem('preparationActive', 'true');
      localStorage.setItem('dateJeune', data.startDate);
      localStorage.setItem('dureeJeune', data.duration);
    }
    // Activation de la préparation
    setPreparationActive(true);
    // Initialisation des critères métier
    const criteresInit = criteresMetier.map(c => ({ ...c, valide: false, dateValidation: null }));
    setCriteres(criteresInit);
    if (typeof window !== 'undefined') {
      localStorage.setItem('criteresPreparation', JSON.stringify(criteresInit));
    }
    setFeedbackMessage("✅ Préparation activée ! Suivi et critères disponibles.");
    // Feedback visuel (console)
    console.log('Préparation activée, critères initialisés, timeline affichée. Source : action utilisateur, validation modale.');
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

  return (
    <div style={{ background: '#F5F8FA', minHeight: '100vh', paddingBottom: 40 }}>
      <Navigation />
      <HeaderPreparation />
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
          
          return (
          <div key={phase.id || phase.nom} style={{
            marginBottom: 24,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 8px 0 rgba(79,143,255,0.07)',
            border: '1px solid #E3EAF2',
            overflow: 'hidden'
          }}>
            <PhaseCard
              phase={{
                nom: datesCompactes ? `${phase.nom}  •  ${datesCompactes}` : phase.nom,
                explication: phase.objectif || phase.explication,
                periode: `${phase.debut !== undefined && phase.fin !== undefined ? `J${phase.debut} à J${phase.fin}` : ''}`
              }}
              criteres={phase.criteres}
              onValider={preparationActive ? validerCritere : undefined}
              jCourant={jCourant}
            />
            {/* Bouton "Période & critères" en bas de la carte */}
            <div style={{padding:'8px 16px',background:'#FAFBFC',borderTop:'1px solid #E3EAF2'}}>
              <details style={{marginLeft:'auto',width:'100%'}}>
                <summary style={{cursor:'pointer',background:'#4F8FFF',color:'#fff',border:'none',borderRadius:8,padding:'8px 12px',fontWeight:700,fontSize:13,textAlign:'center'}}>Période & critères</summary>
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
                {/* Points forts */}
                <div style={{marginBottom:14}}>
                  <b style={{color:'#22c55e'}}>✅ Points forts</b>
                  <ul style={{textAlign:'left',margin:'8px 0 0 0',paddingLeft:22}}>
                    {criteres.filter(c=>c.valide).length > 0 ? criteres.filter(c=>c.valide).map(c=>(
                      <li key={c.id} style={{color:'#16a34a',fontWeight:600}}>[✔️] {c.label}</li>
                    )) : <li style={{color:'#64748b'}}>Aucun critère validé cette fois.</li>}
                  </ul>
                </div>
                {/* Axes d’amélioration */}
                <div style={{marginBottom:14}}>
                  <b style={{color:'#f59e42'}}>⚠️ Axes d’amélioration</b>
                  <ul style={{textAlign:'left',margin:'8px 0 0 0',paddingLeft:22}}>
                    {criteres.filter(c=>!c.valide).length > 0 ? criteres.filter(c=>!c.valide).map(c=>(
                      <li key={c.id} style={{color:'#f59e42',fontWeight:600}}>[❌] {c.label}</li>
                    )) : <li style={{color:'#64748b'}}>Tous les critères ont été validés, bravo !</li>}
                  </ul>
                </div>
                {/* Conseils personnalisés */}
                <div style={{marginBottom:18}}>
                  <b style={{color:'#0ea5e9'}}>💡 Conseils personnalisés</b>
                  <ul style={{textAlign:'left',margin:'8px 0 0 0',paddingLeft:22}}>
                    {criteres.filter(c=>!c.valide).length > 0 ? criteres.filter(c=>!c.valide).map(c=>(
                      <li key={c.id} style={{color:'#0ea5e9'}}>
                        {c.label.includes('féculent') && "Essaie d’anticiper tes repas pour éviter les féculents le soir."}
                        {c.label.includes('jeûne plein') && "Planifie un week-end pour tester le jeûne plein la prochaine fois."}
                        {c.label.includes('sucreries') && "Remplace les desserts sucrés par des fruits ou yaourts nature."}
                        {c.label.includes('hydratation') && "Continue à bien t’hydrater : c’est déjà acquis !"}
                        {!c.label.includes('féculent') && !c.label.includes('jeûne plein') && !c.label.includes('sucreries') && !c.label.includes('hydratation') && "Pense à valider ce critère la prochaine fois pour progresser !"}
                      </li>
                    )) : <li style={{color:'#0ea5e9'}}>Continue ainsi, tu es prêt(e) pour le jeûne !</li>}
                  </ul>
                </div>
                <div style={{margin:'18px 0 0 0',fontWeight:600,color:'#0ea5e9',fontSize:'1.08em'}}>🚀 Tu peux maintenant démarrer la phase de jeûne !</div>
                <div style={{margin:'8px 0 0 0',color:'#64748b',fontSize:'0.98em'}}>Même si tout n’est pas parfait, chaque préparation est un progrès. Tu pourras faire encore mieux la prochaine fois.</div>
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
                        criteres_valides: criteres.filter(c=>c.valide).map(c=>c.label),
                        criteres_non_valides: criteres.filter(c=>!c.valide).map(c=>c.label),
                        message_perso: messagePerso,
                        axes_amelioration: criteres.filter(c=>!c.valide).map(c=>c.label),
                        conseils: criteres.filter(c=>!c.valide).map(c=>{
                          if (c.label.includes('féculent')) return "Essaie d’anticiper tes repas pour éviter les féculents le soir.";
                          if (c.label.includes('jeûne plein')) return "Planifie un week-end pour tester le jeûne plein la prochaine fois.";
                          if (c.label.includes('sucreries')) return "Remplace les desserts sucrés par des fruits ou yaourts nature.";
                          if (c.label.includes('hydratation')) return "Continue à bien t’hydrater : c’est déjà acquis !";
                          return "Pense à valider ce critère la prochaine fois pour progresser !";
                        })
                      };
                      // Si connecté, insertion en base + localStorage
                      if (userId) {
                        const { error: prepError } = await supabase.from('preparations_jeune').insert([bilan]);
                        if (prepError) throw new Error('Erreur lors de l’enregistrement du bilan : ' + prepError.message);
                        const debutJeune = {
                          user_id: userId,
                          date_debut: new Date().toISOString(),
                          statut: 'en_cours'
                        };
                        const { error: jeuneError } = await supabase.from('jeune').insert([debutJeune]);
                        if (jeuneError) throw new Error('Erreur lors du démarrage du jeûne : ' + jeuneError.message);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('phaseJeuneCommencee', 'true');
                          localStorage.setItem('dateDebutJeune', new Date().toISOString());
                          localStorage.setItem('bilanPreparationJeune', JSON.stringify(bilan));
                        }
                        setFeedbackMessage('✅ Bilan enregistré et jeûne démarré ! Redirection...');
                      } else {
                        // Non connecté : fallback localStorage uniquement
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('phaseJeuneCommencee', 'true');
                          localStorage.setItem('dateDebutJeune', new Date().toISOString());
                          localStorage.setItem('bilanPreparationJeune', JSON.stringify(bilan));
                        }
                        setFeedbackMessage('⚠️ Bilan enregistré localement (non connecté). Tu pourras le synchroniser plus tard. Redirection...');
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
              <button onClick={handleResetPreparation} style={{ marginTop: '14px', backgroundColor: '#FF6B6B', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: 16, fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>
                Réinitialiser ma préparation
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
