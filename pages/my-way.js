import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  archiveMyWayItem,
  createMyWayItem,
  getMonPourquoi,
  getMyWayItems,
  updateMyWayItem,
} from '../lib/myWayAPI';

const CONFIG = {
  direction: {
    title: 'Qui je choisis de devenir',
    helper: "Tu peux poser une première direction si elle est déjà claire pour toi. Elle pourra évoluer.",
    placeholder: 'Ex. Je veux devenir quelqu’un qui prend soin de soi avec constance, sans perfectionnisme.',
  },
  aspiration: {
    title: 'Ce que je veux vivre davantage',
    helper: "Une aspiration peut rester une aspiration. Elle n'a pas besoin de devenir tout de suite un objectif.",
    placeholder: 'Ex. Retrouver plus de liberté physique dans mon quotidien.',
  },
  incarnation: {
    title: 'Comment cette personne vit',
    helper: "Une manière de vivre ou de revenir à toi, pas une liste de tâches.",
    placeholder: 'Ex. Elle revient après un écart au lieu de tout abandonner.',
  },
};

export default function MyWayPage() {
  const [pourquoi, setPourquoi] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [journeyChoice, setJourneyChoice] = useState(null); // know | discover | null
  const [activeType, setActiveType] = useState(null);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [monPourquoi, myWayItems] = await Promise.all([getMonPourquoi(), getMyWayItems()]);
      setPourquoi(monPourquoi);
      setItems(myWayItems);
    } catch (err) {
      console.error('Erreur chargement My Way:', err);
      setError("Impossible de charger My Way pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const visibleItems = useMemo(() => items.filter((item) => item.status !== 'archived'), [items]);
  const byType = useMemo(() => ({
    direction: visibleItems.filter((item) => item.item_type === 'direction'),
    aspiration: visibleItems.filter((item) => item.item_type === 'aspiration'),
    incarnation: visibleItems.filter((item) => item.item_type === 'incarnation'),
    grow: visibleItems.filter((item) => item.item_type === 'grow'),
  }), [visibleItems]);

  const hasPersonalContent = byType.direction.length > 0 || byType.aspiration.length > 0 || byType.incarnation.length > 0;

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
      if (!journeyChoice) setJourneyChoice('know');
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
      <div key={item.id} style={itemStyle}>
        {isEditing ? (
          <>
            <textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} rows={3} style={textareaStyle} />
            <div style={buttonRowStyle}>
              <button onClick={() => handleUpdate(item.id)} disabled={saving} style={primaryButtonStyle}>Enregistrer</button>
              <button onClick={() => { setEditingId(null); setEditingContent(''); }} style={secondaryButtonStyle}>Annuler</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ color: '#273043', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{item.content}</div>
            <div style={buttonRowStyle}>
              <button onClick={() => { setEditingId(item.id); setEditingContent(item.content); }} style={textButtonStyle}>Modifier</button>
              <button onClick={() => handleArchive(item.id)} disabled={saving} style={archiveButtonStyle}>Archiver</button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderAddForm = (type) => {
    const config = CONFIG[type];
    return activeType === type ? (
      <div style={{ marginTop: 12 }}>
        <textarea autoFocus value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder={config.placeholder} rows={4} style={textareaStyle} />
        <div style={buttonRowStyle}>
          <button onClick={() => handleCreate(type)} disabled={!newContent.trim() || saving} style={primaryButtonStyle}>Enregistrer</button>
          <button onClick={() => { setActiveType(null); setNewContent(''); }} style={secondaryButtonStyle}>Pas maintenant</button>
        </div>
      </div>
    ) : null;
  };

  const renderSection = (type, showAdd = true) => {
    const config = CONFIG[type];
    return (
      <section style={panelStyle}>
        <h2 style={sectionTitleStyle}>{config.title}</h2>
        <p style={helperStyle}>{config.helper}</p>
        {byType[type].map(renderItem)}
        {showAdd && activeType !== type && (
          <button onClick={() => { setActiveType(type); setNewContent(''); }} style={secondaryButtonStyle}>+ Ajouter</button>
        )}
        {renderAddForm(type)}
      </section>
    );
  };

  if (loading) return <main style={pageStyle}><div style={panelStyle}>Chargement de My Way…</div></main>;

  const showDirection = hasPersonalContent || journeyChoice === 'know';
  const showAspiration = byType.aspiration.length > 0 || byType.direction.length > 0;
  const showIncarnation = byType.incarnation.length > 0 || byType.aspiration.length > 0;

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <Link href="/tableau-de-bord" style={{ color: '#5b5bd6', textDecoration: 'none', fontWeight: 700 }}>← Retour au tableau de bord</Link>

        <div style={{ margin: '20px 0 26px' }}>
          <div style={eyebrowStyle}>My Way</div>
          <h1 style={{ margin: '6px 0 8px', fontSize: 34, color: '#273043' }}>Ce qui compte pour moi et ce que je construis</h1>
          <p style={{ margin: 0, color: '#667085', fontSize: 17, lineHeight: 1.6 }}>
            My Way se construit avec toi. Tu n'as rien à compléter d'un seul coup.
          </p>
        </div>

        {error && <div style={{ ...panelStyle, borderColor: '#fecaca', background: '#fff7f7', color: '#b42318' }}>{error}</div>}

        <section style={{ ...panelStyle, background: 'linear-gradient(135deg, #f8f5ff 0%, #eef7ff 100%)', borderColor: '#ddd6fe' }}>
          <div style={eyebrowStyle}>Le point de départ</div>
          <h2 style={sectionTitleStyle}>Pourquoi j'ai commencé</h2>
          {pourquoi ? <p style={{ fontSize: 18, lineHeight: 1.6, color: '#344054', marginBottom: 0 }}>{pourquoi}</p> : <p style={helperStyle}>Ton Pourquoi n'est pas encore renseigné dans ton profil.</p>}
        </section>

        {!hasPersonalContent && journeyChoice === null && (
          <section style={panelStyle}>
            <h2 style={sectionTitleStyle}>Et derrière cet objectif, qu'est-ce que tu veux construire ?</h2>
            <p style={helperStyle}>Tu n'as pas besoin d'avoir la réponse aujourd'hui.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <button onClick={() => { setJourneyChoice('know'); setActiveType('direction'); }} style={choiceButtonStyle}>
                <strong>J'ai déjà une idée</strong>
                <span style={choiceTextStyle}>Je veux poser une première direction avec mes mots.</span>
              </button>
              <button onClick={() => setJourneyChoice('discover')} style={choiceButtonStyle}>
                <strong>Je veux la découvrir en avançant</strong>
                <span style={choiceTextStyle}>Je continue mon parcours sans me forcer à définir tout maintenant.</span>
              </button>
            </div>
          </section>
        )}

        {journeyChoice === 'discover' && !hasPersonalContent && (
          <section style={{ ...panelStyle, borderColor: '#d1fadf', background: '#f6fef9' }}>
            <h2 style={sectionTitleStyle}>Alors on avance comme ça.</h2>
            <p style={helperStyle}>Continue à vivre ton parcours. Quand quelque chose deviendra plus clair ou qu'un changement réel apparaîtra, My Way pourra s'enrichir sans te demander de tout définir à l'avance.</p>
            <Link href="/tableau-de-bord" style={{ ...primaryButtonStyle, display: 'inline-block', textDecoration: 'none' }}>Continuer mon parcours</Link>
          </section>
        )}

        {showDirection && renderSection('direction')}

        {showDirection && byType.direction.length > 0 && !showAspiration && (
          <section style={invitationStyle}>
            <div style={{ fontWeight: 800, color: '#344054', marginBottom: 6 }}>Tu veux aller un peu plus loin ?</div>
            <div style={helperStyle}>Seulement si quelque chose te vient déjà.</div>
            <button onClick={() => setActiveType('aspiration')} style={secondaryButtonStyle}>J'ai une aspiration à poser</button>
          </section>
        )}

        {showAspiration && (byType.aspiration.length > 0 || activeType === 'aspiration') && renderSection('aspiration')}

        {showAspiration && byType.aspiration.length > 0 && !showIncarnation && (
          <section style={invitationStyle}>
            <div style={{ fontWeight: 800, color: '#344054', marginBottom: 6 }}>Et si c'est déjà clair pour toi…</div>
            <div style={helperStyle}>Tu peux poser une manière de vivre qui correspond à cette direction. Sinon, tu peux t'arrêter ici.</div>
            <button onClick={() => setActiveType('incarnation')} style={secondaryButtonStyle}>J'ai une manière de vivre à poser</button>
          </section>
        )}

        {showIncarnation && (byType.incarnation.length > 0 || activeType === 'incarnation') && renderSection('incarnation')}

        {byType.grow.length > 0 && (
          <section style={panelStyle}>
            <div style={eyebrowStyle}>Grow</div>
            <h2 style={sectionTitleStyle}>Ce que mon parcours m'a déjà montré</h2>
            <p style={helperStyle}>Ces éléments viennent de faits observés dans ton parcours.</p>
            {byType.grow.map(renderItem)}
          </section>
        )}
      </div>
    </main>
  );
}

const pageStyle = { minHeight: '100vh', background: '#f7f8fc', padding: '28px 20px 60px', fontFamily: 'Arial, sans-serif' };
const panelStyle = { background: '#fff', border: '1px solid #eaecf0', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 10px rgba(16, 24, 40, 0.04)' };
const invitationStyle = { ...panelStyle, background: '#fafafa' };
const itemStyle = { border: '1px solid #e4e7ec', borderRadius: 12, padding: 14, background: '#fff', marginBottom: 10 };
const textareaStyle = { width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid #cbd5e1', padding: 12, fontSize: 15, resize: 'vertical' };
const buttonRowStyle = { display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' };
const sectionTitleStyle = { margin: '4px 0 8px', color: '#273043', fontSize: 22 };
const helperStyle = { marginTop: 0, color: '#667085', lineHeight: 1.55 };
const eyebrowStyle = { fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.7, color: '#6d5bbd' };
const primaryButtonStyle = { background: '#5b5bd6', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 14px', fontWeight: 800, cursor: 'pointer' };
const secondaryButtonStyle = { background: '#fff', color: '#475467', border: '1px solid #d0d5dd', borderRadius: 9, padding: '9px 14px', fontWeight: 700, cursor: 'pointer' };
const textButtonStyle = { ...secondaryButtonStyle, padding: '6px 10px', fontSize: 13 };
const archiveButtonStyle = { ...textButtonStyle, color: '#b54708', borderColor: '#fedf89', background: '#fffaeb' };
const choiceButtonStyle = { textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8, background: '#fff', border: '1px solid #d0d5dd', borderRadius: 14, padding: 18, cursor: 'pointer', color: '#344054', fontSize: 16 };
const choiceTextStyle = { color: '#667085', lineHeight: 1.45, fontWeight: 400 };
