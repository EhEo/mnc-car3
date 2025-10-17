import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const reports = new Hono<{ Bindings: Bindings }>()

// 주별 통계 (지난 4주)
reports.get('/weekly', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        strftime('%Y-W%W', boarding_date) as week,
        DATE(boarding_date, 'weekday 0', '-6 days') as week_start,
        COUNT(DISTINCT employee_id) as total_employees,
        COUNT(DISTINCT vehicle_id) as total_vehicles,
        COUNT(*) as total_records
      FROM boarding_records
      WHERE boarding_date >= DATE('now', '-28 days')
      GROUP BY week
      ORDER BY week DESC
    `).all()
    
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 월별 통계 (지난 6개월)
reports.get('/monthly', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        strftime('%Y-%m', boarding_date) as month,
        COUNT(DISTINCT employee_id) as total_employees,
        COUNT(DISTINCT vehicle_id) as total_vehicles,
        COUNT(*) as total_records
      FROM boarding_records
      WHERE boarding_date >= DATE('now', '-6 months')
      GROUP BY month
      ORDER BY month DESC
    `).all()
    
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 직원별 통계 (지정 기간)
reports.get('/by-employee', async (c) => {
  try {
    const startDate = c.req.query('start_date') || new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]
    const endDate = c.req.query('end_date') || new Date().toISOString().split('T')[0]
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        e.id,
        e.name,
        e.department,
        COUNT(br.id) as boarding_count,
        COUNT(DISTINCT br.boarding_date) as days_count,
        MIN(br.boarding_date) as first_boarding,
        MAX(br.boarding_date) as last_boarding
      FROM employees e
      LEFT JOIN boarding_records br ON e.id = br.employee_id 
        AND br.boarding_date BETWEEN ? AND ?
      GROUP BY e.id
      ORDER BY boarding_count DESC, e.name ASC
    `).bind(startDate, endDate).all()
    
    return c.json({ 
      success: true, 
      data: results,
      period: { start_date: startDate, end_date: endDate }
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 차량별 통계 (지정 기간)
reports.get('/by-vehicle', async (c) => {
  try {
    const startDate = c.req.query('start_date') || new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]
    const endDate = c.req.query('end_date') || new Date().toISOString().split('T')[0]
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        v.id,
        v.vehicle_number,
        v.driver_name,
        COUNT(br.id) as boarding_count,
        COUNT(DISTINCT br.employee_id) as unique_employees,
        COUNT(DISTINCT br.boarding_date) as days_used,
        MIN(br.boarding_date) as first_use,
        MAX(br.boarding_date) as last_use
      FROM vehicles v
      LEFT JOIN boarding_records br ON v.id = br.vehicle_id 
        AND br.boarding_date BETWEEN ? AND ?
      GROUP BY v.id
      ORDER BY boarding_count DESC, v.vehicle_number ASC
    `).bind(startDate, endDate).all()
    
    // 외부차량 통계 추가
    const { results: externalStats } = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as boarding_count,
        COUNT(DISTINCT employee_id) as unique_employees,
        COUNT(DISTINCT boarding_date) as days_used,
        MIN(boarding_date) as first_use,
        MAX(boarding_date) as last_use
      FROM boarding_records
      WHERE vehicle_id IS NULL
        AND boarding_date BETWEEN ? AND ?
    `).bind(startDate, endDate).all()
    
    // 외부차량 데이터를 결과에 추가
    if (externalStats[0] && externalStats[0].boarding_count > 0) {
      results.push({
        id: null,
        vehicle_number: '외부차량',
        driver_name: '-',
        ...externalStats[0]
      })
    }
    
    return c.json({ 
      success: true, 
      data: results,
      period: { start_date: startDate, end_date: endDate }
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 부서별 통계 (지정 기간)
reports.get('/by-department', async (c) => {
  try {
    const startDate = c.req.query('start_date') || new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]
    const endDate = c.req.query('end_date') || new Date().toISOString().split('T')[0]
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        e.department,
        COUNT(DISTINCT e.id) as total_employees,
        COUNT(br.id) as boarding_count,
        COUNT(DISTINCT br.boarding_date) as days_count
      FROM employees e
      LEFT JOIN boarding_records br ON e.id = br.employee_id 
        AND br.boarding_date BETWEEN ? AND ?
      GROUP BY e.department
      ORDER BY boarding_count DESC
    `).bind(startDate, endDate).all()
    
    return c.json({ 
      success: true, 
      data: results,
      period: { start_date: startDate, end_date: endDate }
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 일별 통계 (지정 기간)
reports.get('/daily', async (c) => {
  try {
    const startDate = c.req.query('start_date') || new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0]
    const endDate = c.req.query('end_date') || new Date().toISOString().split('T')[0]
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        boarding_date as date,
        COUNT(DISTINCT employee_id) as employees_count,
        COUNT(DISTINCT vehicle_id) as vehicles_count,
        COUNT(*) as records_count
      FROM boarding_records
      WHERE boarding_date BETWEEN ? AND ?
      GROUP BY boarding_date
      ORDER BY boarding_date DESC
    `).bind(startDate, endDate).all()
    
    return c.json({ 
      success: true, 
      data: results,
      period: { start_date: startDate, end_date: endDate }
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 종합 대시보드 통계
reports.get('/dashboard', async (c) => {
  try {
    // 베트남 시간 (UTC+7) 계산
    const vietnamTime = new Date(Date.now() + 7 * 60 * 60 * 1000)
    const vietnamDate = vietnamTime.toISOString().split('T')[0]
    
    // 이번 주 시작일 (베트남 시간 기준 월요일)
    const dayOfWeek = vietnamTime.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekStart = new Date(vietnamTime.getTime() - daysFromMonday * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // 이번 달 시작일 (베트남 시간 기준)
    const monthStart = vietnamDate.substring(0, 8) + '01'
    
    // 오늘 통계 (베트남 시간 기준)
    const { results: today } = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as boarding_count,
        COUNT(DISTINCT employee_id) as employee_count,
        COUNT(DISTINCT vehicle_id) as vehicle_count
      FROM boarding_records
      WHERE boarding_date = ?
    `).bind(vietnamDate).all()
    
    // 이번 주 통계 (베트남 시간 기준)
    const { results: thisWeek } = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as boarding_count,
        COUNT(DISTINCT employee_id) as employee_count,
        COUNT(DISTINCT vehicle_id) as vehicle_count
      FROM boarding_records
      WHERE boarding_date >= ?
    `).bind(weekStart).all()
    
    // 이번 달 통계 (베트남 시간 기준)
    const { results: thisMonth } = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as boarding_count,
        COUNT(DISTINCT employee_id) as employee_count,
        COUNT(DISTINCT vehicle_id) as vehicle_count
      FROM boarding_records
      WHERE boarding_date >= ?
    `).bind(monthStart).all()
    
    // 전체 통계
    const { results: total } = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as boarding_count,
        COUNT(DISTINCT employee_id) as employee_count,
        COUNT(DISTINCT vehicle_id) as vehicle_count
      FROM boarding_records
    `).all()
    
    return c.json({ 
      success: true, 
      data: {
        today: today[0],
        this_week: thisWeek[0],
        this_month: thisMonth[0],
        total: total[0]
      }
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

export default reports
