/**
 * Cloudflare Worker for Daily Auto-Reset
 * Schedule: Every day at 04:00 Vietnam Time (21:00 UTC previous day)
 * 
 * This worker automatically resets employee and vehicle statuses
 * without deleting today's boarding records (different from manual reset).
 */

export default {
  async scheduled(event, env, ctx) {
    try {
      console.log('Auto-reset started at:', new Date().toISOString())
      
      // 1. Reset employees: 'left' -> 'working' (keep business_trip, vacation)
      const employeeResult = await env.DB.prepare(
        'UPDATE employees SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE status = ?'
      ).bind('working', 'left').run()
      
      console.log('Employees reset:', employeeResult.meta?.changes || 0)
      
      // 2. Reset vehicles: 'completed', 'driving' -> 'waiting' (keep repair, out)
      const vehicleResult = await env.DB.prepare(
        'UPDATE vehicles SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE status IN (?, ?)'
      ).bind('waiting', 'completed', 'driving').run()
      
      console.log('Vehicles reset:', vehicleResult.meta?.changes || 0)
      
      // 3. Log the auto-reset event
      console.log('Auto-reset completed successfully', {
        timestamp: new Date().toISOString(),
        employeesReset: employeeResult.meta?.changes || 0,
        vehiclesReset: vehicleResult.meta?.changes || 0
      })
      
      return new Response('Auto-reset completed', { status: 200 })
    } catch (error) {
      console.error('Auto-reset failed:', error)
      return new Response('Auto-reset failed: ' + error.message, { status: 500 })
    }
  },

  // Optional: HTTP endpoint for manual trigger (testing purposes)
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed. Use POST to manually trigger reset.', { status: 405 })
    }
    
    // Check for authorization header (optional security)
    const authHeader = request.headers.get('Authorization')
    const expectedAuth = env.RESET_TOKEN || 'secret-token'
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    try {
      // Same reset logic as scheduled()
      const employeeResult = await env.DB.prepare(
        'UPDATE employees SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE status = ?'
      ).bind('working', 'left').run()
      
      const vehicleResult = await env.DB.prepare(
        'UPDATE vehicles SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE status IN (?, ?)'
      ).bind('waiting', 'completed', 'driving').run()
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Manual reset completed',
        employeesReset: employeeResult.meta?.changes || 0,
        vehiclesReset: vehicleResult.meta?.changes || 0,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}
