# Yataverse storage receipts — 2026-07-10 snapshot (superseded)

Each file here is the unmodified output of `yataverse put <file>` for one committed projection file,
written on 2026-11-21 (AWAI-3623) with the `kotoba-lang/yataverse` CLI at `f3771ee2`, against
`https://yataverse.com`. The file name is the path of the source file with `/` written as `--`.

- `cid` is the identifier the receipt was written for. Four of the five no longer match any row in
  `../../cid-manifest.edn`: the AWAI-3651 rebuild replaced them. They are kept here as the only
  copy of the signed receipts, not as live content identifiers.
- `receipt` is the signed storage receipt returned by the service. The receipt is not retrievable by
  its `receiptCid` (a read returned HTTP 504 on 2026-11-21), so these files are the only copy.
- A receipt records that the service accepted the block at `acceptedAt`. It is not a guarantee of
  retention: every receipt here has `retentionUntil` 0, and what `state` 1 and `storeClass` 1 promise
  was not established in this task.

Old content identifiers (from `storage/cid-manifest.edn` before AWAI-3651):

- `data/datascript-tx.edn`: `bafkreid5hv3ppyh4l3wegeqlukdjcnkfsahbdo23s4zlg3mcweurt44l7e` — no longer in the manifest.
- `data/global-energy.kotoba.edn`: `bafkreiaofilkubxm7aegrmrf2ytqxg4533f5jvzdrifqt3rpr4qi344bmq` — no longer in the manifest.
- `data/provenance.edn`: `bafkreibxklnjzq5fllqh5qzwps5kuf5juvvdo7ulbqi2tty22gjhqne5tq` — no longer in the manifest.
- `data/quality-report.edn`: `bafkreighdof2hw666j3uow54ug7hylw6atup76rmc6daopzhoykhbunw2m` — no longer in the manifest.
- `schema/energy.edn`: `bafkreic74k25bt4xr2yn567dgxmneymq6e3saceuqws3g63xrpoexfpu3q` — unchanged by the rebuild and still in the manifest.

The rewritten files have not been written to Yataverse. Writing them needs a separate owner
approval (AWAI-3651): run `yataverse put` for each rewritten file, read the blocks back with
`yataverse get`, verify with `yataverse verify-receipt --file`, and store the new receipts in a
new dated directory next to this one.

Check a receipt against the file it is for, offline apart from fetching the service's public keys:

    yataverse verify-receipt storage/yataverse-receipts/2026-07-10-snapshot/data--provenance.edn.json \
      --file data/provenance.edn --kind block

Check that the block is still served and hashes to its CID:

    yataverse verify <cid>

On 2026-11-21 all five blocks were read back with `yataverse get` and were byte-identical to the
committed files at that time. The four `data/` files have since been rewritten, so that
read-back statement no longer applies to them.
