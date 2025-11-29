import { ShoppingCart, LogOut, User, LogIn } from 'lucide-react';

const Header = ({ cartItems, onCartClick, user, onLogout, onLoginClick }) => {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold">
            <span className="text-purple-500">KN</span>
            <span className="text-pink-500">-STORE</span>
          </div>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="hover:text-purple-400 transition">Inicio</a>
          <a href="#" className="hover:text-purple-400 transition">Productos</a>
          <a href="#" className="hover:text-purple-400 transition">Ofertas</a>
          <a href="#" className="hover:text-purple-400 transition">Contacto</a>
        </nav>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                <User size={18} />
                <span className="text-sm">{user.name}</span>
              </div>
              
              <button 
                onClick={onCartClick}
                className="relative p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              
              <button
                onClick={onLogout}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
                title="Cerrar sesión"
              >
                <LogOut size={24} />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onCartClick}
                className="relative p-2 hover:bg-gray-800 rounded-lg transition"
                title="Ver carrito"
              >
                <ShoppingCart size={24} />
              </button>
              
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold"
              >
                <LogIn size={20} />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;