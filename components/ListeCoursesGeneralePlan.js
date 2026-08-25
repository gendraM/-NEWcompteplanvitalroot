import { useEffect, useMemo, useState } from 'react';
import {
  construireListeCoursesGenerale,
  calculerAchatConditionne,
  formatsAchatCourants,
  grouperListeCoursesGenerale,
  initialiserSuiviCoursesGenerales,
  modifierSuiviCourseGenerale,
  resumerSuiviCoursesGenerales,
  validerPeriodeCourses
} from '../lib/listeCoursesGenerale';
import { chargerListeCoursesGenerale, sauvegarderListeCoursesGenerale } from '../lib/listeCoursesGeneraleSync';
import { chargerObjectifCaloriqueProfil, construireBudgetCaloriquePlan } from '../lib/budgetCaloriquePlan';
import { CONTEXTE_LISTE_GENERAL, estContexteCristallisation } from '../lib/contexteListeCourses';

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

const COULEURS_QN = {
  1: { fond: '#ffebee', texte: '#b71c1c' },
  2: { fond: '#fff3e0', texte: '#e65100' },
  3: { fond: '#fffde7', texte: '#827717' },
  4: { fond: '#e8f5e9', texte: '#2e7d32' },
  5: { fond: '#c8e6c9', texte: '#1b5e20' }
};

function InformationsAliment({ categorie, qn }) {
  const qnValide = Number.isFinite(Number(qn)) && Number(qn) >= 1 && Number(qn) <= 5 ? Number(qn) : null;
  const couleurs = qnValide ? COULEURS_QN[qnValide] : null;
  if (!categorie && !qnValide) return null;
  return (
    <span style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
      {categorie && <small style={{ background: '#eceff1', color: '#455a64', borderRadius: 999, padding: '2px 7px', textTransform: 'capitalize' }}>{categorie}</small>}
      {qnValide && <small title="Qualité nutritionnelle issue du référentiel" style={{ background: couleurs.fond, color: couleurs.texte, borderRadius: 999, padding: '2px 7px', fontWeight: 700 }}>QN {qnValide}/5</small>}
    </span>
  );
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
                {repas.ingredients.map((item, index) => (
                  <span key={item.id || `${item.aliment}-${index}`} style={{ display: 'inline-block', marginRight: 12, marginBottom: 5 }}>
                    {item.aliment}
                    <InformationsAliment categorie={item.categorie} qn={item.qn} />
                  </span>
                ))}
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
                    <InformationsAliment categorie={ingredient.categorie} qn={ingredient.qn} />
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

function ChampPrix({ libelle, valeur, onChange }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3, color: '#546e7a', fontSize: 12 }}>
      {libelle}
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={valeur ?? ''}
          placeholder="Facultatif"
          onChange={event => onChange(event.target.value)}
          style={{ width: 105, maxWidth: '100%', padding: '7px 8px', border: '1px solid #cfd8dc', borderRadius: 7 }}
        />
        <span>€</span>
      </span>
    </label>
  );
}

const UNITES_CONDITIONNEMENT = ['g', 'kg', 'ml', 'L', 'unité'];

function ConditionnementArticle({ article, onModifier }) {
  const formats = formatsAchatCourants(article);
  const conditionnement = article.conditionnement_achat;
  const choix = conditionnement?.mode === 'au_besoin'
    ? 'au_besoin'
    : conditionnement?.mode === 'personnalise'
      ? 'personnalise'
      : conditionnement?.id || '';
  const resultat = calculerAchatConditionne(article, conditionnement);

  const selectionner = valeur => {
    if (!valeur) return onModifier({ conditionnement_achat: null });
    if (valeur === 'au_besoin') return onModifier({ conditionnement_achat: { mode: 'au_besoin' } });
    if (valeur === 'personnalise') {
      return onModifier({ conditionnement_achat: { mode: 'personnalise', valeur: '', unite: article.besoin_unite || 'g' } });
    }
    const format = formats.find(item => item.id === valeur);
    if (format) onModifier({ conditionnement_achat: { ...format, mode: 'format' } });
  };

  const modifierConditionnement = modification => onModifier({
    conditionnement_achat: { ...conditionnement, ...modification }
  });

  return (
    <div style={{ marginTop: 8, padding: 9, background: '#f7faf7', borderRadius: 8 }}>
      <div style={{ color: '#37474f', fontSize: 13 }}>
        <b>Besoin du plan :</b> {article.quantite_planifiee}
      </div>
      <label style={{ display: 'block', marginTop: 7, color: '#546e7a', fontSize: 12 }}>
        Format d’achat
        <select aria-label={`Format d’achat pour ${article.nom}`} value={choix} onChange={event => selectionner(event.target.value)} style={{ display: 'block', width: '100%', marginTop: 3, padding: 7, border: '1px solid #cfd8dc', borderRadius: 7 }}>
          <option value="">Format d’achat à choisir</option>
          <option value="au_besoin">Au poids ou à l’unité selon le besoin</option>
          {formats.map(format => <option key={format.id} value={format.id}>{format.libelle} — format courant à confirmer</option>)}
          <option value="personnalise">Autre format…</option>
        </select>
      </label>

      {conditionnement?.mode === 'personnalise' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 7 }}>
          <label style={{ flex: '1 1 110px', color: '#546e7a', fontSize: 12 }}>
            Contenu d’un paquet
            <input aria-label={`Contenu d’un paquet pour ${article.nom}`} type="number" min="0" step="any" inputMode="decimal" value={conditionnement.valeur ?? ''} onChange={event => modifierConditionnement({ valeur: event.target.value })} style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 3, padding: 7, border: '1px solid #cfd8dc', borderRadius: 7 }} />
          </label>
          <label style={{ flex: '0 1 100px', color: '#546e7a', fontSize: 12 }}>
            Unité
            <select aria-label={`Unité du paquet pour ${article.nom}`} value={conditionnement.unite || 'g'} onChange={event => modifierConditionnement({ unite: event.target.value })} style={{ display: 'block', width: '100%', marginTop: 3, padding: 7, border: '1px solid #cfd8dc', borderRadius: 7 }}>
              {UNITES_CONDITIONNEMENT.map(unite => <option key={unite} value={unite}>{unite}</option>)}
            </select>
          </label>
        </div>
      )}

      {resultat.statut === 'nombre_a_saisir' && (
        <div style={{ marginTop: 7 }}>
          <div style={{ color: '#e65100', fontSize: 12 }}>{resultat.message}</div>
          <label style={{ display: 'block', marginTop: 5, color: '#546e7a', fontSize: 12 }}>
            Nombre de paquets à acheter
            <input aria-label={`Nombre de paquets pour ${article.nom}`} type="number" min="1" step="1" inputMode="numeric" value={conditionnement?.nombre_conditionnements ?? ''} onChange={event => modifierConditionnement({ nombre_conditionnements: event.target.value })} style={{ display: 'block', width: 110, marginTop: 3, padding: 7, border: '1px solid #cfd8dc', borderRadius: 7 }} />
          </label>
        </div>
      )}

      {resultat.statut === 'ok' && (
        <div style={{ marginTop: 7, color: '#1b5e20', fontSize: 13 }}>
          <b>À acheter :</b> {resultat.nombre_conditionnements ? `${resultat.nombre_conditionnements} paquet(s) — ` : ''}{resultat.quantite_achat}
          {resultat.reliquat_formate && resultat.reliquat > 0 ? <span style={{ display: 'block', color: '#546e7a' }}>Reste prévisible : {resultat.reliquat_formate}</span> : null}
          {!resultat.calcul_automatique && <span style={{ display: 'block', color: '#546e7a' }}>Nombre de paquets renseigné manuellement.</span>}
        </div>
      )}
      {resultat.statut === 'incomplet' && <div style={{ marginTop: 6, color: '#e65100', fontSize: 12 }}>{resultat.message}</div>}
    </div>
  );
}

function VueCourses({ liste, articles, onCommencer, onModifierPlan, onModifierArticle }) {
  const groupes = grouperListeCoursesGenerale(articles);
  const resume = resumerSuiviCoursesGenerales(articles);
  const categories = Object.keys(groupes).length;
  return (
    <div>
      <div style={{ background: 'white', border: '1px solid #c8e6c9', borderRadius: 11, padding: 14, marginBottom: 12 }}>
        <h3 style={{ margin: '0 0 8px' }}>Aperçu de mes courses</h3>
        <div style={{ color: '#455a64', marginBottom: 8 }}>
          Du {dateLisible(liste.periode.debut)} au {dateLisible(liste.periode.fin)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          <CarteResume titre="Produits" valeur={resume.total} precision={`${liste.resume.lignes_planifiees} aliment(s) planifié(s)`} />
          <CarteResume titre="Catégories" valeur={categories} precision="Regroupées automatiquement" />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <button type="button" onClick={onModifierPlan} style={{ border: '1px solid #2e7d32', borderRadius: 8, padding: '9px 14px', background: 'white', color: '#1b5e20', fontWeight: 700 }}>
            Modifier mon plan
          </button>
          <button type="button" onClick={onCommencer} style={{ border: 0, borderRadius: 8, padding: '9px 14px', background: '#2e7d32', color: 'white', fontWeight: 700 }}>
            Commencer mes courses
          </button>
        </div>
      </div>
      {Object.entries(groupes).map(([categorie, articles]) => (
        <div key={categorie} style={{ background: 'white', borderRadius: 9, padding: 11, marginBottom: 9 }}>
          <h3 style={{ margin: '0 0 7px', textTransform: 'capitalize' }}>{categorie}</h3>
          {articles.map(article => (
            <div key={article.article_id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: '1px solid #eceff1' }}>
              <span style={{ flex: '1 1 180px' }}>
                <b>{article.nom}</b>{article.preparation ? ` — ${article.preparation}` : ''}
                <InformationsAliment categorie={article.categorie} qn={article.qn} />
                <ConditionnementArticle article={article} onModifier={modification => onModifierArticle(article.article_id, modification)} />
              </span>
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
        Le besoin vient des repas planifiés. Le conditionnement d’achat est choisi séparément ; aucune conversion incompatible ni aucun format commercial ne sont inventés.
      </p>
    </div>
  );
}

const FILTRES_COURSES = [
  ['a_acheter', 'À acheter'],
  ['panier', 'Dans mon panier'],
  ['deja_disponible', 'Déjà chez moi']
];

function ModeCourses({ articles, liste, prixReel, onPrixReelChange, onModifierArticle, onEnregistrer, etatSynchronisation, onFermer }) {
  const [filtre, setFiltre] = useState('a_acheter');
  const resume = resumerSuiviCoursesGenerales(articles);
  const visibles = articles.filter(article => article.statut_achat === filtre);
  const groupes = grouperListeCoursesGenerale(visibles);
  const enregistrementEnCours = etatSynchronisation === 'Enregistrement…';
  return (
    <div role="dialog" aria-modal="true" aria-label="Mode courses" style={{ position: 'fixed', inset: 0, zIndex: 3000, background: '#f7faf7', overflowY: 'auto' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 2, background: 'white', borderBottom: '1px solid #c8e6c9', padding: '12px max(14px, env(safe-area-inset-left))' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <button type="button" onClick={onFermer} style={{ border: 0, background: 'transparent', color: '#1b5e20', padding: '4px 0', fontWeight: 700 }}>← Retour au plan</button>
          <h2 style={{ margin: '6px 0 3px' }}>🛒 Mes courses</h2>
          <div style={{ color: '#546e7a' }}>{resume.traites} article(s) traité(s) sur {resume.total} · {dateLisible(liste.periode.debut)} au {dateLisible(liste.periode.fin)}</div>
          <div aria-label="Progression des courses" style={{ height: 7, background: '#e0e0e0', borderRadius: 99, overflow: 'hidden', marginTop: 8 }}>
            <div style={{ width: `${resume.total ? (resume.traites / resume.total) * 100 : 0}%`, height: '100%', background: '#43a047' }} />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '14px 14px 175px' }}>
        <div role="tablist" aria-label="État des articles" style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 10 }}>
          {FILTRES_COURSES.map(([valeur, libelle]) => (
            <button key={valeur} type="button" role="tab" aria-selected={filtre === valeur} onClick={() => setFiltre(valeur)} style={{ whiteSpace: 'nowrap', border: `1px solid ${filtre === valeur ? '#2e7d32' : '#a5d6a7'}`, borderRadius: 999, padding: '8px 12px', background: filtre === valeur ? '#2e7d32' : 'white', color: filtre === valeur ? 'white' : '#1b5e20', fontWeight: 700 }}>
              {libelle} ({resume[valeur]})
            </button>
          ))}
        </div>

        {visibles.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 10, padding: 18, color: '#546e7a' }}>Aucun article dans cette section.</div>
        ) : Object.entries(groupes).map(([categorie, articlesGroupe]) => (
          <section key={categorie} style={{ marginBottom: 15 }}>
            <h3 style={{ textTransform: 'capitalize', color: '#1b5e20', margin: '7px 0' }}>{categorie}</h3>
            {articlesGroupe.map(article => (
              <article key={article.article_id} style={{ background: 'white', border: '1px solid #dfe8df', borderRadius: 11, padding: 12, marginBottom: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <strong style={{ textDecoration: article.statut_achat === 'panier' ? 'line-through' : 'none' }}>{article.nom}</strong>
                    {article.preparation ? <div style={{ color: '#546e7a', marginTop: 3 }}>{article.preparation}</div> : null}
                    <InformationsAliment categorie={article.categorie} qn={article.qn} />
                  </div>
                </div>
                <ConditionnementArticle article={article} onModifier={modification => onModifierArticle(article.article_id, modification)} />
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: 8, marginTop: 11 }}>
                  <button type="button" onClick={() => onModifierArticle(article.article_id, { statut_achat: article.statut_achat === 'panier' ? 'a_acheter' : 'panier' })} style={{ border: 0, borderRadius: 8, padding: '8px 11px', background: article.statut_achat === 'panier' ? '#e8f5e9' : '#2e7d32', color: article.statut_achat === 'panier' ? '#1b5e20' : 'white', fontWeight: 700 }}>
                    {article.statut_achat === 'panier' ? 'Remettre à acheter' : 'Mettre dans mon panier'}
                  </button>
                  <button type="button" onClick={() => onModifierArticle(article.article_id, { statut_achat: article.statut_achat === 'deja_disponible' ? 'a_acheter' : 'deja_disponible' })} style={{ border: '1px solid #81c784', borderRadius: 8, padding: '8px 11px', background: 'white', color: '#1b5e20', fontWeight: 700 }}>
                    {article.statut_achat === 'deja_disponible' ? 'Remettre à acheter' : 'Déjà chez moi'}
                  </button>
                </div>
              </article>
            ))}
          </section>
        ))}
      </main>

      <footer style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 3, background: '#1b5e20', color: 'white', padding: '10px 14px calc(10px + env(safe-area-inset-bottom))' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 7, fontSize: 13 }}>
          <b>{resume.a_acheter} à acheter · {resume.panier} dans le panier · {resume.deja_disponible} déjà chez moi</b>
          <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: 8 }}>
            <ChampPrix libelle="Total payé à la caisse" valeur={prixReel} onChange={onPrixReelChange} />
            <button type="button" onClick={onEnregistrer} disabled={enregistrementEnCours} style={{ border: 0, borderRadius: 8, padding: '9px 13px', background: 'white', color: '#1b5e20', fontWeight: 800 }}>
              {enregistrementEnCours ? 'Enregistrement…' : 'Enregistrer mes courses'}
            </button>
            <span role="status" style={{ flexBasis: '100%', textAlign: 'right', color: etatSynchronisation.includes('impossible') ? '#ffcdd2' : 'white' }}>
              {etatSynchronisation || 'Liste prête à être enregistrée'}
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function ListeCoursesGeneralePlan({ supabase, userId, referentiel, contexte = CONTEXTE_LISTE_GENERAL }) {
  const defaut = useMemo(periodeParDefaut, []);
  const [debut, setDebut] = useState(defaut.debut);
  const [fin, setFin] = useState(defaut.fin);
  const [resultat, setResultat] = useState(null);
  const [vueActive, setVueActive] = useState('synthese');
  const [feedback, setFeedback] = useState('');
  const [chargement, setChargement] = useState(false);
  const [modeCourses, setModeCourses] = useState(false);
  const [prixReelListe, setPrixReelListe] = useState(null);
  const [listeSupabaseId, setListeSupabaseId] = useState(null);
  const [etatSynchronisation, setEtatSynchronisation] = useState('');

  useEffect(() => {
    if (!resultat?.liste || !userId) return undefined;
    setEtatSynchronisation('Enregistrement…');
    const delai = setTimeout(async () => {
      const { data, error } = await sauvegarderListeCoursesGenerale(
        supabase,
        userId,
        resultat.liste,
        null,
        prixReelListe,
        listeSupabaseId,
        contexte
      );
      if (error) {
        setEtatSynchronisation(`Enregistrement impossible : ${error.message}`);
      } else {
        setListeSupabaseId(data.id);
        setEtatSynchronisation('Liste enregistrée');
      }
    }, 700);
    return () => clearTimeout(delai);
  }, [resultat?.liste, prixReelListe, supabase, userId, listeSupabaseId, contexte]);

  const enregistrerMaintenant = async () => {
    if (!resultat?.liste || !userId) {
      setEtatSynchronisation('Enregistrement impossible : liste ou utilisateur incomplet.');
      return;
    }
    setEtatSynchronisation('Enregistrement…');
    const { data, error } = await sauvegarderListeCoursesGenerale(
      supabase,
      userId,
      resultat.liste,
      null,
      prixReelListe,
      listeSupabaseId,
      contexte
    );
    if (error) {
      setEtatSynchronisation(`Enregistrement impossible : ${error.message}`);
      return;
    }
    setListeSupabaseId(data.id);
    setEtatSynchronisation('Liste enregistrée');
  };

  const modifierArticle = (articleId, modification) => {
    setResultat(actuel => actuel ? {
      ...actuel,
      liste: {
        ...actuel.liste,
        articles: modifierSuiviCourseGenerale(actuel.liste.articles, articleId, modification)
      }
    } : actuel);
  };

  const modifierPlan = () => {
    setModeCourses(false);
    document.getElementById('planificateur-repas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const generer = async () => {
    const validation = validerPeriodeCourses(debut, fin);
    if (!validation.valide) return setFeedback(validation.erreur);
    if (!userId) return setFeedback('Connecte-toi pour analyser ton planning.');
    if (estContexteCristallisation(contexte) && !contexte.parcours_id) {
      return setFeedback('Aucun parcours de cristallisation actif n’a été trouvé.');
    }
    setChargement(true);
    setFeedback('');
    const articlesPrecedents = resultat?.liste?.articles || [];
    const memePeriode = resultat?.liste?.periode?.debut === debut && resultat?.liste?.periode?.fin === fin;

    const [repas, objectif, listeEnregistree] = await Promise.all([
      supabase
        .from('repas_planifies')
        .select('id, user_id, date, type, aliment, categorie, quantite, kcal, combo_valide')
        .eq('user_id', userId)
        .gte('date', debut)
        .lte('date', fin)
        .order('date', { ascending: true }),
      chargerObjectifCaloriqueProfil(supabase, userId),
      chargerListeCoursesGenerale(supabase, userId, debut, fin, contexte)
    ]);

    if (repas.error) {
      setFeedback(`Le planning n’a pas pu être analysé : ${repas.error.message}`);
    } else {
      const lignes = repas.data || [];
      const liste = construireListeCoursesGenerale(lignes, { debut, fin, referentiel });
      const suiviEnregistre = listeEnregistree.data?.liste?.articles || [];
      liste.articles = initialiserSuiviCoursesGenerales(
        liste.articles,
        memePeriode ? articlesPrecedents : suiviEnregistre
      );
      const budget = construireBudgetCaloriquePlan(lignes, {
        debut,
        fin,
        referentiel,
        objectifCaloriqueJour: objectif.objectif_calorique_jour
      });
      setResultat({ liste, budget, objectif });
      setListeSupabaseId(listeEnregistree.data?.id || null);
      setPrixReelListe(memePeriode ? prixReelListe : listeEnregistree.data?.prix_reel ?? null);
      if (listeEnregistree.error) setEtatSynchronisation(`Récupération impossible : ${listeEnregistree.error.message}`);
      setVueActive('synthese');
      setFeedback(budget.resume?.lignes_planifiees ? '' : 'Aucun repas planifié sur cette période.');
    }
    setChargement(false);
  };

  return (
    <section style={{ background: '#e8f5e9', border: '1px solid #81c784', borderRadius: 12, padding: 16, margin: '22px 0' }}>
      <h2 style={{ marginTop: 0 }}>🛒 Mon plan et ma liste de courses</h2>
      <p>Choisis une période pour consulter les repas prévus, leur budget calorique et les courses correspondantes.</p>
      {estContexteCristallisation(contexte) && (
        <div role="status" style={{ background: '#ede7f6', border: '1px solid #9575cd', borderRadius: 9, padding: 11, marginBottom: 12, color: '#4527a0' }}>
          <b>Contexte cristallisation actif.</b> Tu utilises le même plan et la même liste de courses. Les critères personnalisés et les aliments déclencheurs sont transmis au contexte ; aucune recommandation automatique n’est encore appliquée.
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <label>Du <input type="date" value={debut} onChange={e => setDebut(e.target.value)} /></label>
        <label>au <input type="date" value={fin} onChange={e => setFin(e.target.value)} /></label>
        <button onClick={generer} disabled={chargement} style={{ border: 0, borderRadius: 8, padding: '9px 16px', background: '#2e7d32', color: 'white', fontWeight: 700 }}>
          {chargement ? 'Analyse…' : resultat ? 'Mettre à jour mon plan et mes courses' : 'Afficher mon plan'}
        </button>
      </div>
      {feedback && <div role="status" style={{ marginTop: 10, color: feedback.includes('pas pu') ? '#b71c1c' : '#455a64' }}>{feedback}</div>}
      {resultat?.liste && (
        <div role="status" style={{ marginTop: 8, color: etatSynchronisation.includes('impossible') ? '#b71c1c' : '#546e7a', fontSize: 13 }}>
          {etatSynchronisation || 'Synchronisation de la liste prête'}
        </div>
      )}

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
            {vueActive === 'courses' && (
              <VueCourses
                liste={resultat.liste}
                articles={resultat.liste.articles}
                onCommencer={() => setModeCourses(true)}
                onModifierPlan={modifierPlan}
                onModifierArticle={modifierArticle}
              />
            )}
          </div>
        </div>
      )}
      {modeCourses && resultat?.liste && (
        <ModeCourses
          articles={resultat.liste.articles}
          liste={resultat.liste}
          prixReel={prixReelListe}
          onPrixReelChange={setPrixReelListe}
          onModifierArticle={modifierArticle}
          onEnregistrer={enregistrerMaintenant}
          etatSynchronisation={etatSynchronisation}
          onFermer={() => setModeCourses(false)}
        />
      )}
    </section>
  );
}
