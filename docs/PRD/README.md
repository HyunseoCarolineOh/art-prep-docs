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

---

## 빠른 참조

### 현재 단계
**Phase 1 MVP** (26.02 ~ 26.06, 약 6주)

### 핵심 기술 스택
- **프레임워크**: Next.js 15 (App Router) + JavaScript
- **UI**: shadcn/ui + Tailwind CSS
- **백엔드**: Supabase (PostgreSQL + Storage + Auth)
- **AI**: Gemini 2.0 Flash API
- **배포**: Vercel

### Phase 1 MVP 기능 3가지
1. 합격 DB 탐색/검색 (실기유형 × 학교지역 필터)
2. AI 스마트 큐레이션 (Top10 추천)
3. 저장 기능 (하트 + 보드)

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
