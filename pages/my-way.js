import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  archiveMyWayItem,
  createMyWayItem,
  getMonPourquoi,
  getMyWayItems,
  updateMyWayItem,
} from '../lib/myWayAPI';

const SECTION_CONFIG = {
  direction: {
    title: 'Qui je choisis de devenir',
    helper: "Si tu le sais déjà, tu peux le poser ici. Sinon, rien à forcer : ton parcours peut t'aider à le découvrir.",
    placeholder: 'Ex. Je veux devenir quelqu’un qui prend soin de soi avec constance, sans perfectionnisme.',
  },
  aspiration: {
    title: 'Ce que je veux vivre davantage',
    helper: "Une aspiration peut rester une aspiration. Elle n'a pas besoin de devenir tout de suite un objectif.",
    placeholder: 'Ex. Retrouver plus de liberté physique dans mon quotidien.',
  },
  incarnation: {
    title: 'Comment cette personne vit',
    helper: "Ici, on parle de manière de vivre et de se traiter, pas d'une liste de tâches.",
    placeholder: 'Ex. Elle revient après un écart au lieu de tout abandonner.',
  },
};

export default function MyWayPage() {
  const [pourquoi, setPourquoi] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeType, setActiveType] = useState(null);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [monPourquoi, myWayItems] = await Promise.all([
        getMonPourquoi(),
        getMyWayItems(),
      ]);
      setPourquoi(monPourquoi);
      setItems(myWayItems);
    } catch (err) {
      console.error('Erreur chargement My Way:', err);
      setError("Impossible de charger My Way pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const groupedItems = useMemo(() => {
    return Object.keys(SECTION_CONFIG).reduce((acc, type) => {
      acc[type] = items.filter((item) => item.item_type === type && item.status !== 'archived');
      return acc;
    }, {});
  }, [items]);

  const growItems = useMemo(
    () => items.filter((item) => item.item_type === 'grow' && item.status !== 'archived'),
    [items]
  );

  const handleCreate = async (type) => {
    const content = newContent.trim();
    if (!content || saving) return;
    setSaving(true);
    setError('');
    try {
      const created = await createMyWayItem({ itemType: type, content });
      setItems((current) => [...current, created]);
      setNewContent('');
      setActiveType(null);
    } catch (err) {
      console.error('Erreur ajout My Way:', err);
      setError("L'élément n'a pas pu être enregistré.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    const content = editingContent.trim();
    if (!content || saving) return;
    setSaving(true);
    setError('');
    try {
      const updated = await updateMyWayItem(id, { content });
      setItems((current) => current.map((item) => item.id === id ? updated : item));
      setEditingId(null);
      setEditingContent('');
    } catch (err) {
      console.error('Erreur modification My Way:', err);
      setError("La modification n'a pas pu être enregistrée.");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id) => {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const archived = await archiveMyWayItem(id);
      setItems((current) => current.map((item) => item.id === id ? archived : item));
    } catch (err) {
      console.error('Erreur archivage My Way:', err);
      setError("L'élément n'a pas pu être archivé.");
    } finally {
      setSaving(false);
    }
  };

  const renderItem = (item) => {
    const isEditing = editingId === item.id;
    return (
      <div key={item.id} style={{
        border: '1px solid #e4e7ec',
        borderRadius: 12,
        padding: 14,
        background: '#fff',
        marginBottom: 10,
      }}>
        {isEditing ? (
          <>
            <textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              rows={3}
              style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid #cbd5e1', padding: 10, fontSize: 15, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <button onClick={() => handleUpdate(item.id)} disabled={saving} style={primaryButtonStyle}>Enregistrer</button>
              <button onClick={() => { setEditingId(null); setEditingContent(''); }} style={secondaryButtonStyle}>Annuler</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ color: '#273043', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{item.content}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <button onClick={() => { setEditingId(item.id); setEditingContent(item.content); }} style={textButtonStyle}>Modifier</button>
              <button onClick={() => handleArchive(item.id)} disabled={saving} style={archiveButtonStyle}>Archiver</button>
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return <main style={pageStyle}><div style={panelStyle}>Chargement de My Way…</div></main>;
  }

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Link href="/tableau-de-bord" style={{ color: '#5b5bd6', textDecoration: 'none', fontWeight: 700 }}>← Retour au tableau de bord</Link>

        <div style={{ margin: '20px 0 26px' }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.7, color: '#6d5bbd', textTransform: 'uppercase' }}>My Way</div>
          <h1 style={{ margin: '6px 0 8px', fontSize: 36, color: '#273043' }}>Ce qui compte pour moi et ce que je construis</h1>
          <p style={{ margin: 0, color: '#667085', fontSize: 17, lineHeight: 1.6 }}>
            Tu peux écrire ce que tu sais déjà et laisser le reste se découvrir dans la vraie vie. Rien ici n'a besoin d'être complet.
          </p>
        </div>

        {error && <div style={{ ...panelStyle, borderColor: '#fecaca', background: '#fff7f7', color: '#b42318', marginBottom: 16 }}>{error}</div>}

        <section style={{ ...panelStyle, background: 'linear-gradient(135deg, #f8f5ff 0%, #eef7ff 100%)', borderColor: '#ddd6fe' }}>
          <div style={eyebrowStyle}>La graine</div>
          <h2 style={sectionTitleStyle}>Pourquoi j'ai commencé</h2>
          {pourquoi ? (
            <p style={{ fontSize: 18, lineHeight: 1.6, color: '#344054', marginBottom: 0 }}>{pourquoi}</p>
          ) : (
            <p style={{ color: '#667085', marginBottom: 0 }}>Ton Pourquoi n'est pas encore renseigné dans ton profil.</p>
          )}
          <div style={{ marginTop: 14, fontSize: 14, color: '#667085' }}>
            Cette phrase vient directement de ton profil : My Way ne la duplique pas.
          </div>
        </section>

        {Object.entries(SECTION_CONFIG).map(([type, config]) => (
          <section key={type} style={panelStyle}>
            <h2 style={sectionTitleStyle}>{config.title}</h2>
            <p style={helperStyle}>{config.helper}</p>

            {(groupedItems[type] || []).map(renderItem)}

            {activeType === type ? (
              <div style={{ marginTop: 12 }}>
                <textarea
                  autoFocus
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={config.placeholder}
                  rows={4}
                  style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid #cbd5e1', padding: 12, fontSize: 15, resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => handleCreate(type)} disabled={!newContent.trim() || saving} style={primaryButtonStyle}>Enregistrer</button>
                  <button onClick={() => { setActiveType(null); setNewContent(''); }} style={secondaryButtonStyle}>Pas maintenant</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setActiveType(type); setNewContent(''); }} style={secondaryButtonStyle}>
                + Ajouter quand je sais
              </button>
            )}
          </section>
        ))}

        <section style={panelStyle}>
          <div style={eyebrowStyle}>Grow</div>
          <h2 style={sectionTitleStyle}>Ce que mon parcours m'a déjà montré</h2>
          <p style={helperStyle}>
            Ici, My Way accueillera des faits et transformations réellement observés dans ton parcours. Tu ne dois rien déclarer manuellement.
          </p>
          {growItems.length > 0 ? growItems.map(renderItem) : (
            <div style={{ color: '#98a2b3', fontStyle: 'italic' }}>Rien à afficher pour le moment — et c'est normal.</div>
          )}
        </section>
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: '100vh',
  background: '#f7f8fc',
  padding: '28px 20px 60px',
  fontFamily: 'Arial, sans-serif',
};

const panelStyle = {
  background: '#fff',
  border: '1px solid #eaecf0',
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  boxShadow: '0 2px 10px rgba(16, 24, 40, 0.04)',
};

const sectionTitleStyle = {
  margin: '4px 0 8px',
  color: '#273043',
  fontSize: 22,
};

const helperStyle = {
  marginTop: 0,
  color: '#667085',
  lineHeight: 1.55,
};

const eyebrowStyle = {
  fontSize: 12,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: 0.7,
  color: '#6d5bbd',
};

const primaryButtonStyle = {
  background: '#5b5bd6',
  color: '#fff',
  border: 'none',
  borderRadius: 9,
  padding: '9px 14px',
  fontWeight: 800,
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  background: '#fff',
  color: '#475467',
  border: '1px solid #d0d5dd',
  borderRadius: 9,
  padding: '9px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const textButtonStyle = {
  ...secondaryButtonStyle,
  padding: '6px 10px',
  fontSize: 13,
};

const archiveButtonStyle = {
  ...textButtonStyle,
  color: '#b54708',
  borderColor: '#fedf89',
  background: '#fffaeb',
};
