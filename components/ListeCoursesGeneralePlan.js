import { useMemo, useState } from 'react';
import { construireListeCoursesGenerale, grouperListeCoursesGenerale, validerPeriodeCourses } from '../lib/listeCoursesGenerale';

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

export default function ListeCoursesGeneralePlan({ supabase, userId, referentiel }) {
  const defaut = useMemo(periodeParDefaut, []);
  const [debut, setDebut] = useState(defaut.debut);
  const [fin, setFin] = useState(defaut.fin);
  const [resultat, setResultat] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [chargement, setChargement] = useState(false);

  const generer = async () => {
    const validation = validerPeriodeCourses(debut, fin);
    if (!validation.valide) return setFeedback(validation.erreur);
    if (!userId) return setFeedback('Connecte-toi pour générer la liste depuis ton planning.');
    setChargement(true); setFeedback(''); setResultat(null);
    const { data, error } = await supabase
      .from('repas_planifies')
      .select('id, user_id, date, type, aliment, categorie, quantite, kcal, combo_valide')
      .eq('user_id', userId)
      .gte('date', debut)
      .lte('date', fin)
      .order('date', { ascending: true });
    if (error) {
      setFeedback(`La liste n’a pas pu être générée : ${error.message}`);
    } else {
      const liste = construireListeCoursesGenerale(data || [], { debut, fin, referentiel });
      setResultat(liste);
      setFeedback(liste.resume?.lignes_planifiees ? '' : 'Aucun aliment planifié sur cette période.');
    }
    setChargement(false);
  };

  const groupes = grouperListeCoursesGenerale(resultat?.articles || []);
  return (
    <section style={{ background: '#e8f5e9', border: '1px solid #81c784', borderRadius: 12, padding: 16, margin: '22px 0' }}>
      <h2 style={{ marginTop: 0 }}>🛒 Générer la liste de courses du planning</h2>
      <p>Choisis la période à acheter. La liste additionne uniquement les aliments réellement planifiés.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <label>Du <input type="date" value={debut} onChange={e => setDebut(e.target.value)} /></label>
        <label>au <input type="date" value={fin} onChange={e => setFin(e.target.value)} /></label>
        <button onClick={generer} disabled={chargement} style={{ border: 0, borderRadius: 8, padding: '9px 16px', background: '#2e7d32', color: 'white', fontWeight: 700 }}>
          {chargement ? 'Génération…' : 'Générer ma liste'}
        </button>
      </div>
      {feedback && <div role="status" style={{ marginTop: 10, color: feedback.includes('pas pu') ? '#b71c1c' : '#455a64' }}>{feedback}</div>}
      {resultat?.resume?.lignes_planifiees > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            {resultat.resume.articles_distincts} article(s) pour {resultat.resume.lignes_planifiees} aliment(s) planifié(s)
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
          {resultat.incomplets.length > 0 && (
            <div role="alert" style={{ background: '#fff3e0', color: '#e65100', borderRadius: 9, padding: 11 }}>
              <b>Informations à compléter dans le planning</b>
              {resultat.incomplets.map(item => (
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
      )}
    </section>
  );
}
