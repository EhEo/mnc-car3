# Cloudflare Pages 배포 가이드

차량관리 시스템을 Cloudflare Pages에 배포하는 상세 가이드입니다.

## 📋 사전 준비

### 1. Cloudflare 계정
- Cloudflare 계정이 필요합니다 (무료 플랜 가능)
- https://dash.cloudflare.com 에서 계정 생성

### 2. Cloudflare API 토큰 생성

**중요**: 다음 권한을 가진 API 토큰이 필요합니다:

1. Cloudflare 대시보드 로그인
2. **My Profile** → **API Tokens** → **Create Token**
3. **Custom token** 선택
4. 다음 권한 추가:
   - `Account → D1 → Edit`
   - `Account → Pages → Edit`
   - `Account → Workers Scripts → Edit`
   - `Account → Workers Routes → Edit` (선택사항)
   - `User → User Details → Read` (권장)
5. **Continue to summary** → **Create Token**
6. 생성된 토큰을 안전하게 복사

### 3. 환경에 API 토큰 설정

```bash
# Linux/Mac
export CLOUDFLARE_API_TOKEN="your-api-token-here"

# 영구 설정
echo 'export CLOUDFLARE_API_TOKEN="your-api-token-here"' >> ~/.bashrc
source ~/.bashrc
```

---

## 🚀 배포 단계

### 1단계: D1 데이터베이스 생성

```bash
cd /home/user/webapp

# D1 데이터베이스 생성
npx wrangler d1 create vehicle-management-db
```

**출력 예시:**
```
✅ Successfully created DB 'vehicle-management-db'

[[d1_databases]]
binding = "DB"
database_name = "vehicle-management-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**database_id를 복사하세요!**

### 2단계: wrangler.jsonc 설정 업데이트

```bash
# wrangler.jsonc 파일 수정
nano wrangler.jsonc
```

`database_id`를 실제 값으로 변경:
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "vehicle-management",
  "compatibility_date": "2025-10-16",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "vehicle-management-db",
      "database_id": "여기에-실제-database_id-입력"  // ← 변경!
    }
  ]
}
```

### 3단계: 프로덕션 데이터베이스 마이그레이션

```bash
# 마이그레이션 적용
npx wrangler d1 migrations apply vehicle-management-db

# 확인 메시지에서 'y' 입력
```

### 4단계: Cloudflare Pages 프로젝트 생성

```bash
# Pages 프로젝트 생성
npx wrangler pages project create vehicle-management \
  --production-branch main \
  --compatibility-date 2025-10-16
```

### 5단계: D1 바인딩 설정

```bash
# D1 데이터베이스를 Pages에 바인딩
npx wrangler pages deployment bind d1 DB vehicle-management-db \
  --project-name vehicle-management
```

### 6단계: 프로젝트 빌드

```bash
# 프로덕션 빌드
npm run build
```

**빌드 결과 확인:**
- `dist/` 디렉토리에 파일 생성 확인
- `dist/_worker.js` 파일 존재 확인
- `dist/_routes.json` 파일 존재 확인

### 7단계: Cloudflare Pages 배포

```bash
# 배포 실행
npx wrangler pages deploy dist --project-name vehicle-management
```

**배포 성공 시 출력:**
```
✨ Success! Uploaded X files (Y.YY sec)

✨ Deployment complete! Take a peek over at https://xxxxxxxx.vehicle-management.pages.dev
```

**URL 저장:** 배포 URL을 기록해두세요!

---

## 🔄 자동화 Workers 배포

### 1. Auto-Reset Worker 배포

```bash
cd workers

# wrangler.toml에서 database_id 업데이트 (프로덕션 D1 ID로)
nano wrangler.toml

# Worker 배포
npx wrangler deploy --config wrangler.toml

# 보안 토큰 설정 (선택사항)
npx wrangler secret put RESET_TOKEN --config wrangler.toml
# 프롬프트에서 토큰 입력
```

### 2. Auto-Backup Worker 배포 (선택사항)

```bash
# R2 버킷 생성 (백업 저장용)
npx wrangler r2 bucket create vehicle-management-backups

# backup-wrangler.toml에서 database_id 업데이트
nano backup-wrangler.toml

# Worker 배포
npx wrangler deploy --config backup-wrangler.toml

# 보안 토큰 설정 (선택사항)
npx wrangler secret put BACKUP_TOKEN --config backup-wrangler.toml
```

---

## 🔧 배포 후 설정

### 환경 변수 설정 (선택사항)

```bash
# Pages 프로젝트에 환경 변수 추가
npx wrangler pages secret put SOME_SECRET \
  --project-name vehicle-management
```

### 커스텀 도메인 연결

#### Cloudflare 대시보드에서:

1. **Workers & Pages** → **vehicle-management** 선택
2. **Custom domains** 탭
3. **Set up a custom domain** 클릭
4. 도메인 입력 (예: `vehicle.example.com`)
5. DNS 레코드 자동 추가 확인
6. 완료!

#### Wrangler CLI로:

```bash
# 커스텀 도메인 추가
npx wrangler pages domain add vehicle.example.com \
  --project-name vehicle-management
```

**주의**: 도메인의 네임서버가 Cloudflare로 설정되어 있어야 합니다.

---

## 🔄 업데이트 및 재배포

### 코드 변경 후 재배포

```bash
# 1. 변경사항 커밋
git add .
git commit -m "Update: 기능 개선"

# 2. 빌드
npm run build

# 3. 재배포
npx wrangler pages deploy dist --project-name vehicle-management
```

### 데이터베이스 마이그레이션 추가

```bash
# 1. 새 마이그레이션 파일 생성
touch migrations/0003_new_feature.sql

# 2. SQL 작성
nano migrations/0003_new_feature.sql

# 3. 로컬 테스트
npx wrangler d1 migrations apply vehicle-management-db --local

# 4. 프로덕션 적용
npx wrangler d1 migrations apply vehicle-management-db
```

---

## 📊 모니터링 및 로그

### 배포 상태 확인

```bash
# 최근 배포 목록
npx wrangler pages deployments list --project-name vehicle-management

# 특정 배포 상세 정보
npx wrangler pages deployment tail --project-name vehicle-management
```

### Worker 로그 확인

```bash
# Auto-Reset Worker 로그
npx wrangler tail vehicle-management-auto-reset

# Auto-Backup Worker 로그
npx wrangler tail vehicle-management-auto-backup

# 실시간 로그 스트림
npx wrangler tail vehicle-management-auto-reset --format pretty
```

### D1 데이터베이스 쿼리

```bash
# 프로덕션 데이터베이스 쿼리
npx wrangler d1 execute vehicle-management-db \
  --command="SELECT COUNT(*) FROM employees"

# 파일로 쿼리 실행
npx wrangler d1 execute vehicle-management-db \
  --file=query.sql
```

---

## 🛠️ 트러블슈팅

### 1. 인증 오류 (Authentication error)

**증상**: `Authentication error [code: 10000]`

**해결**:
```bash
# API 토큰 재설정
unset CLOUDFLARE_API_TOKEN
export CLOUDFLARE_API_TOKEN="new-token-here"

# 권한 확인
npx wrangler whoami
```

### 2. 데이터베이스 바인딩 실패

**증상**: `Error: D1 binding "DB" not found`

**해결**:
```bash
# 바인딩 재설정
npx wrangler pages deployment bind d1 DB vehicle-management-db \
  --project-name vehicle-management

# 재배포
npm run build
npx wrangler pages deploy dist --project-name vehicle-management
```

### 3. 마이그레이션 오류

**증상**: `Migration failed: table already exists`

**해결**:
```bash
# 마이그레이션 상태 확인
npx wrangler d1 migrations list vehicle-management-db

# 필요시 특정 마이그레이션만 적용
npx wrangler d1 execute vehicle-management-db \
  --file=migrations/0002_specific_migration.sql
```

### 4. 빌드 실패

**증상**: `vite build` 실패

**해결**:
```bash
# node_modules 재설치
rm -rf node_modules
npm install

# 캐시 클리어
rm -rf dist .wrangler

# 재빌드
npm run build
```

### 5. 404 오류 (배포 후)

**증상**: 페이지 접근 시 404

**해결**:
- `dist/` 폴더에 파일이 있는지 확인
- `_routes.json` 파일이 생성되었는지 확인
- Cloudflare 대시보드에서 배포 상태 확인

---

## 🔐 보안 권장사항

1. **API 토큰 관리**:
   - 토큰을 코드에 포함하지 말 것
   - 정기적으로 토큰 갱신
   - 불필요한 권한 제거

2. **환경 변수**:
   - 민감한 정보는 Pages Secrets로 관리
   - `.env` 파일은 git에 커밋하지 말 것

3. **D1 데이터베이스**:
   - 프로덕션 DB에 직접 쿼리 최소화
   - 백업 정기적으로 실행
   - 마이그레이션 테스트 후 프로덕션 적용

4. **Workers**:
   - 수동 트리거에 인증 필수
   - Rate limiting 적용 고려
   - 로그 정기적으로 확인

---

## 📝 배포 체크리스트

배포 전 확인사항:

- [ ] Cloudflare API 토큰 생성 및 권한 확인
- [ ] D1 데이터베이스 생성 완료
- [ ] wrangler.jsonc에 올바른 database_id 설정
- [ ] 프로덕션 마이그레이션 적용 완료
- [ ] 로컬 빌드 성공 확인 (npm run build)
- [ ] Pages 프로젝트 생성 완료
- [ ] D1 바인딩 설정 완료
- [ ] 배포 성공 및 URL 확인
- [ ] 배포된 사이트 기능 테스트
- [ ] Auto-Reset Worker 배포 (선택사항)
- [ ] Auto-Backup Worker 배포 (선택사항)
- [ ] 커스텀 도메인 연결 (선택사항)
- [ ] README.md 업데이트 (배포 URL 포함)

---

## 🌐 배포 완료 후

### 프로덕션 URL

- **메인**: https://vehicle-management.pages.dev
- **커스텀 도메인**: https://your-domain.com (설정 시)
- **API**: https://vehicle-management.pages.dev/api

### 추가 리소스

- [Cloudflare Pages 문서](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 문서](https://developers.cloudflare.com/d1/)
- [Cloudflare Workers 문서](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 문서](https://developers.cloudflare.com/workers/wrangler/)

---

**배포 성공을 기원합니다! 🚀**
