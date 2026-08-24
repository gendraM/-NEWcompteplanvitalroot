import { useMemo, useState } from 'react';
import { construireListeCoursesGenerale, grouperListeCoursesGenerale, validerPeriodeCourses } from '../lib/listeCoursesGenerale';
import { chargerObjectifCaloriqueProfil, construireBudgetCaloriquePlan } from '../lib/budgetCaloriquePlan';

const VUES = [
  { id: 'synthese', libelle: 'Synthèse' },
  { id: 'repas', libelle: 'Repas' },
  { id: 'details', libelle: 'Détails' },
  { id: 'courses', libelle: 'Courses' }
];

function dateIso(date) {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
}

function periodeParDefaut() {
  const debut = new Date();
  const jour = debut.getDay();
  debut.setDate(debut.getDate() - (jour === 0 ? 6 : jour - 1));
  const fin = new Date(debut);
  fin.setDate(fin.getDate() + 6);
  return { debut: dateIso(debut), fin: dateIso(fin) };
}

function dateLisible(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  }).format(new Date(`${date}T12:00:00`));
}

function kcalLisibles(valeur) {
  return Number.isFinite(valeur) ? `${valeur.toLocaleString('fr-FR')} kcal` : 'Calories à compléter';
}

function ecartLisible(valeur) {
  if (!Number.isFinite(valeur)) return null;
  if (valeur === 0) return 'objectif atteint';
  return valeur > 0 ? `+${valeur} kcal` : `${valeur} kcal`;
}

function statutJour(jour) {
  if (jour.statut === 'vide') return 'Aucun repas planifié';
  if (jour.statut === 'incomplet') return 'Calories incomplètes';
  return ecartLisible(jour.ecart_calorique) || 'Journée complète';
}

function CarteResume({ titre, valeur, precision }) {
  return (
    <div style={{ flex: '1 1 170px', minWidth: 0, background: 'white', border: '1px solid #c8e6c9', borderRadius: 10, padding: 12 }}>
      <div style={{ color: '#546e7a', fontSize: 13 }}>{titre}</div>
      <div style={{ color: '#1b5e20', fontWeight: 800, fontSize: 21, marginTop: 3 }}>{valeur}</div>
      {precision && <div style={{ color: '#607d8b', fontSize: 12, marginTop: 3 }}>{precision}</div>}
    </div>
  );
}

function VueSynthese({ budget, objectif }) {
  const resume = budget.resume;
  const ecart = ecartLisible(resume.ecart_calorique_periode);
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <CarteResume
          titre="Calories planifiées connues"
          valeur={kcalLisibles(resume.total_kcal_connues)}
          precision={resume.periode_complete ? 'Période entièrement renseignée' : 'Total partiel : certains jours ou aliments sont incomplets'}
        />
        <CarteResume
          titre="Moyenne des jours renseignés"
          valeur={resume.moyenne_kcal_par_jour_renseigne === null ? '—' : kcalLisibles(resume.moyenne_kcal_par_jour_renseigne)}
          precision={`${resume.jours_renseignes} jour(s) renseigné(s) sur ${budget.periode.nombre_jours}`}
        />
        <CarteResume
          titre="Objectif calorique quotidien"
          valeur={resume.objectif_calorique_jour === null ? 'Non disponible' : kcalLisibles(resume.objectif_calorique_jour)}
          precision={objectif?.raison || 'Issu du routeur poids du profil'}
        />
        <CarteResume
          titre="Écart prévisionnel de la période"
          valeur={ecart || 'Non calculable'}
          precision={ecart ? 'Calculé uniquement sur une période complète' : 'Disponible lorsque chaque journée est entièrement planifiée'}
        />
      </div>
      <div style={{ marginTop: 12, background: '#f5f5f5', borderRadius: 9, padding: 11, color: '#455a64' }}>
        {resume.jours_complets} jour(s) complet(s), {resume.jours_incomplets} incomplet(s) et {resume.jours_vides} sans repas planifié.
        {' '}Ces chiffres décrivent le plan prévu, pas les repas réellement consommés.
      </div>
    </div>
  );
}

function EnteteJour({ jour }) {
  const total = jour.statut === 'vide' ? '' : `${kcalLisibles(jour.total_kcal_connues)} — `;
  return (
    <span style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, width: '100%', paddingRight: 8 }}>
      <b style={{ textTransform: 'capitalize' }}>{dateLisible(jour.date)}</b>
      <span style={{ color: jour.statut === 'incomplet' ? '#e65100' : '#546e7a' }}>
        {total}{statutJour(jour)}
      </span>
    </span>
  );
}

function VueRepas({ budget }) {
  return (
    <div>
      {budget.jours.map(jour => (
        <details key={jour.date} style={{ background: 'white', border: '1px solid #c8e6c9', borderRadius: 9, padding: 11, marginBottom: 9 }}>
          <summary style={{ cursor: 'pointer' }}><EnteteJour jour={jour} /></summary>
          {jour.repas.length === 0 ? (
            <p style={{ color: '#607d8b', marginBottom: 0 }}>Aucun repas n’a été ajouté à cette date.</p>
          ) : jour.repas.map(repas => (
            <div key={repas.type} style={{ borderTop: '1px solid #eceff1', marginTop: 10, paddingTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <b>{repas.type}</b>
                <span>{repas.complet ? kcalLisibles(repas.total_kcal_connues) : `${kcalLisibles(repas.total_kcal_connues)} connues`}</span>
              </div>
              <div style={{ color: '#546e7a', marginTop: 4 }}>
                {repas.ingredients.map(item => item.aliment).join(', ')}
              </div>
            </div>
          ))}
        </details>
      ))}
    </div>
  );
}

function VueDetails({ budget }) {
  return (
    <div>
      {budget.jours.map(jour => (
        <details key={jour.date} style={{ background: 'white', border: '1px solid #c8e6c9', borderRadius: 9, padding: 11, marginBottom: 9 }}>
          <summary style={{ cursor: 'pointer' }}><EnteteJour jour={jour} /></summary>
          {jour.repas.length === 0 ? (
            <p style={{ color: '#607d8b', marginBottom: 0 }}>Aucun détail disponible.</p>
          ) : jour.repas.map(repas => (
            <div key={repas.type} style={{ borderTop: '1px solid #eceff1', marginTop: 10, paddingTop: 10 }}>
              <h4 style={{ margin: '0 0 6px' }}>{repas.type}</h4>
              {repas.ingredients.map((ingredient, index) => (
                <div key={ingredient.id || `${ingredient.aliment}-${index}`} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, padding: '4px 0' }}>
                  <span>
                    {ingredient.aliment}
                    {ingredient.combo_valide ? <small style={{ color: '#607d8b' }}> — composant d’un repas enregistré</small> : null}
                  </span>
                  <span>
                    {ingredient.quantite || 'quantité à compléter'} · {ingredient.calories_connues ? kcalLisibles(ingredient.kcal) : 'kcal à compléter'}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </details>
      ))}
    </div>
  );
}

function VueCourses({ liste }) {
  const groupes = grouperListeCoursesGenerale(liste.articles || []);
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>
        {liste.resume.articles_distincts} article(s) pour {liste.resume.lignes_planifiees} aliment(s) planifié(s)
      </div>
      {Object.entries(groupes).map(([categorie, articles]) => (
        <div key={categorie} style={{ background: 'white', borderRadius: 9, padding: 11, marginBottom: 9 }}>
          <h3 style={{ margin: '0 0 7px', textTransform: 'capitalize' }}>{categorie}</h3>
          {articles.map(article => (
            <div key={article.article_id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '4px 0' }}>
              <span>{article.nom}{article.preparation ? ` — ${article.preparation}` : ''}</span>
              <b>{article.quantite}</b>
            </div>
          ))}
        </div>
      ))}
      {liste.incomplets.length > 0 && (
        <div role="alert" style={{ background: '#fff3e0', color: '#e65100', borderRadius: 9, padding: 11 }}>
          <b>Informations à compléter dans le planning</b>
          {liste.incomplets.map(item => (
            <div key={`${item.nom}-${item.raison}`} style={{ marginTop: 5 }}>
              {item.nom} : {item.raison} ({item.occurrences} occurrence{item.occurrences > 1 ? 's' : ''})
            </div>
          ))}
        </div>
      )}
      <p style={{ fontSize: 13, color: '#546e7a' }}>
        Les quantités sont arrondies à l’achat. Les données manquantes sont signalées et ne sont jamais estimées automatiquement.
      </p>
    </div>
  );
}

export default function ListeCoursesGeneralePlan({ supabase, userId, referentiel }) {
  const defaut = useMemo(periodeParDefaut, []);
  const [debut, setDebut] = useState(defaut.debut);
  const [fin, setFin] = useState(defaut.fin);
  const [resultat, setResultat] = useState(null);
  const [vueActive, setVueActive] = useState('synthese');
  const [feedback, setFeedback] = useState('');
  const [chargement, setChargement] = useState(false);

  const generer = async () => {
    const validation = validerPeriodeCourses(debut, fin);
    if (!validation.valide) return setFeedback(validation.erreur);
    if (!userId) return setFeedback('Connecte-toi pour analyser ton planning.');
    setChargement(true);
    setFeedback('');
    setResultat(null);

    const [repas, objectif] = await Promise.all([
      supabase
        .from('repas_planifies')
        .select('id, user_id, date, type, aliment, categorie, quantite, kcal, combo_valide')
        .eq('user_id', userId)
        .gte('date', debut)
        .lte('date', fin)
        .order('date', { ascending: true }),
      chargerObjectifCaloriqueProfil(supabase, userId)
    ]);

    if (repas.error) {
      setFeedback(`Le planning n’a pas pu être analysé : ${repas.error.message}`);
    } else {
      const lignes = repas.data || [];
      const liste = construireListeCoursesGenerale(lignes, { debut, fin, referentiel });
      const budget = construireBudgetCaloriquePlan(lignes, {
        debut,
        fin,
        referentiel,
        objectifCaloriqueJour: objectif.objectif_calorique_jour
      });
      setResultat({ liste, budget, objectif });
      setVueActive('synthese');
      setFeedback(budget.resume?.lignes_planifiees ? '' : 'Aucun repas planifié sur cette période.');
    }
    setChargement(false);
  };

  return (
    <section style={{ background: '#e8f5e9', border: '1px solid #81c784', borderRadius: 12, padding: 16, margin: '22px 0' }}>
      <h2 style={{ marginTop: 0 }}>🛒 Mon plan et ma liste de courses</h2>
      <p>Choisis une période pour consulter les repas prévus, leur budget calorique et les courses correspondantes.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <label>Du <input type="date" value={debut} onChange={e => setDebut(e.target.value)} /></label>
        <label>au <input type="date" value={fin} onChange={e => setFin(e.target.value)} /></label>
        <button onClick={generer} disabled={chargement} style={{ border: 0, borderRadius: 8, padding: '9px 16px', background: '#2e7d32', color: 'white', fontWeight: 700 }}>
          {chargement ? 'Analyse…' : 'Afficher mon plan'}
        </button>
      </div>
      {feedback && <div role="status" style={{ marginTop: 10, color: feedback.includes('pas pu') ? '#b71c1c' : '#455a64' }}>{feedback}</div>}

      {resultat?.budget?.resume?.lignes_planifiees > 0 && (
        <div style={{ marginTop: 16 }}>
          <div role="tablist" aria-label="Vues du plan" style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
            {VUES.map(vue => {
              const active = vueActive === vue.id;
              return (
                <button
                  key={vue.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setVueActive(vue.id)}
                  style={{ border: `1px solid ${active ? '#2e7d32' : '#a5d6a7'}`, borderRadius: 999, padding: '7px 13px', background: active ? '#2e7d32' : 'white', color: active ? 'white' : '#1b5e20', fontWeight: 700 }}
                >
                  {vue.libelle}
                </button>
              );
            })}
          </div>

          <div role="tabpanel">
            {vueActive === 'synthese' && <VueSynthese budget={resultat.budget} objectif={resultat.objectif} />}
            {vueActive === 'repas' && <VueRepas budget={resultat.budget} />}
            {vueActive === 'details' && <VueDetails budget={resultat.budget} />}
            {vueActive === 'courses' && <VueCourses liste={resultat.liste} />}
          </div>
        </div>
      )}
    </section>
  );
}
