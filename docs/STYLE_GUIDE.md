# 장표 스타일 가이드 (HTML Deck)

ArtPrep 문서 저장소에서 만드는 HTML 슬라이드 deck의 작성 규칙. 외부 발표·지원사업 제출 2가지 용도에 공통 적용되는 토대와 용도별 변종을 같이 정리.

> 본 가이드의 베이스는 사용자 전역 `CLAUDE.md` "Plan 산출물" 항목. 여기서는 art-prep 특화 항목(브랜드 컬러·파일 위치·용도별 변종)만 덧붙임.

---

## 1. 적용 범위

이 가이드를 따르는 장표:

| 카테고리                              | 위치                                                | 예시                                                |
| ------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| **외부 발표용 deck**            | `docs/meetings/<organization>/`                   | `boaz-intro-brief.html`, `boaz-intro-full.html` |
| **지원사업 제출용 PT**          | `docs/application/<program>/slides.html`          | `modoo/slides.html`                               |
| **지원사업 제출 이미지 추출용** | `docs/application/<program>/images/source/*.html` | `modoo/images/source/01-problem.html` 등          |

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
- **title** (큰 제목) — 한 줄 요약. 56~84px (1920×1080 기준).
- **slide number chip** — `N/M` 형식. 우측 상단 또는 좌측 하단.

CLAUDE.md 규칙: "각 카드 헤더에 `SLIDE N/M` chip" — 다른 표기(예: `01 / 06`)도 허용.

### 2.4. 기본 비율: 16:9 1920×1080

**모든 장표의 기본은 16:9 프레젠테이션 비율 (1920×1080).** 화면 발표·PDF·PNG 출력에 공통으로 잘 맞음. 더 작은 사이즈(예: 1280×720)는 특별한 이유가 있을 때만 사용.

### 2.5. 인쇄 호환

PDF 출력·PNG 캡처가 필요한 경우 슬라이드별 page-break:

```css
@media print {
  .slide { page-break-after: always; }
}
/* 또는 모든 환경 */
.slide { page-break-after: always; }
```

지원사업 제출용은 PDF 변환을 전제로 위 두 줄을 항상 포함.

### 2.6. 슬라이드 수

CLAUDE.md 기준: **8장 내외**. 외부 발표는 6~10장, 지원사업 제출은 5~8장 권장.

---

## 3. 브랜드 컬러 & 로고 (art-prep)

> **디자인 토큰 소스**: 실서비스 [art-prep.vercel.app](https://art-prep-7gw9f6r7s-hyunseocarolineohs-projects.vercel.app/). 신규 장표 만들기 전, 현재 사이트의 컬러·로고를 한 번 확인 후 본 토큰과 다르면 사이트 기준으로 갱신.

### 3.1. 메인 팔레트 — 보라/청록

```css
--ap-purple: #863bff;        /* 메인 보라 (CTA·강조) */
--ap-purple-deep: #7e14ff;   /* 보라 딥 (그라데이션 시작) */
--ap-cyan: #47bfff;          /* 보조 청록 (강조 보완·dot) */
--ap-gradient: linear-gradient(135deg, #863bff 0%, #47bfff 100%);

/* 배경 톤 (soft) */
--ap-purple-soft: #ede6ff;   /* 보라 배경·radial gradient */
--ap-cyan-soft: #e0f4ff;     /* 청록 배경·radial gradient */

/* 잉크·텍스트 */
--ap-ink: #0a0e1a;           /* 본문 텍스트 */
--ap-muted: #64748b;         /* 보조 텍스트·캡션 */
```

지원사업 제출·외부 IR·일반 외부 발표 모두 이 팔레트가 기본.

### 3.2. 차분한 변종 — 네이비/코랄 (선택)

진지한 교류·동아리 발표 등 메인 팔레트가 너무 톡톡 튀어 보일 우려가 있는 자리용:

```css
--ap-navy: #1a3a5c;
--ap-navy-deep: #0f2540;
--ap-coral: #e85d3a;
--ap-coral-soft: #f4a58c;
--ap-beige: #faf7f2;
```

기본은 §3.1, 특별한 이유가 있을 때만 §3.2.

### 3.3. 로고

art-prep 로고는 **텍스트 "ArtPrep" + 보라→청록 그라데이션 dot** 형태:

```html
<div class="brand">
  <div class="dot"></div>
  <span>ArtPrep</span>
</div>
```

```css
.brand {
  display: flex; align-items: center; gap: 14px;
  font-weight: 800; font-size: 28px; color: var(--ap-ink);
}
.brand .dot {
  width: 22px; height: 22px; border-radius: 6px;
  background: var(--ap-gradient);
}
```

- 색 반전 환경(다크 배경)에서는 텍스트 색만 `#fff`로 교체. dot 그라데이션은 유지.
- 별도 SVG 로고 파일이 art-prep 서비스에 추가되면 본 가이드를 갱신.

---

## 4. 용도별 변종

> 두 변종 모두 기본 사이즈 **1920×1080**. 차이는 레이아웃·네비게이션·인쇄 우선순위.

### 4.1. 외부 발표용 deck (boaz 계열)

- **사이즈**: `1920 × 1080`
- **레이아웃**: `display: none` + `.active` 토글로 한 번에 1장씩 표시 (발표 도구 스타일)
- **네비게이션**: 하단 고정 chip (`◀ N/M ▶`) — 키보드 화살표 키 핸들러 권장
- **인쇄**: 보조 — 화면 발표 우선, PDF는 부수적
- **색**: §3.1 또는 §3.2

### 4.2. 지원사업 제출용 PT (modoo/slides.html 계열)

- **사이즈**: `1920 × 1080`
- **레이아웃**: **세로 스크롤로 모든 슬라이드 연속 표시** + `page-break-after: always`
  - **무슨 뜻?** 발표 도구처럼 한 장씩 토글이 아니라, 1920×1080 카드를 위에서 아래로 길게 이어붙인 웹페이지 형태. 브라우저 "인쇄 → PDF로 저장" 누르면 각 카드가 `page-break-after` 덕분에 PDF 1페이지로 깔끔히 잘림. 보는 사람은 스크롤로, 제출은 PDF로 — 두 출력을 한 HTML로 다 만족.
- **네비게이션**: 없음 (PDF 출력이 목표)
- **인쇄**: 필수 — `page-break-after: always` 반드시 포함
- **색**: §3.1 (강한 인상 우선)
- **슬라이드 번호**: 우측 상단 chip

### 4.3. 지원사업 이미지 추출용 (modoo/images/source/*.html)

- **사이즈**: `1920 × 1080` (PNG로 캡처해 첨부 이미지로 사용)
- **레이아웃**: 1 파일 = 1 슬라이드. 스크린샷 자르기 쉽게 `overflow: hidden`
- **네비게이션**: 없음
- **인쇄**: 불필요 (목표는 PNG 캡처)
- **색**: §3.1 + 화이트 배경 (대비 큰 인쇄물 가독성)
- **파일명**: `NN-<topic>.html` (예: `01-problem.html`, `02-solution.html`)
- **결과 PNG**: 상위 폴더 `images/` 직속에 저장. `.gitignore` 처리

---

## 5. 파일·디렉터리 컨벤션

### 5.1. 파일명

- 모두 lowercase-kebab. 한국어 X.
- 외부 발표: `<주체>-<주제>.html` (예: `boaz-intro-brief.html`)
- 지원사업: 폴더 안에서는 단순 `slides.html`, `application.md`, `submission.txt` 등
- 이미지 소스: `NN-<topic>.html` (NN은 2자리 슬라이드 번호)

### 5.2. 디렉터리 위치

```
docs/
├── meetings/
│   └── <organization>/        ← 외부 발표 (boaz 등)
└── application/
    └── <program>/             ← 지원사업
        ├── slides.html        ← 제출 PT
        └── images/
            ├── *.png          ← 결과 PNG (.gitignore)
            └── source/        ← PNG 추출용 HTML
                └── NN-*.html
```

### 5.3. 커밋 메시지

- 신규 deck 추가: `docs: <organization> <주제> 슬라이드 추가`
- 슬라이드 수정: `docs: <organization> 슬라이드 <섹션> 보완`
- 이미지 추출 소스: `chore: <program> 이미지 소스 HTML 추가`

---

## 6. 이미지 첨부 규칙

장표에 이미지(스크린샷·다이어그램·사진·로고 등)를 넣을 때:

### 6.1. 파일 형식·위치

| 자산 | 형식 | 추적 여부 | 위치 |
|------|------|----------|------|
| 결과 출력 PNG (이미지 추출용 HTML의 산출물) | `.png` | **`.gitignore`** | `docs/application/<program>/images/*.png` |
| 다이어그램·아이콘 (장표 본문 안 박힌 이미지) | `.svg` 우선 | git 추적 | 같은 폴더의 `assets/` 또는 인접 디렉터리 |
| 사진·스크린샷 | `.jpg`/`.png` | **`.gitignore`** (`.gitignore`의 `*.png` 룰 그대로) | 같은 폴더 |
| 로고 (art-prep 서비스 로고가 추후 SVG로 추가될 경우) | `.svg` 우선 | git 추적 | `docs/assets/logos/` (있다면) |

### 6.2. 참조 방식

- **상대 경로만 사용.** 외부 URL은 절대 금지 (오프라인·발표 PC에서 깨짐).
- 이미지 추출용 HTML 안에서는 자체적으로 그라데이션·SVG로 그리는 것이 가장 안전 (외부 파일 의존성 0).
- `<img>` 태그는 `alt` 속성 필수.

### 6.3. 해상도

- 1920×1080 슬라이드에 들어가는 이미지: **원본 해상도 ≥ 표시 영역 × 2** (Retina 대응).
- 전체 화면을 채우는 배경 이미지: 최소 1920×1080, 가능하면 3840×2160.
- 다이어그램은 SVG로 만들면 해상도 무관.

### 6.4. 여백·세이프존

- 모든 이미지는 슬라이드 가장자리에서 **최소 80px 여백** 확보 (1920×1080 기준).
  - 1920×1080 슬라이드의 padding을 보통 `100px 120px` 또는 `56px 100px 100px`로 설정. 이미지가 padding을 침범하지 않게.
- 이미지를 카드 안에 넣을 때는 카드 내부에서도 상하좌우 **최소 24px** inner padding.
- 텍스트와 이미지가 함께 있을 때 둘 사이 간격 **최소 32px**.

### 6.5. 가독성

- 이미지에 텍스트가 들어 있으면 화면(또는 PDF)에서 18px 이상으로 보이는지 확인.
- 다크 배경 위 이미지는 외곽에 1px subtle border (`rgba(255,255,255,0.1)`) 또는 soft shadow로 분리.

---

## 7. 작성 체크리스트

장표를 닫기 전 확인:

- [ ] 사이즈가 **1920×1080** (기본). 다른 사이즈면 명확한 이유 있음.
- [ ] 폰트 fallback이 `Pretendard → Noto Sans KR → Apple SD Gothic Neo → Malgun Gothic` 포함
- [ ] 외부 의존성 없음 (또는 fallback 있음). 오프라인 환경에서 열어봤을 때 깨지지 않음
- [ ] 슬라이드 번호 chip이 모든 슬라이드에 있음
- [ ] §3.1 (또는 §3.2) 컬러 팔레트를 일관되게 사용 (혼용 X)
- [ ] art-prep 로고가 있다면 §3.3 그라데이션 dot + 텍스트 형태
- [ ] 슬라이드 8장 내외 (외부 발표는 6~10장 OK)
- [ ] 인쇄 호환 필요한 경우 `page-break-after: always` 명시
- [ ] **모든 이미지가 슬라이드 가장자리에서 80px 이상 여백 확보** (§6.4)
- [ ] **이미지가 카드 안에 들어갈 때 카드 내부 24px 이상 inner padding** (§6.4)
- [ ] 이미지·다이어그램의 텍스트가 18px 이상으로 보임
- [ ] 파일명·위치가 §5 규칙에 맞음
- [ ] 한국어가 깨지지 않음 (`<meta charset="UTF-8">` 확인)

---

## 8. 빠른 참조 — 시작 템플릿 위치

새 장표를 만들 때 비슷한 카테고리의 기존 파일을 복사해서 시작하는 것이 가장 빠름:

| 만들려는 장표                          | 복사 시작점                                              |
| -------------------------------------- | -------------------------------------------------------- |
| 외부 발표 16:9 deck                    | `docs/meetings/boaz/boaz-intro-brief.html`             |
| 지원사업 PT (PDF 추출용, 세로 스크롤)  | `docs/application/modoo/slides.html`                   |
| 지원사업 이미지 (PNG 추출용 1슬라이드) | `docs/application/modoo/images/source/01-problem.html` |

원본은 그대로 두고, 색·텍스트만 교체. 구조를 크게 바꿔야 한다면 사용자에게 먼저 확인.
