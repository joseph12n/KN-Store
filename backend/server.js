const express = require('express');
const dotenv = require('dotenv');
const conectarDB = require('./config/db'); // Importas tu archivo

dotenv.config();
const app = express();

// Llama a la conexión
conectarDB();

app.use(express.json());

// Importar e instanciar las Rutas
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en el puerto ${PORT}`);
});