export const API_BASE = process.env.NODE_ENV === 'production' 
  ? "https://clearances.onrender.com/api/"
  : "http://localhost:8000/api/";

// ---------------- SESSION ----------------
export function setSession(userData) {
  if (!userData || !userData.token) return;
  
  // Save token and user info in one object
  const sessionData = {
    token: userData.token,
    role: userData.role,
    email: userData.email || "",
    username: userData.username || "",
    id: userData.id || "",
    department: userData.department || ""
  };
  
  sessionStorage.setItem("ucs_current", JSON.stringify(sessionData));
  
  // Also store in localStorage for persistence across tabs
  localStorage.setItem("ucs_user", JSON.stringify({
    role: userData.role,
    email: userData.email || "",
    username: userData.username || ""
  }));
}

export function clearSession() {
  sessionStorage.removeItem("ucs_current");
  localStorage.removeItem("ucs_user");
}

export function getSession() {
  const session = sessionStorage.getItem("ucs_current");
  return session ? JSON.parse(session) : null;
}

export function getStoredUser() {
  const userData = localStorage.getItem("ucs_user");
  return userData ? JSON.parse(userData) : null;
}

// ---------------- AUTH HEADERS ----------------
export function getAuthHeaders() {
  const session = getSession();
  if (!session?.token) {
    console.warn("No token found in session");
    return {};
  }
  
  return {
    Authorization: `Token ${session.token}`,
    'Content-Type': 'application/json'
  };
}

// ---------------- TOKEN VALIDATION ----------------
export function isTokenValid() {
  const session = getSession();
  return !!(session?.token);
}

export function debugAuth() {
  const session = getSession();
  console.log("Session exists:", !!session);
  console.log("Token exists:", !!session?.token);
  console.log("Token value:", session?.token?.substring(0, 20) + "...");
  console.log("Role:", session?.role);
}
// ---------------- ROLE CHECK ----------------
export function hasRole(role) {
  const session = getSession();
  return session?.role === role;
}

// ---------------- API FETCH WITH RETRY ----------------
export async function apiFetch(endpoint, options = {}) {
  try {
    // Clean endpoint
    endpoint = endpoint.replace(/^\/+/, "");
    
    // Ensure we have Content-Type for POST/PUT/PATCH
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {})
    };
    
    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }
    
    const config = {
      method: options.method || "GET",
      headers: headers,
      credentials: 'include', // Include cookies for CSRF
    };
    
    // Add body for non-GET requests
    if (options.body && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    } else if (options.body instanceof FormData) {
      config.body = options.body;
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Handle specific status codes
    if (response.status === 401) {
      // Unauthorized: clear session and redirect to login
      clearSession();
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }
    
    if (response.status === 403) {
      const errorText = await response.text();
      let errorData = {};
      try {
        errorData = errorText ? JSON.parse(errorText) : {};
      } catch {}
      
      throw new Error(errorData.error || errorData.detail || "Access denied. You don't have permission.");
    }
    
    if (response.status === 404) {
      throw new Error("Resource not found");
    }
    
    const text = await response.text();
    let data = {};
    
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("Failed to parse JSON:", text);
      throw new Error("Invalid server response");
    }
    
    if (!response.ok) {
      const errorMsg = data.detail || data.error || data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }
    
    return data;
    
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Network error: ${error.message || error}`);
    }
  }
}

// ---------------- HELPER: GET TOKEN ----------------
export function getToken() {
  const session = getSession();
  return session?.token || null;
}

// ---------------- HELPER: CHECK IF ADMIN ----------------
export function isAdmin() {
  const session = getSession();
  return session?.role === 'admin';
}

// ---------------- HELPER: CHECK IF STUDENT ----------------
export function isStudent() {
  const session = getSession();
  return session?.role === 'student';
}


// ---------------- HELPER: CHECK IF DEPARTMENT HEAD ----------------
export function isDepartmentHead() {
  const session = getSession();
  return session?.role === 'departmenthead';
}

// ---------------- REQUEST INTERCEPTOR FOR AXIOS STYLE ----------------
export const apiRequest = {
  get: (endpoint, options = {}) => apiFetch(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options = {}) => apiFetch(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options = {}) => apiFetch(endpoint, { method: 'PUT', body, ...options }),
  patch: (endpoint, body, options = {}) => apiFetch(endpoint, { method: 'PATCH', body, ...options }),
  delete: (endpoint, options = {}) => apiFetch(endpoint, { method: 'DELETE', ...options }),
  upload: (endpoint, formData, options = {}) => {
    const headers = {
      ...getAuthHeaders()
    };
    delete headers['Content-Type']; // Let browser set content-type for FormData
    
    return apiFetch(endpoint, { 
      method: 'POST', 
      body: formData, 
      headers,
      ...options 
    });
  }
};

// ---------------- INITIALIZE AUTH ON APP START ----------------
export function initializeAuth() {
  const session = getSession();
  if (session?.token) {
    // Verify token is still valid
    return apiFetch('users/me/').catch(() => {
      clearSession();
      return null;
    });
  }
  return Promise.resolve(null);
}

// ---------------- LOGIN HELPER ----------------
export async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_BASE}login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    
    if (data.token && data.user) {
      setSession({
        token: data.token,
        ...data.user
      });
      return data;
    } else {
      throw new Error('Invalid login response');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// ---------------- LOGOUT HELPER ----------------
export function logoutUser() {
  const token = getToken();
  
  if (token) {
    // Call logout API if needed
    fetch(`${API_BASE}logout/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).catch(err => console.error('Logout API error:', err));
  }
  
  clearSession();
}

// ---------------- CHECK USER PERMISSIONS ----------------
export function checkPermissions(allowedRoles = []) {
  const session = getSession();
  
  if (!session) {
    return { hasAccess: false, reason: 'Not logged in' };
  }
  
  if (allowedRoles.length === 0 || allowedRoles.includes(session.role)) {
    return { hasAccess: true };
  }
  
  return { hasAccess: false, reason: 'Insufficient permissions' };
}

// ---------------- FORCE REDIRECT IF NOT AUTHENTICATED ----------------
export function requireAuth(allowedRoles = []) {
  const session = getSession();
  
  if (!session) {
    window.location.href = '/login';
    return false;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    window.location.href = '/unauthorized';
    return false;
  }
  
  return true;
}