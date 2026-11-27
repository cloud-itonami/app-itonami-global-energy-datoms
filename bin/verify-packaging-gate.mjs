#!/usr/bin/env node
// ZB14-012/041: fail-closed packaging / public-distribution gate.
// usage: node bin/verify-packaging-gate.mjs [root]
// Exit 0 only when a LICENSE exists AND docs/DATA-LICENSES-STATUS.md
// inventories every source in data/provenance.edn. While the owner/
// Legal decision (item #121 / D2) is pending this refuses (exit 1).
import fs from "node:fs";
import path from "node:path";

const root = process.argv[2] || ".";
const read = (rel) => { try { return fs.readFileSync(path.join(root, rel), "utf8"); } catch { return null; } };
const causes = [];

const provenance = read("data/provenance.edn");
if (provenance === null) causes.push("ZB14-012: data/provenance.edn is missing; cannot inventory sources");
const sourceIds = [...new Set([...(provenance || "").matchAll(/:source\/([a-z0-9-]+)/g)].map((m) => m[1]))];
if (provenance !== null && sourceIds.length === 0) causes.push("ZB14-012: no :source/* ids found in data/provenance.edn");

const readme = read("README.md") || "";
if (!readme.includes("license-pending")) causes.push("ZB14-041: README.md lacks the license-pending notice (data-use section)");
if (!readme.includes("packaging-on-hold")) causes.push("ZB14-041: README.md lacks the packaging-on-hold notice (data-use section)");

const inventory = read("docs/DATA-LICENSES-STATUS.md");
if (inventory === null) {
  causes.push("ZB14-012: docs/DATA-LICENSES-STATUS.md is missing; per-source license status is unrecorded");
} else {
  for (const id of sourceIds) if (!inventory.includes(id)) causes.push(`ZB14-012: docs/DATA-LICENSES-STATUS.md does not inventory :source/${id}`);
}

if (!fs.existsSync(path.join(root, "LICENSE"))) {
  causes.push("ZB14-012: LICENSE is missing (owner/Legal decision item #121 / D2 pending); redistribution terms for the "
    + `${sourceIds.length} provenance sources are unconfirmed, refusing packaging/public-distribution fail-closed`);
}

if (causes.length > 0) {
  console.error("PACKAGING GATE FAILED (fail-closed):");
  for (const c of causes) console.error(" - " + c);
  process.exit(1);
}
console.log(`packaging gate ok: LICENSE present and ${sourceIds.length} provenance sources inventoried (${sourceIds.join(", ")})`);
