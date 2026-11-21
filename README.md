# global-energy-datoms

出典別 DataLad dataset を複製せず、世界のエネルギー統計を query 可能な共通 EDN に投影する公開契約です。

- `schema/energy.edn` は Datascript の schema。
- `data/datascript-tx.edn` は Datascript に直接 `db-with` できる entity map 群。
- `data/global-energy.kotoba.edn` は Kotoba 互換の `[e a v tx :add]` EAVT。
- `data/provenance.edn` は source repo・release・件数。
- `data/quality-report.edn` は出典別 ISO3 coverage・必須 provenance・下限値の決定的レポート。
- `coverage/registry.edn` は出典ごとの地理・年・指標 coverage と安全な結合キー。
- `coverage/registry.edn` の `:coverage/external-joins` は他 repository との結合キーと実測件数。`bin/verify-jurisdiction-join.cljk <法令 repository の checkout>` が、法令の `:jurisdiction/code`（national のみ）と `:country/iso3` の一致件数を再計算して照合する。`bin/verify-states-join.cljk <states repository の checkout>` が、`network-awai/app-itonami-states` の `data/gov/<iso3 小文字>/` ディレクトリ名（大文字化して完全一致）と `:country/iso3` の一致件数を再計算して照合する（pin は CI 未配線のため `sources.lock.edn` の `:joins-unwired`。所有者の配線待ち）。
- `coverage/country-code-kinds.edn` は `:country/iso3` の全 distinct 値と、固定した UN M49→ISO3 対応表（`derived/m49-iso3.edn`）との照合結果。`bin/verify-country-code-kinds.cljk <unstats repository の checkout>` が表を再計算して照合する。
- `connections/actors.edn` は actor／他リポジトリごとの read-only 接続契約。
- `adapters/read_only.cljk` は公開済み query だけを実行する Datascript consumer adapter。
- `storage/cid-manifest.edn` は `data/` と `schema/` の各ファイルの Yataverse CID（単一 raw ブロック識別子。受入や可用性を示すものではない）。`nbb bin/verify-cid-manifest.cljk` が全行を再計算して照合する。

再生成は、同階層の各 source dataset を取得後、`kbb --backend sci bin/build.cljk ..` を実行する。入力の raw snapshot は各 source dataset の annex 管理対象であり、ビルドはネットワークへアクセスしない。UN SDG の M49 は、固定した UN M49→ISO3 対応表だけで ISO3 に結合する。

Data contract は年・出典を属性として保持する。異なる年や方法論の値を同一観測値として上書きしない。

`upstream-drift.yml` は毎週、公開 URL のバイト列差分をジョブ要約に報告する。raw・lock・公開リリースを自動変更しないため、更新はレビュー可能な source dataset のコミットとして扱う。
