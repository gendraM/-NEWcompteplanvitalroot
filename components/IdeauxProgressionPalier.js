export default function IdeauxProgressionPalier({ progression }) {
  if (!progression || progression.total === 0) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, fontWeight: 700, color: '#2e7d32', marginBottom: 5 }}>
        <span>Palier 1</span>
        <span>{progression.faites}/{progression.total} séances · {progression.pourcentage}%</span>
      </div>
      <div style={{ height: 8, background: '#e0e0e0', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progression.pourcentage}%`, background: '#43a047', transition: 'width .3s ease' }} />
      </div>
      {progression.termine && (
        <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: '#2e7d32' }}>
          🎉 Palier réalisé — la suite se construit à partir de ce que tu as réellement fait.
        </div>
      )}
    </div>
  );
}
