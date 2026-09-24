"""hero takes for FRM-257: bytes as the inside of the profile's cabin. `python3 script/hero-takes.py` redraws
assets/takes/take-<n>-{day,night}.svg. the crew comes from frame's profile kit (~/frame/brand/profile)."""

import pathlib, sys

sys.path.insert(0, str(pathlib.Path.home() / 'frame/brand/profile'))
import hero as grove  # noqa: E402
import tour  # noqa: E402
from lettering import outline, width  # noqa: E402

OUT = pathlib.Path(__file__).resolve().parent.parent / 'assets/takes'
W, H = 800, 300

# the props' own ground (stump under the jar, stone under the lamp) stays outdoors
tour.stump = lambda k: ''
tour.stone = lambda k: ''

ROOM = dict(
    day=dict(wall='#c98f5e', log='#a86d42', beam='#6b4a33', floor='#b07a4c', plank='#8a5a34', stone='#b9ab98', hl='#d8cbb6', hearth='#3a2a22',
             rug='#b5483a', rug2='#e0b060', trim='#efe2c4', sign='#d9b48a', ink='#4a3b2c', curtain='#5d7a4c', curtain2='#4f6b3e', pot='#5d7a4c',
             out=('#8fc3e6', '#e2eff3'), hill='#a8c4b8', pine='#7d9463', pineS='#4f6b3e'),
    night=dict(wall='#3a2925', log='#2a1d18', beam='#1f1512', floor='#30211b', plank='#22170f', stone='#5e5b68', hl='#7c7a88', hearth='#150e0c',
               rug='#7a2e2a', rug2='#a08040', trim='#8f8778', sign='#8a6a50', ink='#1f1612', curtain='#264038', curtain2='#1a302b', pot='#3a5044',
               out=('#141b31', '#243052'), hill='#2c3760', pine='#2b4a44', pineS='#16302b'),
)


def palette(night):
    return dict(grove.NIGHT, rexHi='#8e4a43') if night else dict(grove.DAY, rexHi='#d77552')


def room(R, f):
    logs = ''.join(f'<path d="M0 {y}H800" stroke="{R["log"]}" stroke-width="2"/>' for y in range(38, 240, 22))
    planks = ''.join(f'<path d="M{x} 246L{x + (x - 400) * .25:.0f} 300" stroke="{R["plank"]}" stroke-width="1.5"/>' for x in range(20, 800, 58))
    return (f'<rect width="{W}" height="244" fill="{R["wall"]}"/>{logs}'
            f'<rect width="{W}" height="16" fill="{R["beam"]}" filter="url(#{f})"/>'
            f'<rect y="244" width="{W}" height="56" fill="{R["floor"]}"/>{planks}<rect y="239" width="{W}" height="6" fill="{R["beam"]}"/>')


def fireplace(R, P, night, f, i):
    rows = ''.join(f'<path d="M40 {y}H230" stroke="{R["hl"]}" stroke-width="1.2" opacity=".55"/>' for y in range(34, 240, 18))
    joints = ''.join(f'<path d="M{x + (14 if (y // 18) % 2 else 0)} {y}v18" stroke="{R["hl"]}" stroke-width="1.2" opacity=".55"/>' for y in range(16, 222, 18) for x in range(62, 226, 30))
    breast = f'<g filter="url(#{f})"><rect x="40" y="16" width="190" height="228" fill="{R["stone"]}"/>{rows}{joints}</g>'
    opening = f'<path fill="{R["hearth"]}" d="M84 244V184Q135 146 186 184V244Z"/>'
    hearth = f'<rect x="58" y="238" width="154" height="10" rx="2" fill="{R["hl"]}" filter="url(#{f})"/>'
    mantel = (f'<g filter="url(#{f})"><rect x="28" y="130" width="214" height="11" rx="2" fill="{R["log"]}"/>'
              f'<path fill="{R["log"]}" d="M44 141h12l-4 12h-4zM214 141h12l-4 12h-4z"/></g>'
              f'<path d="M30 131.5H240" stroke="{R["trim"]}" stroke-opacity=".35"/>')
    if night:
        glow, camp = grove.fire(P, night, f, 135, 236, i)
    else:
        log = lambda ang, c, end: f'<g transform="translate(135 234) rotate({ang})"><rect x="-26" y="-4.5" width="52" height="9" rx="4.5" fill="{c}"/><ellipse cx="{end}" cy="0" rx="3" ry="4.5" fill="#d9b48a"/></g>'
        glow, camp = '', f'<g filter="url(#{f})">{log(-10, "#6b4630", 24)}{log(10, "#7c5236", -24)}</g>'
    return glow, breast + opening + camp + hearth + mantel


def sign(R, f, cx=135, y=30):
    w, h = 150, 58
    threads = ''.join(f'<line x1="{x}" y1="16" x2="{x}" y2="{y + 6}" stroke="{R["beam"]}" stroke-width="1.4"/>' for x in (cx - 50, cx + 50))
    grain = ''.join(f'<path d="M{cx - w / 2 + 8} {y + k}h{w - 16}" stroke="{R["log"]}" stroke-opacity=".25"/>' for k in (14, 30, 46))
    return (f'{threads}<g filter="url(#{f})" transform="rotate(-1.5 {cx} {y + h / 2})"><rect x="{cx - w / 2}" y="{y}" width="{w}" height="{h}" rx="5" fill="{R["sign"]}"/>{grain}'
            f'{outline("bytes", cx, y + 34, 34, "Bold", "middle", R["ink"])}{outline("the apps", cx, y + 50, 12, "Regular", "middle", R["ink"])}</g>'
            + ''.join(f'<circle cx="{x}" cy="{y + 6}" r="2" fill="{R["beam"]}"/>' for x in (cx - 50, cx + 50)))


def window(R, P, night, f, i, x=570, y=50, w=160, h=136):
    top, bottom = R['out']
    clip = f'win{i}'
    sky = f'<linearGradient id="out{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bottom}"/></linearGradient><clipPath id="{clip}"><rect x="{x}" y="{y}" width="{w}" height="{h}"/></clipPath>'
    trees = ''.join(grove.pine(tx, y + h + 4, th, R['pine'], R['pineS'], f, 3) for tx, th in ((x + 14, 70), (x + 44, 52), (x + 118, 64), (x + 148, 80)))
    if night:
        above = (f'<circle cx="{x + 62}" cy="{y + 36}" r="17" fill="#ece6cf"/><circle cx="{x + 56}" cy="{y + 32}" r="3.5" fill="#d6cfb5"/><circle cx="{x + 69}" cy="{y + 42}" r="2.5" fill="#d6cfb5"/>'
                 + ''.join(f'<circle cx="{x + sx}" cy="{y + sy}" r="{r}" fill="#f4efdc"/>' for sx, sy, r in ((20, 20, 1.2), (110, 16, 1.4), (140, 40, 1), (96, 52, .9), (30, 60, 1)))
                 + grove.fireflies(i, [(x + 40, y + 104), (x + 96, y + 92), (x + 132, y + 112)]))
    else:
        above = f'<circle cx="{x + 62}" cy="{y + 36}" r="15" fill="#f6b862"/><circle cx="{x + 57}" cy="{y + 31}" r="6" fill="#fbd49a" opacity=".75"/>' + grove.clouds(dict(sky2='#f7fbfd'), f, [(x + 96, y + 30)])
    view = (f'<g clip-path="url(#{clip})"><rect x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#out{i})"/>{above}'
            f'<path fill="{R["hill"]}" d="M{x} {y + h - 30}Q{x + w / 2} {y + h - 56} {x + w} {y + h - 34}V{y + h}H{x}Z"/>{trees}</g>')
    frame = (f'<g filter="url(#{f})"><path fill="none" stroke="{R["trim"]}" stroke-width="8" d="M{x - 2} {y - 2}h{w + 4}v{h + 4}h{-w - 4}z"/>'
             f'<path d="M{x + w / 2} {y}v{h}M{x} {y + h / 2}h{w}" stroke="{R["trim"]}" stroke-width="4"/>'
             f'<rect x="{x - 14}" y="{y + h + 2}" width="{w + 28}" height="9" rx="2" fill="{R["log"]}"/></g>')
    curtains = (f'<g filter="url(#{f})"><path fill="{R["curtain"]}" d="M{x - 26} {y - 12}h26q-4 50 6 84q-12 40-6 64h-20q-10-70-6-148z"/>'
                f'<path fill="{R["curtain"]}" d="M{x + w + 26} {y - 12}h-26q4 50-6 84q12 40 6 64h20q10-70 6-148z"/>'
                f'<path d="M{x - 18} {y}q-2 60 4 130M{x + w + 18} {y}q2 60-4 130" stroke="{R["curtain2"]}" stroke-width="2" fill="none"/></g>'
                f'<rect x="{x - 34}" y="{y - 16}" width="{w + 68}" height="5" rx="2.5" fill="{R["beam"]}"/>')
    return sky, view + frame + curtains


def rug(R, cx=360, cy=272):
    fringe = ''.join(f'<path d="M{cx + 132 * s} {cy - 6 + k * 3}h{8 * s}" stroke="{R["rug2"]}" stroke-width="1.4"/>' for s in (1, -1) for k in range(5))
    return (f'{fringe}<ellipse cx="{cx}" cy="{cy}" rx="132" ry="17" fill="{R["rug"]}"/>'
            f'<ellipse cx="{cx}" cy="{cy}" rx="112" ry="12" fill="none" stroke="{R["rug2"]}" stroke-width="2" stroke-dasharray="6 4"/>'
            f'<ellipse cx="{cx}" cy="{cy}" rx="70" ry="6.5" fill="none" stroke="{R["rug2"]}" stroke-width="1.4" opacity=".7"/>')


def logpile(R, f, x=258, base=244):
    ends = ''.join(f'<circle cx="{x + dx}" cy="{base - dy}" r="8" fill="#d9b48a" stroke="{R["log"]}" stroke-width="2"/><circle cx="{x + dx}" cy="{base - dy}" r="3" fill="none" stroke="#a87b52"/>'
                   for dx, dy in ((-16, 8), (0, 8), (16, 8), (-8, 22), (8, 22), (0, 36)))
    return f'<g filter="url(#{f})">{ends}</g>'


def clock(R, f, cx=470, cy=78):
    return (f'<g filter="url(#{f})"><circle cx="{cx}" cy="{cy}" r="19" fill="{R["log"]}"/><circle cx="{cx}" cy="{cy}" r="15" fill="{R["trim"]}"/></g>'
            + ''.join(f'<circle cx="{cx + 12 * dx}" cy="{cy + 12 * dy}" r="1.3" fill="{R["ink"]}"/>' for dx, dy in ((0, -1), (1, 0), (0, 1), (-1, 0)))
            + f'<path d="M{cx} {cy}v-10M{cx} {cy}l7 4" stroke="{R["ink"]}" stroke-width="2" stroke-linecap="round"/><circle cx="{cx}" cy="{cy}" r="1.8" fill="{R["ink"]}"/>')


def teatable(R, night, f, x=500, top=212):
    steam = f'<path d="M{x - 12} {top - 26}c-5-7 5-11 0-18s5-9 1-15" stroke="{"#fffaf0" if not night else "#cfd6f0"}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="{.6 if not night else .3}"/>'
    return (f'{steam}<g filter="url(#{f})"><rect x="{x - 34}" y="{top}" width="68" height="6" rx="2" fill="{R["log"]}"/>'
            f'<path d="M{x - 28} {top + 6}l-3 {244 - top - 4}M{x + 28} {top + 6}l3 {244 - top - 4}" stroke="{R["log"]}" stroke-width="4" stroke-linecap="round"/>'
            f'<ellipse cx="{x - 12}" cy="{top - 10}" rx="14" ry="11" fill="{R["pot"]}"/><path fill="{R["pot"]}" d="M{x + 1} {top - 12}q10-2 12-12l3 1q-2 14-14 16z"/>'
            f'<path d="M{x - 26} {top - 16}q-9 6 0 12" stroke="{R["pot"]}" stroke-width="3" fill="none"/><ellipse cx="{x - 12}" cy="{top - 20}" rx="7" ry="2.4" fill="{R["curtain2"]}"/><circle cx="{x - 12}" cy="{top - 23}" r="2" fill="{R["curtain2"]}"/>'
            f'<rect x="{x + 16}" y="{top - 14}" width="11" height="14" rx="2" fill="{R["trim"]}"/><path d="M{x + 27} {top - 11}q6 3 0 8" stroke="{R["trim"]}" stroke-width="2" fill="none"/></g>'
            f'<path d="M{x - 20} {top - 14}q2-4 6-5" stroke="#fff" stroke-opacity=".45" stroke-width="2" fill="none" stroke-linecap="round"/>')


def potted_mushroom(R, night, f, x=60, base=130):
    return (f'<g filter="url(#{f})"><path fill="#b5623a" d="M{x - 11} {base - 14}h22l-3 14h-16z"/><rect x="{x - 12}" y="{base - 16}" width="24" height="4" rx="1.5" fill="#c9774a"/></g>'
            + grove.porcini(x, base - 15, 1, night, f))


PIXEL = dict(f=('011', '100', '110', '100', '100'), r=('000', '101', '110', '100', '100'), a=('000', '011', '101', '101', '011'),
             m=('00000', '11010', '10101', '10101', '10101'), e=('000', '010', '101', '110', '011'))


def poster(R, f, x=298, y=46, w=86, h=58):
    px, cx, cells = 3, x + 12, ''
    for ch in 'frame':
        rows = PIXEL[ch]
        cells += ''.join(f'<rect x="{cx + c * px}" y="{y + 20 + r * px}" width="{px}" height="{px}" fill="#fabd2f"/>' for r, row in enumerate(rows) for c, v in enumerate(row) if v == '1')
        cx += (len(rows[0]) + 1) * px
    return (f'<line x1="{x + w / 2}" y1="16" x2="{x + w / 2}" y2="{y}" stroke="{R["beam"]}" stroke-width="1.2"/>'
            f'<g filter="url(#{f})"><rect x="{x - 5}" y="{y - 5}" width="{w + 10}" height="{h + 10}" rx="2" fill="{R["log"]}"/><rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#1d2021"/></g>'
            f'{cells}<rect x="{x + 12}" y="{y + 40}" width="{w - 24}" height="3" fill="#8ec07c"/><rect x="{x + 12}" y="{y + 46}" width="{(w - 24) * .6:.0f}" height="3" fill="#83a598"/>')


def take_fire(night, i):
    k = 'night' if night else 'day'
    R, P, f = ROOM[k], palette(night), f'ps{i}'
    p = f'{i}t-'
    fire_glow, hearth = fireplace(R, P, night, f, i)
    win_defs, win = window(R, P, night, f, i)
    lamp = f'<g transform="translate(147 64) scale(.45)">{tour.djinni(p, "dark" if night else "light")}</g>'
    jar = f'<g transform="translate(655 111) scale(.5)">{tour.jar(p, "dark" if night else "light")}</g>'
    jar_glow = f'<ellipse cx="715" cy="165" rx="120" ry="90" fill="url(#glow{i})" opacity=".75"/>' if night else ''
    hearth_glow = (f'<ellipse cx="135" cy="215" rx="200" ry="120" fill="url(#glow{i})" opacity=".9"/>'
                   f'<ellipse cx="170" cy="262" rx="230" ry="40" fill="url(#glow{i})"/>') if night else ''
    sun = ('' if night else f'<path fill="#fff3d0" opacity=".28" d="M566 194H734L690 300H440Z"/>')
    moon = (f'<path fill="#9fb4e8" opacity=".08" d="M566 194H734L690 300H440Z"/>' if night else '')
    rex = f'{grove.shadow(372, 268, 80, night)}<g transform="translate(290 161) scale(.72)">{grove.rex(P, i, 116, 0, detail=True)}</g>'
    body = (f'{grove.defs(i, night, P, grove.comet_defs(i) + win_defs)}{tour.defs(p, "dark" if night else "light")}'
            f'{room(R, f)}{win}{sun}{moon}{hearth}{fire_glow}{hearth_glow}{jar_glow}{sign(R, f)}{lamp}{potted_mushroom(R, night, f)}{poster(R, f)}'
            f'{clock(R, f)}{logpile(R, f)}{rug(R)}{teatable(R, night, f)}{rex}{jar}'
            f'<rect width="{W}" height="{H}" filter="url(#gr{i})"/>')
    aria = ('bytes — the apps, inside the cabin by the fire: a stone fireplace with a wooden bytes sign and a brass djinni lamp on the mantel, '
            'the paper t-rex on a rug facing the fire, a teapot on a side table, the firefly jar on the windowsill, '
            + ('night: the fire and the jar are the only lights, the moon and fireflies outside' if night else 'day: sunlight pours in through the window'))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{aria}"><clipPath id="c{i}"><rect width="{W}" height="{H}" rx="16"/></clipPath><g clip-path="url(#c{i})">{body}</g></svg>\n'


SHELF_JARS = [('#d4a543', '#6e4f18'), ('#8ec07c', '#4f6b3e'), ('#83a598', '#34457a'), ('#efe2c4', '#8a6a3a'), ('#fe8019', '#9c4430')]


def shelf_jar(x, base, fill, tag, night):
    glass = '#cfe6ee' if not night else '#8fa6b8'
    return (f'<rect x="{x - 11}" y="{base - 28}" width="22" height="28" rx="4" fill="{glass}" fill-opacity=".35" stroke="#7fb4d6" stroke-opacity=".7"/>'
            f'<rect x="{x - 9}" y="{base - 17}" width="18" height="15" rx="3" fill="{fill}" opacity=".85"/>'
            f'<rect x="{x - 12}" y="{base - 33}" width="24" height="6" rx="1.5" fill="#c9973a"/><path d="M{x - 7} {base - 26}v9" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>'
            f'<rect x="{x - 6}" y="{base - 12}" width="12" height="7" rx="1" fill="#efe2c4"/><path d="M{x - 3.5} {base - 8.5}h7" stroke="{tag}" stroke-width="1.2"/>')


def shelves(R, night, f, x0=160, x1=380):
    boards = ''.join(f'<rect x="{x0}" y="{y}" width="{x1 - x0}" height="7" rx="1.5" fill="{R["log"]}"/><path fill="{R["log"]}" d="M{x0 + 14} {y + 7}h8l-4 10zM{x1 - 22} {y + 7}h8l-4 10z"/>' for y in (76, 136))
    jars = ''.join(shelf_jar(x0 + 32 + k * 40, 76, fill, tag, night) for k, (fill, tag) in enumerate(SHELF_JARS))
    books = ''.join(f'<rect x="{x0 + 20 + k * 11}" y="{136 - h}" width="10" height="{h}" rx="1" fill="{c}"/>' for k, (h, c) in enumerate(((30, '#9c4430'), (26, '#5d7a4c'), (32, '#34457a'), (24, '#b57614'))))
    plant = (f'<path fill="#b5623a" d="M{x1 - 50} {136 - 14}h20l-3 14h-14z"/>'
             + ''.join(f'<path d="M{x1 - 40} {122}q{dx} -14 {dx * 1.6:.0f} -22" stroke="{R["curtain"]}" stroke-width="3" fill="none" stroke-linecap="round"/>' for dx in (-8, -2, 5, 10)))
    return f'<g filter="url(#{f})">{boards}{books}{plant}</g>{jars}' + grove.chanterelle(x0 + 100, 136, 1.1, night, f) + grove.porcini(x0 + 130, 136, .9, night, f)


def stove(R, night, f, x=86, base=244):
    iron, iron2 = ('#3c3836', '#504945') if not night else ('#23201e', '#34302c')
    steam = f'<path d="M{x + 16} {base - 104}c-6-8 6-12 0-20s6-10 1-17" stroke="{"#fffaf0" if not night else "#cfd6f0"}" stroke-width="3" fill="none" stroke-linecap="round" opacity="{.6 if not night else .3}"/>'
    return (f'<rect x="{x - 7}" y="16" width="14" height="{base - 78}" fill="{iron2}"/><rect x="{x - 9}" y="{base - 90}" width="18" height="6" fill="{iron}"/>'
            f'<g filter="url(#{f})"><rect x="{x - 36}" y="{base - 62}" width="72" height="50" rx="4" fill="{iron}"/><rect x="{x - 40}" y="{base - 66}" width="80" height="7" rx="2" fill="{iron2}"/>'
            f'<rect x="{x - 18}" y="{base - 50}" width="36" height="24" rx="3" fill="{iron2}"/>'
            + ''.join(f'<path d="M{x - 12 + k * 6} {base - 46}v16" stroke="{iron}" stroke-width="2"/>' for k in range(5))
            + f'<path d="M{x - 30} {base - 12}v12M{x + 30} {base - 12}v12" stroke="{iron}" stroke-width="5" stroke-linecap="round"/></g>'
            f'{steam}<g filter="url(#{f})"><ellipse cx="{x}" cy="{base - 78}" rx="20" ry="13" fill="#b87333"/><path fill="#b87333" d="M{x + 14} {base - 82}q12-4 16-16l3 2q-4 16-17 20z"/>'
            f'<path d="M{x - 12} {base - 90}q12-16 24 0" stroke="{iron}" stroke-width="3" fill="none"/><ellipse cx="{x}" cy="{base - 90}" rx="8" ry="2.4" fill="#8a5424"/></g>'
            f'<path d="M{x - 13} {base - 84}q3-5 8-6" stroke="#fff" stroke-opacity=".45" stroke-width="2" fill="none" stroke-linecap="round"/>')


def mac(R, night, f, i, x=410, base=206):
    body, shade = ('#e8dcc0', '#cdbf9f') if not night else ('#9a917e', '#7d7565')
    screen = '#243024' if not night else '#141a14'
    rows = ''.join(f'<rect x="{x - 15}" y="{base - 62 + k * 6}" width="{w}" height="2.4" fill="{c}"/>' for k, (w, c) in enumerate(((14, '#d3869b'), (20, '#8ec07c'), (12, '#83a598'), (17, '#fabd2f'))))
    glow = f'<ellipse cx="{x}" cy="{base - 50}" rx="90" ry="70" fill="url(#scr{i})"/>' if night else ''
    return (f'{glow}<g filter="url(#{f})"><path fill="{shade}" d="M{x - 26} {base}l4-8h44l4 8z"/><rect x="{x - 30}" y="{base - 80}" width="60" height="72" rx="6" fill="{body}"/>'
            f'<rect x="{x - 23}" y="{base - 73}" width="46" height="36" rx="4" fill="{shade}"/></g><rect x="{x - 20}" y="{base - 70}" width="40" height="30" rx="3" fill="{screen}"/>{rows}'
            f'<rect x="{x + 4}" y="{base - 44}" width="4" height="2.4" fill="#fabd2f"/><path d="M{x + 2} {base - 24}h18" stroke="{shade}" stroke-width="2.4" stroke-linecap="round"/>'
            f'<g filter="url(#{f})"><path fill="{body}" d="M{x - 34} {base + 4}h62l4 6h-70z"/></g>'
            + ''.join(f'<path d="M{x - 30 + k * 7} {base + 7}h4" stroke="{shade}" stroke-width="1.6"/>' for k in range(9)))


def desk(R, f, x0=250, x1=560, top=206):
    return (f'<g filter="url(#{f})"><rect x="{x0}" y="{top}" width="{x1 - x0}" height="9" rx="2" fill="{R["log"]}"/>'
            f'<rect x="{x0 + 6}" y="{top + 9}" width="{x1 - x0 - 12}" height="{244 - top - 13}" fill="{R["log"]}"/>'
            + ''.join(f'<path d="M{x0 + 18 + k * 94} {top + 22}h70" stroke="{R["trim"]}" stroke-opacity=".45" stroke-width="2"/><circle cx="{x0 + 53 + k * 94}" cy="{top + 30}" r="2" fill="{R["trim"]}" fill-opacity=".6"/>' for k in range(3))
            + f'<path d="M{x0 + 6} {top + 9}V240M{x1 - 6} {top + 9}V240" stroke="{R["beam"]}" stroke-width="3"/></g>'
            f'<path d="M{x0 + 2} {top + 1.5}H{x1 - 2}" stroke="{R["trim"]}" stroke-opacity=".3"/>')


def take_bench(night, i):
    k = 'night' if night else 'day'
    R, P, f = ROOM[k], palette(night), f'ps{i}'
    p = f'{i}t-'
    scr = f'<radialGradient id="scr{i}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#b8e0a8" stop-opacity=".45"/><stop offset="1" stop-color="#b8e0a8" stop-opacity="0"/></radialGradient>'
    win_defs, win = window(R, P, night, f, i, x=620)
    lamp_jar = f'<g transform="translate(262 128) scale(.5)">{tour.jar(p, "dark" if night else "light")}</g>'
    jar_glow = f'<ellipse cx="322" cy="176" rx="130" ry="90" fill="url(#glow{i})"/>' if night else ''
    light = (f'<path fill="#fff3d0" opacity=".28" d="M616 194H764L600 300H400Z"/><path fill="#fff3d0" opacity=".22" d="M420 206H600L588 215H410Z"/>' if not night
             else f'<path fill="#9fb4e8" opacity=".08" d="M616 194H764L600 300H400Z"/>')
    mug = f'<g filter="url(#{f})"><rect x="468" y="192" width="13" height="14" rx="2" fill="{R["pot"]}"/><path d="M481 195q6 3 0 8" stroke="{R["pot"]}" stroke-width="2" fill="none"/></g>'
    rex = f'<g transform="translate(462 150) scale(.62)">{grove.rex(P, i, 116, 0, detail=True)}</g>'
    body = (f'{grove.defs(i, night, P, grove.comet_defs(i) + win_defs + scr)}{tour.defs(p, "dark" if night else "light")}'
            f'{room(R, f)}{win}{light}{jar_glow}{stove(R, night, f)}{shelves(R, night, f)}{sign(R, f, cx=535, y=34)}'
            f'{rex}{desk(R, f)}{mac(R, night, f, i)}{mug}{lamp_jar}'
            f'<rect width="{W}" height="{H}" filter="url(#gr{i})"/>')
    aria = ('bytes — the apps, the workbench: the paper t-rex at a wooden desk with a paper mac, the firefly jar as the desk lamp, '
            'shelves of small jars and books behind, a kettle on an iron stove, the bytes sign on the wall, '
            + ('night: the screen and the jar are the only lights' if night else 'day: window light across the desk'))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{aria}"><clipPath id="c{i}"><rect width="{W}" height="{H}" rx="16"/></clipPath><g clip-path="url(#c{i})">{body}</g></svg>\n'


TAKES = {1: take_fire, 2: take_bench}

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for n, draw in TAKES.items():
        for mode, night in (('day', False), ('night', True)):
            path = OUT / f'take-{n}-{mode}.svg'
            path.write_text(draw(night, f'{n}{mode[0]}'))
            print(f'{path.name} {path.stat().st_size / 1024:.1f} KB')
