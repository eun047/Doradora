# 돌아돌아 (Doradora)

> **현재 위치 주변에 모양(하트, 별 등) 산책 경로를 생성하고, 실제로 걸으며 나만의 GPS 그림을 완성하는 AI 보행 경로 서비스**

---

## 프로젝트 소개

돌아돌아(Doradora)는 사용자의 현재 위치를 기반으로 생성된 그림 모양의 산책 경로를 따라 걸으며 GPS 트래킹을 경험할 수 있는 웹 서비스입니다.

* **Google Gemini AI**가 선택한 모양(하트, 별, 원 등)의 외곽선을 형성하는 최적의 GPS Waypoint(경유지)를 실시간으로 계산합니다.
* **TMAP 보행자 경로 API**를 통해 실제 사람이 걸을 수 있는 도로 및 산책로 기반의 구체적인 가이드를 제공합니다.
* 사용자는 실시간 GPS 트래킹으로 자신의 위치를 확인하고, 이동 경로를 캡처하여 나만의 **컬렉션**에 저장할 수 있습니다.

---

## 주요 기능

- **모양 선택 (Shape Selection)**
  - 하트, 별, 원 등 원하는 걷기 모양 선택 기능
- **AI 기반 경유지 자동 생성 (Gemini Waypoint Generation)**
  - Gemini 3.6 Flash 모델을 활용하여 현재 GPS 좌표 기준 6~10개의 정교한 꺾임 지점(Waypoint) 생성
- **실시간 보행자 경로 안내 & GPS 트래킹 (TMAP API)**
  - TMAP 보행자 경로 API 기반 실제 보행 경로 연동
  - TMAP Web SDK v2 및 HTML5 Geolocation을 활용한 실시간 위치 트래킹 및 방향 화살표 표시
- **지도 경로 캡처 & 완주 카드 (Map Snapshot)**
  - html2canvas를 활용한 이동 경로 및 지도 화면 고화질 캡처
- **나만의 그림 컬렉션 (Local Collection)**
  - 완주한 산책 경로 캡처본을 이미지 압축 후 LocalStorage 컬렉션에 자동 저장 및 삭제 관리

---

## 기술 스택

### Frontend
- **Framework & Language**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Map & Canvas**: TMAP Web SDK v2, html2canvas

### Backend
- **Framework & Language**: Node.js, Express 5, TypeScript (tsx)
- **AI & Open API**: Google Gen AI SDK (`@google/genai` - `gemini-3.6-flash`), TMAP Pedestrian Route Open API

---

## 프로젝트 구조

```text
Doradora/
├── frontend/                 # React Vite 프론트엔드
│   ├── src/
│   │   ├── assets/          # 이미지 및 아이콘 자원
│   │   ├── components/      # Map, MapZoomControls, CollectionCard 등 UI 컴포넌트
│   │   ├── constants/       # 지도 및 좌표 설정 상수
│   │   ├── pages/           # Home, SelectShape, Map, Complete, Collection 등 페이지
│   │   ├── services/        # TMAP 및 위치 서비스 API 호출
│   │   ├── types/           # TypeScript 타입 정의
│   │   └── utils/           # 좌표 계산, 이미지 압축, LocalStorage 유틸리티
│   └── .env.local           # 프론트엔드 환경 변수
│
└── backend/                  # Express 백엔드 API 서버
    ├── src/
    │   ├── services/        # Gemini AI 및 TMAP 백엔드 요청 연동
    │   ├── types/           # Shape 및 경로 타입
    │   └── server.ts        # Express 라우팅 및 서버 엔드포인트
    └── .env                 # 백엔드 API Key 환경 변수
```

---

## 환경 변수 설정

서비스 실행을 위해 프론트엔드와 백엔드 각각 환경 변수 파일(`.env`) 생성이 필요합니다.

### 1. Backend (`backend/.env`)
```env
PORT=5001
TMAP_API_KEY=YOUR_TMAP_API_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 2. Frontend (`frontend/.env.local`)
```env
VITE_TMAP_APP_KEY=YOUR_TMAP_APP_KEY
```

---

## 실행 방법

### 1. 저장소 클론 및 패키지 설치

```bash
# 백엔드 패키지 설치
cd backend
npm install

# 프론트엔드 패키지 설치
cd ../frontend
npm install
```

### 2. 백엔드 서버 실행

```bash
cd backend
npm run dev
# Server running on http://localhost:5001
```

### 3. 프론트엔드 개발 서버 실행

```bash
cd frontend
npm run dev
# Vite dev server running on http://localhost:5173
```

---

## 주요 시스템 흐름 (Architecture)

1. **위치 수집**: 프론트엔드에서 HTML5 Geolocation API로 사용자의 현재 WGS84 좌표(`latitude`, `longitude`) 수집
2. **AI 경유지 계산**: 백엔드 `/api/waypoints` 호출 ➡️ Gemini 3.6 Flash에 현재 위치와 원하는 모양을 전달하여 6~10개의 외곽선 지점 수신
3. **실제 보행 경로 매핑**: TMAP Pedestrian Route API를 호출하여 생성된 경유지를 순서대로 이은 실제 보행 도로 좌표 배열 계산
4. **지도 렌더링 & 트래킹**: TMAP Web SDK 상에 목표 경로(Polyline)와 사용자 이동 궤적(GPS Polyline) 렌더링
5. **저장 & 컬렉션**: 완주 후 지도 화면을 캡처하고 용량을 자동 최적화하여 LocalStorage에 보관
