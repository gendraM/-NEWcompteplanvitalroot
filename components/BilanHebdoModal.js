import React, { useRef, useEffect } from 'react';
import styles from './BilanHebdoModal.module.css';

// Squelette minimal pour repartir étape par étape selon le plan métier
export default function BilanHebdoModal({ open, onClose, bilan, onLearnMore, selectedDate }) {
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
        {/* SECTION 1 : Données principales du bilan hebdo */}
        <h2 style={{marginBottom: '0.7rem', color: '#1976d2'}}>Bilan de ta semaine alimentaire</h2>
        <div style={{fontWeight: 500, color: '#444', marginBottom: '0.5rem', fontSize: '1.08rem'}}>
          {/* Sous-titre période explicite lundi-dimanche */}
          {/* Centralisation stricte : calcul à partir de la date sélectionnée */}
          {selectedDate ? (() => {
            console.log('[AUDIT MODAL] Date sélectionnée reçue :', selectedDate);
            const refDate = new Date(selectedDate);
            const day = refDate.getDay();
            // Correction stricte : lundi de la semaine courante
            const monday = new Date(refDate);
            monday.setDate(refDate.getDate() - ((day + 6) % 7));
            monday.setHours(0,0,0,0);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23,59,59,999);
            const fmt = d => d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit', year: '2-digit' });
            return `Semaine du lundi ${fmt(monday)} au dimanche ${fmt(sunday)}`;
          })() : ''}
        </div>
        <div style={{fontStyle: 'italic', color: '#1976d2', marginBottom: '1.2rem', fontSize: '1.01rem'}}>
          Ton corps évolue dans le temps. Ce bilan te montre la trajectoire, pas un jugement.
        </div>
        <section style={{marginBottom: '2rem', background: '#f7fafd', borderRadius: 12, padding: '1.2rem 1.5rem', boxShadow: '0 1px 6px #e0e0e0'}}>
          <h3 style={{marginBottom: '1rem', color: '#1976d2', fontSize: '1.15rem'}}>Résumé des données principales</h3>
          <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '1.08rem'}}>
            {/* Champ métier : Extras consommés (verbatim métier, affichage robuste) */}
            <li style={{marginBottom: 12}}>
              <span>
                Tu as consommé <span style={{fontWeight:700, color:'#e53935'}}>{
                  typeof bilan?.extras === 'number' ? bilan.extras : '—'
                }</span> extra{bilan?.extras > 1 ? 's' : ''} cette semaine, soit <span style={{fontWeight:700, color:'#ff9800'}}>{
                  typeof bilan?.budget === 'number' ? bilan.budget : '—'
                }</span>% de ton budget hebdo.
              </span>
            </li>
            {/* Champ métier : Calories totales (séparées sur deux lignes) */}
            <li style={{marginBottom: 6}}>
              <span>
                Calories consommées&nbsp;: <span style={{fontWeight:700, color:'#1976d2'}}>{
                  typeof bilan?.apportsTotaux === 'number' ? bilan.apportsTotaux : '—'
                }</span> kcal
              </span>
            </li>
            <li style={{marginBottom: 12}}>
              <span>
                Objectif hebdomadaire&nbsp;: <span style={{fontWeight:700}}>{
                  typeof bilan?.objectifHebdo === 'number' ? bilan.objectifHebdo : '—'
                }</span> kcal
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
