// ============================================================
// NagroMS — src/services/farmerApi.js
// All API calls for the Farmer Dashboard
// ============================================================

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';


/**
 * Get the auth token from localStorage
 */
function getToken() {
  return localStorage.getItem('nagroms_token') || '';
}

/**
 * Shared headers for authenticated requests
 */
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  };
}

// ── Profile ──────────────────────────────────────────────────

export async function fetchFarmerProfile() {
  const res = await fetch(`${BASE_URL}/api/farmer/profile`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function updateFarmerProfile(data) {
  const res = await fetch(`${BASE_URL}/api/farmer/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// ── Products ─────────────────────────────────────────────────

export async function fetchProducts() {
  const res = await fetch(`${BASE_URL}/api/farmer/products`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function addProduct(data) {
  const res = await fetch(`${BASE_URL}/api/farmer/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateProduct(id, data) {
  const res = await fetch(`${BASE_URL}/api/farmer/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${BASE_URL}/api/farmer/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// ── Orders ───────────────────────────────────────────────────

export async function fetchOrders() {
  const res = await fetch(`${BASE_URL}/api/farmer/orders`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function updateOrderStatus(id, status) {
  const res = await fetch(`${BASE_URL}/api/farmer/orders/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
}

// ── Equipment ────────────────────────────────────────────────

export async function fetchEquipment() {
  const res = await fetch(`${BASE_URL}/api/farmer/equipment`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function addEquipment(data) {
  const res = await fetch(`${BASE_URL}/api/farmer/equipment`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateEquipment(id, data) {
  const res = await fetch(`${BASE_URL}/api/farmer/equipment/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteEquipment(id) {
  const res = await fetch(`${BASE_URL}/api/farmer/equipment/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// ── Inventory ────────────────────────────────────────────────

export async function fetchInventory() {
  const res = await fetch(`${BASE_URL}/api/farmer/inventory`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function addInventory(data) {
  const res = await fetch(`${BASE_URL}/api/farmer/inventory`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateInventory(id, data) {
  const res = await fetch(`${BASE_URL}/api/farmer/inventory/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteInventory(id) {
  const res = await fetch(`${BASE_URL}/api/farmer/inventory/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

// ── Sales ────────────────────────────────────────────────────

export async function fetchSales() {
  const res = await fetch(`${BASE_URL}/api/farmer/sales`, {
    headers: authHeaders(),
  });
  return res.json();
}
