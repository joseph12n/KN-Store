const API_BASE_URL = '/api';

const parseResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error en la solicitud');
  }
  return data;
};

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await parseResponse(response);
    if (data.data && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
    }
    return data.data;
  },

  registerClient: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await parseResponse(response);
    if (data.data && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
    }
    return data.data;
  },

  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, { method: 'GET', headers: getAuthHeaders() });
    const data = await parseResponse(response);
    return data.data;
  },

  getMyProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, { method: 'GET', headers: getAuthHeaders() });
    const data = await parseResponse(response);
    return data.data;
  },

  createUser: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/users`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const data = await parseResponse(response);
    return data.data;
  },

  updateUser: async (userId, payload) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const data = await parseResponse(response);
    return data.data;
  },

  deleteUser: async (userId, hardDelete = false) => {
    const query = hardDelete ? '?hardDelete=true' : '';
    const response = await fetch(`${API_BASE_URL}/users/${userId}${query}`, { method: 'DELETE', headers: getAuthHeaders() });
    return parseResponse(response);
  },

  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`, { method: 'GET' });
    const data = await parseResponse(response);
    return data.data;
  },

  createCategory: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/categories`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const data = await parseResponse(response);
    return data.data;
  },

  updateCategory: async (categoryId, payload) => {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const data = await parseResponse(response);
    return data.data;
  },

  deleteCategory: async (categoryId, hardDelete = false) => {
    const query = hardDelete ? '?hardDelete=true' : '';
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}${query}`, { method: 'DELETE', headers: getAuthHeaders() });
    return parseResponse(response);
  },

  getSubcategories: async () => {
    const response = await fetch(`${API_BASE_URL}/subcategories`, { method: 'GET' });
    const data = await parseResponse(response);
    return data.data;
  },

  createSubcategory: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/subcategories`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const data = await parseResponse(response);
    return data.data;
  },

  updateSubcategory: async (subcategoryId, payload) => {
    const response = await fetch(`${API_BASE_URL}/subcategories/${subcategoryId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const data = await parseResponse(response);
    return data.data;
  },

  deleteSubcategory: async (subcategoryId, hardDelete = false) => {
    const query = hardDelete ? '?hardDelete=true' : '';
    const response = await fetch(`${API_BASE_URL}/subcategories/${subcategoryId}${query}`, { method: 'DELETE', headers: getAuthHeaders() });
    return parseResponse(response);
  },

  getProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/products`, { method: 'GET' });
    const data = await parseResponse(response);
    return data.data;
  },

  createProduct: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/products`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const data = await parseResponse(response);
    return data.data;
  },

  updateProduct: async (productId, payload) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const data = await parseResponse(response);
    return data.data;
  },

  deleteProduct: async (productId, hardDelete = false) => {
    const query = hardDelete ? '?hardDelete=true' : '';
    const response = await fetch(`${API_BASE_URL}/products/${productId}${query}`, { method: 'DELETE', headers: getAuthHeaders() });
    return parseResponse(response);
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getToken: () => typeof window !== 'undefined' ? localStorage.getItem('token') : null,

  getUser: () => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => typeof window !== 'undefined' && !!localStorage.getItem('token'),
};
