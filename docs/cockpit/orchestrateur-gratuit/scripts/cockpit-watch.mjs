import { appendFile, writeFile } from "node:fs/promises";

const REPO = "gendraM/-NEWcompteplanvitalroot";
const ROOT = "https://api.github.com/repos/" + REPO;
const TARGET = "cockpit-wbs-phase2";
const now = new Date().toISOString();
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "mon-plan-vital-cockpit-free-watch",
  "X-GitHub-Api-Version": "2022-11-28"
};
if (process.env.GITHUB_TOKEN) {
  headers.Authorization = "Bearer " + process.env.GITHUB_TOKEN;
}

async function readJson(path) {
  const response = await fetch(ROOT + path, { headers });
  if (!response.ok) {
    throw new Error("GitHub REST failed: HTTP " + response.status + " for " + path.split("?")[0]);
  }
  return response.json();
}

function safeLine(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ").slice(0, 140);
}

async function main() {
  // Toutes les requêtes sont des GET sur le dépôt public ; aucune mutation.
  const [repo, prod, conso, cockpit, document, issues, pulls, runs] = await Promise.all([
    readJson(""),
    readJson("/branches/main"),
    readJson("/branches/main-consolidation"),
    readJson("/branches/" + TARGET),
    readJson("/contents/docs/cockpit/REGISTRE_COCKPIT_MPV.json?ref=" + TARGET),
    readJson("/issues?state=open&per_page=100"),
    readJson("/pulls?state=open&per_page=100"),
    readJson("/actions/runs?per_page=25")
  ]);
  if (document.encoding !== "base64" || !document.content) {
    throw new Error("Format de registre non supporté");
  }
  const registry = JSON.parse(Buffer.from(document.content.replaceAll("\n", ""), "base64").toString("utf8"));
  const branchHeads = {
    main: prod.commit.sha,
    "main-consolidation": conso.commit.sha,
    [TARGET]: cockpit.commit.sha
  };
  const linked = registry.tasks.filter((t) => Number.isInteger(t.github_issue));
  const issueMap = new Map(issues.filter((i) => !i.pull_request).map((i) => [i.number, i]));
  const missingIssues = linked.filter((t) => !issueMap.has(t.github_issue));
  const relevantIssues = linked.map((t) => {
    const issue = issueMap.get(t.github_issue);
    return { wbs_id: t.id, number: t.github_issue, state: issue?.state ?? "introuvable/fermée", title: issue?.title ?? "" };
  });
  const workflows = (runs.workflow_runs ?? []).map((r) => ({
    id: r.id, name: r.name, head_branch: r.head_branch, head_sha: r.head_sha,
    status: r.status, conclusion: r.conclusion, url: r.html_url, created_at: r.created_at
  }));
  const failedRuns = workflows.filter((r) => r.conclusion === "failure");
  const alerts = [];
  for (const [name, sha] of Object.entries(branchHeads)) {
    const key = name === "main" ? "main_sha" : name === "main-consolidation" ? "consolidation_sha" : null;
    if (key && registry.refs?.[key] && registry.refs[key] !== sha) {
      alerts.push("SHA " + name + " différent de la photographie WBS : revue nécessaire");
    }
  }
  if (missingIssues.length) alerts.push("Issues WBS non ouvertes/introuvables : " + missingIssues.map((t) => t.id).join(", "));
  if (failedRuns.length) alerts.push("Échecs CI détectés parmi les 25 derniers runs : " + failedRuns.length);
  if (repo.default_branch !== "main-consolidation") {
    alerts.push("Branche par défaut distincte de main-consolidation : " + repo.default_branch);
  }
  const report = {
    generated_at: now,
    mode: "lecture seule, GitHub API, aucun modèle IA",
    reference: "https://github.com/" + REPO + "/tree/" + TARGET + "/docs/cockpit",
    default_branch: repo.default_branch,
    branches: branchHeads,
    wbs: { tasks: registry.tasks.length, linked_issues: linked.length },
    issues: relevantIssues,
    open_prs: pulls.map((p) => ({ number: p.number, title: p.title, url: p.html_url, head: p.head?.ref, base: p.base?.ref })),
    recent_ci_failures: failedRuns,
    alerts
  };
  await writeFile("cockpit-report.json", JSON.stringify(report, null, 2) + "\n", "utf8");
  const summary = [
    "# Mon Plan Vital — Contrôle quotidien",
    "",
    "Exécuté : " + now + "  ",
    "Mode : lecture seule / aucun modèle payant",
    "",
    "| Contrôle | Résultat |",
    "|---|---|",
    "| Branche par défaut | " + safeLine(repo.default_branch) + " |",
    "| main | " + prod.commit.sha.slice(0, 12) + " |",
    "| main-consolidation | " + conso.commit.sha.slice(0, 12) + " |",
    "| cockpit-wbs-phase2 | " + cockpit.commit.sha.slice(0, 12) + " |",
    "| Actions WBS | " + registry.tasks.length + " |",
    "| Issues reliées | " + linked.length + " |",
    "| PR ouvertes | " + pulls.length + " |",
    "| Runs CI en échec (25 derniers) | " + failedRuns.length + " |",
    "",
    "## Points à vérifier",
    ...(alerts.length ? alerts.map((a) => "- " + safeLine(a)) : ["- Aucun nouveau signal dans ces contrôles."]),
    "",
    "Rapport structuré : artefact `cockpit-report.json`."
  ].join("\n") + "\n";
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary, "utf8");
  console.log(summary);
}

main().catch(async (error) => {
  const info = { generated_at: now, status: "failed", message: error.message };
  await writeFile("cockpit-report.json", JSON.stringify(info, null, 2) + "\n", "utf8");
  console.error("Contrôle interrompu sans modification :", error.message);
  process.exitCode = 1;
});
