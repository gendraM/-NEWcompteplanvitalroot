// Local smoke test only. Every external request is intercepted or blocked.
// Usage documented in docs/DASHBOARD_REPRISE_MPV_DASH_02.md.
const { chromium } = require(process.env.MPV_PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const origin = 'http://127.0.0.1:3000';
const fixtureHost = 'dashboard-fixture.supabase.co';
const userId = '00000000-0000-4000-8000-000000000001';
const now = new Date();
const date = now.toISOString().slice(0, 10);
const old = new Date(now); old.setDate(old.getDate() - 60);
const oldDate = old.toISOString().slice(0, 10);
const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'fixture@example.invalid', app_metadata: {}, user_metadata: {} };
const tables = {
  profil: [{ user_id: userId, created_at: date, sexe: 'F', niveau_activite: 'modere', poids_de_depart: 95, objectif: 70, fast_food_interval_days: 21 }],
  historique_poids: [{ user_id: userId, date, poids: 81 }],
  repas_reels: ['riz', 'poisson', 'legumes'].map((aliment, i) => ({ id: `m${i}`, user_id: userId, occurrence_repas_id: 'midi', date, type: 'Déjeuner', aliment, satiete: 'oui', raison_manger: "J'avais faim" })).concat([{ id: 'ff', user_id: userId, occurrence_repas_id: 'ff', date: oldDate, categorie: 'fast-food' }]),
  humeur_checkin: [{ user_id: userId, date, humeur: 'Calme' }],
  ideaux: [{ id: 'ideal', user_id: userId, titre: 'Courir doucement', statut: 'en cours', date_cible: date }],
  seances_reelles: [],
  defis: [{ id: 'defi', user_id: userId, nom: 'Marcher', status: 'en cours', progress: 99, duree: 7 }],
  badges: [], semaines_validees: [], extras_palier_events: [], suivi_periodes_estimees: [],
};
const output = process.env.MPV_BROWSER_OUTPUT || '/tmp/mpv-browser-evidence';
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.MPV_CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const results = [];
  try {
    for (const scenario of ['mobile', 'desktop', 'empty', 'partial', 'anonymous']) {
      const context = await browser.newContext({ viewport: scenario === 'desktop' ? { width: 1440, height: 1000 } : { width: 390, height: 844 } });
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      const errors = [];
      const requests = [];
      page.on('pageerror', e => errors.push(e.message));
      await context.route('**/*', async route => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin === origin) return route.continue();
        if (url.hostname !== fixtureHost) return route.abort();
        requests.push({ path: url.pathname, method: request.method(), params: Object.fromEntries(url.searchParams) });
        if (request.method() !== 'GET' && request.method() !== 'OPTIONS') return route.fulfill({ status: 403, contentType: 'application/json', body: '{"message":"Writes disabled in fixture"}' });
        if (url.pathname === '/auth/v1/user') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(user) });
        const table = url.pathname.split('/').pop();
        if (scenario === 'partial' && table === 'historique_poids') return route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"Synthetic unavailable source"}' });
        let rows = scenario === 'empty' && table !== 'profil' ? [] : [...(tables[table] || [])];
        for (const [key, value] of url.searchParams) {
          if (value.startsWith('eq.')) rows = rows.filter(r => String(r[key]) === value.slice(3));
          if (value.startsWith('gte.')) rows = rows.filter(r => String(r[key]) >= value.slice(4));
          if (value.startsWith('lte.')) rows = rows.filter(r => String(r[key]) <= value.slice(4));
        }
        const limit = url.searchParams.get('limit');
        if (limit) rows = rows.slice(0, Number(limit));
        const objectResponse = request.headers().accept?.includes('vnd.pgrst.object');
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(objectResponse ? rows[0] || null : rows) });
      });
      if (scenario !== 'anonymous') {
        const expires = Math.floor(Date.now() / 1000) + 86400;
        const encode = v => Buffer.from(JSON.stringify(v)).toString('base64url');
        const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: userId, exp: expires, role: 'authenticated' })}.fixture`;
        await context.addInitScript(({ user, token, expires }) => {
          localStorage.setItem('sb-dashboard-fixture-auth-token', JSON.stringify({ access_token: token, refresh_token: 'fixture', token_type: 'bearer', expires_at: expires, expires_in: 86400, user }));
        }, { user, token, expires });
      }
      await page.goto(`${origin}/tableau-de-bord`, { waitUntil: 'networkidle' });
      console.log(`${scenario}: page loaded`);
      fs.writeFileSync(`${output}/${scenario}-initial.json`, JSON.stringify({ text: await page.locator('body').innerText(), errors, requests }, null, 2));
      if (scenario === 'anonymous') {
        await page.getByText('Connecte-toi pour consulter ton parcours.').waitFor();
        assert.equal(await page.getByRole('link', { name: 'Me connecter', exact: true }).getAttribute('href'), '/login');
      } else {
        await page.getByRole('heading', { name: 'Mon chemin maintenant' }).waitFor();
        console.log(`${scenario}: summary rendered`);
        assert.equal(await page.getByRole('heading', { name: 'Tableau de Bord', exact: true }).count(), 1);
        if (scenario === 'empty') {
          assert.equal(await page.getByText('Aucun défi actif renseigné.', { exact: false }).count(), 1);
          assert.equal(await page.getByText('Aucun Idéal actif renseigné.', { exact: false }).count(), 1);
          assert.equal(await page.getByText('Semaine sans extra', { exact: false }).count(), 0);
        } else {
          assert.ok((await page.locator('section').first().innerText()).includes('95 kg'));
          assert.ok((await page.locator('section').first().innerText()).includes('70 kg'));
          assert.ok((await page.locator('section').first().innerText()).includes('Cap actif : Courir doucement'));
          if (scenario === 'partial') assert.ok((await page.locator('section').first().innerText()).includes('Certaines données'));
          else assert.ok((await page.locator('section').first().innerText()).includes('81 kg'));
        }
        await page.getByRole('link', { name: 'Détails & analyses ↓' }).click();
        console.log(`${scenario}: details reached`);
        assert.ok(page.url().endsWith('#dashboard-details-existants'));
        await page.locator('select').first().selectOption('mois');
        console.log(`${scenario}: month selected`);
        try { await page.getByRole('heading', { name: 'Mon chemin maintenant' }).waitFor(); }
        catch (error) {
          fs.writeFileSync(`${output}/${scenario}-month-failure.json`, JSON.stringify({ text: await page.locator('body').innerText(), errors, requests }, null, 2));
          await page.screenshot({ path: `${output}/${scenario}-month-failure.png`, fullPage: true });
          throw error;
        }
        await page.locator('select').first().selectOption('annee');
        console.log(`${scenario}: year selected`);
        await page.getByRole('heading', { name: 'Mon chemin maintenant' }).waitFor();
        const expected = new Set(['/suivi', '/suivi-poids', '/defis', '/ideaux', '/plan', '/profil']);
        for (const href of expected) assert.ok(await page.locator(`a[href="${href}"]`).count(), `Link missing: ${href}`);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      await page.screenshot({ path: `${output}/${scenario}.png`, fullPage: true });
      assert.equal(errors.length, 0, errors.join('\n'));
      assert.equal(overflow, false, 'Horizontal overflow');
      results.push({ scenario, runtimeErrors: errors.length, horizontalOverflow: overflow, interceptedRequests: requests.length, writesAttempted: requests.filter(r => !['GET', 'OPTIONS'].includes(r.method)).length });
      await context.close();
    }
    fs.writeFileSync(`${output}/results.json`, JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exit(1); });
