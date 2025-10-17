import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const vehicles = new Hono<{ Bindings: Bindings }>()

// 차량 목록 조회
vehicles.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM vehicles ORDER BY created_at DESC'
    ).all()
    
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 차량 단건 조회
vehicles.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM vehicles WHERE id = ?'
    ).bind(id).all()
    
    if (results.length === 0) {
      return c.json({ success: false, error: 'Vehicle not found' }, 404)
    }
    
    return c.json({ success: true, data: results[0] })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 차량 생성
vehicles.post('/', async (c) => {
  try {
    const { vehicle_number, driver_name, driver_phone } = await c.req.json()
    
    if (!vehicle_number || !driver_name || !driver_phone) {
      return c.json({ 
        success: false, 
        error: 'Vehicle number, driver name, and driver phone are required' 
      }, 400)
    }
    
    // 베트남 시간 (UTC+7)
    const vietnamTime = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString()
    
    const result = await c.env.DB.prepare(
      'INSERT INTO vehicles (vehicle_number, driver_name, driver_phone, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(vehicle_number, driver_name, driver_phone, 'waiting', vietnamTime, vietnamTime).run()
    
    return c.json({ 
      success: true, 
      data: { 
        id: result.meta.last_row_id, 
        vehicle_number, 
        driver_name, 
        driver_phone,
        status: 'waiting' 
      } 
    }, 201)
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 차량 수정
vehicles.put('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { vehicle_number, driver_name, driver_phone, status } = await c.req.json()
    
    if (!vehicle_number || !driver_name || !driver_phone || !status) {
      return c.json({ 
        success: false, 
        error: 'Vehicle number, driver name, driver phone, and status are required' 
      }, 400)
    }
    
    // 베트남 시간 (UTC+7)
    const vietnamTime = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString()
    
    await c.env.DB.prepare(
      'UPDATE vehicles SET vehicle_number = ?, driver_name = ?, driver_phone = ?, status = ?, updated_at = ? WHERE id = ?'
    ).bind(vehicle_number, driver_name, driver_phone, status, vietnamTime, id).run()
    
    return c.json({ 
      success: true, 
      data: { id, vehicle_number, driver_name, driver_phone, status } 
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 차량 삭제
vehicles.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    await c.env.DB.prepare(
      'DELETE FROM vehicles WHERE id = ?'
    ).bind(id).run()
    
    return c.json({ success: true, message: 'Vehicle deleted' })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

export default vehicles
