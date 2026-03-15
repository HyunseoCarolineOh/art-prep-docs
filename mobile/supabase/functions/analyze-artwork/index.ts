import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `당신은 15년 경력의 미대입시 전문 강사이자 AI 분석 전문가입니다.
실기자료를 분석하여 수험생에게 객관적이고 실질적인 피드백을 제공합니다.
반드시 JSON 형식으로 응답하세요.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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
      return new Response(
        JSON.stringify({ error: '작품을 찾을 수 없습니다.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. 캐시 확인 (이미 분석된 경우 반환)
    const { data: existing } = await supabase
      .from('analysis_reports')
      .select('*')
      .eq('artwork_id', artwork_id)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ success: true, report: existing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API 오류: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const reportData = JSON.parse(geminiData.candidates[0].content.parts[0].text)

    // 5. DB 저장
    const { data: report, error: insertError } = await supabase
      .from('analysis_reports')
      .insert({ artwork_id, ...reportData })
      .select()
      .single()

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ success: true, report }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function buildPrompt(artwork: Record<string, unknown>): string {
  return `
다음 실기자료를 5단계로 분석해주세요.

작품 정보:
- 목표 대학: ${artwork.university}
- 전형: ${artwork.exam_type}
- 실기 유형: ${artwork.artwork_type}
- 제작 연도: ${artwork.year ?? '미상'}

1단계: 출제의도 분석 (3~5문장)
2단계: 학교 성향 분석 (3~5문장)
3단계: 조형요소 — 구도/형태/색채/표현력 각각 0~100점 + 코멘트
4단계: 평가기준 부합도 (4~6문장)
5단계: 종합 점수(0~100) + 강점/약점 요약 + 구체적 개선 방향

반드시 아래 JSON 형식으로만 응답:
{
  "intention": "출제의도 분석 텍스트",
  "school_tendency": "학교 성향 분석 텍스트",
  "form_elements": {
    "composition": { "score": 85, "comment": "코멘트" },
    "form": { "score": 78, "comment": "코멘트" },
    "color": { "score": 90, "comment": "코멘트" },
    "expression": { "score": 82, "comment": "코멘트" }
  },
  "evaluation_fit": "평가기준 부합도 텍스트",
  "score": 84,
  "summary": "강점/약점 요약",
  "improvement": "구체적 개선 방향"
}
  `
}
