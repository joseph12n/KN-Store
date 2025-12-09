const PRODUCTS_KEY = 'kn_store_products';

// Inicializar productos desde JSON si no existen en localStorage
export const initializeProducts = (initialProducts) => {
  const existingProducts = localStorage.getItem(PRODUCTS_KEY);
  if (!existingProducts) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
  }
};

// Obtener todos los productos
export const getProducts = () => {
  const products = localStorage.getItem(PRODUCTS_KEY);
  return products ? JSON.parse(products) : [];
};

// Guardar productos
export const saveProducts = (products) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

// Crear producto
export const createProduct = (productData, currentUser) => {
  if (currentUser.role !== 'admin' && currentUser.role !== 'proveedor') {
    return { success: false, message: 'No tienes permisos para crear productos' };
  }

  const products = getProducts();
  
  const newProduct = {
    id: Date.now(),
    ...productData,
    createdBy: currentUser.id,
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);
  saveProducts(products);

  return { success: true, product: newProduct };
};

// Actualizar producto
export const updateProduct = (productId, productData, currentUser) => {
  if (currentUser.role !== 'admin' && currentUser.role !== 'proveedor') {
    return { success: false, message: 'No tienes permisos para editar productos' };
  }

  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return { success: false, message: 'Producto no encontrado' };
  }

  // Si es proveedor, solo puede editar sus propios productos
  if (currentUser.role === 'proveedor' && products[productIndex].createdBy !== currentUser.id) {
    return { success: false, message: 'Solo puedes editar tus propios productos' };
  }

  products[productIndex] = {
    ...products[productIndex],
    ...productData,
    updatedAt: new Date().toISOString()
  };

  saveProducts(products);

  return { success: true, product: products[productIndex] };
};

// Eliminar producto
export const deleteProduct = (productId, currentUser) => {
  if (currentUser.role !== 'admin' && currentUser.role !== 'proveedor') {
    return { success: false, message: 'No tienes permisos para eliminar productos' };
  }

  const products = getProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    return { success: false, message: 'Producto no encontrado' };
  }

  // Si es proveedor, solo puede eliminar sus propios productos
  if (currentUser.role === 'proveedor' && product.createdBy !== currentUser.id) {
    return { success: false, message: 'Solo puedes eliminar tus propios productos' };
  }

  const filteredProducts = products.filter(p => p.id !== productId);
  saveProducts(filteredProducts);

  return { success: true };
};