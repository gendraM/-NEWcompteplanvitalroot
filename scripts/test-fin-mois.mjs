/**
 * ═══════════════════════════════════════════════════════════════════════
 * SCRIPT DE TEST RÉGRESSION - DÉCLENCHEMENT FIN DE MOIS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Objectif:
 * - Vérifier que le déclenchement mensuel fonctionne pour TOUS les mois,
 *   y compris quand la fin de mois tombe un autre jour que dimanche.
 * - Empêcher les régressions silencieuses sur la logique date/semaine.
 *
 * Usage:
 * - npm run test:fin-mois
 *
 * Le script vérifie pour chaque mois:
 * - dernier jour du mois => déclenchement attendu = true
 * - veille du dernier jour => déclenchement attendu = false
 *
 * Si un cas échoue, le script retourne un code de sortie non nul.
 */

import { estDerniereValidationDuMois } from '../lib/detectionFinMois.js';
import { getMonday, formatDate } from '../lib/validationSemaine.js';

function autoTriggerFinMois(selectedDate) {
  const dateSelectionnee = new Date(`${selectedDate}T12:00:00`);
  if (Number.isNaN(dateSelectionnee.getTime())) {
    return false;
  }

  const lendemain = new Date(dateSelectionnee);
  lendemain.setDate(dateSelectionnee.getDate() + 1);
  const estDernierJourCalendrier = dateSelectionnee.getMonth() !== lendemain.getMonth();

  const monday = getMonday(selectedDate);
  const weekStart = formatDate(monday, 'yyyy-MM-dd');
  if (!weekStart) {
    return false;
  }

  const estDerniereValidation = estDerniereValidationDuMois(weekStart);
  return estDernierJourCalendrier && estDerniereValidation;
}

function toYmd(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getJourFr(dayIndex) {
  return ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][dayIndex];
}

function runSuite() {
  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const failures = [];
  const examplesNonDimanche = [];
  let checks = 0;

  for (const year of years) {
    for (let month = 0; month < 12; month++) {
      const lastDayDate = new Date(year, month + 1, 0);
      const prevDayDate = new Date(year, month + 1, -1);

      const lastDay = toYmd(lastDayDate);
      const previousDay = toYmd(prevDayDate);

      const gotLast = autoTriggerFinMois(lastDay);
      const gotPrev = autoTriggerFinMois(previousDay);

      checks += 2;

      if (gotLast !== true) {
        failures.push({
          type: 'dernier-jour',
          date: lastDay,
          got: gotLast,
          expected: true,
        });
      }

      if (gotPrev !== false) {
        failures.push({
          type: 'veille',
          date: previousDay,
          got: gotPrev,
          expected: false,
        });
      }

      if (lastDayDate.getDay() !== 0 && examplesNonDimanche.length < 14) {
        examplesNonDimanche.push({
          date: lastDay,
          jour: getJourFr(lastDayDate.getDay()),
          trigger: gotLast,
        });
      }
    }
  }

  console.log('=== TEST RÉGRESSION FIN DE MOIS ===');
  console.log(`Années testées : ${years.join(', ')}`);
  console.log(`Checks exécutés : ${checks}`);
  console.log(`Échecs : ${failures.length}`);

  console.log('\n--- Exemples fins de mois ≠ dimanche ---');
  for (const item of examplesNonDimanche) {
    console.log(`• ${item.date} (${item.jour}) => autoTrigger=${item.trigger}`);
  }

  if (failures.length > 0) {
    console.log('\n--- Détails des échecs ---');
    for (const failure of failures) {
      console.log(`❌ [${failure.type}] ${failure.date} => ${failure.got} (attendu ${failure.expected})`);
    }
    console.log('\nRESULTAT FINAL: FAIL');
    process.exit(1);
  }

  console.log('\nRESULTAT FINAL: PASS');
  process.exit(0);
}

runSuite();
