#!/usr/bin/env node
// ZB14-038: staleness flag for data/provenance.edn :build/as-of.
// usage: node bin/verify-provenance-freshness.mjs [root] [--as-of-today YYYY-MM-DD] [--max-age-days N]
// Exit 1 naming the stale as-of when its age exceeds the threshold,
// regardless of any :build/note (e.g. the METI 403 note).
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const root = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--as-of-today" && args[args.indexOf(a) - 1] !== "--max-age-days") || ".";
const todayStr = opt("--as-of-today", new Date().toISOString().slice(0, 10));
const maxAge = Number(opt("--max-age-days", "90"));

const text = fs.readFileSync(path.join(root, "data/provenance.edn"), "utf8");
const m = text.match(/:build\/as-of\s+"(\d{4}-\d{2}-\d{2})"/);
if (!m) { console.error("ZB14-038 FAILED: data/provenance.edn has no :build/as-of date"); process.exit(1); }
const asOf = m[1];
const ageDays = Math.round((Date.parse(todayStr + "T00:00:00Z") - Date.parse(asOf + "T00:00:00Z")) / 86400000);
if (!Number.isFinite(ageDays)) { console.error(`ZB14-038 FAILED: cannot parse dates as-of=${asOf} today=${todayStr}`); process.exit(1); }
if (ageDays > maxAge) {
  console.error(`ZB14-038 FAILED: stale provenance: :build/as-of ${asOf} is ${ageDays} days old on ${todayStr}, exceeding --max-age-days ${maxAge}`);
  process.exit(1);
}
console.log(`provenance fresh: :build/as-of ${asOf} is ${ageDays} days old on ${todayStr} (max ${maxAge})`);
