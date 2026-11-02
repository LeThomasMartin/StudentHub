#!/usr/bin/env python3
"""
tape_pdf.py — Ajoute des rubans « touchez pour révéler » sur le texte d'un PDF.

Chaque ruban est une case à cocher PDF (champ de formulaire) :
  - état « décoché » = ruban opaque qui cache le texte (état de départ)
  - état « coché »   = ruban transparent, le texte est visible
Un toucher/clic bascule entre les deux. Aucun JavaScript. Le contenu
d'origine (images, texte, mise en page) n'est jamais modifié.

Quel texte masquer ? (--mode)
  auto   (défaut) étiquettes de figures : texte court relié à une image par une
         flèche, entouré d'un encadré coloré, ou posé sur une image.
  all    tout le texte, sauf titres, sources/légendes et numéros de page.
  bold   seulement le texte en gras (termes-clés des notes de cours).
  --match REGEX   seulement le texte qui correspond à l'expression régulière.

Granularité (--unit) : label (défaut; retours à la ligne automatiques
regroupés), line (une ligne par ruban), block (un bloc/paragraphe par ruban).

Exemples :
  python tape_pdf.py cours.pdf
  python tape_pdf.py notes.pdf --mode bold
  python tape_pdf.py manuel.pdf --mode all --unit block --pages 3-20
  python tape_pdf.py glossaire.pdf --match "^[A-Z][a-z]+ :"
  python tape_pdf.py scan.pdf --mode all --ocr --ocr-lang fra
  python tape_pdf.py cours.pdf --save-labels etiquettes.json   # relire / éditer
  python tape_pdf.py cours.pdf --use-labels etiquettes.json    # réutiliser

Dépendances : pip install pymupdf pikepdf   (OCR : Tesseract installé)
"""
import argparse
import json
import math
import re
import statistics
import sys
import uuid
from pathlib import Path

try:
    import pikepdf
    import pymupdf
except ImportError:
    sys.exit("Dépendances manquantes : pip install pymupdf pikepdf")
from pikepdf import Array, Dictionary, Name, String

# --------------------------------------------------------------- réglages ----
# Valeurs de référence pour une diapositive 960 x 540 pt; elles sont mises à
# l'échelle selon la taille réelle de chaque page.
MAX_WORDS = 10          # une étiquette est courte; au-delà c'est un paragraphe
ARROW_DIST = 22         # distance max entre une flèche et l'étiquette
MIN_IMAGE_AREA = 4000   # ignorer les petites icônes (pt²)
LEADER_MIN_LEN = 15     # longueur min d'une flèche/ligne repère
IMG_OVERLAP = 0.5       # part de l'étiquette qui doit chevaucher une image
PAD_X, PAD_Y = 3.0, 0.8  # marge du ruban autour du texte
TITLE_FRAC = 0.05       # texte >= 5 % de la hauteur de page : titre

SOURCE_RE = re.compile(
    r"(©|\bet coll\b|\bet al\b|\b[eé]dition\b|\bISBN\b|https?://|\bwww\.|"
    r"\b(Source|Sources|Fig\.?|Figure|Tableau|Table)\s*[:.\d]|\b(19|20)\d\d\b)",
    re.I)


# ------------------------------------------------------------ utilitaires ----
def parse_pages(spec, n):
    """'1-5,8' -> {1,2,3,4,5,8} (bornes limitées à 1..n)."""
    out = set()
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            a, b = part.split("-", 1)
            out.update(range(int(a or 1), int(b or n) + 1))
        else:
            out.add(int(part))
    return {p for p in out if 1 <= p <= n}


def dist_point_rect(px, py, r):
    return math.hypot(max(r.x0 - px, 0, px - r.x1), max(r.y0 - py, 0, py - r.y1))


def is_light(c):
    """Gris clair / blanc / absent : forme décorative, pas une flèche."""
    return c is None or (max(c) - min(c) < 0.15 and min(c) > 0.6)


def is_saturated(c):
    return c is not None and (max(c) - min(c)) > 0.4


def is_bold(span):
    f = span["font"].lower()
    return bool(span["flags"] & 16) or any(k in f for k in ("bold", "heavy", "black"))


def norm(r):
    """Rectangle normalisé (x0<=x1, y0<=y1)."""
    return pymupdf.Rect(min(r.x0, r.x1), min(r.y0, r.y1), max(r.x0, r.x1), max(r.y0, r.y1))


def page_scale(page):
    return math.sqrt(page.rect.width * page.rect.height / (960 * 540))


# -------------------------------------------------------- lecture du texte ----
def text_lines(page, textpage=None):
    """Lignes de texte, positions en espace AFFICHÉ (PyMuPDF donne l'espace non pivoté)."""
    M = page.rotation_matrix
    d = page.get_text("dict", textpage=textpage) if textpage else page.get_text("dict")
    for bi, b in enumerate(d["blocks"]):
        if b["type"] != 0:
            continue
        for ln in b["lines"]:
            txt = "".join(s["text"] for s in ln["spans"])
            if txt.strip():
                spans = []
                for sp in ln["spans"]:
                    sp = dict(sp)
                    sp["bbox"] = tuple(norm(pymupdf.Rect(sp["bbox"]) * M))
                    spans.append(sp)
                yield {"block": bi, "text": txt, "rect": norm(pymupdf.Rect(ln["bbox"]) * M),
                       "size": max(s["size"] for s in spans), "spans": spans}


def cluster_lines(lines, unit):
    """Regroupe les lignes en unités à masquer (voir --unit)."""
    out, cur = [], None
    for ln in lines:
        if unit == "line":
            out.append({"raw": ln["text"], "text": ln["text"].strip(),
                        "rect": pymupdf.Rect(ln["rect"]), "size": ln["size"]})
            continue
        if cur is not None and cur["block"] == ln["block"]:
            if unit == "block":
                join = True
            else:   # label : retour à la ligne automatique, mot coupé ou précision entre ()
                txt = ln["text"]
                join = (cur["raw"].endswith((" ", "\u00a0"))
                        or txt.lstrip().startswith("(")
                        or (cur["raw"].rstrip().endswith("-") and txt.lstrip()[:1].islower()))
            if join:
                cur["raw"] = ln["text"]
                cur["text"] += " " + ln["text"].strip()
                cur["rect"] |= ln["rect"]
                cur["size"] = max(cur["size"], ln["size"])
                continue
        if cur:
            out.append(cur)
        cur = {"block": ln["block"], "raw": ln["text"], "text": ln["text"].strip(),
               "rect": pymupdf.Rect(ln["rect"]), "size": ln["size"]}
    if cur and unit != "line":
        out.append(cur)
    return out


def bold_runs(lines):
    """Suites de mots en gras sur une même ligne."""
    out = []
    for ln in lines:
        run = None
        for sp in ln["spans"]:
            if not sp["text"].strip():
                if run:
                    run["text"] += sp["text"]
                continue
            if is_bold(sp):
                r = pymupdf.Rect(sp["bbox"])
                if run:
                    run["text"] += sp["text"]
                    run["rect"] |= r
                else:
                    run = {"text": sp["text"], "rect": r, "size": sp["size"]}
            elif run:
                out.append(run)
                run = None
        if run:
            out.append(run)
    for r in out:
        r["text"] = r["text"].strip()
    return out


def excluded(c, H, median, args, strict=True):
    """Retourne True si ce texte ne doit jamais être masqué (en mode auto/all/bold)."""
    text = c["text"]
    if len(re.findall(r"[^\W\d_]", text)) < 3:
        return True                                   # numéro de page, tiret, chiffre
    if not strict:
        return False
    if c["size"] >= TITLE_FRAC * H:
        return True                                   # gros texte : titre
    if c["rect"].y0 < 0.15 * H and median and c["size"] >= 1.25 * median:
        return True                                   # titre en haut de page
    if SOURCE_RE.search(text):
        return True                                   # source, légende, référence
    if args.exclude and re.search(args.exclude, text, re.I):
        return True
    return False


# --------------------------------------------------- géométrie de la page ----
def page_geometry(page, s):
    """Images, flèches/lignes repères et encadrés colorés d'une page."""
    area = page.rect.width * page.rect.height
    M = page.rotation_matrix
    images = []
    for im in page.get_image_info():
        r = norm(pymupdf.Rect(im["bbox"]) * M)
        if MIN_IMAGE_AREA * s * s < r.get_area() < 0.85 * area:
            images.append(r)
    leaders, boxes = [], []
    for d in page.get_drawings():
        r, items = norm(pymupdf.Rect(d["rect"]) * M), d["items"]
        if r.get_area() > 0.25 * area:
            continue
        if len(items) == 1 and items[0][0] == "re":
            if d["type"] in ("s", "fs") and is_saturated(d.get("color")):
                boxes.append(pymupdf.Rect(r))           # encadré à contour coloré
            continue
        filled = d["type"] in ("f", "fs")
        color = d.get("fill") if filled else d.get("color")
        if is_light(color):
            continue
        pts = []
        for it in items:
            for p in it[1:]:
                if isinstance(p, pymupdf.Point):
                    pts.append(p * M)
                elif isinstance(p, pymupdf.Rect):       # tige de flèche = fin rectangle
                    pts += [pt * M for pt in (p.tl, p.tr, p.bl, p.br)]
        if 2 <= len(pts) <= 40 and max(r.width, r.height) >= LEADER_MIN_LEN * s:
            leaders.append({"pts": pts, "filled": filled, "rect": pymupdf.Rect(r)})
    # Garde-fou : un quadrillage (tableau) n'est pas un ensemble de flèches.
    thin = [L for L in leaders if min(L["rect"].width, L["rect"].height) <= 3 * s]
    hz = sum(1 for L in thin if L["rect"].width > 3 * L["rect"].height)
    vt = sum(1 for L in thin if L["rect"].height > 3 * L["rect"].width)
    if hz >= 5 and vt >= 5:
        leaders = []
    # Relie les morceaux de connecteurs coudés qui se touchent (même groupe).
    parent = list(range(len(leaders)))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    if len(leaders) <= 300:
        tol = 3 * s
        for i in range(len(leaders)):
            ri = leaders[i]["rect"] + (-tol, -tol, tol, tol)
            for j in range(i + 1, len(leaders)):
                if not ri.intersects(leaders[j]["rect"]):
                    continue
                if any(math.hypot(p.x - q.x, p.y - q.y) <= tol
                       for p in leaders[i]["pts"] for q in leaders[j]["pts"]):
                    parent[find(j)] = find(i)
    for i, L in enumerate(leaders):
        L["grp"] = find(i)
    return images, leaders, boxes


def leader_evidence(r, leaders, images, s):
    """Une flèche (ou un connecteur coudé en plusieurs morceaux) part de
    l'étiquette ET aboutit sur une image; sans image, il faut une flèche pleine."""
    big = [im + (-10 * s, -10 * s, 10 * s, 10 * s) for im in images]
    groups = {}
    for L in leaders:
        groups.setdefault(L["grp"], []).append(L)
    for members in groups.values():
        if not any(dist_point_rect(p.x, p.y, r) <= ARROW_DIST * s
                   for L in members for p in L["pts"]):
            continue
        if images:
            if any(im.contains(p) for L in members for p in L["pts"] for im in big):
                return True
        elif any(L["filled"] for L in members):
            return True
    return False


# ------------------------------------------------------------- détection ----
def get_textpage(page, args):
    """Texte natif, ou OCR si la page n'a pas de couche texte (--ocr)."""
    if len(page.get_text().strip()) >= 5 or not args.ocr:
        return None, False
    try:
        return page.get_textpage_ocr(language=args.ocr_lang, dpi=200, full=True), True
    except Exception as e:
        sys.exit(f"OCR impossible ({e}). Installez Tesseract et la langue "
                 f"« {args.ocr_lang} », ou retirez --ocr.")


def detect_page(page, args):
    s, H = page_scale(page), page.rect.height
    tp, _ = get_textpage(page, args)
    lines = list(text_lines(page, tp))
    if not lines:
        return []
    median = statistics.median(l["size"] for l in lines)
    labels = []

    def add(c, why):
        labels.append({"bbox": [round(v, 1) for v in c["rect"]], "text": c["text"], "why": why})

    if args.match:
        rx = re.compile(args.match, re.I | re.M)
        for c in cluster_lines(lines, args.unit):
            if not excluded(c, H, median, args, strict=False) and rx.search(c["text"]):
                add(c, "regex")
        return labels

    if args.mode == "bold":
        for c in bold_runs(lines):
            if not excluded(c, H, median, args):
                add(c, "gras")
        return labels

    if args.mode == "all":
        for c in cluster_lines(lines, args.unit):
            if not excluded(c, H, median, args):
                add(c, "texte")
        return labels

    # --- mode auto : étiquettes de figures ---
    images, leaders, boxes = page_geometry(page, s)
    if not (images or leaders):
        return []
    clusters = cluster_lines(lines, args.unit)
    for c in clusters:
        r = c["rect"]
        if len(c["text"].split()) > args.max_words or excluded(c, H, median, args):
            continue
        if leader_evidence(r, leaders, images, s):
            add(c, "flèche")
        elif any(b.contains(pymupdf.Point((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2)) for b in boxes):
            add(c, "encadré")
        elif any((r & im).get_area() >= IMG_OVERLAP * r.get_area() for im in images):
            add(c, "sur l'image")
    if args.tape_boxes:   # encadrés dont le texte est incrusté dans l'image
        centers = [pymupdf.Point((c["rect"].x0 + c["rect"].x1) / 2,
                                 (c["rect"].y0 + c["rect"].y1) / 2) for c in clusters]
        for b in boxes:
            ratio = b.width / max(b.height, 1)
            if (any((b & im).get_area() >= 0.5 * b.get_area() for im in images)
                    and not any(b.contains(p) for p in centers)
                    and 1.6 <= ratio <= 8 and b.get_area() <= 12000 * s * s):
                inner = b + (1.5, 1.5, -1.5, -1.5)
                labels.append({"bbox": [round(v, 1) for v in inner],
                               "text": "(texte incrusté dans l'image)", "why": "encadré"})
    return labels


def detect_all(doc, pages, args):
    result, no_text = {}, []
    for pno in sorted(pages):
        page = doc[pno - 1]
        if len(page.get_text().strip()) < 5 and not args.ocr and page.get_image_info():
            no_text.append(pno)
        found = detect_page(page, args)
        if found:
            result[str(pno)] = found
    return result, no_text


# ----------------------------------------------------- écriture du PDF -------
def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def form_xobject(pdf, w, h, content):
    st = pikepdf.Stream(pdf, content.encode("ascii"))
    st.Type, st.Subtype = Name.XObject, Name.Form
    st.BBox = Array([0, 0, w, h])
    st.Resources = Dictionary()
    return st


def tape_stream(pdf, w, h, rgb):
    r, g, b = rgb
    dr, dg, db = r * 0.82, g * 0.82, b * 0.82            # rayures plus foncées
    c = [f"{r:.3f} {g:.3f} {b:.3f} rg 0 0 {w:.2f} {h:.2f} re f",
         f"q 0 0 {w:.2f} {h:.2f} re W n {dr:.3f} {dg:.3f} {db:.3f} RG 1.2 w"]
    x = -h
    while x < w:
        c.append(f"{x:.1f} 0 m {x + h:.1f} {h:.1f} l S")
        x += 7
    c.append("Q")
    c.append(f"{dr:.3f} {dg:.3f} {db:.3f} RG 0.8 w 0.4 0.4 {max(w-0.8,0.1):.2f} {max(h-0.8,0.1):.2f} re S")
    return form_xobject(pdf, w, h, "\n".join(c))


def effective_box(pg):
    """CropBox ∩ MediaBox du PDF (hérités), sous la forme (llx, lly, urx, ury)."""
    def box(b):
        v = [float(x) for x in b]
        return (min(v[0], v[2]), min(v[1], v[3]), max(v[0], v[2]), max(v[1], v[3]))
    mb, cb = box(pg.mediabox), box(pg.cropbox)
    return (max(mb[0], cb[0]), max(mb[1], cb[1]), min(mb[2], cb[2]), min(mb[3], cb[3]))


def to_pdf_rect(page, box, r):
    """Rectangle en espace affiché -> espace utilisateur du PDF : annule la
    rotation de page, puis applique l'origine du CropBox et l'axe y vers le haut."""
    u = norm(pymupdf.Rect(r) * page.derotation_matrix)
    llx, lly, urx, ury = box
    return (llx + u.x0, ury - u.y1, llx + u.x1, ury - u.y0)


def write_tapes(src, dst, labels, color, password):
    mu = pymupdf.open(src)
    if mu.needs_pass and not mu.authenticate(password or ""):
        sys.exit("PDF protégé : indiquez le mot de passe avec --password.")
    pdf = pikepdf.open(src, password=password or "")
    rgb = hex_to_rgb(color)
    form = pdf.Root.get("/AcroForm")
    if form is None:
        form = pdf.make_indirect(Dictionary(Fields=Array()))
        pdf.Root.AcroForm = form
    if "/Fields" not in form:
        form.Fields = Array()
    form.NeedAppearances = False
    if "/DA" not in form:
        form.DA = String("/Helv 0 Tf 0 g")
    tag, total = uuid.uuid4().hex[:6], 0

    for pno_s, items in labels.items():
        pno = int(pno_s)
        if not 1 <= pno <= len(pdf.pages):
            continue
        mpage, page = mu[pno - 1], pdf.pages[pno - 1]
        annots = page.get("/Annots")
        if annots is None:
            page.Annots = annots = Array()
        s = page_scale(mpage)
        for k, it in enumerate(items, 1):
            x0, y0, x1, y1 = it["bbox"]
            disp = pymupdf.Rect(x0 - PAD_X * s, y0 - PAD_Y * s, x1 + PAD_X * s, y1 + PAD_Y * s)
            disp &= mpage.rect
            if disp.is_empty:
                continue
            rx0, ry0, rx1, ry1 = to_pdf_rect(mpage, effective_box(page), disp)
            w, h = rx1 - rx0, ry1 - ry0
            if w < 2 or h < 2:
                continue
            annot = pdf.make_indirect(Dictionary(
                Type=Name.Annot, Subtype=Name.Widget, FT=Name.Btn,
                T=String(f"ruban_{tag}_p{pno}_{k}"),
                TU=String("Toucher pour révéler / cacher"),
                F=4, Rect=Array([round(v, 2) for v in (rx0, ry0, rx1, ry1)]),
                P=page.obj, V=Name.Off, AS=Name.Off,
                AP=Dictionary(N=Dictionary(Off=tape_stream(pdf, w, h, rgb),
                                           Yes=form_xobject(pdf, w, h, "q Q"))),
            ))
            annots.append(annot)
            form.Fields.append(annot)
            total += 1
    pdf.save(dst, compress_streams=True,
             object_stream_mode=pikepdf.ObjectStreamMode.generate)
    return total


# ------------------------------------------------------------------ main ----
def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pdf")
    ap.add_argument("-o", "--output")
    ap.add_argument("--mode", choices=["auto", "all", "bold"], default="auto")
    ap.add_argument("--match", help="masquer le texte qui correspond à cette regex")
    ap.add_argument("--unit", choices=["label", "line", "block"], default="label")
    ap.add_argument("--pages", help="pages à traiter, ex. 3-20,25 (défaut : toutes)")
    ap.add_argument("--skip-pages", default="", help="pages à ignorer, ex. 1,2,153")
    ap.add_argument("--exclude", help="ne jamais masquer le texte qui correspond à cette regex")
    ap.add_argument("--max-words", type=int, default=MAX_WORDS,
                    help="mode auto : longueur max d'une étiquette (mots)")
    ap.add_argument("--color", default="#F4B6C2", help="couleur du ruban (hex)")
    ap.add_argument("--tape-boxes", action="store_true",
                    help="mode auto : masque aussi les encadrés dont le texte est dans l'image")
    ap.add_argument("--ocr", action="store_true", help="OCR des pages sans couche texte")
    ap.add_argument("--ocr-lang", default="eng", help="langue(s) Tesseract, ex. fra+eng")
    ap.add_argument("--password", help="mot de passe du PDF, s'il est protégé")
    ap.add_argument("--save-labels", help="écrit la liste détectée dans ce JSON")
    ap.add_argument("--use-labels", help="utilise ce JSON au lieu de détecter")
    a = ap.parse_args()

    src = Path(a.pdf)
    if not src.is_file():
        sys.exit(f"Fichier introuvable : {src}")
    dst = Path(a.output) if a.output else src.with_name(src.stem + "_tape.pdf")
    if dst.resolve() == src.resolve():
        sys.exit("Le fichier de sortie doit être différent du fichier d'entrée.")

    no_text = []
    if a.use_labels:
        labels = json.loads(Path(a.use_labels).read_text(encoding="utf-8"))
    else:
        doc = pymupdf.open(src)
        if doc.needs_pass and not doc.authenticate(a.password or ""):
            sys.exit("PDF protégé : indiquez le mot de passe avec --password.")
        n = len(doc)
        pages = parse_pages(a.pages, n) if a.pages else set(range(1, n + 1))
        pages -= parse_pages(a.skip_pages, n)
        labels, no_text = detect_all(doc, pages, a)
    if a.save_labels:
        Path(a.save_labels).write_text(
            json.dumps(labels, ensure_ascii=False, indent=1), encoding="utf-8")

    if not labels:
        print("Aucun texte à masquer trouvé avec ces réglages.")
        if no_text:
            print(f"{len(no_text)} page(s) sans couche texte (scan ?) : essayez --ocr.")
        print("Essayez un autre --mode (all, bold) ou --match.")
        return
    n = write_tapes(src, dst, labels, a.color, a.password)
    print(f"{n} rubans sur {len(labels)} pages -> {dst}")
    if no_text:
        print(f"Attention : {len(no_text)} page(s) avec images mais sans couche texte "
              f"(ex. p.{no_text[0]}) : --ocr permet de les traiter.")


if __name__ == "__main__":
    main()