# Data licenses status (ZB14-012/041)

Status date: 2026-11-21 (the `:build/as-of` in `data/provenance.edn`).
Owner/Legal decision: pending (item #121 / D2). This file grants no
license and asserts no redistribution right; it only inventories what
is still unconfirmed. While this status is pending, packaging and
public distribution are on hold (see `README.md`,
license-pending / packaging-on-hold) and
`node bin/verify-packaging-gate.mjs` refuses them fail-closed.

The projection under `data/` derives from the five sources recorded
in `data/provenance.edn`:

| source id | repository (provenance) | status |
|---|---|---|
| `:source/worldbank-wdi` | `cloud-itonami/app-itonami-org.worldbank.api` | Primary license unconfirmed; owner/Legal review pending. Do not treat as redistributable yet. |
| `:source/our-world-in-data` | `cloud-itonami/app-itonami-org.ourworldindata` | Primary license unconfirmed; upstream aggregates third-party sources whose terms also need review. Owner/Legal review pending. |
| `:source/jp-go-meti-enecho` | `etzhayyim/jp.go.meti.enecho` | Primary license unconfirmed; owner/Legal review pending. (No new snapshot: upstream returned HTTP 403 on 2026-11-21.) |
| `:source/un-sdg` | `cloud-itonami/app-itonami-org.un.unstats` | Primary license unconfirmed; UNSD terms may restrict redistribution. Owner/Legal review pending. |
| `:source/un-m49-overview` | `cloud-itonami/app-itonami-org.un.unstats` | Primary license unconfirmed (geo crosswalk from the same UNSD source); redistribution unconfirmed. Owner/Legal review pending. |

What would close this: an owner/Legal decision (item #121 / D2)
recording, per source, the primary license and whether redistribution
of the projected datoms is allowed, plus a `LICENSE` (or per-source
license list) committed on that basis. Until then the gate stays
closed; do not add a `LICENSE` speculatively.
