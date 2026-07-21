from typing import Iterable

import pymupdf


def highlight_pdf(input_path: str, output_path: str, phrases: Iterable[str]):
    if phrases is None:
        phrases = []

    doc = pymupdf.open(input_path)
    highlight_color = pymupdf.pdfcolor["yellow"]

    for page in doc:
        for phrase in phrases:
            if not phrase or not phrase.strip():
                continue
            try:
                rects = page.search_for(phrase)
            except Exception:
                rects = []

            for rect in rects:
                annot = page.add_highlight_annot(rect)
                try:
                    annot.set_colors(stroke=highlight_color)
                except Exception:
                    pass
                annot.update()

    doc.save(output_path)
