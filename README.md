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
- `coverage/attribute-crosswalk.edn` は `schema/energy.edn`・`coverage/*.edn`・`data/` 配下の各投影ファイルで使われる属性名の対応表（32 canonical 行・35 表記）。`:country/iso3` の別表記として `coverage/country-code-kinds.edn` の `:code`、法令側の `:jurisdiction/code`（national のみ）・states 側の `:directory-name`（大文字化した basename）を記録する。`nbb bin/verify-attribute-crosswalk.cljk [root]` が入力から属性名を再抽出して照合する。入力側の属性 rename はこのテストをわざと壊す。直すのは map の方で、data は変えない。rename を見つけたら報告する。
- 出典と取得日: crosswalk 自体は自作の対応表で第三者の分類や定義文を含まない。参照する UN M49→ISO3 対応表は `coverage/country-code-kinds.edn` に pin 済み（`cloud-itonami/app-itonami-org.un.unstats`、`derived/m49-iso3.edn`、sha256 記録あり）。法令・states の結合キーは `coverage/registry.edn` の `:coverage/external-joins` と `sources.lock.edn` の `:joins` / `:joins-unwired` の pin（legislation `f3fc1e31`、states `f7ab426d`）を参照する。投影の snapshot 取得日は `data/provenance.edn` の `:build/as-of "2026-11-21"`。
- この repo で作った部分（`coverage/attribute-crosswalk.edn`、`bin/verify-attribute-crosswalk.cljk`）の license は権利者の決定待ち。`data/` は各出典の条件のまま。

再生成は、各 source dataset を `.sources/<dir>` に取得後、`nbb bin/build.cljk .sources [<snapshot-set>]` を実行する。入力の raw snapshot は各 source dataset の annex 管理対象であり、ビルドはネットワークへアクセスしない。UN SDG の M49 は、固定した UN M49→ISO3 対応表だけで ISO3 に結合する。

- 単年投影は 2026-11-21 の再取得 snapshot から作る（`<snapshot-set>` の default）。`nbb bin/build.cljk .sources` は `raw/wdi/2026-11-21/`、`raw/grapher/2026-11-21/`、`raw/sdg/2026-11-21/`、`derived/2026-11-21/m49-iso3.edn` を読み、as-of と release を各 snapshot 行の `:retrieved-at` から取る。`nbb bin/build.cljk <old-checkouts> 2026-07-10` は旧 set を読み、旧 pin と組むと `main` の `data/` 4 ファイルをバイト単位で再現する。
- METI に新しい snapshot は無い。上流が 2026-11-21 の自動取得に HTTP 403 を返したため、pin・release とも不変（`data/provenance.edn` の `:build/note` に記録）。
- 列は名前で読む。上流 export は July 版と November 版の間で `Oil` と `Gas` の列位置を入れ替えたため、位置で読むと誤った値を書く。期待する列名・ファイルが一つでも欠けたら何も書き込まずに失敗する。
- 単年の入力 pin は `sources.lock.edn` の `:sources-2026-11-21`（`bin/verify-ci-lock.cljk` は読まない。`:sources` は旧投影のまま残す）。workflow への配線は所有者の項目。検証は `nbb bin/verify-projection.cljk .sources`（4 ファイル再計算の一致・checkout revision）。UN の revision は merge 済みの `main` の commit（`e4c20495`）を pin している。merge 時に所有者が確認する。
- 書き換わった単年 4 ファイルは Yataverse に書いていない。別の所有者承認が必要（`storage/yataverse-receipts/README.md`）。旧 receipt は `storage/yataverse-receipts/2026-07-10-snapshot/` に残す。

Data contract は年・出典を属性として保持する。異なる年や方法論の値を同一観測値として上書きしない。

- `data/series/worldbank-wdi-2000-2023.datascript-tx.edn` は World Bank WDI 8 指標の 2000–2023 時系列の加法的な投影（6264 economy-year entities）。`nbb bin/build-series.cljk .sources` が `.sources/org.worldbank.api/raw/wdi-series/*.json` と同 repository の `raw/source-catalog.edn` の `:series` 行だけから再生成する。ネットワークへアクセスしない。
- `data/series/worldbank-wdi-2000-2023.kotoba.edn` は同内容の `[e a v tx :add]` EAVT。`data/series/quality-report.edn` は entities・distinct economies・存在年・属性別値数・値なし economy-year 数（欠測は補完しない）。
- 時系列は単年投影と別物として同じ schema で読める。`schema/energy.edn` と同じ db に `db-with` してもよいし、別 db に分けてもよい。query は `:energy.observation/source :source/worldbank-wdi-series` で絞る（例 `:worldbank-wdi-series-renewable-share-jpn-2000-2023`）。単年側の `:source/worldbank-wdi` とは結合しない。分ける理由: `data/` 既存ファイルと `storage/yataverse-receipts/` はバイト同一のまま残すこと、同一 identity を共有しないこと（`:energy.observation/id "worldbank-wdi-series-<year>-<code>"`）。World Bank が単年 snapshot 後に値を改訂しているため、両方が残る（renewable electricity share 2021 は 73 economy-year が不一致）。
- 適用 filter は単年の `read-wb` と同じ。`:countryiso3code` が `[A-Z]{3}` に一致し、JSON の `value` が数値である行だけを取り込む。null は属性を作らない（その economy-year に一つも値がなければ entity も作らない）。
- 入力 pin は `sources.lock.edn` の `:sources-unwired`（`bin/verify-ci-lock.cljk` は読まない）。単年 build が読む `:sources` の World Bank pin は変えない。検証は `nbb bin/verify-series.cljk .sources`（再計算の一致・checkout revision・固定 3 economy-year の raw 値照合）。
- `data/series/owid-electricity-1920-2025.datascript-tx.edn` は OWID 発電量-fuel 別 9 指標の 1920–2025 時系列の加法的な投影（8830 economy-year entities、214 economies、106 年が連続、欠測は補完しない）。`nbb bin/build-owid-series.cljk .sources` が `.sources/org.ourworldindata/raw/grapher/2026-11-21/electricity-prod-source-stacked.csv` と同 repository の `raw/source-catalog.edn` の該当行だけから再生成する。名前の年範囲はデータが実際にもつ entity 年（1900–1919 は `OWID_WRL` など `[A-Z]{3}` に一致しない Code しかもたないため落ちる）である。
- `data/series/owid-electricity-1920-2025.kotoba.edn` は同内容の `[e a v tx :add]` EAVT。`data/series/owid-electricity-1920-2025.quality-report.edn` は entities・distinct economies・存在年・属性別値数（例 `:energy.electricity/bioenergy-twh` 8830、`:energy.electricity/gas-twh` 5974）・値なし economy-year 数（0）。
- 時系列は単年投影と別物として同じ schema で読める。query は `:energy.observation/source :source/our-world-in-data-series` で絞る（例 `:owid-electricity-series-solar-jpn-1920-2025`）。単年側の `:source/our-world-in-data` とは結合しない。分ける理由: `data/` 既存ファイルはバイト同一のまま残すこと、同一 identity を共有しないこと（`:energy.observation/id "owid-electricity-series-<year>-<code>"`、`release` は snapshot 行の `:retrieved-at "2026-11-21T02:37:15Z"`）。適用 filter と列→属性表は単年の `read-owid` と同じ。
- 列は名前で読む。上流 export は July 版と November 版の間で `Oil` と `Gas` の列位置を入れ替えたため、位置で読むと誤った値を書く。列名が一つでも欠けたら書き込まずに失敗する（`test/owid_series_columns.cljk` が列順入替で同一バイト、列欠落で失敗を検証する）。
- OWID 系列の入力 pin も `:sources-unwired`（`:series/owid-electricity-1920-2025`）。単年 build が読む `:sources` の OWID pin は変えない。検証は `nbb bin/verify-series.cljk .sources`（再計算の一致・checkout revision・CSV sha256・固定 3 economy-year `["JPN" 2024] ["USA" 2000] ["CHN" 2010]` の raw cell 照合）。
- 単年の 2024 投影（July snapshot）とは突合しない。参考値として、2024 の不一致は 7 economies が系列側の 2024 にだけ存在することによるもの（ARE KHM LKA SAU SGP SLV UKR。各属性の不一致数はそのうち値をもつ数で、gas と hydropower 3、wind と nuclear 4、coal 5、oil・solar・other-renewables 6、bioenergy 7）。共通する 190 economies の 2024 値に改訂はない。

`upstream-drift.yml` は毎週、公開 URL のバイト列差分をジョブ要約に報告する。raw・lock・公開リリースを自動変更しないため、更新はレビュー可能な source dataset のコミットとして扱う。
