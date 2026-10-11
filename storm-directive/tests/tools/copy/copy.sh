#!/bin/bash
# ./copy.sh export [file.xlsx]   write the sheet (default storm-directive/SpawnPrawn_Copy.xlsx)
# ./copy.sh import [file.xlsx]   apply edited cells back into web/js and web/index.html
set -e; D="$(cd "$(dirname "$0")" && pwd)"; ROOT="$D/../../.."; T="$(mktemp -d)"; X="${2:-$ROOT/SpawnPrawn_Copy.xlsx}"
case "$1" in
 export) node "$D/build.js" "$T/rows.json" && python3 "$D/xlsx.py" build "$T/rows.json" "$X";;
 import) python3 "$D/xlsx.py" read "$X" "$T/edits.json" && node "$D/extract.js" apply "$T/edits.json";;
 *) echo "usage: copy.sh export|import [file.xlsx]";;
esac
