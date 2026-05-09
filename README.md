# ArtPrep — AI 기반 미대입시 실기자료 분석·큐레이션 서비스

## 프로젝트 개요

**ArtPrep**은 미대입시 시각자료 전문 갤러리 서비스입니다.

- **핵심 가치**:
    - 많은 자료에 접근 가능함
    - 자료를 찾는 데에 시간이 짧게 걸림
    - 자료를 정확하게 활용할 수 있도록 도와줌
- **가격**: 월 29,900원 (기존 학원비 대비 90% 절감)
- **MVP 목표**: 2026년 6월 100명 파일럿 운영

---

## 기술 스택

| 레이어 | 기술 | 역할 |
|--------|------|------|
| **프레임워크** | Next.js (App Router) | 웹 서비스 |
| **언어** | TypeScript | 전체 |
| **스타일링** | Tailwind CSS | UI 스타일 |
| **UI 컴포넌트** | shadcn/ui | 공통 컴포넌트 |
| **백엔드 / DB** | Supabase | 인증 + PostgreSQL + 이미지 저장 |
| **AI 분석** | 비전 AI | Supabase Edge Functions에서 호출 |

```
사용자 (웹 브라우저)
    ↓
Next.js (App Router)
    ↓
Supabase
    ├── Auth (회원가입·로그인)
    ├── DB (PostgreSQL)
    ├── Storage (이미지)
    └── Edge Functions -> 비전 AI
```

---

## 개발 환경 셋업 순서

### 1. Node.js 설치
- https://nodejs.org 에서 LTS 버전 다운로드·설치
- 설치 확인: `node -v` (v18 이상)

### 2. 의존성 설치
```bash
cd art-prep
npm install
```

### 3. Supabase 프로젝트 생성
- https://supabase.com 에서 계정 생성
- 새 프로젝트 생성 → Project URL, anon key 복사
- `.env.local` 파일에 키 입력 (아래 환경변수 설정 참조)

### 4. 환경변수 설정
```bash
cp .env.local.example .env.local
# .env.local 파일을 열어 Supabase URL, anon key 입력
# Edge Function Secrets에 비전 AI_API_KEY 설정 (Supabase 대시보드)
```

### 5. 개발 서버 실행
```bash
npm run dev
# http://localhost:3000 에서 확인
```

### 6. GitHub 연동 (최초 1회)
```bash
git remote add origin https://github.com/[계정]/art-prep.git
git push -u origin main
```

---

## 화면 구성 (7개 화면)

### 1. 로그인
**파일**: `app/(auth)/login/page.tsx`
**목적**: 기존 회원 로그인 (이메일, Google, Kakao)

---

### 2. 회원가입
**파일**: `app/(auth)/signup/page.tsx`
**목적**: 신규 회원 계정 생성

---

### 3. 온보딩/목표설정
**파일**: `app/onboarding/goals/page.tsx`
**목적**: 큐레이션 기반 목표 설정 (최초 1회, 설정에서 재진입 가능)

**주요 UI 요소**
- 진행 단계 표시 (①②③)
- 목표 대학 목록
- 전형 선택 (수시/정시)
- 실기 유형 선택

**핵심 흐름**
- 3단계 순차 완료 → `user_goals` 저장 → 홈으로 이동

---

### 4. 홈 — 큐레이션
**파일**: `app/page.tsx`
**목적**: 목표 기반 큐레이션 작품 탐색

**주요 UI 요소**
- "내 큐레이션" 헤더 + 목표 요약
- 필터 칩 스크롤 (실기 유형·지역)
- 작품 카드 그리드 (2열, 무한스크롤)

**핵심 흐름**
- 카드 클릭 → 작품 상세
- ♡ 클릭 → 저장·해제
- 필터 클릭 → 결과 갱신

---

### 5. 작품 상세
**파일**: `app/artwork/[id]/page.tsx`
**목적**: 작품 이미지 + AI 5단계 분석 리포트 조회

**주요 UI 요소**
- 전체 너비 이미지
- 작품 정보 (대학·전형·유형·연도)
- AI 분석 5단계 (출제의도·학교성향·조형요소 점수바·평가기준·종합 리포트)

**핵심 흐름**
- 진입 시 DB 분석 결과 조회 (없으면 Edge Function 호출)
- 저장 ♡
- 이미지 클릭 → 전체화면

---

### 6. 저장함
**파일**: `app/saved/page.tsx`
**목적**: 사용자가 저장한 작품 모아보기

**주요 UI 요소**
- "저장함" 헤더
- 작품 카드 그리드 (홈과 동일)
- 빈 상태 메시지 + 홈 이동 버튼

**핵심 흐름**
- 카드 클릭 → 작품 상세
- ♡ 해제 클릭 → 즉시 목록에서 제거

---

### 7. 설정
**파일**: `app/settings/page.tsx`
**목적**: 목표 재설정 및 계정 관리

**주요 UI 요소**
- 현재 목표 요약 (대학·전형·유형)
- 목표 변경 버튼
- 구독 정보
- 계정 이메일
- 로그아웃 버튼

**핵심 흐름**
- 목표 변경 클릭 → 온보딩 화면
- 로그아웃 클릭 → 로그인 화면

---

## 폴더 구조

```
art-prep/
├── app/                              ← Next.js App Router
│   ├── layout.tsx                    ← 루트 레이아웃
│   ├── page.tsx                      ← 홈 (큐레이션)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── onboarding/
│   │   └── goals/page.tsx
│   ├── saved/page.tsx
│   ├── settings/page.tsx
│   └── artwork/
│       └── [id]/page.tsx
├── components/
│   ├── ArtworkCard.tsx
│   ├── FilterChip.tsx
│   ├── AnalysisReport.tsx
│   └── ui/                           ← shadcn/ui 컴포넌트
├── lib/
│   ├── supabase.ts
│   └── types.ts
├── hooks/
│   ├── useArtworks.ts
│   ├── useAuth.ts
│   └── useSaved.ts
├── docs/
│   ├── technical-spec.md             ← DB 스키마, API 상세
│   ├── ai-prompt-guide.md            ← 비전 AI 5단계 분석 프롬프트
│   ├── data-tagging-guide.md         ← 작품 메타데이터 입력 기준
│   └── ux-screen-flow.md             ← 화면별 동작 명세
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql
    └── functions/
        └── analyze-artwork/
            └── index.ts              ← Edge Function (비전 AI 호출)
```

---

## 주요 문서 목록

| 문서 | 경로 | 용도 |
|------|------|------|
| DB 스키마 | `docs/technical-spec.md` | 테이블 구조, API 엔드포인트 |
| AI 프롬프트 | `docs/ai-prompt-guide.md` | 비전 AI 5단계 분석 프롬프트 가이드 |
| 데이터 입력 기준 | `docs/data-tagging-guide.md` | 작품 메타데이터 태깅 기준 |
| UX 명세 | `docs/ux-screen-flow.md` | 화면별 동작 및 플로우 명세 |

---

## 팀원별 역할

| 역할 | 담당자 | 주요 업무 |
|------|--------|----------|
| CEO / Product | 오현서 | 전체 방향, 기획, 데이터 수집 관리, AI 프롬프트 설계 |
| Marketing | 한혜진 | 파일럿 사용자 모집, 콘텐츠 마케팅 |
| UX/UI Design | 우정민 | 화면 설계, 디자인 시스템 |

> **Note**: Phase 0~3는 CEO + Claude 협업으로 진행. 이후 코드 품질 개선 및 기능 확장.
