const { loadDocument, writeHwp, parseJsonResult } = require('k-skill-rhwp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'original.hwp');
const DST = path.join(__dirname, 'artprep-filled.hwp');

// [parentParagraph, control, cell, text]
const ops = [
  // ===== TABLE 1: 참가 신청서 (parent-paragraph 2) =====
  [2, 0, 1, '아트프렙 (ArtPrep)'],
  [2, 0, 3, '비전 AI가 미대 수험생의 그림을 10초에 5단계 분석하고, 합격 DB 1만 건으로 큐레이션합니다.'],
  [2, 0, 6, '오현서'],
  [2, 0, 8, '2001.04.27'],
  [2, 0, 10, '여'],
  [2, 0, 12, '010-8663-7970'],
  [2, 0, 14, 'ohscaroh555@gmail.com'],
  [2, 0, 17, '오현서'],
  [2, 0, 19, '010-8663-7970'],
  [2, 0, 21, 'ohscaroh555@gmail.com'],
  [2, 0, 23, '☑ 개인사업자'],
  [2, 0, 26, '735-47-00935'],
  [2, 0, 28, '2024. 12. 19'],
  [2, 0, 30, '서울특별시 송파구 백제고분로7길 49, 2층 209호'],
  [2, 0, 36, '0'],
  [2, 0, 37, '3'],
  [2, 0, 38, '5'],
  [2, 0, 43, '0'],
  [2, 0, 44, '0'],
  [2, 0, 45, '2'],
  [2, 0, 50, '0'],
  [2, 0, 51, '0'],
  [2, 0, 52, '0'],
  [2, 0, 54, '해당 없음'],
  [2, 0, 58, '출원 1건 / 등록 0건'],
  [2, 0, 59, '출원 1건 / 등록 0건'],
  [2, 0, 61, '2023 홍익대 경영대학 아이디어 경진대회 1위, 2023 홍익인 창업페스티벌 3위'],
  [2, 0, 63, '0'],
  [2, 0, 71, '-'],
  [2, 0, 72, '해당 없음'],
  [2, 0, 73, '-'],
  [2, 0, 74, '-'],
  [2, 0, 75, '-'],
  [2, 0, 76, '-'],
  [2, 0, 77, '-'],
  [2, 0, 78, '-'],
  [2, 0, 79, '-'],
  [2, 0, 80, '-'],
  [2, 0, 81, '-'],
  [2, 0, 82, '-'],
  // ===== TABLE 2: 개인정보 동의서 (parent-paragraph 5) =====
  [5, 0, 1, '2026년 5월 16일'],
  [5, 0, 3, '신청기업명 : 아트프렙 (ArtPrep)'],
  [5, 0, 4, '대표 : 오현서   (서명/날인)'],
  // ===== TABLE 3: 서약서 (parent-paragraph 7) =====
  [7, 0, 1, '2026년 5월 16일'],
  [7, 0, 3, '신청기업명 : 아트프렙 (ArtPrep)'],
  [7, 0, 4, '대표 : 오현서   (서명/날인)'],
  // ===== TABLE 4: 확약서 (parent-paragraph 9) =====
  [9, 0, 1, '2026년 5월 16일'],
  [9, 0, 3, '신청기업명 : 아트프렙 (ArtPrep)'],
  [9, 0, 4, '대표자 : 오현서   (서명/날인)'],
];

async function main() {
  const doc = await loadDocument(SRC);
  console.log(`Loaded original. Applying ${ops.length} cell writes + color=black ...`);

  const BLACK_PROPS = JSON.stringify({ textColor: '#000000' });

  for (let i = 0; i < ops.length; i++) {
    const [pp, ctrl, cell, text] = ops[i];

    // 1) replace cell text
    const len = doc.getCellParagraphLength(0, pp, ctrl, cell, 0);
    if (len > 0) {
      parseJsonResult(
        doc.deleteTextInCell(0, pp, ctrl, cell, 0, 0, len),
        'deleteTextInCell'
      );
    }
    parseJsonResult(
      doc.insertTextInCell(0, pp, ctrl, cell, 0, 0, text),
      'insertTextInCell'
    );

    // 2) re-color new text to black (UTF-16 code units length)
    const textLen = [...text].reduce((a, c) => a + (c.codePointAt(0) > 0xffff ? 2 : 1), 0);
    try {
      doc.applyCharFormatInCell(0, pp, ctrl, cell, 0, 0, textLen, BLACK_PROPS);
    } catch (e) {
      console.warn(`  [${i + 1}/${ops.length}] color WARN cell=${cell}: ${e.message}`);
    }
    process.stdout.write(`[${i + 1}/${ops.length}] OK p=${pp} c=${cell} (len=${textLen})\n`);
  }

  // Save
  const written = writeHwp(doc, DST);
  console.log(`\n✅ Saved: ${DST} (${written.bytesWritten} bytes)`);
  doc.free();
}

main().catch(e => { console.error(e); process.exit(1); });
