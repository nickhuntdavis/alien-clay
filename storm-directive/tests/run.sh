#!/usr/bin/env bash
# Spawn Prawn test suite. Each test drives the real game page in headless Chromium (Playwright).
#   ./run.sh              the whole suite (about 8 minutes); prints only failures, then a one-line summary
#   ./run.sh lvshot quick  just those tests
# Screenshots land in tests/out/ (git-ignored).
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-/opt/node22/lib/node_modules}"
mkdir -p out
# Local Macs: no `timeout`, and Playwright may only exist as playwright-core inside another project. Nothing is installed:
# a shim in out/.pw (git-ignored) points `require('playwright')` at the first playwright-core found under $HOME (or $PW_CORE).
if ! node -e "require('playwright')" 2>/dev/null; then
  core="${PW_CORE:-$(find "$HOME" -maxdepth 7 -type d -name playwright-core -path '*node_modules*' 2>/dev/null | head -1)}"
  if [ -n "$core" ]; then mkdir -p out/.pw/playwright; echo "module.exports = require('$core');" > out/.pw/playwright/index.js; export NODE_PATH="$PWD/out/.pw:$NODE_PATH"; fi
fi
if command -v timeout >/dev/null; then TO="timeout 300"; elif command -v gtimeout >/dev/null; then TO="gtimeout 300"; else TO=""; fi
# Retired under v10 (they test v9 systems v10 switches off; files kept, not run): sigwtest weirdbox pintest reborntest forktest junktest sxshot devall seqtest seqfeattest revealshot foescenetest colourtest fusiontest supertest rubbertest armtest newfeattest psttest f3test
ALL="spoontest wtagstest bodiestest collidetest holdhitstest reachtest hookstest statuptest dupetest celltest balloontest cell4test aimplustest branchtest lasershot laserbeamtest sptest slicetest spslicetest widetest delivtest v9armstest rackxtest kindredtest p11test v9backtest weapons24test wup1test wup2test wup3test wup4test wup5test wup6test sbtest wstatstest v10test fighttest pdeftest drafttest newfoestest elitetest modstest modcardtest foememtest mutdroptest samplestest mutstest featstest ufeatstest bosstest voicetest looktest schooltest bossshot perf18 inspecttest redtest bosstest claritytest genetest tapeshot loottest rrelictest relictest crayontest sillytest dailytest porttest finaletest juicetest autotest introtest logtest youshot2 quick overtest splash rivintro putest combotest rivals20 peek pairtest aimtest comboaudit chemtest sttest stpanel glosstest ghosttest evotest stamtest tuttest mythtest lvshot lvmenu hudshot3 losttest settabs batchcheck spawntest twintest rewindtest eggtest newtut rivalwave viewtest typetest rxtest typeshot fxclose envshot shotshot foeshot terraintest lgtchips dotrings tapcycle peektest barriershot bighaztest lashshot setshot newfeatshot combo3test combo10test autoruntest waves10test aimowntest tlshot chargeshot sivtest einkshot v9lookshot xbrdrafttest"
LIST="${*:-$ALL}"
pass=0; fail=0
for t in $LIST; do
  out=$(cd out && $TO node "../$t.js" 2>&1); code=$?
  bad=$(printf '%s' "$out" | grep -iE "ERRORS \[[^]]|Error:|broke|exception|FAIL" | grep -v "ERRORS \[\]")
  if [ $code -ne 0 ] || [ -n "$bad" ]; then fail=$((fail+1)); echo "FAIL $t (exit $code)"; printf '%s\n' "$out" | tail -4 | cut -c1-300; else pass=$((pass+1)); fi
done
echo "$pass passed, $fail failed"
[ $fail -eq 0 ]
