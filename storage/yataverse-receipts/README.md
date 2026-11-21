# Yataverse storage receipts

Each file here is the unmodified output of `yataverse put <file>` for one committed projection file,
written on 2026-11-21 (AWAI-3623) with the `kotoba-lang/yataverse` CLI at `f3771ee2`, against
`https://yataverse.com`. The file name is the path of the source file with `/` written as `--`.

- `cid` is the same identifier as the row for that path in `../cid-manifest.edn`.
- `receipt` is the signed storage receipt returned by the service. The receipt is not retrievable by
  its `receiptCid` (a read returned HTTP 504 on 2026-11-21), so these files are the only copy.
- A receipt records that the service accepted the block at `acceptedAt`. It is not a guarantee of
  retention: every receipt here has `retentionUntil` 0, and what `state` 1 and `storeClass` 1 promise
  was not established in this task.

Check a receipt against the file it is for, offline apart from fetching the service's public keys:

    yataverse verify-receipt storage/yataverse-receipts/data--provenance.edn.json \
      --file data/provenance.edn --kind block

Check that the block is still served and hashes to its CID:

    yataverse verify <cid>

On 2026-11-21 all five blocks were read back with `yataverse get` and were byte-identical to the
committed files.
