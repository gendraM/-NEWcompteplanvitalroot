/**
 * Drawer pour validation rétroactive et consultation historique
 * Permet de valider plusieurs semaines passées + voir feedback précédents
 */

import React, { useState } from 'react';
import { getEmojiPerformance, formatDate, addDays } from '../lib/validationSemaine';

export default function DrawerValidation({
  isOpen,
  onClose,
  semainesNonValidees,
  semainesValidees,
  onValider,
  onConsulterFeedback
}) {
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [ongletActif, setOngletActif] = useState('a-valider'); // 'a-valider' ou 'historique'

  if (!isOpen) return null;

  const handleToggleWeek = (weekStart) => {
    setSelectedWeeks(prev => 
      prev.includes(weekStart)
        ? prev.filter(w => w !== weekStart)
        : [...prev, weekStart]
    );
  };

  const handleValiderSelection = () => {
    if (selectedWeeks.length === 0) return;
    onValider(selectedWeeks);
    setSelectedWeeks([]);
  };

  // Trier les semaines validées (plus récentes d'abord)
  const semainesValideesSortees = (semainesValidees || [])
    .filter(s => s && s.weekStart) // Filtrer les entrées invalides
    .sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-container">
        {/* Header */}
        <div className="drawer-header">
          <h2>Validation des semaines</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Onglets */}
        <div className="tabs">
          <button
            className={`tab ${ongletActif === 'a-valider' ? 'active' : ''}`}
            onClick={() => setOngletActif('a-valider')}
          >
            À valider
            {semainesNonValidees.length > 0 && (
              <span className="badge">{semainesNonValidees.length}</span>
            )}
          </button>
          <button
            className={`tab ${ongletActif === 'historique' ? 'active' : ''}`}
            onClick={() => setOngletActif('historique')}
          >
            Historique
          </button>
        </div>

        {/* Contenu */}
        <div className="drawer-body">
          {/* Onglet : À valider */}
          {ongletActif === 'a-valider' && (
            <>
              {semainesNonValidees.length === 0 ? (
                <div className="empty-state">
                  <p>✅ Toutes les semaines récentes sont validées !</p>
                </div>
              ) : (
                <>
                  <p className="instruction">
                    Sélectionnez les semaines à valider rétroactivement :
                  </p>
                  <div className="semaines-list">
                    {semainesNonValidees.map((semaine) => (
                      <div
                        key={semaine.weekStart}
                        className={`semaine-item ${selectedWeeks.includes(semaine.weekStart) ? 'selected' : ''}`}
                        onClick={() => handleToggleWeek(semaine.weekStart)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedWeeks.includes(semaine.weekStart)}
                          onChange={() => handleToggleWeek(semaine.weekStart)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="semaine-info">
                          <span className="semaine-label">{semaine.label}</span>
                          {semaine.estSemaineActuelle && (
                            <span className="badge-actuelle">Actuelle</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Onglet : Historique */}
          {ongletActif === 'historique' && (
            <>
              {semainesValideesSortees.length === 0 ? (
                <div className="empty-state">
                  <p>📋 Aucune semaine validée pour le moment</p>
                </div>
              ) : (
                <div className="historique-list">
                  {semainesValideesSortees.map((semaine) => {
                    // Sécurité : vérifier que weekStart existe
                    if (!semaine || !semaine.weekStart) return null;
                    
                    const emoji = getEmojiPerformance(semaine.extras_count || 0, 2);
                    const finSemaine = addDays(new Date(semaine.weekStart), 6);
                    const label = `${formatDate(new Date(semaine.weekStart), 'd MMM')} - ${formatDate(finSemaine, 'd MMM yyyy')}`;

                    return (
                      <div key={semaine.weekStart} className="historique-item">
                        <div className="historique-info">
                          <span className="emoji">{emoji}</span>
                          <div className="details">
                            <span className="label">{label}</span>
                            <span className="extras-count">
                              {semaine.extras_count || 0} extra{(semaine.extras_count || 0) > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <button
                          className="btn-consulter"
                          onClick={() => onConsulterFeedback(semaine)}
                          title="Voir le feedback détaillé"
                        >
                          👁️
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer avec bouton de validation */}
        {ongletActif === 'a-valider' && selectedWeeks.length > 0 && (
          <div className="drawer-footer">
            <button className="btn-valider" onClick={handleValiderSelection}>
              Valider {selectedWeeks.length} semaine{selectedWeeks.length > 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .drawer-container {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 400px;
          max-width: 90vw;
          background: white;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s ease-out;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .drawer-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #111827;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6b7280;
          cursor: pointer;
          padding: 4px 8px;
          line-height: 1;
          transition: color 0.2s;
        }

        .close-button:hover {
          color: #111827;
        }

        .tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          background: white;
        }

        .tab {
          flex: 1;
          padding: 12px 16px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .tab:hover {
          color: #374151;
          background: #f9fafb;
        }

        .tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .badge {
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 600;
        }

        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .instruction {
          margin: 0 0 16px 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .empty-state p {
          margin: 0;
          font-size: 1rem;
        }

        .semaines-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .semaine-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .semaine-item:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .semaine-item.selected {
          border-color: #3b82f6;
          background: #dbeafe;
        }

        .semaine-item input[type="checkbox"] {
          cursor: pointer;
          width: 18px;
          height: 18px;
        }

        .semaine-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .semaine-label {
          font-weight: 500;
          color: #111827;
        }

        .badge-actuelle {
          background: #fef3c7;
          color: #92400e;
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
        }

        .historique-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .historique-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .historique-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .emoji {
          font-size: 1.5rem;
        }

        .details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .label {
          font-weight: 500;
          color: #111827;
        }

        .extras-count {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .btn-consulter {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1.25rem;
          transition: background 0.2s;
        }

        .btn-consulter:hover {
          background: #2563eb;
        }

        .drawer-footer {
          padding: 16px 20px;
          border-top: 1px solid #e5e7eb;
          background: white;
        }

        .btn-valider {
          width: 100%;
          background: #10b981;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-valider:hover {
          background: #059669;
        }

        @media (max-width: 640px) {
          .drawer-container {
            width: 100vw;
            max-width: 100vw;
          }
        }
      `}</style>
    </>
  );
}
