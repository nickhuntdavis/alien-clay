#!/usr/bin/env bash
# Spawn Prawn test suite. Each test drives the real game page in headless Chromium (Playwright).
#   ./run.sh              the whole suite (about 8 minutes); prints only failures, then a one-line summary
#   ./run.sh lvshot quick  just those tests
# Screenshots land in tests/out/ (git-ignored).
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-/opt/node22/lib/node_modules}"
mkdir -p out
ALL="redtest bosstest claritytest genetest tapeshot loottest rrelictest crayontest sillytest dailytest porttest finaletest juicetest autotest introtest logtest youshot2 quick staintest overtest reborntest splash rivintro putest combotest forktest rivals20 peek pairtest aimtest comboaudit chemtest sttest stpanel glosstest ghosttest evotest stamtest tuttest junktest granttest mythtest lvshot lvmenu sxshot hudshot3 losttest settabs batchcheck"
LIST="${*:-$ALL}"
pass=0; fail=0
for t in $LIST; do
  out=$(cd out && timeout 300 node "../$t.js" 2>&1); code=$?
  bad=$(printf '%s' "$out" | grep -iE "ERRORS \[[^]]|Error:|broke|exception|FAIL" | grep -v "ERRORS \[\]")
  if [ $code -ne 0 ] || [ -n "$bad" ]; then fail=$((fail+1)); echo "FAIL $t (exit $code)"; printf '%s\n' "$out" | tail -4 | cut -c1-300; else pass=$((pass+1)); fi
done
echo "$pass passed, $fail failed"
[ $fail -eq 0 ]
