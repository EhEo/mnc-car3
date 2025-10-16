// 앱 상태 관리
const state = {
  employees: [],
  vehicles: [],
  boardingRecords: [],
  stats: null,
  currentView: 'dashboard',
  selectedVehicle: null,
  selectedEmployees: []
}

// API 호출 함수
const api = {
  async getEmployees() {
    const res = await axios.get('/api/employees')
    return res.data
  },
  async createEmployee(data) {
    const res = await axios.post('/api/employees', data)
    return res.data
  },
  async updateEmployee(id, data) {
    const res = await axios.put(`/api/employees/${id}`, data)
    return res.data
  },
  async deleteEmployee(id) {
    const res = await axios.delete(`/api/employees/${id}`)
    return res.data
  },
  async getVehicles() {
    const res = await axios.get('/api/vehicles')
    return res.data
  },
  async createVehicle(data) {
    const res = await axios.post('/api/vehicles', data)
    return res.data
  },
  async updateVehicle(id, data) {
    const res = await axios.put(`/api/vehicles/${id}`, data)
    return res.data
  },
  async deleteVehicle(id) {
    const res = await axios.delete(`/api/vehicles/${id}`)
    return res.data
  },
  async registerBoarding(data) {
    const res = await axios.post('/api/boarding/register', data)
    return res.data
  },
  async getBoardingRecords() {
    const res = await axios.get('/api/boarding/records')
    return res.data
  },
  async getStats() {
    const res = await axios.get('/api/boarding/stats')
    return res.data
  },
  async resetSystem() {
    const res = await axios.post('/api/boarding/reset')
    return res.data
  }
}

// 데이터 로드
async function loadData() {
  try {
    const [employees, vehicles, records, stats] = await Promise.all([
      api.getEmployees(),
      api.getVehicles(),
      api.getBoardingRecords(),
      api.getStats()
    ])
    
    state.employees = employees.data || []
    state.vehicles = vehicles.data || []
    state.boardingRecords = records.data || []
    state.stats = stats.data || null
    
    render()
  } catch (error) {
    console.error('데이터 로드 실패:', error)
    alert('데이터를 불러오는데 실패했습니다.')
  }
}

// 상태별 뱃지 색상
function getStatusBadge(status, type) {
  const badges = {
    employee: {
      working: '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">근무중</span>',
      left: '<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">퇴근완료</span>'
    },
    vehicle: {
      waiting: '<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">운행대기</span>',
      driving: '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">운행중</span>',
      completed: '<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">퇴근완료</span>'
    }
  }
  return badges[type][status] || status
}

// 네비게이션
function renderNav() {
  return `
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <i class="fas fa-car text-blue-600 text-2xl mr-3"></i>
              <h1 class="text-xl font-bold text-gray-900">차량 관리 시스템</h1>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <button onclick="showView('dashboard')" class="nav-btn ${state.currentView === 'dashboard' ? 'active' : ''}">
              <i class="fas fa-chart-line mr-2"></i>대시보드
            </button>
            <button onclick="showView('employees')" class="nav-btn ${state.currentView === 'employees' ? 'active' : ''}">
              <i class="fas fa-users mr-2"></i>직원 관리
            </button>
            <button onclick="showView('vehicles')" class="nav-btn ${state.currentView === 'vehicles' ? 'active' : ''}">
              <i class="fas fa-car mr-2"></i>차량 관리
            </button>
            <button onclick="showView('boarding')" class="nav-btn ${state.currentView === 'boarding' ? 'active' : ''}">
              <i class="fas fa-clipboard-check mr-2"></i>퇴근 등록
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
}

// 대시보드 뷰
function renderDashboard() {
  const employeeStats = state.stats?.employees || []
  const vehicleStats = state.stats?.vehicles || []
  const todayCount = state.stats?.today_boarding_count || 0
  
  const workingCount = employeeStats.find(s => s.status === 'working')?.count || 0
  const leftCount = employeeStats.find(s => s.status === 'left')?.count || 0
  
  const waitingVehicles = vehicleStats.find(s => s.status === 'waiting')?.count || 0
  const drivingVehicles = vehicleStats.find(s => s.status === 'driving')?.count || 0
  const completedVehicles = vehicleStats.find(s => s.status === 'completed')?.count || 0
  
  return `
    <div class="space-y-6">
      <!-- 통계 카드 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
              <i class="fas fa-user-check text-green-600 text-2xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">근무중</p>
              <p class="text-2xl font-bold text-gray-900">${workingCount}명</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-gray-100 rounded-md p-3">
              <i class="fas fa-user-clock text-gray-600 text-2xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">퇴근완료</p>
              <p class="text-2xl font-bold text-gray-900">${leftCount}명</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <i class="fas fa-car text-blue-600 text-2xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">운행대기</p>
              <p class="text-2xl font-bold text-gray-900">${waitingVehicles}대</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <i class="fas fa-route text-yellow-600 text-2xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">오늘 탑승</p>
              <p class="text-2xl font-bold text-gray-900">${todayCount}건</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 초기화 버튼 -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">시스템 초기화</h3>
            <p class="text-sm text-gray-600 mt-1">모든 직원과 차량의 상태를 초기화합니다</p>
          </div>
          <button onclick="resetSystem()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            <i class="fas fa-redo mr-2"></i>초기화
          </button>
        </div>
      </div>
      
      <!-- 오늘의 탑승 기록 -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-history mr-2 text-blue-600"></i>오늘의 탑승 기록
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">시간</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">차량번호</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">기사명</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">직원명</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">부서</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${state.boardingRecords.length === 0 ? `
                <tr>
                  <td colspan="5" class="px-6 py-4 text-center text-gray-500">오늘의 탑승 기록이 없습니다</td>
                </tr>
              ` : state.boardingRecords.map(record => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${new Date(record.boarding_time).toLocaleTimeString('ko-KR')}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.vehicle_number}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.driver_name}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${record.employee_name}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.department}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
}

// 직원 관리 뷰
function renderEmployees() {
  return `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">
          <i class="fas fa-users mr-2 text-blue-600"></i>직원 관리
        </h2>
        <button onclick="showEmployeeModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <i class="fas fa-plus mr-2"></i>직원 추가
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">부서</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">등록일</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${state.employees.map(emp => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${emp.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${emp.department}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${getStatusBadge(emp.status, 'employee')}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${new Date(emp.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onclick='editEmployee(${JSON.stringify(emp)})' class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deleteEmployee(${emp.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

// 차량 관리 뷰
function renderVehicles() {
  return `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">
          <i class="fas fa-car mr-2 text-blue-600"></i>차량 관리
        </h2>
        <button onclick="showVehicleModal()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <i class="fas fa-plus mr-2"></i>차량 추가
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">차량번호</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">기사명</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">전화번호</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">등록일</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${state.vehicles.map(vehicle => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${vehicle.vehicle_number}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${vehicle.driver_name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${vehicle.driver_phone}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${getStatusBadge(vehicle.status, 'vehicle')}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${new Date(vehicle.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onclick='editVehicle(${JSON.stringify(vehicle)})' class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deleteVehicle(${vehicle.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

// 퇴근 등록 뷰
function renderBoarding() {
  const availableVehicles = state.vehicles.filter(v => v.status === 'waiting')
  const availableEmployees = state.employees.filter(e => e.status === 'working')
  
  return `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900">
        <i class="fas fa-clipboard-check mr-2 text-blue-600"></i>퇴근 등록
      </h2>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="space-y-6">
          <!-- 차량 선택 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-car mr-2"></i>차량 선택
            </label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              ${availableVehicles.length === 0 ? `
                <p class="text-gray-500 col-span-3">운행 대기 중인 차량이 없습니다</p>
              ` : availableVehicles.map(vehicle => `
                <div 
                  onclick="selectVehicle(${vehicle.id})"
                  class="border-2 rounded-lg p-4 cursor-pointer transition ${
                    state.selectedVehicle === vehicle.id 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }"
                >
                  <div class="font-semibold text-gray-900">${vehicle.vehicle_number}</div>
                  <div class="text-sm text-gray-600 mt-1">
                    <i class="fas fa-user mr-1"></i>${vehicle.driver_name}
                  </div>
                  <div class="text-sm text-gray-500 mt-1">
                    <i class="fas fa-phone mr-1"></i>${vehicle.driver_phone}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- 직원 선택 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-users mr-2"></i>탑승 직원 선택 (다중 선택 가능)
            </label>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              ${availableEmployees.length === 0 ? `
                <p class="text-gray-500 col-span-4">근무 중인 직원이 없습니다</p>
              ` : availableEmployees.map(emp => `
                <div 
                  onclick="toggleEmployee(${emp.id})"
                  class="border-2 rounded-lg p-3 cursor-pointer transition ${
                    state.selectedEmployees.includes(emp.id) 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }"
                >
                  <div class="font-medium text-gray-900">${emp.name}</div>
                  <div class="text-xs text-gray-500 mt-1">${emp.department}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- 등록 버튼 -->
          <div class="flex justify-end">
            <button 
              onclick="submitBoarding()" 
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              ${!state.selectedVehicle || state.selectedEmployees.length === 0 ? 'disabled' : ''}
            >
              <i class="fas fa-check mr-2"></i>
              퇴근 등록 ${state.selectedEmployees.length > 0 ? `(${state.selectedEmployees.length}명)` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}

// 렌더링
function render() {
  const app = document.getElementById('app')
  
  let content = ''
  switch (state.currentView) {
    case 'dashboard':
      content = renderDashboard()
      break
    case 'employees':
      content = renderEmployees()
      break
    case 'vehicles':
      content = renderVehicles()
      break
    case 'boarding':
      content = renderBoarding()
      break
  }
  
  app.innerHTML = `
    ${renderNav()}
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      ${content}
    </main>
    <style>
      .nav-btn {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 500;
        transition: all 0.2s;
        color: #4B5563;
      }
      .nav-btn:hover {
        background-color: #F3F4F6;
      }
      .nav-btn.active {
        background-color: #3B82F6;
        color: white;
      }
    </style>
  `
}

// 뷰 전환
function showView(view) {
  state.currentView = view
  state.selectedVehicle = null
  state.selectedEmployees = []
  render()
}

// 직원 관리 함수들
function showEmployeeModal() {
  const name = prompt('직원 이름:')
  if (!name) return
  
  const department = prompt('부서:')
  if (!department) return
  
  api.createEmployee({ name, department })
    .then(() => {
      alert('직원이 추가되었습니다.')
      loadData()
    })
    .catch(err => {
      alert('직원 추가 실패: ' + err.message)
    })
}

function editEmployee(emp) {
  const name = prompt('직원 이름:', emp.name)
  if (!name) return
  
  const department = prompt('부서:', emp.department)
  if (!department) return
  
  const status = confirm('근무 중 상태로 설정하시겠습니까? (취소 시 퇴근완료)') ? 'working' : 'left'
  
  api.updateEmployee(emp.id, { name, department, status })
    .then(() => {
      alert('직원 정보가 수정되었습니다.')
      loadData()
    })
    .catch(err => {
      alert('직원 수정 실패: ' + err.message)
    })
}

function deleteEmployee(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return
  
  api.deleteEmployee(id)
    .then(() => {
      alert('직원이 삭제되었습니다.')
      loadData()
    })
    .catch(err => {
      alert('직원 삭제 실패: ' + err.message)
    })
}

// 차량 관리 함수들
function showVehicleModal() {
  const vehicle_number = prompt('차량번호:')
  if (!vehicle_number) return
  
  const driver_name = prompt('기사 이름:')
  if (!driver_name) return
  
  const driver_phone = prompt('전화번호:')
  if (!driver_phone) return
  
  api.createVehicle({ vehicle_number, driver_name, driver_phone })
    .then(() => {
      alert('차량이 추가되었습니다.')
      loadData()
    })
    .catch(err => {
      alert('차량 추가 실패: ' + err.message)
    })
}

function editVehicle(vehicle) {
  const vehicle_number = prompt('차량번호:', vehicle.vehicle_number)
  if (!vehicle_number) return
  
  const driver_name = prompt('기사 이름:', vehicle.driver_name)
  if (!driver_name) return
  
  const driver_phone = prompt('전화번호:', vehicle.driver_phone)
  if (!driver_phone) return
  
  const statusMap = { 'waiting': 0, 'driving': 1, 'completed': 2 }
  const statusOptions = ['운행대기(waiting)', '운행중(driving)', '퇴근완료(completed)']
  const statusInput = prompt('상태 선택:\n0: 운행대기\n1: 운행중\n2: 퇴근완료', '0')
  
  const statusValues = ['waiting', 'driving', 'completed']
  const status = statusValues[parseInt(statusInput)] || 'waiting'
  
  api.updateVehicle(vehicle.id, { vehicle_number, driver_name, driver_phone, status })
    .then(() => {
      alert('차량 정보가 수정되었습니다.')
      loadData()
    })
    .catch(err => {
      alert('차량 수정 실패: ' + err.message)
    })
}

function deleteVehicle(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return
  
  api.deleteVehicle(id)
    .then(() => {
      alert('차량이 삭제되었습니다.')
      loadData()
    })
    .catch(err => {
      alert('차량 삭제 실패: ' + err.message)
    })
}

// 퇴근 등록 함수들
function selectVehicle(id) {
  state.selectedVehicle = id
  render()
}

function toggleEmployee(id) {
  const index = state.selectedEmployees.indexOf(id)
  if (index > -1) {
    state.selectedEmployees.splice(index, 1)
  } else {
    state.selectedEmployees.push(id)
  }
  render()
}

function submitBoarding() {
  if (!state.selectedVehicle || state.selectedEmployees.length === 0) {
    alert('차량과 직원을 선택해주세요.')
    return
  }
  
  api.registerBoarding({
    vehicle_id: state.selectedVehicle,
    employee_ids: state.selectedEmployees
  })
    .then(() => {
      alert(`${state.selectedEmployees.length}명의 퇴근이 등록되었습니다.`)
      state.selectedVehicle = null
      state.selectedEmployees = []
      loadData()
    })
    .catch(err => {
      alert('퇴근 등록 실패: ' + err.message)
    })
}

// 시스템 초기화
function resetSystem() {
  if (!confirm('모든 직원과 차량의 상태를 초기화하시겠습니까?\n(직원: 근무중, 차량: 운행대기)')) {
    return
  }
  
  api.resetSystem()
    .then(() => {
      alert('시스템이 초기화되었습니다.')
      loadData()
    })
    .catch(err => {
      alert('초기화 실패: ' + err.message)
    })
}

// 앱 시작
loadData()
