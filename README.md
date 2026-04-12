# 🦎 LizardGuard: 파충류 사육장 열환경 불일치 조기 진단 시스템 (Frontend)

![Project Status](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat-square&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

이 프로젝트는 **캡스톤 디자인 28팀(Capstone-28)** 의 프론트엔드 레포지토리입니다. 
파충류(도마뱀) 사육장 내의 온도구배 및 열환경 불일치를 실시간으로 모니터링하고 조기에 진단하여 경고하는 대시보드 시스템입니다.

## ✨ 주요 기능 (Key Features)

* **실시간 열환경 모니터링:** 표면 온도, 온열 구역 공기, 냉각 구역 공기의 온도를 실시간으로 차트화하여 제공합니다.
* **독립 진단 지표 분석 (4종):**
  * `L_match`: 열원 ON 후 표면 온도 상승 지연 여부 (반응 불일치)
  * `L_grad`: 온도구배 붕괴 여부 판단
  * `L_safety`: 표면 과열 임계치 도달 여부 
  * `L_device`: 센서 응답 상태 및 장치 이상 여부
* **시나리오 제어 및 시뮬레이션:** 정상 가열, 표면 응답 지연, 표면 과열, 온도구배 붕괴 등 다양한 상황에 대한 시뮬레이션 및 진단 모드를 지원합니다.
* **상태 전이 알림:** 정상, 경고(Warning), 위험(Critical) 상태를 실시간으로 진단하고 이력을 기록합니다.

## 🚀 시작하기 (Getting Started)

로컬 환경에서 프로젝트를 실행하기 위한 방법입니다.

### 1. 프로젝트 클론
```bash
git clone [https://github.com/capstone-28/terrarium-diagnosis-frontend.git](https://github.com/capstone-28/terrarium-diagnosis-frontend.git)
cd terrarium-diagnosis-frontend

2. 패키지 설치

npm install

3. 개발 서버 실행

npm run dev
(실행 후 브라우저에서 http://localhost:8080 (또는 터미널에 표시된 주소)로 접속하여 대시보드를 확인할 수 있습니다.)

📁 폴더 구조 (Project Structure)

📦 src
 ┣ 📂 components   # 공통 및 UI 컴포넌트
 ┣ 📂 hooks        # 커스텀 React Hooks (시뮬레이션, 토스트 알림 등)
 ┣ 📂 lib          # 유틸리티 함수
 ┣ 📂 pages        # 라우팅 페이지 (대시보드 메인)
 ┣ 📜 App.tsx      # 최상위 컴포넌트
 ┗ 📜 main.tsx     # 진입점 (Entry Point)



👨‍💻 팀원 (Team - Capstone 28)
    Frontend: Nanyang7