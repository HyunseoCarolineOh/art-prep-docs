# 06 B2B 학원 보드 스펙 + 학원 식별 컬럼 안

> ArtPrep v1.0 | 작성일: 2026-05-16 (최종 보강: 2026-05-17) | 상태: 데이터팀 회신 대기 (영향도 회신 후 확정)

---

## 0. 이 문서는 무엇인가

**작성 배경**
2026-05-16 데이터팀이 카톡으로 두 가지를 제안했습니다.

1. "학원별 작품 분포 / 학원별 인기 작품 / 학원 가입자 추이" 보드 3종 추가 (B2B 영업용)
2. 위 보드를 만들려면 학원 선택 드롭다운 + DB 컬럼 추가가 필요함

이 문서는 그 제안에 대한 **제품 측 1차 응답안**입니다. 보드 3종의 구체적 지표·필터·UX·권한·구현 스택·갱신 주기·AC를 정의하고, "학원"을 데이터로 어떻게 표현할지(컬럼 A/B) 선호안을 제시합니다. 데이터팀이 받아서 영향도(작업 비용·스키마 충돌 등)를 회신하면, Phase 2 진입 전에 확정할 예정입니다.

**누가 누구에게**

- 작성: ArtPrep 제품팀 (오현서)
- 회신 요청: BOAZ 데이터팀
- 회신 대상 항목: 본문 §8 NEEDS CLARIFICATION

**관련 문서**

- [`business-plan-V9.md`](../business-plan/business-plan-V9.md) — 사업계획서 V9 (B2B 수익 모델, 학원장 네트워크, Phase별 일정)
- [`01_PRD.md`](./01_PRD.md) §3 — B2B 학원 대시보드를 Phase 3로 분류한 기존 결정
- [`03_PHASES.md`](./03_PHASES.md) — Phase 1~3 일정 상세

---

## 0.1 ArtPrep 제품 세부 — 10초 요약

데이터팀이 도메인(미대입시·학원)은 아시지만 제품 워크플로우는 처음일 수 있어 핵심만 정리합니다.

| 용어 | 의미 |
|------|------|
| **합격작 (artworks)** | 미대 합격생들이 시험에서 그린 그림. 핀터레스트 스타일로 학생들에게 보여주는 서비스의 핵심 자산. **관리자(우리 팀)가 직접 업로드하는 read-only 데이터**. 학생은 업로드 불가. Phase 1 목표 100장(2026-06), Phase 3 목표 1만건. |
| **AI 큐레이션** | 학생이 목표 학교·실기유형을 입력하면 비전 AI가 합격작 DB에서 Top10을 추천. 결과는 `curation_sessions` 테이블에 저장. |
| **저장(saved_items)** | 학생이 합격작에 "하트"를 누르면 본인 보드에 저장됨. 인기 작품 판단의 핵심 지표. |
| **Phase 1 / 2 / 3** | 사업계획서 V9의 단계 구분. **Phase 1**(현재, ~26.06): B2C MVP 파일럿 100명. **Phase 2**(~26.10): AI 분석 리포트 추가 + 결제 시스템. **Phase 3**(~27.06): B2B 학원 대시보드 본격화. |
| **학원장 네트워크 20명** | 대표자(오현서)가 이미 신뢰 관계를 맺어둔 입시미술학원장 ~20명. business-plan V9의 **핵심 영업 자산** — 26.12까지 이 중 5개 학원과 유료 계약(월 199,000원/학원) 목표. **현재 시스템에는 데이터로 들어가 있지 않음** (정리된 파일도 없음). |
| **B2B 인사이트 리포트** | 학원을 위한 유료 제품(월 199,000원). "학생 데이터 기반 입시 트렌드 + 유형별 오답노트 분석". 이번 보드 3종이 이 제품의 영업 자료 역할을 함. |
| **합격작 워크플로우** | 운영팀이 합격생/학원으로부터 작품을 수집 → 메타데이터(학교·실기유형·연도·학원 등) 정리 → Supabase Storage에 업로드 → `artworks` 테이블에 INSERT. 학생/일반 사용자가 직접 등록하는 흐름 없음. |

---

## 0.2 현재 V2 스키마 — 한눈에

데이터팀이 컬럼 추가 영향도를 가늠할 수 있도록 현재 상태 요약. 자세한 정의는 Supabase 직접 조회.

| 테이블 | 현재 rows | 주요 컬럼 | 비고 |
|--------|----------|----------|------|
| `artworks` | 0 | id (bigint), title, image_url, image_path, university, art_type, academy_type, year, user_id (uploader), tags | **academy_type은 학원 카테고리(분류)지 개별 학원 식별자가 아님**. 현재 시드 비어있음. |
| `profiles` | 0 | id (uuid, FK→auth.users), user_type ('student'/'teacher'/'academy'), name, nickname, target_university, target_major, **academy_name (text, 자유 입력)**, exam_types | **`academy_name`이 이미 있음** — 학생이 본인 다니는 학원명을 자유 텍스트로 적도록 한 컬럼. 표준화는 안 되어 있음. |
| `saved_items` | 3 | user_id, artwork_id | 학생의 "하트". 인기 작품 지표의 원천. |
| `filter_options` | 15 | category ('university'/'art_type'/'academy_type'), value, display_order, is_active | 화면 필터 드롭다운의 마스터 옵션. **개별 학원 목록이 아님** — academy_type은 "학원 분류"(예: 대형/소형 같은 타입). |

**핵심**: 현재 스키마에는 **개별 학원을 식별하는 정식 키가 없습니다**. `profiles.academy_name`이 자유 텍스트로 들어오긴 하지만 표준화 불가. 그래서 §2에서 별도 마스터 테이블을 제안합니다.

---

## 1. 보드 3종 — 지표 & 필터

각 보드의 헤더에 "누가 보고 무엇을 결정하는가"를 먼저 적었습니다.

### 보드 ①: 학원별 작품 분포

> **누가 보나**: 영업(오현서)이 학원장 면담 시 화면 공유.
> **무엇을 결정**: "당신 학원의 합격작이 우리 플랫폼에 이만큼 노출되고 있다" → 유료 전환 설득.

**핵심 질문**: "이 학원은 어느 학교·실기유형에 강한가?"

| 지표 | 자연어 설명 | 산출식 |
|------|-----------|--------|
| 학원당 합격작 등록 수 | 이 학원이 보유한 합격작이 우리 플랫폼에 몇 장 올라가 있나 | `COUNT(artworks WHERE academy_id = ?)` |
| 학교별 분포 | 이 학원 합격작 중 홍익대 N%, 국민대 N% … | `artworks GROUP BY university` (해당 academy_id 한정) |
| 실기유형별 분포 | 소묘 N%, 수채화 N% … | `artworks GROUP BY art_type` |
| 합격연도별 분포 | 최근 합격작이 얼마나 있나 (트렌드) | `artworks GROUP BY year` |

**필터**: 합격연도, 학교, 실기유형, 지역(`academies.region`)
**영업 멘트 예시**: "당신 학원 합격작이 우리 플랫폼에 N장 노출 중이며, 홍익대 카테고리 노출 1위입니다."

---

### 보드 ②: 학원별 인기 작품

> **누가 보나**: 영업이 학원장에게 화면 공유. 또한 운영팀(콘텐츠 수집)도 인기 학원을 우선 컨택하는 데 활용.
> **무엇을 결정**: "당신 학원 작품이 학생에게 이렇게 반응이 좋다" → 유료 전환 + 추가 작품 수집 협조 요청.

**핵심 질문**: "어느 학원 작품이 학생에게 가장 잘 반응하나?"

| 지표 | 자연어 설명 | 산출식 |
|------|-----------|--------|
| 학원당 총 저장 수 | 학생들이 이 학원 작품에 누른 "하트" 총합 | `COUNT(saved_items JOIN artworks ON academy_id = ?)` |
| 학원당 Top10 작품 | 저장 많이 받은 순으로 10개 | 저장 수 desc, 학원 한정 |
| 작품당 평균 저장 수 | 작품 하나가 평균 몇 번 저장되었나 (학원의 "품질" 비례) | 총 저장 수 / 학원 합격작 수 |
| 큐레이션 결과 노출 수 (Phase 2~) | AI 추천 Top10 결과에 이 학원 작품이 몇 번 등장했나 | curation_sessions.result_ids 등장 횟수 — 학원 한정 |

**필터**: 기간(7일/30일/누적), 학교, 실기유형
**영업 멘트 예시**: "당신 학원 작품이 학생들에게 월 N회 저장됩니다. Top 학원 평균(N회) 대비 N% 높습니다."

---

### 보드 ③: 학원 가입자 추이

> **누가 보나**: 주로 **내부**(영업·경영). 외부엔 익명화하여 "전국 N개 학원이 사용 중" 식 마케팅 카피로만 활용.
> **무엇을 결정**: B2B 영업 KPI 모니터링. business-plan V9 목표(26.12까지 5개 학원 유료) 달성 추적.

**핵심 질문**: "학원·학원 소속 학생이 얼마나 늘고 있나?"

| 지표 | 자연어 설명 | 산출식 |
|------|-----------|--------|
| 학원 가입 수 (누적 + MoM) | DB에 등록된 학원 수, 그리고 전월 대비 증가율 | `COUNT(academies WHERE contract_status != 'prospect')` |
| 학원 소속 학생 가입 수 | 학생 가입자 중 본인이 다니는 학원을 표시한 사람 수 | `COUNT(profiles WHERE academy_id IS NOT NULL)` |
| 학원당 평균 학생 수 | 한 학원당 평균 몇 명의 학생이 우리 플랫폼을 쓰나 | 학생 수 / 학원 수 |
| B2B 전환 깔때기 | 학원장 네트워크 20 → prospect로 등록 → contracted(유료 계약) | V9 목표: 26.12까지 5개 |

**필터**: 기간, 지역

---

## 2. 학원 식별 컬럼 — 결정과 이유

### 두 가지 가능한 방식

**A안: 기존 `profiles.user_type='academy'` 활용**
학원도 그냥 한 명의 사용자처럼 가입함. `profiles` 테이블 안에서 `user_type='academy'`로 구분만 함. 별도의 "학원 목록" 테이블 없음.

**B안: 별도 `academies` 마스터 테이블 신설**
"전국 학원 목록"이라는 별도 테이블을 만들고, 학생·합격작이 그 목록을 참조함. 학원이 직접 가입하지 않아도 데이터로 존재 가능.

---

### 결정: **B안 채택 + A안 보조 활용**

**쉽게 말하면**: 학원이 우리 서비스에 가입하든 안 하든 시스템 안에 "학원 목록"이 먼저 존재해야 합니다. 그래야 영업 시 "당신 학원 작품이 N장 있다"를 보여줄 수 있어요. A안만 쓰면 학원이 직접 가입할 때까지 데이터가 0이라 영업 자료가 안 만들어집니다.

**구체 근거**

1. **영업 자산 보호 (V9 핵심)**: 학원장 네트워크 20명은 가입 *전* 단계의 영업 대상입니다. 면담 가기 *전에* "이 학원 작품을 우리가 N장 가지고 있고 학생 반응은 이렇다"가 시스템에 준비되어 있어야 합니다. A안만으론 학원이 가입해야만 그 학원이 시스템에 존재하므로, 영업 사이클이 깨집니다.

2. **B2B 인사이트 리포트의 전제**: 유료 제품(월 199,000원)인 "인사이트 리포트"는 "학생 데이터 기반 입시 트렌드"가 핵심입니다. 이건 `artworks ↔ 학원` 연결이 있어야 분석 가능합니다. artworks가 관리자 read-only 업로드라 학원 ID를 채우기 쉽습니다(운영팀이 등록 시 같이 입력).

3. **유연성**: 학원이 나중에 직접 가입하면 `academies.owner_user_id = profiles.id` 연결만 추가하면 됩니다. 두 경로(가입 안 함 / 가입 함)가 자연스럽게 합쳐집니다.

4. **현재 스키마와 충돌 없음**:
   - `artworks.academy_type`은 "학원 카테고리(분류)"라 개별 학원 식별과 무관 → 그대로 두면 됨
   - `profiles.academy_name`은 학생 자유 입력 텍스트라 표준화 불가 → academies로 정규화 후 단계적 deprecate

---

### 제안 스키마 (초안)

```sql
-- 신규 테이블: 학원 마스터
CREATE TABLE academies (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  region          TEXT,                              -- 예: '서울 강남', '경기 일산'
  contact_name    TEXT,
  contact_phone   TEXT,
  contract_status TEXT NOT NULL DEFAULT 'prospect'
                    CHECK (contract_status IN ('prospect', 'contracted', 'churned')),
                    -- prospect: 영업 대상, contracted: 유료 계약, churned: 이탈
  owner_user_id   UUID REFERENCES auth.users(id),   -- 학원이 직접 가입한 경우만 채워짐
  notes           TEXT,                              -- 영업 메모
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 기존 테이블에 FK 추가
ALTER TABLE artworks ADD COLUMN academy_id BIGINT REFERENCES academies(id);
ALTER TABLE profiles ADD COLUMN academy_id BIGINT REFERENCES academies(id);

-- 인덱스 (보드 쿼리용)
CREATE INDEX idx_artworks_academy_id ON artworks(academy_id);
CREATE INDEX idx_profiles_academy_id ON profiles(academy_id);
CREATE INDEX idx_academies_contract_status ON academies(contract_status);
```

`profiles.academy_name`(기존 자유 입력 컬럼)은 일단 유지합니다. 학생이 가입 시 자유 텍스트로 학원명을 적고, 운영팀이 주기적으로 살펴서 `academies` row와 매칭한 뒤 `academy_id`를 채우는 흐름입니다. 정규화가 충분히 진행되면 `academy_name` 컬럼은 단계적으로 제거 검토.

---

### 운영 흐름 (각 시나리오에서 누가 무엇을 하는지)

| 시나리오 | 누가 | 무엇을 |
|----------|------|-------|
| 합격작 등록 | 운영팀(관리자) | Supabase에 합격작 INSERT 시 `academy_id` 드롭다운에서 선택. **학원 정보를 모르면 NULL로 두기 허용** (데이터 수집 부담 줄이기 위해). |
| 학생 가입 | 학생 본인 | 가입 폼에서 `academy_name`을 **자유 텍스트로 직접 입력**. 드롭다운 X. (가입 마찰 최소화) |
| 자유 입력 → 정규화 | 운영팀 | 주기적으로 `academy_name` 자유 입력값을 살피고, 매칭되는 `academies` row가 있으면 학생 profile의 `academy_id`를 채움. |
| 학원 직접 가입 | 학원장 본인 | 일반 회원가입과 동일하나 `profiles.user_type='academy'`로 가입. 운영팀이 해당 profile과 `academies.owner_user_id`를 연결. |
| 학원장 네트워크 20명 초기 데이터 | 운영팀(영업) | **빈 academies 테이블로 시작**. 학원장 면담 진행할 때마다 운영팀이 academies에 수동 입력 (정리된 파일이 현재 없음). |

---

## 3. 학원 드롭다운 UX 스펙

세 가지 진입점이 있고 각각 UX가 다릅니다.

### 3.1 관리자 합격작 등록 (Phase 1~ 즉시 필요)

**위치**: 어드민 합격작 INSERT 폼의 "소속 학원" 필드 (현재 미구현 — Phase 1에선 NULL 저장)

**컴포넌트**: 검색 가능 Combobox (autocomplete dropdown)

**동작**

1. 사용자가 입력창에 타이핑 → `academies` 테이블에서 `name ILIKE '%query%'` 부분 매칭으로 후보 표시 (상위 10개)
2. 결과에 일치하는 학원 있으면 선택
3. **검색 결과 없음 + 입력값 1자 이상** → 드롭다운 하단에 `+ "{입력값}" 신규 학원 추가` 버튼 노출
4. 신규 추가 버튼 클릭 → 인라인 모달 → `name`(필수), `region`(선택)만 입력 → `contract_status='prospect'` 기본값으로 INSERT → 새 row의 id를 합격작 폼의 `academy_id`로 자동 채움
5. 빈 값 허용 — 학원 모르면 그대로 저장 (`academy_id = NULL`)

**검색 최적화**: `academies.name`에 `pg_trgm` GIN 인덱스 검토 (학원 수 500개 이상이면)

### 3.2 학생 가입 (Phase 1 이미 일부 구현)

**위치**: 가입 Step 2 폼의 `academy_name` 필드 (현재 자유 텍스트)

**결정**: **드롭다운 X, 기존 자유 텍스트 유지**

**이유**

- 가입 마찰 최소화 — 본인 학원이 academies 마스터에 없으면 막힘
- 학원장 네트워크 20명 이외 학원이 시스템에 들어오는 자연스러운 경로 (영업 풀 확장)
- 정규화는 운영팀이 사후 처리

**보강**: 입력창 아래에 "정확하지 않아도 됩니다 (예: 'OO미술학원', '강남 OO')" 안내 텍스트 추가

### 3.3 학원 직접 가입 (Phase 3)

**위치**: 가입 폼에서 `user_type='academy'` 선택 시 분기

**동작**

1. 일반 정보(이름, 이메일, 비밀번호) 입력
2. 학원 정보(상호, 지역, 연락처) 입력 → `profiles` 생성 + `academies` row 자동 생성/연결 검토
3. 운영팀 승인 대기 상태 (`profiles.is_verified` 플래그 — 신규 컬럼 필요)
4. 승인 완료 → `academies.owner_user_id` 연결, B2B 인사이트 리포트 접근 가능

Phase 3 진입 전까지는 수동 운영(이메일·전화 컨택 후 운영팀이 academies row 생성).

---

## 4. RLS · 권한 모델

### 4.1 테이블별 RLS 정책

```sql
-- academies: 영업 데이터, 일반 사용자에 비공개
ALTER TABLE academies ENABLE ROW LEVEL SECURITY;

-- 관리자(admin role)는 풀 액세스 — service_role 또는 admin claim 사용
CREATE POLICY "academies_admin_all" ON academies
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- 학원 본인(owner)은 본인 row만 SELECT
CREATE POLICY "academies_owner_read" ON academies
  FOR SELECT USING (owner_user_id = auth.uid());

-- artworks.academy_id 자체는 public(기존 artworks 정책 따름) — 단, academies와 조인하는 건 위 정책에 막힘
-- profiles.academy_id는 본인 row 정책(profiles_self_only)에 자동 포함
```

### 4.2 보드별 접근 권한

| 보드 | 영업·운영 (admin) | 학원장 (B2B 계약 후, Phase 3) | 일반 학생 |
|------|------------------|------------------------------|-----------|
| ① 학원별 작품 분포 | 전체 | 본인 학원만 | X |
| ② 학원별 인기 작품 | 전체 | 본인 학원만 | X |
| ③ 학원 가입자 추이 | 전체 | X (내부 전용) | X |

**학원장 본인 한정 뷰**는 view 또는 RPC 함수로 처리. 예:

```sql
CREATE VIEW academy_self_distribution AS
SELECT a.id, a.name, COUNT(art.id) AS artwork_count, ...
FROM academies a
LEFT JOIN artworks art ON art.academy_id = a.id
WHERE a.owner_user_id = auth.uid()
GROUP BY a.id;
```

### 4.3 데이터 마스킹

외부(예: 마케팅 카피)에 학원 이름 노출 시:
- 단일 학원 식별 가능한 카피 금지
- "전국 N개 학원" 식 집계만 허용
- 학원장 동의 확보된 케이스는 별도 플래그(`academies.consent_public_mention BOOL`) 추가 검토

---

## 5. 보드 화면 위치 & 구현 스택

### 5.1 Phase별 운영 방식

| Phase | 보드 운영 위치 | 이유 |
|-------|--------------|------|
| Phase 1 (현재) | **사용 안 함** (스펙만) | 코드·DB 변경 없이 문서만 |
| Phase 2 (26.06~26.10) | **외부 BI 도구** (Supabase Dashboard SQL Editor 또는 Metabase) + 주배치 export to Google Sheets | 영업 1~2명 사용, 제품 코드 부담 회피 |
| Phase 3 (26.10~) | **제품 내 admin 메뉴 통합** — `/admin/b2b/boards/{1,2,3}` 라우트 | 학원장에게 직접 공유, B2B 인사이트 리포트로 진화 |

### 5.2 프론트엔드 (Phase 3)

- **스택**: React 19 + Vite + Tailwind (기존 art-prep과 동일)
- **차트 라이브러리**: 미정 — 후보 `recharts` / `visx` / `nivo`. **데이터팀 의견 요청** (§8.5)
- **레이아웃**
  - 보드 ①: 상단 KPI 카드 4종 + 도넛(학교/실기유형) + 막대(연도별)
  - 보드 ②: Top10 작품 그리드(썸네일) + 학원별 저장 수 테이블
  - 보드 ③: 라인 차트(가입 추이) + 깔때기(전환) + KPI 카드
- **공통 컴포넌트**: 학원 선택 드롭다운(§3.1), 기간 필터, CSV export

### 5.3 백엔드 (Phase 3)

- **집계 방식**: Supabase Postgres `MATERIALIZED VIEW` 1개/보드 + 일배치 REFRESH
- **API**: Supabase PostgREST 자동 노출 — 별도 백엔드 서버 없음
- **인증**: Supabase Auth JWT + RLS (§4)
- **대안 검토 (데이터팀 결정 위임)**: 데이터 양 증가 시 Edge Function으로 사전 집계 → JSON 캐시

---

## 6. 데이터 갱신 주기

### 결정: **일배치 (매일 KST 06:00)**

| 보드 | 주기 | 이유 |
|------|------|------|
| ① 학원별 작품 분포 | 일배치 | artworks 등록 빈도 낮음 (운영팀 수동 업로드, 주 수십 건 이내) |
| ② 학원별 인기 작품 | 일배치 | saved_items 빈도는 높지만 영업용이라 실시간 불필요 |
| ③ 학원 가입자 추이 | 일배치 | KPI 모니터링용 — 일 단위면 충분 |

**구현**: Supabase `pg_cron` extension으로 매일 06:00 KST(=21:00 UTC) `REFRESH MATERIALIZED VIEW CONCURRENTLY` 실행.

**예외 — 즉시 갱신**: 영업 미팅 직전에 최신 수치가 필요한 경우, 어드민 UI에 "지금 갱신" 버튼 (수동 REFRESH 트리거). Phase 3 진입 시 구현.

**실패 알림**: cron job 실패 시 Supabase Logs → Slack webhook (운영팀 채널). 별도 webhook 설정 필요 — §8.6.

---

## 7. AC / 완료 조건 (수용 테스트 체크리스트)

각 Phase 진입 시 데이터팀과 함께 통과 확인.

### 7.1 데이터 모델 (Phase 2 진입 전)

- [ ] `academies` 테이블 생성 + RLS 정책 4종 적용
- [ ] `artworks.academy_id`, `profiles.academy_id` FK 추가 + 인덱스 3종
- [ ] 신규 ALTER로 기존 데이터 영향 없음 확인 (artworks 0 / profiles 0 / saved_items 3 그대로)
- [ ] `profiles.academy_name` 자유 입력값 → academies 매칭 정규화 SQL 절차 문서화

### 7.2 보드 ① 학원별 작품 분포

- [ ] `academies` row 5개 이상 시드 상태에서 각 보드 카드 정상 렌더
- [ ] `academy_id IS NULL`인 artworks는 "미상" 카테고리로 별도 표기 (전체 통계에 포함하지 않음)
- [ ] 필터 4종(연도/학교/실기/지역) 단일·복합 조합 동작
- [ ] 도넛/막대 차트 합계 = 카드 KPI와 일치

### 7.3 보드 ② 학원별 인기 작품

- [ ] saved_items가 0인 학원은 "데이터 부족" 상태 표시 (빈 그리드 X)
- [ ] Top10 작품 이미지 썸네일 정상 로드 (Supabase Storage public URL)
- [ ] 기간 필터(7/30/누적) 정확 — `saved_items.created_at` 기준
- [ ] 작품당 평균 저장 수 = 총 저장 / 합격작 수 (나눗셈 검증)

### 7.4 보드 ③ 학원 가입자 추이

- [ ] cumulative + MoM 계산 정확 (월별 deduplication 포함)
- [ ] 깔때기 4단계(네트워크 20 → prospect → contracted → churned) 표시
- [ ] B2B 목표선(26.12까지 5개 contracted) 차트에 가이드라인 표시

### 7.5 운영·인프라

- [ ] 일배치 갱신이 매일 06:00 KST에 자동 실행
- [ ] 실패 시 Slack 알림 (운영팀 채널)
- [ ] RLS 통과 — 일반 학생 계정으로 `academies` SELECT 시 0 rows 반환
- [ ] 학원장 본인 계정으로 본인 학원 외 row SELECT 시 0 rows 반환

---

## 8. NEEDS CLARIFICATION (데이터팀 영향도 회신 요청)

각 항목에 **회신 의도**를 같이 적었습니다.

### 8.1 마이그레이션 영향도
artworks는 현재 0 rows, profiles 0 rows, saved_items 3 rows라 마이그레이션 부담은 사실상 없을 것으로 보입니다. §2의 ALTER 문을 그대로 적용해도 되는지, 추가로 필요한 작업(예: RLS 정책 보강, 기존 트리거와의 충돌 검토)이 있는지 회신 부탁드립니다.

### 8.2 시드 데이터와의 관계
별도 카톡 안건(시드 데이터 정리)과 연결됩니다. 배포 전 시드를 정리할 때 `academy_id`를:

- 전부 NULL로 두고 시작할지
- 아니면 시드 일부를 학원장 네트워크 20명과 임시 매핑해서 데모용으로 쓸지

→ 데이터팀이 시드 정리하면서 어느 쪽이 작업하기 좋은지 회신 부탁드립니다.

### 8.3 `profiles.academy_name` → `academy_id` 정규화 작업
학생들이 자유 텍스트로 학원명을 입력하면 "OO미술학원" / "OO 미술학원" / "OO학원" 같은 변형이 생깁니다. 이걸 표준화하는 작업이 어느 정도 비용일지(자동 매칭 가능한지, 수동 정리 필요한지) 견적 부탁드립니다.

### 8.4 인사이트 리포트(B2B 유료 제품)와의 데이터 공유
Phase 2 LightPrep AnalysisReport(학생 본인 작품 AI 분석)와 학원 보드는 데이터를 공유합니다 — 학원 입장에선 "우리 학원 학생들의 분석 결과 트렌드"가 핵심 가치이기 때문. 이 연결 지점에서 데이터 흐름 설계를 어떻게 가져갈지 의견 부탁드립니다.

### 8.5 차트 라이브러리 선택
Phase 3 프론트엔드 차트 라이브러리 후보: `recharts` / `visx` / `nivo`. 데이터팀이 추천하는 게 있다면 의견 부탁드립니다. (없으면 기본 `recharts`로 결정)

### 8.6 cron 실패 알림 인프라
보드 갱신이 매일 06:00 KST 실행되는데, 실패 시 Slack webhook 알림이 필요합니다. 데이터팀이 별도 모니터링 도구를 운영 중이면 그쪽 연결, 아니면 Supabase Logs + 단순 webhook 조합으로 갈 예정 — 회신 부탁드립니다.

---

## 9. Phase 정렬

| Phase | 시기 | 이 문서 관련 작업 |
|-------|------|------------------|
| Phase 1 (현재) | ~26.06 | **스펙만 확정** (이 문서). 코드·DB 변경 보류. |
| Phase 2 | 26.06 ~ 26.10 | `academies` 마스터 + FK + RLS 적용. 외부 BI 도구로 보드 운영 시작. `profiles.academy_name` 정규화 시작. |
| Phase 3 | 26.10 ~ 27.06 | 보드 3종 제품 내 구현(/admin/b2b), 학원 드롭다운 UX 구현, 학원 직접 가입 흐름, B2B 영업 본격화. |

---

## 10. 결정 이력

| 항목 | 결정 | 이유 |
|------|------|------|
| 학원 식별 방식 | B (별도 academies 마스터) | 가입 *전* 학원도 트래킹 필요 (영업 사이클) |
| 학생-학원 연결 UX | 자유 입력(`academy_name` 유지) + 운영팀 정규화 | 가입 마찰 최소화, 표준화는 운영팀이 사후 처리 |
| 합격작 등록 시 학원 메타 | `academy_id` nullable, 드롭다운(autocomplete + 신규 추가) | 학원 정보 모르면 NULL 허용 — 데이터 수집 부담 줄임 |
| 학원장 네트워크 20명 초기 데이터 | 없음 — 빈 테이블로 시작, 영업 진행하며 운영팀이 수동 입력 | 정리된 파일 부재 |
| 데이터 갱신 주기 | 일배치 (KST 06:00) + 수동 즉시 갱신 버튼 | 영업용 — 실시간 불필요, 운영 부담 낮음 |
| 보드 운영 위치 | Phase 2 = 외부 BI, Phase 3 = 제품 내 admin 메뉴 | 단계적 도입으로 코드 부담 최소화 |
| RLS 정책 | academies는 admin + 학원 본인만 SELECT | 영업 데이터 보호 |
