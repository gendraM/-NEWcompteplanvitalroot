import React, { useState, useEffect } from 'react';
import { calculerSection1TendancePoids } from '../lib/calculsBilanMensuel';

/**
 * Composant Section1TendancePoids
 * Affiche l'évolution du poids sur le mois
 */
function Section1TendancePoids({ data }) {
  if (data?.erreur === 'donnees_insuffisantes') {
    return (
      <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📊</div>
        <p style={{ fontSize: '16px', marginBottom: '8px' }}>
          <strong>Données insuffisantes</strong>
        </p>
        <p style={{ fontSize: '14px', margin: 0 }}>
          {data.message} (actuellement: {data.nb_pesees} pesée{data.nb_pesees > 1 ? 's' : ''})
        </p>
      </div>
    );
  }

  const {
    poids_debut,
    poids_fin,
    evolution_kg,
    evolution_pourcent,
    trajectoire,
    emoji_trajectoire,
    couleur_trajectoire,
    poids_mois_prochain,
    poids_moyen,
    poids_min,
    poids_max,
    amplitude,
    nb_pesees,
    courbe_poids
  } = data;

  // Message selon trajectoire
  const getMessageTrajectoire = () => {
    switch (trajectoire) {
      case 'excellente':
        return 'Excellente progression ! Tu as perdu plus de 2 kg ce mois-ci. Continue comme ça ! 💪';
      case 'bonne':
        return 'Très bonne progression ! La perte de poids est régulière et saine. 👏';
      case 'stable_positive':
        return 'Bonne stabilité ! Tu maintiens une légère perte de poids. 👍';
      case 'stable':
        return 'Ton poids est stable ce mois-ci. Analyse les autres sections pour identifier des axes d\'amélioration.';
      case 'attention':
        return 'Petite prise de poids ce mois-ci. Vérifie la section Budget calorique pour ajuster. ⚠️';
      case 'difficile':
        return 'Prise de poids significative. Il est temps de revoir ton budget et tes extras. 🔴';
      case 'critique':
        return 'Prise de poids importante. Revois ton plan alimentaire avec attention. 🚨';
      default:
        return '';
    }
  };

  return (
    <div>
      <style jsx>{`
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: #f9fafb;
          border-radius: 10px;
          padding: 18px;
          border: 2px solid #e5e7eb;
          transition: all 0.2s;
        }

        .stat-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .stat-label {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-sub {
          font-size: 13px;
          color: #64748b;
        }

        .trajectoire-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          border: 2px solid #e2e8f0;
          text-align: center;
        }

        .trajectoire-emoji {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .trajectoire-label {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .trajectoire-message {
          font-size: 14px;
          color: #475569;
          line-height: 1.5;
        }

        .courbe-container {
          background: white;
          border-radius: 10px;
          padding: 20px;
          border: 2px solid #e5e7eb;
          margin-top: 20px;
        }

        .courbe-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 15px;
        }

        .courbe-wrapper {
          position: relative;
          height: 200px;
          border-left: 2px solid #cbd5e1;
          border-bottom: 2px solid #cbd5e1;
          margin: 20px 10px 30px 40px;
        }

        .courbe-line {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          top: 0;
        }

        .courbe-point {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #667eea;
          border-radius: 50%;
          transform: translate(-50%, 50%);
          cursor: pointer;
          transition: all 0.2s;
        }

        .courbe-point:hover {
          width: 14px;
          height: 14px;
          background: #5568d3;
        }

        .courbe-y-axis {
          position: absolute;
          left: -35px;
          font-size: 11px;
          color: #64748b;
        }

        .courbe-x-label {
          position: absolute;
          bottom: -25px;
          font-size: 11px;
          color: #64748b;
          transform: translateX(-50%);
        }

        @media (max-width: 768px) {
          .stat-grid {
            grid-template-columns: 1fr;
          }

          .courbe-wrapper {
            height: 150px;
            margin: 15px 5px 25px 35px;
          }
        }
      `}</style>

      {/* Trajectoire principale */}
      <div className="trajectoire-card" style={{ borderColor: couleur_trajectoire }}>
        <div className="trajectoire-emoji">{emoji_trajectoire}</div>
        <div className="trajectoire-label" style={{ color: couleur_trajectoire }}>
          {trajectoire.toUpperCase().replace('_', ' ')}
        </div>
        <div className="trajectoire-message">{getMessageTrajectoire()}</div>
      </div>

      {/* Statistiques principales */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Poids début</div>
          <div className="stat-value" style={{ color: '#64748b' }}>
            {poids_debut} kg
          </div>
          <div className="stat-sub">{data.date_debut}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Poids fin</div>
          <div className="stat-value" style={{ color: '#64748b' }}>
            {poids_fin} kg
          </div>
          <div className="stat-sub">{data.date_fin}</div>
        </div>

        <div className="stat-card" style={{ borderColor: couleur_trajectoire }}>
          <div className="stat-label">Évolution</div>
          <div className="stat-value" style={{ color: couleur_trajectoire }}>
            {evolution_kg > 0 ? '+' : ''}{evolution_kg} kg
          </div>
          <div className="stat-sub">
            {evolution_pourcent > 0 ? '+' : ''}{evolution_pourcent}%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Projection mois prochain</div>
          <div className="stat-value" style={{ color: '#667eea' }}>
            {poids_mois_prochain} kg
          </div>
          <div className="stat-sub">Basé sur tendance actuelle</div>
        </div>
      </div>

      {/* Statistiques secondaires */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Poids moyen</div>
          <div className="stat-value" style={{ color: '#64748b', fontSize: '22px' }}>
            {poids_moyen} kg
          </div>
          <div className="stat-sub">{nb_pesees} pesées</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Amplitude</div>
          <div className="stat-value" style={{ color: '#64748b', fontSize: '22px' }}>
            {amplitude} kg
          </div>
          <div className="stat-sub">Min: {poids_min} kg | Max: {poids_max} kg</div>
        </div>
      </div>

      {/* Courbe d'évolution */}
      {courbe_poids && courbe_poids.length > 0 && (
        <div className="courbe-container">
          <div className="courbe-title">📈 Évolution du poids sur le mois</div>
          <div className="courbe-wrapper">
            {/* Axe Y (poids) */}
            <div className="courbe-y-axis" style={{ top: '0%' }}>
              {poids_max.toFixed(1)}
            </div>
            <div className="courbe-y-axis" style={{ top: '50%' }}>
              {((poids_max + poids_min) / 2).toFixed(1)}
            </div>
            <div className="courbe-y-axis" style={{ top: '100%' }}>
              {poids_min.toFixed(1)}
            </div>

            {/* Points de la courbe */}
            <div className="courbe-line">
              {courbe_poids.map((point, index) => {
                const xPercent = (index / (courbe_poids.length - 1)) * 100;
                const yPercent = ((poids_max - point.poids) / (poids_max - poids_min)) * 100;
                
                return (
                  <React.Fragment key={index}>
                    <div
                      className="courbe-point"
                      style={{
                        left: `${xPercent}%`,
                        bottom: `${yPercent}%`
                      }}
                      title={`${point.date}: ${point.poids} kg`}
                    />
                    {/* Labels axe X (première, milieu, dernière date) */}
                    {(index === 0 || index === Math.floor(courbe_poids.length / 2) || index === courbe_poids.length - 1) && (
                      <div className="courbe-x-label" style={{ left: `${xPercent}%` }}>
                        {new Date(point.date).getDate()}/{new Date(point.date).getMonth() + 1}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              
              {/* Ligne reliant les points */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none'
                }}
              >
                <polyline
                  points={courbe_poids.map((point, index) => {
                    const x = (index / (courbe_poids.length - 1)) * 100;
                    const y = ((poids_max - point.poids) / (poids_max - poids_min)) * 100;
                    return `${x}%,${y}%`;
                  }).join(' ')}
                  fill="none"
                  stroke="#667eea"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  console.log('[BILAN MENSUEL MODAL] Composant monté avec props:', { isOpen, mois, annee });
  
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
  
  console.log('[BILAN MENSUEL MODAL] États initiaux:', { loading, bilanData });
  console.log('[BILAN MENSUEL MODAL] 🔐 RLS actif - pas besoin de userId explicite');

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

  // Charger les données du bilan mensuel
  useEffect(() => {
    console.log('[BILAN MENSUEL MODAL] useEffect chargerDonnees déclenché');
    console.log('[BILAN MENSUEL MODAL] Conditions:', { isOpen, mois, annee });
    
    if (!isOpen) {
      console.log('[BILAN MENSUEL MODAL] ⏸️ Modale fermée, pas de chargement');
      return;
    }
    if (!mois || !annee) {
      console.log('[BILAN MENSUEL MODAL] ⚠️ Mois ou année manquant');
      return;
    }
    
    console.log('[BILAN MENSUEL MODAL] ✅ Conditions réunies, démarrage chargement (RLS auto)');
    
    const chargerDonnees = async () => {
      setLoading(true);
      console.log('[BILAN MENSUEL MODAL] 🔄 Chargement données pour', moisNoms[mois - 1], annee);
      
      try {
        // Phase 3: Charger Section 1
        console.log('[BILAN MENSUEL MODAL] Appel calculerSection1TendancePoids...');
        const section1 = await calculerSection1TendancePoids(mois, annee);
        console.log('[BILAN MENSUEL MODAL] Section 1 reçue:', section1);
        
        const nouveauBilan = {
          mois,
          annee,
          section1,
          section2: null, // TODO Phase 4
          section3: null, // TODO Phase 5
          section4: null, // TODO Phase 6
          section5: null, // TODO Phase 7
          section6: null, // TODO Phase 8
        };
        
        console.log('[BILAN MENSUEL MODAL] Mise à jour bilanData:', nouveauBilan);
        setBilanData(nouveauBilan);
      } catch (err) {
        console.error('[BILAN MENSUEL MODAL] ❌ Erreur chargement:', err);
        console.error('[BILAN MENSUEL MODAL] Stack:', err.stack);
        setBilanData({ mois, annee, erreur: true });
      } finally {
        console.log('[BILAN MENSUEL MODAL] ✅ Chargement terminé, loading = false');
        setLoading(false);
      }
    };
    
    chargerDonnees();
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

  if (!isOpen) {
    console.log('[BILAN MENSUEL MODAL] Rendu null (modale fermée)');
    return null;
  }

  console.log('[BILAN MENSUEL MODAL] Rendu modale - loading:', loading, 'bilanData:', bilanData);

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
                      {bilanData?.section1 ? (
                        <Section1TendancePoids data={bilanData.section1} />
                      ) : (
                        <div className="placeholder">
                          <div className="placeholderIcon">⏳</div>
                          <p className="placeholderText">Calculs en cours...</p>
                        </div>
                      )}
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
