import sys
sys.stdout.reconfigure(encoding='utf-8')
import fitz
from pathlib import Path

PDF_IN = r'c:\Users\ohsca\Favorites\Downloads\artprep-filled.pdf'
PDF_OUT = r'c:\Users\ohsca\Favorites\Downloads\artprep-stamped.pdf'
STAMP = r'c:\Users\ohsca\OneDrive\문서\1. archive\각종증명서\오현서 직인.png'

STAMP_SIZE = 50  # points, square

# (page_index, name_rect_picker)
# Each: pick the LAST "오현서" on that page (the signature one)
def stamp_after_last_name(page, pno):
    rects = page.search_for('오현서')
    if not rects:
        return False
    last = rects[-1]
    # Place stamp slightly overlapping the right side of name (typical seal placement)
    cx = last.x1 + 5  # 5pt gap after name
    cy = (last.y0 + last.y1) / 2
    half = STAMP_SIZE / 2
    rect = fitz.Rect(cx, cy - half, cx + STAMP_SIZE, cy + half)
    page.insert_image(rect, filename=STAMP, keep_proportion=True, overlay=True)
    return rect

pdf = fitz.open(PDF_IN)
for pno in range(pdf.page_count):
    if pno == 0:
        print(f'Page {pno}: skipped')
        continue
    page = pdf[pno]
    rect = stamp_after_last_name(page, pno)
    print(f'Page {pno}: stamped at {rect}')

pdf.save(PDF_OUT)
pdf.close()
print(f'\nSaved: {PDF_OUT}')
