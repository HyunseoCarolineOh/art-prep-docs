# 데이터팀 커뮤니케이션 로그

비동기 채널(Slack/메시지)로 오간 데이터팀과의 커뮤니케이션 기록.

- 회의는 [`docs/meetings/`](../meetings/)에 별도 보관.
- 의사결정·태스크는 sprint-plan / [`/calendar`](https://hyunseo-oh.vercel.app/calendar)로 이관, 본 파일은 컨텍스트 보관용.

---

## 2026-05-19 · GA4 트래킹 PR & Vercel env

### 수신 (데이터팀)
> GA4 이벤트 트래킹 작업 완료해서 PR 올렸습니다!
> PR 링크: https://github.com/HyunseoCarolineOh/art-prep/pull/1 (Reviewers에 현서 지정)
>
> 요청사항
> 1) PR 리뷰 & 머지 (feat/ga4-tracking → main)
> 2) Vercel 환경변수 추가
>    - 위치: Vercel → art-prep → Settings → Environment Variables
>    - Key: `VITE_GA_MEASUREMENT_ID`
>    - Value: `G-RT0DERQYMW`
>    - Environments: Production / Preview / Development 모두 체크
>
> 둘 다 완료되면 알려달라. GA4 실시간 보고서로 정상 동작 확인 후 Looker Studio 대시보드 작업 들어감.

### 액션
- **PR #1 리뷰 & 머지**
  - squash merge, `feat/ga4-tracking` 브랜치 삭제
  - merge commit: `8e90b6d25be059f392accc651eb733cf492407de`
  - 코드 OK 판단: env 가드 + dev 콘솔 로그(`[GA] eventName params`) + SPA `send_page_view: false` 후 React Router 수동 추적(중복 방지) + `IS_ENABLED` 체크
  - 이벤트 12종 (artwork_view / save / unsave / upload / edit / delete / search / filter_use / signup_start / signup_step1_complete / signup_complete / login) + page_view
  - 사소 메모: GA4 권장 이벤트(view_item 등) 매핑 안 함 — 도메인 이벤트명이 디버깅엔 더 명확, 데이터팀 판단 존중
- **Vercel env var 추가**
  - Key `VITE_GA_MEASUREMENT_ID` = `G-RT0DERQYMW`
  - Scope: All Environments (Production / Preview / Development)
  - **Sensitive 토글 OFF** (Sensitive ON 상태에선 Development 환경 비활성 — Vercel UI 제약)
  - main 머지로 Vercel 자동 재배포 트리거됨 → 새 배포부터 GA 작동 예상

### 발신 (회신)
> 두 가지 다 완료했습니다!
>
> ✅ 1) PR #1 머지 완료
> - feat/ga4-tracking → main, squash merge (commit 8e90b6d)
> - 머지 후 브랜치 자동 삭제 처리.
> - env 가드·dev 콘솔 로그·SPA page_view 수동 추적 안전장치 다 챙겨주셔서 좋았어요.
>
> ✅ 2) Vercel 환경변수 추가 완료
> - Key: VITE_GA_MEASUREMENT_ID
> - Value: G-RT0DERQYMW
> - Scope: All Environments (Production / Preview / Development)
> - Sensitive 토글 OFF (Development에서도 동작하도록).
>
> main 머지로 Vercel 새 배포 자동 트리거. 그 배포부터 GA 작동. 실시간 보고서로 정상 동작 확인 부탁드리고, 이상 있으면 알려주세요. Looker Studio 대시보드 작업 들어가시면 됩니다.

### 후속 (Pending)
- [ ] 데이터팀의 GA4 실시간 보고서 검증 결과 회신 확인
- [ ] Looker Studio 대시보드 작업 착수 시점·범위 공유받기
