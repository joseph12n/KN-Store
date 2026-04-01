const API_BASE_URL = '/api';

// Normaliza todas las respuestas HTTP y convierte errores API en Error estándar.
const parseResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error en la solicitud');
  }

  return data;
};

// Header común para endpoints protegidos con JWT.
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// Servicio único del frontend para consumir endpoints del backend.
// Se concentra aquí la lógica de fetch para facilitar escalado y refactor posterior.
export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseResponse(response);

    // Guardar el token en localStorage
    if (data.data && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
    }

    return data.data;
  },

  registerClient: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    // Admin only.
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await parseResponse(response);
    return data.data;
  },

  getMyProfile: async () => {
    // Cualquier usuario autenticado.
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await parseResponse(response);
    return data.data;
  },

  createUser: async (payload) => {
    // Admin only.
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);
    return data.data;
  },

  updateUser: async (userId, payload) => {
    // Admin only. payload parcial.
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);
    return data.data;
  },

  deleteUser: async (userId, hardDelete = false) => {
    // Flujo backend: soft delete primero, hard delete después.
    const query = hardDelete ? '?hardDelete=true' : '';

    const response = await fetch(`${API_BASE_URL}/users/${userId}${query}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await parseResponse(response);
    return data;
  },

  getCategories: async () => {
    // Público.
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
    });

    const data = await parseResponse(response);
    return data.data;
  },

  createCategory: async (payload) => {
    // Admin/Manager.
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);
    return data.data;
  },

  updateCategory: async (categoryId, payload) => {
    // Admin/Manager.
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);
    return data.data;
  },

  deleteCategory: async (categoryId, hardDelete = false) => {
    // Admin only. soporta soft/hard delete.
    const query = hardDelete ? '?hardDelete=true' : '';
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}${query}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return parseResponse(response);
  },

  getSubcategories: async () => {
    // Público.
    const response = await fetch(`${API_BASE_URL}/subcategories`, {
      method: 'GET',
    });

    const data = await parseResponse(response);
    return data.data;
  },

  createSubcategory: async (payload) => {
    // Admin/Manager.
    const response = await fetch(`${API_BASE_URL}/subcategories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);
    return data.data;
  },

  updateSubcategory: async (subcategoryId, payload) => {
    // Admin/Manager.
    const response = await fetch(`${API_BASE_URL}/subcategories/${subcategoryId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);
    return data.data;
  },

  deleteSubcategory: async (subcategoryId, hardDelete = false) => {
    // Admin only. soporta soft/hard delete.
    const query = hardDelete ? '?hardDelete=true' : '';
    const response = await fetch(`${API_BASE_URL}/subcategories/${subcategoryId}${query}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return parseResponse(response);
  },

  getProducts: async () => {
    // Público.
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
    });

    const data = await parseResponse(response);
    return data.data;
  },

  createProduct: async (payload) => {
    // Admin/Manager.
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);
    return data.data;
  },

  updateProduct: async (productId, payload) => {
    // Admin/Manager.
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);
    return data.data;
  },

  deleteProduct: async (productId, hardDelete = false) => {
    // Admin only. soporta soft/hard delete.
    const query = hardDelete ? '?hardDelete=true' : '';
    const response = await fetch(`${API_BASE_URL}/products/${productId}${query}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    return parseResponse(response);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
