import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './BilanHebdoModal.module.css';

/**
 * Modale de bilan hebdomadaire alimentaire
 * Affichée uniquement lors de la validation explicite de la semaine
 * Respecte l’accessibilité (focus, navigation clavier, aria)
 */
export default function BilanHebdoModal({ open, onClose, bilan, onLearnMore }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
      ref={modalRef}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
    >
      <div className={styles.modal}>
        <h2>Bilan de la semaine</h2>
        <p><strong>Période :</strong> {bilan?.periode || 'Semaine en cours'}</p>
        <p>{bilan?.verbatim || 'Bravo pour votre engagement cette semaine !'}</p>
        <ul>
          <li>Extras consommés : {bilan?.extras ?? '—'}</li>
          <li>Budget utilisé : {bilan?.budget ?? '—'}%</li>
          <li>Points forts : {bilan?.pointsForts ?? bilan?.points_forts ?? '—'}</li>
          <li>Axes d’amélioration : {bilan?.axesAmelioration ?? bilan?.axes_amelioration ?? '—'}</li>
        </ul>
        {/* Nouveaux champs */}
        {bilan?.tendanceMensuelle || bilan?.tendance_mensuelle ? (
          <div style={{marginTop: '1rem'}}>
            <strong>Tendance mensuelle :</strong><br/>
            <span>{bilan?.tendanceMensuelle ?? bilan?.tendance_mensuelle}</span>
          </div>
        ) : null}
        {bilan?.feedbackDetaille || bilan?.feedback_detaille ? (
          <div style={{marginTop: '1rem'}}>
            <strong>Feedback détaillé :</strong><br/>
            <span>{bilan?.feedbackDetaille ?? bilan?.feedback_detaille}</span>
          </div>
        ) : null}
        <p style={{marginTop: '1rem'}}>{bilan?.motDoux || 'Continuez sur cette belle lancée !'}</p>
        <button className={styles.modalButton} onClick={onLearnMore}>En savoir plus</button>
        <button className={styles.modalButton} onClick={onClose} autoFocus>Fermer</button>
      </div>
    </div>
  );
}

BilanHebdoModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bilan: PropTypes.object,
  onLearnMore: PropTypes.func.isRequired,
};
