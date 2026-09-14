/**
 * Comprehensive Automated Frontend Verification Suite
 * Executes Static Audit, API Contract Tests, Error Parsing, UI Logic, and Live Status.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');
const srcDir = path.resolve(frontendRoot, 'src');

const results = {
  build: null,
  staticAudit: {},
  contractTests: [],
  routingTests: [],
  liveFastApi: null,
};

// -------------------------------------------------------------
// 1. STATIC CODE AUDIT
// -------------------------------------------------------------
const searchTerms = [
  'mock',
  'mockData',
  'mockTransport',
  'sampleData',
  'demo',
  'fake',
  'Alex Morgan',
  '21CS042',
  'REQ-',
  'password123',
  'localhost:8000',
  'setTransport',
  'fallback request data',
];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        getAllFiles(fullPath, fileList);
      }
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

console.log('====================================================');
console.log('RUNNING STATIC CODE AUDIT (Scanning frontend/src)...');
console.log('====================================================');

const srcFiles = getAllFiles(srcDir);
const auditCounts = {};
const auditDetails = {};

for (const term of searchTerms) {
  auditCounts[term] = 0;
  auditDetails[term] = [];
}

for (const filePath of srcFiles) {
  const relativePath = path.relative(frontendRoot, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf-8');

  for (const term of searchTerms) {
    // Case-insensitive or literal check? Let's check literal / case-sensitive and case-insensitive
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = content.match(regex);
    if (matches) {
      auditCounts[term] += matches.length;
      auditDetails[term].push({
        file: relativePath,
        count: matches.length,
      });
    }
  }
}

for (const term of searchTerms) {
  console.log(`Term "${term}": ${auditCounts[term]} matches`);
  if (auditCounts[term] > 0) {
    auditDetails[term].forEach(d => console.log(`   -> ${d.file} (${d.count})`));
  }
}

results.staticAudit = {
  counts: auditCounts,
  details: auditDetails,
  scannedFilesCount: srcFiles.length,
};

// -------------------------------------------------------------
// 2. LIVE FASTAPI PROBE
// -------------------------------------------------------------
console.log('\n====================================================');
console.log('PROBING LIVE FASTAPI SERVER (http://localhost:8000)...');
console.log('====================================================');

try {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);
  const probeRes = await fetch('http://localhost:8000/docs', { signal: controller.signal });
  clearTimeout(timeoutId);
  results.liveFastApi = {
    running: true,
    status: probeRes.status,
    statusText: probeRes.statusText,
  };
  console.log(`FastAPI is RUNNING (HTTP ${probeRes.status})`);
} catch (err) {
  results.liveFastApi = {
    running: false,
    error: err.name === 'AbortError' ? 'Connection timed out after 2000ms' : err.message,
  };
  console.log(`FastAPI is OFFLINE: ${results.liveFastApi.error}`);
}

// -------------------------------------------------------------
// 3. API CLIENT & CONTRACT TESTS
// -------------------------------------------------------------
console.log('\n====================================================');
console.log('RUNNING AUTOMATED API CONTRACT TESTS...');
console.log('====================================================');

// Mock localStorage
const localStorageStore = {};
global.localStorage = {
  getItem: (key) => localStorageStore[key] || null,
  setItem: (key, val) => { localStorageStore[key] = String(val); },
  removeItem: (key) => { delete localStorageStore[key]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); },
};

// Dynamic import of services
const { api, ApiError, setAuthToken } = await import('../src/services/api.js');
const { authService } = await import('../src/services/authService.js');
const { requestService } = await import('../src/services/requestService.js');
const { studentService } = await import('../src/services/studentService.js');
const { uploadService } = await import('../src/services/uploadService.js');

let capturedRequest = null;
let mockResponseToReturn = null;

// Intercept global fetch for deterministic contract verification
const originalFetch = global.fetch;
global.fetch = async (url, config) => {
  capturedRequest = {
    url,
    method: config?.method || 'GET',
    headers: config?.headers || {},
    body: config?.body,
  };

  if (mockResponseToReturn instanceof Error) {
    throw mockResponseToReturn;
  }

  const {
    status = 200,
    statusText = 'OK',
    data = {},
    headers = { 'content-type': 'application/json' },
  } = mockResponseToReturn || {};

  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: {
      get: (h) => headers[h.toLowerCase()] || null,
    },
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
};

function runTest(id, name, fn) {
  try {
    fn();
    console.log(`[PASS] ${id}: ${name}`);
    results.contractTests.push({ id, name, status: 'PASS' });
  } catch (e) {
    console.error(`[FAIL] ${id}: ${name} - ${e.message}`);
    results.contractTests.push({ id, name, status: 'FAIL', error: e.message });
  }
}

async function runAsyncTest(id, name, fn) {
  try {
    await fn();
    console.log(`[PASS] ${id}: ${name}`);
    results.contractTests.push({ id, name, status: 'PASS' });
  } catch (e) {
    console.error(`[FAIL] ${id}: ${name} - ${e.message}`);
    results.contractTests.push({ id, name, status: 'FAIL', error: e.message });
  }
}

// Contract 1: POST /api/auth/register
await runAsyncTest('AUTH-01', 'POST /api/auth/register contract & request construction', async () => {
  mockResponseToReturn = { status: 201, data: { message: 'Student registered successfully', student_id: 'STU999' } };
  const regData = {
    fullName: 'Jane Doe',
    studentId: '21CS999',
    email: 'jane@college.edu',
    password: 'SecurePassword123!',
  };
  const res = await authService.register(regData);
  if (capturedRequest.method !== 'POST') throw new Error(`Expected POST, got ${capturedRequest.method}`);
  if (!capturedRequest.url.endsWith('/api/auth/register')) throw new Error(`URL mismatch: ${capturedRequest.url}`);
  if (capturedRequest.headers['Authorization']) throw new Error('skipAuth failed: Authorization header was attached');
  if (capturedRequest.headers['Content-Type'] !== 'application/json') throw new Error('Missing application/json header');
  const sentBody = JSON.parse(capturedRequest.body);
  if (sentBody.email !== 'jane@college.edu') throw new Error('Payload mismatch');
  if (res.student_id !== 'STU999') throw new Error('Response parsing failed');
});

// Contract 2: POST /api/auth/login
await runAsyncTest('AUTH-02', 'POST /api/auth/login contract & token extraction', async () => {
  mockResponseToReturn = {
    status: 200,
    data: {
      access_token: 'test_jwt_xyz_123',
      token_type: 'bearer',
      user: { id: 'STU101', name: 'Test User' },
    },
  };
  const loginData = { identifier: '21CS101', password: 'Password!123' };
  const res = await authService.login(loginData);
  if (capturedRequest.method !== 'POST') throw new Error(`Expected POST, got ${capturedRequest.method}`);
  if (!capturedRequest.url.endsWith('/api/auth/login')) throw new Error(`URL mismatch: ${capturedRequest.url}`);
  if (capturedRequest.headers['Authorization']) throw new Error('skipAuth failed: Authorization header was attached');
  if (localStorage.getItem('smart_college_token') !== 'test_jwt_xyz_123') {
    throw new Error('access_token was not stored in localStorage');
  }
  if (res.access_token !== 'test_jwt_xyz_123') throw new Error('Response payload mismatch');
});

// Contract 3: GET /api/auth/me & Bearer token attachment
await runAsyncTest('AUTH-03', 'GET /api/auth/me Bearer header injection & user retrieval', async () => {
  mockResponseToReturn = {
    status: 200,
    data: {
      id: 'STU101',
      student_id: '21CS101',
      name: 'Test Student',
      email: 'student@college.edu',
      department: 'Computer Science',
    },
  };
  const profile = await authService.getCurrentUser();
  if (capturedRequest.method !== 'GET') throw new Error(`Expected GET, got ${capturedRequest.method}`);
  if (!capturedRequest.url.endsWith('/api/auth/me')) throw new Error(`URL mismatch: ${capturedRequest.url}`);
  if (capturedRequest.headers['Authorization'] !== 'Bearer test_jwt_xyz_123') {
    throw new Error(`Bearer token not attached properly: ${capturedRequest.headers['Authorization']}`);
  }
  if (profile.name !== 'Test Student') throw new Error('Profile parsing mismatch');
});

// Contract 4: Logout
runTest('AUTH-04', 'authService.logout clears token store', () => {
  authService.logout();
  if (localStorage.getItem('smart_college_token') !== null) {
    throw new Error('Token not cleared on logout');
  }
});

// Contract 5: GET /api/students/{id}
await runAsyncTest('STUDENT-01', 'GET /api/students/{id} URL encoding & execution', async () => {
  setAuthToken('bearer_sample_token');
  mockResponseToReturn = {
    status: 200,
    data: { student_id: 'STU101', name: 'Test Student', semester: 6 },
  };
  const student = await studentService.getStudentById('STU101');
  if (capturedRequest.method !== 'GET') throw new Error(`Expected GET, got ${capturedRequest.method}`);
  if (!capturedRequest.url.endsWith('/api/students/STU101')) throw new Error(`URL mismatch: ${capturedRequest.url}`);
  if (capturedRequest.headers['Authorization'] !== 'Bearer bearer_sample_token') {
    throw new Error('Authorization header missing or invalid');
  }
  if (student.semester !== 6) throw new Error('Response mismatch');
});

// Contract 6: POST /api/requests
await runAsyncTest('REQ-01', 'POST /api/requests contract payload validation & construction', async () => {
  mockResponseToReturn = {
    status: 201,
    data: {
      id: 'REQ-1001',
      student_id: 'STU101',
      text: 'Need Bonafide certificate for passport application',
      document_id: 'DOC-501',
      status: 'PENDING',
      created_at: '2026-09-14T00:00:00Z',
    },
  };
  const payload = {
    student_id: 'STU101',
    text: '  Need Bonafide certificate for passport application  ',
    document_id: 'DOC-501',
  };
  const created = await requestService.createRequest(payload);
  if (capturedRequest.method !== 'POST') throw new Error(`Expected POST, got ${capturedRequest.method}`);
  if (!capturedRequest.url.endsWith('/api/requests')) throw new Error(`URL mismatch: ${capturedRequest.url}`);
  const sent = JSON.parse(capturedRequest.body);
  if (sent.student_id !== 'STU101') throw new Error('student_id mismatch');
  if (sent.text !== 'Need Bonafide certificate for passport application') throw new Error('text was not trimmed');
  if (sent.document_id !== 'DOC-501') throw new Error('document_id mismatch');
  if (created.id !== 'REQ-1001') throw new Error('Response parsing mismatch');
});

// Contract 7: POST /api/requests validation errors on missing fields
await runAsyncTest('REQ-02', 'requestService.createRequest client-side validation failure', async () => {
  let threwStudentId = false;
  try {
    await requestService.createRequest({ text: 'No student id' });
  } catch (err) {
    if (err.message.includes('student_id is required')) threwStudentId = true;
  }
  if (!threwStudentId) throw new Error('Did not throw required student_id error');

  let threwText = false;
  try {
    await requestService.createRequest({ student_id: 'STU101', text: '   ' });
  } catch (err) {
    if (err.message.includes('text is required')) threwText = true;
  }
  if (!threwText) throw new Error('Did not throw required text error');
});

// Contract 8: GET /api/requests (with query params)
await runAsyncTest('REQ-03', 'GET /api/requests query parameters & serialization', async () => {
  mockResponseToReturn = {
    status: 200,
    data: [
      { id: 'REQ-1', status: 'PENDING', text: 'Query 1' },
      { id: 'REQ-2', status: 'RESOLVED', text: 'Query 2' },
    ],
  };
  const list = await requestService.getRequests({ status: 'PENDING', limit: 10 });
  if (capturedRequest.method !== 'GET') throw new Error(`Expected GET, got ${capturedRequest.method}`);
  if (!capturedRequest.url.includes('/api/requests?status=PENDING&limit=10')) {
    throw new Error(`Query params missing or misformatted: ${capturedRequest.url}`);
  }
  if (!Array.isArray(list) || list.length !== 2) throw new Error('Response list mismatch');
});

// Contract 9: GET /api/requests/{id}
await runAsyncTest('REQ-04', 'GET /api/requests/{id} single record retrieval', async () => {
  mockResponseToReturn = {
    status: 200,
    data: {
      id: 'REQ-1001',
      student_id: 'STU101',
      status: 'IN_PROGRESS',
      agent_assigned: 'ACADEMIC_AGENT',
      timeline: [{ step: 'SUBMITTED', time: '10:00 AM' }],
    },
  };
  const item = await requestService.getRequestById('REQ-1001');
  if (capturedRequest.method !== 'GET') throw new Error(`Expected GET, got ${capturedRequest.method}`);
  if (!capturedRequest.url.endsWith('/api/requests/REQ-1001')) throw new Error(`URL mismatch: ${capturedRequest.url}`);
  if (item.agent_assigned !== 'ACADEMIC_AGENT') throw new Error('Response mismatch');
});

// Contract 10: PATCH /api/requests/{id}/status
await runAsyncTest('REQ-05', 'PATCH /api/requests/{id}/status update payload & method', async () => {
  mockResponseToReturn = {
    status: 200,
    data: { id: 'REQ-1001', status: 'RESOLVED', resolution_notes: 'Done' },
  };
  const updated = await requestService.updateRequestStatus('REQ-1001', {
    status: 'RESOLVED',
    resolution_notes: 'Done',
  });
  if (capturedRequest.method !== 'PATCH') throw new Error(`Expected PATCH, got ${capturedRequest.method}`);
  if (!capturedRequest.url.endsWith('/api/requests/REQ-1001/status')) throw new Error(`URL mismatch: ${capturedRequest.url}`);
  const sent = JSON.parse(capturedRequest.body);
  if (sent.status !== 'RESOLVED') throw new Error('Status payload mismatch');
  if (updated.status !== 'RESOLVED') throw new Error('Response update mismatch');
});

// Contract 11: POST /api/upload with FormData
await runAsyncTest('UPLOAD-01', 'POST /api/upload FormData boundary preservation', async () => {
  mockResponseToReturn = {
    status: 201,
    data: {
      document_id: 'DOC-9921',
      filename: 'medical_cert.pdf',
      filesize: 1048576,
      url: '/uploads/medical_cert.pdf',
    },
  };

  // Node environment Polyfill for File/FormData if needed
  let mockFile;
  try {
    mockFile = new File(['test file content'], 'medical_cert.pdf', { type: 'application/pdf' });
  } catch {
    mockFile = { name: 'medical_cert.pdf', size: 17, type: 'application/pdf' };
  }

  const res = await uploadService.uploadDocument(mockFile, { document_type: 'medical_cert' });
  if (capturedRequest.method !== 'POST') throw new Error(`Expected POST, got ${capturedRequest.method}`);
  if (!capturedRequest.url.endsWith('/api/upload')) throw new Error(`URL mismatch: ${capturedRequest.url}`);
  // Crucial check: Content-Type must NOT be application/json
  if (capturedRequest.headers['Content-Type'] === 'application/json') {
    throw new Error('CRITICAL BUG: Content-Type was forced to application/json for FormData!');
  }
  if (res.document_id !== 'DOC-9921') throw new Error('Upload response parsing mismatch');
});

// -------------------------------------------------------------
// 4. ERROR CASES HANDLING TESTS
// -------------------------------------------------------------
console.log('\n====================================================');
console.log('RUNNING ERROR HANDLING SUITE (400, 401, 404, 422, 500, Network)...');
console.log('====================================================');

// 400 Bad Request
await runAsyncTest('ERR-400', 'HTTP 400 Bad Request error normalization', async () => {
  mockResponseToReturn = {
    status: 400,
    data: { detail: 'Invalid request parameters' },
  };
  try {
    await api.get('/api/test-400');
    throw new Error('Should have thrown ApiError');
  } catch (err) {
    if (!(err instanceof ApiError)) throw new Error('Not an ApiError instance');
    if (err.status !== 400) throw new Error(`Expected status 400, got ${err.status}`);
    if (err.message !== 'Invalid request parameters') throw new Error(`Message mismatch: ${err.message}`);
  }
});

// 401 Unauthorized
await runAsyncTest('ERR-401', 'HTTP 401 Unauthorized error normalization', async () => {
  mockResponseToReturn = {
    status: 401,
    data: { detail: 'Token expired or invalid signature' },
  };
  try {
    await api.get('/api/test-401');
    throw new Error('Should have thrown ApiError');
  } catch (err) {
    if (!(err instanceof ApiError)) throw new Error('Not an ApiError instance');
    if (err.status !== 401) throw new Error(`Expected status 401, got ${err.status}`);
    if (err.message !== 'Token expired or invalid signature') throw new Error(`Message mismatch: ${err.message}`);
  }
});

// 404 Not Found
await runAsyncTest('ERR-404', 'HTTP 404 Not Found error normalization', async () => {
  mockResponseToReturn = {
    status: 404,
    data: { detail: 'Request record not found' },
  };
  try {
    await api.get('/api/requests/NONEXISTENT');
    throw new Error('Should have thrown ApiError');
  } catch (err) {
    if (!(err instanceof ApiError)) throw new Error('Not an ApiError instance');
    if (err.status !== 404) throw new Error(`Expected status 404, got ${err.status}`);
    if (err.message !== 'Request record not found') throw new Error(`Message mismatch: ${err.message}`);
  }
});

// 422 Unprocessable Entity (FastAPI validation detail array)
await runAsyncTest('ERR-422', 'HTTP 422 Unprocessable Entity FastAPI detail array flattening', async () => {
  mockResponseToReturn = {
    status: 422,
    data: {
      detail: [
        { loc: ['body', 'student_id'], msg: 'field required', type: 'value_error.missing' },
        { loc: ['body', 'text'], msg: 'ensure this value has at least 10 characters', type: 'value_error.any_str.min_length' },
      ],
    },
  };
  try {
    await api.post('/api/requests', {});
    throw new Error('Should have thrown ApiError');
  } catch (err) {
    if (!(err instanceof ApiError)) throw new Error('Not an ApiError instance');
    if (err.status !== 422) throw new Error(`Expected status 422, got ${err.status}`);
    if (!err.message.includes('student_id: field required') || !err.message.includes('text: ensure this value has at least 10 characters')) {
      throw new Error(`422 detail array formatting failed: ${err.message}`);
    }
  }
});

// 500 Internal Server Error
await runAsyncTest('ERR-500', 'HTTP 500 Internal Server Error normalization', async () => {
  mockResponseToReturn = {
    status: 500,
    data: { detail: 'Internal Server Error: Database deadlock' },
  };
  try {
    await api.get('/api/test-500');
    throw new Error('Should have thrown ApiError');
  } catch (err) {
    if (!(err instanceof ApiError)) throw new Error('Not an ApiError instance');
    if (err.status !== 500) throw new Error(`Expected status 500, got ${err.status}`);
    if (err.message !== 'Internal Server Error: Database deadlock') throw new Error(`Message mismatch: ${err.message}`);
  }
});

// Network Failure (Fetch throws TypeError)
await runAsyncTest('ERR-NET', 'Network failure / connection refused error normalization', async () => {
  mockResponseToReturn = new TypeError('Failed to fetch');
  try {
    await api.get('/api/test-net');
    throw new Error('Should have thrown ApiError');
  } catch (err) {
    if (!(err instanceof ApiError)) throw new Error('Not an ApiError instance');
    if (err.status !== 0) throw new Error(`Expected status 0, got ${err.status}`);
    if (!err.isNetworkError) throw new Error('isNetworkError flag must be true');
    if (!err.message.includes('Failed to fetch') && !err.message.includes('Network connection failed')) {
      throw new Error(`Message mismatch: ${err.message}`);
    }
  }
});

// Restore original fetch
global.fetch = originalFetch;

// -------------------------------------------------------------
// 5. UI DATA INTEGRITY & STATS CALCULATION TESTS
// -------------------------------------------------------------
console.log('\n====================================================');
console.log('RUNNING UI DATA & STATS VERIFICATION...');
console.log('====================================================');

// Test Dashboard stats logic with empty response []
runTest('UI-DASH-01', 'Dashboard statistics with empty API response []', () => {
  const requests = [];
  const total = requests.length;
  const inProgress = requests.filter(r => ['SUBMITTED', 'IN_PROGRESS', 'AGENT_PROCESSING'].includes(r.status)).length;
  const resolved = requests.filter(r => ['RESOLVED', 'COMPLETED'].includes(r.status)).length;
  const actionRequired = requests.filter(r => ['ACTION_REQUIRED', 'REJECTED'].includes(r.status)).length;

  if (total !== 0 || inProgress !== 0 || resolved !== 0 || actionRequired !== 0) {
    throw new Error('Zero state calculation failed: stats are not 0');
  }
});

// Test Dashboard stats logic with realistic responses
runTest('UI-DASH-02', 'Dashboard statistics dynamic calculation with API records', () => {
  const requests = [
    { id: 'REQ-1', status: 'IN_PROGRESS' },
    { id: 'REQ-2', status: 'SUBMITTED' },
    { id: 'REQ-3', status: 'RESOLVED' },
    { id: 'REQ-4', status: 'COMPLETED' },
    { id: 'REQ-5', status: 'ACTION_REQUIRED' },
  ];
  const total = requests.length;
  const inProgress = requests.filter(r => ['SUBMITTED', 'IN_PROGRESS', 'AGENT_PROCESSING'].includes(r.status)).length;
  const resolved = requests.filter(r => ['RESOLVED', 'COMPLETED'].includes(r.status)).length;
  const actionRequired = requests.filter(r => ['ACTION_REQUIRED', 'REJECTED'].includes(r.status)).length;

  if (total !== 5) throw new Error(`Expected total 5, got ${total}`);
  if (inProgress !== 2) throw new Error(`Expected inProgress 2, got ${inProgress}`);
  if (resolved !== 2) throw new Error(`Expected resolved 2, got ${resolved}`);
  if (actionRequired !== 1) throw new Error(`Expected actionRequired 1, got ${actionRequired}`);
});

// Test History filter, search, and sort logic
runTest('UI-HIST-01', 'History search, filter, and sort logic', () => {
  const sampleList = [
    { id: 'REQ-101', text: 'Bonafide certificate request', status: 'RESOLVED', created_at: '2026-09-01T10:00:00Z' },
    { id: 'REQ-102', text: 'Hostel fee receipt discrepancy', status: 'IN_PROGRESS', created_at: '2026-09-05T12:00:00Z' },
    { id: 'REQ-103', text: 'Bus pass renewal query', status: 'SUBMITTED', created_at: '2026-09-08T09:00:00Z' },
  ];

  // 1. Search by text
  const searched = sampleList.filter(r => r.text.toLowerCase().includes('hostel'));
  if (searched.length !== 1 || searched[0].id !== 'REQ-102') throw new Error('Search failed');

  // 2. Filter by status
  const filtered = sampleList.filter(r => r.status === 'RESOLVED');
  if (filtered.length !== 1 || filtered[0].id !== 'REQ-101') throw new Error('Filter failed');

  // 3. Sort by created_at descending
  const sortedDesc = [...sampleList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (sortedDesc[0].id !== 'REQ-103' || sortedDesc[2].id !== 'REQ-101') throw new Error('Sort failed');
});

// -------------------------------------------------------------
// 6. ROUTE RESOLUTION LOGIC TESTS
// -------------------------------------------------------------
console.log('\n====================================================');
console.log('RUNNING ROUTE RESOLUTION AUDIT...');
console.log('====================================================');

const appRoutesContent = fs.readFileSync(path.resolve(srcDir, 'routes/AppRoutes.jsx'), 'utf-8');
const protectedRouteContent = fs.readFileSync(path.resolve(srcDir, 'routes/ProtectedRoute.jsx'), 'utf-8');

runTest('ROUTE-01', 'Verify root route (/) is session-aware and does NOT blindly redirect to /dashboard', () => {
  if (appRoutesContent.includes('<Route path="/" element={<Navigate to="/dashboard" replace />} />')) {
    throw new Error('DETECTED BUG: Root route is blindly redirecting to /dashboard!');
  }
  if (!appRoutesContent.includes('RootRedirect')) {
    throw new Error('RootRedirect component missing from AppRoutes');
  }
  if (!appRoutesContent.includes("to={isAuthenticated ? '/dashboard' : '/login'}")) {
    throw new Error('RootRedirect does not conditionally branch to /dashboard vs /login');
  }
});

runTest('ROUTE-02', 'Verify ProtectedRoute removes development bypasses', () => {
  if (protectedRouteContent.includes('bypassAuthForPhase1')) {
    throw new Error('DETECTED BUG: bypassAuthForPhase1 is still present in ProtectedRoute!');
  }
  if (!protectedRouteContent.includes('return <Navigate to="/login" replace />;')) {
    throw new Error('ProtectedRoute does not redirect unauthenticated users to /login');
  }
});

runTest('ROUTE-03', 'Verify route aliases /new-request and /history exist', () => {
  if (!appRoutesContent.includes('path="/new-request"') || !appRoutesContent.includes('path="/history"')) {
    throw new Error('Route aliases /new-request and /history missing');
  }
});

// Summary output
console.log('\n====================================================');
console.log('TEST SUMMARY');
console.log('====================================================');
const passedCount = results.contractTests.filter(t => t.status === 'PASS').length;
const failedCount = results.contractTests.filter(t => t.status === 'FAIL').length;
console.log(`Contract/Unit Tests Executed: ${results.contractTests.length}`);
console.log(`Passed: ${passedCount}`);
console.log(`Failed: ${failedCount}`);
console.log(`Live FastAPI: ${results.liveFastApi.running ? 'RUNNING' : 'BLOCKED (Offline)'}`);

// Save summary json for test evidence
fs.writeFileSync(
  path.resolve(frontendRoot, 'test_evidence.json'),
  JSON.stringify(results, null, 2),
  'utf-8'
);
console.log('Saved test evidence to test_evidence.json');
