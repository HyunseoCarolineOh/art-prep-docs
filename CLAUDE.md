# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**라이트 아트프렙 (Light ArtPrep)**: AI 기반 미대입시 실기자료 분석 및 스마트 큐레이션 서비스

### Core Value Proposition
- **AI 분석 엔진**: GPT-4 기반 실기자료의 객관적 분석 (목표 정확도 95%)
- **스마트 큐레이션**: 목표 대학/전형/실기 유형별 최적 합격작 및 참고작 10초 내 추천
- **개인화 학습**: 사용자 행동 데이터 기반 추천 알고리즘 지속 개선
- **가격 경쟁력**: 월 29,900원 (기존 학원비 대비 80% 이상 절감)

### Target Market
- **B2C**: 미대입시생, N수생 (연 5만명 규모)
- **B2B**: 입시미술학원, 미술 강사 (전국 500여개 입시미술학원)

---

## Architecture Overview

### System Components

#### 1. AI Analysis Engine
- **Technology**: GPT-4 API (OpenAI)
- **Input**: 실기자료 이미지 + 메타데이터 (대학, 전형, 유형)
- **Output**: 5단계 분석 리포트 (출제의도 → 학교별 성향 → 조형요소 → 평가기준 → 정량점수)
- **Current Status**: 30% 완료 (기본 프롬프트 설계, 300건 테스트 완료)
- **Development Target**: 1만건 이상 데이터로 Fine-Tuning, 정확도 95% 달성

#### 2. Data Layer
- **Database**: 실기자료 및 합격 데이터 정형화
- **Data Structure**: 대학/전형/실기유형별 분류, 메타데이터 태깅
- **Current Status**: 50% 완료 (1,000건 이상 자료 확보, 수동 태깅 진행 중)
- **Development Target**: 1만건 이상 자료 정형화, 자동 분류 80% 달성

#### 3. Mobile App (iOS/Android)
- **Core Features**:
  - 목표 설정 → AI 큐레이션 → 분석 리포트 → 학습 히스토리 대시보드
  - 필터 시스템 (실기유형, 학교 지역별)
  - 저장/반복 열람 추적 (개인화 데이터)
- **Current Status**: 70% 설계 완료 (와이어프레임, UX/UI 시스템 완성)
- **Development Target**: MVP 개발 (26.02~26.04), iOS/Android 동시 출시

#### 4. Backend API
- **Purpose**: 모바일 앱과 AI 분석 엔진 간 데이터 연동
- **Key Endpoints**:
  - `POST /analyze` - 실기자료 분석 요청
  - `GET /curate` - 목표별 스마트 큐레이션
  - `GET /recommendations` - 개인화 추천
  - `POST /track-behavior` - 사용자 행동 데이터 수집
- **Current Status**: 설계 단계
- **Technology Stack** (예상): Node.js/Python FastAPI, PostgreSQL, AWS S3 (이미지 저장)

---

## Development Timeline (2026)

| Phase | Period | Deliverables | Owner |
|-------|--------|--------------|-------|
| **1. MVP 기획 & 설계** | 26.01~26.02 | 서비스 전체 구조 정의, 기능 매핑, AI 분석 기준 설계 | CEO (오현서) |
| **2. MVP 개발 & 데이터** | 26.02~26.04 | AI 분석 로직 구현, 300건 데이터 구축, 앱 MVP 개발 | Backend Dev + Mobile Dev |
| **3. 내부 테스트 & 검증** | 26.04~26.06 | 기능 안정화, UX 개선, 리포트 구조 고도화 | QA + Product Team |
| **4. 파일럿 운영** | 26.06~26.08 | 100명 이상 파일럿 사용자 확보, 반복 사용율 40% 검증 | Product + Marketing |
| **5. 사업화 준비** | 26.08~26.12 | 사용자 피드백 80% 반영, B2B 리포트 설계, 특허 출원 | CEO + All Teams |

---

## Key Development Concepts

### AI Analysis Framework (5-Step Analysis)
```
실기자료 입력
  ↓
1단계: 출제의도 분석 (문제 해석)
  ↓
2단계: 학교별 성향 분석 (대학 선호도 패턴)
  ↓
3단계: 조형요소 분석 (구도, 형태, 색채, 표현력)
  ↓
4단계: 평가기준 부합도 분석 (합격 지표와의 일치도)
  ↓
5단계: 정량·정성 통합 리포트 생성
  ↓
사용자에게 강점/약점 + 개선 방향 제시
```

### Curation Algorithm
- **기본 로직**: 사용자 목표(대학/전형/유형) 기반 1만건 DB 교차 분석
- **가중치**: 합격 기여도 점수 반영하여 상위 100선 우선순위화
- **개인화**: 사용자 행동 데이터(저장, 열람, 필터 선택) 실시간 수집 → 추천 알고리즘 지속 보정
- **목표**: 사용 기간이 길어질수록 개인화 추천 정확도 95% 수준 달성

### Data Model (Key Entities)
```
User
  ├─ Profile (나이, 목표대학, 현재 실기 수준)
  ├─ Preferences (관심 유형, 필터 설정)
  └─ Learning History (분석 리포트 열람, 저장 자료 등)

Artwork (실기자료)
  ├─ Image (원본 이미지)
  ├─ Metadata (출처, 제작자, 제작년도)
  ├─ Classification (대학, 전형, 유형)
  ├─ Analysis Report (AI 분석 결과)
  └─ Success Data (합격/불합격 여부, 합격 점수 등)

AnalysisReport
  ├─ Intention (출제 의도 분석)
  ├─ SchoolTendency (학교 성향 분석)
  ├─ FormElements (조형요소: 구도, 형태, 색채, 표현력)
  ├─ Evaluation Fit (평가기준 부합도)
  └─ Score (정량 점수)
```

---

## Important Business Context

### Competitive Advantages
1. **Data Flywheel**: 사용자가 많아질수록 AI 분석 정확도 향상 → 진입장벽 구축
2. **Unique Value**: 강사 주관이 아닌 **1만건 이상의 실제 합격 데이터** 기반 분석
3. **Cost Leadership**: 월 29,900원으로 기존 학원비(월 200만원+) 대비 90% 절감

### Revenue Model
- **B2C**: 프리미엄 구독 월 29,900원 (무제한 분석, 개인화 큐레이션)
- **B2B**: 학원별 인사이트 리포트 월 199,000원 (학생 데이터 기반 입시 트렌드)
- **광고**: 미술 재료, 온라인 강의 등 타겟 광고 (향후)

### MVP Conversion Rate Result
- 랜딩페이지 500명 방문 중 **110명 사전알림 신청 (22% 전환율)**
- 업계 평균(5~10%) 대비 **2.2배 높은 수치** → 시장 니즈 검증됨

---

## Current Team & Skills

| Role | Name | Background |
|------|------|-----------|
| **CEO/Product** | 오현서 | 미대입시 컨설턴트 6년 + IT 서비스 기획 5년 (시각디자인과 학사) |
| **Marketing** | TBD | 미술강사 6년 + 교육 콘텐츠 마케팅 5년 |
| **UX/UI Design** | TBD | 미술강사 6년 + IT UX/UI 경험 3년 |
| **Backend Dev** | TBD (예정 '26.09) | 컴퓨터공학, 모바일 앱 5년+ 경력, AI/ML 경험 보유자 |

### Key Partners
- **OpenAI**: GPT-4 API 기술 협력
- **블루닷 입시미술학원**: 데이터 검증, 입시 자문, B2B 파일럿
- **법무법인 현백**: 특허 출원, 지식재산권 자문

---

## Build & Development Commands

> **Note**: 프로젝트 초기 단계로, 실제 개발 환경 구성 후 명령어 업데이트 필요

### Expected Setup (After Backend Development)
```bash
# Backend 설치
pip install -r requirements.txt  # Python 기반 예상
# 또는
npm install  # Node.js 기반 예상

# Environment 설정
cp .env.example .env
# 주요 변수: OPENAI_API_KEY, DATABASE_URL, AWS_S3_BUCKET 등

# Database Migration
python manage.py migrate  # Django 기반 예상
# 또는
npm run migrate  # TypeORM 등 기반 예상

# Server 실행
python manage.py runserver
# 또는
npm run dev
```

### Mobile App Development (Planned)
```bash
# iOS (Swift/React Native 예상)
cd ios && pod install && open ArtPrep.xcworkspace

# Android (Kotlin/React Native 예상)
cd android && ./gradlew build
```

---

## File Structure (Anticipated)

> **Note**: 실제 개발 진행 시 업데이트 필요

```
art-prep/
├── backend/                    # API 서버
│   ├── core/
│   │   ├── ai_engine.py       # GPT-4 분석 엔진
│   │   ├── curation.py        # 큐레이션 알고리즘
│   │   └── personalization.py # 개인화 로직
│   ├── api/
│   │   ├── routes/            # REST API 엔드포인트
│   │   └── models/            # 데이터 모델
│   └── data/
│       ├── processing.py      # 데이터 정제 및 분류
│       └── storage.py         # S3 이미지 저장 관리
│
├── mobile/                     # iOS/Android 앱
│   ├── ios/                   # React Native 또는 Swift
│   ├── android/               # React Native 또는 Kotlin
│   ├── screens/               # UI 화면 (큐레이션, 분석리포트, 대시보드)
│   └── services/              # API 호출, 로컬 저장소
│
├── data/                       # 학습 데이터
│   ├── artworks/              # 실기자료 이미지
│   ├── metadata/              # 대학/전형/유형 분류
│   └── analysis_baseline/     # AI 분석 기준 데이터
│
└── docs/                       # 사업계획서, 설계서 등
```

---

## Key Dependencies (Planned)

**Backend**:
- OpenAI API (GPT-4)
- PostgreSQL (데이터베이스)
- AWS S3 (이미지 저장)
- FastAPI 또는 Django (REST API)

**Mobile**:
- React Native 또는 Native (iOS/Android)
- Redux 또는 Context API (상태 관리)
- Firebase (원격 분석)

**Infrastructure**:
- Docker (컨테이너화)
- GitHub Actions (CI/CD)

---

## Critical Success Factors

1. **Data Quality**: 합격 데이터의 정확성과 충분한 데이터양(1만건 목표)
2. **AI Analysis Accuracy**: 95% 정확도 달성으로 사용자 신뢰 확보
3. **User Retention**: 파일럿 단계에서 반복 사용율 40% 달성
4. **Product-Market Fit**: MVP 단계에서 25% 이상의 전환율 유지
5. **B2B Partnership**: 초기 5개 학원 이상의 제휴를 통한 데이터 및 피드백 확보

---

## Testing Strategy

> **Note**: 개발 진행 시 상세 기획 필요

- **Unit Tests**: AI 분석 프롬프트 및 큐레이션 알고리즘
- **Integration Tests**: API 엔드포인트 및 데이터베이스 연동
- **User Acceptance Tests (UAT)**: 파일럿 사용자 피드백 기반 (26.06~26.08)
- **Analysis Report Validation**: 실제 입시 전문가(학원, 강사) 검증

---

## Notes for Future Developers

- 이 프로젝트는 **사업 초기 단계(MVP 개발 중)**이므로, 기능보다 **빠른 검증과 반복 개선**에 초점
- **AI 분석 엔진**은 핵심 차별화 포인트이므로, 프롬프트 엔지니어링과 Fine-Tuning에 많은 시간 투자 필요
- **데이터 품질**이 서비스 성공의 핵심 → 입시 전문가(학원, 강사)와의 지속적 협력 필수
- B2C와 B2B는 서로 다른 요구사항 → 초기부터 모듈화된 아키텍처 설계 필요
- 개인화 추천 정확도 향상을 위해 **사용자 행동 데이터 수집 및 분석 체계** 구축 필수
