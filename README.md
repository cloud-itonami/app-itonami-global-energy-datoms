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

- `data/series/worldbank-wdi-2000-2023.datascript-tx.edn` は World Bank WDI 8 指標の 2000–2023 時系列の加法的な投影（6264 economy-year entities）。`nbb bin/build-series.cljk .sources` が `.sources/org.worldbank.api/raw/wdi-series/*.json` と同 repository の `raw/source-catalog.edn` の `:series` 行だけから再生成する。ネットワークへアクセスしない。
- `data/series/worldbank-wdi-2000-2023.kotoba.edn` は同内容の `[e a v tx :add]` EAVT。`data/series/quality-report.edn` は entities・distinct economies・存在年・属性別値数・値なし economy-year 数（欠測は補完しない）。
- 時系列は単年投影と別物として同じ schema で読める。`schema/energy.edn` と同じ db に `db-with` してもよいし、別 db に分けてもよい。query は `:energy.observation/source :source/worldbank-wdi-series` で絞る（例 `:worldbank-wdi-series-renewable-share-jpn-2000-2023`）。単年側の `:source/worldbank-wdi` とは結合しない。分ける理由: `data/` 既存ファイルと `storage/yataverse-receipts/` はバイト同一のまま残すこと、同一 identity を共有しないこと（`:energy.observation/id "worldbank-wdi-series-<year>-<code>"`）。World Bank が単年 snapshot 後に値を改訂しているため、両方が残る（renewable electricity share 2021 は 73 economy-year が不一致）。
- 適用 filter は単年の `read-wb` と同じ。`:countryiso3code` が `[A-Z]{3}` に一致し、JSON の `value` が数値である行だけを取り込む。null は属性を作らない（その economy-year に一つも値がなければ entity も作らない）。
- 入力 pin は `sources.lock.edn` の `:sources-unwired`（`bin/verify-ci-lock.cljk` は読まない）。単年 build が読む `:sources` の World Bank pin は変えない。検証は `nbb bin/verify-series.cljk .sources`（再計算の一致・checkout revision・固定 3 economy-year の raw 値照合）。

`upstream-drift.yml` は毎週、公開 URL のバイト列差分をジョブ要約に報告する。raw・lock・公開リリースを自動変更しないため、更新はレビュー可能な source dataset のコミットとして扱う。
