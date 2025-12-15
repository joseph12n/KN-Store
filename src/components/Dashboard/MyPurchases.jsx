import { useState, useEffect } from 'react';
import { Package, Calendar, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { getSalesByUser } from '../../utils/salesService';

const MyPurchases = ({ user }) => {
  const [purchases, setPurchases] = useState([]);
  const [expandedPurchase, setExpandedPurchase] = useState(null);

  useEffect(() => {
    loadPurchases();
  }, [user]);

  const loadPurchases = () => {
    const userPurchases = getSalesByUser(user.id);
    setPurchases(userPurchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (purchaseId) => {
    setExpandedPurchase(expandedPurchase === purchaseId ? null : purchaseId);
  };

  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const totalProducts = purchases.reduce((sum, purchase) => 
    sum + purchase.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800">Mis Compras</h3>
        <p className="text-gray-600 text-sm">Historial completo de tus pedidos</p>
      </div>

      {/* Resumen de compras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Package size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{purchases.length}</div>
              <div className="text-sm opacity-80">Compras Totales</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <CreditCard size={24} />
            </div>
            <div>
              <div className="text-xl font-bold">{formatPrice(totalSpent)}</div>
              <div className="text-sm opacity-80">Gastado Total</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Package size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <div className="text-sm opacity-80">Productos Comprados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de compras */}
      <div className="space-y-4">
        {purchases.length > 0 ? (
          purchases.map((purchase) => (
            <div key={purchase.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              {/* Header de la compra */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleExpand(purchase.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Package className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg">
                        Pedido #{purchase.id}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(purchase.createdAt)}
                        </span>
                        <span>{purchase.items.length} producto(s)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(purchase.total)}
                      </div>
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mt-1">
                        {purchase.status}
                      </span>
                    </div>
                    <div>
                      {expandedPurchase === purchase.id ? (
                        <ChevronUp className="text-gray-400" size={24} />
                      ) : (
                        <ChevronDown className="text-gray-400" size={24} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles expandibles */}
              {expandedPurchase === purchase.id && (
                <div className="border-t bg-gray-50 p-6">
                  <h5 className="font-semibold text-gray-800 mb-4">Productos:</h5>
                  <div className="space-y-3">
                    {purchase.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-lg">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h6 className="font-semibold text-gray-800">{item.productName}</h6>
                          <p className="text-sm text-gray-600 mt-1">
                            Cantidad: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="font-bold text-gray-800">
                          {formatPrice(item.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <CreditCard size={16} />
                        Método de pago: {purchase.paymentMethod}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">Total:</span>
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(purchase.total)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              No tienes compras aún
            </h4>
            <p className="text-gray-600">
              Cuando realices tu primera compra, aparecerá aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPurchases;