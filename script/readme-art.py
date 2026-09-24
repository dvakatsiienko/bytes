"""the readme art: the firefly jar hero and one avatar per app, in bytes' own night and day.
`python3 script/readme-art.py` redraws assets/hero-*.svg and assets/avatars/*.svg.
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


A = 120
SPARK = 'M0-5L1.3-1.3 5 0 1.3 1.3 0 5-1.3 1.3-5 0-1.3-1.3z'


def backdrop(p, k):
    """the avatar tile: bytes' sky, a meadow strip, stars or a cloud"""
    t = THEME[k]
    paper = f'filter="url(#{p}paper)"'
    above = (''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#eee6cf" opacity=".7"/>' for x, y, r in ((18, 20, 1), (98, 16, 1.2), (106, 44, .8), (26, 52, .7)))
             if k == 'dark' else f'<path fill="#fbf9fe" {paper} transform="translate(80 22) scale(.6)" d="M0 0q8-12 20-6q9-9 21 0q12 0 12 9h-58q-2-5 5-3z"/>')
    return (f'<defs><linearGradient id="{p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{t["sky"][0]}"/><stop offset="1" stop-color="{t["sky"][1]}"/></linearGradient>'
            f'<clipPath id="{p}clip"><rect width="{A}" height="{A}" rx="16"/></clipPath>'
            f'<filter id="{p}paper" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#2a1a12" flood-opacity=".25"/></filter></defs>'
            f'<rect width="{A}" height="{A}" fill="url(#{p}sky)"/>{above}'
            f'<path fill="{t["back"]}" {paper} d="M0 94C30 88 70 94 120 90V120H0Z"/><path fill="{t["front"]}" {paper} d="M0 104C40 100 80 106 120 102V120H0Z"/>')


def trophy(p, k):
    glow = f'<circle cx="60" cy="56" r="42" fill="url(#{p}warm)"/>' if k == 'dark' else ''
    star = '#fff3c4' if k == 'dark' else '#fffbe6'
    return (f'{glow}<ellipse cx="60" cy="101" rx="26" ry="4" fill="#000" opacity=".18"/>'
            f'<g filter="url(#{p}paper)">'
            f'<path d="M40 40q-14 0-12 12q2 10 16 12M80 40q14 0 12 12q-2 10-16 12" stroke="url(#{p}brass)" stroke-width="4" fill="none" stroke-linecap="round"/>'
            f'<path d="M38 36h44v8q0 26-22 30q-22-4-22-30z" fill="url(#{p}brass)"/>'
            f'<rect x="56" y="72" width="8" height="12" fill="url(#{p}brassv)"/>'
            f'<rect x="44" y="84" width="32" height="12" rx="2.5" fill="url(#{p}brassv)"/><rect x="50" y="88" width="20" height="4" rx="1" fill="#6e4f18" opacity=".35"/></g>'
            f'<ellipse cx="60" cy="36" rx="22" ry="3.5" fill="#f8e3a0"/><ellipse cx="60" cy="36.5" rx="18" ry="2" fill="#a67a2a" opacity=".5"/>'
            f'<path d="M44 44q0 16 8 24" stroke="#fff" stroke-opacity=".55" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
            f'<path transform="translate(61 54) scale(1.6)" d="{SPARK}" fill="{star}"/>')


AVATARS = dict(
    trophy_sys=('trophy-sys: a brass trophy cup with a star on it', trophy),
)


def avatar(name, k):
    label, body = AVATARS[name]
    p = f'{name}-{k}-'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {A} {A}" width="{A}" height="{A}" role="img" aria-label="{label}">'
            f'{defs(p, k)}<g clip-path="url(#{p}clip)">{backdrop(p, k)}{body(p, k)}</g></svg>\n')


(OUT / 'avatars').mkdir(parents=True, exist_ok=True)
for k in ('light', 'dark'):
    (OUT / f'hero-{k}.svg').write_text(scene(k))
    for name in AVATARS:
        (OUT / f'avatars/{name.replace("_", "-")}-{k}.svg').write_text(avatar(name, k))
