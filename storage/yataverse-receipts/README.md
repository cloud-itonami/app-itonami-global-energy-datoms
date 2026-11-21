# Yataverse storage receipts

Dated directories hold the signed receipts returned by `yataverse put` for committed projection
files. The file name inside each directory is the path of the source file with `/` written as
`--`. Nothing here is uploaded by recording it; a receipt only records that the service accepted
the block at `acceptedAt` (`retentionUntil` 0 throughout).

- `2026-07-10-snapshot/` keeps every receipt written for the 2026-07-10 single-year projection
  (AWAI-3623). Four of its five content identifiers are no longer in `../cid-manifest.edn` after
  the AWAI-3651 rebuild; see the README there for the old CIDs.

- `2026-11-21/` holds the receipts for the ten files that are in `../cid-manifest.edn` after the
  AWAI-3651 rebuild and had no receipt: the four single-year projection files and the six
  `data/series/` files (World Bank 2000 to 2023, OWID 1920 to 2025). Written on 2026-11-21
  (AWAI-3672, owner approval recorded on AWAI-3651). See the README there.

`schema/energy.edn` did not change in the rebuild; its receipt is the one in
`2026-07-10-snapshot/`. With that, every row of `../cid-manifest.edn` has a receipt for its current
bytes as of 2026-11-21.
