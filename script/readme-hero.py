"""the readme hero: inside the profile's cabin. by day the rex reads in the armchair, at night it sleeps by the fire.
`python3 script/readme-hero.py` redraws assets/hero-{light,dark}.svg. the crew and the lettering come from frame's
profile kit (~/frame/brand/profile), so this runs on dima's mac only."""

import pathlib, sys

sys.path.insert(0, str(pathlib.Path.home() / 'frame/brand/profile'))
import hero as grove  # noqa: E402
import tour  # noqa: E402
from lettering import outline  # noqa: E402

OUT = pathlib.Path(__file__).resolve().parent.parent / 'assets'
W, H = 800, 300

# the props' own ground (stump under the jar, stone under the lamp) stays outdoors
tour.stump = lambda k: ''
tour.stone = lambda k: ''

ROOM = dict(
    day=dict(wall='#c98f5e', log='#a86d42', beam='#6b4a33', floor='#8f5a33', plank='#6e4226', stone='#b9ab98', hl='#d8cbb6', hearth='#3a2a22',
             rug='#b5483a', rug2='#e0b060', trim='#efe2c4', sign='#d9b48a', ink='#4a3b2c', curtain='#5d7a4c', curtain2='#4f6b3e', pot='#5d7a4c',
             out=('#8fc3e6', '#e2eff3'), hill='#a8c4b8', pine='#7d9463', pineS='#4f6b3e'),
    night=dict(wall='#4d3830', log='#382721', beam='#2a1d19', floor='#3b261c', plank='#261810', stone='#6a6672', hl='#8a8794', hearth='#150e0c',
               rug='#7a2e2a', rug2='#a08040', trim='#8f8778', sign='#8a6a50', ink='#1f1612', curtain='#264038', curtain2='#1a302b', pot='#3a5044',
               out=('#141b31', '#243052'), hill='#2c3760', pine='#2b4a44', pineS='#16302b'),
)


def palette(night):
    return dict(grove.NIGHT, rexHi='#8e4a43') if night else dict(grove.DAY, rexHi='#d77552')


def room(R, f, i=''):
    grain = lambda fid, fx, fy, seed, color: (f'<filter id="{fid}{i}" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="{fx} {fy}" numOctaves="3" seed="{seed}"/>'
                                               f'<feColorMatrix values="0 0 0 0 {color[0]} 0 0 0 0 {color[1]} 0 0 0 0 {color[2]} 2.6 0 0 0 -1.15"/></filter>')
    defs = (f'<defs>{grain("woodH", .006, .3, 3, (.16, .09, .04))}<filter id="mottle{i}" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 .1 0 0 0 0 .05 0 0 0 0 .02 2 0 0 0 -.8"/></filter>'
            f'<linearGradient id="logbar{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".22" stop-color="#fff" stop-opacity="0"/>'
            f'<stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>'
            f'<linearGradient id="ao{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>')
    bands = ''.join(f'<rect y="{y}" width="{W}" height="22" fill="url(#logbar{i})"/><path d="M0 {y + 21.5}H800" stroke="{R["trim"]}" stroke-opacity=".18" stroke-width="1.4"/>' for y in range(16, 240, 22))
    knots = ''.join(f'<ellipse cx="{x}" cy="{y}" rx="5" ry="2.2" fill="none" stroke="{R["log"]}" stroke-width="1.4" opacity=".7"/><ellipse cx="{x}" cy="{y}" rx="1.8" ry=".9" fill="{R["log"]}"/>'
                    for x, y in ((262, 49), (452, 115), (700, 225), (520, 181), (300, 225)))
    edges = [x for x in range(-40, 860, 50)]
    tint = ((1, .05), (0, .08), (1, .02), (0, .03), (1, .07), (0, .05))
    boards = ''.join(f'<path d="M{a} 244L{b} 244L{b + (b - 400) * .3:.0f} 300L{a + (a - 400) * .3:.0f} 300Z" fill="{"#fff" if tint[(n * 5) % 6][0] else "#000"}" fill-opacity="{tint[(n * 5) % 6][1]}"/>'
                     for n, (a, b) in enumerate(zip(edges, edges[1:])))
    fknots = ''.join(f'<ellipse cx="{x}" cy="{y}" rx="1.6" ry="3" fill="{R["plank"]}" opacity=".7"/>' for x, y in ((118, 262), (362, 286), (612, 256), (744, 280), (236, 290)))
    lines = ''.join(f'<path d="M{x} 244L{x + (x - 400) * .3:.0f} 300" stroke="{R["plank"]}" stroke-width="1.6"/>' for x in edges)
    seams = ''.join(f'<path d="M{a + (a - 400) * t * .3 + 2:.0f} {244 + 56 * t:.0f}L{b + (b - 400) * t * .3 - 2:.0f} {244 + 56 * t:.0f}" stroke="{R["plank"]}" stroke-width="1.4"/>'
                    + ''.join(f'<circle cx="{a + (a - 400) * t * .3 + (b - a) * u:.1f}" cy="{244 + 56 * t + 3:.1f}" r=".9" fill="{R["plank"]}"/>' for u in (.25, .75))
                    for n, (a, b) in enumerate(zip(edges, edges[1:])) for t in ((.35,) if n % 2 else (.7,)))
    return (f'{defs}<rect width="{W}" height="244" fill="{R["wall"]}"/><rect y="16" width="{W}" height="224" filter="url(#woodH{i})" opacity=".55"/>{bands}'
            + ''.join(f'<path d="M0 {y}H800" stroke="{R["log"]}" stroke-width="2"/>' for y in range(38, 240, 22)) + knots
            + f'<rect width="{W}" height="16" fill="{R["beam"]}" filter="url(#{f})"/>'
            f'<rect y="244" width="{W}" height="56" fill="{R["floor"]}"/>{boards}<rect y="244" width="{W}" height="56" filter="url(#mottle{i})" opacity=".5"/>{lines}{seams}{fknots}'
            f'<rect y="244" width="{W}" height="26" fill="url(#ao{i})"/>'
            f'<rect y="235" width="{W}" height="10" fill="{R["beam"]}"/><path d="M0 235.8H800" stroke="{R["trim"]}" stroke-opacity=".28" stroke-width="1.4"/>')


BRICKS = dict(day=('#8f8474', '#b9ab98', '#c4b5a0', '#a99a86', '#b3a28c', '#cbbfae', '#a4927c'),
              night=('#403d46', '#6a6672', '#726e79', '#625f6b', '#6d6975', '#78747f', '#5d5a66'))


def fireplace(R, P, night, f, i):
    mortar, *tones = BRICKS['night' if night else 'day']
    x0, x1, top, base = 40, 230, 16, 236
    bricks = ''
    for r, y in enumerate(range(top, base, 14)):
        off = 0 if r % 2 else -15
        for c, x in enumerate(range(x0 + off, x1, 30)):
            bx, bw = max(x, x0) + 1, min(x + 30, x1) - max(x, x0) - 2
            if bw < 4:
                continue
            tone = tones[(r * 7 + c * 13 + r * c) % len(tones)]
            bricks += (f'<rect x="{bx}" y="{y + 1}" width="{bw}" height="12" rx="1.6" fill="{tone}"/>'
                       f'<path d="M{bx + 1.5} {y + 2.2}h{bw - 3}" stroke="#fff" stroke-opacity=".22"/><path d="M{bx + 1.5} {y + 12.4}h{bw - 3}" stroke="#000" stroke-opacity=".18"/>')
    breast = f'<g filter="url(#{f})"><rect x="{x0}" y="{top}" width="{x1 - x0}" height="{base - top}" fill="{mortar}"/>{bricks}</g>'
    soot = (f'<radialGradient id="soot{i}" cx=".5" cy=".6" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>'
            f'<ellipse cx="135" cy="150" rx="48" ry="26" fill="url(#soot{i})"/>')
    arch = (f'<path d="M78 238V184Q135 138 192 184V238" fill="none" stroke="{mortar}" stroke-width="13"/>'
            f'<path d="M78 238V184Q135 138 192 184V238" fill="none" stroke="{tones[3]}" stroke-width="11" stroke-dasharray="11 2.2"/>'
            f'<path fill="{tones[4]}" stroke="{mortar}" d="M128 153h14l-2 12h-10z"/>')
    inner = ''.join(f'<path d="M88 {y}H182" stroke="#000" stroke-opacity=".3"/>' for y in range(192, 236, 9))
    opening = f'<path fill="{R["hearth"]}" d="M84 238V184Q135 146 186 184V238Z"/>{inner}'
    hearth = (f'<g filter="url(#{f})"><rect x="52" y="234" width="166" height="12" rx="2" fill="{tones[4]}"/>'
              + ''.join(f'<path d="M{x} 235v10" stroke="{mortar}" stroke-width="1.4"/>' for x in (92, 135, 178)) + '</g>'
              '<path d="M54 235.5H216" stroke="#fff" stroke-opacity=".3"/>')
    wood = R['log']
    mantel = (f'<g filter="url(#{f})"><rect x="26" y="124" width="218" height="9" rx="2" fill="{wood}"/><rect x="34" y="133" width="202" height="7" fill="{R["beam"]}"/>'
              f'<path fill="{wood}" d="M44 140h14v3q0 11-8 16h-2q-4-8-4-19zM212 140h14q0 11-4 19h-2q-8-5-8-16z"/></g>'
              f'<path d="M28 125.3H242" stroke="{R["trim"]}" stroke-opacity=".4"/>'
              + ''.join(f'<path d="M{a} {y}q30 -1.5 60 0" stroke="#000" stroke-opacity=".16" fill="none"/>' for a, y in ((40, 128), (120, 130), (170, 127.5))))
    if night:
        camp = grove.fire(P, night, f, 135, 232, i)[1]
    else:
        log = lambda ang, c, end: f'<g transform="translate(135 230) rotate({ang})"><rect x="-26" y="-4.5" width="52" height="9" rx="4.5" fill="{c}"/><ellipse cx="{end}" cy="0" rx="3" ry="4.5" fill="#d9b48a"/></g>'
        camp = f'<g filter="url(#{f})">{log(-10, "#6b4630", 24)}{log(10, "#7c5236", -24)}</g>'
    return breast + soot + arch + opening + camp + hearth + mantel


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
    tower = f'<g transform="translate({x + 42} {y + h - 36}) scale(.7)">{grove.wizard_tower(0, 0, night, i)}</g>'
    if night:
        above = (f'<circle cx="{x + 118}" cy="{y + 40}" r="16" fill="#ece6cf"/><circle cx="{x + 112}" cy="{y + 36}" r="3.5" fill="#d6cfb5"/><circle cx="{x + 125}" cy="{y + 46}" r="2.5" fill="#d6cfb5"/>'
                 + ''.join(f'<circle cx="{x + sx}" cy="{y + sy}" r="{r}" fill="#f4efdc"/>' for sx, sy, r in ((20, 20, 1.2), (74, 12, 1.4), (150, 70, 1), (96, 52, .9), (62, 60, 1)))
                 + ''.join(f'<line x1="{x + sx}" y1="{y}" x2="{x + sx}" y2="{y + sy - r * .8:.1f}" stroke="{P["thr"]}" stroke-width="1" opacity=".7"/>{grove.star5(x + sx, y + sy, r, "#f2c14e", f)}'
                           for sx, sy, r in ((30, 30, 5), (88, 20, 4), (146, 22, 4.5)))
                 + tower + grove.fireflies(i, [(x + 70, y + 104), (x + 96, y + 92), (x + 132, y + 112)]))
    else:
        above = (f'<g transform="translate({x + 116} {y + 42}) scale(.42)">{grove.sunburst(0, 0, P, f)}</g>'
                 + grove.clouds(dict(sky2='#f7fbfd'), f, [(x + 14, y + 22)]) + tower)
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


def rug(R, cx=310, cy=272):
    fringe = ''.join(f'<path d="M{cx + 132 * s} {cy - 6 + k * 3}h{8 * s}" stroke="{R["rug2"]}" stroke-width="1.4"/>' for s in (1, -1) for k in range(5))
    diamonds = ''.join(f'<path d="M{cx + dx} {cy - 5}l7 5-7 5-7-5z" fill="{R["rug2"] if n % 2 else R["trim"]}" opacity=".8"/>' for n, dx in enumerate(range(-84, 90, 21)))
    return (f'{fringe}<ellipse cx="{cx}" cy="{cy}" rx="132" ry="17" fill="{R["rug"]}"/><ellipse cx="{cx}" cy="{cy + 2}" rx="132" ry="15" fill="#000" opacity=".12"/>'
            f'<ellipse cx="{cx}" cy="{cy}" rx="120" ry="14" fill="none" stroke="{R["trim"]}" stroke-width="1.2" opacity=".5"/>'
            f'<ellipse cx="{cx}" cy="{cy}" rx="110" ry="11.5" fill="none" stroke="{R["rug2"]}" stroke-width="2.2" stroke-dasharray="6 4"/>{diamonds}')


def logpile(R, f, x=258, base=244):
    ends = ''.join(f'<circle cx="{x + dx}" cy="{base - dy}" r="8.5" fill="#6b4630"/><circle cx="{x + dx}" cy="{base - dy}" r="6.6" fill="#d9b48a"/>'
                   f'<circle cx="{x + dx}" cy="{base - dy}" r="4.2" fill="none" stroke="#b58a5e" stroke-width=".9"/><circle cx="{x + dx}" cy="{base - dy}" r="1.8" fill="none" stroke="#a87b52"/>'
                   f'<path d="M{x + dx} {base - dy}l4 -3" stroke="#8a6040" stroke-width=".8"/>'
                   for dx, dy in ((-17, 9), (0, 9), (17, 9), (-8.5, 24), (8.5, 24), (0, 39)))
    return f'<g filter="url(#{f})">{ends}</g>'


def clock(R, f, cx=470, cy=78):
    return (f'<g filter="url(#{f})"><circle cx="{cx}" cy="{cy}" r="19" fill="{R["log"]}"/><circle cx="{cx}" cy="{cy}" r="15" fill="{R["trim"]}"/></g>'
            + ''.join(f'<circle cx="{cx + 12 * dx}" cy="{cy + 12 * dy}" r="1.3" fill="{R["ink"]}"/>' for dx, dy in ((0, -1), (1, 0), (0, 1), (-1, 0)))
            + f'<path d="M{cx} {cy}v-10M{cx} {cy}l7 4" stroke="{R["ink"]}" stroke-width="2" stroke-linecap="round"/><circle cx="{cx}" cy="{cy}" r="1.8" fill="{R["ink"]}"/>')


def teatable(R, night, f, x=690, top=222):
    leg = lambda lx, s: f'<path fill="{R["log"]}" d="M{lx - 3} {top + 9}h6l-1 6q3 4 0 8l-1 {236 - top - 23}h-2l-1 {-(236 - top - 23)}q-3-4 0-8z" transform="scale({s} 1)" transform-origin="{lx} 0"/>'
    steam = f'<path d="M{x - 14} {top - 30}c-5-7 5-11 0-18s5-9 1-15" stroke="{"#fffaf0" if not night else "#cfd6f0"}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="{.6 if not night else .3}"/>'
    dots = ''.join(f'<circle cx="{x - 24 + k * 6}" cy="{top - 10}" r="1.3" fill="{R["rug2"]}"/>' for k in range(5))
    return (f'{steam}<g filter="url(#{f})"><rect x="{x - 38}" y="{top}" width="76" height="5" rx="2" fill="{R["log"]}"/><rect x="{x - 35}" y="{top + 5}" width="70" height="4" fill="{R["beam"]}"/>'
            f'{leg(x - 28, 1)}{leg(x + 28, 1)}<rect x="{x - 28}" y="{top + 30}" width="56" height="3" fill="{R["beam"]}"/><rect x="{x - 14}" y="{top + 23}" width="20" height="7" rx="1" fill="#9c4430"/>'
            f'<ellipse cx="{x - 14}" cy="{top - 10}" rx="15" ry="11" fill="{R["pot"]}"/><path fill="{R["pot"]}" d="M{x} {top - 12}q11-2 13-13l3 1q-2 15-15 17z"/>'
            f'<path d="M{x - 29} {top - 16}q-10 6 0 12" stroke="{R["pot"]}" stroke-width="3" fill="none"/><ellipse cx="{x - 14}" cy="{top - 20}" rx="7.5" ry="2.4" fill="{R["curtain2"]}"/><circle cx="{x - 14}" cy="{top - 23.5}" r="2.2" fill="{R["curtain2"]}"/>'
            f'<ellipse cx="{x - 14}" cy="{top + .5}" rx="15" ry="2" fill="#000" opacity=".2"/>'
            f'<rect x="{x + 14}" y="{top - 15}" width="12" height="15" rx="2" fill="{R["trim"]}"/><rect x="{x + 14}" y="{top - 11}" width="12" height="3" fill="#9c4430" opacity=".8"/><path d="M{x + 26} {top - 12}q6 3 0 8" stroke="{R["trim"]}" stroke-width="2" fill="none"/></g>'
            f'{dots}<path d="M{x - 24} {top - 15}q2-4 6-5" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none" stroke-linecap="round"/>')


def potted_mushroom(R, night, f, x=60, base=124):
    return (f'<g filter="url(#{f})"><path fill="#b5623a" d="M{x - 11} {base - 14}h22l-3 14h-16z"/><rect x="{x - 12}" y="{base - 16}" width="24" height="4" rx="1.5" fill="#c9774a"/></g>'
            + grove.porcini(x, base - 15, 1, night, f))


PIXEL = dict(f=('011', '100', '110', '100', '100'), r=('000', '101', '110', '100', '100'), a=('000', '011', '101', '101', '011'),
             m=('00000', '11010', '10101', '10101', '10101'), e=('000', '010', '101', '110', '011'))


def poster(R, f, x=310, y=30, w=86, h=58):
    px, cx, cells = 3, x + 12, ''
    for ch in 'frame':
        rows = PIXEL[ch]
        cells += ''.join(f'<rect x="{cx + c * px}" y="{y + 20 + r * px}" width="{px}" height="{px}" fill="#fabd2f"/>' for r, row in enumerate(rows) for c, v in enumerate(row) if v == '1')
        cx += (len(rows[0]) + 1) * px
    return (f'<line x1="{x + w / 2}" y1="16" x2="{x + w / 2}" y2="{y}" stroke="{R["beam"]}" stroke-width="1.2"/>'
            f'<g filter="url(#{f})"><rect x="{x - 5}" y="{y - 5}" width="{w + 10}" height="{h + 10}" rx="2" fill="{R["log"]}"/><rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#1d2021"/></g>'
            f'{cells}<rect x="{x + 12}" y="{y + 40}" width="{w - 24}" height="3" fill="#8ec07c"/><rect x="{x + 12}" y="{y + 46}" width="{(w - 24) * .6:.0f}" height="3" fill="#83a598"/>')


def jar_shelf(R, night, f, x0=282, x1=424, y=134):
    board = (f'<g filter="url(#{f})"><rect x="{x0}" y="{y}" width="{x1 - x0}" height="7" rx="1.5" fill="{R["log"]}"/>'
             f'<path fill="{R["log"]}" d="M{x0 + 14} {y + 7}h8q0 9-6 13h-2zM{x1 - 22} {y + 7}h8q-2 9-2 13h-2q-4-4-4-13z"/></g>'
             f'<path d="M{x0 + 1} {y + 1.2}H{x1 - 1}" stroke="{R["trim"]}" stroke-opacity=".35"/>')
    return board + ''.join(shelf_jar(x0 + 17 + k * 27, y, fill, tag, night) for k, (fill, tag) in enumerate(SHELF_JARS))


def pool(cx, cy, rx, ry, color='#c8641e', steps=((1, .1), (.74, .14), (.5, .18), (.3, .2))):
    rings = ''.join(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx * k:.1f}" ry="{ry * k:.1f}" fill="{color}" opacity="{o}"/>' for k, o in steps)
    return f'<g style="mix-blend-mode:screen">{rings}</g>'


def armchair(R, night, f, x=514, base=280, sitter=''):
    cloth, cloth2 = ('#3d5a78', '#2f4760') if not night else ('#2c4058', '#223246')
    plaid = ''.join(f'<path d="M{x - 62 + k * 7} {base - 70}v34" stroke="{R["rug2"]}" stroke-width="1.6" opacity=".7"/>' for k in range(4))
    back = (f'<ellipse cx="{x}" cy="{base + 2}" rx="78" ry="6" fill="#000" opacity=".18"/>'
            f'<g filter="url(#{f})"><path fill="{cloth2}" d="M{x - 6} {base - 78}q34-8 64 3q6 34 2 70h-64z"/>'
            f'<path fill="{cloth}" d="M{x - 58} {base - 44}h104q10 0 10 10v22h-122v-22q0-10 8-10z"/>'
            f'<path fill="{cloth}" d="M{x + 50} {base - 70}q14-6 22 4v54h-22z"/></g>'
            f'<path d="M{x - 52} {base - 41}h96" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>')
    left_behind = '' if sitter else (
        f'<g filter="url(#{f})"><rect x="{x - 20}" y="{base - 50}" width="26" height="6" rx="1" fill="#34457a"/><rect x="{x - 18}" y="{base - 49}" width="22" height="2" fill="{R["trim"]}"/></g>'
        f'<circle cx="{x + 18}" cy="{base - 48}" r="4" fill="none" stroke="#2b1e16" stroke-width="1.4"/><circle cx="{x + 28}" cy="{base - 48}" r="4" fill="none" stroke="#2b1e16" stroke-width="1.4"/><path d="M{x + 22} {base - 48}h2" stroke="#2b1e16" stroke-width="1.4"/>')
    front = (f'<g filter="url(#{f})"><path fill="{cloth}" d="M{x - 76} {base - 74}q16-8 26 2v58h-26q-4-30 0-60z"/><ellipse cx="{x - 63}" cy="{base - 74}" rx="13" ry="6" fill="{cloth2}"/>'
             f'<path fill="#9c4430" d="M{x - 68} {base - 76}h26l4 44h-30z"/>{plaid}<path d="M{x - 68} {base - 60}h28M{x - 68} {base - 46}h29" stroke="{R["rug2"]}" stroke-width="1.6" opacity=".7"/></g>'
             f'<path d="M{x - 70} {base - 12}v10M{x + 60} {base - 12}v10" stroke="{R["beam"]}" stroke-width="5" stroke-linecap="round"/>')
    return back + left_behind + sitter + front


def rex_asleep(P, night, f):
    """the rex lying on the rug, head on the left toward the fire, in the profile rex's units"""
    rex, rex2, belly, hi = P['rex'], P['rex2'], P['belly'], P['rexHi']
    spikes = ''.join(f'<path fill="{rex2}" d="M{x} {y}l6-10 6 10z"/>' for x, y in ((46, -54), (70, -66), (96, -73), (122, -75), (148, -71), (172, -63), (194, -50), (212, -34)))
    stripes = ''.join(f'<path d="M{x} {y}q5 8 1 16" stroke="{rex2}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>' for x, y in ((78, -66), (102, -72), (126, -72), (150, -67), (174, -58)))
    dots = ''.join(f'<circle cx="{x}" cy="{y}" r="1.5" fill="{rex2}" opacity=".6"/>' for x, y in ((66, -44), (90, -52), (112, -40), (136, -56), (100, -30), (122, -24)))
    tail_stripes = ''.join(f'<path d="M{x} 6q4 5 0 10" stroke="{rex2}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>' for x in (120, 150, 180, 206))
    return (f'{spikes}'
            f'<path fill="{rex}" filter="url(#{f})" d="M40 -30C50 -62 110 -80 160 -68C202 -58 224 -34 220 -8C218 0 200 2 180 2H60C44 2 34 -12 40 -30Z"/>'
            f'<path fill="{hi}" d="M58 -50C92 -70 140 -78 182 -64C140 -70 98 -64 62 -46Z"/>{stripes}{dots}'
            f'<path fill="{belly}" d="M62 -6C100 -16 160 -16 206 -10C202 0 192 2 180 2H66C62 2 60 -2 62 -6Z"/>'
            f'<path fill="{rex2}" filter="url(#{f})" d="M150 -54C178 -62 202 -44 200 -22C198 -6 182 0 160 0C140 0 128 -12 130 -28C132 -42 140 -50 150 -54Z"/>'
            f'<path d="M144 -44q14-8 30-2" stroke="{hi}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>'
            f'<path fill="{rex}" filter="url(#{f})" d="M212 -32C248 -26 258 4 234 14C202 26 140 26 96 21C80 20 68 16 60 11C80 12 112 13 150 12C200 10 226 4 222 -14Z"/>{tail_stripes}'
            f'<path fill="#f7efdc" d="M128 0l-7-3 1 5zM136 1l-7-3 1 5z"/>'
            f'<path fill="{rex}" filter="url(#{f})" d="M-84 -6C-88 -18 -80 -30 -64 -34L-20 -44C0 -48 20 -46 34 -40L56 -30C62 -20 52 -6 40 -2L-70 2C-78 2 -82 -2 -84 -6Z"/>'
            f'<path fill="{hi}" d="M-64 -30L-20 -40C0 -44 16 -42 28 -38C10 -40 -10 -38 -60 -26Z" opacity=".8"/>'
            f'<path d="M-80 -7Q-40 -12 12 -9" stroke="{rex2}" stroke-width="2" fill="none" stroke-linecap="round"/>'
            + ''.join(f'<path fill="#f7efdc" d="M{x} -9.5l2.5 4 2.5-4.4z"/>' for x in (-70, -58, -46, -34))
            + f'<ellipse cx="-77" cy="-20" rx="2" ry="1.2" fill="#2b1e16"/><path d="M-38 -32q7 5 14 0" stroke="#2b1e16" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
            f'<path d="M-44 -40l18-3" stroke="#2b1e16" stroke-width="2" stroke-linecap="round"/>'
            f'<path fill="{rex2}" filter="url(#{f})" d="M20 -16C28 -12 30 -4 24 0L12 0C14 -6 14 -12 20 -16Z"/><path fill="#f7efdc" d="M12 0l-5-2 1 3zM17 0.5l-5-2 1 3z"/>')


def rex_reading(P, f):
    """the rex sitting back in the armchair, reading with round glasses; seat surface at y 0, facing left"""
    rex, rex2, belly, hi = P['rex'], P['rex2'], P['belly'], P['rexHi']
    ink = '#2b1e16'
    spikes = (''.join(f'<path fill="{rex2}" d="M{x} {y}l9-4-2 10z"/>' for x, y in ((118, -86), (128, -62), (134, -36)))
              + ''.join(f'<path fill="{rex2}" d="M{x} {y}l5-9 5 9z"/>' for x, y in ((34, -154), (48, -151), (60, -140))))
    stripes = ''.join(f'<path d="M{x} {y}q-8 3-14 0" stroke="{rex2}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>' for x, y in ((126, -74), (130, -50), (128, -26)))
    return (f'<path fill="{rex}" filter="url(#{f})" d="M120 -10C160 -20 190 -10 196 20C200 50 192 70 200 84L190 86C180 70 182 44 176 22C170 4 150 0 124 6Z"/>'
            + ''.join(f'<path d="M{x} {y}q6 2 8 8" stroke="{rex2}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>' for x, y in ((150, -10), (178, 6), (188, 40)))
            + f'{spikes}<path fill="{rex}" filter="url(#{f})" d="M40 0C20 -30 20 -70 40 -96C60 -116 100 -112 118 -90C134 -60 136 -24 128 0Z"/>{stripes}'
            f'<path fill="{hi}" d="M100 -104C116 -94 126 -74 130 -52C122 -72 112 -88 96 -100Z" opacity=".8"/>'
            f'<path fill="{belly}" d="M38 -4C26 -34 28 -70 44 -92C42 -60 44 -30 56 -4Z"/>'
            f'<path fill="{rex}" filter="url(#{f})" d="M20 -6C10 -34 60 -44 90 -30C104 -20 100 0 80 4L24 4C18 2 18 -2 20 -6Z"/>'
            f'<path d="M34 -28q20-10 44-4" stroke="{hi}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>'
            f'<path fill="{rex2}" filter="url(#{f})" d="M22 -2L40 0L36 50L52 56V62H16L18 54L24 50Z"/><path fill="#f7efdc" d="M16 62l-6-3 1 5zM24 62l-6-3 1 5z"/>'
            f'<path fill="{rex}" filter="url(#{f})" d="M-44 -120C-48 -132 -40 -144 -24 -148L20 -156C40 -158 56 -150 62 -138L74 -108C66 -96 52 -96 40 -98L-30 -108C-40 -110 -44 -114 -44 -120Z"/>'
            f'<path fill="{rex}" d="M40 -100C50 -96 60 -96 70 -100L60 -80C50 -84 44 -90 40 -100Z"/>'
            f'<path fill="{hi}" d="M-24 -144L20 -152C34 -154 46 -150 54 -144C36 -148 10 -146 -20 -140Z" opacity=".8"/>'
            f'<path d="M-40 -118Q0 -112 36 -104" stroke="{rex2}" stroke-width="2" fill="none" stroke-linecap="round"/>'
            + ''.join(f'<path fill="#f7efdc" d="M{x} {-118 + (x + 40) * .17:.1f}l2.5 4 2.5-4.4z"/>' for x in (-32, -20, -8, 4))
            + f'<ellipse cx="-38" cy="-133" rx="2" ry="1.2" fill="{ink}"/><circle cx="6" cy="-138" r="3" fill="{ink}"/><circle cx="5" cy="-137" r="1" fill="#fff"/>'
            f'<path d="M-2 -147l16-2" stroke="{ink}" stroke-width="2" stroke-linecap="round"/>'
            f'<circle cx="6" cy="-138" r="8" fill="#cfe6ee" fill-opacity=".3" stroke="{ink}" stroke-width="1.8"/><path d="M-2 -138l-10 3M14 -139l30 4" stroke="{ink}" stroke-width="1.6" stroke-linecap="round"/>'
            f'<path d="M1 -142q3-3 7-2" stroke="#fff" stroke-opacity=".8" stroke-width="1.4" fill="none" stroke-linecap="round"/>'
            f'<g filter="url(#{f})"><path fill="#34457a" d="M-30 -62L-4 -56L18 -64L16 -94L-4 -86L-28 -94Z"/>'
            f'<path fill="#f4ecd8" d="M-26 -64L-4 -58L-4 -84L-24 -90Z"/><path fill="#ece2c8" d="M-4 -58L14 -65L12 -91L-4 -84Z"/></g>'
            + ''.join(f'<path d="M-22 {y}l14 3" stroke="#b9a882" stroke-width="1"/>' for y in (-84, -79, -74, -69))
            + ''.join(f'<path d="M0 {y}l10 -3" stroke="#b9a882" stroke-width="1"/>' for y in (-80, -75, -70))
            + f'<path fill="{rex2}" filter="url(#{f})" d="M40 -74C30 -76 18 -74 12 -70L14 -64C22 -66 30 -66 38 -62Z"/><path fill="#f7efdc" d="M12 -70l-4 -1 1 4zM13 -65l-4 -1 1 4z"/>')


def zzz(R, f, x, y):
    return ''.join(outline('z', x + dx, y + dy, size, 'Bold', 'middle', R['trim'], extra=f'filter="url(#{f})" opacity="{o}"') for dx, dy, size, o in ((0, 0, 13, .9), (14, -18, 17, .8), (32, -40, 22, .7)))


def hero(night):
    k = 'night' if night else 'day'
    i = k[0]
    R, P, f = ROOM[k], palette(night), f'ps{i}'
    p = f'{i}t-'
    win_defs, win = window(R, P, night, f, i)
    lamp = f'<g transform="translate(147 58) scale(.45)">{tour.djinni(p, "dark" if night else "light")}</g>'
    jar = f'<g transform="translate(655 111) scale(.5)">{tour.jar(p, "dark" if night else "light")}</g>'
    if night:
        glow = pool(135, 205, 190, 118) + pool(160, 266, 220, 30, steps=((1, .07), (.66, .08), (.36, .1))) + pool(715, 165, 78, 60, '#b88a2a')
        rex, sitter = f'{grove.shadow(316, 276, 110, night)}<g transform="translate(236 276) scale(.72)">{rex_asleep(P, night, f)}</g>{zzz(R, f, 172, 230)}', ''
    else:
        glow, rex = '', ''
        sitter = f'<g transform="translate(468 236) scale(.66)">{rex_reading(P, f)}</g>'
    body = (f'{grove.defs(i, night, P, grove.comet_defs(i) + win_defs)}{tour.defs(p, "dark" if night else "light")}'
            f'{room(R, f, i)}{win}{fireplace(R, P, night, f, i)}{glow}{sign(R, f)}{lamp}{potted_mushroom(R, night, f)}{poster(R, f)}{jar_shelf(R, night, f)}'
            f'{clock(R, f)}{logpile(R, f)}{rug(R)}{teatable(R, night, f)}{rex}{armchair(R, night, f, sitter=sitter)}{jar}'
            f'<rect width="{W}" height="{H}" filter="url(#gr{i})"/>')
    aria = ('bytes — the apps, inside the cabin by the fire: a stone fireplace with a wooden bytes sign and a brass djinni lamp on the mantel, '
            'a shelf of small jars under a pixel frame poster, a teapot by the window, the firefly jar on the windowsill, '
            + ('night: the paper t-rex asleep on the rug by the fire, its book and glasses left on the armchair' if night
               else 'day: the paper t-rex reads a book in the armchair, wearing round glasses'))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{aria}"><clipPath id="c{i}"><rect width="{W}" height="{H}" rx="16"/></clipPath><g clip-path="url(#c{i})">{body}</g></svg>\n'


SHELF_JARS = [('#d4a543', '#6e4f18'), ('#8ec07c', '#4f6b3e'), ('#83a598', '#34457a'), ('#efe2c4', '#8a6a3a'), ('#fe8019', '#9c4430')]


def shelf_jar(x, base, fill, tag, night):
    glass = '#cfe6ee' if not night else '#8fa6b8'
    return (f'<rect x="{x - 11}" y="{base - 28}" width="22" height="28" rx="4" fill="{glass}" fill-opacity=".35" stroke="#7fb4d6" stroke-opacity=".7"/>'
            f'<rect x="{x - 9}" y="{base - 17}" width="18" height="15" rx="3" fill="{fill}" opacity=".85"/>'
            f'<rect x="{x - 12}" y="{base - 33}" width="24" height="6" rx="1.5" fill="#c9973a"/><path d="M{x - 7} {base - 26}v9" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>'
            f'<rect x="{x - 6}" y="{base - 12}" width="12" height="7" rx="1" fill="#efe2c4"/><path d="M{x - 3.5} {base - 8.5}h7" stroke="{tag}" stroke-width="1.2"/>')


if __name__ == '__main__':
    for theme, night in (('light', False), ('dark', True)):
        path = OUT / f'hero-{theme}.svg'
        path.write_text(hero(night))
        print(f'{path.name} {path.stat().st_size / 1024:.1f} KB')
