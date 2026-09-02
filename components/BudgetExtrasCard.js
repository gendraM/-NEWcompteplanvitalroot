/** Carte unifiée des extras : fréquence, calories et progression de palier. */
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { calculerProfilComplet } from '../lib/routeurPoids';
import { calculerExtrasSemaine } from '../lib/validationSemaine';
import { getVerbatimProgressionExtras } from '../lib/extrasProgression';

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeek(dateValue) {
  const ref = dateValue ? new Date(dateValue) : new Date();
  ref.setHours(12, 0, 0, 0);
  const monday = new Date(ref);
  monday.setDate(ref.getDate() + (ref.getDay() === 0 ? -6 : 1 - ref.getDay()));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday, start: formatLocalDate(monday), end: formatLocalDate(sunday) };
}

function construireSynthese(extrasCount, palier, kcal, budget) {
  const frequenceOk = extrasCount <= palier;
  const caloriesOk = budget > 0 && kcal <= budget;
  if (frequenceOk && caloriesOk) return 'Ton rythme et l’impact de tes extras restent dans la direction que tu as choisie.';
  if (frequenceOk) return 'Le nombre de moments reste dans ton palier. Leur impact calorique est plus élevé cette semaine.';
  if (caloriesOk) return 'Les extras ont été plus présents cette semaine, tandis que leur impact calorique reste dans ton budget.';
  return 'Les extras ont été plus présents et plus caloriques cette semaine. Cette observation t’aide à ajuster la suite, sans effacer le chemin déjà parcouru.';
}

export default function BudgetExtrasCard({ userId, selectedDate, palier = 5, progression }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function charger() {
      try {
        setLoading(true);
        setError(null);
        const profileQuery = supabase.from('profil').select('*').order('created_at', { ascending: false }).limit(1);
        if (userId) profileQuery.eq('user_id', userId);
        const { data: profil, error: profilError } = await profileQuery.single();
        if (profilError) throw profilError;
        if (!profil?.sexe || !profil?.niveau_activite) {
          if (!cancelled) setData({ profilIncomplet: true });
          return;
        }

        let objectifType = 'maintien';
        if (Number(profil.poids_de_depart) > Number(profil.objectif)) objectifType = 'perte';
        if (Number(profil.poids_de_depart) < Number(profil.objectif)) objectifType = 'prise';
        const calculs = calculerProfilComplet({ sexe: profil.sexe, age: profil.age, taille: profil.taille, poids_de_depart: profil.poids_de_depart, niveau_activite: profil.niveau_activite, objectif: objectifType });
        if (!calculs || !Number.isFinite(Number(calculs.budgetExtras))) throw new Error('Budget extras indisponible.');

        const week = getWeek(selectedDate);
        let repasQuery = supabase.from('repas_reels')
          .select('id, kcal, date, aliment, type, est_extra, occurrence_repas_id')
          .eq('est_extra', true).gte('date', week.start).lte('date', week.end);
        if (userId) repasQuery = repasQuery.eq('user_id', userId);
        const { data: repas, error: repasError } = await repasQuery;
        if (repasError) throw repasError;
        const extrasInfo = calculerExtrasSemaine(week.start, repas || []);

        let budgetHebdo = Number(calculs.budgetExtras);
        let estimationHistorique = false;
        const semaineCourante = week.start === getWeek(new Date()).start;
        if (userId) {
          const { data: budgetExistant, error: budgetError } = await supabase.from('extras_budget').select('*').eq('user_id', userId).eq('date_semaine', week.start).order('created_at', { ascending: false }).limit(1).maybeSingle();
          if (budgetError) throw budgetError;
          let budgetSemaine = budgetExistant;
          if (!budgetSemaine && semaineCourante) {
            const { data: created, error: createError } = await supabase.from('extras_budget')
              .insert({ user_id: userId, date_semaine: week.start, budget_hebdo: budgetHebdo, budget_consomme: extrasInfo.kcalTotal, budget_reserve: 0 })
              .select().single();
            if (createError) throw createError;
            budgetSemaine = created;
          } else if (!budgetSemaine) {
            const { data: bilan } = await supabase.from('semaines_validees').select('budget_extras').eq('user_id', userId).eq('weekStart', week.start).maybeSingle();
            if (Number(bilan?.budget_extras) > 0) budgetHebdo = Number(bilan.budget_extras);
            else estimationHistorique = true;
          }
          if (budgetSemaine) {
            budgetHebdo = Number(budgetSemaine.budget_hebdo);
            if (semaineCourante && Number(budgetSemaine.budget_consomme) !== extrasInfo.kcalTotal) {
              const { error: updateError } = await supabase.from('extras_budget').update({ budget_consomme: extrasInfo.kcalTotal }).eq('id', budgetSemaine.id).eq('user_id', userId);
              if (updateError) throw updateError;
            }
          }
        }

        if (!cancelled) setData({
          profilIncomplet: false,
          periode: `${week.monday.toLocaleDateString('fr-FR')} au ${week.sunday.toLocaleDateString('fr-FR')}`,
          extrasCount: extrasInfo.count,
          details: extrasInfo.details,
          kcal: extrasInfo.kcalTotal,
          budget: budgetHebdo,
          pourcentage: budgetHebdo > 0 ? Math.round((extrasInfo.kcalTotal / budgetHebdo) * 100) : 0,
          estimationHistorique,
        });
      } catch (err) {
        if (!cancelled) setError(err.message || 'Impossible de charger les extras.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    charger();
    return () => { cancelled = true; };
  }, [userId, selectedDate]);

  if (loading) return <div style={{ padding: '1rem' }}>Chargement de tes extras…</div>;
  if (error) return <div style={{ padding: '1rem', background: '#fff4e5', borderRadius: 10 }}>⚠️ {error}</div>;
  if (!data) return null;
  if (data.profilIncomplet) return <div style={{ padding: '1.2rem', background: '#f0f6ff', borderRadius: 12, marginBottom: '1rem' }}>Complète ton profil pour découvrir l’impact calorique personnalisé de tes extras.</div>;

  const synthese = construireSynthese(data.extrasCount, palier, data.kcal, data.budget);
  const progressionTexte = progression ? getVerbatimProgressionExtras(progression) : null;
  const bloc = { padding: '0.9rem', background: 'rgba(255,255,255,0.18)', borderRadius: 10 };
  return (
    <section style={{ padding: '1.4rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 14, color: '#fff', marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Semaine du {data.periode}</div>
      <h3 style={{ margin: '0.45rem 0 1rem' }}>Mes extras</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '0.8rem' }}>
        <div style={bloc}><div style={{ fontSize: '0.82rem', opacity: 0.9 }}>Palier actuel</div><strong style={{ fontSize: '1.25rem' }}>{palier} moment{palier > 1 ? 's' : ''}</strong></div>
        <div style={bloc}><div style={{ fontSize: '0.82rem', opacity: 0.9 }}>Moments utilisés</div><strong style={{ fontSize: '1.25rem' }}>{data.extrasCount} / {palier}</strong></div>
        <div style={bloc}><div style={{ fontSize: '0.82rem', opacity: 0.9 }}>Impact calorique</div><strong style={{ fontSize: '1.25rem' }}>{data.kcal} / {data.budget} kcal</strong></div>
      </div>
      <div style={{ marginTop: '1rem', height: 10, background: 'rgba(255,255,255,0.28)', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(data.pourcentage, 100)}%`, height: '100%', background: data.kcal <= data.budget ? '#66e0a3' : '#ffb36b' }} />
      </div>
      <p style={{ lineHeight: 1.5, marginBottom: progressionTexte ? '0.6rem' : 0 }}>{synthese}</p>
      {progressionTexte && progression?.prochainPalier !== null && (
        <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.14)', borderRadius: 9, lineHeight: 1.45 }}>
          <div style={{ fontSize: '0.82rem', opacity: 0.9, marginBottom: 3 }}>{progression.semainesAcquises} semaine{progression.semainesAcquises > 1 ? 's' : ''} sur {progression.semainesRequises}</div>
          {progressionTexte}
        </div>
      )}
      {data.estimationHistorique && <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 8 }}>Budget historique estimé à partir du profil actuel.</div>}
      {data.details.length > 0 && (
        <div style={{ marginTop: '0.9rem' }}>
          <button type="button" onClick={() => setShowDetails(value => !value)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 8, padding: '0.5rem 0.8rem', cursor: 'pointer' }}>{showDetails ? 'Masquer le détail' : 'Voir le détail des moments'}</button>
          {showDetails && data.details.map((extra, index) => (
            <div key={extra.occurrence_repas_id || `${extra.date}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '0.65rem 0', borderBottom: '1px solid rgba(255,255,255,0.18)' }}>
              <span>{extra.nom} · {extra.type_extra === 'majeur' ? 'Extra majeur' : extra.type_extra}</span><strong>{extra.kcal} kcal</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
