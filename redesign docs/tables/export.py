#!/usr/bin/env python3
"""Regenerate the three CSVs in this folder from COMBAT_MATRIX.md (section 14).

The matrix is the only source of truth; never edit the CSVs by hand.
Usage: python3 "redesign docs/tables/export.py"
"""
import csv
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
MATRIX = os.path.join(HERE, '..', 'COMBAT_MATRIX.md')


def plain(cell):
    """Strip markdown emphasis and code ticks so the CSV holds plain text."""
    return re.sub(r'\*\*|`', '', cell).strip()


def table_after(lines, heading):
    """Rows (as dicts) of the first markdown table after the given heading line."""
    start = next(i for i, l in enumerate(lines) if l.strip() == heading)
    rows = []
    for l in lines[start + 1:]:
        if l.startswith('#'):
            break
        if l.startswith('|'):
            rows.append([plain(c) for c in l.strip().strip('|').split('|')])
        elif rows:
            break
    head, body = rows[0], rows[2:]
    return [dict(zip(head, r)) for r in body]


def values(lines, heading, key):
    """Map of name -> starting values from a two-column 11.x table."""
    return {r[key]: r['Starting values'] for r in table_after(lines, heading)}


def write(name, fields, rows):
    with open(os.path.join(HERE, name), 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    print(f'{name}: {len(rows)} rows')


def main():
    lines = open(MATRIX, encoding='utf-8').read().splitlines()

    # Reactions (section 1) and interaction rows (section 3).
    rows = []
    for r in table_after(lines, '## 1. Complete 21-pair reaction matrix'):
        rows.append({
            'Name': f"{r['Reaction']} ({r['Pair']})", 'Kind': 'Reaction', 'Types': r['Pair'],
            'Trigger kind': r['Trigger kind'], 'Trigger': r['Trigger'], 'Result': r['One clear payoff'],
            'Size': r['Size'], 'Limits': r['Guardrails'], 'Design status': 'Proposed',
        })
    for r in table_after(lines, '### Defence and mechanic interactions (one row each)'):
        rows.append({
            'Name': r['Interaction'], 'Kind': 'Interaction', 'Types': '', 'Trigger kind': '',
            'Trigger': '', 'Result': r['Rule'], 'Size': '', 'Limits': '', 'Design status': r['Status'],
        })
    write('combat_interactions.csv',
          ['Name', 'Kind', 'Types', 'Trigger kind', 'Trigger', 'Result', 'Size', 'Limits', 'Design status'], rows)

    # Defences (section 3) with starting values (11.4).
    start = values(lines, '### 11.4 Defences', 'Defence')
    rows = []
    for r in table_after(lines, '## 3. Defensive layer matrix'):
        short = r['Defence'].split(' /')[0]
        rows.append({
            'Name': r['Defence'], 'Core rule': r['Core rule'], 'Identity': r['Strength / identity'],
            'Limits and counterplay': r['Limits and counterplay'], 'Starting values': start.get(short, ''),
            'Design status': 'Accepted',
        })
    write('defences_traits.csv',
          ['Name', 'Core rule', 'Identity', 'Limits and counterplay', 'Starting values', 'Design status'], rows)

    # Statuses and world objects (section 4) with starting values (11.5, 11.6).
    st = values(lines, '### 11.5 Statuses', 'Status')
    st['Poise Pressure'] = st.get('Poise stagger', '')
    wo = {r['Object']: ('Size' if r['Radius'].startswith('about') else 'Radius') + f" {r['Radius']}, lifetime {r['Lifetime']}"
          + (f"; {r['Notes']}" if r['Notes'] else '')
          for r in table_after(lines, '### 11.6 World objects')}
    wo['Wax Pool'] = wo.get('Wax wall', '')
    rows = []
    for r in table_after(lines, '## 4. Status ownership and counterplay'):
        rows.append({
            'Name': r['Status'], 'Kind': 'Status', 'Owner or source': r['Owner'], 'Trigger': r['Trigger'],
            'Effect': r['Consequence'], 'Counterplay and limit': r['Counterplay and limit'],
            'Distinction': r['Distinction'], 'Starting values': st.get(r['Status'], ''),
            'Design status': r['Design status'],
        })
    for r in table_after(lines, '### World objects'):
        rows.append({
            'Name': r['Object'], 'Kind': 'World object', 'Owner or source': r['Made by'], 'Trigger': '',
            'Effect': r['Does'], 'Counterplay and limit': r['Limit'], 'Distinction': '',
            'Starting values': wo.get(r['Object'], ''), 'Design status': r['Design status'],
        })
    write('mechanics_statuses.csv',
          ['Name', 'Kind', 'Owner or source', 'Trigger', 'Effect', 'Counterplay and limit', 'Distinction',
           'Starting values', 'Design status'], rows)


if __name__ == '__main__':
    main()
