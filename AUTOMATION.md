# 자동화 기능 가이드

차량관리 시스템의 자동화 기능(자동 초기화 및 자동 백업)에 대한 설명입니다.

## 📅 1. 매일 자동 초기화

### 개요
- **실행 시간**: 매일 04:00 (베트남 시간 UTC+7)
- **실행 내용**:
  - 퇴근완료 직원 → 근무중
  - 퇴근완료/운행중 차량 → 운행대기
  - **중요**: 탑승 기록은 삭제하지 않음 (수동 초기화와 다른 점)

### 설정 방법

#### 1단계: Cloudflare D1 데이터베이스 ID 확인
```bash
# wrangler.jsonc에서 database_id 확인
cat wrangler.jsonc
```

#### 2단계: Auto-Reset Worker 설정 파일 업데이트
```bash
# workers/wrangler.toml 파일 수정
# database_id를 실제 값으로 변경
```

#### 3단계: Auto-Reset Worker 배포
```bash
cd workers
npx wrangler deploy --config wrangler.toml
```

#### 4단계: 보안 토큰 설정 (선택사항)
```bash
# 수동 트리거용 보안 토큰 설정
npx wrangler secret put RESET_TOKEN --config wrangler.toml
# 프롬프트에서 토큰 입력 (예: my-secure-token-123)
```

### 수동 트리거 방법

자동 스케줄 외에도 수동으로 초기화를 트리거할 수 있습니다:

```bash
curl -X POST https://vehicle-management-auto-reset.your-subdomain.workers.dev \
  -H "Authorization: Bearer your-reset-token"
```

### 로그 확인

```bash
# Worker 로그 확인
npx wrangler tail vehicle-management-auto-reset
```

---

## 💾 2. 매주 자동 백업

### 개요
- **실행 시간**: 매주 일요일 02:00 (베트남 시간 UTC+7)
- **백업 대상**:
  - 전체 직원 데이터
  - 전체 차량 데이터
  - 최근 90일 탑승 기록
- **백업 형식**: CSV 파일
- **저장 위치**: Cloudflare R2 (선택사항)

### 설정 방법

#### 1단계: R2 버킷 생성 (선택사항)
```bash
# R2 버킷 생성
npx wrangler r2 bucket create vehicle-management-backups
```

#### 2단계: Auto-Backup Worker 설정 파일 업데이트
```bash
# workers/backup-wrangler.toml 파일 수정
# 1. database_id를 실제 값으로 변경
# 2. BACKUP_EMAIL을 실제 이메일로 변경
```

#### 3단계: Auto-Backup Worker 배포
```bash
cd workers
npx wrangler deploy --config backup-wrangler.toml
```

#### 4단계: 보안 토큰 설정 (선택사항)
```bash
# 수동 트리거용 보안 토큰 설정
npx wrangler secret put BACKUP_TOKEN --config backup-wrangler.toml
```

### 수동 백업 실행

언제든지 수동으로 백업을 실행할 수 있습니다:

```bash
curl -X POST https://vehicle-management-auto-backup.your-subdomain.workers.dev \
  -H "Authorization: Bearer your-backup-token"
```

### 백업 파일 다운로드

#### R2 버킷에서 다운로드
```bash
# 최신 백업 목록 확인
npx wrangler r2 object list vehicle-management-backups --prefix backups/

# 특정 날짜의 백업 다운로드
npx wrangler r2 object get vehicle-management-backups/backups/2025-10-17/employees.csv --file employees.csv
npx wrangler r2 object get vehicle-management-backups/backups/2025-10-17/vehicles.csv --file vehicles.csv
npx wrangler r2 object get vehicle-management-backups/backups/2025-10-17/boarding_records.csv --file records.csv
```

#### 웹 대시보드에서 다운로드
1. Cloudflare 대시보드 로그인
2. R2 섹션으로 이동
3. `vehicle-management-backups` 버킷 선택
4. `backups/YYYY-MM-DD/` 폴더에서 CSV 파일 다운로드

---

## 🔄 3. 자동화 상태 모니터링

### Worker 실행 로그 확인

```bash
# Auto-Reset Worker 로그
npx wrangler tail vehicle-management-auto-reset

# Auto-Backup Worker 로그
npx wrangler tail vehicle-management-auto-backup
```

### Cloudflare 대시보드에서 확인

1. **Workers & Pages** 섹션으로 이동
2. 해당 Worker 선택
3. **Metrics** 탭에서 실행 통계 확인:
   - 요청 수
   - 성공/실패 비율
   - 실행 시간
   - 에러 로그

---

## 🛠️ 4. 트러블슈팅

### Auto-Reset가 실행되지 않는 경우

1. **Cron Trigger 확인**:
   ```bash
   npx wrangler deployments list --name vehicle-management-auto-reset
   ```

2. **시간대 확인**:
   - 베트남 시간 04:00 = UTC 21:00 (전날)
   - Cron 설정: `0 21 * * *`

3. **데이터베이스 바인딩 확인**:
   - `wrangler.toml`의 `database_id`가 올바른지 확인
   - D1 데이터베이스가 존재하는지 확인

### Auto-Backup이 실행되지 않는 경우

1. **R2 버킷 확인**:
   ```bash
   npx wrangler r2 bucket list
   ```

2. **권한 확인**:
   - Worker가 R2 버킷에 쓰기 권한이 있는지 확인
   - API 토큰에 R2 권한이 포함되어 있는지 확인

3. **로그 확인**:
   ```bash
   npx wrangler tail vehicle-management-auto-backup
   ```

---

## 📊 5. 백업 데이터 복원

백업된 CSV 파일을 사용하여 데이터를 복원하는 방법:

### 방법 1: Wrangler CLI 사용

```bash
# CSV를 SQL INSERT 문으로 변환 (수동)
# 또는 Python/Node.js 스크립트로 자동화

# SQL 실행
npx wrangler d1 execute vehicle-management-db --file restore.sql
```

### 방법 2: 프로그래밍 방식

```javascript
// restore.js
import fs from 'fs'
import csv from 'csv-parser'

const results = []

fs.createReadStream('employees.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log('CSV 파싱 완료:', results.length, '건')
    // D1 데이터베이스에 INSERT 실행
  })
```

---

## 🔐 6. 보안 권장사항

1. **토큰 관리**:
   - `RESET_TOKEN`, `BACKUP_TOKEN`은 반드시 Secret으로 저장
   - `.env` 파일에 토큰을 저장하지 말 것
   - 정기적으로 토큰 변경

2. **R2 버킷 보안**:
   - Public 액세스 비활성화
   - CORS 정책 설정 (필요시)
   - 버킷 정책으로 액세스 제한

3. **Worker 보안**:
   - 수동 트리거 엔드포인트에 인증 필수
   - IP 화이트리스트 설정 (필요시)
   - Rate Limiting 적용

---

## 📝 7. 비용 예상

### Cloudflare Workers (Free Plan)
- 요청: 100,000 requests/day (무료)
- Cron Triggers: 무제한 (무료)

### Cloudflare R2 (Free Plan)
- 스토리지: 10 GB (무료)
- Class A 작업: 1,000,000/month (무료)
- Class B 작업: 10,000,000/month (무료)

**예상 월간 비용**: $0 (Free Plan 범위 내)

---

## 📅 8. 자동화 스케줄 요약

| 작업 | 실행 시간 (베트남) | 실행 시간 (UTC) | Cron 표현식 | 주기 |
|------|-------------------|----------------|------------|------|
| 자동 초기화 | 매일 04:00 | 전날 21:00 | `0 21 * * *` | 매일 |
| 자동 백업 | 일요일 02:00 | 토요일 19:00 | `0 19 * * 6` | 매주 |

---

## ✅ 9. 배포 체크리스트

- [ ] D1 데이터베이스 ID 확인 및 설정
- [ ] R2 버킷 생성 (백업용)
- [ ] Auto-Reset Worker 배포
- [ ] Auto-Backup Worker 배포
- [ ] 보안 토큰 설정 (RESET_TOKEN, BACKUP_TOKEN)
- [ ] 수동 트리거 테스트
- [ ] 로그 모니터링 설정
- [ ] 첫 주 백업 확인
- [ ] 백업 다운로드 및 복원 테스트

---

**참고**: 자동화 기능은 Cloudflare Workers를 사용하므로 프로덕션 배포 후에만 작동합니다. 로컬 개발 환경에서는 수동으로 테스트해야 합니다.
