# modoo/images/source

modoo-startup 2026 슬라이드 PNG의 원본 소스.

## 파일 구성

- `01-problem.html` ~ `06-report.html` — 슬라이드 PNG의 원본 HTML (스크린샷 추출용)
- `mvp-analysis-report.html` — MVP 분석 리포트 원본
- `_spa_server.py` — art-prep SPA dist 폴더를 로컬 8766 포트로 서빙하는 dev server (PNG 캡처 시 사용)

## 사용법

1. HTML을 브라우저에서 열거나 `python _spa_server.py`로 서빙
2. 스크린샷/캡처 → 상위 폴더 `images/`에 PNG로 저장
3. 결과 PNG는 `docs/application/modoo/application.md`에서 참조

## 비고

PNG는 `.gitignore` 처리되어 git에 포함되지 않음. HTML 소스만 추적.
