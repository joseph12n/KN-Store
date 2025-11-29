import { useState } from 'react';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Header from './components/Shop/Header';
import ProductCard from './components/Shop/ProductCard';
import Cart from './components/Shop/Cart';
import Hero from './components/Shop/Hero';
import productsData from './data/products.json';

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCartItems([]);
    setIsCartOpen(false);
  };

  const handleAddToCart = (product) => {
    // Si no hay usuario, mostrar modal de login
    if (!user) {
      setShowAuthModal(true);
      setAuthView('login');
      return;
    }

    // Si hay usuario, agregar al carrito
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        cartItems={cartItems}
        onCartClick={handleCartClick}
        user={user}
        onLogout={handleLogout}
        onLoginClick={handleLoginClick}
      />
      
      <Hero />
      
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Productos Destacados</h2>
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
    </div>
  );
}

export default App;