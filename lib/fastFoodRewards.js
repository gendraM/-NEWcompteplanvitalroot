// Calcul dynamique des récompenses Fast Food
// history doit être trié par date croissante.
export function getFastFoodRewards(history = [], intervalDays = 45) {
  const targetDays = Number.isFinite(Number(intervalDays)) && Number(intervalDays) > 0
    ? Math.min(365, Math.round(Number(intervalDays)))
    : 45;

  if (!Array.isArray(history) || history.length < 2) {
    return {
      nbDelaisRespectes: 0,
      badgeSpecial: false,
      confettis: false,
      message: "Premier repère Fast Food enregistré. Ton historique d’espacement commence ici.",
      badgesFastFood: []
    };
  }
  let nbDelaisRespectes = 0;
  const badgesFastFood = [];
  let successStreak = 0;
  let maxStreak = 0;
  for (let i = 1; i < history.length; i++) {
    const prev = new Date(history[i - 1].date);
    const curr = new Date(history[i].date);
    const diff = Math.floor((curr - prev) / 86400000);
    if (diff >= targetDays) {
      nbDelaisRespectes++;
      successStreak++;
      badgesFastFood.push({
        nom: 'Délai respecté',
        description: `${targetDays} jours d’espacement entre le ${prev.toLocaleDateString('fr-FR')} et le ${curr.toLocaleDateString('fr-FR')}`
      });
    } else {
      successStreak = 0;
    }
    maxStreak = Math.max(maxStreak, successStreak);
  }
  const badgeSpecial = maxStreak >= 3;
  if (badgeSpecial) {
    badgesFastFood.push({
      nom: 'Badge Spécial Fast Food',
      description: `3 objectifs d’espacement de ${targetDays} jours atteints consécutivement.`
    });
  }
  return {
    nbDelaisRespectes,
    badgeSpecial,
    confettis: badgeSpecial,
    message: badgeSpecial
      ? "🎉 Trois objectifs d’espacement atteints consécutivement : badge spécial Fast Food débloqué."
      : nbDelaisRespectes > 0
        ? `Tu as atteint ${nbDelaisRespectes} objectif(s) d’espacement de ${targetDays} jours.`
        : `Ton repère actuel est de ${targetDays} jours entre deux Fast Food.`,
    badgesFastFood
  };
}
