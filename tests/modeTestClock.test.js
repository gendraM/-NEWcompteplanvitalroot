const fs = require('fs');
const path = require('path');
const vm = require('vm');

function chargerHorloge() {
  const source = fs.readFileSync(path.join(__dirname, '../lib/modeTestClock.js'), 'utf8')
    .replace(/export const /g, 'const ')
    .concat('\nmodule.exports={avancerDateModeTest,estModeTestActif,getDateMetier,getDateMetierISO,initialiserDateModeTest};');
  const context = {
    module: { exports: {} }, exports: {}, Map, Date,
    window: global.window, localStorage: global.localStorage
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return context.module.exports;
}

describe('Horloge virtuelle du mode test', () => {
  const stockage = new Map();

  beforeEach(() => {
    stockage.clear();
    global.window = {};
    global.localStorage = {
      getItem: cle => stockage.has(cle) ? stockage.get(cle) : null,
      setItem: (cle, valeur) => stockage.set(cle, String(valeur)),
      removeItem: cle => stockage.delete(cle)
    };
  });

  afterEach(() => {
    delete global.window;
    delete global.localStorage;
  });

  test('reste sur la date réelle hors mode test', () => {
    const { estModeTestActif, getDateMetierISO } = chargerHorloge();
    expect(estModeTestActif()).toBe(false);
    expect(getDateMetierISO()).toBe(new Date().toISOString().slice(0, 10));
  });

  test('utilise exclusivement la date virtuelle lorsque le mode test est actif', () => {
    const { estModeTestActif, getDateMetier, getDateMetierISO } = chargerHorloge();
    localStorage.setItem('modeTestParcoursJeune', 'true');
    localStorage.setItem('modeTestDateVirtuelle', '2026-08-21');
    expect(estModeTestActif()).toBe(true);
    expect(getDateMetierISO()).toBe('2026-08-21');
    expect(getDateMetier().getHours()).toBe(12);
  });

  test('avance la simulation sans déplacer la date prévue du programme', () => {
    const { avancerDateModeTest } = chargerHorloge();
    localStorage.setItem('modeTestParcoursJeune', 'true');
    localStorage.setItem('modeTestDateVirtuelle', '2026-08-29');
    expect(avancerDateModeTest()).toBe('2026-08-30');
    expect(localStorage.getItem('modeTestDateVirtuelle')).toBe('2026-08-30');
  });

  test('initialise une seule fois la date virtuelle', () => {
    const { initialiserDateModeTest } = chargerHorloge();
    localStorage.setItem('modeTestDateVirtuelle', '2026-08-30');
    expect(initialiserDateModeTest()).toBe('2026-08-30');
  });
});
