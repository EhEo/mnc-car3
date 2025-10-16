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
      <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-0 sm:h-16">
          <div class="flex items-center justify-center mb-3 sm:mb-0">
            <i class="fas fa-car text-blue-600 text-3xl sm:text-2xl mr-2 sm:mr-3"></i>
            <h1 class="text-xl sm:text-xl font-bold text-gray-900">차량관리</h1>
          </div>
          <div class="flex items-center space-x-1 sm:space-x-2 overflow-x-auto w-full sm:w-auto justify-center">
            <button onclick="showView('dashboard')" class="nav-btn ${state.currentView === 'dashboard' ? 'active' : ''}">
              <i class="fas fa-chart-line text-lg sm:text-base sm:mr-2"></i><span class="hidden sm:inline">대시보드</span>
            </button>
            <button onclick="showView('boarding')" class="nav-btn ${state.currentView === 'boarding' ? 'active' : ''}">
              <i class="fas fa-clipboard-check text-lg sm:text-base sm:mr-2 text-green-600"></i><span class="hidden sm:inline">퇴근등록</span>
            </button>
            <button onclick="showView('employees')" class="nav-btn ${state.currentView === 'employees' ? 'active' : ''}">
              <i class="fas fa-users text-lg sm:text-base sm:mr-2"></i><span class="hidden sm:inline">직원관리</span>
            </button>
            <button onclick="showView('vehicles')" class="nav-btn ${state.currentView === 'vehicles' ? 'active' : ''}">
              <i class="fas fa-car text-lg sm:text-base sm:mr-2"></i><span class="hidden sm:inline">차량관리</span>
            </button>
            <button onclick="showView('records')" class="nav-btn ${state.currentView === 'records' ? 'active' : ''}">
              <i class="fas fa-history text-lg sm:text-base sm:mr-2"></i><span class="hidden sm:inline">탑승기록</span>
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
    <div class="space-y-4 sm:space-y-6">
      <!-- 통계 카드 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div class="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
          <div class="flex flex-col sm:flex-row items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-md p-2 sm:p-3 mb-2 sm:mb-0">
              <i class="fas fa-user-check text-green-600 text-lg sm:text-xl md:text-2xl"></i>
            </div>
            <div class="sm:ml-3 md:ml-4 text-center sm:text-left">
              <p class="text-xs sm:text-sm font-medium text-gray-600">근무중</p>
              <p class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">${workingCount}<span class="text-sm sm:text-base">명</span></p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
          <div class="flex flex-col sm:flex-row items-center">
            <div class="flex-shrink-0 bg-gray-100 rounded-md p-2 sm:p-3 mb-2 sm:mb-0">
              <i class="fas fa-user-clock text-gray-600 text-lg sm:text-xl md:text-2xl"></i>
            </div>
            <div class="sm:ml-3 md:ml-4 text-center sm:text-left">
              <p class="text-xs sm:text-sm font-medium text-gray-600">퇴근완료</p>
              <p class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">${leftCount}<span class="text-sm sm:text-base">명</span></p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
          <div class="flex flex-col sm:flex-row items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-md p-2 sm:p-3 mb-2 sm:mb-0">
              <i class="fas fa-car text-blue-600 text-lg sm:text-xl md:text-2xl"></i>
            </div>
            <div class="sm:ml-3 md:ml-4 text-center sm:text-left">
              <p class="text-xs sm:text-sm font-medium text-gray-600">운행대기</p>
              <p class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">${waitingVehicles}<span class="text-sm sm:text-base">대</span></p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
          <div class="flex flex-col sm:flex-row items-center">
            <div class="flex-shrink-0 bg-yellow-100 rounded-md p-2 sm:p-3 mb-2 sm:mb-0">
              <i class="fas fa-route text-yellow-600 text-lg sm:text-xl md:text-2xl"></i>
            </div>
            <div class="sm:ml-3 md:ml-4 text-center sm:text-left">
              <p class="text-xs sm:text-sm font-medium text-gray-600">오늘 탑승</p>
              <p class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">${todayCount}<span class="text-sm sm:text-base">건</span></p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 오늘의 탑승 기록 (간략) -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900">
            <i class="fas fa-history mr-2 text-blue-600"></i>오늘의 탑승 기록
          </h3>
          <button onclick="showView('records')" class="text-sm text-blue-600 hover:text-blue-800 font-medium">
            전체보기 <i class="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
        <div class="p-4 sm:p-6">
          ${state.boardingRecords.length === 0 ? `
            <p class="text-center text-gray-500 text-sm py-4">오늘의 탑승 기록이 없습니다</p>
          ` : `
            <div class="space-y-3">
              ${(() => {
                // 차량별로 그룹화
                const groupedRecords = state.boardingRecords.reduce((acc, record) => {
                  const key = record.vehicle_number;
                  if (!acc[key]) {
                    acc[key] = {
                      vehicle_number: record.vehicle_number,
                      driver_name: record.driver_name,
                      employees: [],
                      time: record.boarding_time
                    };
                  }
                  acc[key].employees.push(record.employee_name);
                  return acc;
                }, {});
                
                return Object.values(groupedRecords).map(group => `
                  <div class="border-l-4 border-blue-500 bg-blue-50 p-3 sm:p-4 rounded-r-lg">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <div class="font-semibold text-gray-900 text-sm sm:text-base">
                          <i class="fas fa-car mr-2"></i>${group.vehicle_number} (${group.driver_name})
                        </div>
                        <div class="text-xs sm:text-sm text-gray-600 mt-1">
                          <i class="fas fa-clock mr-1"></i>${new Date(group.time).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}
                        </div>
                      </div>
                      <div class="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        ${group.employees.length}명
                      </div>
                    </div>
                    <div class="text-xs sm:text-sm text-gray-700 mt-2">
                      <i class="fas fa-users mr-1"></i>
                      ${group.employees.join(', ')}
                    </div>
                  </div>
                `).join('');
              })()}
            </div>
          `}
        </div>
      </div>
      
      <!-- 퇴근 등록 및 초기화 버튼 (맨 아래로 이동) -->
      <div class="bg-white rounded-lg shadow p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div class="flex-1">
            <h3 class="text-base sm:text-lg font-semibold text-gray-900">시스템 관리</h3>
            <p class="text-xs sm:text-sm text-gray-600 mt-1">퇴근 등록 또는 시스템 초기화</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button onclick="showView('boarding')" class="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition font-medium">
              <i class="fas fa-clipboard-check mr-2"></i>퇴근 등록
            </button>
            <button onclick="resetSystem()" class="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-red-600 text-white text-sm sm:text-base rounded-lg hover:bg-red-700 transition font-medium">
              <i class="fas fa-redo mr-2"></i>초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}

// 직원 관리 뷰
function renderEmployees() {
  return `
    <div class="space-y-4 sm:space-y-6">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
        <i class="fas fa-users mr-2 text-blue-600"></i>직원 관리
      </h2>
      
      <!-- 직원 등록 폼 -->
      <div class="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          <i class="fas fa-user-plus mr-2 text-blue-600"></i>직원 등록
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이름</label>
            <input 
              type="text" 
              id="employee-name" 
              placeholder="홍길동"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">부서</label>
            <input 
              type="text" 
              id="employee-department" 
              placeholder="개발팀"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button onclick="createEmployee()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <i class="fas fa-plus mr-2"></i>직원 추가
          </button>
        </div>
      </div>
      
      <!-- 직원 목록 -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-900">직원 목록</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">이름</th>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">부서</th>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">상태</th>
                <th class="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">등록일</th>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">작업</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${state.employees.map(emp => `
                <tr class="hover:bg-gray-50">
                  <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">${emp.name}</td>
                  <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">${emp.department}</td>
                  <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">${getStatusBadge(emp.status, 'employee')}</td>
                  <td class="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(emp.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick='editEmployee(${JSON.stringify(emp)})' class="text-blue-600 hover:text-blue-900 mr-2 sm:mr-3">
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
    </div>
  `
}

// 차량 관리 뷰
function renderVehicles() {
  return `
    <div class="space-y-4 sm:space-y-6">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
        <i class="fas fa-car mr-2 text-blue-600"></i>차량 관리
      </h2>
      
      <!-- 차량 등록 폼 -->
      <div class="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          <i class="fas fa-plus-circle mr-2 text-blue-600"></i>차량 등록
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">차량번호</label>
            <input 
              type="text" 
              id="vehicle-number" 
              placeholder="12가3456"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">기사명</label>
            <input 
              type="text" 
              id="vehicle-driver-name" 
              placeholder="홍길동"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
            <input 
              type="text" 
              id="vehicle-driver-phone" 
              placeholder="010-1234-5678"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button onclick="createVehicle()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <i class="fas fa-plus mr-2"></i>차량 추가
          </button>
        </div>
      </div>
      
      <!-- 차량 목록 -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 class="text-base font-semibold text-gray-900">차량 목록</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">차량번호</th>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">기사명</th>
                <th class="hidden sm:table-cell px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">전화번호</th>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">상태</th>
                <th class="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">등록일</th>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">작업</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${state.vehicles.map(vehicle => `
                <tr class="hover:bg-gray-50">
                  <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">${vehicle.vehicle_number}</td>
                  <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">${vehicle.driver_name}</td>
                  <td class="hidden sm:table-cell px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">${vehicle.driver_phone}</td>
                  <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">${getStatusBadge(vehicle.status, 'vehicle')}</td>
                  <td class="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(vehicle.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick='editVehicle(${JSON.stringify(vehicle)})' class="text-blue-600 hover:text-blue-900 mr-2 sm:mr-3">
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
    </div>
  `
}

// 퇴근 등록 뷰
function renderBoarding() {
  const availableVehicles = state.vehicles.filter(v => v.status === 'waiting')
  const availableEmployees = state.employees.filter(e => e.status === 'working')
  
  return `
    <div class="space-y-4 sm:space-y-6">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
        <i class="fas fa-clipboard-check mr-2 text-blue-600"></i>퇴근 등록
      </h2>
      
      <div class="bg-white rounded-lg shadow p-4 sm:p-6">
        <div class="space-y-4 sm:space-y-6">
          <!-- 차량 선택 -->
          <div>
            <label class="block text-sm sm:text-base font-medium text-gray-700 mb-3">
              <i class="fas fa-car mr-2"></i>차량 선택
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              ${availableVehicles.length === 0 ? `
                <p class="text-gray-500 text-sm col-span-full text-center py-4">운행 대기 중인 차량이 없습니다</p>
              ` : availableVehicles.map(vehicle => `
                <div 
                  onclick="selectVehicle(${vehicle.id})"
                  class="border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition ${
                    state.selectedVehicle === vehicle.id 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }"
                >
                  <div class="font-semibold text-sm sm:text-base text-gray-900">${vehicle.vehicle_number}</div>
                  <div class="text-xs sm:text-sm text-gray-600 mt-1">
                    <i class="fas fa-user mr-1"></i>${vehicle.driver_name}
                  </div>
                  <div class="text-xs sm:text-sm text-gray-500 mt-1">
                    <i class="fas fa-phone mr-1"></i>${vehicle.driver_phone}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- 직원 선택 -->
          <div>
            <label class="block text-sm sm:text-base font-medium text-gray-700 mb-3">
              <i class="fas fa-users mr-2"></i>탑승 직원 선택 (다중 선택 가능)
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              ${availableEmployees.length === 0 ? `
                <p class="text-gray-500 text-sm col-span-full text-center py-4">근무 중인 직원이 없습니다</p>
              ` : availableEmployees.map(emp => `
                <div 
                  onclick="toggleEmployee(${emp.id})"
                  class="border-2 rounded-lg p-2 sm:p-3 cursor-pointer transition ${
                    state.selectedEmployees.includes(emp.id) 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }"
                >
                  <div class="font-medium text-xs sm:text-sm text-gray-900 break-words">${emp.name}</div>
                  <div class="text-xs text-gray-500 mt-1 break-words">${emp.department}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- 등록 버튼 -->
          <div class="flex justify-end pt-2">
            <button 
              onclick="submitBoarding()" 
              class="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
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

// 탑승기록 전체보기 뷰
function renderRecords() {
  return `
    <div class="space-y-4 sm:space-y-6">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
        <i class="fas fa-history mr-2 text-blue-600"></i>탑승 기록
      </h2>
      
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">시간</th>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">차량번호</th>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">기사명</th>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">직원명</th>
                <th class="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">부서</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${state.boardingRecords.length === 0 ? `
                <tr>
                  <td colspan="5" class="px-3 sm:px-6 py-8 text-center text-gray-500 text-sm">
                    <i class="fas fa-inbox text-4xl text-gray-300 mb-2"></i>
                    <p>오늘의 탑승 기록이 없습니다</p>
                  </td>
                </tr>
              ` : state.boardingRecords.map(record => `
                <tr class="hover:bg-gray-50">
                  <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    ${new Date(record.boarding_time).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}
                  </td>
                  <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">${record.vehicle_number}</td>
                  <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">${record.driver_name}</td>
                  <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">${record.employee_name}</td>
                  <td class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">${record.department}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
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
    case 'records':
      content = renderRecords()
      break
  }
  
  app.innerHTML = `
    ${renderNav()}
    <main class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      ${content}
    </main>
    <style>
      .nav-btn {
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        font-weight: 500;
        transition: all 0.2s;
        color: #4B5563;
        white-space: nowrap;
      }
      @media (min-width: 640px) {
        .nav-btn {
          padding: 0.5rem 1rem;
        }
      }
      .nav-btn:hover {
        background-color: #F3F4F6;
      }
      .nav-btn.active {
        background-color: #3B82F6;
        color: white;
      }
      .nav-btn.active i {
        color: white !important;
      }
      
      /* 모바일에서 테이블 스크롤 부드럽게 */
      .overflow-x-auto {
        -webkit-overflow-scrolling: touch;
      }
      
      /* 작은 화면에서 텍스트 줄바꿈 방지 */
      @media (max-width: 640px) {
        .whitespace-nowrap {
          white-space: nowrap;
        }
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
function createEmployee() {
  const name = document.getElementById('employee-name').value.trim()
  const department = document.getElementById('employee-department').value.trim()
  
  if (!name || !department) {
    alert('이름과 부서를 모두 입력해주세요.')
    return
  }
  
  api.createEmployee({ name, department })
    .then(() => {
      alert('직원이 추가되었습니다.')
      document.getElementById('employee-name').value = ''
      document.getElementById('employee-department').value = ''
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
function createVehicle() {
  const vehicle_number = document.getElementById('vehicle-number').value.trim()
  const driver_name = document.getElementById('vehicle-driver-name').value.trim()
  const driver_phone = document.getElementById('vehicle-driver-phone').value.trim()
  
  if (!vehicle_number || !driver_name || !driver_phone) {
    alert('모든 항목을 입력해주세요.')
    return
  }
  
  api.createVehicle({ vehicle_number, driver_name, driver_phone })
    .then(() => {
      alert('차량이 추가되었습니다.')
      document.getElementById('vehicle-number').value = ''
      document.getElementById('vehicle-driver-name').value = ''
      document.getElementById('vehicle-driver-phone').value = ''
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
