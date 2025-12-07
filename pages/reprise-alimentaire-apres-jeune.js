import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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
          display: 'none',
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 100,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '0.6rem 1rem',
          fontWeight: 700,
          fontSize: '0.95rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(102,126,234,0.4)',
          '@media (max-width: 768px)': { display: 'block' }
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
            <span style={{fontSize:'1.25em', fontWeight:700}}>{['💧','🥬','🥚','🍚'][phase.phaseNum-1]}</span>
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
            onClick={() => onVoirAliments(phase.phaseNum)}
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
import Link from 'next/link';

export default function RepriseAlimentaireApresJeune() {
  const router = useRouter();
  const [programme, setProgramme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jours, setJours] = useState([]);
  const [dateAuj, setDateAuj] = useState(null);
  const [listeCourses, setListeCourses] = useState([]);

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
        const programmeMAJ = { ...programme, statut: 'termine', reprise_terminee_le: new Date().toISOString() };
        localStorage.setItem('programmeRepriseValide', JSON.stringify(programmeMAJ));

        setMessageValidation({ 
          type: 'success', 
          text: '🎉 Félicitations ! Tu as terminé ta reprise alimentaire. Direction la phase de consolidation !' 
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
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem'}}>
          <h1 style={{color:'#1976d2', fontWeight:900, fontSize:'2.3rem', margin:0, letterSpacing:'-1px'}}>Reprise alimentaire après jeûne</h1>
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
                Tu as terminé ta reprise alimentaire de <b>{programme.duree_reprise_jours} jours</b> avec succès ! 🌱
                <br/>
                Il est maintenant temps de consolider ces acquis.
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.7)',
                borderRadius: 8,
                padding: '1rem 1.2rem',
                marginBottom: 16,
                color: '#6d4c41',
                fontSize: '1rem',
                textAlign: 'left'
              }}>
                <div style={{fontWeight: 600, marginBottom: 8}}>📊 Ton bilan :</div>
                <div>✅ Durée du jeûne : {programme.duree_jeune_jours} jours</div>
                <div>✅ Durée de la reprise : {programme.duree_reprise_jours} jours</div>
                {programme.poids_fin_jeune && (
                  <div>✅ Poids en fin de jeûne : {programme.poids_fin_jeune} kg</div>
                )}
                <div>✅ Date de fin : {new Date(programme.date_fin_reprise).toLocaleDateString('fr-FR')}</div>
              </div>

              <Link
                href={{
                  pathname: '/consolidation-45-jours',
                  query: {
                    poids: programme.poids_fin_jeune || programme.poids_depart,
                    date_fin_reprise: programme.date_fin_reprise,
                    reprise_id: programme.id
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
                  // Récupérer les aliments de la phase
                  const aliments = require('../data/alimentsRepriseJeune').default.filter(a => a.phase === modalAliments);
                  return aliments.map((a, i) => (
                    <li key={i}>{a.nom} <span style={{color:'#888', fontSize:'0.97em'}}>{a.categorie ? `(${a.categorie})` : ''}</span></li>
                  ));
                })()}
              </ul>
            </div>
          </div>
        )}
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
            width: 85% !important;
            max-width: 320px !important;
            height: 100vh !important;
            max-height: 100vh !important;
            margin: 0 !important;
            border-radius: 0 !important;
            transition: left 0.3s ease !important;
            z-index: 999 !important;
            padding-top: 3rem !important;
          }
          
          .phases-sidebar.mobile-open {
            left: 0 !important;
            box-shadow: 4px 0 12px rgba(0,0,0,0.3) !important;
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
