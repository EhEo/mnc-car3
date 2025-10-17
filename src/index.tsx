import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import employees from './routes/employees'
import vehicles from './routes/vehicles'
import boarding from './routes/boarding'
import reports from './routes/reports'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS 설정
app.use('/api/*', cors())

// 정적 파일 제공
app.use('/static/*', serveStatic({ root: './public' }))

// PWA manifest 제공
app.get('/manifest.json', (c) => {
  return c.json({
    name: '퇴근차량관리',
    short_name: '퇴근차량관리',
    description: '직원 퇴근 차량 관리 시스템',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3B82F6',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/static/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/static/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  })
})

// API 라우트
app.route('/api/employees', employees)
app.route('/api/vehicles', vehicles)
app.route('/api/boarding', boarding)
app.route('/api/reports', reports)

// 메인 페이지
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="#3B82F6">
        <meta name="description" content="직원 퇴근 차량 관리 시스템">
        
        <!-- PWA 설정 -->
        <link rel="manifest" href="/manifest.json">
        <link rel="icon" type="image/png" sizes="192x192" href="/static/icon-192.png">
        <link rel="icon" type="image/png" sizes="512x512" href="/static/icon-512.png">
        <link rel="apple-touch-icon" href="/static/icon-512.png">
        
        <title>퇴근차량관리</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div id="app"></div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
