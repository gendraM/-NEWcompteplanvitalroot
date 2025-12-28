import React, { useState } from 'react';

export default function HistoriqueReprisesModal({ historiqueReprises, onFermer, onConsulter }) {
  const [repriseSelectionnee, setRepriseSelectionnee] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [repriseToDelete, setRepriseToDelete] = useState(null);

  // Formatage date
  const formaterDate = (dateStr) => {
    if (!dateStr) return 'Date inconnue';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Suppression reprise
  const supprimerReprise = (id) => {
    const historiqueActuel = JSON.parse(localStorage.getItem('historiqueReprises') || '[]');
    const historiqueFiltre = historiqueActuel.filter(r => r.id !== id);
    localStorage.setItem('historiqueReprises', JSON.stringify(historiqueFiltre));
    
    // Recharger la liste
    window.location.reload();
  };

  if (!historiqueReprises || historiqueReprises.length === 0) {
    return (
      <div
        onClick={onFermer}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 32,
            maxWidth: 600,
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ textAlign: 'center', color: '#999' }}>
            <p>Aucune reprise archivée pour le moment</p>
          </div>
          <button
            onClick={onFermer}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: 16,
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onFermer}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 24,
          maxWidth: 700,
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>📊 Mes reprises archivées</h2>
          <button
            onClick={onFermer}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {repriseSelectionnee ? (
          // Détail d'une reprise
          <div>
            <button
              onClick={() => setRepriseSelectionnee(null)}
              style={{
                marginBottom: 16,
                padding: '8px 12px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              ⬅️ Retour à la liste
            </button>

            <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <h3 style={{ marginTop: 0, marginBottom: 12, color: '#333', display: 'flex', alignItems: 'center', gap: 8 }}>
                🍽️ Reprise du {formaterDate(repriseSelectionnee.dateDebut)}
                {repriseSelectionnee.bilan?.reprise_reussie && (
                  <span style={{
                    background: '#43a047',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    ✅ RÉUSSIE
                  </span>
                )}
                {repriseSelectionnee.bilan && !repriseSelectionnee.bilan.reprise_reussie && (
                  <span style={{
                    background: '#ff9800',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    ⚠️ À AMÉLIORER
                  </span>
                )}
              </h3>

              <div style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
                <p style={{ margin: '6px 0' }}><strong>📅 Durée :</strong> {repriseSelectionnee.duree} jours</p>
                <p style={{ margin: '6px 0' }}><strong>📆 Début :</strong> {formaterDate(repriseSelectionnee.dateDebut)}</p>
                <p style={{ margin: '6px 0' }}><strong>🏁 Fin :</strong> {formaterDate(repriseSelectionnee.dateFin)}</p>
              </div>

              {/* PROGRESSION VISUELLE */}
              {repriseSelectionnee.duree > 0 && (
                <div style={{ marginTop: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>Progression</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1976d2' }}>
                      {repriseSelectionnee.joursValides?.length || 0} / {repriseSelectionnee.duree} jours ({Math.round(((repriseSelectionnee.joursValides?.length || 0) / repriseSelectionnee.duree) * 100)}%)
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '10px',
                    background: '#e0e0e0',
                    borderRadius: '5px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.round(((repriseSelectionnee.joursValides?.length || 0) / repriseSelectionnee.duree) * 100)}%`,
                      height: '100%',
                      background: repriseSelectionnee.bilan?.reprise_reussie 
                        ? 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)'
                        : 'linear-gradient(90deg, #ffb74d 0%, #ff9800 100%)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )}

              {/* TAUX CONFORMITÉ ET VALIDATION */}
              {repriseSelectionnee.bilan && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: 12, 
                  marginBottom: 16,
                  padding: '12px',
                  background: '#fff',
                  borderRadius: 6,
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 6 }}>Conformité alimentaire</div>
                    <div style={{ 
                      fontSize: 24, 
                      fontWeight: 700, 
                      color: repriseSelectionnee.bilan.taux_conformite_alimentaire >= 70 ? '#43a047' : '#ff9800'
                    }}>
                      {repriseSelectionnee.bilan.taux_conformite_alimentaire || 0}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 6 }}>Validation des jours</div>
                    <div style={{ 
                      fontSize: 24, 
                      fontWeight: 700, 
                      color: repriseSelectionnee.bilan.taux_validation_jours >= 80 ? '#43a047' : '#ff9800'
                    }}>
                      {repriseSelectionnee.bilan.taux_validation_jours || 0}%
                    </div>
                  </div>
                </div>
              )}

              {/* BILAN PAR PHASE */}
              {repriseSelectionnee.bilan && (
                <div style={{ marginBottom: 16, background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e0e0e0' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#333' }}>📊 Bilan par phase</div>
                  <div style={{ fontSize: 12, color: '#666', lineHeight: 1.8 }}>
                    {repriseSelectionnee.bilan.phase_1 && <p style={{ margin: 4 }}>• <strong>Phase 1:</strong> {repriseSelectionnee.bilan.phase_1.jours} jours</p>}
                    {repriseSelectionnee.bilan.phase_2 && <p style={{ margin: 4 }}>• <strong>Phase 2:</strong> {repriseSelectionnee.bilan.phase_2.jours} jours</p>}
                    {repriseSelectionnee.bilan.phase_3 && <p style={{ margin: 4 }}>• <strong>Phase 3:</strong> {repriseSelectionnee.bilan.phase_3.jours} jours</p>}
                    {repriseSelectionnee.bilan.phase_4 && <p style={{ margin: 4 }}>• <strong>Phase 4:</strong> {repriseSelectionnee.bilan.phase_4.jours} jours</p>}
                    {repriseSelectionnee.bilan.phase_5 && <p style={{ margin: 4 }}>• <strong>Phase 5:</strong> {repriseSelectionnee.bilan.phase_5.jours} jours</p>}
                  </div>
                </div>
              )}

              {/* DÉTAIL REPAS */}
              {repriseSelectionnee.repasConsommes && repriseSelectionnee.repasConsommes.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#333' }}>
                    🍴 Repas enregistrés: <strong>{repriseSelectionnee.repasConsommes.length}</strong>
                  </div>
                  <div style={{
                    maxHeight: 180,
                    overflowY: 'auto',
                    background: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 6,
                    padding: 8
                  }}>
                    {repriseSelectionnee.repasConsommes.map((repas, idx) => (
                      <div key={idx} style={{ fontSize: 11, padding: 6, borderBottom: idx < repriseSelectionnee.repasConsommes.length - 1 ? '1px solid #f0f0f0' : 'none', color: '#555' }}>
                        <strong>J{repas.jour_numero || '?'}</strong> • {repas.nom_repas || 'Sans nom'} • {new Date(repas.horodatage).toLocaleDateString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RÉSUMÉ BILAN */}
              {repriseSelectionnee.bilan && (
                <div style={{ marginBottom: 16, background: '#f0f4f8', padding: 12, borderRadius: 6, border: '1px solid #b3d9ff' }}>
                  <div style={{ fontSize: 12, color: '#333', lineHeight: 1.8 }}>
                    {repriseSelectionnee.bilan.total_repas_acceptes !== undefined && (
                      <p style={{ margin: 4 }}>
                        <strong>✅ Repas acceptés:</strong> {repriseSelectionnee.bilan.total_repas_acceptes}
                      </p>
                    )}
                    {repriseSelectionnee.bilan.ecarts_consommes !== undefined && (
                      <p style={{ margin: 4 }}>
                        <strong>⚠️ Écarts consommés:</strong> {repriseSelectionnee.bilan.ecarts_consommes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <p style={{ fontSize: 11, color: '#999', margin: '12px 0 0 0', paddingTop: 8, borderTop: '1px solid #e0e0e0' }}>
                Archivée le {new Date(repriseSelectionnee.dateArchivage).toLocaleDateString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* ACTIONS */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button
                onClick={() => {
                  setShowConfirmDelete(true);
                  setRepriseToDelete(repriseSelectionnee.id);
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#ffebee',
                  color: '#f44336',
                  border: '1px solid #f44336',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f44336';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#ffebee';
                  e.target.style.color = '#f44336';
                }}
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ) : (
          // Liste des reprises
          <div>
            {historiqueReprises.map((reprise, index) => (
              <div
                key={reprise.id || index}
                style={{
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  padding: 14,
                  marginBottom: 10,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #efefef 0%, #f5f5f5 100%)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => setRepriseSelectionnee(reprise)}
              >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>🍽️</span>
                      <div style={{ fontWeight: 600, fontSize: 15, color: '#333' }}>
                        Reprise {reprise.duree}j du {formaterDate(reprise.dateDebut)}
                      </div>
                      {reprise.bilan?.reprise_reussie && (
                        <span style={{
                          background: '#43a047',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          ✅
                        </span>
                      )}
                      {reprise.bilan && !reprise.bilan.reprise_reussie && (
                        <span style={{
                          background: '#ff9800',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          ⚠️
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
                      Du {formaterDate(reprise.dateDebut)} au {formaterDate(reprise.dateFin)}
                    </div>
                    
                    {/* Mini barre progression */}
                    {reprise.duree > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                          <span style={{ color: '#666' }}>Progression</span>
                          <span style={{ fontWeight: 600, color: '#1976d2' }}>
                            {reprise.joursValides?.length || 0}/{reprise.duree}
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '6px',
                          background: '#e0e0e0',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.round(((reprise.joursValides?.length || 0) / reprise.duree) * 100)}%`,
                            height: '100%',
                            background: reprise.bilan?.reprise_reussie 
                              ? 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)'
                              : 'linear-gradient(90deg, #ffb74d 0%, #ff9800 100%)',
                          }} />
                        </div>
                      </div>
                    )}

                    {/* Résumé taux */}
                    {reprise.bilan && (
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#666' }}>
                        <span>📊 Conf: <strong style={{ color: reprise.bilan.taux_conformite_alimentaire >= 70 ? '#43a047' : '#ff9800' }}>{reprise.bilan.taux_conformite_alimentaire || 0}%</strong></span>
                        <span>✔️ Val: <strong style={{ color: reprise.bilan.taux_validation_jours >= 80 ? '#43a047' : '#ff9800' }}>{reprise.bilan.taux_validation_jours || 0}%</strong></span>
                        <span>🍴 Repas: <strong>{reprise.repasConsommes?.length || 0}</strong></span>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 18, marginLeft: 12, color: '#999' }}>→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onFermer}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: 16,
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Fermer
        </button>

        {/* Modal confirmation suppression */}
        {showConfirmDelete && (
          <div
            onClick={() => setShowConfirmDelete(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 24,
                maxWidth: 400,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 16, color: '#f44336', fontSize: 18 }}>
                ⚠️ Confirmer la suppression
              </h3>
              <p style={{ color: '#666', marginBottom: 24, lineHeight: 1.5 }}>
                Êtes-vous sûr de vouloir supprimer cette reprise archivée de l'historique ? Cette action est irréversible.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#e0e0e0'}
                  onMouseLeave={(e) => e.target.style.background = '#f0f0f0'}
                >
                  ✕ Annuler
                </button>
                <button
                  onClick={() => {
                    supprimerReprise(repriseToDelete);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#d32f2f'}
                  onMouseLeave={(e) => e.target.style.background = '#f44336'}
                >
                  🗑️ Supprimer définitivement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
