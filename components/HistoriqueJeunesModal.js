import { useState } from 'react';

export default function HistoriqueJeunesModal({
  historiqueJeunes = [],
  jeunesSupprimés = [],
  jeuneActif = null,
  onConsulter,
  onSupprimer,
  onRestaurer,
  onSupprimerDefinitivement,
  onFermer
}) {
  const [ongletActif, setOngletActif] = useState('historique'); // 'historique' ou 'corbeille'
  const [jeuneASupprimer, setJeuneASupprimer] = useState(null);
  const [showModalConfirmation, setShowModalConfirmation] = useState(false);
  const [typeSuppression, setTypeSuppression] = useState('soft'); // 'soft' ou 'hard'
  const [pageActuelle, setPageActuelle] = useState(1);
  const JEUNES_PAR_PAGE = 15;

  // Fonction de formatage date
  const formaterDate = (dateStr) => {
    if (!dateStr) return 'Date inconnue';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Calcul durée jeûne en jours
  const calculerDureeReelle = (dateDebut, dateFin, dureePrevu) => {
    if (dateFin) {
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      const diffTime = Math.abs(fin - debut);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1; // +1 pour inclure le jour de début
    }
    return dureePrevu || 0;
  };

  // Gestion pagination
  const jeunesAffiches = ongletActif === 'historique' ? historiqueJeunes : jeunesSupprimés;
  const totalPages = Math.ceil(jeunesAffiches.length / JEUNES_PAR_PAGE);
  const indexDebut = (pageActuelle - 1) * JEUNES_PAR_PAGE;
  const indexFin = indexDebut + JEUNES_PAR_PAGE;
  const jeunesPagines = jeunesAffiches.slice(indexDebut, indexFin);

  // Handler suppression
  const demanderSuppression = (jeune, type = 'soft') => {
    setJeuneASupprimer(jeune);
    setTypeSuppression(type);
    setShowModalConfirmation(true);
  };

  const confirmerSuppression = () => {
    if (!jeuneASupprimer) return;

    if (typeSuppression === 'soft') {
      onSupprimer(jeuneASupprimer.id);
    } else {
      onSupprimerDefinitivement(jeuneASupprimer.id);
    }

    setShowModalConfirmation(false);
    setJeuneASupprimer(null);
  };

  const annulerSuppression = () => {
    setShowModalConfirmation(false);
    setJeuneASupprimer(null);
  };

  // Handler fermeture modal (clic outside)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onFermer();
    }
  };

  return (
    <>
      {/* Overlay modal historique */}
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
        {/* Modal container */}
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
          {/* Header modal */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '2px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', fontWeight: '600' }}>
              📚 Mes jeûnes
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
                color: ongletActif === 'historique' ? '#1976d2' : '#666',
                fontWeight: ongletActif === 'historique' ? '600' : '400',
                fontSize: '16px',
                cursor: 'pointer',
                borderBottom: ongletActif === 'historique' ? '3px solid #1976d2' : '3px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              📖 Historique ({historiqueJeunes.length})
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
                color: ongletActif === 'corbeille' ? '#f44336' : '#666',
                fontWeight: ongletActif === 'corbeille' ? '600' : '400',
                fontSize: '16px',
                cursor: 'pointer',
                borderBottom: ongletActif === 'corbeille' ? '3px solid #f44336' : '3px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              🗑️ Corbeille ({jeunesSupprimés.length})
            </button>
          </div>

          {/* Contenu */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {jeunesPagines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>
                  {ongletActif === 'historique' ? '📂' : '🗑️'}
                </div>
                <p style={{ fontSize: '18px', margin: '0 0 8px 0' }}>
                  {ongletActif === 'historique' 
                    ? 'Aucun jeûne dans l\'historique' 
                    : 'Aucun jeûne dans la corbeille'}
                </p>
                <p style={{ fontSize: '14px', margin: 0, color: '#bbb' }}>
                  {ongletActif === 'historique'
                    ? 'Tes jeûnes terminés apparaîtront ici automatiquement'
                    : 'Les jeûnes supprimés sont conservés 30 jours'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {jeunesPagines.map((jeune, index) => {
                  const estActif = jeuneActif && jeune.id === jeuneActif.id;
                  const dureeReelle = calculerDureeReelle(jeune.dateDebut, jeune.dateFin, jeune.duree);
                  const progression = jeune.joursValides ? jeune.joursValides.length : 0;
                  const pourcentage = dureeReelle > 0 ? Math.round((progression / dureeReelle) * 100) : 0;

                  return (
                    <div
                      key={jeune.id || index}
                      style={{
                        border: estActif ? '2px solid #43a047' : '1px solid #e0e0e0',
                        borderRadius: '10px',
                        padding: '20px',
                        background: estActif ? '#e8f5e9' : '#fff',
                        boxShadow: estActif ? '0 4px 12px rgba(67, 160, 71, 0.2)' : '0 2px 6px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '20px' }}>
                              {estActif ? '🟢' : jeune.statut === 'termine' ? '✅' : '⏸️'}
                            </span>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
                              Jeûne du {formaterDate(jeune.dateDebut)}
                            </h3>
                            {estActif && (
                              <span style={{
                                background: '#43a047',
                                color: '#fff',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                EN COURS
                              </span>
                            )}
                          </div>
                          <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                            📅 Durée prévue : <strong>{jeune.duree} jours</strong>
                            {jeune.dateFin && ` • Terminé le ${formaterDate(jeune.dateFin)}`}
                          </p>
                          <div style={{ marginTop: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '14px', color: '#666' }}>Progression</span>
                              <span style={{ fontSize: '14px', fontWeight: '600', color: pourcentage === 100 ? '#43a047' : '#1976d2' }}>
                                {progression} / {dureeReelle} jours ({pourcentage}%)
                              </span>
                            </div>
                            <div style={{
                              width: '100%',
                              height: '8px',
                              background: '#e0e0e0',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${pourcentage}%`,
                                height: '100%',
                                background: pourcentage === 100 
                                  ? 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)'
                                  : 'linear-gradient(90deg, #64b5f6 0%, #1976d2 100%)',
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                        {ongletActif === 'historique' ? (
                          <>
                            {!estActif && (
                              <button
                                onClick={() => onConsulter(jeune.id)}
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
                            )}
                            {!estActif && (
                              <button
                                onClick={() => demanderSuppression(jeune, 'soft')}
                                style={{
                                  padding: '10px 16px',
                                  background: '#ffebee',
                                  color: '#f44336',
                                  border: '1px solid #f44336',
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
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
                            )}
                            {estActif && (
                              <span style={{ 
                                flex: 1, 
                                padding: '10px 16px', 
                                color: '#43a047', 
                                fontSize: '14px',
                                fontWeight: '600',
                                textAlign: 'center'
                              }}>
                                ⚡ Jeûne actuellement consulté
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => onRestaurer(jeune.id)}
                              style={{
                                flex: 1,
                                minWidth: '140px',
                                padding: '10px 16px',
                                background: '#43a047',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#388e3c'}
                              onMouseLeave={(e) => e.target.style.background = '#43a047'}
                            >
                              ♻️ Restaurer
                            </button>
                            <button
                              onClick={() => demanderSuppression(jeune, 'hard')}
                              style={{
                                padding: '10px 16px',
                                background: '#f44336',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#d32f2f'}
                              onMouseLeave={(e) => e.target.style.background = '#f44336'}
                            >
                              ⚠️ Supprimer définitivement
                            </button>
                          </>
                        )}
                      </div>

                      {/* Info suppression (corbeille) */}
                      {ongletActif === 'corbeille' && jeune.dateSuppression && (
                        <p style={{ 
                          margin: '12px 0 0 0', 
                          fontSize: '12px', 
                          color: '#999',
                          fontStyle: 'italic'
                        }}>
                          Supprimé le {formaterDate(jeune.dateSuppression)} • Suppression automatique dans{' '}
                          {Math.max(0, 30 - Math.floor((new Date() - new Date(jeune.dateSuppression)) / (1000 * 60 * 60 * 24)))} jours
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
                  background: pageActuelle === 1 ? '#e0e0e0' : '#1976d2',
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
                  background: pageActuelle === totalPages ? '#e0e0e0' : '#1976d2',
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
            {/* Header danger */}
            <div style={{
              background: typeSuppression === 'hard' ? '#f44336' : '#ff9800',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                {typeSuppression === 'hard' ? '⚠️' : '🗑️'}
              </div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '600' }}>
                {typeSuppression === 'hard' ? 'Suppression définitive' : 'Supprimer ce jeûne ?'}
              </h3>
            </div>

            {/* Contenu */}
            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#333', lineHeight: '1.6' }}>
                {typeSuppression === 'hard' ? (
                  <>
                    <strong style={{ color: '#f44336' }}>Cette action est irréversible !</strong>
                    <br /><br />
                    Le jeûne du <strong>{formaterDate(jeuneASupprimer?.dateDebut)}</strong> sera définitivement supprimé :
                    <ul style={{ marginTop: '12px', paddingLeft: '20px', color: '#666' }}>
                      <li>Toutes les données du jeûne</li>
                      <li>L'historique des jours validés</li>
                      <li>Les outils et notes</li>
                      <li>Le bilan de fin de jeûne</li>
                      <li>Le programme de reprise</li>
                    </ul>
                  </>
                ) : (
                  <>
                    Le jeûne du <strong>{formaterDate(jeuneASupprimer?.dateDebut)}</strong> sera déplacé vers la corbeille.
                    <br /><br />
                    ✅ Tu pourras le <strong>restaurer</strong> pendant 30 jours
                    <br />
                    ⚠️ Suppression automatique après cette période
                  </>
                )}
              </p>

              {/* Actions */}
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
                    background: typeSuppression === 'hard' ? '#f44336' : '#ff9800',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = typeSuppression === 'hard' ? '#d32f2f' : '#f57c00'}
                  onMouseLeave={(e) => e.target.style.background = typeSuppression === 'hard' ? '#f44336' : '#ff9800'}
                >
                  {typeSuppression === 'hard' ? 'Supprimer définitivement' : 'Déplacer vers corbeille'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
