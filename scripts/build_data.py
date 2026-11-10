"""Build data/values.json and data/pref.topojson.
Usage: python3 -I scripts/build_data.py <S5 plain text from mmc1.docx> <bmjph map.topojson>
values: Supplementary Table S5 of Koda M, et al. IJDRR 2026;143:106317 (CC BY 4.0)."""
import json, re, sys
txt, topo_path = sys.argv[1], sys.argv[2]
lines = open(txt, encoding='utf-8').read().split('\n')
s = next(i for i, l in enumerate(lines) if 'Supplementary Table S5' in l)
e = next(i for i, l in enumerate(lines) if 'Supplementary Table S6' in l)
ITEMS = ['Secured furniture against overturning', 'Stockpiled food, beverages, and other supplies',
         'Prepared emergency go-bag', 'Had family safety-confirmation method',
         'Knew evacuation sites/routes when at home', 'Knew evacuation sites/routes when away from home']
rx = re.compile(r'^\s*(\S.*?)\s{2,}(' + '|'.join(map(re.escape, ITEMS)) + r')\s+(\d+)\s+([\d.]+) \(([\d.]+)-([\d.]+)\)\s*$')
rows = []
for l in lines[s:e]:
    m = rx.match(l)
    if m: rows.append(m.groups())
prefs = list(dict.fromkeys(r[0] for r in rows))
assert len(rows) == 47 * 6 and len(prefs) == 47, (len(rows), len(prefs))
JA = ('北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 '
      '石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 '
      '岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県').split()
# Table 2 of the paper: overall weighted prevalence (95% CI), n = 28,481
NATIONAL = [[31.9, 30.8, 33.1], [42.4, 41.1, 43.7], [32.7, 31.6, 33.9], [28.9, 27.7, 30.1], [40.4, 39.1, 41.7], [30.0, 28.8, 31.2]]
out = {'items': ITEMS, 'prefs': prefs, 'ja': JA, 'national': NATIONAL, 'n': {}, 'v': {}}
for p, it, n, v, lo, hi in rows:
    out['n'][p] = int(n)
    out['v'].setdefault(p, [None] * 6)[ITEMS.index(it)] = [float(v), float(lo), float(hi)]
json.dump(out, open('data/values.json', 'w'), ensure_ascii=False, separators=(',', ':'))
allv = [x[0] for p in prefs for x in out['v'][p]]
print('rows', len(rows), 'min', min(allv), 'max', max(allv), 'total n', sum(out['n'].values()))

t = json.load(open(topo_path))
geoms = t['objects']['pref']['geometries']
used = {}
def remap(a):
    if isinstance(a, list): return [remap(x) for x in a]
    i = a if a >= 0 else ~a
    if i not in used: used[i] = len(used)
    return used[i] if a >= 0 else ~used[i]
assert [g['properties']['pref'] for g in geoms] == JA
for g in geoms: g['arcs'] = remap(g['arcs'])
arcs = [None] * len(used)
for old, new in used.items(): arcs[new] = t['arcs'][old]
json.dump({'type': 'Topology', 'transform': t['transform'], 'arcs': arcs, 'objects': {'pref': t['objects']['pref']}},
          open('data/pref.topojson', 'w'), ensure_ascii=False, separators=(',', ':'))
print('pref names', [g['properties']['pref'] for g in geoms][:5], 'arcs', len(arcs))
