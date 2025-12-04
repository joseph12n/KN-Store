import initialUsers from '../data/initialUsers.json';

const USERS_KEY = 'kn_store_users';
const CURRENT_USER_KEY = 'kn_store_current_user';

// Inicializar usuarios si no existen
export const initializeUsers = () => {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  }
};

// Obtener todos los usuarios
export const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Guardar usuarios
export const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Login
export const login = (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return { success: true, user: userWithoutPassword };
  }
  
  return { success: false, message: 'Credenciales incorrectas' };
};

// Register
export const register = (userData) => {
  const users = getUsers();
  
  // Verificar si el email ya existe
  if (users.find(u => u.email === userData.email)) {
    return { success: false, message: 'El email ya está registrado' };
  }
  
  const newUser = {
    id: Date.now(),
    ...userData,
    role: 'cliente',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  const { password: _, ...userWithoutPassword } = newUser;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
  
  return { success: true, user: userWithoutPassword };
};

// Logout
export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Obtener usuario actual
export const getCurrentUser = () => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Crear usuario (solo admin)
export const createUser = (userData, currentUser) => {
  if (currentUser.role !== 'admin') {
    return { success: false, message: 'No tienes permisos' };
  }
  
  const users = getUsers();
  
  if (users.find(u => u.email === userData.email)) {
    return { success: false, message: 'El email ya existe' };
  }
  
  const newUser = {
    id: Date.now(),
    ...userData,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  return { success: true, user: newUser };
};

// Actualizar usuario
export const updateUser = (userId, userData, currentUser) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: 'Usuario no encontrado' };
  }
  
  // Solo admin puede editar cualquier usuario, otros solo a sí mismos
  if (currentUser.role !== 'admin' && currentUser.id !== userId) {
    return { success: false, message: 'No tienes permisos' };
  }
  
  users[userIndex] = { ...users[userIndex], ...userData };
  saveUsers(users);
  
  // Si el usuario editado es el actual, actualizar también en currentUser
  if (currentUser.id === userId) {
    const { password: _, ...userWithoutPassword } = users[userIndex];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
  }
  
  return { success: true, user: users[userIndex] };
};

// Eliminar usuario (solo admin)
export const deleteUser = (userId, currentUser) => {
  if (currentUser.role !== 'admin') {
    return { success: false, message: 'No tienes permisos' };
  }
  
  if (userId === currentUser.id) {
    return { success: false, message: 'No puedes eliminarte a ti mismo' };
  }
  
  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== userId);
  saveUsers(filteredUsers);
  
  return { success: true };
};
