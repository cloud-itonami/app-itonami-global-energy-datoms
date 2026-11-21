# Snapshot change 2026-11-21 — single-year projection

The single-year projection (`data/datascript-tx.edn`, `data/global-energy.kotoba.edn`,
`data/provenance.edn`, `data/quality-report.edn`) was rebuilt from the snapshots re-fetched
on 2026-11-21 (AWAI-3651). Everything below is measured by comparing the old
`data/datascript-tx.edn` (git HEAD before the rebuild, 972 entities) with the new one
(981 entities). Observation identity is `:energy.observation/id`; "changed" means the same
observation id carries a different attribute value (`##NaN` == `##NaN` counts as unchanged
and is listed separately, since `NaN` never equals itself).

Pins used (`sources.lock.edn :sources-2026-11-21`):

- World Bank WDI `cloud-itonami/app-itonami-org.worldbank.api@04a43f3e` (`raw/wdi/2026-11-21/`, release `2026-11-21T02:48:33Z`)
- Our World in Data `cloud-itonami/app-itonami-org.ourworldindata@0f13c95e` (`raw/grapher/2026-11-21/`, release `2026-11-21T02:37:15Z`)
- METI `etzhayyim/jp.go.meti.enecho@cc2d7e4f` (unchanged; no new snapshot — its upstream answered HTTP 403 to automated requests on 2026-11-21)
- UN SDG `cloud-itonami/app-itonami-org.un.unstats@cb1fae3d` (`raw/sdg/2026-11-21/`, releases `2026-11-21T02:47:03Z` / `2026-11-21T02:47:10Z`; crosswalk `derived/2026-11-21/m49-iso3.edn`)

Two deviations from the issue text, both verified twice against the remote: the UN revision
named in the issue (`e4c20491…`) does not exist in the UN repository — the build uses the
`muse/awai-3650-un-refresh` branch tip, whose tree holds exactly the named files — and the
`:datom/tx` moved from `20260710` to `20261121` with `:build/as-of` `2026-11-21`.

## Per-source observation counts

| source | old | new | both | changed | only-old | only-new |
|---|---|---|---|---|---|---|
| `:source/worldbank-wdi` | 507 | 509 | 507 | 202 (200 value, 2 name-only) | 0 | 2 |
| `:source/our-world-in-data` | 190 | 197 | 190 | 0 | 0 | 7 |
| `:source/jp-go-meti-enecho` | 1 | 1 | 1 | 0 | 0 | 0 |
| `:source/un-sdg` | 274 | 274 | 274 | 0 value (1 name-only) | 0 | 0 |

New observation ids: `owid-electricity-2024-ARE/KHM/LKA/SAU/SGP/SLV/UKR` and
`worldbank-wdi-2021-FCV` + `worldbank-wdi-2022-FCV` (`FCV` = "Fragility, Conflict, and
Violence (FCV) situations", a World Bank aggregate first published in the November
snapshot). No observation id was lost.

## Per-attribute value counts

`only-old` is 0 for every attribute. `nan-both` counts observations carrying `##NaN` in
both projections (non-numeric source cells, unchanged).

World Bank:

| attribute | old | new | both | changed | only-old | only-new |
|---|---|---|---|---|---|---|
| `:energy.electricity/renewable-share-percent` | 247 | 248 | 247 | 73 | 0 | 1 |
| `:energy.electricity/fossil-share-percent` | 190 | 191 | 190 | 125 | 0 | 1 |
| `:energy.electricity/nuclear-share-percent` | 66 | 67 | 66 | 41 | 0 | 1 |
| `:demography/population-total` | 260 | 261 | 260 | 0 | 0 | 1 |
| `:economy/gdp-per-capita-current-usd` | 252 | 253 | 252 | 5 | 0 | 1 |
| `:health/life-expectancy-at-birth-years` | 260 | 261 | 260 | 2 | 0 | 1 |
| `:connectivity/internet-users-percent` | 210 | 210 | 210 | 0 | 0 | 0 |

World Bank renewable-share revisions dominate the change count (73 + 125 + 41); the source
`DIFF.edn` reports the same direction at file level (e.g. 77 changed values in
`renewable-electricity-share-2021.json`, plus one new economy row).

Our World in Data (2024 slice; columns read by name, so the upstream Gas/Oil column swap
changes nothing — e.g. USA 2024 stays `gas-twh 1869.9, oil-twh 30.47` in both projections):

| attribute | old | new | both | changed | only-old | only-new |
|---|---|---|---|---|---|---|
| `:energy.electricity/bioenergy-twh` | 190 | 197 | 190 | 0 | 0 | 7 |
| `:energy.electricity/coal-twh` | 190 | 195 | 190 | 0 | 0 | 5 |
| `:energy.electricity/gas-twh` | 190 | 193 | 190 | 0 | 0 | 3 |
| `:energy.electricity/hydropower-twh` | 190 | 193 | 190 | 0 | 0 | 3 |
| `:energy.electricity/nuclear-twh` | 190 | 194 | 190 | 0 | 0 | 4 |
| `:energy.electricity/oil-twh` | 190 | 196 | 190 | 0 | 0 | 6 |
| `:energy.electricity/other-renewables-twh` | 190 | 196 | 190 | 0 | 0 | 6 |
| `:energy.electricity/solar-twh` | 190 | 196 | 190 | 0 | 0 | 6 |
| `:energy.electricity/wind-twh` | 190 | 194 | 190 | 0 | 0 | 4 |

UN SDG (no value changed; 1 name change `Nauru` → `Naoero` for M49 `520`, matching the
refreshed M49 overview; `##NaN` cells identical in both):

| attribute | old | new | both | changed | only-old | only-new | nan-both |
|---|---|---|---|---|---|---|---|
| `:energy.access/electricity-percent` | 251 | 251 | 251 | 0 | 0 | 0 | 1 |
| `:energy.final/renewable-share-percent` (UN part) | 271 | 271 | 271 | 0 | 0 | 0 | 5 |
| `:energy.final/renewable-share-percent` (WB part) | 71 | 71 | 71 | 0 | 0 | 0 | 0 |

METI (unchanged pin, unchanged release `2026-04-14`): 1 entity, all five attributes
identical (`consumption-pj`, `generation-100m-kwh`, `thermal-excluding-biomass-share-percent`,
`non-fossil-share-percent`, `renewables-including-hydro-share-percent`).

## Distinct country codes

Gained (1): `FCV`. Lost (0): none. Distinct `:country/iso3` moved 278 → 279
(69 UN entities without a crosswalk ISO3 in both projections; the M49→ISO3 mapping itself
is unchanged — the new crosswalk only re-stamped `:retrieved-at` and renamed NRU).

## Quality thresholds (`bin/build-quality-report.cljk`, not lowered)

| threshold | limit | new value | holds |
|---|---|---|---|
| `:minimum-observations` | 900 | 981 | yes |
| `:minimum-wdi-iso3` | 450 | 509 | yes |
| `:minimum-owid-iso3` | 150 | 197 | yes |
| `:minimum-un-sdg-official-iso3` | 180 | 205 | yes |
| `:maximum-missing-required-provenance` | 0 | 0 | yes |

## Content identifiers (old → new)

The schema file is unchanged, so its CID is the same on both sides.

| file | old CID | new CID |
|---|---|---|
| `data/datascript-tx.edn` | `bafkreid5hv3ppyh4l3wegeqlukdjcnkfsahbdo23s4zlg3mcweurt44l7e` | `bafkreigrenaaehll6q554u7nptywiom33mtgwsqbo4crxy2mbkijmm5gta` |
| `data/global-energy.kotoba.edn` | `bafkreiaofilkubxm7aegrmrf2ytqxg4533f5jvzdrifqt3rpr4qi344bmq` | `bafkreidsjmpoybdeos33wnmofoq5onbys4vyznx3ovh7i3vrd7yjqmk7ey` |
| `data/provenance.edn` | `bafkreibxklnjzq5fllqh5qzwps5kuf5juvvdo7ulbqi2tty22gjhqne5tq` | `bafkreif2apkg3fza55ytyztwrphdbmxwjnzz2ekk3uec76kn4crxcnyupi` |
| `data/quality-report.edn` | `bafkreighdof2hw666j3uow54ug7hylw6atup76rmc6daopzhoykhbunw2m` | `bafkreifyvw3sg66td4us5td6ejaolcjkfs5qfbaeeduomfaeblngynbbfy` |
| `schema/energy.edn` | `bafkreic74k25bt4xr2yn567dgxmneymq6e3saceuqws3g63xrpoexfpu3q` | `bafkreic74k25bt4xr2yn567dgxmneymq6e3saceuqws3g63xrpoexfpu3q` |

The rewritten files have not been written to Yataverse; that needs a separate owner approval
(see `storage/yataverse-receipts/README.md`).
