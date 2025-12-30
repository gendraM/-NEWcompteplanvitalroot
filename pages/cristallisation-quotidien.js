    // === DÉFIS PERSONNALISÉS : sélection ===
  // === HANDLER SÉLECTION DÉFI COMPORTEMENTAL ===
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

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { CRITERES_CRISTALLISATION } from '../data/referentiel';
import { analyserCriteresAutomatiques } from '../lib/analyseRepas3Jours';

export default function CristallisationQuotidien() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  // === PROGRAMME ===
  const [dateDebut, setDateDebut] = useState(null);
  const [jourActuel, setJourActuel] = useState(1);
  const [totalJours] = useState(45);
  const [jourAffiche, setJourAffiche] = useState(1);
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
  const [defisPersonnalises, setDefisPersonnalises] = useState([]);
  const [defiSelectionne, setDefiSelectionne] = useState(null);
  const [journalDefi, setJournalDefi] = useState({});
  // === BADGES ===
  const [badgesObtenus, setBadgesObtenus] = useState([]);
  const [badgeJustUnlocked, setBadgeJustUnlocked] = useState(null);

  // === CLIENT DETECTION ===
  useEffect(() => {
    setIsClient(true);
  }, []);

  // === LOGIQUE DE CHARGEMENT DES DÉFIS PERSONNALISÉS ET BADGES ===
  useEffect(() => {
    if (!isClient || !jourAffiche) return;
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
      // Support mode test comme dans cristallisation.js
      const modeTest = localStorage.getItem('TEST_context') === 'cristallisation';
      const cleProgr = modeTest ? 'TEST_programmeCristallisation' : 'programmeCristallisation';
      const programmeStr = localStorage.getItem(cleProgr);
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
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 12,
        padding: '20px',
        color: '#fff',
        marginBottom: 20,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <button
          onClick={() => router.push('/cristallisation')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 16
          }}
        >
          ← Retour tableau de bord
        </button>

        <h1 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 700 }}>📅 Suivi Quotidien</h1>
        <div style={{ fontSize: 14, opacity: 0.95 }}>
          Phase Cristallisation • Jour {jourActuel}/45
        </div>
      </div>

      {/* NAVIGATION JOUR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        border: '2px solid #e0e0e0',
        borderRadius: 12,
        padding: '16px',
        marginBottom: 20
      }}>
        <button
          onClick={jourPrecedent}
          disabled={jourAffiche === 1}
          style={{
            background: jourAffiche === 1 ? '#f5f5f5' : '#1976d2',
            color: jourAffiche === 1 ? '#ccc' : '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 16px',
            fontSize: 16,
            fontWeight: 600,
            cursor: jourAffiche === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          ← Jour {jourAffiche - 1}
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            {getEmojiScore(getScoreJour())} Jour {jourAffiche}
          </div>
          <div style={{ fontSize: 13, color: '#666' }}>
            {dateAffichee && new Date(dateAffichee).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          {jourEstFutur && (
            <div style={{ fontSize: 12, color: '#ff9800', marginTop: 4, fontWeight: 600 }}>
              🔒 À venir
            </div>
          )}
        </div>

        <button
          onClick={jourSuivant}
          disabled={jourAffiche >= jourActuel || jourAffiche >= totalJours}
          style={{
            background: (jourAffiche >= jourActuel || jourAffiche >= totalJours) ? '#f5f5f5' : '#1976d2',
            color: (jourAffiche >= jourActuel || jourAffiche >= totalJours) ? '#ccc' : '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 16px',
            fontSize: 16,
            fontWeight: 600,
            cursor: (jourAffiche >= jourActuel || jourAffiche >= totalJours) ? 'not-allowed' : 'pointer'
          }}
        >
          Jour {jourAffiche + 1} →
        </button>
      </div>

      {/* FEEDBACK JOUR */}
      {!jourEstFutur && (
        <div style={{
          background: feedback.color + '15',
          border: `2px solid ${feedback.color}`,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: feedback.color, marginBottom: 8 }}>
            {feedback.message}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>
            Score : {getScoreJour()}/5 critères validés
          </div>
        </div>
      )}

      {/* CONSEIL NEXT MEAL */}
      {jourEstActuel && (
        <div style={{
          background: '#e3f2fd',
          border: '2px solid #1976d2',
          borderRadius: 12,
          padding: 16,
          marginBottom: 20
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1976d2', marginBottom: 8 }}>
            💡 Conseil NEXT meal
          </div>
          <div style={{ fontSize: 14, color: '#333' }}>
            {getConseilNextMeal()}
          </div>
        </div>
      )}

      {/* CRITÈRES DU JOUR */}
      <div style={{
        background: '#fff',
        border: '2px solid #e0e0e0',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#333' }}>
          ✅ Critères du jour
        </h2>
        {/* Affichage des défis comportementaux du jour (protégé SSR/hydratation) */}
        {isClient && !chargement && defisPersonnalises && defisPersonnalises.length > 0 && !jourEstFutur && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, color: '#1976d2', marginBottom: 8 }}>🎯 Défis comportementaux du jour</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {defisPersonnalises.map((defi) => (
                <div
                  key={defi.id}
                  onClick={() => handleSelectDefi(defi)}
                  style={{
                    background: '#e3f2fd',
                    border: '2px solid #1976d2',
                    borderRadius: 8,
                    padding: 14,
                    cursor: 'pointer',
                    marginBottom: 4,
                    boxShadow: '0 2px 6px rgba(25, 118, 210, 0.08)'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#1976d2' }}>{defi.titre || defi.nom || `Défi ${defi.id}`}</div>
                  {defi.description && (
                    <div style={{ fontSize: 13, color: '#333', marginTop: 4 }}>{defi.description}</div>
                  )}
                  {/* Affichage du statut de validation */}
                  <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
                    Statut : {journalDefi[defi.id] ? '✅ Validé' : '⏳ À faire'}
                  </div>
                </div>
              ))}
            </div>
            {/* Bloc détail du défi sélectionné */}
            {defiSelectionne && (
              <div style={{
                marginTop: 16,
                background: '#fff',
                border: '2px solid #1976d2',
                borderRadius: 10,
                padding: 18,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)'
              }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1976d2', marginBottom: 6 }}>
                  {defiSelectionne.titre || defiSelectionne.nom || `Défi ${defiSelectionne.id}`}
                </div>
                {defiSelectionne.description && (
                  <div style={{ fontSize: 14, color: '#333', marginBottom: 10 }}>{defiSelectionne.description}</div>
                )}
                <div style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>
                  Statut : {journalDefi[defiSelectionne.id] ? '✅ Validé' : '⏳ À faire'}
                </div>
                {!journalDefi[defiSelectionne.id] && (
                  <button
                    onClick={() => handleValiderDefi(defiSelectionne.id, 'valide')}
                    style={{
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 18px',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginRight: 10
                    }}
                  >
                    ✓ Valider ce défi
                  </button>
                )}
                <button
                  onClick={() => setDefiSelectionne(null)}
                  style={{
                    background: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 18px',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        )}
        {jourEstFutur ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 16 }}>
              Ce jour n'est pas encore accessible
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {criteresJour.map((critere) => {
              const estValide = validationJour[critere.id] || false;
              return (
                <div
                  key={critere.id}
                  onClick={() => toggleCritere(critere.id)}
                  style={{
                    background: estValide ? '#e8f5e9' : '#f5f5f5',
                    border: `2px solid ${estValide ? '#4caf50' : '#e0e0e0'}`,
                    borderRadius: 8,
                    padding: 16,
                    cursor: jourEstActuel ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12
                  }}
                >
                  <div style={{ fontSize: 24, minWidth: 32, transition: 'transform 0.2s', transform: estValide ? 'scale(1.2)' : 'scale(1)' }}>
                    {estValide ? '✅' : '⬜'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4 }}>
                      {critere.titre || critere.nom || `Critère ${critere.id}`}
                    </div>
                    {critere.description && (
                      <div style={{ fontSize: 13, color: '#666' }}>
                        {critere.description}
                      </div>
                    )}
                    {/* === NOUVEAU (P2) : SUGGESTION AUTO-VALIDATION === */}
                    {suggestionsCriteres[critere.id]?.suggere && !estValide && jourEstActuel && (
                      <div style={{
                        marginTop: 12,
                        padding: 12,
                        background: 'linear-gradient(135deg, #fff9c4 0%, #fff59d 100%)',
                        border: '2px solid #fbc02d',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                      }}>
                        <div style={{ fontSize: 20 }}>💡</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#f57f17', marginBottom: 4 }}>
                            Suggéré validé
                          </div>
                          <div style={{ fontSize: 12, color: '#666' }}>
                            {suggestionsCriteres[critere.id].raison}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              accepterSuggestion(critere.id);
                            }}
                            style={{
                              background: '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 12px',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            ✓ Accepter
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              refuserSuggestion(critere.id);
                            }}
                            style={{
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 12px',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            ✗ Refuser
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* WIDGET SAISIE REPAS */}
      {jourEstActuel && (
        <div style={{
          background: '#fff',
          border: '2px solid #e0e0e0',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 18, color: '#333' }}>
            🍽️ Mes repas aujourd'hui
          </h2>
          {repasDuJour.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              Aucun repas enregistré aujourd'hui
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              {repasDuJour.map((repas, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f5f5f5',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>{repas.heure}</span> - {repas.aliment}
                  </div>
                  <div style={{
                    fontSize: 12,
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: repas.est_extra ? '#ffebee' : '#e8f5e9',
                    color: repas.est_extra ? '#c62828' : '#2e7d32',
                    fontWeight: 600
                  }}>
                    {repas.est_extra ? '🔴 Extra' : '🟢 Conforme'}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => router.push('/suivi')}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%'
            }}
          >
            ➕ Ajouter un repas
          </button>
        </div>
      )}

      {/* MESSAGE CONSTRUCTION */}
      <div style={{
        background: '#fff3cd',
        border: '2px solid #ffc107',
        borderRadius: 12,
        padding: 16,
        textAlign: 'center',
        fontSize: 14
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🚧</div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          Section en construction
        </div>
        <div style={{ color: '#666' }}>
          Prochainement : liste de courses intelligente, conseils personnalisés, graphiques progression
        </div>
      </div>
    </div>
  );
}
