import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const employees = new Hono<{ Bindings: Bindings }>()

// 직원 목록 조회
employees.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM employees ORDER BY created_at DESC'
    ).all()
    
    return c.json({ success: true, data: results })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 직원 단건 조회
employees.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM employees WHERE id = ?'
    ).bind(id).all()
    
    if (results.length === 0) {
      return c.json({ success: false, error: 'Employee not found' }, 404)
    }
    
    return c.json({ success: true, data: results[0] })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 직원 생성
employees.post('/', async (c) => {
  try {
    const { name, department } = await c.req.json()
    
    if (!name || !department) {
      return c.json({ success: false, error: 'Name and department are required' }, 400)
    }
    
    const result = await c.env.DB.prepare(
      'INSERT INTO employees (name, department, status) VALUES (?, ?, ?)'
    ).bind(name, department, 'working').run()
    
    return c.json({ 
      success: true, 
      data: { 
        id: result.meta.last_row_id, 
        name, 
        department, 
        status: 'working' 
      } 
    }, 201)
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 직원 수정
employees.put('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { name, department, status } = await c.req.json()
    
    if (!name || !department || !status) {
      return c.json({ success: false, error: 'Name, department, and status are required' }, 400)
    }
    
    await c.env.DB.prepare(
      'UPDATE employees SET name = ?, department = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, department, status, id).run()
    
    return c.json({ 
      success: true, 
      data: { id, name, department, status } 
    })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 직원 삭제
employees.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    await c.env.DB.prepare(
      'DELETE FROM employees WHERE id = ?'
    ).bind(id).run()
    
    return c.json({ success: true, message: 'Employee deleted' })
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500)
  }
})

export default employees
