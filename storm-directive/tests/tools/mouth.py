# Generates Level 1 (The Mouth) as ASCII. Row 0 is the throat (top); the lips are at the bottom.
W, H = 28, 130
g = [['#'] * W for _ in range(H)]
def carve(x0, y0, x1, y1, ch='.'):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            g[y][x] = ch
def put(x, y, ch): g[y][x] = ch
def ellipse(cx, cy, rx, ry, ch='.'):
    for y in range(H):
        for x in range(W):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1: g[y][x] = ch

# ---- throat (rows 0-23)
ellipse(13.5, 3.5, 4.2, 2.3)            # the tonsil stone's alcove
put(13, 3, 'E'); put(14, 3, 'E')
carve(12, 6, 15, 7, '4')                 # gate 4: opens when the Tartar Colony dies
ellipse(13.5, 13, 9.6, 5.6)              # the boss room (the back of the throat)
for (x, y) in [(8, 11), (18, 11), (8, 14), (18, 14)]: carve(x, y, x + 1, y + 1, 'T')   # tonsils
carve(11, 18, 16, 22)                    # the way in
carve(13, 19, 14, 21, '~')
carve(11, 23, 16, 23, '3')               # gate 3: arena c

# ---- tongue (rows 24-62)
ellipse(13.5, 28, 8.6, 4.4)              # arena c: the back of the tongue (a saliva pool)
ellipse(13.5, 28, 4.2, 1.8, '~')
carve(11, 32, 16, 33)
carve(3, 34, 24, 60)                     # the open tongue
for (x, y) in [(6, 37), (13, 39), (20, 37), (9, 45), (17, 46), (5, 52), (13, 53), (21, 52), (9, 58), (18, 58)]: carve(x, y, x + 1, y + 1, 'T')   # teeth to shelter behind
for (x0, y0, x1, y1) in [(15, 41, 17, 42), (6, 48, 8, 49), (19, 55, 21, 56)]: carve(x0, y0, x1, y1, '~')
for (x, y) in [(4, 35), (23, 35), (3, 44), (24, 44), (3, 56), (24, 56)]: put(x, y, '#')       # papillae bumps on the edges
carve(21, 61, 24, 66)                    # down to the gums on the right
carve(12, 61, 15, 66)                    # the centre: a plaque wall (a shortcut once you shoot through)
carve(12, 63, 15, 64, 'p')

# ---- gum line (rows 63-108): a maze
carve(3, 67, 24, 70)                     # cross corridor
carve(12, 71, 15, 74)
carve(12, 75, 15, 75, '2')               # gate 2: arena b
ellipse(13.5, 81, 6.4, 5.2)              # arena b
carve(3, 79, 8, 82)
carve(3, 83, 6, 100)                     # the long way round, on the left
carve(3, 97, 15, 100)
carve(12, 87, 15, 96)                    # the short way: straight up, through plaque
carve(12, 90, 15, 92, 'p')
carve(16, 97, 24, 99)                    # a dead end on the right: the cavity
put(23, 98, 'v')
carve(19, 88, 24, 96)                    # a side room off the cavity passage (food scraps)
carve(19, 97, 20, 97)
carve(8, 86, 9, 96)                      # a dead-end spur from the left corridor
carve(7, 86, 9, 87)
carve(12, 101, 15, 108)
for (x, y) in [(13, 104), (4, 90), (22, 90), (20, 94), (9, 93), (5, 69), (22, 68)]: put(x, y, 'f')

# ---- lips (rows 109-129)
carve(12, 109, 15, 111)
carve(12, 110, 15, 110, '1')             # gate 1: arena a
ellipse(13.5, 118, 9.8, 6.2)             # arena a: behind the front teeth
for x in [5, 8, 11, 16, 19, 22]: carve(x, 113, x + 1, 114, 'T')   # the front teeth (gaps between)
carve(6, 124, 21, 127)                   # the lips
put(13, 126, 'S')
for (x, y) in [(7, 125), (20, 125)]: put(x, y, 'f')

for x in range(W): g[0][x] = g[H - 1][x] = '#'
for y in range(H): g[y][0] = g[y][W - 1] = '#'

rows = [''.join(r) for r in g]
# Connectivity: everything walkable reachable from S, treating gates and plaque as open.
from collections import deque
sx, sy = next((x, y) for y, r in enumerate(rows) for x, c in enumerate(r) if c == 'S')
seen = {(sx, sy)}; q = deque([(sx, sy)])
while q:
    x, y = q.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < W and 0 <= ny < H and rows[ny][nx] not in '#T' and (nx, ny) not in seen:
            seen.add((nx, ny)); q.append((nx, ny))
walk = {(x, y) for y, r in enumerate(rows) for x, c in enumerate(r) if c not in '#T'}
print('walkable', len(walk), 'unreached', len(walk - seen), 'exit reached', any(rows[y][x] == 'E' for x, y in seen))
# Without plaque: still solvable the long way?
seen2 = {(sx, sy)}; q = deque([(sx, sy)])
while q:
    x, y = q.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < W and 0 <= ny < H and rows[ny][nx] not in '#Tp' and (nx, ny) not in seen2:
            seen2.add((nx, ny)); q.append((nx, ny))
print('exit reachable without breaking plaque', any(rows[y][x] == 'E' for x, y in seen2))
open('mouth.txt', 'w').write('\n'.join(rows))
print('\n'.join(rows))
