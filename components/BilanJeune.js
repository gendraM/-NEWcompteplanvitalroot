import { useState } from 'react';
import { useMeditations, useVersets, useQuestions, useIntentions, useEcrits } from '../lib/useJournalSpirituel';

export default function BilanJeune({ bilan, outils, onClose, onAccederReprise, userId = null }) {
  if (!bilan) return null;

  // États pour la saisie du poids
  const [bilanActuel, setBilanActuel] = useState(bilan);
  const [poidsSaisi, setPoidsSaisi] = useState(bilanActuel.poids_final || '');
  const [messageConfirmation, setMessageConfirmation] = useState('');

  // Hooks pour données spirituelles
  const { meditations, loading: loadingMed } = useMeditations(false, null, userId);
  const { versets, loading: loadingVers } = useVersets(userId);
  const { questions, loading: loadingQuest } = useQuestions(userId);
  const { intentions, loading: loadingInt } = useIntentions(userId);
  const { ecrits, loading: loadingEcr } = useEcrits(userId);

  // Filtrer données spirituelles sur période du jeûne
  const dateDebut = bilanActuel.date_debut ? new Date(bilanActuel.date_debut) : null;
  const dateFin = bilanActuel.date_fin ? new Date(bilanActuel.date_fin) : null;

  const meditationsDuJeune = dateDebut && dateFin ? meditations.filter(m => {
    const date = new Date(m.created_at);
    return date >= dateDebut && date <= dateFin;
  }) : [];

  const versetsDuJeune = dateDebut && dateFin ? versets.filter(v => {
    const date = new Date(v.created_at);
    return date >= dateDebut && date <= dateFin;
  }) : [];

  const questionsDuJeune = dateDebut && dateFin ? questions.filter(q => {
    const date = new Date(q.created_at);
    return date >= dateDebut && date <= dateFin;
  }) : [];

  const intentionsDuJeune = dateDebut && dateFin ? intentions.filter(i => {
    const date = new Date(i.created_at);
    return date >= dateDebut && date <= dateFin;
  }) : [];

  const ecritsDuJeune = dateDebut && dateFin ? ecrits.filter(e => {
    const date = new Date(e.created_at);
    return date >= dateDebut && date <= dateFin;
  }) : [];

  const intentionsCompletes = intentionsDuJeune.filter(i => i.completee).length;
  const totalActivitesSpirituel = meditationsDuJeune.length + versetsDuJeune.length + 
                                   questionsDuJeune.length + intentionsDuJeune.length + ecritsDuJeune.length;

  const sauvegarderPoids = () => {
    const poids = parseFloat(poidsSaisi);
    
    // Validation
    if (!poids || poids < 30 || poids > 300) {
      alert('⚠️ Veuillez saisir un poids valide entre 30 et 300 kg');
      return;
    }
    
    if (bilanActuel.poids_initial && poids > bilanActuel.poids_initial) {
      if (!confirm('⚠️ Le poids saisi est supérieur au poids de départ. C\'est peut-être de la rétention d\'eau. Continuer ?')) {
        return;
      }
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem(`poids_jour_${bilanActuel.duree_reelle}`, poids);
    
    // Recalculer le bilan
    const pertePoids = bilanActuel.poids_initial ? bilanActuel.poids_initial - poids : null;
    const nouveauBilan = {
      ...bilanActuel,
      poids_final: poids,
      perte_poids: pertePoids
    };
    
    // Sauvegarder le bilan complet
    localStorage.setItem('bilanJeune', JSON.stringify(nouveauBilan));
    
    setBilanActuel(nouveauBilan);
    setMessageConfirmation('✅ Poids enregistré !');
    setTimeout(() => setMessageConfirmation(''), 3000);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, overflowY: 'auto'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32,
        maxWidth: 700, width: '100%', maxHeight: '90vh',
        overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <h2 style={{ margin: 0, color: '#388e3c', fontSize: 24 }}>
            Bravo, ton jeûne est terminé !
          </h2>
          <p style={{ color: '#666', marginTop: 8 }}>Voici le bilan de ton parcours</p>
        </div>

        {/* Formulaire saisie poids (optionnel) */}
        {bilanActuel.poids_initial && (
          <div style={{
            background: bilanActuel.poids_final ? '#e8f5e9' : '#fff9c4',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            border: `1px solid ${bilanActuel.poids_final ? '#a5d6a7' : '#fff176'}`
          }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              ⚖️ {bilanActuel.poids_final ? 'Ton poids final' : 'Renseigne ton poids actuel (optionnel)'}
            </div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
              {bilanActuel.poids_final 
                ? 'Poids enregistré avec succès'
                : 'Cela me permettra de calculer ta perte de poids exacte'}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14 }}>
                Poids de départ : <b>{bilanActuel.poids_initial} kg</b>
              </span>
              <span style={{ fontSize: 18, color: '#999' }}>→</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  placeholder="Ex: 97.5"
                  value={poidsSaisi}
                  onChange={(e) => setPoidsSaisi(e.target.value)}
                  style={{
                    width: 90,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #ccc',
                    fontSize: 14
                  }}
                />
                <span style={{ fontSize: 14 }}>kg</span>
                <button
                  onClick={sauvegarderPoids}
                  style={{
                    background: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  💾 Enregistrer
                </button>
              </div>
              {messageConfirmation && (
                <span style={{ color: '#388e3c', fontSize: 14, fontWeight: 600 }}>
                  {messageConfirmation}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Statistiques principales */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16, marginBottom: 24
        }}>
          <div style={{ background: '#e3f2fd', borderRadius: 12, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#1976d2' }}>{bilanActuel.duree_reelle}</div>
            <div style={{ fontSize: 13, color: '#666' }}>jours de jeûne</div>
          </div>
          <div style={{ background: '#f3e5f5', borderRadius: 12, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#7b1fa2' }}>{bilanActuel.taux_completion}%</div>
            <div style={{ fontSize: 13, color: '#666' }}>de complétion</div>
          </div>
          {bilanActuel.perte_poids !== null && (
            <div style={{ background: '#e8f5e9', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#388e3c' }}>
                -{bilanActuel.perte_poids.toFixed(1)} kg
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>perte de poids</div>
            </div>
          )}
          <div style={{ background: '#fff3e0', borderRadius: 12, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#f57c00' }}>{Object.keys(outils).length}</div>
            <div style={{ fontSize: 13, color: '#666' }}>outils mobilisés</div>
          </div>
        </div>

        {/* Détails poids */}
        {bilanActuel.poids_initial && bilanActuel.poids_final && (
          <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>⚖️ Évolution du poids</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span>Départ : <b>{bilanActuel.poids_initial} kg</b></span>
              <span>Actuel : <b>{bilanActuel.poids_final} kg</b></span>
            </div>
          </div>
        )}

        {/* Comparaison estimation vs réel */}
        {bilanActuel.poids_initial && bilanActuel.perte_poids !== null && (() => {
          // Calcul estimation (formule : 0.4 kg/jour en moyenne)
          const estimationPerte = bilanActuel.duree_reelle * 0.4;
          const difference = estimationPerte - bilanActuel.perte_poids;
          const pourcentageRealisation = Math.round((bilanActuel.perte_poids / estimationPerte) * 100);
          
          return (
            <div style={{
              background: 'linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 100%)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              border: '1px solid #b39ddb'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: '#5e35b1' }}>
                📊 Perte réelle vs estimation
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
                marginBottom: 12
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Estimation</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#5c6bc0' }}>
                    -{estimationPerte.toFixed(1)} kg
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Réelle</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#388e3c' }}>
                    -{bilanActuel.perte_poids.toFixed(1)} kg
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Performance</div>
                  <div style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: pourcentageRealisation >= 100 ? '#388e3c' : '#f57c00'
                  }}>
                    {pourcentageRealisation}%
                  </div>
                </div>
              </div>
              <div style={{
                background: 'white',
                borderRadius: 8,
                padding: 10,
                fontSize: 13,
                color: '#666'
              }}>
                {pourcentageRealisation >= 120 ? (
                  <>🔥 <b>Excellent !</b> Perte bien supérieure à l'estimation moyenne.</>
                ) : pourcentageRealisation >= 100 ? (
                  <>🎯 <b>Parfait !</b> Résultat conforme ou supérieur à l'estimation.</>
                ) : pourcentageRealisation >= 80 ? (
                  <>💪 <b>Très bien !</b> Résultat proche de l'estimation, c'est une réussite.</>
                ) : (
                  <>✨ <b>C'est déjà bien !</b> Chaque perte est une victoire. Continue ainsi.</>
                )}
              </div>
            </div>
          );
        })()}

        {/* Outils populaires */}
        {bilanActuel.outils_populaires.length > 0 && (
          <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>🧰 Tes outils préférés</div>
            {bilanActuel.outils_populaires.map((outil, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                    borderBottom: i < bilanActuel.outils_populaires.length - 1 ? '1px solid #e0e0e0' : 'none'
              }}>
                <span>{outil.nom}</span>
                <span style={{ color: '#1976d2', fontWeight: 600 }}>{outil.count} fois</span>
              </div>
            ))}
          </div>
        )}

        {/* === PHASE 3 : Historique multi-jeûnes === */}
        {(() => {
          // Récupérer l'historique depuis localStorage
          let historique = [];
          try {
            if (typeof window !== 'undefined') {
              const historiqueStr = localStorage.getItem('historiqueBilansJeune');
              if (historiqueStr) {
                historique = JSON.parse(historiqueStr);
                // Filtrer le bilan actuel pour ne pas le dupliquer
                historique = historique.filter(b => b.date_fin !== bilanActuel.date_fin);
                // Trier du plus récent au plus ancien
                historique.sort((a, b) => new Date(b.date_fin) - new Date(a.date_fin));
                // Limiter aux 5 derniers
                historique = historique.slice(0, 5);
              }
            }
          } catch (e) {
            console.error('❌ Erreur lecture historique:', e);
          }

          // N'afficher que si historique non vide
          if (historique.length === 0) return null;

          return (
            <details style={{
              background: 'linear-gradient(135deg, #fff9c4 0%, #fff3e0 100%)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              border: '1px solid #ffb74d',
              cursor: 'pointer'
            }}>
              <summary style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
                📚 Historique de mes jeûnes ({historique.length} précédent{historique.length > 1 ? 's' : ''})
              </summary>
              <div style={{ marginTop: 12 }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 14
                }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ff9800' }}>
                      <th style={{ padding: '8px 4px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '8px 4px', textAlign: 'center' }}>Durée</th>
                      <th style={{ padding: '8px 4px', textAlign: 'center' }}>Taux</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>Perte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historique.map((ancien, idx) => (
                      <tr key={idx} style={{
                        borderBottom: idx < historique.length - 1 ? '1px solid #ffe0b2' : 'none'
                      }}>
                        <td style={{ padding: '8px 4px' }}>
                          {(() => {
                            try {
                              const date = new Date(ancien.date_fin);
                              return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
                            } catch {
                              return ancien.date_fin;
                            }
                          })()}
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 600 }}>
                          {ancien.duree_reelle} j
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                          <span style={{
                            color: ancien.taux_completion >= 80 ? '#2e7d32' : '#f57c00',
                            fontWeight: 600
                          }}>
                            {ancien.taux_completion}%
                          </span>
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600 }}>
                          {ancien.perte_poids !== null
                            ? `-${ancien.perte_poids.toFixed(1)} kg`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{
                  marginTop: 12,
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.6)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#795548'
                }}>
                  💡 <strong>Astuce :</strong> Analyse ton évolution ! Regarde si tes taux de complétion s'améliorent et si tu perds plus régulièrement.
                </div>
              </div>
            </details>
          );
        })()}

        {/* === Bilan Spirituel === */}
        {totalActivitesSpirituel > 0 && (
          <details style={{
            background: 'linear-gradient(135deg, #e1f5fe 0%, #f3e5f5 100%)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            border: '1px solid #81d4fa',
            cursor: 'pointer'
          }}>
            <summary style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
              📿 Bilan Spirituel ({totalActivitesSpirituel} activité{totalActivitesSpirituel > 1 ? 's' : ''})
            </summary>
            <div style={{ marginTop: 12 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                marginBottom: 12
              }}>
                {meditationsDuJeune.length > 0 && (
                  <div style={{
                    background: 'white',
                    borderRadius: 8,
                    padding: 12,
                    border: '1px solid #b39ddb'
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>🧘</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#673ab7' }}>
                      {meditationsDuJeune.length}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      méditation{meditationsDuJeune.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {versetsDuJeune.length > 0 && (
                  <div style={{
                    background: 'white',
                    borderRadius: 8,
                    padding: 12,
                    border: '1px solid #81c784'
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>📖</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#388e3c' }}>
                      {versetsDuJeune.length}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      verset{versetsDuJeune.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {questionsDuJeune.length > 0 && (
                  <div style={{
                    background: 'white',
                    borderRadius: 8,
                    padding: 12,
                    border: '1px solid #90caf9'
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>💭</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1976d2' }}>
                      {questionsDuJeune.length}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      question{questionsDuJeune.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {intentionsDuJeune.length > 0 && (
                  <div style={{
                    background: 'white',
                    borderRadius: 8,
                    padding: 12,
                    border: '1px solid #ffb74d'
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>🎯</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#f57c00' }}>
                      {intentionsCompletes}/{intentionsDuJeune.length}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      intention{intentionsDuJeune.length > 1 ? 's' : ''} accomplie{intentionsCompletes > 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {ecritsDuJeune.length > 0 && (
                  <div style={{
                    background: 'white',
                    borderRadius: 8,
                    padding: 12,
                    border: '1px solid #ce93d8'
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>✍️</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#8e24aa' }}>
                      {ecritsDuJeune.length}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      écrit{ecritsDuJeune.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                marginTop: 12,
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.7)',
                borderRadius: 8,
                fontSize: 13,
                color: '#555'
              }}>
                💡 <strong>Félicitations !</strong> Tu as nourri ton esprit pendant ce jeûne. Ces pratiques spirituelles sont un trésor à conserver.
              </div>
            </div>
          </details>
        )}

        {/* Message personnel */}
        {bilanActuel.message_personnel && (
          <div style={{
            background: '#f3e5f5', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #ce93d8'
          }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>💌 Ton message à toi-même</div>
                <div style={{ fontStyle: 'italic', color: '#7b1fa2' }}>"{bilanActuel.message_personnel}"</div>
          </div>
        )}

        {/* Conseils selon performance */}
        <div style={{
            background: bilanActuel.taux_completion === 100 ? '#e8f5e9' : '#fff3e0',
          borderRadius: 12, padding: 16, marginBottom: 24
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
              {bilanActuel.taux_completion === 100 ? '🌟 Félicitations !' : '💡 Conseil'}
          </div>
          <div style={{ fontSize: 14 }}>
            {bilanActuel.taux_completion === 100 ? (
              <>Tu as validé tous les jours de ton jeûne ! C'est une réussite totale. 
              La phase de reprise alimentaire est cruciale : suis scrupuleusement le programme pour préserver les bénéfices de ton jeûne.</>
            ) : bilanActuel.taux_completion >= 80 ? (
              <>Très bon parcours ! Quelques jours manquants mais l'essentiel est accompli. 
              Continue avec rigueur pendant la reprise.</>
            ) : (
              <>Tu as fait de ton mieux. Pour le prochain jeûne, essaie de valider chaque jour 
              pour suivre ta progression et rester motivé(e).</>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            style={{
              flex: 1, background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
              color: 'white', border: 'none', borderRadius: 8,
              padding: '14px 24px', fontWeight: 600, fontSize: 16,
              cursor: 'pointer', minWidth: 200
            }}
            onClick={onAccederReprise}
          >
            🍽️ Accéder à ma reprise alimentaire
          </button>
          <button
            style={{
              background: '#e0e0e0', color: '#333', border: 'none',
              borderRadius: 8, padding: '14px 24px', fontWeight: 600,
              fontSize: 16, cursor: 'pointer'
            }}
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
