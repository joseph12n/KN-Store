import { useState } from 'react';
import { X, Users, Settings, ShoppingBag, Package, TrendingUp, Receipt } from 'lucide-react';
import UserManagement from './UserManagement';
import UserProfile from './UserProfile';
import ProductManagement from './ProductManagement';
import SalesReport from './SalesReport';
import MyPurchases from './MyPurchases';

const Dashboard = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState('profile');

  if (!isOpen) return null;

  const canManageUsers = user.role === 'admin';
  const canManageProducts = user.role === 'admin' || user.role === 'proveedor';
  const canViewSalesReport = user.role === 'admin';

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full lg:w-3/4 xl:w-4/5 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-sm opacity-90">
              Bienvenido, {user.name} ({user.role})
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50 overflow-x-auto">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 min-w-max">
              {/* Mi Perfil - Todos */}
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-4 py-3 font-semibold transition border-b-2 whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-purple-600'
                }`}
              >
                <Settings size={20} />
                Mi Perfil
              </button>
              
              {/* Mis Compras - Todos */}
              <button
                onClick={() => setActiveTab('purchases')}
                className={`flex items-center gap-2 px-4 py-3 font-semibold transition border-b-2 whitespace-nowrap ${
                  activeTab === 'purchases'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-purple-600'
                }`}
              >
                <Receipt size={20} />
                Mis Compras
              </button>

              {/* Reporte de Ventas - Solo Admin */}
              {canViewSalesReport && (
                <button
                  onClick={() => setActiveTab('sales')}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold transition border-b-2 whitespace-nowrap ${
                    activeTab === 'sales'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <TrendingUp size={20} />
                  Reporte de Ventas
                </button>
              )}
              
              {/* Productos - Admin y Proveedor */}
              {canManageProducts && (
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold transition border-b-2 whitespace-nowrap ${
                    activeTab === 'products'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <Package size={20} />
                  Productos
                </button>
              )}
              
              {/* Usuarios - Solo Admin */}
              {canManageUsers && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold transition border-b-2 whitespace-nowrap ${
                    activeTab === 'users'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <Users size={20} />
                  Usuarios
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeTab === 'profile' && <UserProfile user={user} onClose={onClose} />}
          {activeTab === 'purchases' && <MyPurchases user={user} />}
          {activeTab === 'sales' && canViewSalesReport && <SalesReport />}
          {activeTab === 'products' && canManageProducts && <ProductManagement currentUser={user} />}
          {activeTab === 'users' && canManageUsers && <UserManagement currentUser={user} />}
        </div>
      </div>
    </>
  );
};

export default Dashboard;