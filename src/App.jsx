import { useState, useRef, useEffect } from 'react';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Header from './components/Shop/Header';
import ProductCard from './components/Shop/ProductCard';
import Cart from './components/Shop/Cart';
import Hero from './components/Shop/Hero';
import Footer from './components/Shop/Footer';
import Dashboard from './components/Dashboard/Dashboard';
import productsData from './data/products.json';
import { initializeUsers, login, register, logout, getCurrentUser } from './utils/authService';

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Referencias para scroll
  const productosRef = useRef(null);
  const ofertasRef = useRef(null);
  const contactoRef = useRef(null);

  // Inicializar usuarios y verificar sesión
 useEffect(() => {
  const init = async () => {
    initializeUsers();
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  };

  init();
}, []);


  const handleLogin = (email, password, setError) => {
    const result = login(email, password);
    if (result.success) {
      setUser(result.user);
      setShowAuthModal(false);
    } else {
      setError(result.message);
    }
  };

  const handleRegister = (userData, setError) => {
    const result = register(userData);
    if (result.success) {
      setUser(result.user);
      setShowAuthModal(false);
    } else {
      setError(result.message);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setCartItems([]);
    setIsCartOpen(false);
    setIsDashboardOpen(false);
  };

  const handleAddToCart = (product) => {
    if (!user) {
      setShowAuthModal(true);
      setAuthView('login');
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, newQuantity) => {
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

  const handleRemove = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCartClick = () => {
    if (!user) {
      setShowAuthModal(true);
      setAuthView('login');
      return;
    }
    setIsCartOpen(true);
  };

  const handleLoginClick = () => {
    setShowAuthModal(true);
    setAuthView('login');
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const productosConOferta = productsData.filter(p => p.discount);

  return (
    <div className="min-h-screen bg-gray-100">
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
      
      <Hero onViewProducts={() => scrollToSection(productosRef)} />
      
      {/* Sección de Ofertas */}
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

      {/* Sección de Todos los Productos */}
      <div ref={productosRef} className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Todos los Productos</h2>
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

      {/* Footer con Contacto */}
      <Footer contactRef={contactoRef} />
      
      {/* Modal de autenticación */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowAuthModal(false)}
          />
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

      {/* Dashboard */}
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