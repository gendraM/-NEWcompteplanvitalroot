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

  // ...existing code...
  // Génération du verbatim automatique métier pour la lecture des extras
  function getVerbatimLectureExtras(extras, kcalExtras, budgetExtras) {
    if (typeof extras !== 'number' || typeof kcalExtras !== 'number' || typeof budgetExtras !== 'number') return '';
    // Cas 4 : Extras maîtrisés (dans le budget, charge modérée)
    if (extras >= 1 && kcalExtras <= budgetExtras && extras <= 4) {
      return 'Cette semaine, le nombre et la charge des extras sont restés dans le budget prévu.';
    }
    // Cas 1 : Peu d’extras, très caloriques
    if (extras <= 2 && kcalExtras > budgetExtras) {
      return 'Cette semaine, les extras ont été peu nombreux mais très chargés. Leur impact vient surtout de leur intensité.';
    }
    // Cas 2 : Plusieurs extras, charge modérée
    if (extras >= 3 && extras <= 6 && kcalExtras > 0 && kcalExtras <= budgetExtras) {
      return 'Cette semaine, les extras ont été fréquents mais répartis en petites quantités. Leur impact vient de l’accumulation.';
    }
    // Cas 3 : Plusieurs extras, charge élevée
    if (extras >= 5 && kcalExtras > budgetExtras) {
      return 'Cette semaine, les extras ont été à la fois fréquents et chargés. La répétition et l’intensité se sont additionnées.';
    }
    return '';
  }

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
          {selectedDate ? (() => {
            const refDate = new Date(selectedDate);
            const day = refDate.getDay();
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
        {/* SECTION 1 : Résumé des données principales (désormais en premier) */}
        <section style={{marginBottom: '2rem', background: '#f4f8ff', borderRadius: 12, padding: '1.2rem 1.5rem', boxShadow: '0 1px 6px #dbeafe'}}>
          <h3 style={{marginBottom: '1rem', color: '#1976d2', fontSize: '1.15rem'}}>Résumé des données principales</h3>
          <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '1.08rem'}}>
            {/* Calories totales consommées (avec et hors extras) */}
            <li style={{marginBottom: 8}}>
              <span style={{fontWeight:600}}>Calories consommées (hors extras)&nbsp;:</span> <span style={{fontWeight:700, color:'#1976d2'}}>{
                typeof bilan?.apportsTotaux === 'number' && typeof bilan?.kcalExtras === 'number'
                  ? (bilan.apportsTotaux - bilan.kcalExtras)
                  : '—'
              }</span> kcal
            </li>
            <li style={{marginBottom: 8}}>
              <span style={{fontWeight:600}}>Calories consommées (total avec extras)&nbsp;:</span> <span style={{fontWeight:700, color:'#1976d2'}}>{
                typeof bilan?.apportsTotaux === 'number' ? bilan.apportsTotaux : '—'
              }</span> kcal
            </li>
            {/* Objectif hebdomadaire (incluant extras) */}
            <li style={{marginBottom: 8}}>
              <span style={{fontWeight:600}}>Objectif hebdomadaire (incluant extras)&nbsp;:</span> <span style={{fontWeight:700}}>{
                typeof bilan?.objectifHebdo === 'number' ? bilan.objectifHebdo : '—'
              }</span> kcal
            </li>
            {/* Écart hebdomadaire */}
            <li style={{marginBottom: 8}}>
              <span style={{fontWeight:600}}>Écart hebdomadaire&nbsp;:</span> <span style={{fontWeight:700, color:'#e53935'}}>{
                typeof bilan?.apportsTotaux === 'number' && typeof bilan?.objectifHebdo === 'number'
                  ? ((bilan.apportsTotaux - bilan.objectifHebdo) > 0 ? '+' : '') + (bilan.apportsTotaux - bilan.objectifHebdo) + ' kcal'
                  : '—'
              }</span>
            </li>
          </ul>
          {/* Phrase de lecture automatique selon l'écart */}
          <div style={{marginTop: '0.7rem', fontStyle: 'italic', color: '#1976d2', fontSize: '1.04rem'}}>
            {(() => {
              if (typeof bilan?.apportsTotaux === 'number' && typeof bilan?.objectifHebdo === 'number') {
                const ecart = bilan.apportsTotaux - bilan.objectifHebdo;
                if (ecart < -100) {
                  return "Cette semaine crée un déficit énergétique. Elle va dans le sens de la perte de poids.";
                } else if (ecart > 100) {
                  return "Cette semaine est plus riche en énergie. Le corps aura besoin de temps pour s’ajuster.";
                } else {
                  return "Cette semaine est globalement en maintien. La trajectoire est stable.";
                }
              }
              return null;
            })()}
          </div>
        </section>
        {/* NOUVELLE SOUS-SECTION MÉTIER : Lecture des extras de la semaine (désormais après le résumé) */}
        <section style={{marginBottom: '2rem', background: '#fffef6', borderRadius: 10, padding: '1.1rem 1.3rem', boxShadow: '0 1px 4px #fde68a'}}>
          <h3 style={{color: '#b45309', marginBottom: '0.7rem', fontSize: '1.13rem'}}>Lecture des extras de la semaine</h3>
          <div style={{fontStyle: 'italic', color: '#444', marginBottom: '0.7rem', fontSize: '1.01rem'}}>
            Ici, on regarde comment les extras se sont exprimés cette semaine : par leur nombre et par leur poids calorique total.
          </div>
          <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '1.07rem'}}>
            <li style={{marginBottom: 7}}>
              <span style={{fontWeight:600}}>Nombre d’extras consommés&nbsp;:</span> <span style={{fontWeight:700, color:'#b45309'}}>{typeof bilan?.extras === 'number' ? bilan.extras : '—'}</span>
            </li>
            <li style={{marginBottom: 7}}>
              <span style={{fontWeight:600}}>Total kcal consommées via extras&nbsp;:</span> <span style={{fontWeight:700, color:'#eab308'}}>{typeof bilan?.kcalExtras === 'number' ? bilan.kcalExtras : '—'}</span> kcal
            </li>
            <li style={{marginBottom: 7}}>
              <span style={{fontWeight:600}}>Budget extras hebdo&nbsp;:</span> <span style={{fontWeight:700, color:'#2563eb'}}>{typeof bilan?.budgetExtras === 'number' ? bilan.budgetExtras : '—'}</span> kcal
            </li>
          </ul>
          <div style={{marginTop: '0.7rem', fontStyle: 'italic', color: '#2563eb', fontSize: '1.04rem'}}>
            {getVerbatimLectureExtras(bilan?.extras, bilan?.kcalExtras, bilan?.budgetExtras)}
          </div>
        </section>
      </div>
    </div>
  );
}
