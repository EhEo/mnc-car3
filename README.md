# 차량 관리 시스템 (Vehicle Management System)

직원 퇴근 시 차량 배정 및 탑승 현황을 실시간으로 관리하는 웹 애플리케이션입니다.

## 📋 프로젝트 개요

- **목표**: 직원 퇴근 시 차량 탑승 관리 및 실시간 현황 모니터링
- **기술 스택**: Hono + Cloudflare D1 + Tailwind CSS + Vanilla JavaScript
- **배포 플랫폼**: Cloudflare Pages

## 🌐 URL

- **개발 서버**: https://3000-i3vrrwve71cvm76jvvf5u-0e616f0a.sandbox.novita.ai
- **API 엔드포인트**: https://3000-i3vrrwve71cvm76jvvf5u-0e616f0a.sandbox.novita.ai/api

## ✨ 주요 기능

### ✅ 완료된 기능

1. **대시보드**
   - 직원 및 차량 상태 통계 확장 (근무중/퇴근완료/출장중/휴가중, 운행대기/퇴근완료/수리중/외근중)
   - 오늘의 탑승 기록 조회
   - 스마트 시스템 초기화 (특정 상태만 초기화)
   - 모바일 반응형 UI (한줄 네비게이션)

2. **직원 관리**
   - 직원 등록 (이름, 부서)
   - 직원 수정 (이름, 부서, 상태)
   - 직원 상태 확장: 근무중, 퇴근완료, 출장중, 휴가중
   - 직원 삭제
   - 직원 목록 조회 (등록 순서로 정렬)
   - 모달 기반 폼 UI

3. **차량 관리**
   - 차량 등록 (차량번호, 기사명, 전화번호)
   - 차량 수정 (차량번호, 기사명, 전화번호, 상태)
   - 차량 상태 확장: 운행대기, 퇴근완료, 수리중, 외근중
   - 차량 삭제
   - 차량 목록 조회 및 상태별 필터링
   - 모달 기반 폼 UI

4. **퇴근 등록**
   - 회사 차량 선택 (운행대기 차량만)
   - 외부차량 옵션 (개인차량/대중교통 이용 시)
   - 다중 직원 선택 (근무중 직원만)
   - 일괄 퇴근 처리 및 상태 자동 업데이트
   - 모바일 최적화 그리드 레이아웃

5. **탑승 기록**
   - 날짜 범위 검색 (시작일 ~ 종료일)
   - 기록 전체보기 (시간 역순 정렬)
   - 외부차량 기록 지원
   - 차량별 직원 그룹화 표시
   - 모바일 최적화 테이블

6. **실시간 통계**
   - 직원 상태별 카운트 (근무중/퇴근완료/출장중/휴가중)
   - 차량 상태별 카운트 (운행대기/운행중/퇴근완료/수리중/외근중)
   - 오늘의 탑승 건수

### 🔄 미구현 기능

- 자동 초기화 스케줄링 (매일 자정 자동 초기화)
- 실시간 푸시 알림
- 월별/연도별 통계 및 리포트
- 엑셀 내보내기 기능
- 사용자 인증/권한 관리

## 🗄️ 데이터 구조

### D1 데이터베이스 (SQLite)

#### employees (직원 테이블)
- `id`: 고유 ID (자동 증가)
- `name`: 직원 이름
- `department`: 부서명
- `status`: 상태 
  - `working`: 근무중
  - `left`: 퇴근완료
  - `business_trip`: 출장중
  - `vacation`: 휴가중
- `created_at`: 등록일시
- `updated_at`: 수정일시

#### vehicles (차량 테이블)
- `id`: 고유 ID (자동 증가)
- `vehicle_number`: 차량번호
- `driver_name`: 기사명
- `driver_phone`: 전화번호
- `status`: 상태
  - `waiting`: 운행대기
  - `driving`: 운행중
  - `completed`: 퇴근완료
  - `repair`: 수리중
  - `out`: 외근중
- `created_at`: 등록일시
- `updated_at`: 수정일시

#### boarding_records (탑승 기록 테이블)
- `id`: 고유 ID (자동 증가)
- `vehicle_id`: 차량 ID (외래키, NULL 가능 - 외부차량)
- `employee_id`: 직원 ID (외래키)
- `boarding_date`: 탑승 날짜
- `boarding_time`: 탑승 시간
- `created_at`: 등록일시

## 🔌 API 엔드포인트

### 직원 관리
- `GET /api/employees` - 직원 목록 조회
- `GET /api/employees/:id` - 직원 단건 조회
- `POST /api/employees` - 직원 생성
- `PUT /api/employees/:id` - 직원 수정
- `DELETE /api/employees/:id` - 직원 삭제

### 차량 관리
- `GET /api/vehicles` - 차량 목록 조회
- `GET /api/vehicles/:id` - 차량 단건 조회
- `POST /api/vehicles` - 차량 생성
- `PUT /api/vehicles/:id` - 차량 수정
- `DELETE /api/vehicles/:id` - 차량 삭제

### 탑승 관리
- `POST /api/boarding/register` - 퇴근 등록
  - Body: `{ vehicle_id: number | 'external', employee_ids: number[] }`
  - 외부차량 사용시 vehicle_id: 'external'
- `GET /api/boarding/records` - 탑승 기록 조회 (날짜 범위)
  - Query: `start_date` (YYYY-MM-DD, 기본값: 오늘)
  - Query: `end_date` (YYYY-MM-DD, 기본값: 오늘)
- `GET /api/boarding/stats` - 통계 정보 조회
- `POST /api/boarding/reset` - 스마트 시스템 초기화
  - 직원: '퇴근완료' → '근무중' (출장중/휴가중 유지)
  - 차량: '퇴근완료', '운행중' → '운행대기' (수리중/외근중 유지)

## 📖 사용 가이드

### 1. 직원 및 차량 등록
- "직원 관리" 탭에서 직원 추가
- "차량 관리" 탭에서 차량 추가

### 2. 퇴근 등록
- "퇴근 등록" 탭으로 이동
- 차량 선택:
  - **회사 차량**: 운행 대기 중인 차량 선택
  - **외부차량**: 개인차량/대중교통 이용 시 선택
- 퇴근할 직원 다중 선택 (근무중인 직원만, 여러 명 가능)
- "퇴근 등록" 버튼 클릭
- 자동으로 직원 상태 "퇴근완료", 차량 상태 "운행중"으로 변경

### 3. 탑승 기록 조회
- "탑승기록" 탭으로 이동
- 날짜 범위 선택 (시작일 ~ 종료일)
- "검색" 버튼 클릭
- 해당 기간의 모든 탑승 기록 조회

### 4. 대시보드 확인
- "대시보드" 탭에서 실시간 통계 확인
- 오늘의 탑승 기록 조회 (차량별 그룹화)
- 직원/차량 상태별 카운트 확인

### 5. 스마트 시스템 초기화
- "대시보드" 탭의 "초기화" 버튼 클릭
- 퇴근완료 직원만 → "근무중" (출장중/휴가중은 유지)
- 퇴근완료/운행중 차량만 → "운행대기" (수리중/외근중은 유지)

## 🛠️ 개발 환경 설정

### 로컬 개발

```bash
# 의존성 설치
npm install

# D1 데이터베이스 마이그레이션
npm run db:migrate:local

# 테스트 데이터 삽입
npm run db:seed

# 빌드
npm run build

# PM2로 개발 서버 시작
pm2 start ecosystem.config.cjs

# 로그 확인
pm2 logs --nostream

# 서버 중지
pm2 delete vehicle-management
```

### 데이터베이스 관리

```bash
# 로컬 데이터베이스 초기화
npm run db:reset

# 마이그레이션 적용
npm run db:migrate:local

# 테스트 데이터 삽입
npm run db:seed

# 로컬 데이터베이스 콘솔
npm run db:console:local
```

### 프로덕션 배포

```bash
# Cloudflare D1 데이터베이스 생성
npx wrangler d1 create vehicle-management-db

# wrangler.jsonc에 database_id 업데이트

# 프로덕션 마이그레이션 적용
npm run db:migrate:prod

# 프로덕션 배포
npm run deploy
```

## 📁 프로젝트 구조

```
webapp/
├── src/
│   ├── index.tsx              # 메인 애플리케이션 (Hono)
│   └── routes/
│       ├── employees.ts       # 직원 관리 API
│       ├── vehicles.ts        # 차량 관리 API
│       └── boarding.ts        # 탑승 관리 API
├── public/
│   └── static/
│       └── app.js             # 프론트엔드 JavaScript
├── migrations/
│   ├── 0001_initial_schema.sql # 초기 스키마
│   └── 0002_allow_null_vehicle.sql # 외부차량 지원
├── .wrangler/                 # 로컬 D1 데이터베이스 (자동 생성)
├── ecosystem.config.cjs       # PM2 설정
├── wrangler.jsonc            # Cloudflare 설정
├── package.json
└── README.md
```

## 🚀 다음 개발 단계

1. **인증 및 권한 관리**
   - 관리자/일반 사용자 구분
   - 로그인 기능

2. **실시간 업데이트**
   - WebSocket 또는 Server-Sent Events
   - 자동 새로고침

3. **통계 및 리포트**
   - 일별/주별/월별 통계
   - 엑셀 내보내기
   - 차트 및 그래프

4. **자동화**
   - 매일 자정 자동 초기화
   - 스케줄링 기능

5. **알림 기능**
   - 이메일 알림
   - SMS 알림
   - 푸시 알림

6. **모바일 최적화**
   - 반응형 디자인 개선
   - PWA 지원

## 📝 라이선스

MIT License

## 👨‍💻 개발자

Michael - 공정 자동화 관리시스템 전문가

---

**마지막 업데이트**: 2025-10-17
**배포 상태**: ✅ 로컬 개발 완료 (날짜 범위 검색, 확장 상태, 외부차량 지원)
