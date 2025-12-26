import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';
import NotificationsPhase1 from '../components/NotificationsPhase1';
import NotificationsPhase2 from '../components/NotificationsPhase2';
import NotificationsPhase4 from '../components/NotificationsPhase4';
import RecettesPhase1Modal from '../components/RecettesPhase1Modal';
import RecettesPhase2Modal from '../components/RecettesPhase2Modal';
import RecettesPhase4Modal from '../components/RecettesPhase4Modal';

// Composant Aperçu Latéral des Phases
function PhasesApercu({ phases, jours, dateAuj, onVoirAliments }) {
  const [showAll, setShowAll] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Regrouper les jours par phase
  const phasesArray = Object.entries(phases).map(([key, phase], idx) => {
    const joursPhase = jours.filter(j => j.phase === idx + 1);
    const dateDebloc = joursPhase[0]?.date;
    let statut = 'à venir';
    let verrouille = true;
    if (dateAuj >= dateDebloc) {
      const dateFin = joursPhase[joursPhase.length - 1]?.date;
      if (dateAuj > dateFin) {
        statut = 'terminée';
        verrouille = false;
      } else {
        statut = 'en cours';
        verrouille = false;
      }
    }
    return {
      key,
      phaseNum: idx + 1,
      nom: phase.nom,
      debut: phase.debut,
      fin: phase.fin,
      objectif: phase.objectif,
      jours: joursPhase,
      dateDebloc,
      statut,
      verrouille
    };
  });

  // Afficher seulement la première phase (ou phases débloquées), puis bouton plus
  let phasesToShow = phasesArray;
  if (!showAll) {
    // Afficher la première phase et toutes les phases déjà accessibles
    const firstUnlockedIdx = phasesArray.findIndex(p => !p.verrouille);
    const maxIdx = Math.max(0, firstUnlockedIdx);
    phasesToShow = phasesArray.slice(0, maxIdx + 1);
  }

  return (
    <>
      {/* 🔘 Bouton toggle mobile */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 100,
          background: isMobileOpen ? 'linear-gradient(135deg, #e53935 0%, #c62828 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '0.6rem 1rem',
          fontWeight: 700,
          fontSize: '0.95rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(102,126,234,0.4)',
          display: 'none',
          transition: 'all 0.3s ease'
        }}
        className="mobile-toggle-btn"
      >
        {isMobileOpen ? '✕ Fermer' : '☰ Phases'}
      </button>

      <aside 
        className={isMobileOpen ? 'phases-sidebar mobile-open' : 'phases-sidebar'}
        style={{
          background: '#f8f8fc',
          borderRadius: 14,
          boxShadow: '0 2px 8px #0001',
          padding: '1.2rem 1.1rem',
          marginBottom: '2rem',
          marginTop: '1.5rem',
          maxWidth: 340,
          width: 340,
          fontSize: '1.01rem',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.1rem',
          position: 'fixed',
          left: '2rem',
          top: '2rem',
          maxHeight: 'calc(100vh - 4rem)',
          overflowY: 'auto',
          zIndex: 50
        }}
      >
      <div style={{fontWeight:700, color:'#1976d2', fontSize:'1.15rem', marginBottom:4}}>Phases de la reprise</div>
      {phasesToShow.map(phase => (
        <div key={phase.key} style={{
          background: phase.statut === 'en cours' ? '#e3f2fd' : '#fff',
          border: phase.statut === 'en cours' ? '2px solid #1976d2' : '1.5px solid #b3e5fc',
          borderRadius: 10,
          padding: '0.7rem 1rem',
          opacity: phase.verrouille ? 0.6 : 1,
          position: 'relative',
          marginBottom: 2
        }}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:2}}>
            <span style={{fontSize:'1.25em', fontWeight:700}}>{['💧','🥬','🥚','🍚','🍽️'][phase.phaseNum-1]}</span>
            <span style={{fontWeight:600}}>Phase {phase.phaseNum} : {phase.nom}</span>
            {phase.verrouille && <span title="Phase verrouillée" style={{marginLeft:6, color:'#c62828', fontSize:'1.2em'}}>🔒</span>}
          </div>
          <div style={{fontSize:'0.98rem', color:'#444', marginBottom:2}}>{phase.objectif}</div>
          <div style={{fontSize:'0.97rem', color:'#1976d2', marginBottom:2}}>J{phase.debut} à J{phase.fin} ({phase.jours.length} jours)</div>
          <div style={{fontSize:'0.95rem', color:'#888', marginBottom:2}}>Déblocage : {phase.dateDebloc}</div>
          <div style={{fontSize:'0.95rem', color: phase.statut==='en cours'?'#388e3c':'#888', fontWeight: phase.statut==='en cours'?600:400, marginBottom:2}}>
            Statut : {phase.statut}
          </div>
          <button
            onClick={() => {
              onVoirAliments(phase.phaseNum);
              setIsMobileOpen(false); // Fermer l'overlay sur mobile
            }}
            disabled={phase.verrouille}
            style={{
              background: phase.verrouille ? '#eee' : 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
              color: phase.verrouille ? '#aaa' : 'white',
              border: 'none',
              borderRadius: 7,
              padding: '0.4rem 1.1rem',
              fontWeight:600,
              fontSize:'0.98rem',
              cursor: phase.verrouille ? 'not-allowed' : 'pointer',
              marginTop: 4
            }}
          >
            Voir aliments
          </button>
        </div>
      ))}
      {!showAll && phasesToShow.length < phasesArray.length && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            marginTop: 10,
            background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 7,
            padding: '0.5rem 1.2rem',
            fontWeight:700,
            fontSize:'1rem',
            cursor: 'pointer',
            boxShadow:'0 1px 4px #0001'
          }}
        >
          + Voir toutes les phases
        </button>
      )}
      {showAll && phasesToShow.length === phasesArray.length && (
        <button
          onClick={() => setShowAll(false)}
          style={{
            marginTop: 10,
            background: 'linear-gradient(135deg, #185a9d 0%, #43cea2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 7,
            padding: '0.5rem 1.2rem',
            fontWeight:700,
            fontSize:'1rem',
            cursor: 'pointer',
            boxShadow:'0 1px 4px #0001'
          }}
        >
          − Réduire
        </button>
      )}
      </aside>
    </>
  );
}
import { useRouter } from 'next/router';

export default function RepriseAlimentaireApresJeune() {
  const router = useRouter();
  const [programme, setProgramme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jours, setJours] = useState([]);
  const [dateAuj, setDateAuj] = useState(null);
  const [listeCourses, setListeCourses] = useState([]);
  
  // 🆕 State pour la saisie du poids final
  const [poidsFinal, setPoidsFinal] = useState('');

  // 🆕 États pour fonctionnalités Phase 1
  const [modalRecettes, setModalRecettes] = useState({ isOpen: false, type: 'bouillon' });
  const [notificationsActives, setNotificationsActives] = useState(false);

  // 🆕 États pour fonctionnalités Phase 2
  const [modalRecettesPhase2, setModalRecettesPhase2] = useState({ isOpen: false, type: 'compote' });

  // 🆕 États pour fonctionnalités Phase 4
  const [modalRecettesPhase4, setModalRecettesPhase4] = useState({ isOpen: false, type: 'patatedouce' });

  // Permettre un mode test/forçage via ?test=1 dans l'URL
  const [forceSuivi, setForceSuivi] = useState(false);
  const [repriseMode, setRepriseMode] = useState('normal'); // 'test' ou 'normal'

  useEffect(() => {
    if (router && router.query && router.query.test === '1') {
      setForceSuivi(true);
    }
  }, [router.query]);

  // Détecter le mode de reprise (test ou normal)
  useEffect(() => {
    const modeActuel = localStorage.getItem('repriseMode') || 'normal';
    setRepriseMode(modeActuel);
  }, []);

  useEffect(() => {
    const chargerProgramme = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 🔑 LECTURE PRIORITAIRE DEPUIS LOCALSTORAGE (pas d'authentification requise)
        console.log('[DEBUG] Chargement du programme de reprise depuis localStorage...');
        const prog = localStorage.getItem('programmeRepriseValide');
        
        if (!prog) {
          setError("Aucun plan de reprise validé trouvé.\n\n➡️ Pour accéder à ton plan validé, valide-le d'abord dans l'étape précédente.\n\n↩️ Retour à la validation du plan");
          setLoading(false);
          return;
        }
        
        const parsed = JSON.parse(prog);
        console.debug('[DEBUG] Chargement depuis localStorage:', parsed);
        
        // 🆕 AUTO-POPULATION : Enrichir avec les données du jeûne si manquantes
        if (!parsed.duree_jeune_jours || !parsed.poids_fin_jeune || !parsed.date_fin_jeune) {
          console.log('[AUTO-POPULATION] Récupération des données depuis /jeune...');
          
          try {
            const dureeJeune = localStorage.getItem('dureeJeune');
            const poidsDepart = localStorage.getItem('poidsDepart');
            const dateDebutJeune = localStorage.getItem('dateDebutJeune');
            
            if (!parsed.duree_jeune_jours && dureeJeune) {
              parsed.duree_jeune_jours = JSON.parse(dureeJeune);
              console.log('[AUTO-POPULATION] Durée jeûne:', parsed.duree_jeune_jours);
            }
            
            if (!parsed.poids_fin_jeune && poidsDepart) {
              parsed.poids_fin_jeune = JSON.parse(poidsDepart);
              console.log('[AUTO-POPULATION] Poids fin jeûne:', parsed.poids_fin_jeune);
            }
            
            if (!parsed.date_fin_jeune && dateDebutJeune && dureeJeune) {
              const dateDebut = new Date(JSON.parse(dateDebutJeune));
              const duree = JSON.parse(dureeJeune);
              const dateFin = new Date(dateDebut.getTime() + (duree - 1) * 24 * 60 * 60 * 1000);
              parsed.date_fin_jeune = dateFin.toISOString().split('T')[0];
              console.log('[AUTO-POPULATION] Date fin jeûne:', parsed.date_fin_jeune);
            }
            
            // Sauvegarder le programme enrichi
            localStorage.setItem('programmeRepriseValide', JSON.stringify(parsed));
          } catch (err) {
            console.warn('[AUTO-POPULATION] Erreur lors de la récupération:', err);
          }
        }
        
        setProgramme(parsed);
        setJours(parsed.jours_detailles || []);
        setDateAuj(new Date().toISOString().split('T')[0]);
        
        // Générer liste de courses
        if (parsed.jours_detailles && parsed.jours_detailles.length > 0) {
          const premiersJours = parsed.jours_detailles.slice(0, 2);
          const alimentsUniques = {};
          premiersJours.forEach(jour => {
            if (jour.aliments_autorises) {
              jour.aliments_autorises.forEach(alim => {
                if (alim && alim.nom) {
                  const key = alim.nom.toLowerCase();
                  if (!alimentsUniques[key]) {
                    alimentsUniques[key] = { nom: alim.nom, portion: alim.portion };
                  }
                }
              });
            }
          });
          setListeCourses(Object.values(alimentsUniques));
        }
        setLoading(false);
      } catch (e) {
        console.error('[ERROR] Exception:', e);
        setError("Erreur lors du chargement du plan de reprise.\n\n" + e.message);
        setLoading(false);
      }
    };

    chargerProgramme();
  }, []);

  // Calcul du jour de reprise courant
  let jourReprise = null;
  if (programme && programme.date_debut_reprise) {
    const debut = new Date(programme.date_debut_reprise);
    const auj = new Date();
    const diff = Math.floor((auj - debut) / (1000 * 60 * 60 * 24));
    jourReprise = diff + 1;
  }

  // 🔔 Activation automatique des notifications en Phase 1
  useEffect(() => {
    if (programme && jours.length > 0 && jourReprise) {
      const jourActuel = jours.find(j => j.numero === jourReprise);
      if (jourActuel && jourActuel.phase === 1) {
        setNotificationsActives(true);
      } else {
        setNotificationsActives(false);
      }
    }
  }, [programme, jours, jourReprise]);

  // 🔥 MODE TEST : Forcer au minimum Jour 1 pour permettre le test
  if (forceSuivi && jourReprise < 1) {
    jourReprise = 1;
  }

  let joursAAfficher = [];
  let isPreview = false;
  let maxJourAccessible = 0;
  if (jours.length > 0) {
    if (forceSuivi) {
      joursAAfficher = jours;
      isPreview = false;
      maxJourAccessible = jours.length;
    } else if (jourReprise < 1) {
      joursAAfficher = jours.slice(0, 2);
      isPreview = true;
      maxJourAccessible = 2;
    } else {
      joursAAfficher = jours.slice(0, jourReprise);
      isPreview = false;
      maxJourAccessible = jourReprise;
    }
  }

  // Navigation jour par jour : état pour le jour sélectionné
  const [selectedJourIdx, setSelectedJourIdx] = useState(0);
  // Initialiser à dernier jour accessible à chaque changement de joursAAfficher
  useEffect(() => {
    if (joursAAfficher.length > 0) {
      setSelectedJourIdx(joursAAfficher.length - 1);
    }
  }, [joursAAfficher.length]);

  // Handler navigation
  const handlePrevJour = () => {
    setSelectedJourIdx(idx => Math.max(0, idx - 1));
  };
  const handleNextJour = () => {
    setSelectedJourIdx(idx => Math.min(joursAAfficher.length - 1, idx + 1));
  };

  // Calcul de la progression globale
  const totalJours = jours.length;
  const currentJour = jourReprise && jourReprise > 0 ? Math.min(jourReprise, totalJours) : 0;

  // Gestion modale aliments phase
  const [modalAliments, setModalAliments] = useState(null); // phaseNum ou null

  // 🆕 État pour la validation quotidienne
  const [validationEnCours, setValidationEnCours] = useState(false);
  const [messageValidation, setMessageValidation] = useState(null);

  // 🆕 Fonction de sauvegarde du poids final
  const handleSauvegarderPoidsFinal = () => {
    if (!poidsFinal || parseFloat(poidsFinal) < 30 || parseFloat(poidsFinal) > 200) {
      alert('⚠️ Entre un poids valide (entre 30 et 200 kg)');
      return;
    }

    const poidsValue = parseFloat(poidsFinal);
    
    // Mettre à jour le programme avec le poids final
    const progUpdated = { ...programme };
    if (!progUpdated.bilan_reprise) {
      progUpdated.bilan_reprise = {};
    }
    
    progUpdated.bilan_reprise.poids_fin_reprise = poidsValue;
    progUpdated.bilan_reprise.evolution_poids = (
      poidsValue - (progUpdated.bilan_reprise.poids_debut_reprise || progUpdated.poids_fin_jeune || progUpdated.poids_depart)
    ).toFixed(1);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('programmeRepriseValide', JSON.stringify(progUpdated));
    localStorage.setItem('bilanRepriseAlimentaire', JSON.stringify(progUpdated.bilan_reprise));
    
    // Mettre à jour le state pour rafraîchir l'affichage
    setProgramme(progUpdated);
    setPoidsFinal('');
    
    alert('✅ Poids final enregistré avec succès !');
  };

  // 🆕 Fonction de validation d'un jour
  const validerJour = async (jourData) => {
    if (!programme || !jourData) return;

    setValidationEnCours(true);
    setMessageValidation(null);

    try {
      // 1️⃣ Vérifier que c'est la bonne date
      const dateJour = new Date(jourData.date);
      const aujourdhui = new Date();
      aujourdhui.setHours(0, 0, 0, 0);
      dateJour.setHours(0, 0, 0, 0);

      if (dateJour > aujourdhui) {
        setMessageValidation({ 
          type: 'error', 
          text: `Ce jour n'est pas encore accessible. Reviens le ${new Date(jourData.date).toLocaleDateString('fr-FR')} 🗓️` 
        });
        setValidationEnCours(false);
        return;
      }

      // 2️⃣ Vérifier les repas conformes dans localStorage
      const cleRepas = repriseMode === 'test' ? 'test_reprises_repas_consommes' : 'reprises_repas_consommes';
      const repasStockes = JSON.parse(localStorage.getItem(cleRepas) || '[]');
      const repasJour = repasStockes.filter(r => 
        r.jour_reprise === jourData.jour_numero &&
        r.phase_reprise === jourData.phase &&
        r.date === jourData.date
      );

      // Vérifier qu'il y a au moins 2 repas enregistrés
      if (repasJour.length < 2) {
        setMessageValidation({ 
          type: 'error', 
          text: `⚠️ Tu dois enregistrer au moins 2 repas conformes avant de valider ce jour. Actuellement : ${repasJour.length}/2 repas.` 
        });
        setValidationEnCours(false);
        return;
      }

      // 3️⃣ Marquer le jour comme validé dans localStorage
      const joursValides = JSON.parse(localStorage.getItem('joursReprisesValides') || '[]');
      const jourExistant = joursValides.find(j => j.jour_numero === jourData.jour_numero);
      
      if (!jourExistant) {
        joursValides.push({
          jour_numero: jourData.jour_numero,
          phase: jourData.phase,
          date: jourData.date,
          valide: true,
          valide_le: new Date().toISOString(),
          nb_repas: repasJour.length
        });
        localStorage.setItem('joursReprisesValides', JSON.stringify(joursValides));
      }

      // 4️⃣ Vérifier si c'est le dernier jour de la reprise
      if (jourData.jour_numero === programme.duree_reprise_jours) {
        // 🆕 CALCULER LE BILAN COMPLET DE LA REPRISE
        const cleRepas = repriseMode === 'test' ? 'test_reprises_repas_consommes' : 'reprises_repas_consommes';
        const tousRepasReprise = JSON.parse(localStorage.getItem(cleRepas) || '[]');
        const joursValidesReprise = JSON.parse(localStorage.getItem('joursReprisesValides') || '[]');
        
        // Statistiques de conformité
        const totalRepas = tousRepasReprise.length;
        const repasConformes = tousRepasReprise.filter(r => r.conforme === true).length;
        const tauxConformite = totalRepas > 0 ? Math.round((repasConformes / totalRepas) * 100) : 0;
        const nbJoursValides = joursValidesReprise.length;
        const tauxValidation = Math.round((nbJoursValides / programme.duree_reprise_jours) * 100);
        
        // Poids de fin (à demander ou récupérer)
        const poidsActuel = localStorage.getItem('poidsActuel') 
          ? parseFloat(localStorage.getItem('poidsActuel')) 
          : programme.poids_fin_jeune || null;
        
        // 🎯 BILAN COMPLET POUR CRISTALLISATION
        const bilanReprise = {
          // Données programme
          duree_jeune_jours: programme.duree_jeune_jours,
          duree_reprise_jours: programme.duree_reprise_jours,
          date_debut_reprise: programme.date_debut_reprise,
          date_fin_reprise: new Date().toISOString().split('T')[0],
          
          // Poids
          poids_debut_reprise: programme.poids_fin_jeune,
          poids_fin_reprise: poidsActuel,
          evolution_poids: poidsActuel && programme.poids_fin_jeune 
            ? (poidsActuel - programme.poids_fin_jeune).toFixed(1) 
            : null,
          
          // Statistiques conformité
          total_repas_saisis: totalRepas,
          repas_conformes: repasConformes,
          taux_conformite: tauxConformite,
          jours_valides: nbJoursValides,
          taux_validation: tauxValidation,
          
          // Validation
          statut: 'termine',
          termine_le: new Date().toISOString(),
          reprise_reussie: tauxConformite >= 70 && tauxValidation >= 80 // Critères succès
        };
        
        // Sauvegarder le bilan
        localStorage.setItem('bilanRepriseAlimentaire', JSON.stringify(bilanReprise));
        console.log('[BILAN REPRISE] Bilan calculé et sauvegardé:', bilanReprise);
        
        // Mettre à jour le programme
        const programmeMAJ = { 
          ...programme, 
          statut: 'termine', 
          reprise_terminee_le: new Date().toISOString(),
          bilan_reprise: bilanReprise
        };
        localStorage.setItem('programmeRepriseValide', JSON.stringify(programmeMAJ));

        setMessageValidation({ 
          type: 'success', 
          text: `🎉 Félicitations ! Tu as terminé ta reprise alimentaire avec ${tauxConformite}% de conformité. Direction la phase de cristallisation !` 
        });
      } else {
        setMessageValidation({ 
          type: 'success', 
          text: `✅ Jour ${jourData.jour_numero} validé ! Continue comme ça 🌱` 
        });
      }

      // 5️⃣ Recharger les données
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (e) {
      console.error('[ERROR] Exception validation:', e);
      setMessageValidation({ type: 'error', text: `Erreur: ${e.message}` });
    } finally {
      setValidationEnCours(false);
    }
  };

  // ...existing code...
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'row',
      gap: '2.5rem',
      alignItems: 'flex-start',
      position: 'relative',
      minHeight: '80vh'
    }}>
      {/* Bouton retour au jeûne */}
      <div style={{marginBottom:'1.2rem'}}>
        <Link href="/jeune" style={{display:'inline-flex',alignItems:'center',background:'#f5f5f5',border:'1px solid #bdbdbd',borderRadius:8,padding:'0.5rem 1.1rem',color:'#1976d2',fontWeight:700,textDecoration:'none',fontSize:'1.05rem',boxShadow:'0 1px 3px #0001'}}>
          <span style={{fontSize:'1.3em',marginRight:8}}>←</span> Retour au jeûne
        </Link>
      </div>
      {/* COLONNE CENTRALE */}
      <main className="main-content" style={{flex:1, minWidth:0, maxWidth:700, margin:'0 auto'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem', flexWrap:'wrap', gap:12}}>
          <h1 style={{color:'#1976d2', fontWeight:900, fontSize:'2.3rem', margin:0, letterSpacing:'-1px'}}>Reprise alimentaire après jeûne</h1>
          <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
            <Link 
              href="/suivi"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '0.6rem 1.2rem',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none'
              }}
            >
              <span style={{fontSize:'1.2em'}}>✏️</span> Saisir un repas
            </Link>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '0.6rem 1.2rem',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(102,126,234,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span style={{fontSize:'1.2em'}}>🔄</span> Actualiser
            </button>
          </div>
        </div>
        
        {/* 📅 DATE DU JOUR (vraie date système) */}
        <div style={{
          background: '#e3f2fd',
          border: '1px solid #90caf9',
          borderRadius: 10,
          padding: '0.6rem 1rem',
          marginBottom: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span style={{fontSize: '1.3rem'}}>📅</span>
          <div>
            <span style={{fontSize: '0.85rem', color: '#1565c0', fontWeight: 500, marginRight: 8}}>Aujourd'hui :</span>
            <span style={{fontSize: '1rem', fontWeight: 600, color: '#0d47a1'}}>
              {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
        </div>
        
        {/* 🆕 BLOC CONTEXTE JEÛNE */}
        {programme && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 12,
            padding: '1.2rem 1.5rem',
            marginBottom: '1.5rem',
            color: 'white',
            boxShadow: '0 4px 12px rgba(102,126,234,0.15)'
          }}>
            <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
              <span style={{fontSize:'2rem'}}>🌙</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700, fontSize:'1.2rem', marginBottom:4}}>Contexte de ton jeûne</div>
                {programme.message_personnel && (
                  <div style={{fontSize:'0.98rem', opacity:0.95, fontStyle:'italic'}}>
                    "{programme.message_personnel}"
                  </div>
                )}
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12, marginTop:12}}>
              <div style={{background:'rgba(255,255,255,0.15)', borderRadius:8, padding:'0.7rem 0.9rem'}}>
                <div style={{fontSize:'0.85rem', opacity:0.85, marginBottom:4}}>Durée du jeûne</div>
                <div style={{fontSize:'1.3rem', fontWeight:800}}>{programme.duree_jeune_jours} jours</div>
              </div>
              {programme.poids_fin_jeune && (
                <div style={{background:'rgba(255,255,255,0.15)', borderRadius:8, padding:'0.7rem 0.9rem'}}>
                  <div style={{fontSize:'0.85rem', opacity:0.85, marginBottom:4}}>Poids en fin de jeûne</div>
                  <div style={{fontSize:'1.3rem', fontWeight:800}}>{programme.poids_fin_jeune} kg</div>
                </div>
              )}
              <div style={{background:'rgba(255,255,255,0.15)', borderRadius:8, padding:'0.7rem 0.9rem'}}>
                <div style={{fontSize:'0.85rem', opacity:0.85, marginBottom:4}}>Fin du jeûne</div>
                <div style={{fontSize:'1.1rem', fontWeight:700}}>
                  {programme.date_fin_jeune ? new Date(programme.date_fin_jeune).toLocaleDateString('fr-FR', { day:'numeric', month:'short' }) : '-'}
                </div>
              </div>
              <div style={{background:'rgba(255,255,255,0.15)', borderRadius:8, padding:'0.7rem 0.9rem'}}>
                <div style={{fontSize:'0.85rem', opacity:0.85, marginBottom:4}}>Durée reprise</div>
                <div style={{fontSize:'1.3rem', fontWeight:800}}>{programme.duree_reprise_jours} jours</div>
              </div>
            </div>
          </div>
        )}

        {/* Barre de progression globale */}
        {totalJours > 0 && (
          <div style={{
            marginBottom: '1.2rem',
            background: '#e8f5e9',
            borderRadius: 10,
            padding: '0.9rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 800,
            color: '#388e3c',
            fontSize: '1.18rem',
            boxShadow: '0 1px 3px #0001',
            border: '2px solid #43a04722'
          }}>
            <span>Progression : <span style={{color:'#1976d2', fontWeight:900}}>Jour {currentJour}</span> / {totalJours}</span>
            <div style={{flex:1, marginLeft:16, marginRight:8, height:12, background:'#c8e6c9', borderRadius:6, overflow:'hidden'}}>
              <div style={{width: `${(currentJour/totalJours)*100}%`, height:'100%', background:'#43a047', borderRadius:6, transition:'width 0.3s'}}></div>
            </div>
          </div>
        )}

      {/* ASIDE PHASES STICKY (desktop) */}
      {programme && programme.phases && programme.jours_detailles && (
        <PhasesApercu
          phases={programme.phases}
          jours={programme.jours_detailles}
          dateAuj={dateAuj}
          onVoirAliments={phaseNum => setModalAliments(phaseNum)}
        />
      )}
      {/* Message explicite si prévisualisation */}
      {isPreview && programme && (
        <div style={{background:'#fff3cd', color:'#856404', border:'1px solid #ffeeba', borderRadius:8, padding:'1rem 1.2rem', marginBottom:'1.5rem', fontWeight:600, fontSize:'1.08rem'}}>
          <span role="img" aria-label="info">ℹ️</span> La reprise alimentaire commencera le <b>{new Date(programme.date_debut_reprise).toLocaleDateString('fr-FR')}</b>.<br/>
          Tu peux prévisualiser les 2 premiers jours, mais tu ne pourras suivre le programme au quotidien qu'à partir de cette date.<br/>
          <span style={{fontWeight:400, fontSize:'0.98rem', color:'#888'}}>Pour tester le suivi réel sans attendre :</span>
          <div style={{marginTop:'1rem'}}>
            <button
              onClick={() => {
                // Ajoute ?test=1 à l'URL uniquement si ce n'est pas déjà le cas
                if (typeof window !== 'undefined') {
                  const url = new URL(window.location.href);
                  url.searchParams.set('test', '1');
                  if (window.location.href !== url.toString()) {
                    window.location.href = url.toString();
                  }
                }
              }}
              style={{
                background:'#1976d2',
                color:'#fff',
                border:'none',
                borderRadius:8,
                padding:'0.7rem 1.5rem',
                fontWeight:700,
                fontSize:'1.08rem',
                cursor:'pointer',
                marginTop:'0.5rem',
                boxShadow:'0 1px 3px #0001'
              }}
            >
              🚀 Voir le suivi réel (mode test)
            </button>
          </div>
        </div>
      )}
      
      {/* 🧪 BOUTON TEST : Activer temporairement la reprise dans /suivi */}
      {forceSuivi && (
        <div style={{background:'#e3f2fd', border:'2px solid #1976d2', borderRadius:8, padding:'1rem 1.2rem', marginBottom:'1.5rem'}}>
          <div style={{fontWeight:700, color:'#1976d2', fontSize:'1.1rem', marginBottom:8}}>
            🧪 Mode Test Activé {repriseMode === 'test' && <span style={{background:'#ff9800', color:'white', padding:'2px 8px', borderRadius:4, fontSize:'0.85rem', marginLeft:8}}>TEST</span>}
          </div>
          <div style={{fontSize:'0.98rem', color:'#555', marginBottom:12}}>
            Tu peux activer temporairement le comportement de reprise alimentaire dans la page <b>/suivi</b> pour tester sans impacter les données réelles.
          </div>
          
          {repriseMode === 'test' && (
            <div style={{background:'#fff3cd', border:'1px solid #ffb74d', borderRadius:6, padding:12, marginBottom:12, fontSize:'0.95rem'}}>
              ⚠️ <b>Mode TEST actif</b> : Les repas sont enregistrés dans une zone isolée (<code>test_*</code>).
              <br/>
              Pour passer en production, clique sur "✅ Valider et basculer en production" ci-dessous.
            </div>
          )}
          
          <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  // Activer flag temporaire dans localStorage (préfixe test_)
                  localStorage.setItem('test_modeRepriseActif', 'true');
                  localStorage.setItem('repriseMode', 'test');
                  localStorage.setItem('test_programmeRepriseValide', localStorage.getItem('programmeRepriseValide') || '{}');
                  alert('✅ Mode reprise TEST activé dans /suivi\n\nVa maintenant sur la page /suivi pour voir le bandeau violet et tester la validation des repas.\n\nPour désactiver : clique sur "Désactiver mode test" ci-dessous.');
                  window.location.reload();
                }
              }}
              style={{
                background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color:'#fff',
                border:'none',
                borderRadius:8,
                padding:'0.7rem 1.5rem',
                fontWeight:700,
                fontSize:'1.05rem',
                cursor:'pointer',
                boxShadow:'0 2px 6px rgba(102,126,234,0.3)'
              }}
            >
              🎯 Activer mode TEST
            </button>
            
            {repriseMode === 'test' && (
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    const confirmation = confirm(
                      '🚀 MIGRATION TEST → PRODUCTION\n\n' +
                      'Cette action va :\n' +
                      '1. Copier TOUS les repas test vers la production\n' +
                      '2. Archiver les données test en backup\n' +
                      '3. Basculer en mode NORMAL\n\n' +
                      '⚠️ Cette action est IRRÉVERSIBLE.\n\n' +
                      'Continuer ?'
                    );
                    
                    if (!confirmation) return;
                    
                    try {
                      // 1. Copier repas test → normal
                      const repasTest = JSON.parse(localStorage.getItem('test_reprises_repas_consommes') || '[]');
                      localStorage.setItem('reprises_repas_consommes', JSON.stringify(repasTest));
                      
                      // 2. Archiver les données test
                      const timestamp = new Date().toISOString();
                      localStorage.setItem('backup_test_reprises_' + timestamp, JSON.stringify(repasTest));
                      
                      // 3. Copier programme test → normal
                      const progTest = localStorage.getItem('test_programmeRepriseValide');
                      if (progTest) {
                        localStorage.setItem('programmeRepriseValide', progTest);
                      }
                      
                      // 4. Basculer en mode normal
                      localStorage.setItem('repriseMode', 'normal');
                      localStorage.removeItem('test_modeRepriseActif');
                      
                      alert(
                        '✅ MIGRATION RÉUSSIE !\n\n' +
                        `${repasTest.length} repas copiés vers la production\n` +
                        'Backup créé : backup_test_reprises_' + timestamp + '\n\n' +
                        '🎉 Tu es maintenant en MODE NORMAL'
                      );
                      
                      window.location.reload();
                    } catch (error) {
                      alert('❌ Erreur lors de la migration : ' + error.message);
                    }
                  }
                }}
                style={{
                  background:'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color:'#fff',
                  border:'none',
                  borderRadius:8,
                  padding:'0.7rem 1.5rem',
                  fontWeight:700,
                  fontSize:'1.05rem',
                  cursor:'pointer',
                  boxShadow:'0 2px 6px rgba(16,185,129,0.3)'
                }}
              >
                ✅ Valider et basculer en production
              </button>
            )}
            
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('test_modeRepriseActif');
                  localStorage.removeItem('repriseMode');
                  localStorage.setItem('repriseMode', 'normal');
                  alert('✅ Mode test désactivé.\n\nLa page /suivi est revenue à son comportement normal.');
                  window.location.reload();
                }
              }}
              style={{
                background:'#f5f5f5',
                color:'#666',
                border:'1px solid #bdbdbd',
                borderRadius:8,
                padding:'0.7rem 1.5rem',
                fontWeight:600,
                fontSize:'1.05rem',
                cursor:'pointer',
                boxShadow:'0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              ❌ Désactiver mode test
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{textAlign:'center', color:'#888', fontSize:'1.2rem'}}>Chargement du plan...</div>
      ) : error ? (
        <div style={{color:'#c62828', fontWeight:600, margin:'2rem 0', whiteSpace:'pre-line'}}>
          {error}
          <div style={{marginTop:'2rem'}}>
            <Link href="/validation-plan-reprise" style={{
                display:'inline-block',
                background:'#1976d2',
                color:'#fff',
                padding:'0.7rem 1.5rem',
                borderRadius:8,
                fontWeight:700,
                textDecoration:'none',
                fontSize:'1.08rem',
                boxShadow:'0 1px 3px #0001',
                marginTop:'1rem'
              }}>
                ↩️ Retour à la validation du plan
            </Link>
          </div>
        </div>
      ) : !programme ? (
        <div style={{color:'#888', fontWeight:600, margin:'2rem 0'}}>Aucun plan de reprise validé à afficher.<br/>Valide ton plan dans l’étape précédente.</div>
      ) : (
        <>
          <div style={{background:'#e3f2fd', borderRadius:12, padding:'1.2rem 1.5rem', marginBottom:'1.5rem'}}>
            <div style={{fontSize:'1.15rem', color:'#1976d2', fontWeight:700, marginBottom:6}}>
              {jourReprise < 1 ? 'Prévisualisation du plan validé' : 'Suivi de ta reprise alimentaire'}
            </div>
            <div style={{color:'#444', fontSize:'1.05rem'}}>
              {jourReprise < 1
                ? "Tu as validé ton plan. La reprise commencera le " + new Date(programme.date_debut_reprise).toLocaleDateString('fr-FR') + ".\nTu peux prévisualiser les 2 premiers jours, mais tu ne pourras agir qu'à partir du jour J1."
                : "Ta reprise a commencé ! Suis chaque jour le programme pour consolider les bienfaits de ton jeûne. Valide chaque jour pour suivre ta progression."}
            </div>
          </div>

            {/* Liste de courses pour les 2 premiers jours */}
          {listeCourses.length > 0 && (
            <div style={{background:'#fffde7', border:'1px solid #ffe082', borderRadius:10, padding:'1.1rem 1.3rem', marginBottom:'2rem'}}>
              <div style={{display:'flex',alignItems:'center',marginBottom:6}}>
                <span role="img" aria-label="courses" style={{fontSize:'1.3em',marginRight:8}}>🛒</span>
                <span style={{color:'#f57c00',fontWeight:700,fontSize:'1.08rem'}}>Liste de courses pour démarrer la reprise (J+1 et J+2)</span>
              </div>
              <ul style={{margin:'0.5rem 0 0 1.2rem', color:'#333', fontSize:'1.05rem',columns:2}}>
                {listeCourses.map((alim, i) => (
                  <li key={i}>{alim.nom}{alim.portion ? ` (${alim.portion})` : ''}</li>
                ))}
              </ul>
              <div style={{color:'#888',fontSize:'0.98rem',marginTop:8}}>
                (Anticipe tes achats pour ne manquer de rien le jour J !)
              </div>
            </div>
          )}

          <div style={{marginBottom:'2rem'}}>
            <h2 style={{color:'#1976d2', fontSize:'1.3rem', fontWeight:700, marginBottom:'1rem'}}>Jours de la reprise</h2>
            {/* Mini-liste des jours (hybride) */}
            <div style={{display:'flex', gap:8, marginBottom:18, flexWrap:'wrap'}}>
              {jours.map((jour, idx) => {
                const accessible = idx < maxJourAccessible;
                const isSelected = idx === (selectedJourIdx + (jours.length - joursAAfficher.length));
                return (
                  <button
                    key={idx}
                    onClick={() => accessible && setSelectedJourIdx(idx - (jours.length - joursAAfficher.length))}
                    disabled={!accessible}
                    style={{
                      minWidth:36,
                      padding:'0.3rem 0.7rem',
                      borderRadius:6,
                      border: isSelected ? '2px solid #1976d2' : '1px solid #b3e5fc',
                      background: isSelected ? '#e3f2fd' : accessible ? '#fff' : '#f5f5f5',
                      color: accessible ? (isSelected ? '#1976d2' : '#1976d2') : '#bbb',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: accessible ? 'pointer' : 'not-allowed',
                      position:'relative',
                      boxShadow: isSelected ? '0 2px 8px #1976d233' : 'none',
                      outline:'none',
                      transition:'all 0.15s',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:3
                    }}
                    title={accessible ? `Accéder au jour ${jour.jour_numero}` : 'Jour verrouillé'}
                  >
                    {accessible ? (
                      <span>{jour.jour_numero}</span>
                    ) : (
                      <span style={{display:'flex',alignItems:'center',gap:2}}>
                        <span>{jour.jour_numero}</span>
                        <span role="img" aria-label="verrou" style={{marginLeft:2, fontSize:'1.15em', color:'#c62828', fontWeight:700}}>🔒</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Navigation jour par jour */}
            {joursAAfficher.length > 0 && (
              <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:18}}>
                <button
                  onClick={handlePrevJour}
                  disabled={selectedJourIdx === 0}
                  style={{
                    background:'#f5f5f5',
                    color:'#1976d2',
                    border:'1px solid #b3e5fc',
                    borderRadius:6,
                    padding:'0.5rem 1.1rem',
                    fontWeight:600,
                    fontSize:'1rem',
                    cursor: selectedJourIdx === 0 ? 'not-allowed' : 'pointer',
                    opacity: selectedJourIdx === 0 ? 0.5 : 1
                  }}
                >
                  ← Jour précédent
                </button>
                <span style={{fontWeight:700, color:'#1976d2', fontSize:'1.08rem'}}>
                  Jour {joursAAfficher[selectedJourIdx]?.jour_numero} – {joursAAfficher[selectedJourIdx]?.date}
                </span>
                <button
                  onClick={handleNextJour}
                  disabled={selectedJourIdx === joursAAfficher.length - 1}
                  style={{
                    background:'#f5f5f5',
                    color:'#1976d2',
                    border:'1px solid #b3e5fc',
                    borderRadius:6,
                    padding:'0.5rem 1.1rem',
                    fontWeight:600,
                    fontSize:'1rem',
                    cursor: selectedJourIdx === joursAAfficher.length - 1 ? 'not-allowed' : 'pointer',
                    opacity: selectedJourIdx === joursAAfficher.length - 1 ? 0.5 : 1
                  }}
                >
                  Jour suivant →
                </button>
              </div>
            )}
            {/* Affichage du jour sélectionné */}
            {joursAAfficher.length > 0 && (
              <div style={{background:'#fff', border:'1px solid #b3e5fc', borderRadius:10, marginBottom:18, padding:'1.1rem 1.2rem'}}>
                <div style={{fontWeight:700, color:'#1976d2', fontSize:'1.1rem', marginBottom:4}}>
                  Jour {joursAAfficher[selectedJourIdx]?.jour_numero}
                </div>
                <div style={{fontSize:'0.9rem', color:'#888', marginBottom:6}}>
                  Date prévue au plan : {joursAAfficher[selectedJourIdx]?.date}
                </div>
                <div style={{color:'#444', marginBottom:6}}>
                  <b>Phase {joursAAfficher[selectedJourIdx]?.phase}</b>
                </div>
                <div style={{color:'#388e3c', marginBottom:6, fontWeight:500}}>
                  {joursAAfficher[selectedJourIdx]?.message_contextuel}
                </div>
                
                {/* 🆕 MES SCORES */}
                {!isPreview && joursAAfficher[selectedJourIdx] && (() => {
                  const cleRepas = repriseMode === 'test' ? 'test_reprises_repas_consommes' : 'reprises_repas_consommes';
                  const repasStockes = JSON.parse(localStorage.getItem(cleRepas) || '[]');
                  const todayStr = new Date().toISOString().split('T')[0];
                  
                  // Calcul scores (identique à /suivi.js)
                  const repasTypes = ["Petit-déjeuner", "Déjeuner", "Collation", "Dîner"];
                  const repasJourCourant = repasStockes.filter(r => r.date === todayStr);
                  const nbRepasSaisis = repasTypes.reduce((acc, type) => acc + (repasJourCourant.some(r => r.moment === type) ? 1 : 0), 0);
                  const scoreRegularite = Math.round((nbRepasSaisis / repasTypes.length) * 100);
                  
                  // Score calories du jour
                  const caloriesDuJour = repasJourCourant.reduce((sum, r) => sum + (parseFloat(r.kcal) || 0), 0);
                  const objectifCalorique = 1800; // Valeur par défaut (à adapter selon profil)
                  const scoreCalorique = objectifCalorique > 0 ? Math.round((caloriesDuJour / objectifCalorique) * 100) : 0;
                  
                  // Score discipline (repas conformes)
                  const repasConformes = repasJourCourant.filter(r => r.conforme === true || r.validation?.phase_ok).length;
                  const scoreDiscipline = repasJourCourant.length > 0 ? Math.round((repasConformes / repasJourCourant.length) * 100) : 0;
                  
                  return (
                    <>
                      {/* Bloc Mes scores */}
                      <div style={{
                        marginTop: 18,
                        marginBottom: 18,
                        background: "#fafafa",
                        borderRadius: 12,
                        padding: "20px 16px",
                        boxShadow: "0 1px 5px rgba(0,0,0,0.03)"
                      }}>
                        <h2 style={{ margin: "0 0 16px 0" }}>Mes scores</h2>
                        
                        <div style={{ marginBottom: 12 }}>
                          <span style={{ fontWeight: 500 }}>Score de régularité de saisie : </span>
                          <span style={{ fontWeight: 700, color: "#8e24aa", fontSize: 18 }}>{scoreRegularite}%</span>
                          <div style={{ background: "#e0e0e0", borderRadius: 8, height: 16, width: "100%", marginTop: 6 }}>
                            <div style={{ width: `${Math.min(scoreRegularite, 100)}%`, height: "100%", background: "#8e24aa", borderRadius: 8, transition: "width 0.5s" }}></div>
                          </div>
                          <div style={{ fontSize: 13, color: scoreRegularite === 100 ? '#43a047' : '#888', marginTop: 4 }}>
                            {scoreRegularite === 100
                              ? "Bravo, tu as saisi tous tes repas principaux aujourd'hui !"
                              : `Repas saisis aujourd'hui : ${nbRepasSaisis} / ${repasTypes.length}`}
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: 12 }}>
                          <span style={{ fontWeight: 500 }}>Score calorique du jour : </span>
                          <span style={{ fontWeight: 700, color: "#ff9800", fontSize: 18 }}>{scoreCalorique}%</span>
                          <div style={{ background: "#e0e0e0", borderRadius: 8, height: 16, width: "100%", marginTop: 6 }}>
                            <div style={{ width: `${Math.min(scoreCalorique, 100)}%`, height: "100%", background: "#ff9800", borderRadius: 8, transition: "width 0.5s" }}></div>
                          </div>
                          <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
                            Objectif : {objectifCalorique} kcal — Consommé : {Math.round(caloriesDuJour)} kcal
                          </div>
                        </div>
                        
                        <div>
                          <span style={{ fontWeight: 500 }}>Score discipline (repas alignés) : </span>
                          <span style={{ fontWeight: 700, color: "#1976d2", fontSize: 18 }}>{scoreDiscipline}%</span>
                          <div style={{ background: "#e0e0e0", borderRadius: 8, height: 16, width: "100%", marginTop: 6 }}>
                            <div style={{ width: `${Math.min(scoreDiscipline, 100)}%`, height: "100%", background: "#1976d2", borderRadius: 8, transition: "width 0.5s" }}></div>
                          </div>
                          <div style={{ fontSize: 13, color: scoreDiscipline >= 75 ? '#43a047' : '#888', marginTop: 4 }}>
                            {repasJourCourant.length === 0 
                              ? "Aucun repas saisi aujourd'hui"
                              : `${repasConformes} / ${repasJourCourant.length} repas conformes`}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* 🆕 CRITÈRES DU JOUR - SUIVI EN TEMPS RÉEL */}
                {!isPreview && joursAAfficher[selectedJourIdx] && (() => {
                  const cleRepas = repriseMode === 'test' ? 'test_reprises_repas_consommes' : 'reprises_repas_consommes';
                  const repasStockes = JSON.parse(localStorage.getItem(cleRepas) || '[]');
                  const todayStr = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
                  
                  // Debug
                  console.log('🔍 DEBUG Critères du jour:', {
                    totalRepasStockes: repasStockes.length,
                    jourRecherche: joursAAfficher[selectedJourIdx].jour_numero,
                    phaseRecherche: joursAAfficher[selectedJourIdx].phase,
                    dateRecherche: joursAAfficher[selectedJourIdx].date,
                    dateAujourdhui: todayStr,
                    premiersRepas: repasStockes.slice(0, 3)
                  });
                  
                  // Filtre par jour_numero et phase uniquement (pas par date pour éviter problèmes de format)
                  const repasJour = repasStockes.filter(r => 
                    r.jour_reprise === joursAAfficher[selectedJourIdx].jour_numero &&
                    r.phase_reprise === joursAAfficher[selectedJourIdx].phase
                  );
                  
                  console.log('🔍 Repas trouvés pour ce jour:', repasJour.length);
                  
                  if (repasJour.length === 0) {
                    return (
                      <div style={{
                        background: '#fff3e0',
                        border: '2px dashed #ff9800',
                        borderRadius: 10,
                        padding: '1rem 1.2rem',
                        marginBottom: 12,
                        color: '#e65100',
                        fontSize: '0.95rem'
                      }}>
                        ℹ️ Aucun repas enregistré pour ce jour. Va sur <a href="/suivi" style={{color: '#1976d2', fontWeight: 600}}>la page /suivi</a> pour enregistrer tes repas.
                      </div>
                    );
                  }
                  
                  return (
                    <div className="criteres-bloc" style={{
                      background: '#f3e5f5',
                      border: '2px solid #ab47bc',
                      borderRadius: 10,
                      padding: '1rem 1.2rem',
                      marginBottom: 12
                    }}>
                      <div style={{fontWeight: 700, color: '#6a1b9a', marginBottom: 8, fontSize: '1.05rem'}}>
                        📊 Critères du jour - Suivi en temps réel
                      </div>
                      <div style={{color: '#4a148c', fontSize: '0.95rem', marginBottom: 12}}>
                        {repasJour.length} repas enregistré(s) pour le Jour {joursAAfficher[selectedJourIdx].jour_numero}
                        {repasJour.length > 0 && repasJour[0].date && (
                          <span style={{marginLeft: 8, color: '#7b1fa2', fontSize: '0.9rem'}}>
                            (enregistré le {(() => {
                              const [y, m, d] = repasJour[0].date.split('-');
                              return `${d}/${m}/${y}`;
                            })()})
                          </span>
                        )}
                      </div>
                      
                      {repasJour.map((repas, idx) => {
                        const validation = repas.validation || {};
                        const criteresOK = [
                          validation.phase_ok,
                          validation.horaire_ok,
                          validation.quantite_ok,
                          validation.qn_ok
                        ].filter(Boolean).length;
                        const criteresTotal = 4;
                        
                        return (
                          <div key={idx} style={{
                            background: 'white',
                            borderRadius: 8,
                            padding: '0.8rem',
                            marginBottom: idx < repasJour.length - 1 ? 8 : 0,
                            border: '1px solid #e1bee7'
                          }}>
                            <div style={{fontWeight: 600, color: '#333', marginBottom: 4}}>
                              {repas.aliment_nom || repas.aliment} - {repas.moment || repas.type_repas}
                            </div>
                            <div style={{fontSize: '0.9rem', color: '#666', marginBottom: 6}}>
                              {repas.quantite}g ({repas.kcal} kcal)
                            </div>
                            <div style={{
                              fontWeight: 600,
                              color: criteresOK === criteresTotal ? '#2e7d32' : '#f57c00',
                              fontSize: '0.95rem'
                            }}>
                              {criteresOK === criteresTotal ? '✅' : '📊'} Validation : {criteresOK}/{criteresTotal} critères
                            </div>
                            {validation.message && (
                              <div style={{
                                fontSize: '0.85rem',
                                color: '#666',
                                marginTop: 6,
                                whiteSpace: 'pre-line',
                                borderLeft: '3px solid #ab47bc',
                                paddingLeft: 8,
                                marginLeft: 4
                              }}>
                                {validation.message}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      <div style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: '1px dashed #ce93d8',
                        fontSize: '0.9rem',
                        color: '#6a1b9a',
                        fontWeight: 500
                      }}>
                        {repasJour.length >= 2 
                          ? '✅ Au moins 2 repas enregistrés, tu peux valider ce jour' 
                          : `⏳ Enregistre encore ${2 - repasJour.length} repas pour pouvoir valider ce jour`}
                      </div>
                    </div>
                  );
                })()}
                
                <div style={{marginBottom:4}}>
                  <b>Aliments autorisés :</b>
                  <ul style={{margin:'0.3rem 0 0 1.2rem', color:'#333', fontSize:'1rem'}}>
                    {joursAAfficher[selectedJourIdx]?.aliments_autorises && joursAAfficher[selectedJourIdx].aliments_autorises.slice(0, 6).map((alim, i) => (
                      <li key={i}>{alim.nom} {alim.portion ? `(${alim.portion})` : ''}</li>
                    ))}
                    {joursAAfficher[selectedJourIdx]?.aliments_autorises && joursAAfficher[selectedJourIdx].aliments_autorises.length > 6 && (
                      <li>...et {joursAAfficher[selectedJourIdx].aliments_autorises.length - 6} autres</li>
                    )}
                  </ul>
                </div>
                
                {/* 🆕 BOUTON VALIDATION QUOTIDIENNE */}
                {!isPreview && joursAAfficher[selectedJourIdx] && (
                  <div style={{marginTop: 16, paddingTop: 16, borderTop: '1px solid #e0e0e0'}}>
                    {joursAAfficher[selectedJourIdx].valide ? (
                      <div style={{
                        background: '#e8f5e9',
                        border: '2px solid #4caf50',
                        borderRadius: 8,
                        padding: '0.8rem 1rem',
                        color: '#2e7d32',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        <span style={{fontSize: '1.5rem'}}>✅</span>
                        <span>
                          Jour validé le {new Date(joursAAfficher[selectedJourIdx].valide_le).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => validerJour(joursAAfficher[selectedJourIdx])}
                          disabled={validationEnCours || (!forceSuivi && new Date(joursAAfficher[selectedJourIdx].date) > new Date())}
                          style={{
                            background: (!forceSuivi && new Date(joursAAfficher[selectedJourIdx].date) > new Date()) 
                              ? '#e0e0e0' 
                              : 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
                            color: (!forceSuivi && new Date(joursAAfficher[selectedJourIdx].date) > new Date()) 
                              ? '#9e9e9e' 
                              : 'white',
                            border: 'none',
                            borderRadius: 8,
                            padding: '0.9rem 1.8rem',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            cursor: new Date(joursAAfficher[selectedJourIdx].date) > new Date() || validationEnCours 
                              ? 'not-allowed' 
                              : 'pointer',
                            boxShadow: new Date(joursAAfficher[selectedJourIdx].date) > new Date() 
                              ? 'none' 
                              : '0 4px 12px rgba(67,206,162,0.2)',
                            width: '100%',
                            transition: 'all 0.3s'
                          }}
                        >
                          {validationEnCours ? '⏳ Validation...' : '✅ Valider ce jour'}
                        </button>
                        
                        {!forceSuivi && new Date(joursAAfficher[selectedJourIdx].date) > new Date() && (
                          <div style={{
                            marginTop: 12,
                            fontSize: '0.95rem',
                            color: '#f57c00',
                            textAlign: 'center',
                            fontWeight: 500
                          }}>
                            ⏰ Ce jour sera accessible le {new Date(joursAAfficher[selectedJourIdx].date).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Message de feedback */}
                    {messageValidation && (
                      <div style={{
                        marginTop: 12,
                        padding: '0.8rem 1rem',
                        borderRadius: 8,
                        background: messageValidation.type === 'success' ? '#e8f5e9' : '#ffebee',
                        border: `2px solid ${messageValidation.type === 'success' ? '#4caf50' : '#f44336'}`,
                        color: messageValidation.type === 'success' ? '#2e7d32' : '#c62828',
                        fontWeight: 600,
                        fontSize: '1rem'
                      }}>
                        {messageValidation.text}
                      </div>
                    )}
                  </div>
                )}

                {isPreview && (
                  <div style={{color:'#888', fontSize:'0.98rem', marginTop: 12}}>
                    (Lecture seule, tu ne peux pas valider ce jour tant que la date n'est pas atteinte)
                  </div>
                )}
              </div>
            )}
            {/* Bloc anticipation : Repas du lendemain */}
            {joursAAfficher.length > 0 && (selectedJourIdx + 1 < joursAAfficher.length || maxJourAccessible < jours.length) && (
              <div style={{background:'#f5f5f5', border:'1px dashed #bdbdbd', borderRadius:8, padding:'1rem 1.2rem', marginBottom:10, color:'#888'}}>
                <span role="img" aria-label="demain">⏭️</span> <b>Repas du lendemain</b> :
                <ul style={{margin:'0.5rem 0 0 1.2rem', color:'#888', fontSize:'1rem'}}>
                  {(selectedJourIdx + 1 < joursAAfficher.length
                    ? joursAAfficher[selectedJourIdx + 1]?.aliments_autorises
                    : (jours[maxJourAccessible]?.aliments_autorises || [])
                  )?.slice(0, 6).map((alim, i) => (
                    <li key={i}>{alim.nom} {alim.portion ? `(${alim.portion})` : ''}</li>
                  ))}
                  {(selectedJourIdx + 1 < joursAAfficher.length
                    ? joursAAfficher[selectedJourIdx + 1]?.aliments_autorises
                    : (jours[maxJourAccessible]?.aliments_autorises || [])
                  )?.length > 6 && (
                    <li>...et {((selectedJourIdx + 1 < joursAAfficher.length
                      ? joursAAfficher[selectedJourIdx + 1]?.aliments_autorises
                      : (jours[maxJourAccessible]?.aliments_autorises || [])
                    ).length - 6)} autres</li>
                  )}
                </ul>
                <div style={{fontSize:'0.95rem', color:'#bbb', marginTop:6}}>
                  (Lecture seule, anticipation pour t’organiser)
                </div>
              </div>
            )}
          </div>

          {/* 🆕 BANNIÈRE FÉLICITATIONS - REPRISE TERMINÉE */}
          {programme && programme.statut === 'termine' && (
            <div style={{
              background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
              border: '3px solid #ffa000',
              borderRadius: 12,
              padding: '1.8rem 2rem',
              marginTop: 24,
              marginBottom: 24,
              textAlign: 'center',
              boxShadow: '0 6px 20px rgba(255,215,0,0.3)'
            }}>
              <div style={{fontSize: '3rem', marginBottom: 12}}>🎉</div>
              <div style={{fontSize: '1.6rem', fontWeight: 800, color: '#d84315', marginBottom: 12}}>
                Félicitations !
              </div>
              <div style={{fontSize: '1.1rem', color: '#5d4037', marginBottom: 16, lineHeight: 1.5}}>
                Tu as terminé ta reprise alimentaire de <b>{programme.duree_reprise_jours} jours</b> {programme.duree_reprise_jours <= 4 ? '⚡' : programme.duree_reprise_jours <= 8 ? '🌱' : '🌳'} avec succès !
                <br/>
                {programme.duree_jeune_jours > 0 && (
                  <>Après ton jeûne de <b>{programme.duree_jeune_jours} jours</b>, tu as su réintroduire les aliments progressivement. </>
                )}
                Il est maintenant temps de consolider ces acquis et d'ancrer durablement tes nouvelles habitudes.
              </div>
              
              {/* 🆕 Formulaire de saisie du poids final si manquant */}
              {!programme.bilan_reprise?.poids_fin_reprise && (
                <div style={{
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: 8,
                  padding: '1rem 1.2rem',
                  marginBottom: 16,
                  border: '2px dashed #f57c00'
                }}>
                  <label style={{
                    fontWeight: 600,
                    color: '#5d4037',
                    display: 'block',
                    marginBottom: 8,
                    fontSize: '1rem'
                  }}>
                    ⚖️ Entre ton poids actuel pour finaliser le bilan :
                  </label>
                  <div style={{display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center'}}>
                    <input
                      type="number"
                      step="0.1"
                      min="30"
                      max="200"
                      placeholder="Ex: 76.2"
                      value={poidsFinal}
                      onChange={(e) => setPoidsFinal(e.target.value)}
                      style={{
                        padding: '0.7rem 1rem',
                        borderRadius: 8,
                        border: '2px solid #f57c00',
                        fontSize: '1rem',
                        width: '150px',
                        textAlign: 'center',
                        fontWeight: 600
                      }}
                    />
                    <button
                      onClick={handleSauvegarderPoidsFinal}
                      style={{
                        background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '0.7rem 1.5rem',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(67,160,71,0.3)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      ✔️ Valider
                    </button>
                  </div>
                </div>
              )}
              
              <div style={{
                background: 'rgba(255,255,255,0.7)',
                borderRadius: 8,
                padding: '1rem 1.2rem',
                marginBottom: 16,
                color: '#6d4c41',
                fontSize: '1rem',
                textAlign: 'left'
              }}>
                <div style={{fontWeight: 600, marginBottom: 12, fontSize: '1.1rem'}}>📊 Ton bilan complet :</div>
                
                {/* Durées */}
                <div style={{marginBottom: 8}}>✅ Durée du jeûne : <strong>{programme.duree_jeune_jours} jours</strong></div>
                <div style={{marginBottom: 8}}>✅ Durée de la reprise : <strong>{programme.duree_reprise_jours} jours</strong></div>
                
                {/* Poids */}
                {programme.bilan_reprise?.poids_debut_reprise && (
                  <div style={{marginBottom: 8}}>
                    ⚖️ Poids début reprise : <strong>{programme.bilan_reprise.poids_debut_reprise} kg</strong>
                  </div>
                )}
                {programme.bilan_reprise?.poids_fin_reprise && (
                  <div style={{marginBottom: 8}}>
                    ⚖️ Poids fin reprise : <strong>{programme.bilan_reprise.poids_fin_reprise} kg</strong>
                    {programme.bilan_reprise.evolution_poids && (
                      <span style={{
                        marginLeft: 8,
                        color: parseFloat(programme.bilan_reprise.evolution_poids) > 0 ? '#f57c00' : '#43a047',
                        fontWeight: 600
                      }}>
                        ({parseFloat(programme.bilan_reprise.evolution_poids) > 0 ? '+' : ''}{programme.bilan_reprise.evolution_poids} kg)
                      </span>
                    )}
                  </div>
                )}
                
                {/* Statistiques conformité */}
                {programme.bilan_reprise && (
                  <>
                    <div style={{marginBottom: 8}}>
                      📈 Conformité repas : <strong style={{color: programme.bilan_reprise.taux_conformite >= 70 ? '#43a047' : '#f57c00'}}>
                        {programme.bilan_reprise.taux_conformite}%
                      </strong> ({programme.bilan_reprise.repas_conformes}/{programme.bilan_reprise.total_repas_saisis} repas)
                    </div>
                    <div style={{marginBottom: 8}}>
                      ✔️ Jours validés : <strong style={{color: programme.bilan_reprise.taux_validation >= 80 ? '#43a047' : '#f57c00'}}>
                        {programme.bilan_reprise.taux_validation}%
                      </strong> ({programme.bilan_reprise.jours_valides}/{programme.duree_reprise_jours} jours)
                    </div>
                    {/* 🆕 ANALYSE DÉTAILLÉE AVEC FEEDBACK PERSONNALISÉ */}
                    <div style={{
                      marginTop: 16,
                      padding: '12px 16px',
                      background: programme.bilan_reprise.reprise_reussie ? '#e8f5e9' : '#fff3e0',
                      borderRadius: 8,
                      border: `2px solid ${programme.bilan_reprise.reprise_reussie ? '#4caf50' : '#ff9800'}`
                    }}>
                      {programme.bilan_reprise.reprise_reussie ? (
                        <>
                          <div style={{color: '#2e7d32', fontWeight: 700, fontSize: '1.05rem', marginBottom: 8}}>
                            🏆 Reprise réussie ! Tu es prêt·e pour la cristallisation
                          </div>
                          
                          {/* Points forts */}
                          <div style={{color: '#2e7d32', fontSize: '0.95rem', marginTop: 8}}>
                            <strong>💪 Tes points forts :</strong>
                            <ul style={{marginLeft: 20, marginTop: 4, marginBottom: 8}}>
                              {programme.bilan_reprise.taux_conformite >= 85 && (
                                <li>Excellente conformité alimentaire ({programme.bilan_reprise.taux_conformite}%)</li>
                              )}
                              {programme.bilan_reprise.taux_validation >= 90 && (
                                <li>Régularité exemplaire ({programme.bilan_reprise.taux_validation}% des jours validés)</li>
                              )}
                              <li>Tu as respecté {programme.bilan_reprise.repas_conformes} repas sur {programme.bilan_reprise.total_repas_saisis} !</li>
                            </ul>
                          </div>
                          
                          {/* Conseils pour cristallisation */}
                          <div style={{color: '#5d4037', fontSize: '0.92rem', marginTop: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.6)', borderRadius: 6}}>
                            <strong>🎯 Pour la cristallisation (45 jours) :</strong>
                            <ul style={{marginLeft: 20, marginTop: 4, marginBottom: 0}}>
                              <li>Continue les bonnes habitudes que tu as prises</li>
                              <li>Envisage 1 jeûne ponctuel par semaine (optionnel)</li>
                              <li>Reste à l'écoute de ton corps et de tes sensations</li>
                            </ul>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{color: '#e65100', fontWeight: 700, fontSize: '1.05rem', marginBottom: 8}}>
                            ⚠️ Reprise terminée - Points d'amélioration identifiés
                          </div>
                          
                          {/* Points à améliorer */}
                          <div style={{color: '#5d4037', fontSize: '0.95rem', marginTop: 8}}>
                            <strong>📋 Analyse de ta reprise :</strong>
                            <ul style={{marginLeft: 20, marginTop: 4, marginBottom: 8}}>
                              {programme.bilan_reprise.taux_conformite < 70 && (
                                <li>Conformité des repas : {programme.bilan_reprise.taux_conformite}% (objectif : ≥70%)</li>
                              )}
                              {programme.bilan_reprise.taux_validation < 80 && (
                                <li>Régularité : {programme.bilan_reprise.taux_validation}% (objectif : ≥80%)</li>
                              )}
                              {programme.bilan_reprise.evolution_poids && parseFloat(programme.bilan_reprise.evolution_poids) > 2 && (
                                <li>Évolution du poids : +{programme.bilan_reprise.evolution_poids} kg (surveiller)</li>
                              )}
                            </ul>
                          </div>
                          
                          {/* Points positifs malgré tout */}
                          {(programme.bilan_reprise.taux_conformite >= 50 || programme.bilan_reprise.taux_validation >= 60) && (
                            <div style={{color: '#2e7d32', fontSize: '0.95rem', marginTop: 8}}>
                              <strong>💚 Points positifs :</strong>
                              <ul style={{marginLeft: 20, marginTop: 4, marginBottom: 8}}>
                                {programme.bilan_reprise.taux_conformite >= 50 && (
                                  <li>Tu as quand même maintenu {programme.bilan_reprise.taux_conformite}% de conformité</li>
                                )}
                                {programme.bilan_reprise.taux_validation >= 60 && (
                                  <li>Tu as validé {programme.bilan_reprise.jours_valides}/{programme.duree_reprise_jours} jours</li>
                                )}
                                <li>Tu es allé·e au bout de ta reprise ! 🎉</li>
                              </ul>
                            </div>
                          )}
                          
                          {/* Conseils pour cristallisation */}
                          <div style={{color: '#5d4037', fontSize: '0.92rem', marginTop: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.6)', borderRadius: 6}}>
                            <strong>🎯 Conseils pour la cristallisation :</strong>
                            <ul style={{marginLeft: 20, marginTop: 4, marginBottom: 0}}>
                              <li>Fixe-toi des objectifs réalistes (1 jour à la fois)</li>
                              <li>La cristallisation est l'occasion de consolider tes acquis</li>
                              <li>Surveille ton poids chaque semaine (max +2kg)</li>
                              <li>N'hésite pas à demander du soutien si besoin</li>
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
                
                <div style={{marginTop: 12}}>📅 Date de fin : {new Date(programme.date_fin_reprise || new Date()).toLocaleDateString('fr-FR')}</div>
              </div>

              <Link
                href={{
                  pathname: '/consolidation-45-jours',
                  query: {
                    // Transmettre TOUTES les données à la cristallisation
                    bilan_reprise: JSON.stringify(programme.bilan_reprise || {}),
                    duree_jeune: programme.duree_jeune_jours,
                    duree_reprise: programme.duree_reprise_jours,
                    poids_actuel: programme.bilan_reprise?.poids_fin_reprise || programme.poids_fin_jeune || programme.poids_depart,
                    date_fin_reprise: programme.date_fin_reprise || new Date().toISOString().split('T')[0],
                    reprise_id: programme.id,
                    taux_conformite: programme.bilan_reprise?.taux_conformite || 0
                  }
                }}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #d84315 0%, #bf360c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  padding: '1rem 2.5rem',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(216,67,21,0.3)',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                🚀 Commencer ma phase de consolidation (45 jours)
              </Link>
              
              <div style={{
                marginTop: 16,
                fontSize: '0.95rem',
                color: '#795548',
                fontStyle: 'italic'
              }}>
                La consolidation va te permettre de stabiliser durablement tes résultats
              </div>
            </div>
          )}

          <div style={{background:'#fffde7', border:'1px solid #ffe082', borderRadius:10, padding:'1rem 1.2rem', color:'#f57c00', fontWeight:600}}>
            <span role="img" aria-label="info">ℹ️</span> La validation quotidienne de la reprise sera possible uniquement à partir du jour J1. Reviens ici chaque jour pour valider ta progression.
          </div>
        </>
      )}
        {/* Modale aliments phase */}
        {modalAliments && (
          <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'#0008', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden'}} onClick={()=>setModalAliments(null)}>
            <div style={{background:'#fff', borderRadius:12, padding:'2rem 2.5rem', minWidth:320, maxWidth:420, maxHeight:'80vh', overflowY:'auto', boxShadow:'0 4px 24px #0003', position:'fixed', top:'50%', left:'50%', transform:'translate(-50%, -50%)'}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setModalAliments(null)} style={{position:'absolute', top:10, right:10, background:'none', border:'none', fontSize:'1.5rem', color:'#1976d2', cursor:'pointer'}}>✖</button>
              <h2 style={{color:'#1976d2', fontWeight:700, fontSize:'1.2rem', marginBottom:10}}>Aliments autorisés – Phase {modalAliments}</h2>
              <ul style={{margin:0, paddingLeft:'1.2rem', color:'#333', fontSize:'1.05rem'}}>
                {(() => {
                  // Récupérer les aliments de la phase et ajouter bouton recettes pour Phase 1
                  const aliments = require('../data/alimentsRepriseJeune').default.filter(a => a.phase === modalAliments);
                  return (
                    <>
                      {aliments.map((a, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>
                            {a.nom} <span style={{color:'#888', fontSize:'0.97em'}}>{a.categorie ? `(${a.categorie})` : ''}</span>
                          </span>
                          {/* Bouton recettes pour aliments Phase 1 spécifiques */}
                          {modalAliments === 1 && (a.nom.includes('Bouillon') || a.nom.includes('Purée')) && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalAliments(null);
                                setModalRecettes({ 
                                  isOpen: true, 
                                  type: a.nom.includes('Bouillon') ? 'bouillon' : 'puree' 
                                });
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                padding: '4px 8px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                marginLeft: '8px'
                              }}
                            >
                              🥘 Recette
                            </button>
                          )}
                          {/* Bouton recettes pour aliments Phase 2 spécifiques */}
                          {modalAliments === 2 && (a.nom.includes('Compote') || a.nom.includes('Purée') || a.nom.includes('Fruit cuit') || a.nom.includes('Bouillon')) && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalAliments(null);
                                let recetteType = 'compote';
                                if (a.nom.includes('Purée')) recetteType = 'puree';
                                else if (a.nom.includes('Fruit cuit') || a.nom.includes('Pomme') || a.nom.includes('Poire')) recetteType = 'fruitcuit';
                                else if (a.nom.includes('Bouillon')) recetteType = 'bouillon';
                                setModalRecettesPhase2({ 
                                  isOpen: true, 
                                  type: recetteType
                                });
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                padding: '4px 8px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                marginLeft: '8px'
                              }}
                            >
                              🥘 Recette Phase 2
                            </button>
                          )}
                        </li>
                      ))}
                      {/* Bouton notifications Phase 1 */}
                      {modalAliments === 1 && (
                        <li style={{ marginTop: '16px', padding: '12px', background: '#f8f9fa', borderRadius: 8 }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotificationsActives(!notificationsActives);
                            }}
                            style={{
                              background: notificationsActives ? 'linear-gradient(135deg, #4CAF50, #66BB6A)' : 'linear-gradient(135deg, #2196F3, #42A5F5)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 8,
                              padding: '8px 16px',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              width: '100%'
                            }}
                          >
                            {notificationsActives ? '🔕 Désactiver' : '🔔 Activer'} notifications horaires
                          </button>
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px', textAlign: 'center' }}>
                            Rappels pour 8h, 11h, 13h, 16h, 19h
                          </div>
                        </li>
                      )}
                      {/* Bouton notifications Phase 2 */}
                      {modalAliments === 2 && (
                        <li style={{ marginTop: '16px', padding: '12px', background: '#e8f5e8', borderRadius: 8 }}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotificationsActives(!notificationsActives);
                            }}
                            style={{
                              background: notificationsActives ? 'linear-gradient(135deg, #4CAF50, #66BB6A)' : 'linear-gradient(135deg, #66BB6A, #4CAF50)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 8,
                              padding: '8px 16px',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              width: '100%'
                            }}
                          >
                            {notificationsActives ? '🔕 Désactiver' : '🔔 Activer'} notifications Phase 2
                          </button>
                          <div style={{ fontSize: '0.8rem', color: '#4CAF50', marginTop: '4px', textAlign: 'center' }}>
                            Horaires fibres douces : 8h (compote+huile), 11h (bouillon), 13h/19h (purée), 16h (fruit cuit)
                          </div>
                        </li>
                      )}
                    </>
                  );
                })()}
              </ul>
            </div>
          </div>
        )}

        {/* 🔔 Notifications Phase 1 */}
        <NotificationsPhase1 
          phase={jours.length > 0 && selectedJourIdx >= 0 ? jours[selectedJourIdx]?.phase : null}
          jourNum={selectedJourIdx + 1}
          isActive={notificationsActives}
        />

        {/* 🔔 Notifications Phase 2 */}
        <NotificationsPhase2 
          phase={jours.length > 0 && selectedJourIdx >= 0 ? jours[selectedJourIdx]?.phase : null}
          jourNum={selectedJourIdx + 1}
          isActive={notificationsActives}
        />

        {/* 🔔 Notifications Phase 4 */}
        <NotificationsPhase4 
          phase={jours.length > 0 && selectedJourIdx >= 0 ? jours[selectedJourIdx]?.phase : null}
          jourNum={selectedJourIdx + 1}
          isActive={notificationsActives}
          onRecettesClick={(type) => setModalRecettesPhase4({ isOpen: true, type })}
        />

        <RecettesPhase1Modal 
          isOpen={modalRecettes.isOpen}
          recetteType={modalRecettes.type}
          onClose={() => setModalRecettes({ isOpen: false, type: 'bouillon' })}
        />
        {/* 🥘 Modal recettes détaillées Phase 2 */}

        <RecettesPhase2Modal 
          isOpen={modalRecettesPhase2.isOpen}
          recetteType={modalRecettesPhase2.type}
          onClose={() => setModalRecettesPhase2({ isOpen: false, type: 'compote' })}
        />

        <RecettesPhase4Modal 
          isOpen={modalRecettesPhase4.isOpen}
          recetteType={modalRecettesPhase4.type}
          onClose={() => setModalRecettesPhase4({ isOpen: false, type: 'patatedouce' })}
        />
          isOpen={modalRecettesPhase4.isOpen}
          recetteType={modalRecettesPhase4.type}
          onClose={() => setModalRecettesPhase4({ isOpen: false, type: 'patatedouce' })}
        />
      </main>
      
      {/* 📱 CSS RESPONSIVE */}
      <style jsx global>{`
        @media (max-width: 768px) {
          /* Bouton toggle visible */}
          .mobile-toggle-btn {
            display: block !important;
          }
          
          /* Sidebar responsive */}
          .phases-sidebar {
            position: fixed !important;
            left: -100% !important;
            top: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            margin: 0 !important;
            border-radius: 0 !important;
            transition: left 0.3s ease !important;
            z-index: 999 !important;
            padding: 4rem 1.5rem 1.5rem 1.5rem !important;
            background: #ffffff !important;
            overflow-y: auto !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
          
          .phases-sidebar.mobile-open {
            left: 0 !important;
            box-shadow: none !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          
          /* Main content sans marge */
          .main-content {
            margin: 0 !important;
            padding: 0.5rem !important;
            max-width: 100% !important;
          }
          
          /* Titre principal */
          .main-content h1 {
            font-size: 1.5rem !important;
            margin-bottom: 0.8rem !important;
          }
          
          /* Bouton actualiser mobile */
          .main-content button {
            padding: 0.5rem 0.8rem !important;
            font-size: 0.85rem !important;
          }
          
          /* Bloc contexte jeûne */
          .main-content > div[style*="linear-gradient"] {
            padding: 1rem !important;
            border-radius: 8px !important;
          }
          
          .main-content > div[style*="linear-gradient"] > div[style*="grid"] {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          
          /* Critères bloc */
          .criteres-bloc {
            padding: 0.8rem !important;
          }
          
          /* Navigation jours */
          .main-content > div > div[style*="flexWrap"] {
            gap: 6px !important;
          }
          
          .main-content > div > div[style*="flexWrap"] button {
            min-width: 32px !important;
            padding: 0.3rem 0.5rem !important;
            font-size: 0.9rem !important;
          }
        }
        
        @media (max-width: 480px) {
          /* Très petits écrans */
          .mobile-toggle-btn {
            top: 0.5rem !important;
            left: 0.5rem !important;
            padding: 0.5rem 0.8rem !important;
            font-size: 0.85rem !important;
          }
          
          .main-content h1 {
            font-size: 1.3rem !important;
          }
          
          .phases-sidebar {
            width: 90% !important;
          }
        }
      `}</style>
    </div>
  );
}
