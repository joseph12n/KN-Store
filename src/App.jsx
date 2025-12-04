// React Hooks que vamos a usar:
// useState → manejar estados
// useRef → referencias a elementos del DOM para el scroll
// useEffect → ejecutar código al montar el componente (como cargar datos iniciales)
import { useState, useRef, useEffect } from 'react';

// Componentes de autenticación
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Componentes de la tienda
import Header from './components/Shop/Header';
import ProductCard from './components/Shop/ProductCard';
import Cart from './components/Shop/Cart';
import Hero from './components/Shop/Hero';
import Footer from './components/Shop/Footer';

// Dashboard (vista interna para usuarios logueados)
import Dashboard from './components/Dashboard/Dashboard';

// Datos estáticos de productos
import productsData from './data/products.json';

// Funciones del servicio de autenticación
import { initializeUsers, login, register, logout, getCurrentUser } from './utils/authService';

function App() {
  // Estado del usuario que ha iniciado sesión
  const [user, setUser] = useState(null);

  // Control del tipo de vista en el modal (login o register)
  const [authView, setAuthView] = useState('login');

  // Control para mostrar/ocultar el modal de autenticación
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Carrito de compras
  const [cartItems, setCartItems] = useState([]);

  // Control para abrir/cerrar el carrito
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Control para abrir/cerrar el dashboard
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Referencias para navegar con scroll a distintas secciones
  const productosRef = useRef(null);
  const ofertasRef = useRef(null);
  const contactoRef = useRef(null);

  // -----------------------------------------------
  // 🔹 Al cargar la app: inicializar usuarios y sesión
  // -----------------------------------------------
  useEffect(() => {
    const init = async () => {
      initializeUsers();            // crea usuarios por defecto en localStorage si no existen
      const currentUser = getCurrentUser(); // revisa si hay un usuario logueado previamente
      if (currentUser) {
        setUser(currentUser);       // restaura la sesión
      }
    };

    init();
  }, []);

  // -----------------------------------------------
  // 🔹 LOGIN
  // -----------------------------------------------
  const handleLogin = (email, password, setError) => {
    const result = login(email, password); // intenta iniciar sesión
    if (result.success) {
      setUser(result.user);               // guarda el usuario en el estado
      setShowAuthModal(false);            // cierra el modal
    } else {
      setError(result.message);            // muestra error en el formulario
    }
  };

  // -----------------------------------------------
  // 🔹 REGISTRO DE USUARIO
  // -----------------------------------------------
  const handleRegister = (userData, setError) => {
    const result = register(userData); // registra nuevo usuario
    if (result.success) {
      setUser(result.user);           // inicia sesión automáticamente
      setShowAuthModal(false);
    } else {
      setError(result.message);
    }
  };

  // -----------------------------------------------
  // 🔹 LOGOUT
  // -----------------------------------------------
  const handleLogout = () => {
    logout();                // elimina sesión del localStorage
    setUser(null);           // limpia usuario en estado
    setCartItems([]);        // vacía el carrito
    setIsCartOpen(false);    // cierra carrito
    setIsDashboardOpen(false);
  };

  // -----------------------------------------------
  // 🔹 AGREGAR PRODUCTOS AL CARRITO
  // -----------------------------------------------
  const handleAddToCart = (product) => {
    // Si no está logueado → abrir modal de login
    if (!user) {
      setShowAuthModal(true);
      setAuthView('login');
      return;
    }

    // Agregar o aumentar cantidad del producto
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Si no existe lo agregamos con cantidad inicial 1
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // -----------------------------------------------
  // 🔹 ACTUALIZAR CANTIDAD DEL CARRITO
  // -----------------------------------------------
  const handleUpdateQuantity = (id, newQuantity) => {
    // Si llega a cero eliminarlo
    if (newQuantity <= 0) {
      handleRemove(id);
      return;
    }

    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // -----------------------------------------------
  // 🔹 ELIMINAR PRODUCTO DEL CARRITO
  // -----------------------------------------------
  const handleRemove = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // -----------------------------------------------
  // 🔹 ABRIR CARRITO (solo si está logueado)
  // -----------------------------------------------
  const handleCartClick = () => {
    if (!user) {
      setShowAuthModal(true);
      setAuthView('login');
      return;
    }
    setIsCartOpen(true);
  };

  // -----------------------------------------------
  // 🔹 ABRIR MODAL DE LOGIN
  // -----------------------------------------------
  const handleLoginClick = () => {
    setShowAuthModal(true);
    setAuthView('login');
  };

  // -----------------------------------------------
  // 🔹 SCROLL A SECCIONES
  // -----------------------------------------------
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Productos que tienen descuento
  const productosConOferta = productsData.filter(p => p.discount);

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Header con navegación */}
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

      {/* Sección principal */}
      <Hero onViewProducts={() => scrollToSection(productosRef)} />

      {/* Sección Ofertas */}
      <div ref={ofertasRef} className="bg-gradient-to-r from-red-500 to-pink-500 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">
            🔥 Ofertas Especiales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productosConOferta.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sección de todos los productos */}
      <div ref={productosRef} className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Todos los Productos
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productsData.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>

      {/* Footer con información de contacto */}
      <Footer contactRef={contactoRef} />

      {/* Modal Login / Register */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Fondo oscuro */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowAuthModal(false)}
          />

          {/* Contenido del modal */}
          <div className="relative z-10 w-full max-w-md">
            {authView === 'login' ? (
              <Login 
                onLogin={handleLogin}
                onSwitchToRegister={() => setAuthView('register')}
                onClose={() => setShowAuthModal(false)}
              />
            ) : (
              <Register 
                onRegister={handleRegister}
                onSwitchToLogin={() => setAuthView('login')}
                onClose={() => setShowAuthModal(false)}
              />
            )}
          </div>
        </div>
      )}

      {/* Carrito */}
      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
      />

      {/* Dashboard (solo si el usuario está logueado) */}
      {user && (
        <Dashboard
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          user={user}
        />
      )}
    </div>
  );
}

export default App;