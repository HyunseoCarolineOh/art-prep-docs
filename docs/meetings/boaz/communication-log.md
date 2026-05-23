# BOAZ × ArtPrep — 의사소통 로그

> 채널: 카톡 그룹방(ARTPREPXBOAZ), 오프라인 미팅, Notion, Daglo 회의록
> 최신순(역순) 정렬 — 새 기록은 위쪽에 추가
> 마지막 업데이트: 2026-05-20

---

## 멤버

**ArtPrep 측**
- 오현서 (제품, 본 로그 작성자)
- 한혜진 (학원 제휴·GTM, 그룹방 host)
- 우정민 (디자인)

**BOAZ 측 (데이터팀)**
- 천시원 (주 컨택, DB·백엔드)
- 지윤 (아키텍처·파이프라인)
- 지수

---

## 열린 액션 아이템 (Open)

| # | 담당 | 항목 | 비고 |
|---|------|------|------|
| 3 | 오현서 | UploadModal.jsx · EditModal.jsx 학원 select 반영 → 천시원 노티 (이미 `f1d15c6` 커밋으로 푸시 완료, 노티만 남음) | 5/17 15:37 약속 |
| 4 | 천시원 | 학원별 보드 3종 초안 공유 (PRD 06번과 머지) | 5/17 00:09 "이번 주 중" 약속 |
| 5 | 오현서 / 천시원 | 시드 학원 리스트 추가 | 현재 academies 테이블에 2개(미지정·테스트미술학원)만 존재 |
| 6 | 오현서 | PRD 06 §8 NEEDS CLARIFICATION → BOAZ 영향도 회신 받기 | Phase 2 진입 전 확정 |
| 7 | 천시원 | GA4/Looker 보드 빌드 — PART 1 4종 + 옵션 B/C + 측정기준 5종 사전 등록 | 5/20 회신 반영, 예상 일정 회신 요청 |

### 닫힌 액션
| # | 항목 | 처리일 |
|---|------|--------|
| 1 | GA4 측정 ID 위치 확인 — 코드엔 없음(Vercel 환경변수 `VITE_GA_MEASUREMENT_ID`), feat/ga4-tracking PR 머지 후 `%VITE_GA_MEASUREMENT_ID%` 치환으로 작동 | 2026-05-18 |
| 2 | GitHub 권한 결정 → **collaborator(Write) 추가 + main 브랜치 보호 룰** 적용 | 2026-05-18 |

---

## 2026-05-20 (수) — GA4/Looker 대시보드 설계 초안 회신

### 천시원 → 그룹방 (오전, 카톡)
PRD §6 기준 GA4/Looker Studio 대시보드 설계 초안 공유 + 검토 요청. 작업 분량이 크지 않아 추가 지표 같이 반영해 1회 빌드 효율화 제안.

**PART 1 — 확정 빌드 예정 4종**
1. 사용자 활동 (DAU/WAU/MAU 선그래프, 신규 vs 재방문 도넛, 평균 세션·페이지뷰, 유저 타입별 분포)
2. 인기 작품 TOP N (조회 TOP / 저장 TOP / 조회 대비 저장률 / 기간 필터)
3. 대학·전형별 인사이트 (대학별 막대, 전형 도넛, 학생 구분별, 필터 사용 빈도)
4. 유입 + 가입 전환 퍼널 (signup_start → step1 → step2 단계별 이탈, 유저 타입별)

**PART 2 — 추가 옵션 (확인 요청)**
- 옵션 A: 학원별 분석 보드 (B2B 영업용)
- 옵션 B: 콘텐츠 운영 인사이트 (검색어 TOP / 결과없는 검색어 / 업로드 추이 / 태그 빈도)
- 옵션 C: 시간대·요일·디바이스 행동 패턴

**PART 3 — 결정 요청 Q1~Q4** (TOP N 값 / 전환율 기준 / 기본 기간 / 공유 범위)

**참고 노티**: GA4 측정기준은 신규 데이터에만 적용되므로 합의된 5종(university, art_type, academy_type, filter_key, filter_value)은 먼저 등록 예정.

### 오현서 → 천시원 (오후, 카톡 회신)

**PART 1**: 그대로 진행 OK.

**PART 3**
- Q1 TOP N → **10**
- Q2 가입 전환율 기준 → **C) 둘 다 (퍼널 시각화)** — 전체 방문 대비 + 가입 페이지 진입 대비 모두 표시
- Q3 기간 필터 기본값 → **지난 7일** (런칭~6월 베이스라인 1개월간 최근 트렌드 추적이 핵심)
- Q4 공유 범위 → **내부 팀(ArtPrep + BOAZ)만**. Looker 계정 고정 공유, 외부 논의 시 캡쳐 전달

**PART 2**
- **옵션 A 제외 (GA4 트랙에서)** → [PRD 06번 트랙](../../PRD/06_B2B_ACADEMY_BOARDS.md)으로 머지 요청.
  - 사유: 06번에 보드 3종 + `academies` 마스터 테이블 + `artworks.academy_id` 컬럼까지 정식 스펙 잡혀 있음 (Open #4·#6)
  - `profiles.academy_name`이 자유 텍스트라 academies 마스터 셋업 전엔 "학원별 가입자 추이" 신뢰도 떨어짐
  - 06번 영향도 회신 → 마스터 셋업 후 별도 보드로 진행
- **옵션 B 채택** — `search` / `filter_use` / `artwork_upload` 이벤트로 데이터 이미 수집 중. "결과 없는 검색어"는 W7(2026-06) 합격작 100장 수집 우선순위 신호로 활용. 측정기준 추가 부담 없음.
- **옵션 C 채택** — GA4 기본 차원이라 비용 거의 0. 입시생 새벽 활동 가설 + 모바일 first 가정 검증을 6월 베이스라인에 묻혀 측정.

**측정기준 5종 사전 등록**: OK. 합의 그대로 진행 부탁.

**요청**: 빌드 들어갈 때 예상 일정 한 줄 공유 요청 (Open #7).

---

## 2026-05-18 (월) — GitHub 권한 셋업 + GA4 측정 ID 위치 확인

### 오현서 (action)

**GitHub 권한**
- `HyunseoCarolineOh/art-prep` main 브랜치 보호 룰 설정
  - PR 머지 강제 (리뷰 인원수 0)
  - Force push 금지 / Deletion 금지
  - Admin 우회 가능 (`enforce_admins: false`)
- `cheon-si`(천시원)에 **Write** 권한 collaborator invite 발송 (invitation id: 319127284)
- → 향후 워크플로우: 천시원이 본 레포에 직접 브랜치 push → PR 생성 → 머지. fork 동기화 불필요.

**GA4 측정 ID 위치 조사**
- 본 레포 `main` 최신 커밋(`f1d15c6`, 5/17 17:25 KST)은 학원 select 추가만. GA4 관련 코드 없음.
- 천시원 fork `cheon-si/art-prep`의 `feat/ga4-tracking` 브랜치에 GA4 부트스트랩 코드 존재:
  - `index.html`: `%VITE_GA_MEASUREMENT_ID%` Vite 환경변수 치환 패턴으로 GA4 스크립트 로드
  - `src/lib/analytics.js`: 트래킹 헬퍼
  - 컴포넌트 12개에 트래킹 호출 삽입
- **결론**: 측정 ID는 코드 파일이 아닌 **Vercel 환경변수 `VITE_GA_MEASUREMENT_ID`** 에만 설정됨. 그래서 배포 페이지에선 보이고 GitHub엔 없음. 천시원 PR 머지하면 환경변수 그대로 작동.

---

## 2026-05-17 (일) — 카톡

### 00:05 — 오현서 → 천시원 (5/16 논의사항 회신)
1. **인덱스 추가**: 이견 없음 (작품 500개+ 갤러리/검색 속도 대비)
2. **학원별 보드 / 학원 드롭다운·컬럼**: 채택. 다음 주 중 PRD 공유 예정
3. **시드 데이터**: 데모/테스트용 — 정식 배포 전 정리. 실제 합격작 100장 수집은 W7(2026-06)이라 그 전엔 더미 필요
4. **PRD §6 이벤트 2종(signup_start, signup_step1_complete)**: 동의 — 가입 퍼널 이탈 단계가 더 중요
5. **GA4 계정**: 미보유. 내일 프로퍼티 생성 후 Editor 초대 (초대 이메일 확인 요청)

### 00:05 — 오현서 → 지윤
- Supabase 재초대 발송 (`shardone04@gmail.com`, 5/16 만료 건)

### 00:09 — 천시원 회신
1. 인덱스: 미리 작업 완료 → 내일 중 DB 반영
2. 학원 보드: 초안 보유 → 정리 후 공유
3. 시드: 실배포 D-1 정리로 합의
4. 이벤트 2종: 확인
5. GA4 초대: `asq7659@gmail.com`

### 14:14 — 천시원 [DB 작업 완료]
- **INDEX 추가** 완료
- **academies 테이블 + artworks.academy_id** 추가 완료
- academies 컬럼: `id, name, region, is_active`
- artworks.academy_id: nullable (학원 미선택 허용)
- 옵션 로드 패턴: `supabase.from("academies").select("*").eq("is_active", true)` (filter_options와 동일)
- 프론트 수정 위치:
  - `UploadModal.jsx`: 학원 select 추가 + insertPayload에 academy_id
  - `EditModal.jsx`: 동일
  - (선택) `ArtworkDetailPage.jsx`: 학원명 표시 — `artworks.academies(name)` JOIN
- 시드 학원 데이터 현재 2개(미지정/테스트미술학원) — 추가 리스트 요청

### 15:37 — 오현서
- 확인. 프론트 반영 완료 후 노티 약속.

### 17:08 — 천시원
- GA 프로퍼티 완료되면 초대 요청

### 17:29 — 오현서
- GA4 Editor 초대 발송 (`asq7659@gmail.com`)
- **측정 ID 코드 추가 + GitHub 푸시 완료**

### 17:46 — 천시원
- 측정 ID 푸시 위치 문의 — 웹페이지에선 발견했으나 GitHub 코드 위치 확인 필요

### 18:09 — 오현서
- 외출 중. 저녁 늦게 확인 답변 → 천시원 "내일 OK"

### 22:29 — 천시원 [중요: GitHub 권한 논의]
- GA4 트래킹 PR을 본 레포에 push할 권한이 없어 **fork에 푸시**해둠
- 두 가지 옵션 제시:
  1. **fork → PR**: 권한 추가 없이 진행
  2. **collaborator 권한 추가**: main 레포 직접 브랜치 push
- 의견: 앞으로 마이그레이션 SQL · 트래킹 코드 PR이 자잘하게 계속 나올 예정 → fork 동기화 충돌 관리 부담 우려
- → **오현서 결정 필요** (Open #2)

---

## 2026-05-16 (토) — 카톡 (천시원 진행상황 공유)

### 16:52 — 천시원
**[검증 완료]** DB / RLS / Storage / 코드 일치 모두 이상 없음

**[논의 필요]**
1. 인덱스 추가 — 작품 500개 초과 시 갤러리·검색 속도 저하 대비. 동의 시 당일 업데이트 가능
2. **학원별 보드 추가 제안 (B2B 영업용)**:
   - 학원별 작품 분포 / 학원별 인기 작품 / 학원 가입자 추이
   - 학원 선택 드롭다운 + DB 컬럼 추가 필요
3. 시드 데이터 정리 — 현재 데이터가 배포 후에도 유지되는지?
4. PRD §6 이벤트 10종에 **2개 추가 제안**:
   - `signup_start`: 가입 퍼널 진입 추적
   - `signup_step1_complete`: Step1 → Step2 전환율 (이탈 단계 분석)

**[요청사항]**
- GA4 계정 필요 → 있으면 프로퍼티 추가하고 Editor 초대

### 16:59 — 지윤
- Supabase 권한 만료. `shardone04@gmail.com`으로 재초대 요청

### 19:56 — 한혜진
- @오현서 멘션 (회신 독려)

> **결과물**: 본 논의는 PRD `06_B2B_ACADEMY_BOARDS.md` 작성으로 이어짐 (오현서 작성, 5/16~17 보강, 영향도 회신 대기).

---

## 2026-05-11 (월) — 카톡 (오현서 DB 체크리스트 피드백 반영 완료)

### 17:56 — 오현서 → 천시원

**[문서 수정 요청 반영]**
- PRD 구현 상태 업데이트: 하트/저장, Storage 업로드, 로그인 페이지 모두 "구현 완료" 반영
- README 테이블 재작성: `image` → `image_url + image_path` 분리, `user_id` 추가, `saved_items` / `filter_options` 테이블 정의 신규 추가
- 프로젝트 구조 수정: `ArtworkDetailModal.jsx` → `ArtworkDetailPage.jsx`로 변경 (실제 코드와 일치)

**[기능 범위 확정]**
- **회원가입 2단계 폼**: MVP 포함. 유저 타입(입시생/강사/학원) + 유형별 추가 정보 + 약관 동의 PRD 상세 명시
- 작품 업로드 권한: 로그인한 사람 누구나 (수정·삭제는 본인 작품만)
- 작품 수정 기능: MVP 포함 (EditModal 구현 완료)
- 이메일 인증: Supabase 기본값 유지
- **SSO 로그인**: Phase 1.5로 결정 — 6월 런칭 후 2주 내 베이스라인 가입 전환율 보고 카카오 먼저 추가

**[GA / 대시보드 요구사항 (PRD §6)]**
- 트래킹 이벤트 10종: `artwork_view, artwork_save, artwork_unsave, artwork_upload, artwork_edit, artwork_delete, search, filter_use, signup_complete, login`
- Looker Studio 지표: ① DAU/WAU/MAU ② 인기 작품 TOP N(조회/저장 두 보드) ③ 대학교·전형별 조회수 + 필터 사용 통계 ④ 유입 채널 + 회원가입 전환율
- **일정**: 서비스 런칭 2026-06 중. GA4 5월 말까지 설치 → 베이스라인 1개월 확보. Looker 대시보드는 6월 1주차 구성

### 19:07 — 천시원
- 확인 후 다음 단계 진행 약속

---

## 2026-05-10 (일) — 카톡

### 12:55 — 천시원
- 코드 최신화 여부 문의 → 완료되면 DB 작업 시작 예정
- Supabase 재초대 요청: `asq7659@naver.com`

### 23:31 — 오현서
- 내일 중 작업 완료 후 전달 약속. Supabase 초대 발송 완료

---

## 2026-05-04 (월) — 카톡 (Supabase access 셋업)

### 07:30 — 오현서
- 5/3 회의 감사 인사
- Supabase access 설정 안내:
  - @천시원 이메일 확인 요청
  - @지수 @지윤 → 5/3 공유 이메일로 초대 진행 OK 확인

### 07:31 — 오현서
- @우정민 @한혜진은 대시보드 가입 주소로 Supabase 인비 발송

### 07:31~12:23 — 멤버 이메일 회신
- 천시원: `asq7659@gmail.com`
- 지윤: `shardone04@gmail.com` (5/3 공유한 `shardone04@hufs.ac.kr`에서 변경)
- 지수: `workwltn@gmail.com` (5/3 공유 기준)

### 22:36 — 오현서
- 전체 인비 발송 완료 노티

---

## 2026-05-03 (일) — 킥오프 미팅 (오프라인 + 그룹방 개설)

### 미팅 개요
- **자료**: `boaz-intro-brief.html` (9슬라이드, 15분 축약본) + `boaz-intro-full.html`
- **목표** (자료 기준):
  - 4/11 합의 진행 상황 공유
  - 협업 3영역(파이프라인/대시보드/AI 모델)에서 BOAZ 인원 1·2 우선순위 배치 확정
  - Supabase 읽기 권한·협업 채널·정기 싱크·학습 노드(GPU 데스크탑) 활용 결정
  - 5/21 1차 점검 합의

### 15:20~ — 그룹방 신설
- 한혜진이 천시원·우정민·오현서 초대 → ARTPREPXBOAZ Team Chat 시작
- 천시원이 지윤·지수 초대

### 15:22 — 천시원
- DB 노션 공유: `https://www.notion.so/DB-355f669e87e680ac97f9dd1194ed0979`

### 15:39 — 지윤
- **전체 파이프라인(초안).pdf** 공유

### 16:00 — 지윤 (아키텍처 mermaid 다이어그램 공유)
- **Frontend (React 앱)**: HomePage, UploadModal, ArtworkDetailPage, SavedPage, MyUploadsPage, RecommendedArtworks, AnalysisPanel
- **Backend / Edge Functions / API**: createArtwork, createAnalysisJob, getArtworkAnalysis, recommendArtworks, searchArtworks, trackUserEvent
- **Python Workers**: Crawler / Import / Validation / Analysis (Vision) / Embedding / Rerank
- **Supabase Postgres**:
  `artwork_sources`(외부 후보), `artworks`(정식), `artwork_analysis`(JSON), `artwork_embeddings`(pgvector), `analysis_jobs`(큐), `saved_items`, `profiles`, `user_events`, `filter_options`
- **Supabase Storage**: `artwork-images`
- **External AI**: Vision Model API, Embedding API, LLM API, (옵션) vLLM Server — 대량 처리 시 자체 호스팅 전환 가능

### 16:27~16:32 — 이메일 수집
- 지윤: `shardone04@hufs.ac.kr`
- 지수: `workwltn@gmail.com`
- 지윤: 추가 사진 1장

### 16:36~16:40 — (오프토픽) 우정민 카드지갑 분실 → 분실품 없음, 본인 측에서 찾음

### 16:56 — 지윤
- **5/3 회의록 (Daglo)** 공유: `https://daglo.ai/share/h_qc2Gwnbbmv8QYe`
- 메모: "일부 날짜 오류는 무시"

---

## 2026-04-11 — 사전 미팅 (별도 회의록 미반영, 합의사항만 알려짐)

5/3 발표 자료(`boaz-intro-brief.html` 슬라이드 9 "4/11 합의 — 진행 상황") 기준 확정 사항:

- **도메인 결정**: ArtPrep 확정 (Plan B 미선택, 미술 입시 도메인 진행)
- **마일스톤**: 10주 스프린트 + 1·2차 점검 + 100명 베타
- **MVP 명확화**: 핀터레스트형(Phase 1) → AI 분석 리포트(Phase 2) → B2B 대시보드(Phase 3)
- **데이터팀 정식 합류**: ArtPrep 대시보드 owner 4명 중 한 자리
- **확장 제안**: 한예종·과기대 비실기 확장 → W9에 반영
- **저작권 안전 + B2B 먼저**: 학원 협조 + 핀터레스트형 + B2B 먼저 (API 자동 수집은 후순위)

---

## 부록 — 외부 링크

| 항목 | URL |
|------|-----|
| 카톡 그룹방 export | `c:\Users\ohsca\Favorites\Downloads\KakaoTalk_20260518_1228_55_847_group.txt` |
| 5/3 Daglo 회의록 | https://daglo.ai/share/h_qc2Gwnbbmv8QYe |
| BOAZ DB Notion | https://www.notion.so/DB-355f669e87e680ac97f9dd1194ed0979 |
| 5/3 미팅 자료 (축약) | `./boaz-intro-brief.html` |
| 5/3 미팅 자료 (풀버전) | `./boaz-intro-full.html` |
| B2B 학원 보드 PRD | `../../PRD/06_B2B_ACADEMY_BOARDS.md` |
