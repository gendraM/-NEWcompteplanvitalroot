export const MODE_TEST_ACTIF_KEY = 'modeTestParcoursJeune';
export const MODE_TEST_DATE_KEY = 'modeTestDateVirtuelle';

const dateReelle = () => new Date();

export const estModeTestActif = () => (
  typeof window !== 'undefined'
  && localStorage.getItem(MODE_TEST_ACTIF_KEY) === 'true'
);

export const getDateMetier = () => {
  if (!estModeTestActif()) return dateReelle();
  const valeur = localStorage.getItem(MODE_TEST_DATE_KEY);
  if (!valeur) return dateReelle();
  const date = new Date(`${valeur}T12:00:00`);
  return Number.isNaN(date.getTime()) ? dateReelle() : date;
};

export const getDateMetierISO = () => getDateMetier().toISOString().slice(0, 10);

export const initialiserDateModeTest = () => {
  if (typeof window === 'undefined') return null;
  const existante = localStorage.getItem(MODE_TEST_DATE_KEY);
  if (existante) return existante;
  const valeur = dateReelle().toISOString().slice(0, 10);
  localStorage.setItem(MODE_TEST_DATE_KEY, valeur);
  return valeur;
};

export const avancerDateModeTest = () => {
  const valeur = initialiserDateModeTest();
  const date = new Date(`${valeur}T12:00:00`);
  date.setDate(date.getDate() + 1);
  const suivante = date.toISOString().slice(0, 10);
  localStorage.setItem(MODE_TEST_DATE_KEY, suivante);
  return suivante;
};
