import Link from 'next/link';

// Synthèse factuelle validée, sans classement ou seuil de réussite inventé.
export default function DashboardSummary({ synthese, errors = [], children, extrasChart }) {
  const { weightStatus: poids, extrasStatus: extras, mealSignals: repas, activeIdeal, activeChallenge } = synthese;

  return <section aria-labelledby="dashboard-summary-title" className="mpv-cockpit">
    <h2 id="dashboard-summary-title" className="mpv-sr-only">Mon chemin maintenant</h2>

    {errors.length > 0 && <p role="status">Certaines données n’ont pas pu être chargées : {errors.map(code => ({ poids: 'Poids', repas: 'Repas', humeurs: 'Bien-être', semaines: 'Extras', profil: 'Profil', badges: 'Badges', evenementsExtras: 'Historique Extras', defis: 'Défis', dernierFastFood: 'Fast-food', ideaux: 'Idéaux', periodes: 'Périodes reconstituées' }[code] || 'Parcours')).join(', ')}. Elles ne sont pas considérées comme absentes.</p>}
    <div className="mpv-kpis">
      <div className="mpv-kpi mpv-weight">
        <h3>Dernier poids de la période</h3>
        <strong>{poids.disponible ? `${poids.actuel.poids} kg` : '—'}</strong>
        {poids.disponible && <p>Mesuré le {new Date(`${poids.actuel.date}T12:00:00`).toLocaleDateString('fr-FR')}.</p>}
        <p>Départ du parcours : {errors.includes('profil') ? 'indisponible' : poids.departParcours == null ? 'non renseigné' : `${poids.departParcours} kg`}</p>
        {poids.disponible && <p>Première mesure de la période : {poids.debutPeriode.poids} kg.</p>}
        <p>Objectif : {errors.includes('profil') ? 'indisponible' : poids.objectif == null ? 'non renseigné' : `${poids.objectif} kg`}</p>
        <p>{poids.suffisantPourTendance ? `${poids.variationDepuisDepart > 0 ? '+' : ''}${poids.variationDepuisDepart} kg sur la période.` : 'Pas encore de variation mesurable sur cette période.'}</p>
        <Link href="/suivi-poids">Voir mon suivi du poids</Link>
      </div>
      <div className="mpv-kpi mpv-extras">
        <h3>Rythme Extras du parcours</h3>
        <strong>{extras.disponible ? `Palier ${extras.palier}` : '—'}</strong>
        <p>{errors.includes('semaines') ? 'Données Extras indisponibles pour le moment.' : extras.message}</p>
        <p>Repère calculé sur l’historique des semaines renseignées.</p>
      </div>
      <div className="mpv-kpi mpv-meals">
        <h3>Repas renseignés</h3>
        <strong>{repas.disponible ? repas.nombreRepas : '—'}</strong>
        <p>Occurrences de repas sur la période.</p>
        <p>Satiété respectée : {errors.includes('repas') ? 'indisponible' : repas.satiete.pourcentageRespectee === null ? 'non renseignée' : `${repas.satiete.pourcentageRespectee}% des ${repas.satiete.renseignee} occurrences renseignées`}</p>
        <Link href="/suivi">Voir mon suivi</Link>
      </div>
    </div>
    <div className="mpv-primary">
      {children}
      <aside className="mpv-insights" aria-labelledby="mpv-insight-title">
        <h3 id="mpv-insight-title">À retenir sur cette période</h3>
        {synthese.highlights.filter(item => !errors.includes(item.domaine === 'extras' ? 'semaines' : item.domaine)).map(item => <div className="mpv-observation" key={item.code}><strong>{item.titre}</strong><p>{item.message}</p><a href="#dashboard-details-existants">Comprendre cette observation →</a></div>)}
        {synthese.couverture && !errors.some(code => ['repas', 'periodes'].includes(code)) && <div className="mpv-observation"><strong>Disponibilité du suivi alimentaire</strong><p>{synthese.couverture.joursObserves} jours observés, {synthese.couverture.joursReconstitues} reconstitués, {synthese.couverture.joursSansDonnee} sans donnée sur la période.</p><p>Une absence de saisie n’est pas un échec.</p></div>}
        <small>Ces observations décrivent les saisies disponibles. Les repères restent ceux des modules.</small>
      </aside>
    </div>
    <div className="mpv-secondary">
      {extrasChart}
      <section className="mpv-panel" aria-labelledby="mpv-satiety-title"><h3 id="mpv-satiety-title">Mes signaux de satiété</h3><p>Seulement les réponses explicites « oui » ou « non ».</p>
        {errors.includes('repas') ? <p role="status">Données indisponibles pour le moment.</p> : repas.satiete.renseignee > 0 ? <div className="mpv-satiety"><div role="img" aria-label={`${repas.satiete.pourcentageRespectee}% de satiété respectée sur ${repas.satiete.renseignee} occurrences renseignées`} className="mpv-donut" style={{background: `conic-gradient(#20b5a5 0 ${repas.satiete.pourcentageRespectee}%, #9573e4 ${repas.satiete.pourcentageRespectee}% 100%)`}}><span>{repas.satiete.pourcentageRespectee}%</span></div><div><p><i className="mpv-dot" />Satiété respectée : {repas.satiete.respectee}</p><p><i className="mpv-dot mpv-purple" />Satiété dépassée : {repas.satiete.renseignee - repas.satiete.respectee}</p><small>{repas.satiete.renseignee} réponses exploitées ; les réponses absentes ou inconnues sont exclues.</small></div></div> : <p>Aucune réponse oui / non renseignée sur cette période.</p>}
        <Link href="/suivi">Explorer mon suivi →</Link>
      </section>
    </div>
    <div className="mpv-current"><h3>En ce moment</h3>
    <p>{errors.includes('defis') ? 'Défis indisponibles pour le moment.' : activeChallenge?.anomaliePlusieursActifs ? 'Plusieurs défis sont marqués en cours : à vérifier dans le module.' : activeChallenge ? `Défi : ${activeChallenge.nom}. La progression détaillée est indisponible pour le moment.` : 'Aucun défi actif renseigné.'} <Link href="/defis">Mes défis</Link></p>
    <p>{errors.includes('ideaux') ? 'Idéaux indisponibles pour le moment.' : activeIdeal ? `Cap actif : ${activeIdeal.titre}.` : 'Aucun Idéal actif renseigné.'} <Link href="/ideaux">Mes Idéaux</Link></p>
    </div><a className="mpv-details-link" href="#dashboard-details-existants">Détails & analyses ↓</a>
  </section>;
}
