import React from 'react';

export default function HeaderPreparation() {
  return (
    <header
      style={{
        background: '#F5F8FA',
        padding: '32px 0 28px 0',
        textAlign: 'center',
        borderRadius: 16,
        marginBottom: 32,
        boxShadow: '0 4px 24px 0 rgba(79,143,255,0.08)',
        border: '1px solid #E3EAF2',
        maxWidth: 700,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      <h1
        style={{
          color: '#4F8FFF',
          fontWeight: 800,
          fontSize: '2.2rem',
          fontFamily: 'Inter, Roboto, Arial, sans-serif',
          margin: 0,
          letterSpacing: '-0.5px',
        }}
      >
        🌙 Ma préparation au jeûne
      </h1>
      <p
        style={{
          color: '#6B778C',
          fontSize: '1.1rem',
          fontFamily: 'Inter, Roboto, Arial, sans-serif',
          marginTop: 12,
          marginBottom: 0,
        }}
      >
        Préparez-vous sereinement, étape par étape, dans un espace lumineux et motivant.
      </p>
    </header>
  );
}
