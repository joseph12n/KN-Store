import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Calendar, Package } from 'lucide-react';
import { getSalesStats, getRecentSales } from '../../utils/salesService';

const SalesReport = () => {
  const [stats, setStats] = useState(null);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStats(getSalesStats());
    setRecentSales(getRecentSales(10));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMonthName = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
  };

  if (!stats) {
    return <div className="text-center py-12">Cargando estadísticas...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-800">Reporte de Ventas General</h3>
        <p className="text-gray-600 text-sm">Vista completa de las ventas de la tienda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag size={32} className="opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <span className="text-sm font-semibold">Total</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalSales}</div>
          <div className="text-sm opacity-80">Ventas Realizadas</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} className="opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <span className="text-sm font-semibold">Ingresos</span>
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">{formatPrice(stats.totalRevenue)}</div>
          <div className="text-sm opacity-80">Ingresos Totales</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={32} className="opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <span className="text-sm font-semibold">Promedio</span>
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">{formatPrice(stats.averageTicket)}</div>
          <div className="text-sm opacity-80">Ticket Promedio</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Package size={32} className="opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
              <span className="text-sm font-semibold">Items</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">
            {stats.topProducts.reduce((sum, p) => sum + p.quantity, 0)}
          </div>
          <div className="text-sm opacity-80">Unidades Vendidas</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Calendar size={20} className="text-blue-500" />
          Ventas por Mes (Últimos 6 Meses)
        </h4>
        <div className="space-y-3">
          {stats.salesByMonth.map((monthData) => {
            const maxRevenue = Math.max(...stats.salesByMonth.map(m => m.revenue));
            const percentage = maxRevenue > 0 ? (monthData.revenue / maxRevenue) * 100 : 0;
            
            return (
              <div key={monthData.month} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{getMonthName(monthData.month)}</span>
                  <span className="text-gray-600">
                    {formatPrice(monthData.revenue)} ({monthData.count} ventas)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-green-500" />
          Top 5 Productos Más Vendidos
        </h4>
        <div className="space-y-4">
          {stats.topProducts.map((product, index) => (
            <div key={product.productId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                #{index + 1}
              </div>
              <img
                src={product.productImage}
                alt={product.productName}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h5 className="font-semibold text-gray-800">{product.productName}</h5>
                <p className="text-sm text-gray-600">
                  {product.quantity} unidades vendidas
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">{formatPrice(product.revenue)}</div>
                <div className="text-xs text-gray-500">Ingresos</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <ShoppingBag size={20} className="text-orange-500" />
          Últimas 10 Ventas
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">#{sale.id}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{sale.userName}</div>
                      <div className="text-xs text-gray-500">{sale.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {sale.items.length} producto(s)
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      {formatPrice(sale.total)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No hay ventas registradas aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;