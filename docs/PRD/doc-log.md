# PRD 문서 변경 로그

| 버전 | 날짜 | 문서 | 주요 변경사항 |
|------|------|------|---------------|
| V1 | 2026-03-18 | README.md | 최초 생성 — 네비게이션, Phase 1 시작 프롬프트 |
| V1 | 2026-03-18 | 01_PRD.md | 최초 생성 — 제품 개요, 사용자, 핵심 기능, Out of Scope, NEEDS CLARIFICATION |
| V1 | 2026-03-18 | 02_DATA_MODEL.md | 최초 생성 — ERD, 4개 엔티티 상세(예시값 포함), RLS 정책, Phase 2 예정 |
| V1 | 2026-03-18 | 03_PHASES.md | 최초 생성 — Phase 1~3 범위/일정/성공지표 |
| V1 | 2026-03-18 | 04_PROJECT_SPEC.md | 최초 생성 — 기술 스택, 환경변수, DO NOT 8개, ALWAYS DO 7개, 코드 패턴 |
| V1.1 | 2026-05-15 | 05_LIGHTPREP_A_PRD.md | 루트의 `lightprep-prd-a.md`(영문 베이스) + `PRD_LightPrep_A안.md`(리스크/의사결정/체크리스트) 통합. 2026-05-20 시연 목표 |
| V1.2 | 2026-05-15 | 03_PHASES.md | Phase 1 기간 "26.02~26.06, 6주" → "26.04~26.06, 9주 (sprint 4/22~6/20)"로 보정. LightPrep A안을 Phase 1 "AI 스마트 큐레이션" 하위 기능으로 동화 |
| V1.2 | 2026-05-15 | 05_LIGHTPREP_A_PRD.md | 헤더에 "Phase 위치: Phase 1 MVP 하위 기능" 명시 |
| V1.2 | 2026-05-15 | 04_PROJECT_SPEC.md | AI placeholder 유지하되 "현재는 Gemini Flash 2.0" 주석 추가, 코드 예시 모델명도 `gemini-2.0-flash-exp` 명시 |
| V1.2 | 2026-05-15 | 01_PRD.md | NEEDS CLARIFICATION: AI 프롬프트 항목 ✅ (05_LIGHTPREP Appendix 참조), 합격 DB는 1만건 단일 목표 → Phase별 100장/1,000장/1만건 단계로 |
| V1.3 | 2026-05-16 | 06_B2B_ACADEMY_BOARDS.md | 신규 — 데이터팀 카톡 제안(학원별 보드 3종 + 학원 식별 컬럼) 대응 스펙. 보드 3종 지표·필터 정의, 학원 식별은 B안(별도 academies 마스터) 채택. 데이터팀 영향도 회신 대기 |
| V1.3.1 | 2026-05-16 | 06_B2B_ACADEMY_BOARDS.md | 친절판 보강 — §0(작성 배경·독자 명시), §0.1(제품 세부 컨텍스트 용어사전), §0.2(현재 V2 스키마 요약), 각 보드 헤더에 "누가 보고 무엇을 결정"·자연어 설명 추가, A/B 결정에 "쉽게 말하면" 단락 추가, NEEDS CLARIFICATION 각 항목에 회신 의도 추가 |
| V1.4 | 2026-05-17 | 06_B2B_ACADEMY_BOARDS.md | 스펙 보강 — §3 학원 드롭다운 UX(관리자/학생/학원 직접 가입 3가지), §4 RLS·권한 모델(테이블별 정책 + 보드별 권한 매트릭스 + 데이터 마스킹), §5 보드 화면 위치·프론트엔드·백엔드 구현 스택(Phase별), §6 데이터 갱신 주기(일배치 KST 06:00 + 수동 즉시 갱신), §7 AC/완료 조건(데이터모델 + 보드 3종 + 운영 인프라). NEEDS CLARIFICATION §8.5 차트 라이브러리, §8.6 cron 알림 인프라 추가. 회신 요청 데이터팀을 BOAZ 데이터팀으로 명시 |
| V1.3 | 2026-05-16 | README.md | 문서 목록에 06_B2B_ACADEMY_BOARDS.md 추가 |
