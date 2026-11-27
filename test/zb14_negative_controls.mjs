#!/usr/bin/env node
// ZB14 negative controls: ZB14-012/041/037/038/040/005.
// usage: node test/zb14_negative_controls.mjs
// Every fixture lives in a fresh temp dir and is deleted afterwards;
// the repository itself is never modified. .cljk scripts run on the
// .cljk-capable kbb engine when present (stock nbb cannot resolve
// .cljk namespaces), else on nbb from PATH.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repo = process.cwd();
let failures = 0;
function check(cond, msg) {
  if (cond) console.log("ok: " + msg);
  else { failures++; console.log("FAIL: " + msg); }
}
function tmp(prefix) { return fs.mkdtempSync(path.join(os.tmpdir(), prefix)); }
function run(cmd, pre, args, opts = {}) {
  return spawnSync(cmd, [...pre, ...args], { encoding: "utf8", timeout: 300000, ...opts });
}
function runner() {
  const kbbBin = "/Users/node/.orca/bots/kougi/.review-20261126.rl6mwI/kbb/bin/kbb";
  const engine = "/Users/node/github/repos/kotoba-lang/org-babashka-nbb/cli.js";
  if (fs.existsSync(kbbBin) && fs.existsSync(engine)) {
    return { cmd: kbbBin, pre: ["--backend", "sci"], env: { ...process.env, KBB_ENGINE: engine } };
  }
  if (fs.existsSync(engine)) return { cmd: "node", pre: [engine], env: process.env };
  return { cmd: "nbb", pre: [], env: process.env };
}
const R = runner();
const gate = (root) => run("node", [], [path.join(repo, "bin/verify-packaging-gate.mjs"), root]);
const combined = (r) => (r.stdout || "") + (r.stderr || "");

// --- ZB14-012/041: packaging gate -------------------------------------
{
  const real = gate(repo);
  check(real.status !== 0 && combined(real).includes("LICENSE is missing"),
    "ZB14-012 real repo: packaging gate refuses fail-closed naming the missing LICENSE");

  const dir = tmp("zb14-pack-");
  try {
    fs.mkdirSync(path.join(dir, "data"), { recursive: true });
    fs.mkdirSync(path.join(dir, "docs"), { recursive: true });
    fs.copyFileSync(path.join(repo, "data/provenance.edn"), path.join(dir, "data/provenance.edn"));
    fs.copyFileSync(path.join(repo, "docs/DATA-LICENSES-STATUS.md"), path.join(dir, "docs/DATA-LICENSES-STATUS.md"));
    fs.writeFileSync(path.join(dir, "README.md"), "license-pending packaging-on-hold\n");
    const noLicense = gate(dir);
    check(noLicense.status !== 0, "ZB14-012 temp copy without LICENSE still refuses");
    fs.writeFileSync(path.join(dir, "LICENSE"), "dummy license for the negative control only\n");
    const withLicense = gate(dir);
    check(withLicense.status === 0 && combined(withLicense).includes("packaging gate ok"),
      "ZB14-012 temp copy with dummy LICENSE + full inventory passes (only case that may pass)");
    fs.writeFileSync(path.join(dir, "README.md"), "notice removed\n");
    const stripped = gate(dir);
    check(stripped.status !== 0 && combined(stripped).includes("ZB14-041"),
      "ZB14-041 README without the license-pending/packaging-on-hold notice fails naming ZB14-041");
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

// --- ZB14-038: provenance staleness ------------------------------------
{
  const fresh = run("node", [], [path.join(repo, "bin/verify-provenance-freshness.mjs"),
    "--as-of-today", "2026-11-27", "--max-age-days", "90"]);
  check(fresh.status === 0 && combined(fresh).includes("provenance fresh"),
    "ZB14-038 committed provenance (2026-11-21) is fresh at 2026-11-27/90d");
  const dir = tmp("zb14-fresh-");
  try {
    fs.mkdirSync(path.join(dir, "data"), { recursive: true });
    const stale = fs.readFileSync(path.join(repo, "data/provenance.edn"), "utf8")
      .replace('"2026-11-21"', '"2020-01-01"');
    fs.writeFileSync(path.join(dir, "data/provenance.edn"), stale);
    const r = run("node", [], [path.join(repo, "bin/verify-provenance-freshness.mjs"), dir,
      "--as-of-today", "2026-11-27", "--max-age-days", "90"]);
    check(r.status !== 0 && combined(r).includes("ZB14-038") && combined(r).includes("2020-01-01"),
      "ZB14-038 temp provenance rewritten to 2020-01-01 fails naming ZB14-038 and the stale date");
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

// --- ZB14-005: states pin consistency ----------------------------------
{
  const pin = (root) => run("node", [], [path.join(repo, "bin/verify-states-pin.mjs"), root]);
  const real = pin(repo);
  check(real.status === 0 && combined(real).includes("f7ab426dd61ecac135af14535528d27a90b0b990"),
    "ZB14-005 registry and :joins-unwired agree on app-itonami-states@f7ab426d offline");
  const dir = tmp("zb14-states-");
  try {
    fs.mkdirSync(path.join(dir, "coverage"), { recursive: true });
    fs.copyFileSync(path.join(repo, "coverage/registry.edn"), path.join(dir, "coverage/registry.edn"));
    fs.writeFileSync(path.join(dir, "sources.lock.edn"), "{}\n");
    const missing = pin(dir);
    check(missing.status !== 0 && combined(missing).includes("ZB14-005"),
      "ZB14-005 lock without the states pin fails naming ZB14-005");
    const reg2 = fs.readFileSync(path.join(dir, "coverage/registry.edn"), "utf8")
      .replace("network-awai/app-itonami-states", "network-awai/app-itonami-states-mutated");
    fs.writeFileSync(path.join(dir, "coverage/registry.edn"), reg2);
    fs.writeFileSync(path.join(dir, "sources.lock.edn"),
      fs.readFileSync(path.join(repo, "sources.lock.edn"), "utf8"));
    const r2 = pin(dir);
    check(r2.status !== 0 && combined(r2).includes("ZB14-005") && combined(r2).includes("mismatch"),
      "ZB14-005 registry/lock repository mismatch fails naming ZB14-005 mismatch");
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

// --- ZB14-040: attribute rename breaks the crosswalk loudly ------------
{
  const verify = (root) => run(R.cmd, R.pre,
    [path.join(repo, "bin/verify-attribute-crosswalk.cljk"), root], { env: R.env, cwd: repo });
  const real = verify(repo);
  check(real.status === 0 && combined(real).includes("verified"),
    "ZB14-040 committed crosswalk verifies before the rename control");
  const dir = tmp("zb14-xwalk-");
  try {
    for (const d of ["schema", "coverage", "data"]) fs.cpSync(path.join(repo, d), path.join(dir, d), { recursive: true });
    const regPath = path.join(dir, "coverage/registry.edn");
    fs.writeFileSync(regPath, fs.readFileSync(regPath, "utf8")
      .replace(":energy.final/consumption-pj", ":energy.final/consumption-pj-renamed"));
    const r = verify(dir);
    check(r.status !== 0 && combined(r).includes("consumption-pj-renamed"),
      "ZB14-040 renamed input attribute fails naming :energy.final/consumption-pj-renamed");
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

// --- ZB14-037: missing column -> non-zero exit, zero writes ------------
function writeFixture(src, { dropOil }) {
  const wbFiles = ["renewable-electricity-share-2021.json", "fossil-electricity-share-2022.json",
    "nuclear-electricity-share-2022.json", "renewable-final-energy-share-2022.json",
    "population-2022.json", "gdp-per-capita-current-usd-2022.json",
    "life-expectancy-2022.json", "internet-users-percent-2022.json"];
  const wbDir = path.join(src, "org.worldbank.api/raw/wdi/2026-11-21");
  fs.mkdirSync(wbDir, { recursive: true });
  for (const f of wbFiles) {
    const year = f.includes("2021") ? "2021" : "2022";
    fs.writeFileSync(path.join(wbDir, f), JSON.stringify([{}, [{ countryiso3code: "USA", value: 1.5, date: year, country: { value: "United States" } }]]));
  }
  fs.writeFileSync(path.join(src, "org.worldbank.api/raw/source-catalog.edn"),
    `{:sources [${wbFiles.map((f) => `{:path "raw/wdi/2026-11-21/${f}" :retrieved-at "2026-11-21T00:00:00Z"}`).join(" ")}]}\n`);
  const owidDir = path.join(src, "org.ourworldindata/raw/grapher/2026-11-21");
  fs.mkdirSync(owidDir, { recursive: true });
  const header = "Entity,Code,Year,Other renewables,Bioenergy,Solar,Wind,Hydropower,Nuclear,Oil,Gas,Coal";
  fs.writeFileSync(path.join(owidDir, "electricity-prod-source-stacked.csv"),
    (dropOil ? header.replace(",Oil,", ",Oill,") : header) + "\nUnited States,USA,2024,1,2,3,4,5,6,7,8,9\n");
  fs.writeFileSync(path.join(src, "org.ourworldindata/raw/source-catalog.edn"),
    `{:sources [{:path "raw/grapher/2026-11-21/electricity-prod-source-stacked.csv" :retrieved-at "2026-11-21T00:00:00Z"}]}\n`);
  fs.mkdirSync(path.join(src, "jp.go.meti.enecho/derived"), { recursive: true });
  fs.writeFileSync(path.join(src, "jp.go.meti.enecho/derived/enecho-energy-timeseries.edn"),
    "{:series/observations [{:fy 2024 :final-energy-pj 100.0 :generation-100m-kwh 1000.0 :thermal-excluding-biomass-100m-kwh 500.0 :non-fossil-100m-kwh 400.0 :renewables-including-hydro-100m-kwh 300.0}]}\n");
  const sdgDir = path.join(src, "org.un.unstats/raw/sdg/2026-11-21");
  fs.mkdirSync(sdgDir, { recursive: true });
  const sdg = JSON.stringify({ data: [{ geoAreaCode: "840", value: "99.5", timePeriodStart: 2022, geoAreaName: "United States", dimensions: { Location: "ALLAREA" } }] });
  fs.writeFileSync(path.join(sdgDir, "electricity-access-2022.p1.json"), sdg);
  fs.writeFileSync(path.join(sdgDir, "renewable-final-energy-share-2022.p1.json"), sdg);
  fs.mkdirSync(path.join(src, "org.un.unstats/derived/2026-11-21"), { recursive: true });
  fs.writeFileSync(path.join(src, "org.un.unstats/derived/2026-11-21/m49-iso3.edn"),
    '{:crosswalk/entries [{:geo/m49 "840" :country/iso3 "USA"}]}\n');
  fs.writeFileSync(path.join(src, "org.un.unstats/raw/source-catalog.edn"),
    `{:sources [{:path "raw/sdg/2026-11-21/electricity-access-2022.p1.json" :retrieved-at "2026-11-21T00:00:00Z"} {:path "raw/sdg/2026-11-21/renewable-final-energy-share-2022.p1.json" :retrieved-at "2026-11-21T00:00:00Z"}]}\n`);
}
{
  const buildIn = (dropOil) => {
    const work = tmp("zb14-build-");
    const src = path.join(work, "sources");
    fs.mkdirSync(src, { recursive: true });
    writeFixture(src, { dropOil });
    fs.copyFileSync(path.join(repo, "nbb.edn"), path.join(work, "nbb.edn"));
    const r = run(R.cmd, R.pre, [path.join(repo, "bin/build.cljk"), src], { env: R.env, cwd: work });
    const dataDir = path.join(work, "data");
    const written = fs.existsSync(dataDir) ? fs.readdirSync(dataDir).length : 0;
    const out = { r, written };
    fs.rmSync(work, { recursive: true, force: true });
    return out;
  };
  const good = buildIn(false);
  check(good.r.status === 0 && good.written === 3,
    `ZB14-037 valid minimal fixture builds and writes 3 files (got status=${good.r.status} written=${good.written})`);
  const bad = buildIn(true);
  check(bad.r.status !== 0 && combined(bad.r).includes("Oil") && bad.written === 0,
    `ZB14-037 OWID csv without the Oil column exits non-zero naming Oil with zero writes (got status=${bad.r.status} written=${bad.written})`);
}

if (failures > 0) { console.log(`ZB14 negative controls: ${failures} FAIL`); process.exit(1); }
console.log("ZB14 negative controls: all ok (ZB14-012/041/037/038/040/005)");

