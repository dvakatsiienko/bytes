"""the readme avatars: one glass jar per app, the hero's shelf jars up close, in day and night.
`python3 script/readme-avatars.py` redraws assets/avatars/*.svg.
the jar and the lettering come from frame's profile kit (~/frame/brand/profile), so this runs on dima's mac only."""

import pathlib, sys

sys.path.insert(0, str(pathlib.Path.home() / 'frame/brand/profile'))
from tour import defs  # noqa: E402

OUT = pathlib.Path(__file__).resolve().parent.parent / 'assets'


A = 120
SPARK = 'M0-5L1.3-1.3 5 0 1.3 1.3 0 5-1.3 1.3-5 0-1.3-1.3z'


def ring(cx, cy, r, color='#c8641e', steps=((1, .1), (.72, .14), (.46, .18))):
    """light as stacked paper rings, the hero's glow language"""
    return '<g style="mix-blend-mode:screen">' + ''.join(f'<circle cx="{cx}" cy="{cy}" r="{r * s:.1f}" fill="{color}" opacity="{o}"/>' for s, o in steps) + '</g>'


def trophy(p, k):
    glow = ring(60, 56, 40, '#b88a2a') if k == 'dark' else ''
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


def alien(p, k):
    skin, skin2 = ('#8ec07c', '#6f9a5e') if k == 'light' else ('#6f9a5e', '#557a48')
    bubble = '#fbf9fe' if k == 'light' else '#e6e2d4'
    return (f'<ellipse cx="50" cy="101" rx="20" ry="3.5" fill="#000" opacity=".18"/>'
            f'<path d="M42 34L34 18M58 34L66 18" stroke="{skin2}" stroke-width="2.4" stroke-linecap="round"/><circle cx="34" cy="17" r="3.6" fill="#fabd2f"/><circle cx="66" cy="17" r="3.6" fill="#fabd2f"/>'
            f'<g filter="url(#{p}paper)"><path fill="{skin2}" d="M40 70h20l4 28h-28z"/><path d="M40 76q-10 4-12 12M60 76q10 4 12 12" stroke="{skin2}" stroke-width="4" stroke-linecap="round" fill="none"/>'
            f'<ellipse cx="50" cy="52" rx="24" ry="21" fill="{skin}"/></g>'
            f'<path d="M34 42q8-8 22-7" stroke="#fff" stroke-opacity=".45" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
            f'<ellipse cx="41" cy="54" rx="6" ry="8" fill="#1d2021" transform="rotate(-12 41 54)"/><ellipse cx="59" cy="54" rx="6" ry="8" fill="#1d2021" transform="rotate(12 59 54)"/>'
            f'<circle cx="39" cy="51" r="2" fill="#fff"/><circle cx="57" cy="51" r="2" fill="#fff"/><path d="M45 65q5 4 10 0" stroke="#1d2021" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
            f'<g filter="url(#{p}paper)"><path fill="{bubble}" d="M76 20h28q6 0 6 6v14q0 6-6 6h-18l-8 7 2-7q-6 0-6-6v-14q0-6 6-6z"/></g>'
            + ''.join(f'<circle cx="{x}" cy="33" r="2.4" fill="#83a598"/>' for x in (82, 90, 98)))


def rocket(p, k):
    hull = '#efe2c4' if k == 'light' else '#cfc6b2'
    glow = ring(60, 90, 26) if k == 'dark' else ''
    puffs = ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{"#fbf9fe" if k == "light" else "#9aa1b4"}"/>' for x, y, r in ((38, 98, 7), (50, 102, 8), (70, 102, 8), (82, 97, 7), (60, 104, 6)))
    return (f'{glow}<path fill="#e2552c" d="M51 80q9 26 9 26q0 0 9-26z"/><path fill="#fbe0a0" d="M55 80q5 14 5 14q0 0 5-14z"/>'
            f'<g filter="url(#{p}paper)">{puffs}</g>'
            f'<g filter="url(#{p}paper)"><path fill="#c0573a" d="M46 62l-12 20h12zM74 62l12 20h-12z"/>'
            f'<path fill="{hull}" d="M60 14q15 15 15 42v24h-30v-24q0-27 15-42z"/><path fill="#c0573a" d="M60 14q9 9 12 20h-24q3-11 12-20z"/>'
            f'<rect x="56" y="62" width="8" height="20" fill="#c0573a"/></g>'
            f'<circle cx="60" cy="46" r="8" fill="url(#{p}brass)"/><circle cx="60" cy="46" r="5.5" fill="#83a598"/><circle cx="58" cy="44" r="1.6" fill="#fff" opacity=".8"/>'
            f'<path d="M50 40v28" stroke="#fff" stroke-opacity=".5" stroke-width="2.5" stroke-linecap="round"/>')


def card(p, k):
    paper = '#fbf9fe' if k == 'light' else '#e6e2d4'
    lines = ''.join(f'<path d="M60 {y}h{w}" stroke="#8a7a68" stroke-width="2.2" stroke-linecap="round"/>' for y, w in ((54, 22), (61, 18), (68, 24)))
    return (f'<ellipse cx="60" cy="100" rx="30" ry="3.5" fill="#000" opacity=".15"/>'
            f'<g transform="rotate(-6 60 58)"><g filter="url(#{p}paper)"><rect x="28" y="32" width="64" height="52" rx="5" fill="{paper}"/></g>'
            f'<path fill="#9c4430" d="M28 37q0-5 5-5h54q5 0 5 5v6h-64z"/><path d="M34 38h20" stroke="#fbf9fe" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>'
            f'<circle cx="44" cy="61" r="10" fill="#d9b48a"/><circle cx="44" cy="58" r="4" fill="#6b4630"/><path fill="#6b4630" d="M36 69q8-8 16 0z"/>{lines}'
            f'<path d="M34 76h52" stroke="#d9cfb8" stroke-width="1.6"/></g>'
            f'<circle cx="60" cy="31" r="4" fill="url(#{p}brass)"/><circle cx="59" cy="30" r="1.3" fill="#fff" opacity=".8"/>')


def coins(p, k):
    sheet = '#fbf9fe' if k == 'light' else '#e6e2d4'
    stack = ''.join(f'<rect x="30" y="{94 - n * 7}" width="30" height="6" fill="url(#{p}brassv)"/><ellipse cx="45" cy="{94 - n * 7}" rx="15" ry="4" fill="url(#{p}brass)"/>' for n in range(5))
    bars = ''.join(f'<rect x="{72 + n * 7}" y="{78 - h}" width="5" height="{h}" fill="{c}"/>' for n, (h, c) in enumerate(((10, '#fe8019'), (16, '#8ec07c'), (24, '#8ec07c'))))
    return (f'<ellipse cx="62" cy="100" rx="36" ry="3.5" fill="#000" opacity=".18"/>'
            f'<g transform="rotate(5 82 60)"><g filter="url(#{p}paper)"><rect x="64" y="30" width="36" height="56" rx="3" fill="{sheet}"/></g>'
            + ''.join(f'<path d="M70 {y}h24" stroke="#b9a882" stroke-width="1.4"/>' for y in (38, 44, 50))
            + f'{bars}<path d="M70 80h24" stroke="#8a7a68" stroke-width="1.4"/></g>'
            f'<g filter="url(#{p}paper)">{stack}</g><ellipse cx="45" cy="66" rx="10" ry="2.4" fill="#6e4f18" opacity=".3"/>'
            f'<path transform="translate(45 66) scale(.9)" d="{SPARK}" fill="#fff3c4"/>')


# the last pair is each drawing's bbox centre in its own 120-unit space, shadow left out, measured in a browser;
# a redrawn prop is re-measured, or it drifts off the glass centre
AVATARS = dict(
    trophy_sys=('trophy-sys: a glass jar holding a brass trophy, gold label', trophy, '#d4a543', '#6e4f18', (60, 64.3)),
    x_com_chat=('x-com chat: a glass jar holding a small green alien with a speech bubble, green label', alien, '#8ec07c', '#4f6b3e', (68, 55.7)),
    space_explorer=('space explorer: a glass jar holding a paper rocket, blue label', rocket, '#83a598', '#34457a', (60, 62)),
    cv=('cv: a glass jar holding a pinned paper id card, paper label', card, '#efe2c4', '#8a6a3a', (60, 57.1)),
    financial=('financial: a glass jar holding brass coins and a ledger sheet, orange label', coins, '#fe8019', '#9c4430', (66.3, 64.3)),
)
SCALE = .56
GLASS_CENTRE = (60, 59.5)  # the clear glass between the lid (y 31) and the label (y 88)


def avatar(name, k):
    label, body, tint, tag, (cx, cy) = AVATARS[name]
    tx, ty = GLASS_CENTRE[0] - SCALE * cx, GLASS_CENTRE[1] - SCALE * cy
    p = f'{name}-{k}-'
    glass, edge = ('#cfe6ee', '#7fb4d6') if k == 'light' else ('#8fa6b8', '#6f93b0')
    paper = (f'<filter id="{p}paper" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.5" '
             f'flood-color="#2a1a12" flood-opacity=".25"/></filter>')
    ridges = ''.join(f'<rect x="{x}" y="16" width="1.6" height="13" fill="#5a3f12" opacity=".35"/>' for x in range(26, 96, 6))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {A} {A}" width="{A}" height="{A}" role="img" aria-label="{label}">'
            f'{defs(p, k)}<defs>{paper}<clipPath id="{p}clip"><rect x="23" y="31" width="74" height="78" rx="13"/></clipPath></defs>'
            f'<ellipse cx="60" cy="112" rx="36" ry="4" fill="#000" opacity=".16"/>'
            f'<rect x="22" y="30" width="76" height="80" rx="14" fill="{glass}" fill-opacity=".35" stroke="{edge}" stroke-opacity=".8" stroke-width="1.6"/>'
            f'<g clip-path="url(#{p}clip)"><rect x="22" y="30" width="76" height="80" fill="{tint}" opacity=".18"/>'
            f'<g class="content" transform="translate({tx:.1f} {ty:.1f}) scale({SCALE})">{body(p, k)}</g></g>'
            f'<path d="M30 44v44" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/><circle cx="31" cy="38" r="1.8" fill="#fff" opacity=".8"/>'
            f'<g filter="url(#{p}paper)"><rect x="41" y="88" width="38" height="15" rx="2" fill="#efe2c4"/></g><path d="M47 95.5h26" stroke="{tag}" stroke-width="2.4" stroke-linecap="round"/>'
            f'<rect x="18" y="14" width="84" height="18" rx="4" fill="url(#{p}brass)"/>{ridges}<ellipse cx="60" cy="15.5" rx="41" ry="2.4" fill="#f8e3a0" opacity=".85"/>'
            f'<rect x="18" y="29" width="84" height="2" fill="#5a3f12" opacity=".3"/></svg>\n')


(OUT / 'avatars').mkdir(parents=True, exist_ok=True)
for k in ('light', 'dark'):
    for name in AVATARS:
        (OUT / f'avatars/{name.replace("_", "-")}-{k}.svg').write_text(avatar(name, k))
