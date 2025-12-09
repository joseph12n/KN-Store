const ProductCard = ({ product, onAddToCart }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        {product.discount && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{product.discount}%
          </span>
        )}
        <span className="absolute bottom-2 left-2 bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
          Stock: {product.stock}
        </span>
      </div>
      
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{product.category}</p>
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
          
        <button 
          onClick={() => onAddToCart(product)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold"
        >
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};

export default ProductCard;