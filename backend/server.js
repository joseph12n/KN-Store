/**
 * Punto de Entrada del Servidor
 *
 * Configura Express, conecta a la base de datos y registra
 * todas las rutas de la API REST bajo el prefijo /api.
 *
 * @module server
 */

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// ==================== CONFIGURACIÓN ====================

dotenv.config();
const app = express();

// Conectar a la base de datos
connectDB();

// Middleware global para parsear JSON en el body de las peticiones
app.use(express.json());

// ==================== REGISTRO DE RUTAS ====================

const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/products', productRoutes);

// ==================== INICIO DEL SERVIDOR ====================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en el puerto ${PORT}`);
});