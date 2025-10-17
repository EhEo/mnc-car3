import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const boarding = new Hono<{ Bindings: Bindings }>()

// 퇴근 등록 (차량 + 여러 직원)
boarding.post('/register', async (c) => {
  try {
    const { vehicle_id, employee_ids } = await c.req.json()
    
    if (!vehicle_id || !employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
      return c.json({ 
        success: false, 
        error: 'Vehicle ID and employee IDs array are required' 
      }, 400)
    }

    // 외부차량 처리
    const isExternalVehicle = vehicle_id === 'external'
    
    // 트랜잭션 시뮬레이션 (D1은 아직 명시적 트랜잭션 미지원)
    // 1. 탑승 기록 생성
    for (const employee_id of employee_ids) {
      if (isExternalVehicle) {
        // 외부차량인 경우 vehicle_id를 NULL로 저장
        await c.env.DB.prepare(
          'INSERT INTO boarding_records (vehicle_id, employee_id) VALUES (NULL, ?)'
        ).bind(employee_id).run()
      } else {
        // 회사 차량인 경우
        await c.env.DB.prepare(
          'INSERT INTO boarding_records (vehicle_id, employee_id) VALUES (?, ?)'
        ).bind(vehicle_id, employee_id).run()
      }
      
      // 2. 직원 상태 업데이트
      await c.env.DB.prepare(
        'UPDATE employees SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind('left', employee_id).run()
    }
    
    // 3. 차량 상태 업데이트 (외부차량이 아닌 경우에만)
    if (!isExternalVehicle) {
      await c.env.DB.prepare(
        'UPDATE vehicles SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind('driving', vehicle_id).run()
    }
    
    return c.json({ 
      success: true, 
      message: `${employee_ids.length} employees registered for boarding`,
      data: { vehicle_id, employee_ids, is_external: isExternalVehicle }
    }, 201)
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 탑승 기록 조회 (기간 검색)
boarding.get('/records', async (c) => {
  try {
    const startDate = c.req.query('start_date') || new Date().toISOString().split('T')[0]
    const endDate = c.req.query('end_date') || new Date().toISOString().split('T')[0]
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        br.id,
        br.boarding_date,
        br.boarding_time,
        COALESCE(v.vehicle_number, '외부차량') as vehicle_number,
        COALESCE(v.driver_name, '-') as driver_name,
        e.name as employee_name,
        e.department
      FROM boarding_records br
      LEFT JOIN vehicles v ON br.vehicle_id = v.id
      JOIN employees e ON br.employee_id = e.id
      WHERE br.boarding_date BETWEEN ? AND ?
      ORDER BY br.boarding_time DESC
    `).bind(startDate, endDate).all()
    
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 통계 정보
boarding.get('/stats', async (c) => {
  try {
    // 직원 상태별 통계
    const { results: employeeStats } = await c.env.DB.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM employees
      GROUP BY status
    `).all()
    
    // 차량 상태별 통계
    const { results: vehicleStats } = await c.env.DB.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM vehicles
      GROUP BY status
    `).all()
    
    // 오늘의 탑승 기록 수
    const { results: todayRecords } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM boarding_records
      WHERE boarding_date = DATE('now')
    `).all()
    
    return c.json({ 
      success: true, 
      data: {
        employees: employeeStats,
        vehicles: vehicleStats,
        today_boarding_count: todayRecords[0]?.count || 0
      }
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 시스템 초기화 (모든 상태를 초기값으로)
boarding.post('/reset', async (c) => {
  try {
    // 1. 오늘 날짜의 탑승 기록 삭제
    const deleteResult = await c.env.DB.prepare(
      "DELETE FROM boarding_records WHERE boarding_date = DATE('now')"
    ).run()
    
    // 2. 퇴근완료 직원만 근무중으로 (출장중, 휴가중은 유지)
    await c.env.DB.prepare(
      'UPDATE employees SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE status = ?'
    ).bind('working', 'left').run()
    
    // 3. 퇴근완료, 운행중 차량만 운행대기로 (수리중, 외근중은 유지)
    await c.env.DB.prepare(
      'UPDATE vehicles SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE status IN (?, ?)'
    ).bind('waiting', 'completed', 'driving').run()
    
    return c.json({ 
      success: true, 
      message: 'System has been reset successfully',
      deleted_records: deleteResult.meta?.changes || 0
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

export default boarding
