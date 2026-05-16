# ArtPrep PRD 문서 네비게이션

> 연 5만명 미대입시생의 실기자료 탐색 132분을 10초로 단축하는 AI 큐레이션 플랫폼

---

## 문서 목록

| 문서 | 설명 | 용도 |
|------|------|------|
| [01_PRD.md](./01_PRD.md) | Product Requirements Document | 제품 정의, 기능 범위, 사용자 |
| [02_DATA_MODEL.md](./02_DATA_MODEL.md) | 데이터 모델 | ERD, 엔티티 상세, RLS 정책 |
| [03_PHASES.md](./03_PHASES.md) | Phase 분리 계획 | Phase 1~3 범위 및 일정 |
| [04_PROJECT_SPEC.md](./04_PROJECT_SPEC.md) | 프로젝트 스펙 (AI 행동 규칙) | 기술 스택, DO/DON'T, 환경변수 |
| [05_LIGHTPREP_A_PRD.md](./05_LIGHTPREP_A_PRD.md) | LightPrep A안 (AI 리포트 생성) | AI 5블록 리포트 기능 — 2026-05-20 시연 목표 |
| [06_B2B_ACADEMY_BOARDS.md](./06_B2B_ACADEMY_BOARDS.md) | B2B 학원 보드 스펙 + 학원 식별 컬럼 안 | 데이터팀 회신 대기 — Phase 2~3 진입 전 확정 |

---

## 빠른 참조

### 현재 단계
**Phase 1 MVP** (26.02 ~ 26.06, 약 6주)

### 핵심 기술 스택
- **프레임워크**: Next.js 15 (App Router) + JavaScript
- **UI**: shadcn/ui + Tailwind CSS
- **백엔드**: Supabase (PostgreSQL + Storage + Auth)
- **AI**: 비전 AI API
- **배포**: Vercel

### Phase 1 MVP 기능 3가지
1. 합격 DB 탐색/검색 (실기유형 × 학교지역 필터)
2. AI 스마트 큐레이션 (Top10 추천)
3. 저장 기능 (하트 + 보드)

### 외부 협력 — 데이터 파이프라인·대시보드·모델 학습
- **외부 데이터분석가 1인** 2026-05 콜라보 합류 (본업 동료/지인 기반).
- 담당 범위: 데이터 파이프라인, 분석 대시보드, AI 모델 학습.
- 일정: **2026-06 내 완료 예정** (Phase 1 MVP 종료 시점과 정렬).
- 상세: [`business-plan-V9.md` §4.1.2](../business-plan/business-plan-V9.md) 참조.

---

## Phase 1 시작 프롬프트

아래 내용을 복사해서 새 Claude Code 세션에 붙여넣기:

```
이 프로젝트는 ArtPrep (미대입시 AI 큐레이션 플랫폼)입니다.
개발 규칙은 /docs/PRD/04_PROJECT_SPEC.md를 따르세요.
현재 Phase 1 MVP를 개발 중입니다. 범위는 /docs/PRD/03_PHASES.md 참조.
데이터 모델은 /docs/PRD/02_DATA_MODEL.md 기준으로 작성하세요.
코드 작성 전 반드시 계획을 먼저 설명하세요.
```
