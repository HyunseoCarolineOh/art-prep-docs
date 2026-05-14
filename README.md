# art-prep-docs

ArtPrep 프로젝트의 **문서 저장소**. 제품 PRD, 사업계획서, 지원사업 자료, 스프린트 회의록을 모두 포함.
실제 서비스 코드는 별도 `art-prep` 저장소에 있음.

> ArtPrep: 미대입시생 실기자료 탐색을 132분 → 10초로 단축하는 AI 큐레이션 플랫폼.
> 2026-06-20까지 액티브 유저 100명·인터뷰 10건·포트폴리오 자산 3건 달성 목표.

---

## 문서 인덱스

| 폴더 | 용도 | 주요 진입점 |
|------|------|------------|
| [docs/PRD/](docs/PRD/) | 제품 요구사항 (DB·Phase·기능 명세) | [README](docs/PRD/README.md), [01_PRD.md](docs/PRD/01_PRD.md), [05_LIGHTPREP_A_PRD.md](docs/PRD/05_LIGHTPREP_A_PRD.md) |
| [docs/business-plan/](docs/business-plan/) | 사업계획서·개요·양식 | [V9 본문](docs/business-plan/business-plan-V9.md), [overview-V2](docs/business-plan/business-overview-V2.md), [doc-log](docs/business-plan/doc-log.md) |
| [docs/application/](docs/application/) | 지원사업 제출 자료 (modoo, d2sf) | [README](docs/application/README.md), [modoo/](docs/application/modoo/), [d2sf/](docs/application/d2sf/) |
| [docs/sprint-plan/](docs/sprint-plan/) | 스프린트 주차별 컨텍스트 | [README](docs/sprint-plan/README.md), [00-life-goal-context](docs/sprint-plan/00-life-goal-context.md) |
| [docs/meetings/](docs/meetings/) | 회의록·발표 자료 (BOAZ, 내부) | [boaz/](docs/meetings/boaz/), [inside/](docs/meetings/inside/) |

---

## 진실 공급원 (Source of Truth)

문서마다 효력이 다름. 헷갈리면 아래 순위 참조.

| 영역 | SoT | 비고 |
|------|-----|------|
| **작업·태스크** | [`/calendar`](https://hyunseo-oh.vercel.app/calendar) (ceo-staff Supabase) | 2026-04-25부터. 본 저장소 sprint-plan은 컨텍스트 보관용 |
| **제품 스펙** | `docs/PRD/` | 01~05 순번대로 |
| **사업 컨텍스트** | `docs/business-plan/business-plan-V9.md` | 구버전은 git history |
| **지원사업** | `docs/application/<지원사업명>/application.md` | 자료 일체는 하위 폴더 |

---

## 명명·구조 컨벤션

- 폴더는 lowercase-kebab, 파일도 동일 (modoo, d2sf 등 고유명사 제외).
- 지원사업 자료는 `docs/application/<지원사업>/` 하위에 모음. 파일명에 지원사업 이름 반복 X (`docs/application/modoo/application.md` ← `modoo-startup-2026-application.md` 같은 중복 접두 금지).
- 버전 관리되는 문서(사업계획서 등)는 `*-V<숫자>.md` 패턴. 구버전은 git history로 위임하고 워킹 디렉터리에는 최신만 둠.
- 회차/주차 문서가 완료되면 `<폴더>/archive/`로 이동.
- 이미지 자산은 인접 폴더의 `images/` 하위. PNG/JPG는 `.gitignore` 처리.

---

## 커밋 메시지 컨벤션

`<태그>: <설명>` — 태그는 `feat / fix / style / refactor / docs / chore` 중 하나.
예: `docs: LightPrep A안 PRD 머지`.

---

## 최근 정리 기록

- **2026-05-15** 대청소: business-plan V1~V8 삭제, 루트 PRD 머지, application 폴더 d2sf/modoo 분리, sprint-plan archive, mobile/ 폴더 제거, README 재작성.
- 이전 정리 이력은 `git log -- README.md` 또는 각 폴더의 `doc-log.md` 참조.
