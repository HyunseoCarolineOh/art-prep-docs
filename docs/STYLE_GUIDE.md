# 장표 스타일 가이드 (HTML Deck)

ArtPrep 문서 저장소에서 만드는 HTML 슬라이드 deck의 작성 규칙. 외부 발표·지원사업 제출·내부 회의록 3가지 용도에 공통 적용되는 토대와 용도별 변종을 같이 정리.

> 본 가이드의 베이스는 사용자 전역 `CLAUDE.md` "Plan 산출물" 항목. 여기서는 art-prep 특화 항목(브랜드 컬러·파일 위치·용도별 변종)만 덧붙임.

---

## 1. 적용 범위

이 가이드를 따르는 장표:

| 카테고리 | 위치 | 예시 |
|----------|------|------|
| **외부 발표용 deck** | `docs/meetings/<organization>/` | `boaz-intro-brief.html`, `boaz-intro-full.html` |
| **지원사업 제출용 PT** | `docs/application/<program>/slides.html` | `modoo/slides.html` |
| **지원사업 제출 이미지 추출용** | `docs/application/<program>/images/source/*.html` | `modoo/images/source/01-problem.html` 등 |
| **내부 회의록/실행 정리** | `docs/meetings/inside/` | `2026-04-29-w1w2-execution.html` |
| **Plan 검수용** | `docs/<topic>/` 또는 임시 plan 위치 | `CLAUDE.md` Plan 산출물 항목 참조 |

빠르게 끝나는 1~2 슬라이드 짜리 메모는 그냥 마크다운으로 작성. HTML deck은 5장 이상이거나 시각화·인쇄·외부 공유가 필요할 때만.

---

## 2. 공통 원칙 (모든 deck 공통)

### 2.1. self-contained

- **외부 CSS·JS·폰트 CDN 의존성 최소화.** 네트워크 끊겨도 작동해야 함.
- 폰트는 시스템 fallback으로 처리. Pretendard CDN을 쓸 경우엔 fallback도 반드시 작성.
- 인라인 `<style>` 한 곳에 CSS 다 모아두기.
- 이미지는 같은 디렉터리 또는 상대경로. 외부 URL 가급적 X.

### 2.2. 폰트 fallback (필수)

```css
font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont,
             system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic',
             sans-serif;
```

Pretendard가 없는 환경(Windows·정부 평가관 PC 등)에서도 한국어가 깨지지 않게 Apple SD Gothic Neo → Malgun Gothic까지 명시.

### 2.3. 슬라이드 카드 헤더

각 슬라이드 카드에 다음 3요소 권장:

- **eyebrow** (작은 라벨) — 섹션·테마 표기. 색상은 accent 컬러.
- **title** (큰 제목) — 한 줄 요약. 24~32px (스크롤형) / 56~84px (인쇄형).
- **slide number chip** — `N/M` 형식. 우측 상단 또는 좌측 하단.

CLAUDE.md 규칙: "각 카드 헤더에 `SLIDE N/M` chip" — 다른 표기(예: `01 / 06`)도 허용.

### 2.4. 인쇄 호환

PDF 출력·PNG 캡처가 필요한 경우 슬라이드별 page-break:

```css
@media print {
  .slide { page-break-after: always; }
}
/* 또는 모든 환경 */
.slide { page-break-after: always; }
```

지원사업 제출용은 PDF 변환을 전제로 위 두 줄을 항상 포함.

### 2.5. 슬라이드 수

CLAUDE.md 기준: **8장 내외**. 외부 발표는 6~10장, 지원사업 제출은 5~8장 권장. 회의록은 시간순 흐름이라 더 길어도 OK.

---

## 3. 브랜드 컬러 (art-prep)

art-prep 시각 자산에서 자주 쓰이는 팔레트:

### 3.1. 메인 — 보라/청록 그라데이션 (modoo 계열)

```css
--ap-purple: #863bff;        /* 메인 보라 */
--ap-purple-deep: #7e14ff;
--ap-cyan: #47bfff;          /* 보조 청록 */
--ap-gradient: linear-gradient(135deg, #863bff 0%, #47bfff 100%);
--ap-purple-soft: #ede6ff;   /* 배경 톤 */
--ap-cyan-soft: #e0f4ff;
```

지원사업 제출·외부 IR용. 모던하고 톡톡 튀는 첫인상 우선.

### 3.2. 차분한 톤 — 네이비/코랄 (boaz 계열)

```css
--ap-navy: #1a3a5c;
--ap-navy-deep: #0f2540;
--ap-coral: #e85d3a;
--ap-coral-soft: #f4a58c;
--ap-beige: #faf7f2;         /* 카드 배경 */
```

진지한 외부 미팅·동아리 소개·교육 발표용. 신뢰감 우선.

### 3.3. 내부용 — 라이트 + 액센트 (회의록)

```css
--ink: #111827;
--muted: #6B7280;
--line: #E5E7EB;
--bg: #FAFAFB;
--accent: #ff4d00;           /* 핵심 강조만 */
--good: #16a34a;
--warn: #d97706;
--bad: #dc2626;
```

내부 정리용. 가독성 우선, 장식 최소.

> **선택 가이드**: 외부 IR/지원사업은 §3.1, 외부 발표·교류는 §3.2, 내부 정리는 §3.3.

---

## 4. 용도별 변종

### 4.1. 외부 발표용 deck (boaz 계열)

- **사이즈**: `1280 × 720` (HD 16:9, 화면 프레젠테이션용)
- **레이아웃**: `display: none` + `.active` 토글로 한 번에 1장씩 표시
- **네비게이션**: 하단 고정 chip (`◀ N/M ▶`)
- **인쇄**: 보조 — 화면 발표 위주, PDF는 부수적
- **색**: §3.2 네이비/코랄

### 4.2. 지원사업 제출용 PT (modoo/slides.html 계열)

- **사이즈**: `1920 × 1080` (FHD 16:9, PDF 변환 시 선명도 우선)
- **레이아웃**: 세로 스크롤로 모든 슬라이드 연속 표시 + `page-break-after: always`
- **네비게이션**: 없음 (PDF 출력이 목표)
- **인쇄**: 필수
- **색**: §3.1 보라/청록 또는 다크 + 강조색
- **슬라이드 번호**: 우측 상단 chip

### 4.3. 지원사업 이미지 추출용 (modoo/images/source/*.html)

- **사이즈**: `1920 × 1080` (PNG로 캡처해 첨부 이미지로 사용)
- **레이아웃**: 1 파일 = 1 슬라이드. 스크린샷 자르기 쉽게 `overflow: hidden`
- **네비게이션**: 없음
- **인쇄**: 불필요
- **색**: §3.1 + 화이트 배경 (대비 큰 인쇄물 가독성)
- **파일명**: `NN-<topic>.html` (예: `01-problem.html`, `02-solution.html`)
- **결과 PNG**: 상위 폴더 `images/` 직속에 저장. `.gitignore` 처리

### 4.4. 내부 회의록/실행 정리 (inside 계열)

- **사이즈**: `max-width: 1080px` (반응형, 모니터 1개로 읽기 좋게)
- **레이아웃**: 세로 스크롤. 슬라이드 카드 = `border-radius: 16px` + `border: 1px solid var(--line)`
- **네비게이션**: 상단 sticky nav (섹션 anchor 링크)
- **인쇄**: 불필요
- **색**: §3.3 라이트 + 액센트
- **카드 헤더**: eyebrow + title + 우측 상단 슬라이드 번호 chip

---

## 5. 파일·디렉터리 컨벤션

### 5.1. 파일명

- 모두 lowercase-kebab. 한국어 X.
- 외부 발표: `<주체>-<주제>.html` (예: `boaz-intro-brief.html`)
- 지원사업: 폴더 안에서는 단순 `slides.html`, `application.md`, `submission.txt` 등
- 회의록: `YYYY-MM-DD-<주제>.html` (예: `2026-04-29-w1w2-execution.html`)
- 이미지 소스: `NN-<topic>.html` (NN은 2자리 슬라이드 번호)

### 5.2. 디렉터리 위치

```
docs/
├── meetings/
│   ├── <organization>/        ← 외부 발표 (boaz 등)
│   └── inside/                ← 내부 회의록
└── application/
    └── <program>/             ← 지원사업
        ├── slides.html        ← 제출 PT
        └── images/
            └── source/        ← PNG 추출용 HTML
```

### 5.3. 이미지

- **PNG/JPG/JPEG/GIF 는 `.gitignore` 처리** (저장소 비대화 방지)
- HTML 소스만 git에 추적. PNG는 로컬에서 캡처/재생성

### 5.4. 커밋 메시지

- 신규 deck 추가: `docs: <organization> <주제> 슬라이드 추가`
- 슬라이드 수정: `docs: <organization> 슬라이드 <섹션> 보완`
- 이미지 추출 소스: `chore: <program> 이미지 소스 HTML 추가`

---

## 6. 작성 체크리스트

장표를 닫기 전 확인:

- [ ] 폰트 fallback이 `Pretendard → Noto Sans KR → Apple SD Gothic Neo → Malgun Gothic` 포함
- [ ] 외부 의존성 없음 (또는 fallback 있음). 오프라인 환경에서 열어봤을 때 깨지지 않음
- [ ] 슬라이드 번호 chip이 모든 슬라이드에 있음
- [ ] §3 컬러 팔레트 중 하나를 일관되게 사용 (혼용 X)
- [ ] 슬라이드 8장 내외 (외부 발표는 6~10장 OK)
- [ ] 인쇄 호환 필요한 경우 `page-break-after: always` 명시
- [ ] 사이즈가 용도에 맞음 (외부 1280×720 / 지원사업 1920×1080 / 회의록 max 1080px)
- [ ] 파일명·위치가 §5 규칙에 맞음
- [ ] 한국어가 깨지지 않음 (`<meta charset="UTF-8">` 확인)

---

## 7. 빠른 참조 — 시작 템플릿 위치

새 장표를 만들 때 비슷한 카테고리의 기존 파일을 복사해서 시작하는 것이 가장 빠름:

| 만들려는 장표 | 복사 시작점 |
|----------|------------|
| 외부 발표 16:9 deck | `docs/meetings/boaz/boaz-intro-brief.html` |
| 지원사업 PT (PDF 추출용) | `docs/application/modoo/slides.html` |
| 지원사업 이미지 (PNG 추출용 1슬라이드) | `docs/application/modoo/images/source/01-problem.html` |
| 내부 회의록·실행 정리 | `docs/meetings/inside/2026-04-29-w1w2-execution.html` |

원본은 그대로 두고, 색·텍스트만 교체. 구조를 크게 바꿔야 한다면 사용자에게 먼저 확인.
