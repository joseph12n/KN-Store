const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const url = process.env.MONGO_URI || "mongodb://localhost:27017/kn_store";
        
        await mongoose.connect(url);
        
        console.log('✅ Conexión exitosa a MongoDB');
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;