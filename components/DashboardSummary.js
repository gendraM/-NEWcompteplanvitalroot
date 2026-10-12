import Link from 'next/link';

// Restauration de la synthèse V2 existante. Les règles de priorité et highlights
// non validées ne sont pas affichées tant que l'arbitrage produit reste ouvert.
export default function DashboardSummary({ synthese, errors = [] }) {
  const { weightStatus: poids, extrasStatus: extras, mealSignals: repas, activeIdeal, activeChallenge } = synthese;
  const card = { background: '#fff', border: '1px solid #edf1f5', borderRadius: 14, padding: 16 };
  return <section aria-labelledby="dashboard-summary-title" style={{ background: '#f7fbff', border: '1px solid #e4edf7', borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem' }}>
    <h2 id="dashboard-summary-title" style={{ color: '#17324d', marginTop: 0 }}>Mon chemin maintenant</h2>
    <p>Les observations de la période et les repères de ton parcours.</p>
    {errors.length > 0 && <p role="status">Certaines données n’ont pas pu être chargées : {errors.map(code => ({ poids: 'Poids', repas: 'Repas', humeurs: 'Bien-être', semaines: 'Extras', profil: 'Profil', badges: 'Badges', evenementsExtras: 'Historique Extras', defis: 'Défis', dernierFastFood: 'Fast-food', ideaux: 'Idéaux', periodes: 'Périodes reconstituées' }[code] || 'Parcours')).join(', ')}. Elles ne sont pas considérées comme absentes.</p>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12 }}>
      <div style={card}>
        <h3>Dernier poids de la période</h3>
        <strong>{poids.disponible ? `${poids.actuel.poids} kg` : '—'}</strong>
        {poids.disponible && <p>Mesuré le {new Date(`${poids.actuel.date}T12:00:00`).toLocaleDateString('fr-FR')}.</p>}
        <p>Départ du parcours : {errors.includes('profil') ? 'indisponible' : poids.departParcours == null ? 'non renseigné' : `${poids.departParcours} kg`}</p>
        {poids.disponible && <p>Première mesure de la période : {poids.debutPeriode.poids} kg.</p>}
        <p>Objectif : {errors.includes('profil') ? 'indisponible' : poids.objectif == null ? 'non renseigné' : `${poids.objectif} kg`}</p>
        <p>{poids.suffisantPourTendance ? `${poids.variationDepuisDepart > 0 ? '+' : ''}${poids.variationDepuisDepart} kg sur la période.` : 'Pas encore de variation mesurable sur cette période.'}</p>
        <Link href="/suivi-poids">Voir mon suivi du poids</Link>
      </div>
      <div style={card}>
        <h3>Rythme Extras du parcours</h3>
        <strong>{extras.disponible ? `Palier ${extras.palier}` : '—'}</strong>
        <p>{errors.includes('semaines') ? 'Données Extras indisponibles pour le moment.' : extras.message}</p>
        <p>Repère calculé sur l’historique des semaines renseignées.</p>
      </div>
      <div style={card}>
        <h3>Repas renseignés</h3>
        <strong>{repas.disponible ? repas.nombreRepas : '—'}</strong>
        <p>Occurrences de repas sur la période.</p>
        <p>Satiété respectée : {errors.includes('repas') ? 'indisponible' : repas.satiete.pourcentageRespectee === null ? 'non renseignée' : `${repas.satiete.pourcentageRespectee}% des ${repas.satiete.renseignee} occurrences renseignées`}</p>
        <Link href="/suivi">Voir mon suivi</Link>
      </div>
    </div>
    {synthese.couverture && !errors.some(code => ['repas', 'periodes'].includes(code)) && <p>
      Suivi alimentaire : {synthese.couverture.joursObserves} jours observés,
      {' '}{synthese.couverture.joursReconstitues} reconstitués,
      {' '}{synthese.couverture.joursSansDonnee} sans donnée sur la période. Une absence de saisie n’est pas un échec.
    </p>}
    <h3>En ce moment</h3>
    <p>{errors.includes('defis') ? 'Défis indisponibles pour le moment.' : activeChallenge?.anomaliePlusieursActifs ? 'Plusieurs défis sont marqués en cours : à vérifier dans le module.' : activeChallenge ? `Défi : ${activeChallenge.nom}. La progression détaillée est indisponible pour le moment.` : 'Aucun défi actif renseigné.'} <Link href="/defis">Mes défis</Link></p>
    <p>{errors.includes('ideaux') ? 'Idéaux indisponibles pour le moment.' : activeIdeal ? `Cap actif : ${activeIdeal.titre}.` : 'Aucun Idéal actif renseigné.'} <Link href="/ideaux">Mes Idéaux</Link></p>
    <a href="#dashboard-details-existants">Détails & analyses ↓</a>
  </section>;
}
