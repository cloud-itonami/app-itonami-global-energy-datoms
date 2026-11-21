# Yataverse storage receipts

Dated directories hold the signed receipts returned by `yataverse put` for committed projection
files. The file name inside each directory is the path of the source file with `/` written as
`--`. Nothing here is uploaded by recording it; a receipt only records that the service accepted
the block at `acceptedAt` (`retentionUntil` 0 throughout).

- `2026-07-10-snapshot/` keeps every receipt written for the 2026-07-10 single-year projection
  (AWAI-3623). Four of its five content identifiers are no longer in `../cid-manifest.edn` after
  the AWAI-3651 rebuild; see the README there for the old CIDs.

No receipts have been written for the rewritten 2026-11-21 projection files
(`data/datascript-tx.edn`, `data/global-energy.kotoba.edn`, `data/provenance.edn`,
`data/quality-report.edn`). Writing them to Yataverse needs a separate owner approval: after it,
store the new receipts in a new dated directory next to `2026-07-10-snapshot/`.
