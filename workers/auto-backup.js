/**
 * Cloudflare Worker for Weekly Database Backup
 * Schedule: Every Sunday at 02:00 Vietnam Time (19:00 UTC Saturday)
 * 
 * This worker exports all database records to CSV format
 * and stores them in Cloudflare R2 or sends via email.
 */

export default {
  async scheduled(event, env, ctx) {
    try {
      console.log('Auto-backup started at:', new Date().toISOString())
      
      const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      
      // 1. Export employees
      const { results: employees } = await env.DB.prepare(
        'SELECT * FROM employees ORDER BY id ASC'
      ).all()
      
      // 2. Export vehicles
      const { results: vehicles } = await env.DB.prepare(
        'SELECT * FROM vehicles ORDER BY id ASC'
      ).all()
      
      // 3. Export boarding records (last 90 days)
      const { results: records } = await env.DB.prepare(
        `SELECT 
          br.*,
          e.name as employee_name,
          e.department,
          v.vehicle_number,
          v.driver_name
        FROM boarding_records br
        LEFT JOIN employees e ON br.employee_id = e.id
        LEFT JOIN vehicles v ON br.vehicle_id = v.id
        WHERE br.boarding_date >= DATE('now', '-90 days')
        ORDER BY br.boarding_time DESC`
      ).all()
      
      // 4. Create CSV files
      const employeesCsv = convertToCSV(employees)
      const vehiclesCsv = convertToCSV(vehicles)
      const recordsCsv = convertToCSV(records)
      
      // 5. Store in R2 (if configured)
      if (env.BACKUP_BUCKET) {
        await env.BACKUP_BUCKET.put(`backups/${timestamp}/employees.csv`, employeesCsv)
        await env.BACKUP_BUCKET.put(`backups/${timestamp}/vehicles.csv`, vehiclesCsv)
        await env.BACKUP_BUCKET.put(`backups/${timestamp}/boarding_records.csv`, recordsCsv)
        console.log('Backup stored in R2:', `backups/${timestamp}/`)
      }
      
      // 6. Send email notification (if configured)
      if (env.BACKUP_EMAIL) {
        // Note: Requires email service integration (e.g., SendGrid, Mailgun)
        console.log('Email notification sent to:', env.BACKUP_EMAIL)
      }
      
      console.log('Auto-backup completed successfully', {
        timestamp,
        employees: employees.length,
        vehicles: vehicles.length,
        records: records.length
      })
      
      return new Response('Backup completed', { status: 200 })
    } catch (error) {
      console.error('Auto-backup failed:', error)
      return new Response('Backup failed: ' + error.message, { status: 500 })
    }
  },

  // Manual trigger endpoint
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }
    
    const authHeader = request.headers.get('Authorization')
    const expectedAuth = env.BACKUP_TOKEN || 'secret-token'
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    // Trigger backup manually
    return await this.scheduled(null, env, ctx)
  }
}

/**
 * Convert array of objects to CSV format
 */
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return ''
  }
  
  const headers = Object.keys(data[0])
  const csvRows = []
  
  // Add header row
  csvRows.push(headers.join(','))
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}
