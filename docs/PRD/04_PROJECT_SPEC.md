# 04 PROJECT SPEC — 프로젝트 스펙 (AI 행동 규칙)

> ArtPrep v1.0 | 작성일: 2026-03-18
> **이 문서는 Claude Code의 코딩 행동 규칙입니다. 모든 규칙을 반드시 준수하세요.**

---

## 1. 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | **Next.js 15 (App Router)** | 반응형 웹앱 + SSR + 모바일 최적화 |
| 언어 | **JavaScript** (TypeScript 사용 안 함) | 빠른 개발, TS 설정 오버헤드 제거 |
| UI 컴포넌트 | **shadcn/ui** | 고품질 접근성 컴포넌트, Tailwind 기반 |
| 스타일링 | **Tailwind CSS** | 빠른 반응형 UI, shadcn/ui 기본 시스템 |
| DB/백엔드 | **Supabase** (PostgreSQL + Storage + Auth) | 서버리스, RLS, Realtime, 무료 시작 |
| AI | **Gemini 2.0 Flash API** | 이미지 Vision + 비용 효율 (종량제) |
| 배포 | **Vercel** | Next.js 공식 지원, 자동 CI/CD |

---

## 2. 환경변수

> 모든 환경변수는 `.env.local`에 저장. 코드에 직접 작성 절대 금지.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # 서버사이드(API Route)에서만 사용

# AI
GEMINI_API_KEY=
```

**규칙**
- `NEXT_PUBLIC_` 접두사: 클라이언트 사이드에서 사용 가능
- `SUPABASE_SERVICE_ROLE_KEY`: 절대 클라이언트에 노출 금지 (서버 전용)
- `GEMINI_API_KEY`: 서버사이드 API Route에서만 호출

---

## 3. 프로젝트 구조

```
art-prep/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 인증 페이지 그룹
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/             # 메인 페이지 그룹
│   │   ├── explore/        # 합격 DB 탐색
│   │   ├── curate/         # AI 큐레이션
│   │   └── saved/          # 저장 보드
│   ├── api/                # API Routes (서버사이드)
│   │   └── curate/         # Gemini API 호출
│   └── layout.js
├── components/             # 재사용 컴포넌트
│   ├── ui/                 # shadcn/ui 컴포넌트
│   └── artwork/            # 작품 관련 컴포넌트
├── lib/
│   ├── supabase/           # Supabase 클라이언트
│   └── gemini/             # Gemini API 래퍼
├── .env.local              # 환경변수 (gitignore)
└── docs/PRD/               # 이 문서들
```

---

## 4. ❌ DO NOT — 절대 하지 마

1. **API 키/비밀번호를 코드에 직접 삽입하지 마라**
   - 항상 `.env.local` 사용. `SUPABASE_SERVICE_ROLE_KEY`는 클라이언트 절대 금지.

2. **기존 DB 스키마를 임의로 변경하지 마라**
   - 스키마 변경 시 반드시 마이그레이션 파일 먼저 작성 후 적용.

3. **목업/하드코딩 데이터로 완성 처리하지 마라**
   - 실제 Supabase 연동 없이 하드코딩된 배열로 완료했다고 보고하지 않는다.

4. **RLS 정책 없는 테이블을 생성하지 마라**
   - 모든 테이블에 `ENABLE ROW LEVEL SECURITY` + 정책 필수.

5. **Artwork 테이블에 직접 INSERT/UPDATE/DELETE하지 마라**
   - 합격 DB는 read-only. 관리자 전용 루트 외 접근 불가.

6. **결제 코드를 Phase 1에서 구현하지 마라**
   - 결제는 Phase 2. Phase 1에서 결제 관련 코드, 테이블, 라우트 생성 금지.

7. **TypeScript로 코드를 작성하지 마라**
   - 이 프로젝트는 JavaScript 전용. `.ts`, `.tsx` 파일 생성 금지.

8. **모바일 미지원 레이아웃을 만들지 마라**
   - 모든 UI는 모바일 first. `sm:`, `md:` breakpoint 이후 데스크탑 확장.

---

## 5. ✅ ALWAYS DO — 항상 해야 할 것

1. **코드 작성 전 계획을 먼저 설명하라**
   - 어떤 파일을 수정하고, 어떤 로직을 추가할지 설명 후 승인 받고 진행.

2. **환경변수는 반드시 `.env.local`에 저장하라**
   - 새 환경변수 추가 시 `.env.local.example`도 함께 업데이트.

3. **모바일 반응형 디자인을 적용하라 (모바일 first)**
   - Tailwind 기본 클래스 = 모바일, `md:` 이후 = 데스크탑.

4. **Supabase RLS 정책을 항상 확인하라**
   - 새 테이블 생성 시 RLS 정책 SQL도 함께 제공.

5. **에러 발생 시 사용자 친화적 메시지를 표시하라**
   - 기술적 에러 메시지 노출 금지. 사용자가 이해할 수 있는 언어로 처리.

6. **함수는 20줄 이하로 유지하라**
   - 길어지면 기능별로 분리.

7. **데이터 패칭은 서버 컴포넌트 또는 API Route에서 하라**
   - Gemini API 호출은 반드시 `/app/api/` 라우트 통해서.

---

## 6. Supabase 사용 패턴

### 클라이언트 초기화

```js
// lib/supabase/client.js — 클라이언트 컴포넌트용
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

```js
// lib/supabase/server.js — 서버 컴포넌트/API Route용
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
}
```

---

## 7. Gemini API 사용 패턴

```js
// app/api/curate/route.js
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const { userProfile, artworks } = await request.json()

  // 프롬프트 구성 후 호출
  const result = await model.generateContent(prompt)
  return Response.json({ recommendations: result.response.text() })
}
```

**주의**: `GEMINI_API_KEY`는 이 API Route에서만 사용. 클라이언트 컴포넌트에서 직접 호출 금지.

---

## 8. Phase 1 완료 체크리스트

- [ ] 합격 DB 탐색 페이지 (필터 + 그리드)
- [ ] AI 큐레이션 페이지 (프로필 입력 → Top10)
- [ ] 저장 보드 페이지
- [ ] 이메일 인증 (회원가입/로그인)
- [ ] 모든 테이블 RLS 적용 확인
- [ ] `.env.local` 환경변수 설정 완료
- [ ] Vercel 배포 + 커스텀 도메인
- [ ] 모바일 반응형 확인 (iPhone SE 기준)
