import { useState } from 'react';
import CartePreparationJeune from './CartePreparationJeune';

import { supprimerPreparationHistorique } from '../lib/preparationsJeune';

export default function HistoriquePreparationsModal({
  historiquePreparations = [],
  preparationsSupprimees = [],
  onRestaurer,
  onSupprimerDefinitivement,
  onFermer
}) {
    // Suppression d'une préparation (soft delete)
    const handleSupprimer = (id) => {
      supprimerPreparationHistorique(id);
      // Rafraîchir les listes
      if (ongletActif === 'historique') {
        setPrepaDetail(null);
      }
      // On force le parent à recharger via onFermer puis réouverture, ou on peut lever un event custom si besoin
      window.location.reload(); // Solution simple pour garantir la synchro UI/LS
    };
  const [ongletActif, setOngletActif] = useState('historique');
  const [preparationASupprimer, setPreparationASupprimer] = useState(null);
  const [showModalConfirmation, setShowModalConfirmation] = useState(false);
  const [typeSuppression, setTypeSuppression] = useState('soft');
  const [pageActuelle, setPageActuelle] = useState(1);
  const PREPAS_PAR_PAGE = 15;
  const [prepaDetail, setPrepaDetail] = useState(null);

  const formaterDate = (dateStr) => {
    if (!dateStr) return 'Date inconnue';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const prepasAffichees = ongletActif === 'historique' ? historiquePreparations : preparationsSupprimees;
  const totalPages = Math.ceil(prepasAffichees.length / PREPAS_PAR_PAGE);
  const indexDebut = (pageActuelle - 1) * PREPAS_PAR_PAGE;
  const indexFin = indexDebut + PREPAS_PAR_PAGE;
  const prepasPaginees = prepasAffichees.slice(indexDebut, indexFin);

  const demanderSuppression = (prepa, type = 'hard') => {
    setPreparationASupprimer(prepa);
    setTypeSuppression(type);
    setShowModalConfirmation(true);
  };

  const confirmerSuppression = () => {
    if (!preparationASupprimer) return;
    onSupprimerDefinitivement(preparationASupprimer.id);
    setShowModalConfirmation(false);
    setPreparationASupprimer(null);
  };

  const annulerSuppression = () => {
    setShowModalConfirmation(false);
    setPreparationASupprimer(null);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onFermer();
    }
  };

  return (
    <>
      <div
        onClick={handleOverlayClick}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px'
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '2px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #4F8FFF 0%, #43D9A3 100%)'
            }}
          >
            <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', fontWeight: '600' }}>
              📚 Mes préparations au jeûne
            </h2>
            <button
              onClick={onFermer}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                fontSize: '28px',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              ✕
            </button>
          </div>

          {/* Onglets */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', background: '#f5f5f5' }}>
            <button
              onClick={() => {
                setOngletActif('historique');
                setPageActuelle(1);
              }}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                background: ongletActif === 'historique' ? '#fff' : 'transparent',
                color: ongletActif === 'historique' ? '#4F8FFF' : '#666',
                fontWeight: ongletActif === 'historique' ? '600' : '400',
                fontSize: '16px',
                cursor: 'pointer',
                borderBottom: ongletActif === 'historique' ? '3px solid #4F8FFF' : '3px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              📖 Historique ({historiquePreparations.length})
            </button>
            <button
              onClick={() => {
                setOngletActif('corbeille');
                setPageActuelle(1);
              }}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                background: ongletActif === 'corbeille' ? '#fff' : 'transparent',
                color: ongletActif === 'corbeille' ? '#FF6B6B' : '#666',
                fontWeight: ongletActif === 'corbeille' ? '600' : '400',
                fontSize: '16px',
                cursor: 'pointer',
                borderBottom: ongletActif === 'corbeille' ? '3px solid #FF6B6B' : '3px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              🗑️ Corbeille ({preparationsSupprimees.length})
            </button>
          </div>

          {/* Contenu */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {prepasPaginees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>
                  {ongletActif === 'historique' ? '📂' : '🗑️'}
                </div>
                <p style={{ fontSize: '18px', margin: '0 0 8px 0' }}>
                  {ongletActif === 'historique' 
                    ? 'Aucune préparation dans l\'historique' 
                    : 'Aucune préparation dans la corbeille'}
                </p>
                <p style={{ fontSize: '14px', margin: 0, color: '#bbb' }}>
                  {ongletActif === 'historique'
                    ? 'Tes préparations terminées apparaîtront ici automatiquement'
                    : 'Les préparations supprimées sont conservées 30 jours'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {prepasPaginees.map((prepa, index) => {
                  return (
                    <div
                      key={prepa.id || index}
                      style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '10px',
                        padding: '20px',
                        background: '#fff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '20px' }}>
                              {prepa.statut === 'terminee' ? '✅' : '⏸️'}
                            </span>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
                              Préparation du {formaterDate(prepa.dateDebut)}
                            </h3>
                          </div>
                          <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                            📅 Dates : <strong>{formaterDate(prepa.dateDebut)} - {formaterDate(prepa.dateFin)}</strong>
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                        {ongletActif === 'historique' ? (
                          <button
                            onClick={() => setPrepaDetail(prepa)}
                            style={{
                              flex: 1,
                              minWidth: '140px',
                              padding: '10px 16px',
                              background: '#1976d2',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#1565c0'}
                            onMouseLeave={(e) => e.target.style.background = '#1976d2'}
                          >
                            👀 Consulter
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => onRestaurer(prepa.id)}
                              style={{
                                flex: 1,
                                minWidth: '140px',
                                padding: '10px 16px',
                                background: '#43D9A3',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#388e3c'}
                              onMouseLeave={(e) => e.target.style.background = '#43D9A3'}
                            >
                              ♻️ Restaurer
                            </button>
                            <button
                              onClick={() => demanderSuppression(prepa, 'hard')}
                              style={{
                                padding: '10px 16px',
                                background: '#FF6B6B',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#d32f2f'}
                              onMouseLeave={(e) => e.target.style.background = '#FF6B6B'}
                            >
                              ⚠️ Supprimer définitivement
                            </button>
                          </>
                        )}
                      </div>
                      {ongletActif === 'corbeille' && prepa.dateSuppression && (
                        <p style={{
                          margin: '12px 0 0 0',
                          fontSize: '12px',
                          color: '#999',
                          fontStyle: 'italic'
                        }}>
                          Supprimée le {formaterDate(prepa.dateSuppression)} • Suppression auto dans {' '}
                          {Math.max(0, 30 - Math.floor((new Date() - new Date(prepa.dateSuppression)) / (1000 * 60 * 60 * 24)))} jours
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              background: '#f5f5f5'
            }}>
              <button
                onClick={() => setPageActuelle(Math.max(1, pageActuelle - 1))}
                disabled={pageActuelle === 1}
                style={{
                  padding: '8px 16px',
                  background: pageActuelle === 1 ? '#e0e0e0' : '#4F8FFF',
                  color: pageActuelle === 1 ? '#999' : '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: pageActuelle === 1 ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                ← Précédent
              </button>
              <span style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>
                Page {pageActuelle} / {totalPages}
              </span>
              <button
                onClick={() => setPageActuelle(Math.min(totalPages, pageActuelle + 1))}
                disabled={pageActuelle === totalPages}
                style={{
                  padding: '8px 16px',
                  background: pageActuelle === totalPages ? '#e0e0e0' : '#4F8FFF',
                  color: pageActuelle === totalPages ? '#999' : '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: pageActuelle === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Suivant →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal confirmation suppression */}
      {showModalConfirmation && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) annulerSuppression();
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10001,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              maxWidth: '500px',
              width: '100%',
              padding: '0',
              overflow: 'hidden'
            }}
          >
            <div style={{
              background: '#FF6B6B',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                ⚠️
              </div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '600' }}>
                Suppression définitive
              </h3>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#333', lineHeight: '1.6' }}>
                <strong style={{ color: '#FF6B6B' }}>Cette action est irréversible !</strong>
                <br /><br />
                La préparation du <strong>{formaterDate(preparationASupprimer?.dateDebut)}</strong> sera définitivement supprimée.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={annulerSuppression}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#e0e0e0',
                    color: '#666',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#d0d0d0'}
                  onMouseLeave={(e) => e.target.style.background = '#e0e0e0'}
                >
                  Annuler
                </button>
                <button
                  onClick={confirmerSuppression}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#FF6B6B',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#d32f2f'}
                  onMouseLeave={(e) => e.target.style.background = '#FF6B6B'}
                >
                  Supprimer définitivement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal détail préparation */}
      {prepaDetail && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setPrepaDetail(null); }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 11000,
            padding: '20px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              maxWidth: 420,
              width: '100%',
              padding: 0,
              position: 'relative'
            }}
          >
            <button
              onClick={() => setPrepaDetail(null)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: '#e0e0e0',
                color: '#333',
                border: 'none',
                borderRadius: 8,
                padding: '4px 12px',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                zIndex: 2
              }}
              title="Fermer le détail"
            >✕</button>
            <div style={{ padding: 24 }}>
              <CartePreparationJeune preparation={prepaDetail} onDelete={handleSupprimer} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
