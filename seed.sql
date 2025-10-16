-- 테스트 직원 데이터
INSERT OR IGNORE INTO employees (id, name, department, status) VALUES 
  (1, '김철수', '개발팀', 'working'),
  (2, '이영희', '디자인팀', 'working'),
  (3, '박민수', '영업팀', 'working'),
  (4, '정지혜', '마케팅팀', 'working'),
  (5, '최동욱', '개발팀', 'working');

-- 테스트 차량 데이터
INSERT OR IGNORE INTO vehicles (id, vehicle_number, driver_name, driver_phone, status) VALUES 
  (1, '12가3456', '홍길동', '010-1234-5678', 'waiting'),
  (2, '34나5678', '김기사', '010-2345-6789', 'waiting'),
  (3, '56다7890', '이기사', '010-3456-7890', 'waiting');
