import React from 'react';

export default function DefiCard({ defi }) {
  return (
    <div style={{
      display: 'inline-block',
      minWidth: 260,
      maxWidth: 320,
      margin: '0.7rem',
      padding: '1.1rem 0.7rem 0.7rem 0.7rem',
      borderRadius: '16px',
      background: '#fff',
      boxShadow: '0 2px 8px #e0e0e0',
      border: '2px solid #667eea',
      position: 'relative',
      verticalAlign: 'top',
      textAlign: 'left',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{fontSize:'2rem', marginBottom:'0.3rem'}}>
        {defi.type === 'discipline' && '🏅'}
        {defi.type === 'motivation' && '🎯'}
        {defi.type === 'organisation' && '⏱️'}
        {defi.type === 'apprentissage' && '📖'}
        {defi.type === 'bienveillance' && '💚'}
        {defi.type === 'adaptation' && '🩸'}
        {defi.type === 'gestion du stress' && '🧘'}
        {defi.type === 'flexibilite' && '🧳'}
        {defi.type === 'sante' && '🩺'}
      </div>
      <div style={{fontWeight:700, fontSize:'1.08rem', color:'#1976d2', marginBottom:6}}>{defi.titre}</div>
      <div style={{fontSize:'0.98rem', color:'#444', marginBottom:10}}>{defi.description}</div>
      <div style={{fontSize:'0.93rem', color:'#888', marginBottom:4}}>
        {defi.duree} jours
      </div>
      {defi.origine && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 12,
          fontSize: '0.85rem',
          color: '#fff',
          background: defi.origine === 'difficulte' ? '#ff9800' : defi.origine === 'contexte' ? '#1976d2' : '#888',
          borderRadius: 8,
          padding: '2px 10px',
          fontWeight: 600,
          letterSpacing: 0.5,
        }}>
          {defi.origine === 'difficulte' ? 'Difficulté' : defi.origine === 'contexte' ? 'Contexte' : 'Générique'}
        </div>
      )}
    </div>
  );
}
