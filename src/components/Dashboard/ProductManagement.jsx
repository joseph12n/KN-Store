import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import { getProducts, deleteProduct } from '../../utils/productService';
import ProductModal from './ProductModal';

const ProductManagement = ({ currentUser }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(getProducts());
  };

  const handleDelete = (productId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      const result = deleteProduct(productId, currentUser);
      if (result.success) {
        setMessage({ type: 'success', text: 'Producto eliminado correctamente' });
        loadProducts();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: result.message });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = () => {
    loadProducts();
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const canEdit = (product) => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'proveedor' && product.createdBy === currentUser.id) return true;
    return false;
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Gestión de Productos</h3>
            <p className="text-gray-600 text-sm">Administra el catálogo de productos</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2"
          >
            <Package size={20} />
            Agregar Producto
          </button>
        </div>

        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-100">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discount && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{product.discount}%
                  </span>
                )}
              </div>
              
              <div className="p-4">
                <h4 className="font-bold text-gray-800 mb-1">{product.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                
                <div className="mb-3">
                  <div className="text-lg font-bold text-purple-600">
                    {formatPrice(product.price)}
                  </div>
                  {product.originalPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>Stock: {product.stock}</span>
                  <span>ID: {product.id}</span>
                </div>

                {canEdit(product) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 text-sm"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No se encontraron productos</p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          Total de productos: {filteredProducts.length}
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ProductManagement;