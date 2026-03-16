const express = require('express');
const dotenv = require('dotenv');
const conectarDB = require('./config/db'); // Importas tu archivo

dotenv.config();
const app = express();

// Llama a la conexión
conectarDB();

app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en el puerto ${PORT}`);
});