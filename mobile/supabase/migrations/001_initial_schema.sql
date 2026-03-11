-- ArtPrep 초기 스키마
-- Supabase Dashboard > SQL Editor에서 실행

-- user_goals
CREATE TABLE user_goals (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  target_university TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  artwork_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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

CREATE INDEX idx_artworks_university ON artworks(university);
CREATE INDEX idx_artworks_artwork_type ON artworks(artwork_type);
CREATE INDEX idx_artworks_region ON artworks(region);

-- analysis_reports
CREATE TABLE analysis_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE NOT NULL UNIQUE,
  intention TEXT,
  school_tendency TEXT,
  form_elements JSONB,
  evaluation_fit TEXT,
  score INTEGER,
  summary TEXT,
  improvement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- saved_artworks
CREATE TABLE saved_artworks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, artwork_id)
);

-- RLS 활성화
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_artworks ENABLE ROW LEVEL SECURITY;

-- user_goals 정책
CREATE POLICY "user_goals_own" ON user_goals
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- saved_artworks 정책
CREATE POLICY "saved_artworks_own" ON saved_artworks
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- artworks 정책 (인증 사용자 읽기)
CREATE POLICY "artworks_read" ON artworks
  FOR SELECT USING (auth.role() = 'authenticated');

-- analysis_reports 정책 (인증 사용자 읽기)
CREATE POLICY "analysis_reports_read" ON analysis_reports
  FOR SELECT USING (auth.role() = 'authenticated');

-- Storage 버킷
INSERT INTO storage.buckets (id, name, public) VALUES ('artworks', 'artworks', false);

CREATE POLICY "artworks_storage_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'artworks' AND auth.role() = 'authenticated');

CREATE POLICY "artworks_storage_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'artworks' AND auth.role() = 'service_role');
