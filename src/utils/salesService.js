const SALES_KEY = 'kn_store_sales';

// Inicializar ventas
export const initializeSales = () => {
  const existingSales = localStorage.getItem(SALES_KEY);
  if (!existingSales) {
    localStorage.setItem(SALES_KEY, JSON.stringify([]));
  }
};

// Obtener todas las ventas
export const getSales = () => {
  const sales = localStorage.getItem(SALES_KEY);
  return sales ? JSON.parse(sales) : [];
};

// Guardar ventas
export const saveSales = (sales) => {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
};

// Crear una nueva venta (cuando el cliente compra)
export const createSale = (cartItems, user, paymentMethod = 'Tarjeta de Crédito') => {
  const sales = getSales();
  
  const newSale = {
    id: Date.now(),
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    items: cartItems.map(item => ({
      productId: item.id,
      productName: item.name,
      productImage: item.image,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity
    })),
    total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    status: 'completado',
    paymentMethod: paymentMethod,
    createdAt: new Date().toISOString()
  };

  sales.push(newSale);
  saveSales(sales);

  return { success: true, sale: newSale };
};

// Obtener ventas por usuario (para clientes)
export const getSalesByUser = (userId) => {
  const sales = getSales();
  return sales.filter(sale => sale.userId === userId);
};

// Obtener estadísticas generales (para admin)
export const getSalesStats = () => {
  const sales = getSales();
  
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  // Productos más vendidos
  const productSales = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (productSales[item.productId]) {
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.subtotal;
      } else {
        productSales[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          quantity: item.quantity,
          revenue: item.subtotal
        };
      }
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Ventas por mes (últimos 6 meses)
  const salesByMonth = {};
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    salesByMonth[monthKey] = { revenue: 0, count: 0 };
  }

  sales.forEach(sale => {
    const saleDate = new Date(sale.createdAt);
    const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
    
    if (salesByMonth[monthKey]) {
      salesByMonth[monthKey].revenue += sale.total;
      salesByMonth[monthKey].count += 1;
    }
  });

  return {
    totalSales,
    totalRevenue,
    averageTicket,
    topProducts,
    salesByMonth: Object.entries(salesByMonth).map(([month, data]) => ({
      month,
      ...data
    }))
  };
};

// Obtener ventas recientes (para admin)
export const getRecentSales = (limit = 10) => {
  const sales = getSales();
  return sales
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};