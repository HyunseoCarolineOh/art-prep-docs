# ArtPrep MVP 전체 설계 문서

**작성일**: 2026-03-11
**작성자**: 오현서 (CEO)
**상태**: 확정 (Phase 0 진행 중)

---

## 1. 서비스 개요

### 문제 정의
미대입시생은 수백만 원을 학원에 쓰면서도 "내 실기가 목표 대학 기준에 맞는지" 객관적으로 알 수 없다. 강사의 주관적 피드백에만 의존하며, 합격 데이터를 체계적으로 분석한 참고 자료가 없다.

### 해결책
1만건 이상의 실제 합격 데이터를 GPT-4로 분석하여, 목표 대학/전형/실기 유형에 맞는 참고작을 10초 안에 추천 + 5단계 AI 분석 리포트 제공.

### 핵심 지표 (MVP 목표)
| 지표 | 목표 |
|------|------|
| 파일럿 사용자 | 100명 (2026년 6월) |
| 반복 사용률 | 40% 이상 |
| 전환율 | 25% 이상 유지 |
| AI 분석 정확도 | 95% (Fine-Tuning 후) |

---

## 2. 아키텍처 결정

### 선택: Expo + Supabase (서버리스)

**이유**:
- CEO가 코딩 없이 Claude와 협업하여 개발 가능
- iOS + Android 동시 개발 (단일 코드베이스)
- Supabase가 백엔드 역할 전담 → 별도 서버 불필요
- 무료 티어로 MVP 비용 거의 0원

**아키텍처 다이어그램**:
```
사용자 (iOS / Android)
    ↓
Expo (React Native) — 모바일 앱
    ↓
Supabase
    ├── Auth          — 이메일/소셜 로그인
    ├── PostgreSQL    — 작품·사용자·분석 데이터
    ├── Storage       — 실기 이미지 저장
    └── Edge Functions → OpenAI GPT-4 API
```

---

## 3. MVP 범위

### 포함 기능
| 기능 | 설명 |
|------|------|
| 회원가입 / 로그인 | 이메일 + 비밀번호 (Supabase Auth) |
| 목표 설정 | 목표 대학, 전형, 실기 유형 선택 |
| 큐레이션 리스트 | 목표 기반 필터링, 무한스크롤 |
| AI 분석 리포트 | 5단계 분석 (GPT-4) |
| 저장함 | 즐겨찾기 저장·조회 |

### 제외 기능 (V2 이후)
- 개인화 추천 알고리즘
- B2B 학원 리포트
- 결제 시스템
- 사용자 행동 데이터 수집·분석
- 소셜 로그인 (카카오, Apple)

---

## 4. 화면 구성

### 화면 플로우
```
앱 실행
  ↓
온보딩 (최초 1회)
  └── 목표설정: 대학 → 전형 → 실기유형 선택
        ↓
[탭 네비게이션]
  ├── 홈 (큐레이션)
  │     ├── 필터 (유형/지역)
  │     ├── 작품 리스트 (무한스크롤)
  │     └── 작품 탭 → 상세 화면
  ├── 저장함
  │     └── 저장한 작품 목록
  └── 설정
        ├── 목표 재설정
        └── 계정 관리 (로그아웃)
```

### 5개 화면 상세

#### 화면 1: 온보딩/목표설정
- **파일**: `app/(onboarding)/goals.tsx`
- **단계**: 대학 선택 → 전형 선택 → 실기 유형 선택 → 저장
- **저장 위치**: `user_goals` 테이블

#### 화면 2: 홈 (큐레이션)
- **파일**: `app/(tabs)/index.tsx`
- **구성**: 상단 필터 칩 (실기유형, 지역), 작품 카드 그리드, 무한스크롤
- **데이터**: `artworks` 테이블에서 목표 기반 필터링

#### 화면 3: 작품 상세
- **파일**: `app/artwork/[id].tsx`
- **구성**: 이미지 전체 보기, AI 5단계 분석 리포트, 저장 버튼
- **데이터**: `artworks` + `analysis_reports` JOIN

#### 화면 4: 저장함
- **파일**: `app/(tabs)/saved.tsx`
- **구성**: 저장한 작품 리스트, 삭제 기능
- **데이터**: `saved_artworks` JOIN `artworks`

#### 화면 5: 설정
- **파일**: `app/(tabs)/settings.tsx`
- **구성**: 현재 목표 표시, 목표 재설정 버튼, 로그아웃
- **데이터**: `user_goals`, Supabase Auth

---

## 5. 데이터 모델

### ERD (Entity Relationship)
```
auth.users (Supabase 자동 생성)
  ↓ 1:1
user_goals
  user_id (FK → auth.users)
  target_university     TEXT
  exam_type             TEXT
  artwork_type          TEXT
  created_at            TIMESTAMPTZ

artworks
  id                    UUID PK
  image_url             TEXT        (Supabase Storage URL)
  university            TEXT
  region                TEXT        (서울, 경기, 지방 등)
  exam_type             TEXT
  artwork_type          TEXT
  year                  INTEGER
  tags                  TEXT[]
  success_score         INTEGER     (합격 기여도 0~100)
  created_at            TIMESTAMPTZ

analysis_reports
  id                    UUID PK
  artwork_id            UUID FK → artworks
  intention             TEXT        (출제의도 분석)
  school_tendency       TEXT        (학교 성향 분석)
  form_elements         JSONB       (구도, 형태, 색채, 표현력)
  evaluation_fit        TEXT        (평가기준 부합도)
  score                 INTEGER     (정량 점수 0~100)
  created_at            TIMESTAMPTZ

saved_artworks
  user_id               UUID FK → auth.users
  artwork_id            UUID FK → artworks
  created_at            TIMESTAMPTZ
  PRIMARY KEY (user_id, artwork_id)
```

### SQL 스키마 (Supabase에서 실행)
```sql
-- user_goals
CREATE TABLE user_goals (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  target_university TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  artwork_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- artworks
CREATE TABLE artworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  university TEXT NOT NULL,
  region TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  artwork_type TEXT NOT NULL,
  year INTEGER,
  tags TEXT[],
  success_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- analysis_reports
CREATE TABLE analysis_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE NOT NULL,
  intention TEXT,
  school_tendency TEXT,
  form_elements JSONB,
  evaluation_fit TEXT,
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- saved_artworks
CREATE TABLE saved_artworks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, artwork_id)
);

-- RLS (Row Level Security) 활성화
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_artworks ENABLE ROW LEVEL SECURITY;

-- user_goals: 본인만 읽기/쓰기
CREATE POLICY "user_goals_own" ON user_goals
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- saved_artworks: 본인만 읽기/쓰기
CREATE POLICY "saved_artworks_own" ON saved_artworks
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- artworks: 모든 인증 사용자 읽기
CREATE POLICY "artworks_read" ON artworks
  FOR SELECT USING (auth.role() = 'authenticated');

-- analysis_reports: 모든 인증 사용자 읽기
CREATE POLICY "analysis_reports_read" ON analysis_reports
  FOR SELECT USING (auth.role() = 'authenticated');
```

---

## 6. AI 분석 엔진

### GPT-4 호출 방식
- **위치**: Supabase Edge Function (`supabase/functions/analyze-artwork/`)
- **트리거**: 작품 상세 화면 진입 시 (분석 결과 없는 경우)
- **캐싱**: 분석 결과는 `analysis_reports` 테이블에 저장 → 재분석 없음

### 5단계 분석 프로세스
```
1단계: 출제의도 분석    → 문제가 요구하는 핵심 과제
2단계: 학교 성향 분석  → 해당 대학의 채점 선호도 패턴
3단계: 조형요소 분석   → 구도/형태/색채/표현력 각각 평가
4단계: 평가기준 부합도 → 합격 기준 대비 일치도
5단계: 종합 리포트     → 정량 점수 + 강점/약점 + 개선 방향
```

자세한 프롬프트 → `docs/ai-prompt-guide.md` 참조

---

## 7. 개발 로드맵 상세

### Phase 0: 셋업 (3월 2주)
- [ ] Node.js 설치
- [ ] Expo CLI 설치 + 프로젝트 초기화
- [ ] Supabase 프로젝트 생성 + DB 스키마 실행
- [ ] GitHub 연동
- [ ] `.env.local` 환경변수 설정
- [ ] `npx expo start` → 폰에서 확인

### Phase 1: 인증 + 온보딩 (3월 3~4주)
- [ ] 로그인 화면 (`app/(auth)/login.tsx`)
- [ ] 회원가입 화면 (`app/(auth)/signup.tsx`)
- [ ] Supabase Auth 연동
- [ ] 온보딩 목표설정 화면
- [ ] `user_goals` 테이블에 저장

### Phase 2: 큐레이션 (4월 1~3주)
- [ ] 홈 화면 — 작품 리스트 표시
- [ ] 필터 기능 (실기유형, 지역)
- [ ] 무한스크롤
- [ ] 저장 버튼 (saved_artworks 연동)
- [ ] 샘플 데이터 10건 Supabase에 직접 입력

### Phase 3: AI 분석 (4월 4주~5월)
- [ ] 작품 상세 화면
- [ ] Supabase Edge Function 작성 (GPT-4 호출)
- [ ] 5단계 분석 리포트 UI
- [ ] 분석 결과 캐싱 로직

### Phase 4: 마무리 (6월)
- [ ] 저장함 화면 완성
- [ ] 설정 화면 (목표 재설정, 로그아웃)
- [ ] 버그 픽스 + UX 개선
- [ ] TestFlight (iOS) + Google Play 내부 테스트 배포
- [ ] 파일럿 100명 모집 시작

---

## 8. 위험 요소 및 대응

| 위험 | 가능성 | 대응 |
|------|--------|------|
| 데이터 태깅 지연 | 높음 | data-tagging-guide 기준 명확화 + 외주 가능성 검토 |
| GPT-4 비용 초과 | 중간 | 분석 결과 캐싱 필수, 무료 티어 한도 모니터링 |
| 앱 스토어 심사 거절 | 낮음 | Phase 4 초반에 일찍 제출, 여유 시간 확보 |
| 개발자 채용 지연 | 중간 | Phase 0~3은 CEO + Claude로 진행, Phase 4에서 개발자 없어도 TestFlight 가능 |

---

## 9. 관련 문서

- `docs/technical-spec.md` — DB 스키마 상세, API 엔드포인트
- `docs/ai-prompt-guide.md` — GPT-4 5단계 분석 프롬프트
- `docs/data-tagging-guide.md` — 작품 메타데이터 입력 기준
- `docs/ux-screen-flow.md` — 화면별 동작 명세
