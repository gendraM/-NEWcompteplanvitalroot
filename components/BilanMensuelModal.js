import React, { useState, useEffect } from 'react';

/**
 * BilanMensuelModal - Modale d'affichage du bilan mensuel
 * 
 * Phase 2 : Structure vide avec 6 sections accordéons
 * Phase 3-8 : Intégration des calculs pour chaque section
 * 
 * Props:
 * - isOpen: boolean - Contrôle l'affichage de la modale
 * - mois: number (1-12) - Mois du bilan
 * - annee: number - Année du bilan
 * - onClose: function - Callback de fermeture
 */
export default function BilanMensuelModal({ isOpen, mois, annee, onClose }) {
  // État des sections (true = ouverte, false = fermée)
  const [sectionsOuvertes, setSectionsOuvertes] = useState({
    section1: true, // Tendance poids ouverte par défaut
    section2: false,
    section3: false,
    section4: false,
    section5: false,
    section6: false,
  });

  // État de chargement des données
  const [loading, setLoading] = useState(true);
  const [bilanData, setBilanData] = useState(null);

  // Noms des mois
  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Toggle section accordion
  const toggleSection = (section) => {
    setSectionsOuvertes(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Reset state on modal open
  useEffect(() => {
    if (isOpen && mois && annee) {
      setLoading(true);
      // TODO Phase 2: Charger les données via calculsBilanMensuel.js
      console.log('[BILAN MENSUEL] Chargement données pour', moisNoms[mois - 1], annee);
      
      // Simuler chargement (remplacer par vraie logique en Phase 2)
      setTimeout(() => {
        setLoading(false);
        setBilanData({
          mois,
          annee,
          // TODO: Ajouter les 6 sections calculées
        });
      }, 500);
    }
  }, [isOpen, mois, annee]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style jsx>{`
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
        }

        .modal {
          background: white;
          border-radius: 16px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 16px 16px 0 0;
          position: relative;
        }

        .closeBtn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 28px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .closeBtn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .subtitle {
          font-size: 16px;
          opacity: 0.9;
          margin: 0;
        }

        .content {
          padding: 30px;
        }

        .section {
          margin-bottom: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .section:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .sectionHeader {
          background: #f9fafb;
          padding: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s;
          user-select: none;
        }

        .sectionHeader:hover {
          background: #f3f4f6;
        }

        .sectionHeaderLeft {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sectionIcon {
          font-size: 24px;
        }

        .sectionTitle {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .chevron {
          font-size: 20px;
          color: #64748b;
          transition: transform 0.3s;
        }

        .chevron.open {
          transform: rotate(180deg);
        }

        .sectionContent {
          padding: 25px;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .placeholder {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
        }

        .placeholderIcon {
          font-size: 48px;
          margin-bottom: 15px;
          opacity: 0.5;
        }

        .placeholderText {
          font-size: 16px;
          margin: 0;
        }

        .footer {
          padding: 20px 30px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btnPrimary {
          background: #667eea;
          color: white;
        }

        .btnPrimary:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btnSecondary {
          background: white;
          color: #64748b;
          border: 2px solid #e5e7eb;
        }

        .btnSecondary:hover {
          border-color: #cbd5e1;
          background: #f9fafb;
        }

        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 8px;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @media (max-width: 768px) {
          .modal {
            max-height: 95vh;
            border-radius: 12px;
          }

          .header {
            padding: 20px;
          }

          .title {
            font-size: 22px;
          }

          .content {
            padding: 20px;
          }

          .footer {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="header">
            <button className="closeBtn" onClick={onClose} aria-label="Fermer">
              ×
            </button>
            <h2 className="title">📊 Bilan Mensuel</h2>
            <p className="subtitle">
              {moisNoms[mois - 1]} {annee}
            </p>
          </div>

          {/* Content */}
          <div className="content">
            {loading ? (
              // Skeleton loader
              <div>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} style={{ marginBottom: '20px' }}>
                    <div className="skeleton" style={{ height: '70px' }} />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Section 1: Tendance poids & objectif */}
                <div className="section">
                  <div
                    className="sectionHeader"
                    onClick={() => toggleSection('section1')}
                    role="button"
                    tabIndex={0}
                    aria-expanded={sectionsOuvertes.section1}
                  >
                    <div className="sectionHeaderLeft">
                      <span className="sectionIcon">⚖️</span>
                      <h3 className="sectionTitle">Tendance poids & objectif</h3>
                    </div>
                    <span className={`chevron ${sectionsOuvertes.section1 ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {sectionsOuvertes.section1 && (
                    <div className="sectionContent">
                      <div className="placeholder">
                        <div className="placeholderIcon">⏳</div>
                        <p className="placeholderText">
                          Calculs en cours... (Phase 3)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Budget calorique */}
                <div className="section">
                  <div
                    className="sectionHeader"
                    onClick={() => toggleSection('section2')}
                    role="button"
                    tabIndex={0}
                    aria-expanded={sectionsOuvertes.section2}
                  >
                    <div className="sectionHeaderLeft">
                      <span className="sectionIcon">🔥</span>
                      <h3 className="sectionTitle">Budget calorique</h3>
                    </div>
                    <span className={`chevron ${sectionsOuvertes.section2 ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {sectionsOuvertes.section2 && (
                    <div className="sectionContent">
                      <div className="placeholder">
                        <div className="placeholderIcon">⏳</div>
                        <p className="placeholderText">
                          Calculs en cours... (Phase 4)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Patterns comportementaux */}
                <div className="section">
                  <div
                    className="sectionHeader"
                    onClick={() => toggleSection('section3')}
                    role="button"
                    tabIndex={0}
                    aria-expanded={sectionsOuvertes.section3}
                  >
                    <div className="sectionHeaderLeft">
                      <span className="sectionIcon">📈</span>
                      <h3 className="sectionTitle">Patterns comportementaux</h3>
                    </div>
                    <span className={`chevron ${sectionsOuvertes.section3 ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {sectionsOuvertes.section3 && (
                    <div className="sectionContent">
                      <div className="placeholder">
                        <div className="placeholderIcon">⏳</div>
                        <p className="placeholderText">
                          Calculs en cours... (Phase 5)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Qualité nutritionnelle */}
                <div className="section">
                  <div
                    className="sectionHeader"
                    onClick={() => toggleSection('section4')}
                    role="button"
                    tabIndex={0}
                    aria-expanded={sectionsOuvertes.section4}
                  >
                    <div className="sectionHeaderLeft">
                      <span className="sectionIcon">🥗</span>
                      <h3 className="sectionTitle">Qualité nutritionnelle</h3>
                    </div>
                    <span className={`chevron ${sectionsOuvertes.section4 ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {sectionsOuvertes.section4 && (
                    <div className="sectionContent">
                      <div className="placeholder">
                        <div className="placeholderIcon">⏳</div>
                        <p className="placeholderText">
                          Calculs en cours... (Phase 6)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 5: Bien-être & ressentis */}
                <div className="section">
                  <div
                    className="sectionHeader"
                    onClick={() => toggleSection('section5')}
                    role="button"
                    tabIndex={0}
                    aria-expanded={sectionsOuvertes.section5}
                  >
                    <div className="sectionHeaderLeft">
                      <span className="sectionIcon">💚</span>
                      <h3 className="sectionTitle">Bien-être & ressentis</h3>
                    </div>
                    <span className={`chevron ${sectionsOuvertes.section5 ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {sectionsOuvertes.section5 && (
                    <div className="sectionContent">
                      <div className="placeholder">
                        <div className="placeholderIcon">⏳</div>
                        <p className="placeholderText">
                          Calculs en cours... (Phase 7)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 6: Projection mois suivant */}
                <div className="section">
                  <div
                    className="sectionHeader"
                    onClick={() => toggleSection('section6')}
                    role="button"
                    tabIndex={0}
                    aria-expanded={sectionsOuvertes.section6}
                  >
                    <div className="sectionHeaderLeft">
                      <span className="sectionIcon">🎯</span>
                      <h3 className="sectionTitle">Projection mois suivant</h3>
                    </div>
                    <span className={`chevron ${sectionsOuvertes.section6 ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {sectionsOuvertes.section6 && (
                    <div className="sectionContent">
                      <div className="placeholder">
                        <div className="placeholderIcon">⏳</div>
                        <p className="placeholderText">
                          Calculs en cours... (Phase 8)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="footer">
            <button className="btn btnSecondary" onClick={onClose}>
              Fermer
            </button>
            <button
              className="btn btnPrimary"
              onClick={() => {
                console.log('[BILAN MENSUEL] TODO: Télécharger PDF');
                alert('📄 Téléchargement PDF à venir (Phase 9)');
              }}
            >
              📄 Télécharger PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
