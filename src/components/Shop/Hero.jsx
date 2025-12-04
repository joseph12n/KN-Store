const Hero = ({ onViewProducts }) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Encuentra tu Estilo Perfecto</h1>
        <p className="text-xl mb-8">Los mejores zapatos deportivos al mejor precio en Colombia</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button 
            onClick={onViewProducts}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Ver Productos
          </button>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-purple-600 transition">
            Novedades
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;