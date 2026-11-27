#!/usr/bin/env node
// ZB14-005: offline consistency check for the unwired states join pin.
// usage: node bin/verify-states-pin.mjs [root]
// Compares coverage/registry.edn :join/states-country-directories with
// sources.lock.edn :joins-unwired (falling back to :joins). Changes no
// pin and no workflow; exit 1 naming the mismatch. No network, no
// states checkout needed (bin/verify-states-join.cljk covers the join
// itself when a checkout is available).
import fs from "node:fs";
import path from "node:path";

const root = process.argv[2] || ".";
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const registry = read("coverage/registry.edn");
const lock = read("sources.lock.edn");
const fail = (msg) => { console.error("ZB14-005 FAILED: " + msg); process.exit(1); };

function blockAfter(text, marker) {
  const i = text.indexOf(marker);
  if (i < 0) return null;
  const rest = text.slice(i, i + 4000);
  const repo = rest.match(/:join\/repository\s+"([^"]+)"/) || rest.match(/:repository\s+"([^"]+)"/);
  const rev = rest.match(/:revision\s+"([0-9a-f]{40})"/);
  return { repository: repo && repo[1], revision: rev && rev[1], hasMeasured: rest.includes(":join/measured") };
}

const reg = blockAfter(registry, ":join/states-country-directories");
if (!reg || !reg.repository) fail("coverage/registry.edn declares no :join/states-country-directories repository");
if (!reg.hasMeasured) fail("coverage/registry.edn states join has no :join/measured block to keep honest");

let locked = blockAfter(lock, ":join/states-country-directories");
if (!locked || !locked.repository) fail("sources.lock.edn pins no :join/states-country-directories (looked in :joins-unwired/:joins)");
if (!locked.revision) fail("sources.lock.edn states join pin has no 40-hex :revision");
if (reg.repository !== locked.repository) {
  fail(`states repository mismatch: registry=${reg.repository} lock=${locked.repository} for :join/states-country-directories`);
}
console.log(`states pin consistent: ${locked.repository}@${locked.revision} (:joins-unwired, registry :join/measured present)`);
