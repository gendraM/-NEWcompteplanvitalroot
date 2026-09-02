import Link from 'next/link';

export default function MyWayDashboardEntry() {
  return (
    <div style={{
      maxWidth: 1120,
      margin: '18px auto 0',
      padding: '0 20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #f8f5ff 0%, #eef7ff 100%)',
        border: '1px solid #ddd6fe',
        borderRadius: 18,
        padding: '20px 22px',
        boxShadow: '0 4px 14px rgba(76, 81, 191, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 18,
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1 1 420px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.6, color: '#6d5bbd', textTransform: 'uppercase', marginBottom: 6 }}>
            My Way
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#273043', marginBottom: 6 }}>
            Ce qui compte pour moi et ce que je construis
          </div>
          <div style={{ color: '#5f6878', lineHeight: 1.5, maxWidth: 720 }}>
            Retrouve ton Pourquoi, pose ce que tu sais déjà de ta direction et laisse le reste se préciser au fil de ton parcours.
          </div>
        </div>
        <Link href="/my-way" style={{
          display: 'inline-block',
          textDecoration: 'none',
          background: '#5b5bd6',
          color: '#fff',
          borderRadius: 12,
          padding: '12px 18px',
          fontWeight: 800,
          whiteSpace: 'nowrap'
        }}>
          Ouvrir My Way
        </Link>
      </div>
    </div>
  );
}
