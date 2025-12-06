import React from 'react';

/**
 * PhaseCard — Composant dynamique
 * Affiche une phase de préparation, son titre, sa période, et ses critères.
 * Props :
 *   - phase (object) : { nom, explication, periode, criteres }
 *   - criteres (array) : [{ id, titre, conseil, jalon, valide, dateValidation, statut }]
 *   - onValider (function) : callback pour valider un critère (optionnel)
 *   - jCourant (number) : jour courant relatif (ex: -25, -17, -10)
 */
export default function PhaseCard({ phase, criteres = [], onValider, jCourant }) {
  return (
    <section
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '28px 24px 18px 24px',
        marginBottom: 28,
        boxShadow: '0 2px 16px 0 rgba(79,143,255,0.07)',
        border: '1px solid #E3EAF2',
        maxWidth: 700,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      <h2
        style={{
          color: '#4F8FFF',
          fontWeight: 800,
          fontSize: '1.35rem',
          fontFamily: 'Inter, Roboto, Arial, sans-serif',
          marginBottom: 6,
        }}
      >
        {phase.nom}
      </h2>
      <div style={{ color: '#6B778C', marginBottom: 10, fontSize: '1.04em', fontFamily: 'Inter, Roboto, Arial, sans-serif' }}>{phase.explication}</div>
      <div style={{ color: '#FFD166', fontWeight: 600, marginBottom: 12, fontSize: '1.01em' }}>Période : {phase.periode}</div>
      <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none' }}>
        {criteres.map(critere => {
          // Calcul du statut dynamique
          const jalon = critere.jalon * -1; // Convertir J-30 → -30
          let statut = 'À VENIR';
          let couleurStatut = '#A0AEC0';
          let actionPossible = false;
          
          if (jCourant !== null && jCourant !== undefined) {
            if (jCourant < jalon) {
              statut = 'À VENIR';
              couleurStatut = '#A0AEC0';
            } else {
              // Vérifier si dans la fenêtre de validation
              const fenetre = 
                jalon === -30 ? -18 : 
                [-17, -14, -12].includes(jalon) ? -8 : 
                jalon === -7 ? 0 : jalon;
              
              if (jCourant >= jalon && jCourant <= fenetre) {
                statut = jCourant === jalon ? 'EN COURS' : 'ACTIF';
                couleurStatut = '#43D9A3';
                actionPossible = true;
              } else {
                statut = 'VERROUILLÉ';
                couleurStatut = '#FF6B6B';
              }
            }
          }
          
          return (
            <li
              key={critere.id}
              style={{
                marginBottom: 16,
                background: critere.valide ? '#F5F8FA' : statut === 'VERROUILLÉ' ? '#FFF5F5' : '#fff',
                borderRadius: 10,
                boxShadow: critere.valide ? '0 1px 6px 0 rgba(67,217,163,0.08)' : 'none',
                padding: '12px 16px',
                border: critere.valide ? '1px solid #43D9A3' : statut === 'VERROUILLÉ' ? '1px solid #FF6B6B' : '1px solid #E3EAF2',
                transition: 'all 0.2s',
                opacity: statut === 'VERROUILLÉ' && !critere.valide ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontWeight: 700, color: '#4F8FFF', fontSize: '1.07em' }}>{critere.titre}</div>
                <span style={{ 
                  fontWeight: 700, 
                  fontSize: '0.88em', 
                  color: couleurStatut,
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: statut === 'VERROUILLÉ' ? '#FFE5E5' : statut === 'À VENIR' ? '#F5F8FA' : '#E5F8F2',
                }}>
                  {statut}
                </span>
              </div>
              <div style={{ color: '#6B778C', fontSize: '0.99em', marginBottom: 2 }}>{critere.conseil}</div>
              <div style={{ color: '#A0AEC0', fontSize: '0.97em', marginBottom: 2 }}>Jalon : J-{critere.jalon}</div>
              {critere.valide ? (
                <span style={{ color: '#43D9A3', fontWeight: 700, fontSize: '0.99em' }}>✅ Validé le {critere.dateValidation ? new Date(critere.dateValidation).toLocaleDateString('fr-FR') : ''}</span>
              ) : statut === 'VERROUILLÉ' ? (
                <div style={{ color: '#FF6B6B', fontSize: '0.95em', marginTop: 6, fontWeight: 600 }}>
                  🔒 Ce critère devait démarrer à J-{critere.jalon}. Concentre-toi sur les critères restants.
                </div>
              ) : (
                onValider && actionPossible && (
                  <button
                    onClick={() => onValider(critere.id)}
                    style={{
                      background: '#4F8FFF',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '7px 22px',
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: 'pointer',
                      marginTop: 6,
                      boxShadow: '0 2px 8px 0 rgba(79,143,255,0.10)',
                      fontFamily: 'Inter, Roboto, Arial, sans-serif',
                      transition: 'background 0.2s',
                    }}
                    aria-label={`Valider le critère ${critere.titre}`}
                  >
                    Valider ce critère
                  </button>
                )
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
