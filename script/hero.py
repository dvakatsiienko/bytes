"""the readme hero: the firefly jar in bytes' own night and day. `python3 script/hero.py` redraws assets/hero-*.svg.
the jar and the lettering come from frame's profile kit (~/frame/brand/profile), so this runs on dima's mac only."""

import pathlib, sys

sys.path.insert(0, str(pathlib.Path.home() / 'frame/brand/profile'))
from lettering import outline  # noqa: E402
from tour import defs, jar  # noqa: E402

W, H = 800, 260
OUT = pathlib.Path(__file__).resolve().parent.parent / 'assets'

THEME = dict(
    light=dict(sky=('#b9a8ec', '#f1ebfb'), back='#a9c48a', front='#8faa70', grass='#5d7a4c', title='#2a1a52', sub='#5b4a86'),
    dark=dict(sky=('#120c26', '#2b1d52'), back='#2f4838', front='#243a2c', grass='#4f6b3e', title='#f3ecff', sub='#b7a6e0'),
)
STARS = [(40, 30, 1.3), (118, 70, .9), (300, 26, 1.1), (352, 92, .8), (470, 20, 1.4), (560, 60, .9), (640, 28, 1.2),
         (722, 74, 1), (770, 34, .8), (604, 112, .7), (260, 118, .8), (30, 128, .9)]
FLIES = [(676, 132), (712, 98), (748, 140), (722, 172)]


def scene(k):
    t, p = THEME[k], f'hero-{k}-'
    paper = f'filter="url(#{p}paper)"'
    base = (f'<defs><linearGradient id="{p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{t["sky"][0]}"/><stop offset="1" stop-color="{t["sky"][1]}"/></linearGradient>'
            f'<clipPath id="{p}clip"><rect width="{W}" height="{H}" rx="16"/></clipPath>'
            f'<filter id="{p}paper" x="-5%" y="-20%" width="110%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#2a1a12" flood-opacity=".25"/></filter></defs>')
    if k == 'light':
        cloud = 'q8-12 20-6q9-9 21 0q12 0 12 9h-58q-2-5 5-3z'
        above = ''.join(f'<path fill="#fbf9fe" {paper} transform="translate({x} {y}) scale({s})" d="M0 0{cloud}"/>' for x, y, s in ((40, 44, 1.1), (560, 30, .8), (700, 74, 1.2)))
    else:
        above = ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#eee6cf" opacity=".7"/>' for x, y, r in STARS)
    tufts = ''.join(f'<path d="M{x} {y}l-3-8M{x} {y}l1-9M{x} {y}l4-7" stroke="{t["grass"]}" stroke-width="1.6" stroke-linecap="round"/>'
                    for x, y in ((40, 238), (96, 250), (330, 244), (520, 236), (610, 248), (760, 240)))
    meadow = (f'<path fill="{t["back"]}" {paper} d="M0 204C120 190 220 200 360 194S620 184 800 196V260H0Z"/>'
              f'<path fill="{t["front"]}" {paper} d="M0 224C140 214 260 222 420 216S680 210 800 218V260H0Z"/>{tufts}')
    s = 1.35
    spark = 'M0-5L1.3-1.3 5 0 1.3 1.3 0 5-1.3 1.3-5 0-1.3-1.3z'
    flies = ''.join(f'<circle cx="{x}" cy="{y}" r="6" fill="url(#{p}fly)"/><circle cx="{x}" cy="{y}" r="1.6" fill="#fff3c4"/>' if k == 'dark'
                    else f'<path transform="translate({x} {y}) scale(.8)" d="{spark}" fill="#e89a2c"/>' for x, y in FLIES)
    lamp = f'<g transform="translate({220 - 120 * s:.1f} {238 - 174 * s:.1f}) scale({s})">{jar(p, k)}</g>'
    words = (outline('bytes', 392, 138, 104, 'Bold', fill=t['title'], extra=paper)
             + outline('the apps', 398, 188, 36, 'Regular', fill=t['sub']))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" '
            f'aria-label="bytes — the apps: a glass jar with a brass lid, fireflies glowing inside">'
            f'{defs(p, k)}{base}<g clip-path="url(#{p}clip)"><rect width="{W}" height="{H}" fill="url(#{p}sky)"/>{above}{meadow}{lamp}{flies}{words}</g></svg>\n')


OUT.mkdir(exist_ok=True)
for k in ('light', 'dark'):
    (OUT / f'hero-{k}.svg').write_text(scene(k))
    print(OUT / f'hero-{k}.svg')
