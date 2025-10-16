-- 직원 테이블
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'working', -- 'working' or 'left'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 차량 테이블
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_number TEXT UNIQUE NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'driving', 'completed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 탑승 기록 테이블
CREATE TABLE IF NOT EXISTS boarding_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  boarding_date DATE NOT NULL DEFAULT (DATE('now')),
  boarding_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_boarding_records_date ON boarding_records(boarding_date);
CREATE INDEX IF NOT EXISTS idx_boarding_records_vehicle ON boarding_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_boarding_records_employee ON boarding_records(employee_id);
