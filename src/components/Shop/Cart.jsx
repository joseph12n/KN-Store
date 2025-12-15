import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { createSale } from '../../utils/salesService';
const Cart = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemove, user }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const paymentMethods = [
    {
      id: 'efectivo',
      name: 'Efectivo',
      description: 'Paga al recibir tu pedido',
      icon: <Banknote size={32} />,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'pse',
      name: 'PSE',
      description: 'Débito desde tu banco',
      icon: (
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/1/16/PSE_logo.svg" 
            alt="PSE"
            className="w-12 h-12 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<span class="text-2xl font-bold text-red-600">PSE</span>';
            }}
          />
        </div>
      ),
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'nequi',
      name: 'Nequi',
      description: 'Transferencia desde Nequi',
      icon: (
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: '#FF006B' }}>N</span>
        </div>
      ),
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'daviplata',
      name: 'DaviPlata',
      description: 'Paga con tu billetera digital',
      icon: (
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: '#ED1C24' }}>D</span>
        </div>
      ),
      color: 'from-red-600 to-red-700'
    }
  ];

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    setShowCheckout(true);
    if (!user) {
    alert('Debes iniciar sesión para realizar una compra');
    onClose();
    return;
  }
  };

const handleConfirmPayment = () => {
  if (!selectedPayment) {
    alert('Por favor selecciona un método de pago');
    return;
  }

  setIsProcessing(true);

  // Simular procesamiento de pago
  setTimeout(() => {
    try {
      const paymentMethodName = paymentMethods.find(p => p.id === selectedPayment)?.name;
      
      console.log('Iniciando pago...', {
        cartItems,
        user,
        paymentMethodName
      });

      // Crear la venta con el método de pago seleccionado
      const result = createSale(cartItems, user, paymentMethodName);
      
      console.log('Resultado de la venta:', result);
      
      if (result.success) {
        // Alerta simple de éxito
        alert('¡Pago exitoso! 🎉');
        
        // Limpiar carrito uno por uno
        const itemsToRemove = [...cartItems];
        itemsToRemove.forEach(item => {
          onRemove(item.id);
        });
        
        // Resetear estados
        setShowCheckout(false);
        setSelectedPayment('');
        setIsProcessing(false);
        
        // Cerrar carrito
        onClose();
      } else {
        throw new Error('Error al crear la venta');
      }
    } catch (error) {
      console.error('Error en el proceso de pago:', error);
      alert('Error al procesar el pago. Por favor intenta de nuevo.');
      setIsProcessing(false);
    }
  }, 1500);
};

  if (!isOpen) return null;
  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => {
          if (!showCheckout) onClose();
        }}
      />
      <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <h2 className="text-xl font-bold">
            {showCheckout ? 'Método de Pago' : 'Carrito de Compras'}
          </h2>
          <button 
            onClick={() => {
              if (showCheckout) {
                setShowCheckout(false);
                setSelectedPayment('');
              } else {
                onClose();
              }
            }} 
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
            disabled={isProcessing}
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido principal */}
        {!showCheckout ? (
          <>
            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4 bg-gray-50 p-3 rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                        <p className="text-purple-600 font-bold text-sm">{formatPrice(item.price)}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            <Plus size={16} />
                          </button>
                          <button 
                            onClick={() => onRemove(item.id)}
                            className="ml-auto text-red-500 hover:text-red-700 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer con total y botón */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="font-bold text-2xl text-purple-600">
                    {formatPrice(total)}
                  </span>
                </div>
                <button 
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-bold"
                >
                  Proceder al Pago
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Vista de selección de método de pago */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Selecciona tu método de pago</h3>
                <p className="text-sm text-gray-600">Total a pagar: <span className="font-bold text-purple-600">{formatPrice(total)}</span></p>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    disabled={isProcessing}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      selectedPayment === method.id
                        ? 'border-purple-600 bg-purple-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`bg-gradient-to-br ${method.color} rounded-xl p-3 flex items-center justify-center`}>
                        {method.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-gray-800">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                      {selectedPayment === method.id && (
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {selectedPayment && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Este es un sistema de demostración. No se procesará ningún pago real.
                  </p>
                </div>
              )}
            </div>

            {/* Botón de confirmar pago */}
            <div className="p-4 border-t bg-gray-50">
              <button 
                onClick={handleConfirmPayment}
                disabled={!selectedPayment || isProcessing}
                className={`w-full py-3 rounded-lg font-bold transition ${
                  selectedPayment && !isProcessing
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  'Confirmar Pago'
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                {selectedPayment ? 'Confirma tu compra' : 'Selecciona un método de pago'}
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;