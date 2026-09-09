const DAY_MS = 24 * 60 * 60 * 1000;

function isoDateDaysAgo(days, now = new Date()) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function mealOccurrenceKey(row) {
  if (row?.occurrence_repas_id) return String(row.occurrence_repas_id);
  return [row?.date || '', row?.type || '', row?.heure || ''].join('|');
}

function formatKg(value) {
  return Number(value).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function buildMealObservation(rows = [], periodDays = 28) {
  const occurrences = new Map();
  for (const row of rows) {
    const key = mealOccurrenceKey(row);
    if (!key.replace(/\|/g, '')) continue;
    const current = occurrences.get(key) || { extra: false };
    current.extra = current.extra || row?.est_extra === true;
    occurrences.set(key, current);
  }
  const mealCount = occurrences.size;
  if (mealCount < 4) return null;
  const extraCount = [...occurrences.values()].filter((item) => item.extra).length;
  return {
    id: 'meals-28d',
    family: 'alimentation',
    evidenceLevel: 'P1',
    periodDays,
    sourceTables: ['repas_reels'],
    text: `Sur les ${periodDays} derniers jours, ${mealCount} repas ont été enregistrés${extraCount ? `, dont ${extraCount} marqué${extraCount > 1 ? 's' : ''} comme extra` : ', sans repas marqué comme extra'}.`,
    metrics: { mealCount, extraCount },
  };
}

export function buildWeightObservation(rows = []) {
  const valid = rows
    .map((row) => ({ date: row?.date, poids: Number(row?.poids) }))
    .filter((row) => row.date && Number.isFinite(row.poids))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (valid.length < 2) return null;
  const first = valid[0];
  const last = valid[valid.length - 1];
  if (first.date === last.date) return null;
  const delta = Number((last.poids - first.poids).toFixed(1));
  const deltaLabel = delta > 0 ? `+${formatKg(delta)}` : formatKg(delta);
  return {
    id: 'weight-history',
    family: 'corps',
    evidenceLevel: 'P1',
    sourceTables: ['historique_poids'],
    text: `Entre le ${first.date} et le ${last.date}, le poids enregistré est passé de ${formatKg(first.poids)} kg à ${formatKg(last.poids)} kg (variation ${deltaLabel} kg).`,
    metrics: { firstWeight: first.poids, lastWeight: last.poids, delta, measurementCount: valid.length },
  };
}

export function buildIdeauxObservations(ideaux = [], sessions = [], now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const titles = new Map(ideaux.map((ideal) => [String(ideal.id), String(ideal.titre || 'Cet Idéal').trim()]));
  const grouped = new Map();
  for (const session of sessions) {
    const idealId = String(session?.ideal_id || '');
    if (!idealId || !titles.has(idealId)) continue;
    const plannedDate = session?.date_prevue || session?.date;
    if (plannedDate && String(plannedDate).slice(0, 10) > today) continue;
    const current = grouped.get(idealId) || { total: 0, done: 0 };
    current.total += 1;
    if (session?.fait === true) current.done += 1;
    grouped.set(idealId, current);
  }
  return [...grouped.entries()]
    .filter(([, counts]) => counts.total >= 2)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 2)
    .map(([idealId, counts], index) => ({
      id: `ideal-sessions-${index}`,
      family: 'engagement',
      evidenceLevel: 'P1',
      sourceTables: ['ideaux', 'seances_reelles'],
      text: `Pour « ${titles.get(idealId)} », ${counts.done} séance${counts.done > 1 ? 's' : ''} sur ${counts.total} prévue${counts.total > 1 ? 's' : ''} jusqu’à aujourd’hui ${counts.done > 1 ? 'sont enregistrées' : 'est enregistrée'} comme réalisée${counts.done > 1 ? 's' : ''}.`,
      metrics: { idealId, plannedCount: counts.total, completedCount: counts.done },
    }));
}

async function safeQuery(label, queryPromise) {
  try {
    const { data, error } = await queryPromise;
    if (error) return { label, data: [], available: false };
    return { label, data: data || [], available: true };
  } catch {
    return { label, data: [], available: false };
  }
}

export async function collectMyWayObservations(client, userId, now = new Date()) {
  if (!client || !userId) return { status: 'NO_INTERVENTION', observations: [], sources: {} };
  const mealsSince = isoDateDaysAgo(27, now);
  const sessionsSince = isoDateDaysAgo(55, now);
  const [mealsResult, weightResult, idealsResult, sessionsResult] = await Promise.all([
    safeQuery('repas', client.from('repas_reels').select('date,type,heure,est_extra,occurrence_repas_id').eq('user_id', userId).gte('date', mealsSince)),
    safeQuery('poids', client.from('historique_poids').select('date,poids').eq('user_id', userId).order('date', { ascending: true })),
    safeQuery('ideaux', client.from('ideaux').select('id,titre').eq('user_id', userId)),
    safeQuery('seances', client.from('seances_reelles').select('ideal_id,date,date_prevue,fait').eq('user_id', userId).gte('date_prevue', sessionsSince)),
  ]);

  const observations = [];
  if (mealsResult.available) {
    const fact = buildMealObservation(mealsResult.data, 28);
    if (fact) observations.push(fact);
  }
  if (weightResult.available) {
    const fact = buildWeightObservation(weightResult.data);
    if (fact) observations.push(fact);
  }
  if (idealsResult.available && sessionsResult.available) {
    observations.push(...buildIdeauxObservations(idealsResult.data, sessionsResult.data, now));
  }

  return {
    status: observations.length ? 'FACTS' : 'NO_INTERVENTION',
    observations: observations.slice(0, 4),
    sources: {
      repas: mealsResult.available,
      poids: weightResult.available,
      ideaux: idealsResult.available && sessionsResult.available,
    },
  };
}
