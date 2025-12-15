// ============================================
// IMPORTS - Importación de dependencias
// ============================================

// Hooks de React para manejar estado y efectos
import { useState, useRef, useEffect } from 'react';

// Componentes de autenticación (Login y Registro)
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Componentes de la tienda
import Header from './components/Shop/Header';
import ProductCard from './components/Shop/ProductCard';
import Cart from './components/Shop/Cart';
import Hero from './components/Shop/Hero';
import Footer from './components/Shop/Footer';

// Componente del Dashboard (Panel de administración)
import Dashboard from './components/Dashboard/Dashboard';

// Datos iniciales de productos (se usarán para inicializar localStorage)
import initialProductsData from './data/products.json';

// Servicios de autenticación (funciones para login, registro, logout, etc.)
import { initializeUsers, login, register, logout, getCurrentUser } from './utils/authService';

// Servicios de productos (funciones para gestionar productos)
import { initializeProducts, getProducts } from './utils/productService';

import { initializeSales } from './utils/salesService';
// ============================================
// COMPONENTE PRINCIPAL - APP
// ============================================
function App() {
  // ============================================
  // ESTADOS - Variables reactivas de la aplicación
  // ============================================
  
  // Estado del usuario actualmente autenticado (null si no hay sesión)
  const [user, setUser] = useState(null);
  
  // Vista actual en el modal de autenticación ('login' o 'register')
  const [authView, setAuthView] = useState('login');
  
  // Controla si el modal de autenticación está visible
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Array de items en el carrito de compras
  const [cartItems, setCartItems] = useState([]);
  
  // Controla si el carrito lateral está abierto
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Controla si el dashboard está abierto
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
  // Estado para almacenar todos los productos (desde localStorage)
  const [products, setProducts] = useState([]);

  // ============================================
  // REFERENCIAS - Para hacer scroll a secciones
  // ============================================
  
  // Referencia a la sección de productos
  const productosRef = useRef(null);
  
  // Referencia a la sección de ofertas
  const ofertasRef = useRef(null);
  
  // Referencia a la sección de contacto (footer)
  const contactoRef = useRef(null);

  // ============================================
  // EFECTOS - Código que se ejecuta al montar el componente
  // ============================================
  
  useEffect(() => {
    // Inicializar usuarios en localStorage (si no existen)
    initializeUsers();
    
    // Inicializar productos en localStorage (si no existen)
    initializeProducts(initialProductsData);
    initializeSales();
    // Verificar si hay un usuario con sesión activa
    const currentUser = getCurrentUser();
    if (currentUser) {
      // Si hay sesión activa, establecer el usuario
      setUser(currentUser);
      
    }
    
    // Cargar productos desde localStorage
    loadProducts();
  }, []); // [] significa que solo se ejecuta una vez al montar el componente

  // ============================================
  // FUNCIONES DE PRODUCTOS
  // ============================================
  
  /**
   * Carga los productos desde localStorage
   * Esta función se llama cuando:
   * - El componente se monta
   * - Se crea/edita/elimina un producto desde el dashboard
   * - Se cierra el dashboard
   */
  const loadProducts = () => {
    setProducts(getProducts());
  };

  // ============================================
  // FUNCIONES DE AUTENTICACIÓN
  // ============================================
  
  /**
   * Maneja el inicio de sesión
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @param {function} setError - Función para mostrar errores en el formulario
   */
  const handleLogin = (email, password, setError) => {
    // Llamar al servicio de login
    const result = login(email, password);
    
    if (result.success) {
      // Si el login es exitoso, establecer el usuario
      setUser(result.user);
      // Cerrar el modal de autenticación
      setShowAuthModal(false);
    } else {
      // Si falla, mostrar el mensaje de error
      setError(result.message);
    }
  };

  /**
   * Maneja el registro de nuevos usuarios
   * @param {object} userData - Datos del nuevo usuario (name, email, password, etc.)
   * @param {function} setError - Función para mostrar errores en el formulario
   */
  const handleRegister = (userData, setError) => {
    // Llamar al servicio de registro
    const result = register(userData);
    
    if (result.success) {
      // Si el registro es exitoso, establecer el usuario (auto-login)
      setUser(result.user);
      // Cerrar el modal de autenticación
      setShowAuthModal(false);
    } else {
      // Si falla, mostrar el mensaje de error
      setError(result.message);
    }
  };

  /**
   * Maneja el cierre de sesión
   * Limpia todos los datos del usuario y carrito
   */
  const handleLogout = () => {
    // Remover usuario de localStorage
    logout();
    // Limpiar estado del usuario
    setUser(null);
    // Vaciar carrito
    setCartItems([]);
    // Cerrar carrito si estaba abierto
    setIsCartOpen(false);
    // Cerrar dashboard si estaba abierto
    setIsDashboardOpen(false);
  };

  // ============================================
  // FUNCIONES DEL CARRITO DE COMPRAS
  // ============================================
  
  /**
   * Agrega un producto al carrito
   * Si el usuario no está autenticado, muestra el modal de login
   * Si el producto ya está en el carrito, incrementa la cantidad
   * @param {object} product - Producto a agregar
   */
  const handleAddToCart = (product) => {
    // Verificar si hay un usuario autenticado
    if (!user) {
      // Si no hay usuario, mostrar modal de login
      setShowAuthModal(true);
      setAuthView('login');
      return;
    }

    // Si hay usuario, agregar/actualizar producto en el carrito
    setCartItems(prev => {
      // Buscar si el producto ya existe en el carrito
      const existing = prev.find(item => item.id === product.id);
      
      if (existing) {
        // Si existe, incrementar la cantidad
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // Si no existe, agregarlo con cantidad 1
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  /**
   * Actualiza la cantidad de un producto en el carrito
   * Si la cantidad llega a 0, elimina el producto
   * @param {number} id - ID del producto
   * @param {number} newQuantity - Nueva cantidad
   */
  const handleUpdateQuantity = (id, newQuantity) => {
    // Si la cantidad es 0 o negativa, eliminar el producto
    if (newQuantity <= 0) {
      handleRemove(id);
      return;
    }
    
    // Actualizar la cantidad del producto
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  /**
   * Elimina un producto del carrito
   * @param {number} id - ID del producto a eliminar
   */
  const handleRemove = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  /**
   * Maneja el clic en el icono del carrito
   * Si no hay usuario, muestra el modal de login
   * Si hay usuario, abre el carrito
   */
  const handleCartClick = () => {
    if (!user) {
      // Si no hay usuario, mostrar modal de login
      setShowAuthModal(true);
      setAuthView('login');
      return;
    }
    // Si hay usuario, abrir carrito
    setIsCartOpen(true);
  };

  /**
   * Abre el modal de login
   */
  const handleLoginClick = () => {
    setShowAuthModal(true);
    setAuthView('login');
  };

  /**
   * Cierra el dashboard y recarga los productos
   * Esto asegura que los cambios hechos en el dashboard
   * se reflejen inmediatamente en la página principal
   */
  const handleCloseDashboard = () => {
    setIsDashboardOpen(false);
    // Recargar productos para reflejar cambios
    loadProducts();
  };

  // ============================================
  // FUNCIONES DE NAVEGACIÓN
  // ============================================
  
  /**
   * Hace scroll suave a una sección específica
   * @param {object} ref - Referencia de React a la sección
   */
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ============================================
  // DATOS PROCESADOS
  // ============================================
  
  // Filtrar productos que tienen descuento para la sección de ofertas
  const productosConOferta = products.filter(p => p.discount);

  // ============================================
  // RENDERIZADO DEL COMPONENTE
  // ============================================
  
  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* ========================================
          HEADER - Barra de navegación superior
          ======================================== */}
      <Header 
        cartItems={cartItems}
        onCartClick={handleCartClick}
        user={user}
        onLogout={handleLogout}
        onLoginClick={handleLoginClick}
        onDashboardClick={() => setIsDashboardOpen(true)}
        onNavigate={{
          productos: () => scrollToSection(productosRef),
          ofertas: () => scrollToSection(ofertasRef),
          contacto: () => scrollToSection(contactoRef)
        }}
      />
      
      {/* ========================================
          HERO - Banner principal con llamado a la acción
          ======================================== */}
      <Hero onViewProducts={() => scrollToSection(productosRef)} />
      
      {/* ========================================
          SECCIÓN DE OFERTAS
          Muestra solo productos con descuento
          ======================================== */}
      <div ref={ofertasRef} className="bg-gradient-to-r from-red-500 to-pink-500 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            🔥 Ofertas Especiales
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Mapear productos con ofertas */}
            {productosConOferta.length > 0 ? (
              productosConOferta.map(product => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-white py-12">
                <p className="text-xl">No hay ofertas disponibles en este momento</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================
          SECCIÓN DE TODOS LOS PRODUCTOS
          Muestra el catálogo completo
          ======================================== */}
      <div ref={productosRef} className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Todos los Productos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Mapear todos los productos */}
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              <p className="text-xl">No hay productos disponibles</p>
            </div>
          )}
        </div>
      </div>
<Cart 
  isOpen={isCartOpen}
  onClose={() => setIsCartOpen(false)}
  cartItems={cartItems}
  onUpdateQuantity={handleUpdateQuantity}
  onRemove={handleRemove}
  user={user} 
/>
      {/* ========================================
          FOOTER - Pie de página con contacto y redes
          ======================================== */}
      <Footer contactRef={contactoRef} />
      
      {/* ========================================
          MODAL DE AUTENTICACIÓN
          Muestra Login o Registro según authView
          ======================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay oscuro de fondo */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowAuthModal(false)}
          />
          
          {/* Contenedor del formulario */}
          <div className="relative z-10 w-full max-w-md">
            {authView === 'login' ? (
              // Mostrar formulario de login
              <Login 
                onLogin={handleLogin}
                onSwitchToRegister={() => setAuthView('register')}
                onClose={() => setShowAuthModal(false)}
              />
            ) : (
              // Mostrar formulario de registro
              <Register 
                onRegister={handleRegister}
                onSwitchToLogin={() => setAuthView('login')}
                onClose={() => setShowAuthModal(false)}
              />
            )}
          </div>
        </div>
      )}
      
      {/* ========================================
          CARRITO DE COMPRAS
          Panel lateral con productos agregados
          ======================================== */}
      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
      />

      {/* ========================================
          DASHBOARD
          Panel de administración (solo usuarios autenticados)
          Muestra diferentes secciones según el rol:
          - Todos: Mi Perfil
          - Admin/Proveedor: Productos
          - Admin: Usuarios
          
          IMPORTANTE: Al cerrar el dashboard, se recargan los productos
          para reflejar los cambios en la página principal
          ======================================== */}
      {user && (
        <Dashboard
          isOpen={isDashboardOpen}
          onClose={handleCloseDashboard}
          user={user}
        />
      )}
    </div>
  );
}


// ============================================
// EXPORTACIÓN DEL COMPONENTE
// ============================================
export default App;