import { useState, useEffect } from 'react';
import { X, Package, Tag, DollarSign, Image, Hash } from 'lucide-react';
import { createProduct, updateProduct } from '../../utils/productService';

const ProductModal = ({ isOpen, onClose, onSave, product, currentUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    discount: 0,
    image: '',
    stock: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice || '',
        discount: product.discount || 0,
        image: product.image,
        stock: product.stock
      });
    } else {
      setFormData({
        name: '',
        category: '',
        price: '',
        originalPrice: '',
        discount: 0,
        image: '',
        stock: ''
      });
    }
    setError('');
    setMessage({ type: '', text: '' });
  }, [product, isOpen]);

  /**
   * Calcula automáticamente el descuento basado en precio original y precio final
   * Fórmula: descuento = ((precioOriginal - precioFinal) / precioOriginal) * 100
   */
  const calculateDiscount = (originalPrice, finalPrice) => {
    if (!originalPrice || !finalPrice || originalPrice <= finalPrice) {
      return 0;
    }
    const discount = ((originalPrice - finalPrice) / originalPrice) * 100;
    return Math.round(discount); // Redondear al entero más cercano
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let updatedFormData = { ...formData };

    // Convertir a número para campos numéricos
    if (['price', 'originalPrice', 'stock'].includes(name)) {
      updatedFormData[name] = value === '' ? '' : Number(value);
    } else {
      updatedFormData[name] = value;
    }

    // Calcular descuento automáticamente cuando cambian los precios
    if (name === 'price' || name === 'originalPrice') {
      const original = name === 'originalPrice' ? Number(value) : formData.originalPrice;
      const final = name === 'price' ? Number(value) : formData.price;
      
      if (original && final) {
        updatedFormData.discount = calculateDiscount(original, final);
      } else {
        updatedFormData.discount = 0;
      }
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage({ type: '', text: '' });

    // Validaciones
    if (!formData.name || !formData.category || !formData.price || !formData.image || formData.stock === '') {
      setError('Todos los campos obligatorios deben ser completados');
      return;
    }

    if (formData.price <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    if (formData.stock < 0) {
      setError('El stock no puede ser negativo');
      return;
    }

    if (formData.originalPrice && formData.originalPrice <= formData.price) {
      setError('El precio original debe ser mayor al precio de venta');
      return;
    }

    // Preparar datos
    const dataToSave = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      image: formData.image,
      stock: Number(formData.stock)
    };

    // Agregar descuento y precio original si existen
    if (formData.originalPrice && formData.originalPrice > formData.price) {
      dataToSave.originalPrice = Number(formData.originalPrice);
      dataToSave.discount = formData.discount;
    }

    let result;
    if (product) {
      result = updateProduct(product.id, dataToSave, currentUser);
    } else {
      result = createProduct(dataToSave, currentUser);
    }

    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: product ? 'Producto actualizado correctamente' : 'Producto creado correctamente' 
      });
      setTimeout(() => {
        onSave();
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {product ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {message.text && (
            <div className={`px-4 py-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Nike Air Max 270"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none appearance-none bg-white"
              >
                <option value="">Seleccionar categoría</option>
                <option value="Running">Running</option>
                <option value="Casual">Casual</option>
                <option value="Urbano">Urbano</option>
                <option value="Clásico">Clásico</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Training">Training</option>
                <option value="Skate">Skate</option>
                <option value="Retro">Retro</option>
                <option value="Basketball">Basketball</option>
                <option value="Fútbol">Fútbol</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de Venta *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="459900"
                  min="0"
                  step="100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Precio final para el cliente</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="15"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>💰</span>
              Configurar Descuento (Opcional)
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>¿Cómo funciona?</strong>
              </p>
              <p className="text-xs text-blue-700">
                Ingresa el <strong>precio original</strong> del producto. El descuento se calculará automáticamente 
                comparándolo con el precio de venta.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Original (antes del descuento)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="549900"
                  min="0"
                  step="100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Debe ser mayor al precio de venta</p>
            </div>

            {formData.discount > 0 && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Descuento calculado:</span>
                  <span className="text-2xl font-bold text-green-600">{formData.discount}%</span>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Ahorro: ${formData.originalPrice && formData.price ? (formData.originalPrice - formData.price).toLocaleString('es-CO') : 0} COP
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de la Imagen *
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Usa el archivo <code className="bg-gray-100 px-1 rounded">TENNIS_LINKS.md</code> para encontrar imágenes
            </p>
            {formData.image && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+válida';
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
            >
              {product ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;