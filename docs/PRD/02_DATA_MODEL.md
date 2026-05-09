# 02 DATA MODEL — 데이터 모델

> ArtPrep v1.0 | 작성일: 2026-03-18 | DB: Supabase (PostgreSQL)

---

## 1. ERD 관계

```
[User] --1:N--> [SavedItem] --N:1--> [Artwork]
[User] --1:N--> [CurationSession]
```

- User는 여러 SavedItem을 가질 수 있다.
- User는 여러 CurationSession을 가질 수 있다.
- SavedItem은 하나의 Artwork를 참조한다.
- Artwork는 관리자가 등록하는 read-only 데이터이다.

---

## 2. 엔티티 상세

### User

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT auth.uid(),
  email       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  -- 구독
  subscription_status  TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),

  -- 큐레이션 프로필
  target_schools   TEXT[],           -- 예: ['서울대', '홍익대', '국민대']
  preferred_type   TEXT              -- 예: '소묘', '수채화'
);
```

**예시값**
```json
{
  "id": "uuid-user-001",
  "email": "student@example.com",
  "subscription_status": "free",
  "target_schools": ["홍익대", "국민대"],
  "preferred_type": "소묘"
}
```

---

### Artwork

> **READ-ONLY** — 관리자만 등록/수정 가능. 코드에서 직접 INSERT/UPDATE/DELETE 금지.

```sql
CREATE TABLE artworks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  -- 이미지
  image_url   TEXT NOT NULL,   -- Supabase Storage URL

  -- 분류
  school      TEXT NOT NULL,   -- 예: '홍익대'
  exam_type   TEXT NOT NULL,   -- 예: '소묘', '수채화', '정물화'
  region      TEXT,            -- 예: '서울', '경기'
  pass_year   INTEGER,         -- 예: 2024

  -- 태그
  tags        TEXT[]           -- 예: ['인물', '전신', '연필']
);
```

**예시값**
```json
{
  "id": "uuid-artwork-001",
  "image_url": "https://xxx.supabase.co/storage/v1/object/public/artworks/홍익대_소묘_2024_001.jpg",
  "school": "홍익대",
  "exam_type": "소묘",
  "region": "서울",
  "pass_year": 2024,
  "tags": ["인물", "전신", "연필"]
}
```

---

### SavedItem

```sql
CREATE TABLE saved_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artwork_id  UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,

  UNIQUE(user_id, artwork_id)   -- 중복 저장 방지
);
```

**예시값**
```json
{
  "id": "uuid-saved-001",
  "user_id": "uuid-user-001",
  "artwork_id": "uuid-artwork-001",
  "created_at": "2026-03-18T10:00:00Z"
}
```

---

### CurationSession

```sql
CREATE TABLE curation_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ DEFAULT NOW(),

  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filter_params JSONB NOT NULL,   -- 큐레이션 요청 파라미터
  result_ids    UUID[]            -- 추천된 artwork id 목록 (Top10)
);
```

**filter_params 예시**
```json
{
  "target_schools": ["홍익대", "국민대"],
  "exam_type": "소묘",
  "level": "중급",
  "pass_year_range": [2022, 2024]
}
```

**전체 예시값**
```json
{
  "id": "uuid-session-001",
  "user_id": "uuid-user-001",
  "filter_params": {
    "target_schools": ["홍익대"],
    "exam_type": "소묘",
    "level": "중급"
  },
  "result_ids": ["uuid-artwork-001", "uuid-artwork-002"],
  "created_at": "2026-03-18T10:00:00Z"
}
```

---

## 3. RLS (Row Level Security) 정책

> **모든 테이블에 RLS 적용 필수.** RLS 없는 테이블 생성 금지.

```sql
-- users: 본인만 조회/수정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_self_only" ON users
  USING (id = auth.uid());

-- artworks: 모든 인증 사용자 조회 가능 (read-only)
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "artworks_read_all" ON artworks
  FOR SELECT USING (true);

-- saved_items: 본인 데이터만
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_items_self_only" ON saved_items
  USING (user_id = auth.uid());

-- curation_sessions: 본인 데이터만
ALTER TABLE curation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "curation_sessions_self_only" ON curation_sessions
  USING (user_id = auth.uid());
```

---

## 4. Phase 2 추가 예정

### AnalysisReport (Phase 2)

```sql
CREATE TABLE analysis_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,   -- 사용자가 업로드한 본인 작품

  -- 5단계 분석 결과 (비전 AI)
  step1       JSONB,   -- 구도 분석
  step2       JSONB,   -- 명암 분석
  step3       JSONB,   -- 선 품질 분석
  step4       JSONB,   -- 완성도 분석
  step5       JSONB    -- 합격 가능성 종합
);
```

---

## 5. Supabase Storage 버킷 구조

```
artworks/           -- 합격 DB 이미지 (관리자 업로드, public)
  ├── 홍익대_소묘_2024_001.jpg
  └── ...

user-uploads/       -- 사용자 본인 작품 (Phase 2, private)
  └── {user_id}/
```
