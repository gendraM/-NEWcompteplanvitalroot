/** Carte unifiée des extras : budget calorique, moments et progression de palier. */
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

function libelleObjectif(objectif) {
  if (objectif === 'perte') return 'Perte';
  if (objectif === 'prise') return 'Prise';
  return 'Maintien';
}

export default function BudgetExtrasCard({ userId, selectedDate, palier = 5, progression }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function charger() {
      setLoading(true);
      setError(null);

      if (!userId) {
        if (!cancelled) {
          setData({ authRequired: true });
          setLoading(false);
        }
        return;
      }

      try {
        const { data: profil, error: profilError } = await supabase
          .from('profil')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (profilError) throw profilError;
        if (!profil?.sexe || !profil?.niveau_activite) {
          if (!cancelled) setData({ profilIncomplet: true });
          return;
        }

        let objectifType = 'maintien';
        if (Number(profil.poids_de_depart) > Number(profil.objectif)) objectifType = 'perte';
        if (Number(profil.poids_de_depart) < Number(profil.objectif)) objectifType = 'prise';

        const calculs = calculerProfilComplet({
          sexe: profil.sexe,
          age: profil.age,
          taille: profil.taille,
          poids_de_depart: profil.poids_de_depart,
          niveau_activite: profil.niveau_activite,
          objectif: objectifType
        });
        if (!calculs || !Number.isFinite(Number(calculs.budgetExtras))) {
          throw new Error('Budget extras indisponible.');
        }

        const week = getWeek(selectedDate);
        const { data: repas, error: repasError } = await supabase
          .from('repas_reels')
          .select('id, kcal, date, aliment, type, est_extra, occurrence_repas_id')
          .eq('user_id', userId)
          .eq('est_extra', true)
          .gte('date', week.start)
          .lte('date', week.end);

        if (repasError) throw repasError;
        const extrasInfo = calculerExtrasSemaine(week.start, repas || []);

        let budgetHebdo = Number(calculs.budgetExtras);
        let budgetReserve = 0;
        let estimationHistorique = false;
        const semaineCourante = week.start === getWeek(new Date()).start;

        const { data: budgetExistant, error: budgetError } = await supabase
          .from('extras_budget')
          .select('*')
          .eq('user_id', userId)
          .eq('date_semaine', week.start)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (budgetError) throw budgetError;
        let budgetSemaine = budgetExistant;

        if (!budgetSemaine && semaineCourante) {
          const { data: created, error: createError } = await supabase
            .from('extras_budget')
            .insert({
              user_id: userId,
              date_semaine: week.start,
              budget_hebdo: budgetHebdo,
              budget_consomme: extrasInfo.kcalTotal,
              budget_reserve: 0
            })
            .select()
            .single();

          if (createError) throw createError;
          budgetSemaine = created;
        } else if (!budgetSemaine) {
          const { data: bilan, error: bilanError } = await supabase
            .from('semaines_validees')
            .select('budget_extras')
            .eq('user_id', userId)
            .eq('weekStart', week.start)
            .maybeSingle();

          if (bilanError) throw bilanError;
          if (Number(bilan?.budget_extras) > 0) budgetHebdo = Number(bilan.budget_extras);
          else estimationHistorique = true;
        }

        if (budgetSemaine) {
          budgetHebdo = Number(budgetSemaine.budget_hebdo);
          budgetReserve = Number(budgetSemaine.budget_reserve) || 0;

          if (semaineCourante && Number(budgetSemaine.budget_consomme) !== extrasInfo.kcalTotal) {
            const { error: updateError } = await supabase
              .from('extras_budget')
              .update({ budget_consomme: extrasInfo.kcalTotal })
              .eq('id', budgetSemaine.id)
              .eq('user_id', userId);

            if (updateError) throw updateError;
          }
        }

        const budgetLibre = budgetHebdo - extrasInfo.kcalTotal - budgetReserve;
        const pourcentage = budgetHebdo > 0
          ? Math.round((extrasInfo.kcalTotal / budgetHebdo) * 100)
          : 0;

        if (!cancelled) {
          setData({
            authRequired: false,
            profilIncomplet: false,
            periode: `${week.monday.toLocaleDateString('fr-FR')} au ${week.sunday.toLocaleDateString('fr-FR')}`,
            extrasCount: extrasInfo.count,
            details: extrasInfo.details,
            kcal: extrasInfo.kcalTotal,
            budget: budgetHebdo,
            budgetReserve,
            budgetLibre,
            pourcentage,
            objectif: objectifType,
            estimationHistorique
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Impossible de charger les extras.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    charger();
    return () => { cancelled = true; };
  }, [userId, selectedDate]);

  if (loading) {
    return <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: 8 }}>Chargement de tes extras…</div>;
  }

  if (error) {
    return <div style={{ padding: '1rem', background: '#fff4e5', borderRadius: 10 }}>Impossible de charger tes extras : {error}</div>;
  }

  if (!data) return null;

  if (data.authRequired) {
    return (
      <div style={{ padding: '1rem', background: '#f0f6ff', borderRadius: 12, marginBottom: '1rem' }}>
        Connexion en cours…
      </div>
    );
  }

  if (data.profilIncomplet) {
    return (
      <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)', borderRadius: 12, color: '#fff', marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Mon budget extras personnalisé</div>
        <div style={{ fontSize: '0.9rem', opacity: 0.95, marginBottom: '1rem' }}>
          Complète ton profil pour découvrir l’impact calorique personnalisé de tes extras.
        </div>
        <a href="/parametres/routeur-poids" style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#fff', color: '#19547b', borderRadius: 6, textDecoration: 'none', fontWeight: 'bold' }}>
          Compléter mon profil →
        </a>
      </div>
    );
  }

  const synthese = construireSynthese(data.extrasCount, palier, data.kcal, data.budget);
  const progressionTexte = progression ? getVerbatimProgressionExtras(progression) : null;
  const depassement = data.budgetLibre < 0;
  const bloc = { padding: '0.9rem', background: 'rgba(255,255,255,0.18)', borderRadius: 10 };

  return (
    <section style={{ padding: '1.4rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 14, color: '#fff', marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Semaine du {data.periode}</div>
      <h3 style={{ margin: '0.45rem 0 1rem' }}>Mes extras cette semaine</h3>

      <div style={{ ...bloc, marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>Mon budget extras</div>
            <strong style={{ fontSize: '1.45rem' }}>{data.budget} kcal</strong>
          </div>
          <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>Objectif : {libelleObjectif(data.objectif)}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginTop: '0.9rem', marginBottom: '0.45rem' }}>
          <span>Utilisé : {data.kcal} kcal</span>
          <span>{data.pourcentage}%</span>
        </div>
        <div style={{ height: 11, background: 'rgba(255,255,255,0.28)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(data.pourcentage, 100)}%`, height: '100%', background: depassement ? '#ffb36b' : '#66e0a3', transition: 'width 0.3s ease' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: '0.9rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>{depassement ? 'Écart avec mon budget' : 'Budget disponible'}</div>
            <strong style={{ fontSize: '1.2rem' }}>{Math.abs(data.budgetLibre)} kcal</strong>
          </div>
          {data.budgetReserve > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>Réservé</div>
              <strong>{data.budgetReserve} kcal</strong>
            </div>
          )}
        </div>

        {depassement && (
          <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', lineHeight: 1.45 }}>
            L’impact calorique de tes extras dépasse de {Math.abs(data.budgetLibre)} kcal le budget de cette semaine.
          </div>
        )}
        {!depassement && data.budgetLibre > 0 && data.budgetLibre < 150 && (
          <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', lineHeight: 1.45 }}>
            Ton budget extras disponible cette semaine est de {data.budgetLibre} kcal.
          </div>
        )}
      </div>

      <div style={{ marginBottom: '0.55rem', fontWeight: 700 }}>Le rythme que je crée</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.8rem' }}>
        <div style={bloc}>
          <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>Palier actuel</div>
          <strong style={{ fontSize: '1.2rem' }}>{palier} moment{palier > 1 ? 's' : ''}</strong>
        </div>
        <div style={bloc}>
          <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>Moments utilisés</div>
          <strong style={{ fontSize: '1.2rem' }}>{data.extrasCount} / {palier}</strong>
        </div>
      </div>

      <div style={{ ...bloc, marginTop: '0.9rem', lineHeight: 1.5 }}>
        <div style={{ fontSize: '0.82rem', opacity: 0.9, marginBottom: 3 }}>Ce que j’observe</div>
        {synthese}
      </div>

      {progressionTexte && progression?.prochainPalier !== null && (
        <div style={{ ...bloc, marginTop: '0.9rem', lineHeight: 1.45 }}>
          <div style={{ fontSize: '0.82rem', opacity: 0.9, marginBottom: 3 }}>Mon chemin · {progression.semainesAcquises} semaine{progression.semainesAcquises > 1 ? 's' : ''} sur {progression.semainesRequises}</div>
          {progressionTexte}
        </div>
      )}

      {data.estimationHistorique && (
        <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 8 }}>
          Budget historique estimé à partir du profil actuel.
        </div>
      )}

      {data.details.length > 0 && (
        <div style={{ marginTop: '0.9rem' }}>
          <button type="button" onClick={() => setShowDetails(value => !value)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 8, padding: '0.5rem 0.8rem', cursor: 'pointer' }}>
            {showDetails ? 'Masquer le détail' : `Voir le détail de mes extras (${data.details.length})`}
          </button>
          {showDetails && (
            <div style={{ ...bloc, marginTop: '0.65rem' }}>
              {data.details.map((extra, index) => (
                <div key={extra.occurrence_repas_id || `${extra.date}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '0.65rem 0', borderBottom: index < data.details.length - 1 ? '1px solid rgba(255,255,255,0.18)' : 'none' }}>
                  <span>
                    <span style={{ opacity: 0.82 }}>
                      {extra.date ? new Date(`${extra.date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' }) : ''}
                    </span>
                    {extra.date ? ' · ' : ''}<strong>{extra.nom}</strong>
                  </span>
                  <strong style={{ whiteSpace: 'nowrap' }}>{extra.kcal} kcal</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
