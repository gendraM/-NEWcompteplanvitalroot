import { useMemo, useState } from 'react';
import {
  alternativesArticle,
  initialiserEtatsListeCourses,
  modifierStatutArticle,
  remplacerArticleCourses
} from '../lib/listeCoursesReprise';

const LIBELLES = {
  a_acheter: 'À acheter',
  achete: 'Acheté',
  deja_disponible: 'Déjà disponible'
};

export default function ListeCoursesPratique({ programme, listeCourses, onChange, titre = 'Mes courses pour la reprise', debutJour = 1, finJour = 7 }) {
  const [filtre, setFiltre] = useState('tous');
  const [remplacementOuvert, setRemplacementOuvert] = useState(null);
  const liste = useMemo(() => initialiserEtatsListeCourses(listeCourses), [listeCourses]);
  const visibles = filtre === 'tous' ? liste : liste.filter(item => item.statut_achat === filtre);
  const prets = liste.filter(item => item.statut_achat !== 'a_acheter').length;

  const changerStatut = (article, statut) => {
    onChange(modifierStatutArticle(liste, article.article_id, statut), programme.options?.choix_courses || {});
  };

  const remplacer = (article, nouveauNom) => {
    const resultat = remplacerArticleCourses(
      programme,
      liste,
      article.article_id,
      nouveauNom,
      programme.options?.choix_courses || {},
      finJour,
      debutJour
    );
    if (resultat.remplace) onChange(resultat.liste, resultat.choix);
    setRemplacementOuvert(null);
  };

  return (
    <section style={{ background:'#fffdf3', border:'1px solid #f0cf70', borderRadius:12, padding:'1rem 1.2rem', marginBottom:'2rem' }}>
      <h2 style={{ margin:'0 0 0.35rem', color:'#765500', fontSize:'1.2rem' }}>🛒 {titre}</h2>
      <div style={{ color:'#665f4b', marginBottom:12 }}>{prets} article{prets > 1 ? 's' : ''} prêt{prets > 1 ? 's' : ''} sur {liste.length}</div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
        {[['tous','Tout'], ['a_acheter','À acheter'], ['achete','Acheté'], ['deja_disponible','Déjà disponible']].map(([valeur, libelle]) => (
          <button key={valeur} type="button" onClick={() => setFiltre(valeur)} style={{ border:'1px solid #d8bd6b', borderRadius:18, padding:'6px 11px', background:filtre === valeur ? '#765500' : '#fff', color:filtre === valeur ? '#fff' : '#684f0b' }}>{libelle}</button>
        ))}
      </div>
      {visibles.length === 0 ? <p style={{ color:'#777' }}>Aucun article dans cette catégorie.</p> : visibles.map(article => {
        const alternatives = alternativesArticle(programme, article, finJour, debutJour);
        return (
          <article key={article.article_id} style={{ background:'#fff', border:'1px solid #eadcae', borderRadius:9, padding:'10px 12px', marginBottom:9, opacity:article.statut_achat === 'a_acheter' ? 1 : 0.72 }}>
            <div style={{ display:'flex', justifyContent:'space-between', gap:10, alignItems:'flex-start', flexWrap:'wrap' }}>
              <div>
                <strong style={{ textDecoration:article.statut_achat === 'achete' ? 'line-through' : 'none' }}>{article.nom} — {article.quantite}</strong>
                {article.preparation && <div style={{ fontSize:'0.86rem', color:'#6a6a6a', marginTop:3 }}>{article.preparation}</div>}
              </div>
              <select aria-label={`État de ${article.nom}`} value={article.statut_achat} onChange={e => changerStatut(article, e.target.value)} style={{ padding:'6px 8px', borderRadius:7, border:'1px solid #cbb86f' }}>
                {Object.entries(LIBELLES).map(([valeur, libelle]) => <option key={valeur} value={valeur}>{libelle}</option>)}
              </select>
            </div>
            {alternatives.length > 0 && (
              <div style={{ marginTop:8 }}>
                <button type="button" onClick={() => setRemplacementOuvert(remplacementOuvert === article.article_id ? null : article.article_id)} style={{ border:0, background:'transparent', color:'#4059ad', padding:0, textDecoration:'underline' }}>Remplacer</button>
                {remplacementOuvert === article.article_id && (
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:7 }}>
                    {alternatives.map(option => <button key={option.nom} type="button" onClick={() => remplacer(article, option.nom)} style={{ border:'1px solid #9aa8d9', background:'#f3f5ff', borderRadius:7, padding:'6px 9px' }}>{option.nom}</button>)}
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
