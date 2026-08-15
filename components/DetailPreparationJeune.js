import { useEffect, useMemo, useState } from 'react';
import { calculerStatistiquesPreparationsJeune } from '../lib/statistiquesPreparationsJeune';
import { comparerAvecPreparationPrecedente } from '../lib/comparePreparationsJeune';
import { getNotePreparationJeune, saveNotePreparationJeune } from '../lib/notesPreparationJeune';

function formatDate(dateValue) {
  if (!dateValue) return 'Date inconnue';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Date inconnue';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTrend(delta) {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

export default function DetailPreparationJeune({
  preparation,
  historiquePreparations = [],
  userId = null,
  onNotesUpdated,
}) {
  const [notes, setNotes] = useState('');
  const [saveState, setSaveState] = useState('');

  useEffect(() => {
    if (!preparation?.id) {
      setNotes('');
      return;
    }
    setNotes(getNotePreparationJeune(preparation.id, preparation));
    setSaveState('');
  }, [preparation]);

  const stats = useMemo(
    () => calculerStatistiquesPreparationsJeune(historiquePreparations),
    [historiquePreparations]
  );

  const comparaison = useMemo(
    () => comparerAvecPreparationPrecedente(historiquePreparations, preparation?.id),
    [historiquePreparations, preparation?.id]
  );

  if (!preparation) return null;

  const criteres = Array.isArray(preparation.criteres) ? preparation.criteres : [];
  const criteresValides = criteres.filter((c) => c?.valide);
  const criteresNonValides = criteres.filter((c) => !c?.valide);

  const handleSaveNotes = async () => {
    setSaveState('saving');
    const result = await saveNotePreparationJeune({
      preparationId: preparation.id,
      note: notes,
      userId,
    });

    if (result.success) {
      setSaveState('saved');
      if (onNotesUpdated) onNotesUpdated();
      setTimeout(() => setSaveState(''), 1800);
    } else {
      setSaveState('error');
      setTimeout(() => setSaveState(''), 2400);
    }
  };

  return (
    <div style={{ maxHeight: '72vh', overflowY: 'auto', paddingRight: 6 }}>
      <h3 style={{ marginTop: 0, marginBottom: 10, color: '#1976d2' }}>Détail préparation jeune</h3>
      <div style={{ marginBottom: 10, color: '#374151' }}>
        <b>Période :</b> {formatDate(preparation.dateDebut)} → {formatDate(preparation.dateFin)}
      </div>
      <div style={{ marginBottom: 16, color: '#374151' }}>
        <b>Résultat :</b> {Math.round(preparation.tauxReussite || 0)}% ({preparation.nbCriteresValides || 0}/
        {preparation.nbCriteresTotal || 0})
      </div>

      <div style={{ marginBottom: 14 }}>
        <b style={{ color: '#16a34a' }}>Critères validés</b>
        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
          {criteresValides.length > 0 ? (
            criteresValides.map((critere, idx) => (
              <li key={`${critere.id || idx}-ok`} style={{ color: '#16a34a' }}>
                {critere.label || critere.titre || critere.id}
              </li>
            ))
          ) : (
            <li style={{ color: '#6b7280' }}>Aucun critère validé</li>
          )}
        </ul>
      </div>

      <div style={{ marginBottom: 14 }}>
        <b style={{ color: '#ea580c' }}>Critères à améliorer</b>
        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
          {criteresNonValides.length > 0 ? (
            criteresNonValides.map((critere, idx) => (
              <li key={`${critere.id || idx}-ko`} style={{ color: '#ea580c' }}>
                {critere.label || critere.titre || critere.id}
              </li>
            ))
          ) : (
            <li style={{ color: '#6b7280' }}>Tous les critères sont validés</li>
          )}
        </ul>
      </div>

      {preparation.messagePerso ? (
        <div style={{ marginBottom: 12, color: '#1f2937' }}>
          <b>Message personnel :</b> {preparation.messagePerso}
        </div>
      ) : null}

      <div style={{ marginBottom: 16, padding: 12, border: '1px solid #dbeafe', borderRadius: 8, background: '#f8fbff' }}>
        <b style={{ color: '#2563eb' }}>Comparaison avec la préparation précédente</b>
        {!comparaison?.hasComparison ? (
          <div style={{ marginTop: 8, color: '#6b7280' }}>Aucune comparaison disponible.</div>
        ) : (
          <ul style={{ marginTop: 8, paddingLeft: 20, color: '#1f2937' }}>
            <li>Taux de réussite : {formatTrend(comparaison.tauxReussite.delta)} pts ({comparaison.tauxReussite.tendance})</li>
            <li>Critères validés : {formatTrend(comparaison.criteresValides.delta)} ({comparaison.criteresValides.tendance})</li>
          </ul>
        )}
      </div>

      <div style={{ marginBottom: 16, padding: 12, border: '1px solid #d1fae5', borderRadius: 8, background: '#f8fffb' }}>
        <b style={{ color: '#047857' }}>Statistiques globales historique</b>
        <ul style={{ marginTop: 8, paddingLeft: 20, color: '#1f2937' }}>
          <li>Total préparations : {stats.totalPreparations}</li>
          <li>Moyenne critères validés : {stats.moyenneCriteresValides}</li>
          <li>Moyenne taux réussite : {stats.moyenneTauxReussite}%</li>
          <li>Évolution : {stats.evolution.map((e) => `${e.index}:${Math.round(e.tauxReussite)}%`).join(' | ') || 'n/a'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: 8 }}>
        <b style={{ color: '#334155' }}>Notes personnelles (modifiable après coup)</b>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Ajoute ici tes notes personnelles sur cette préparation..."
        style={{
          width: '100%',
          minHeight: 110,
          borderRadius: 8,
          border: '1px solid #cbd5e1',
          padding: 10,
          fontFamily: 'inherit',
          fontSize: 14,
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
        <button
          onClick={handleSaveNotes}
          style={{
            background: '#0ea5e9',
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            padding: '8px 14px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Enregistrer les notes
        </button>
        {saveState === 'saving' && <span style={{ color: '#64748b' }}>Sauvegarde…</span>}
        {saveState === 'saved' && <span style={{ color: '#16a34a' }}>Notes enregistrées ✅</span>}
        {saveState === 'error' && <span style={{ color: '#dc2626' }}>Erreur de sauvegarde ❌</span>}
      </div>
    </div>
  );
}
