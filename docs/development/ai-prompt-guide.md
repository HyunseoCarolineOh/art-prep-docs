# AI 프롬프트 가이드 — Gemini 5단계 분석

**최종 업데이트**: 2026-03-14
**담당**: 오현서 (CEO)

---

## 개요

ArtPrep의 핵심 기능인 Gemini 기반 실기자료 5단계 분석 프롬프트 가이드입니다.
Supabase Edge Function (`supabase/functions/analyze-artwork/`)에서 사용합니다.

- **모델**: `gemini-2.0-flash`
- **이미지 처리**: 이미지 URL → base64 변환 후 `inline_data`로 전달

---

## 5단계 분석 프레임워크

```
1단계: 출제의도 분석    → 이 문제가 학생에게 요구하는 핵심 과제는 무엇인가
2단계: 학교 성향 분석  → 해당 대학은 어떤 표현 스타일을 선호하는가
3단계: 조형요소 분석   → 구도/형태/색채/표현력 각각의 수준은 어떤가
4단계: 평가기준 부합도 → 이 작품이 합격 기준에 얼마나 부합하는가
5단계: 종합 리포트     → 정량 점수 + 강점/약점 + 구체적 개선 방향
```

---

## 시스템 프롬프트 (System Instruction)

```
당신은 15년 경력의 미대입시 전문 강사이자 AI 분석 전문가입니다.
실기자료(회화, 소묘, 디자인 등)를 분석하여 수험생에게 객관적이고 실질적인 피드백을 제공합니다.

분석 원칙:
1. 객관적 평가: 주관적 취향이 아닌 대학별 합격 데이터와 평가 기준에 근거
2. 구체적 근거: 모든 평가에 이유와 근거 제시
3. 건설적 피드백: 약점 지적보다 개선 방향 중심
4. 수험생 눈높이: 고등학생 수준에서 이해 가능한 언어 사용

출력 형식: 반드시 JSON으로 응답
```

---

## 사용자 프롬프트 (User Prompt)

```
다음 실기자료를 5단계로 분석해주세요.

## 작품 정보
- 목표 대학: {university}
- 전형: {exam_type} (수시/정시)
- 실기 유형: {artwork_type}
- 제작 연도: {year}

## 분석 요청

**1단계 - 출제의도 분석**
이 실기 유형({artwork_type})에서 {university}가 수험생에게 요구하는 핵심 과제를 분석하세요.
(3~5문장)

**2단계 - 학교 성향 분석**
{university}의 채점 선호도와 표현 스타일 패턴을 분석하세요.
- 선호하는 표현 방식
- 중점을 두는 평가 항목
(3~5문장)

**3단계 - 조형요소 분석**
다음 4가지 항목을 각각 0~100점으로 평가하고 구체적인 코멘트를 제공하세요:
- 구도 (composition): 화면 배치, 균형감, 공간 활용
- 형태 (form): 대상 묘사의 정확도, 입체감, 비례
- 색채 (color): 색조, 채도, 명도 대비, 색의 조화
- 표현력 (expression): 필치, 재료 활용, 개성

**4단계 - 평가기준 부합도**
{university} {exam_type} 합격 기준 대비 이 작품의 부합도를 분석하세요.
- 잘 부합하는 점
- 보완이 필요한 점
(4~6문장)

**5단계 - 종합 리포트**
- 종합 점수 (0~100): 합격 가능성 기준
- 핵심 강점 (3개): 유지하고 강화해야 할 점
- 핵심 약점 (3개): 반드시 개선해야 할 점
- 개선 방향: 실제로 실행 가능한 구체적 연습 방법 (3~5가지)

## 응답 형식 (반드시 JSON)
{
  "intention": "1단계 출제의도 분석 텍스트",
  "school_tendency": "2단계 학교 성향 분석 텍스트",
  "form_elements": {
    "composition": { "score": 85, "comment": "구도 평가 코멘트" },
    "form": { "score": 78, "comment": "형태 평가 코멘트" },
    "color": { "score": 90, "comment": "색채 평가 코멘트" },
    "expression": { "score": 82, "comment": "표현력 평가 코멘트" }
  },
  "evaluation_fit": "4단계 평가기준 부합도 텍스트",
  "score": 84,
  "summary": "종합 강점/약점 요약 (3~4문장)",
  "improvement": "구체적 개선 방향 텍스트"
}
```

---

## Edge Function 구현 코드

```typescript
// supabase/functions/analyze-artwork/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

serve(async (req) => {
  // CORS 헤더
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { artwork_id } = await req.json()

    // 1. 작품 정보 조회
    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', artwork_id)
      .single()

    if (artworkError || !artwork) {
      return new Response(JSON.stringify({ error: '작품을 찾을 수 없습니다.' }), { status: 404 })
    }

    // 2. 이미 분석된 경우 캐시 반환
    const { data: existing } = await supabase
      .from('analysis_reports')
      .select('*')
      .eq('artwork_id', artwork_id)
      .single()

    if (existing) {
      return new Response(JSON.stringify({ success: true, report: existing }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3. 이미지 → base64 변환 (Gemini inline_data 방식)
    const imageRes = await fetch(artwork.image_url)
    const imageBuffer = await imageRes.arrayBuffer()
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
    const mimeType = imageRes.headers.get('content-type') ?? 'image/jpeg'

    // 4. Gemini API 호출
    const prompt = buildPrompt(artwork)

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
          ],
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 2000,
        },
      }),
    })

    const geminiData = await geminiResponse.json()
    const reportData = JSON.parse(geminiData.candidates[0].content.parts[0].text)

    // 5. DB에 저장
    const { data: report, error: insertError } = await supabase
      .from('analysis_reports')
      .insert({ artwork_id, ...reportData })
      .select()
      .single()

    if (insertError) throw insertError

    return new Response(JSON.stringify({ success: true, report }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})

const SYSTEM_PROMPT = `당신은 15년 경력의 미대입시 전문 강사이자 AI 분석 전문가입니다.
실기자료를 분석하여 수험생에게 객관적이고 실질적인 피드백을 제공합니다.
반드시 JSON 형식으로 응답하세요.`

function buildPrompt(artwork: any): string {
  return `
다음 실기자료를 5단계로 분석해주세요.

작품 정보:
- 목표 대학: ${artwork.university}
- 전형: ${artwork.exam_type}
- 실기 유형: ${artwork.artwork_type}
- 제작 연도: ${artwork.year || '미상'}

[이하 5단계 분석 요청 — 위 프롬프트 참조]

반드시 다음 JSON 형식으로만 응답:
{
  "intention": "...",
  "school_tendency": "...",
  "form_elements": {
    "composition": { "score": 0~100, "comment": "..." },
    "form": { "score": 0~100, "comment": "..." },
    "color": { "score": 0~100, "comment": "..." },
    "expression": { "score": 0~100, "comment": "..." }
  },
  "evaluation_fit": "...",
  "score": 0~100,
  "summary": "...",
  "improvement": "..."
}
  `
}
```

---

## 프롬프트 테스트 기준

### 테스트 시나리오
| 시나리오 | 기대 결과 |
|---------|---------|
| 서울대 동양화 소묘 | 세필 묘사력, 여백 활용에 중점 |
| 홍익대 기초디자인 | 조형 완성도, 반복 패턴 분석 |
| 이화여대 채색 | 색채 조화, 재료 특성 분석 |

### 품질 기준 (95% 정확도 달성 기준)
- [ ] 학교별 특성이 실제 합격 데이터와 일치
- [ ] 점수가 실제 합격/불합격과 80% 이상 상관관계
- [ ] 개선 방향이 구체적이고 실행 가능
- [ ] 응답 JSON 파싱 오류 0%

---

## 비용 최적화

| 항목 | 예상 비용 |
|------|----------|
| Gemini 2.0 Flash 입력 (텍스트 1000 tokens) | $0.000075 |
| Gemini 2.0 Flash 이미지 (1장) | $0.0002~0.001 |
| 작품 1건당 분석 비용 | 약 $0.001~0.003 |
| 캐싱으로 절약 | 동일 작품 재분석 없음 |

**무료 티어 한도**: Supabase Edge Function 500K req/월, Gemini API 무료 티어 15 req/분
→ MVP 파일럿 100명 기준 여유 충분
