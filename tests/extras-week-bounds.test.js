const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerDates() {
  const source = fs.readFileSync(path.join(__dirname, '../lib/validationSemaine.js'), 'utf8');
  const transformed = source
    .replace(/export async function /g, 'async function ')
    .replace(/export function /g, 'function ')
    .concat('\nmodule.exports = { formatDate, getMonday, addDays, getWeekBounds };');
  const context = { module: { exports: {} }, exports: {}, console, Date, Math, Array, Object, Set, String, Number, Boolean, isNaN };
  vm.createContext(context);
  vm.runInContext(transformed, context, { filename: 'validationSemaine.js' });
  return context.module.exports;
}

const { formatDate, getWeekBounds } = chargerDates();

describe('référence calendaire des extras', () => {
  test('rattache un repas du mardi à la semaine lundi → dimanche', () => {
    const week = getWeekBounds('2026-09-08');
    expect(week.start).toBe('2026-09-07');
    expect(week.end).toBe('2026-09-13');
  });

  test('rattache aussi un repas du dimanche au lundi précédent', () => {
    const week = getWeekBounds('2026-09-13');
    expect(week.start).toBe('2026-09-07');
    expect(week.end).toBe('2026-09-13');
  });

  test('formate les bornes locales sans les décaler en UTC', () => {
    const lundiLocal = new Date(2026, 8, 7, 0, 0, 0);
    expect(formatDate(lundiLocal, 'yyyy-MM-dd')).toBe('2026-09-07');
  });
});
