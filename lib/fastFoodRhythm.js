export const DEFAULT_FAST_FOOD_INTERVAL_DAYS = 45;
export const FAST_FOOD_PRESET_INTERVALS = Object.freeze([21, 30, 45]);

export function normalizeIntervalDays(value, fallback = DEFAULT_FAST_FOOD_INTERVAL_DAYS) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(365, Math.round(parsed));
}

export function parseLocalDate(value) {
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12);
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, 12);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

export function differenceInCalendarDays(laterValue, earlierValue) {
  const later = parseLocalDate(laterValue);
  const earlier = parseLocalDate(earlierValue);
  if (!later || !earlier) return null;
  return Math.floor((Date.UTC(later.getFullYear(), later.getMonth(), later.getDate()) - Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate())) / 86400000);
}

export function addCalendarDays(value, days) {
  const date = parseLocalDate(value);
  if (!date) return null;
  const result = new Date(date);
  result.setDate(result.getDate() + normalizeIntervalDays(days));
  return result;
}

export function getFastFoodRhythm({ lastFastFoodDate, referenceDate = new Date(), intervalDays } = {}) {
  const targetDays = normalizeIntervalDays(intervalDays);
  if (!lastFastFoodDate) return { targetDays, hasHistory:false, lastFastFoodDate:null, nextReferenceDate:null, elapsedDays:null, remainingDays:null, daysBeyondTarget:null, targetReached:false };
  const lastDate = parseLocalDate(lastFastFoodDate);
  const currentDate = parseLocalDate(referenceDate);
  if (!lastDate || !currentDate) return { targetDays, hasHistory:false, lastFastFoodDate:null, nextReferenceDate:null, elapsedDays:null, remainingDays:null, daysBeyondTarget:null, targetReached:false };
  const elapsedDays = Math.max(0, differenceInCalendarDays(currentDate, lastDate));
  const targetReached = elapsedDays >= targetDays;
  return { targetDays, hasHistory:true, lastFastFoodDate:lastDate, nextReferenceDate:addCalendarDays(lastDate,targetDays), elapsedDays, remainingDays:Math.max(0,targetDays-elapsedDays), daysBeyondTarget:targetReached ? elapsedDays-targetDays : 0, targetReached };
}
