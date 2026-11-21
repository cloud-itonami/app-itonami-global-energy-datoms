# Receipts for the 2026-11-21 projection and the series files

Each file here is the unmodified output of `yataverse put <file>` for one committed file, written on
2026-11-21 (AWAI-3672) against `https://yataverse.com` with the Yataverse CLI at
`cloud-itonami/app-itonami-yataverse` `186d3f96`. The file name is the path of the source file with
`/` written as `--`.

Ten files, 27,587,513 bytes: `data/datascript-tx.edn`, `data/global-energy.kotoba.edn`,
`data/provenance.edn`, `data/quality-report.edn`, and the six files under `data/series/`.

Checked on 2026-11-21, for every file:

- the `cid` in the receipt equals the row for that path in `../../cid-manifest.edn`;
- the block was read back with `yataverse get` and was byte-identical to the committed file;
- `yataverse verify-receipt <receipt> --file <path> --kind block` passed.

Every receipt has `state` 1, `storeClass` 1 (`edge-gateway`) and `retentionUntil` 0. That records
that the gateway accepted the block and read it back once. It is not a retention promise and is not
counted as a replica; the git history of this repository stays the durable copy. The retention
design that would change this is `cloud-itonami/app-itonami-yataverse` `docs/retention-design.md`.

A later rebuild that changes a file makes its receipt here refer to bytes that are no longer in the
manifest. Keep the directory and add a new dated one, as was done for `2026-07-10-snapshot/`.
