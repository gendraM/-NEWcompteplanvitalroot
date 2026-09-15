/**
 * Modal de feedback après validation d'une semaine
 * Affiche : extras count, détails, message personnalisé, évolution
 */

import React from 'react';
import { getEmojiPerformance, formatterDetailsExtras, formatDate } from '../lib/validationSemaine';

export default function ModalFeedbackValidation({
  isOpen,
  onClose,
  weekStart,
  extrasCount,
  extrasDetails,
  message,
  variation,
  dateValidation,
  palier = 5
}) {
  if (!isOpen) return null;

  const emoji = getEmojiPerformance(extrasCount, palier);
  const pourcentage = Math.min(100, Math.round((extrasCount / palier) * 100));
  const depasse = extrasCount > palier;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>
            {emoji} Validation de la semaine
          </h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Date de validation */}
          {dateValidation && (
            <p className="date-validation">
              Validée le {formatDate(new Date(dateValidation), "d MMMM yyyy 'à' HH:mm")}
            </p>
          )}

          {/* Semaine concernée */}
          {weekStart && (
            <p className="semaine-label">
              Semaine du {formatDate(new Date(weekStart), 'd MMMM yyyy')}
            </p>
          )}

          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-label">
              <span>Moments extras : {extrasCount} / palier {palier}</span>
              {variation !== 0 && (
                <span className={`variation ${variation > 0 ? 'negative' : 'positive'}`}>
                  {variation > 0 ? `+${variation}` : variation}
                </span>
              )}
            </div>
            <div className="progress-bar-container">
              <div 
                className={`progress-bar-fill ${depasse ? 'depasse' : 'ok'}`}
                style={{ width: `${pourcentage}%` }}
              >
                {pourcentage > 20 && <span className="progress-text">{extrasCount}</span>}
              </div>
            </div>
          </div>

          {/* Message personnalisé */}
          <div className={`message-feedback ${depasse ? 'warning' : 'success'}`}>
            {message}
          </div>

          {/* Détails des extras */}
          {extrasDetails && extrasDetails.length > 0 && (
            <div className="extras-details">
              <h3>📋 Détails des extras</h3>
              <ul>
                {extrasDetails.map((extra, index) => (
                  <li key={index}>
                    <span className="extra-icon">🍔</span>
                    <span className="extra-nom">{extra.nom}</span>
                    <span className="extra-date">
                      {formatDate(new Date(extra.date), 'EEEE d MMM')}
                    </span>
                    <span className="extra-moment">({extra.moment})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Message encouragement si aucun extra */}
          {extrasCount === 0 && (
            <div className="zero-extras">
              <p>🎯 Semaine parfaite ! Continue comme ça !</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
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

        .modal-body {
          padding: 24px;
        }

        .date-validation {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 8px;
        }

        .semaine-label {
          font-size: 1rem;
          color: #374151;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .progress-section {
          margin-bottom: 24px;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }

        .variation {
          font-size: 0.875rem;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
        }

        .variation.positive {
          background: #d1fae5;
          color: #065f46;
        }

        .variation.negative {
          background: #fee2e2;
          color: #991b1b;
        }

        .progress-bar-container {
          width: 100%;
          height: 32px;
          background: #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar-fill {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: width 0.5s ease-out;
          border-radius: 16px;
        }

        .progress-bar-fill.ok {
          background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
        }

        .progress-bar-fill.depasse {
          background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
        }

        .progress-text {
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .message-feedback {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .message-feedback.success {
          background: #d1fae5;
          color: #065f46;
          border-left: 4px solid #10b981;
        }

        .message-feedback.warning {
          background: #fee2e2;
          color: #991b1b;
          border-left: 4px solid #ef4444;
        }

        .extras-details {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .extras-details h3 {
          margin: 0 0 12px 0;
          font-size: 1rem;
          color: #374151;
        }

        .extras-details ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .extras-details li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .extras-details li:last-child {
          border-bottom: none;
        }

        .extra-icon {
          font-size: 1.25rem;
        }

        .extra-nom {
          flex: 1;
          font-weight: 500;
          color: #111827;
        }

        .extra-date {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .extra-moment {
          font-size: 0.875rem;
          color: #9ca3af;
        }

        .zero-extras {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }

        .zero-extras p {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #92400e;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        @media (max-width: 640px) {
          .modal-content {
            max-width: 100%;
            margin: 0;
            border-radius: 12px 12px 0 0;
            max-height: 95vh;
          }

          .modal-header h2 {
            font-size: 1.25rem;
          }

          .extras-details li {
            flex-wrap: wrap;
          }

          .extra-nom {
            flex: 1 1 100%;
            margin-bottom: 4px;
          }
        }
      `}</style>
    </div>
  );
}
