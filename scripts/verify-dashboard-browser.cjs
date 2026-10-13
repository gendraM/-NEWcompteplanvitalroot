// Local smoke test only. Every external request is intercepted or blocked.
// Usage documented in docs/DASHBOARD_REPRISE_MPV_DASH_02.md.
const { chromium } = require(process.env.MPV_PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const origin = 'http://127.0.0.1:3000';
const fixtureHost = 'dashboard-fixture.supabase.co';
const userId = '00000000-0000-4000-8000-000000000001';
const bobId = '00000000-0000-4000-8000-000000000002';
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
const bob = { ...user, id: bobId, email: 'bob@example.invalid' };
tables.profil.push({ user_id: bobId, created_at: date, sexe: 'M', niveau_activite: 'actif', poids_de_depart: 135, objectif: 88, fast_food_interval_days: 30 });
tables.historique_poids.push({ user_id: bobId, date, poids: 103 });
tables.repas_reels.push({ id: 'bob-meal', user_id: bobId, occurrence_repas_id: 'bob-midi', date, aliment: 'pomme' });
tables.ideaux.push({ id: 'bob-ideal', user_id: bobId, titre: 'CAP_BOB_SYNTHETIQUE', statut: 'en cours', date_cible: date });
tables.defis.push({ id: 'bob-defi', user_id: bobId, nom: 'DEFI_BOB_SYNTHETIQUE', status: 'en cours', progress: 1, duree: 30 });
const output = process.env.MPV_BROWSER_OUTPUT || '/tmp/mpv-browser-evidence';
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.MPV_CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  const results = [];
  try {
    for (const scenario of ['mobile', 'desktop', 'empty', 'partial', 'anonymous', 'other_account', 'session_change']) {
      const context = await browser.newContext({ viewport: scenario === 'desktop' ? { width: 1440, height: 1000 } : { width: 390, height: 844 } });
      const page = await context.newPage();
      page.setDefaultTimeout(30000);
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
        if (url.pathname === '/auth/v1/user') {
          const token = request.headers().authorization?.replace('Bearer ', '');
          let sub;
          try { sub = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).sub; } catch {}
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(sub === bobId ? bob : user) });
        }
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
        const fixtureUser = scenario === 'other_account' ? bob : user;
        const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: fixtureUser.id, exp: expires, role: 'authenticated' })}.fixture`;
        await context.addInitScript(({ user, token, expires }) => {
          localStorage.setItem('sb-dashboard-fixture-auth-token', JSON.stringify({ access_token: token, refresh_token: 'fixture', token_type: 'bearer', expires_at: expires, expires_in: 86400, user }));
        }, { user: fixtureUser, token, expires });
      }
      await page.goto(`${origin}/tableau-de-bord`, { waitUntil: 'load' });
      console.log(`${scenario}: page loaded`);
      fs.writeFileSync(`${output}/${scenario}-initial.json`, JSON.stringify({ text: await page.locator('body').innerText(), errors, requests }, null, 2));
      if (scenario === 'anonymous') {
        await page.getByText('Connecte-toi pour consulter ton parcours.').waitFor();
        assert.equal(await page.getByRole('link', { name: 'Me connecter', exact: true }).getAttribute('href'), '/login');
      } else {
        await page.getByRole('heading', { name: 'Mon chemin maintenant' }).waitFor();
        console.log(`${scenario}: summary rendered`);
        if (['mobile', 'desktop'].includes(scenario)) {
          await page.screenshot({ path: `${output}/${scenario}-cockpit.png`, fullPage: true });
          await page.screenshot({ path: `${output}/${scenario}-first-screen.png` });
        }
        assert.equal(await page.getByRole('heading', { name: 'Tableau de Bord', exact: true }).count(), 1);
        const summary = await page.locator('section').first().innerText();
        const expectedId = scenario === 'other_account' ? bobId : userId;
        if (scenario === 'other_account') {
          assert.ok(summary.includes('135 kg') && summary.includes('103 kg'));
          assert.ok(summary.includes('CAP_BOB_SYNTHETIQUE'));
          assert.ok(!summary.includes('Courir doucement'));
          assert.ok(!(await page.locator('body').innerText()).includes('Marcher'));
        } else if (scenario === 'empty') {
          assert.equal(await page.getByText('Aucun défi actif renseigné.', { exact: false }).count(), 1);
          assert.equal(await page.getByText('Aucun Idéal actif renseigné.', { exact: false }).count(), 1);
          assert.equal(await page.getByText('Semaine sans extra', { exact: false }).count(), 0);
        } else {
          assert.ok(summary.includes('95 kg') && summary.includes('70 kg'));
          assert.ok(summary.includes('Cap actif : Courir doucement'));
          assert.ok(!(await page.locator('body').innerText()).includes('CAP_BOB_SYNTHETIQUE'));
          if (scenario === 'partial') assert.ok(summary.includes('Certaines données'));
          else assert.ok(summary.includes('81 kg'));
        }
        for (const request of requests.filter(r => r.path.startsWith('/rest/v1/'))) {
          assert.equal(request.params.user_id, `eq.${expectedId}`, `Unscoped read: ${request.path}`);
        }
        assert.equal(await page.locator('details[data-dashboard-domain]').count(), 10);
        assert.equal(await page.locator('details[open]').count(), 0);
        // Native details work with keyboard and reveal the original charts/actions.
        const poidsDetails = page.locator('details[data-dashboard-domain="poids"]');
        await poidsDetails.locator('summary').focus();
        await page.keyboard.press('Enter');
        assert.ok(await poidsDetails.getAttribute('open') !== null);
        await poidsDetails.locator('summary').click();
        for (const domain of ['extras', 'repas', 'bienetre', 'defis', 'ideaux', 'jeune', 'badges', 'fastfood', 'regularite']) {
          const details = page.locator(`details[data-dashboard-domain="${domain}"]`);
          await details.locator('summary').click();
          assert.ok(await details.locator('a').last().isVisible());
          await details.locator('summary').click();
        }
        for (const view of ['extras', 'repas', 'wellbeing', 'poids']) {
          await page.getByRole('combobox', { name: 'Vue affichée' }).selectOption(view);
        }
        await page.getByRole('combobox', { name: 'Vue affichée' }).selectOption('extras');
        await page.locator('details[data-dashboard-domain="fastfood"] summary').click();
        await page.getByRole('link', { name: 'Détails & analyses ↓' }).click();
        console.log(`${scenario}: details reached`);
        assert.ok(page.url().endsWith('#dashboard-details-existants'));
        await page.getByRole('combobox', { name: 'Période affichée', exact: true }).selectOption('mois');
        console.log(`${scenario}: month selected`);
        try { await page.getByRole('heading', { name: 'Mon chemin maintenant' }).waitFor(); }
        catch (error) {
          fs.writeFileSync(`${output}/${scenario}-month-failure.json`, JSON.stringify({ text: await page.locator('body').innerText(), errors, requests }, null, 2));
          await page.screenshot({ path: `${output}/${scenario}-month-failure.png`, fullPage: true });
          throw error;
        }
        await page.getByRole('combobox', { name: 'Période affichée', exact: true }).selectOption('annee');
        console.log(`${scenario}: year selected`);
        await page.getByRole('heading', { name: 'Mon chemin maintenant' }).waitFor();
        assert.equal(await page.getByRole('combobox', { name: 'Vue affichée' }).inputValue(), 'extras');
        assert.ok(await page.locator('details[data-dashboard-domain="fastfood"]').getAttribute('open') !== null);
        await page.locator('details[data-dashboard-domain="fastfood"] summary').click();
        const expected = new Set(['/suivi', '/suivi-poids', '/defis', '/ideaux', '/plan', '/profil']);
        for (const href of expected) assert.ok(await page.locator(`a[href="${href}"]`).count(), `Link missing: ${href}`);
      }
      if (scenario === 'session_change') {
        const start = requests.length;
        const expires = Math.floor(Date.now() / 1000) + 86400;
        const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
        const token = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: bobId, exp: expires, role: 'authenticated' })}.fixture`;
        await page.evaluate(({ user, token, expires }) => {
          const session = { access_token: token, refresh_token: 'fixture-bob', token_type: 'bearer', expires_at: expires, expires_in: 86400, user };
          localStorage.setItem('sb-dashboard-fixture-auth-token', JSON.stringify(session));
          const channel = new BroadcastChannel('sb-dashboard-fixture-auth-token');
          channel.postMessage({ event: 'SIGNED_IN', session });
          channel.close();
        }, { user: bob, token, expires });
        await page.getByText('Cap actif : CAP_BOB_SYNTHETIQUE.', { exact: false }).waitFor();
        const text = await page.locator('body').innerText();
        assert.ok(!text.includes('Courir doucement') && !text.includes('Marcher'));
        assert.ok(text.includes('103 kg'));
        for (const request of requests.slice(start).filter(r => r.path.startsWith('/rest/v1/'))) {
          assert.equal(request.params.user_id, `eq.${bobId}`, 'Read kept old owner after session change');
        }
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      await page.screenshot({ path: `${output}/${scenario}.png`, fullPage: true });
      if (scenario === 'mobile' || scenario === 'desktop') {
        await page.locator('details[data-dashboard-domain="poids"] summary').click();
        await page.locator('details[data-dashboard-domain="extras"] summary').click();
        await page.screenshot({ path: `${output}/${scenario}-details.png`, fullPage: true });
      }
      assert.equal(errors.length, 0, errors.join('\n'));
      if (scenario === 'anonymous') assert.equal(requests.filter(r => r.path.startsWith('/rest/v1/')).length, 0, 'Anonymous table read');
      assert.equal(overflow, false, 'Horizontal overflow');
      results.push({ scenario, runtimeErrors: errors.length, horizontalOverflow: overflow, interceptedRequests: requests.length, writesAttempted: requests.filter(r => !['GET', 'OPTIONS'].includes(r.method)).length });
      await context.close();
    }
    fs.writeFileSync(`${output}/results.json`, JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exit(1); });
