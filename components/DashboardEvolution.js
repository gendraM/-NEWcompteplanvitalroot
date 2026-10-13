import { Line, Pie } from 'react-chartjs-2';

// Vues descriptives des données existantes ; aucun score/tendance inféré.
export default function DashboardEvolution({ view, onViewChange, poids, extras, repas, wellbeing, errors = [] }) {
  const sources = { poids: 'poids', extras: 'repas', repas: 'repas', wellbeing: 'humeurs' };
  const charts = { poids, extras, repas, wellbeing };
  const unavailable = errors.includes(sources[view]);
  const hasData = charts[view].datasets.some(dataset => dataset.data.some(value => value != null));
  return <section aria-labelledby="dashboard-evolution-title" style={{ border: '1px solid #e4edf7', borderRadius: 16, padding: 18, marginTop: 18 }}>
    <h2 id="dashboard-evolution-title">Mon évolution</h2>
    <label htmlFor="dashboard-evolution-view">Vue affichée : </label>
    <select id="dashboard-evolution-view" value={view} onChange={event => onViewChange(event.target.value)} style={{ padding: 8, borderRadius: 8 }}>
      <option value="poids">Poids</option><option value="extras">Extras</option><option value="repas">Repas</option><option value="wellbeing">Bien-être</option>
    </select>
    <p>{view === 'wellbeing' ? 'Répartition des humeurs renseignées sur la période.' : view === 'repas' ? 'Nombre d’occurrences de repas par jour renseigné.' : view === 'extras' ? 'Moments Extras observés ; les périodes sans saisie restent vides.' : 'Mesures de poids renseignées sur la période.'}</p>
    {unavailable ? <p role="status">Données indisponibles pour le moment.</p> : !hasData ? <p>Aucune observation sur cette période.</p> : <div style={{ height: 240, position: 'relative' }}>
      {view === 'wellbeing' ? <Pie data={charts[view]} options={{ maintainAspectRatio: false }} /> : <Line data={charts[view]} options={{ maintainAspectRatio: false, spanGaps: false }} />}
    </div>}
  </section>;
}
