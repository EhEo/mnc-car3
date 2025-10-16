-- 외부차량 지원을 위해 vehicle_id를 NULL 허용하도록 변경
-- SQLite는 ALTER COLUMN을 지원하지 않으므로 테이블 재생성 필요

-- 1. 임시 테이블 생성
CREATE TABLE IF NOT EXISTS boarding_records_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER,  -- NOT NULL 제거
  employee_id INTEGER NOT NULL,
  boarding_date DATE NOT NULL DEFAULT (DATE('now')),
  boarding_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 2. 기존 데이터 복사
INSERT INTO boarding_records_new (id, vehicle_id, employee_id, boarding_date, boarding_time, created_at)
SELECT id, vehicle_id, employee_id, boarding_date, boarding_time, created_at
FROM boarding_records;

-- 3. 기존 테이블 삭제
DROP TABLE boarding_records;

-- 4. 새 테이블 이름 변경
ALTER TABLE boarding_records_new RENAME TO boarding_records;

-- 5. 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_boarding_records_date ON boarding_records(boarding_date);
CREATE INDEX IF NOT EXISTS idx_boarding_records_vehicle ON boarding_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_boarding_records_employee ON boarding_records(employee_id);
