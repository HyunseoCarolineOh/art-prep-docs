# Technical Spec — ArtPrep MVP

**최종 업데이트**: 2026-03-11

---

## 1. 기술 스택

| 항목 | 기술 | 버전 |
|------|------|------|
| 모바일 | Expo (React Native) | SDK 51+ |
| 언어 | TypeScript | 5.x |
| 라우팅 | Expo Router | v3 |
| 백엔드 | Supabase | 최신 |
| DB | PostgreSQL (Supabase) | 15 |
| 인증 | Supabase Auth | — |
| 이미지 저장 | Supabase Storage | — |
| AI | OpenAI GPT-4 Vision | gpt-4o |
| Edge Function | Deno (Supabase) | — |

---

## 2. 환경변수 (.env.local)

```env
EXPO_PUBLIC_SUPABASE_URL=https://[프로젝트ID].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[anon key]
```

> Edge Function에서는 Supabase 대시보드의 Secrets에 `OPENAI_API_KEY` 설정

---

## 3. DB 스키마

### user_goals
```sql
CREATE TABLE user_goals (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  target_university TEXT NOT NULL,
  exam_type TEXT NOT NULL,      -- '수시' | '정시'
  artwork_type TEXT NOT NULL,   -- '소묘' | '채색' | '발상과표현' | '기초디자인' 등
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### artworks
```sql
CREATE TABLE artworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  university TEXT NOT NULL,
  region TEXT NOT NULL,         -- '서울' | '경기' | '지방'
  exam_type TEXT NOT NULL,      -- '수시' | '정시'
  artwork_type TEXT NOT NULL,
  year INTEGER,
  tags TEXT[],
  success_score INTEGER DEFAULT 0,  -- 0~100, 합격 기여도
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artworks_university ON artworks(university);
CREATE INDEX idx_artworks_artwork_type ON artworks(artwork_type);
CREATE INDEX idx_artworks_region ON artworks(region);
```

### analysis_reports
```sql
CREATE TABLE analysis_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE NOT NULL UNIQUE,
  intention TEXT,            -- 1단계: 출제의도
  school_tendency TEXT,      -- 2단계: 학교 성향
  form_elements JSONB,       -- 3단계: 조형요소 (아래 JSONB 구조 참조)
  evaluation_fit TEXT,       -- 4단계: 평가기준 부합도
  score INTEGER,             -- 5단계: 종합 점수 0~100
  summary TEXT,              -- 강점/약점 요약
  improvement TEXT,          -- 개선 방향
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- form_elements JSONB 구조 예시:
-- {
--   "composition": { "score": 85, "comment": "안정적인 삼각구도" },
--   "form": { "score": 78, "comment": "입체감 표현 우수" },
--   "color": { "score": 90, "comment": "채도 대비 효과적" },
--   "expression": { "score": 82, "comment": "붓터치 리듬감 좋음" }
-- }
```

### saved_artworks
```sql
CREATE TABLE saved_artworks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, artwork_id)
);
```

---

## 4. Row Level Security (RLS)

```sql
-- user_goals: 본인만 CRUD
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_goals_own" ON user_goals
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- saved_artworks: 본인만 CRUD
ALTER TABLE saved_artworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_artworks_own" ON saved_artworks
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- artworks: 인증 사용자 읽기 전용
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "artworks_read" ON artworks
  FOR SELECT USING (auth.role() = 'authenticated');

-- analysis_reports: 인증 사용자 읽기 전용
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analysis_reports_read" ON analysis_reports
  FOR SELECT USING (auth.role() = 'authenticated');
```

---

## 5. Supabase Storage

**버킷 이름**: `artworks`
**접근 정책**: 인증 사용자 읽기 전용

```sql
-- Storage 버킷 생성 (Supabase 대시보드에서 또는 SQL)
INSERT INTO storage.buckets (id, name, public) VALUES ('artworks', 'artworks', false);

-- 인증 사용자 읽기
CREATE POLICY "artworks_storage_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'artworks' AND auth.role() = 'authenticated');

-- 서비스 롤만 업로드 (관리자용)
CREATE POLICY "artworks_storage_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'artworks' AND auth.role() = 'service_role');
```

---

## 6. Edge Function: analyze-artwork

**경로**: `supabase/functions/analyze-artwork/index.ts`
**트리거**: 앱에서 POST 요청

### 요청/응답 형식

```typescript
// 요청
POST /functions/v1/analyze-artwork
Authorization: Bearer [user JWT]
Content-Type: application/json

{
  "artwork_id": "uuid",
  "image_url": "https://..."
}

// 응답
{
  "success": true,
  "report": {
    "intention": "...",
    "school_tendency": "...",
    "form_elements": { ... },
    "evaluation_fit": "...",
    "score": 82,
    "summary": "...",
    "improvement": "..."
  }
}
```

### Edge Function 코드 구조
```typescript
// supabase/functions/analyze-artwork/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { artwork_id, image_url } = await req.json()

  // 이미 분석된 경우 캐시 반환
  // OpenAI GPT-4o Vision API 호출
  // 결과를 analysis_reports 테이블에 저장
  // 응답 반환
})
```

→ 상세 프롬프트는 `docs/ai-prompt-guide.md` 참조

---

## 7. Supabase 클라이언트 설정

```typescript
// mobile/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppState } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// 앱이 foreground로 돌아올 때 세션 갱신
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})
```

---

## 8. 주요 API 패턴

### 작품 큐레이션 조회 (필터링)
```typescript
const { data, error } = await supabase
  .from('artworks')
  .select('*, analysis_reports(score)')
  .eq('artwork_type', userGoal.artwork_type)
  .eq('university', userGoal.target_university)
  .order('success_score', { ascending: false })
  .range(from, to)  // 무한스크롤 페이지네이션
```

### 작품 저장/해제
```typescript
// 저장
await supabase.from('saved_artworks').insert({ user_id, artwork_id })

// 해제
await supabase.from('saved_artworks')
  .delete()
  .match({ user_id, artwork_id })
```

### AI 분석 요청 (Edge Function 호출)
```typescript
const { data, error } = await supabase.functions.invoke('analyze-artwork', {
  body: { artwork_id, image_url }
})
```

---

## 9. 폴더 구조 상세

```
mobile/
├── app/
│   ├── _layout.tsx              ← 루트 레이아웃 (인증 체크)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (onboarding)/
│   │   ├── _layout.tsx
│   │   └── goals.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx          ← 탭 네비게이션 정의
│   │   ├── index.tsx            ← 홈 (큐레이션)
│   │   ├── saved.tsx            ← 저장함
│   │   └── settings.tsx         ← 설정
│   └── artwork/
│       └── [id].tsx             ← 작품 상세 (동적 라우트)
├── components/
│   ├── ArtworkCard.tsx          ← 작품 카드 컴포넌트
│   ├── FilterChip.tsx           ← 필터 칩
│   ├── AnalysisReport.tsx       ← 5단계 분석 리포트 컴포넌트
│   └── LoadingSpinner.tsx
├── lib/
│   ├── supabase.ts              ← Supabase 클라이언트
│   └── types.ts                 ← TypeScript 타입 정의
├── hooks/
│   ├── useArtworks.ts           ← 작품 데이터 훅
│   ├── useAuth.ts               ← 인증 상태 훅
│   └── useSaved.ts              ← 저장함 훅
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql
    └── functions/
        └── analyze-artwork/
            └── index.ts
```

---

## 10. TypeScript 타입 정의

```typescript
// mobile/lib/types.ts

export type Artwork = {
  id: string
  image_url: string
  university: string
  region: string
  exam_type: string
  artwork_type: string
  year: number | null
  tags: string[]
  success_score: number
  analysis_reports?: AnalysisReport[]
}

export type AnalysisReport = {
  id: string
  artwork_id: string
  intention: string
  school_tendency: string
  form_elements: {
    composition: { score: number; comment: string }
    form: { score: number; comment: string }
    color: { score: number; comment: string }
    expression: { score: number; comment: string }
  }
  evaluation_fit: string
  score: number
  summary: string
  improvement: string
}

export type UserGoal = {
  user_id: string
  target_university: string
  exam_type: string
  artwork_type: string
}

export type SavedArtwork = {
  user_id: string
  artwork_id: string
  artworks?: Artwork
}
```
