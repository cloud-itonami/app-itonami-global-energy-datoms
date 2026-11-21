#!/bin/sh
# bin/query-contract-jvm.sh -- run test/query_contract.cljk on the real JVM.
#
# Usage: bin/query-contract-jvm.sh
#
# Why this exists: this repository's sources are named `.cljk`
# (cljk-origin.edn, ADR-2609111500), and the JVM clojure loader only looks
# for .clj/.cljc, so a plain `clojure -M test/query_contract.cljk` builds
# its classpath and then fails with "Could not locate
# adapters/datalog_runtime ... on classpath". The established way to
# exercise .cljk namespaces on the JVM is the renamed-copy overlay from
# kotoba's scripts/jvm-cljk-run.sh (kotoba.git b94158fd48ec541b70d3c455912a06f407537ddc,
# the same sha this repo pins in deps.edn): mirror every .cljk on the
# resolved classpath as .cljc into a scratch overlay and put that overlay
# first on the classpath. The overlay lives under $TMPDIR and is deleted
# on exit: no .clj/.cljc mirror is committed, so the .cljk branding
# (ADR-2609111500) is unchanged.
#
# The classpath itself comes from `clojure -Spath`, which is why AWAI-3816
# had to pin io.github.kotoba-lang/test in deps.edn first: without one
# version to choose, tools.deps cannot build a classpath at all ("No known
# ancestor relationship between local versions").
#
# Environment: JAVA_CMD (default `java`) and CLOJURE_CMD (default `clojure`)
# name the real JVM toolchain.
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
java_cmd=${JAVA_CMD:-java}
clojure_cmd=${CLOJURE_CMD:-clojure}

cd "$repo_root"

scratch=$(mktemp -d "${TMPDIR:-/tmp}/query-contract-jvm.XXXXXX")
trap 'rm -rf "$scratch"' EXIT INT TERM
overlay="$scratch/ov"
mkdir -p "$overlay"

cp=$("$clojure_cmd" -Spath)
full_cp="$cp"

old_ifs=$IFS
IFS=:
for root in $full_cp; do
  IFS=$old_ifs
  case "$root" in
    /*) dir=$root ;;
    *) dir=$repo_root/$root ;;
  esac
  [ -d "$dir" ] || continue
  # Under the repository's own roots, skip scratch and checkout dirs: they
  # hold whole dependency trees (notably .agent-output/gitlibs, a full
  # kotoba.git checkout used only to isolate AWAI-3816) that would bury the
  # overlay in tens of thousands of shadowing symlinks.
  find "$dir" \
    \( -name .git -o -name .cpcache -o -name .nbb -o -name node_modules \
       -o -name .sources -o -name .joins -o -name .agent-output \) -prune \
    -o -name '*.cljk' -type f -print 2>/dev/null | while read -r src; do
    rel=${src#"$dir"/}
    dest="$overlay/${rel%.cljk}.cljc"
    mkdir -p "$(dirname "$dest")"
    ln -sf "$src" "$dest" 2>/dev/null || cp "$src" "$dest"
  done
  IFS=:
done
IFS=$old_ifs

exec "$java_cmd" -cp "$overlay:$full_cp" clojure.main test/query_contract.cljk
