# ArtPrep — AI 기반 미대입시 실기자료 분석·큐레이션 서비스

## 프로젝트 개요

**ArtPrep**은 AI가 실기 합격 데이터 1만건을 분석하여, 미대입시생에게 목표 대학·전형·실기 유형에 맞는 최적 참고작을 10초 안에 추천하는 서비스입니다.

- **핵심 가치**: 강사 주관이 아닌 실제 합격 데이터 기반 분석
- **가격**: 월 29,900원 (기존 학원비 대비 90% 절감)
- **MVP 목표**: 2026년 6월 100명 파일럿 운영

---

## 기술 스택

| 레이어 | 기술 | 역할 |
|--------|------|------|
| **모바일 앱** | Expo (React Native) | iOS + Android 동시 개발 |
| **백엔드 / DB** | Supabase | 인증 + PostgreSQL + 이미지 저장 |
| **AI 분석** | OpenAI GPT-4 | Supabase Edge Functions에서 호출 |
| **서버** | 없음 | Supabase가 서버 역할 대체 |

```
사용자 (iOS / Android)
    ↓
Expo (React Native)
    ↓
Supabase
    ├── Auth (회원가입·로그인)
    ├── DB (PostgreSQL)
    ├── Storage (이미지)
    └── Edge Functions → OpenAI GPT-4
```

---

## 개발 환경 셋업 순서

### 1. Node.js 설치
- https://nodejs.org 에서 LTS 버전 다운로드·설치
- 설치 확인: `node -v` (v18 이상)

### 2. Expo CLI 설치
```bash
npm install -g expo-cli
```

### 3. Expo 프로젝트 초기화 (최초 1회)
```bash
cd art-prep
npx create-expo-app mobile --template blank-typescript
cd mobile
npx expo install expo-router expo-status-bar @supabase/supabase-js
```

### 4. Supabase 프로젝트 생성
- https://supabase.com 에서 계정 생성
- 새 프로젝트 생성 → Project URL, anon key 복사
- `.env.local` 파일에 키 입력 (아래 환경변수 설정 참조)

### 5. 환경변수 설정
```bash
cp .env.local.example .env.local
# .env.local 파일을 열어 Supabase URL, anon key, OpenAI API key 입력
```

### 6. 앱 실행 확인
```bash
cd mobile
npx expo start
# QR코드를 Expo Go 앱으로 스캔 → 실제 폰에서 확인
```

### 7. GitHub 연동 (최초 1회)
```bash
git remote add origin https://github.com/[계정]/art-prep.git
git push -u origin main
```

---

## 전체 개발 로드맵 (2026)

| 단계 | 기간 | 목표 | 완료 기준 |
|------|------|------|----------|
| **Phase 0: 셋업** | 3월 2주 | Node.js, Expo, Supabase, GitHub 연동 | `npx expo start` → QR코드 → 폰에서 앱 확인 |
| **Phase 1: 뼈대** | 3월 3~4주 | 회원가입/로그인, 온보딩 완성 | 회원가입 → Supabase Dashboard에서 user 생성 확인 |
| **Phase 2: 큐레이션** | 4월 1~3주 | 작품 DB + 필터 큐레이션 동작 | 목표 설정 → 작품 리스트 필터링 정상 동작 |
| **Phase 3: AI 분석** | 4월 4주~5월 | GPT-4 분석 리포트 화면 완성 | 작품 탭 → GPT-4 분석 리포트 텍스트 출력 |
| **Phase 4: 마무리** | 6월 | 저장함, 버그 픽스, TestFlight 배포 | TestFlight 링크로 100명 설치 가능 |

---

## 화면 구성 (5개 화면)

| 화면 | 파일 | 설명 |
|------|------|------|
| 온보딩/목표설정 | `app/(onboarding)/goals.tsx` | 대학·전형·실기유형 선택 |
| 홈 (큐레이션) | `app/(tabs)/index.tsx` | 필터 기반 작품 리스트, 무한스크롤 |
| 작품 상세 | `app/artwork/[id].tsx` | 이미지 + AI 5단계 분석 리포트 |
| 저장함 | `app/(tabs)/saved.tsx` | 즐겨찾기 목록 |
| 설정 | `app/(tabs)/settings.tsx` | 목표 재설정, 계정 관리 |

---

## 폴더 구조

```
art-prep/
├── docs/
│   ├── plans/
│   │   └── 2026-03-11-artprep-mvp-design.md   ← 전체 설계 문서
│   ├── technical-spec.md                        ← DB 스키마, API 상세
│   ├── ai-prompt-guide.md                       ← GPT-4 5단계 분석 프롬프트
│   ├── data-tagging-guide.md                    ← 작품 메타데이터 입력 기준
│   └── ux-screen-flow.md                        ← 화면별 동작 명세
├── mobile/                                      ← Expo 프로젝트
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── signup.tsx
│   │   ├── (tabs)/
│   │   │   ├── index.tsx      ← 홈 (큐레이션)
│   │   │   ├── saved.tsx      ← 저장함
│   │   │   └── settings.tsx   ← 설정
│   │   └── artwork/[id].tsx   ← 작품 상세
│   ├── components/
│   ├── lib/
│   │   └── supabase.ts        ← Supabase 클라이언트
│   └── supabase/
│       └── functions/
│           └── analyze-artwork/ ← Edge Function (GPT-4 호출)
├── CLAUDE.md
├── .env.local                  ← 환경변수 (git 제외)
└── .env.local.example          ← 환경변수 템플릿
```

---

## 주요 문서 목록

| 문서 | 경로 | 용도 |
|------|------|------|
| 전체 설계 | `docs/plans/2026-03-11-artprep-mvp-design.md` | MVP 설계 전체 개요 |
| DB 스키마 | `docs/technical-spec.md` | 테이블 구조, API 엔드포인트 |
| AI 프롬프트 | `docs/ai-prompt-guide.md` | GPT-4 5단계 분석 프롬프트 가이드 |
| 데이터 입력 기준 | `docs/data-tagging-guide.md` | 작품 메타데이터 태깅 기준 |
| UX 명세 | `docs/ux-screen-flow.md` | 화면별 동작 및 플로우 명세 |

---

## 팀원별 역할

| 역할 | 담당자 | 주요 업무 |
|------|--------|----------|
| CEO / Product | 오현서 | 전체 방향, 기획, 데이터 수집 관리, AI 프롬프트 설계 |
| Marketing | TBD | 파일럿 사용자 모집, 콘텐츠 마케팅 |
| UX/UI Design | TBD | 화면 설계, 디자인 시스템 |
| Backend Dev | TBD (26.09 합류 예정) | 앱 개발, Supabase 연동, Edge Functions |

> **Note**: Phase 0~3는 CEO + Claude 협업으로 진행. 백엔드 개발자 합류 후 코드 품질 개선 및 기능 확장.

---

## 이번 주 할 일 (3월 11~14일)

- [ ] Node.js 설치 (nodejs.org → LTS)
- [ ] Expo CLI 설치: `npm install -g expo-cli`
- [ ] Supabase 계정 생성 + 프로젝트 생성 (supabase.com)
- [ ] GitHub에 Expo 프로젝트 초기화
- [ ] `docs/data-tagging-guide.md` 기준으로 1,000건 데이터 태깅 시작
- [ ] GPT-4 5단계 분석 프롬프트 검토 (`docs/ai-prompt-guide.md`)
