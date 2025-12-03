import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = ({ contactRef }) => {
  return (
    <footer ref={contactRef} className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Columna 1: Logo y Descripción */}
          <div>
            <div className="text-2xl font-bold mb-4">
              <span className="text-purple-500">KN</span>
              <span className="text-pink-500">-STORE</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Tu tienda de confianza para los mejores zapatos deportivos en Colombia. 
              Calidad, estilo y precio en un solo lugar.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                 className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition">
                <Twitter size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h3 className="text-lg font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-purple-400 transition">Sobre Nosotros</a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition">Política de Privacidad</a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition">Términos y Condiciones</a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition">Preguntas Frecuentes</a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition">Devoluciones</a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Categorías */}
          <div>
            <h3 className="text-lg font-bold mb-4">Categorías</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-purple-400 transition">Running</a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition">Casual</a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition">Clásico</a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition">Urbano</a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400 transition">Ofertas Especiales</a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <Mail size={20} className="text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm">Email</p>
                  <a href="mailto:knstore@gmail.com" className="hover:text-purple-400 transition">
                    knstore@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={20} className="text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm">Teléfono</p>
                  <a href="tel:+573001234567" className="hover:text-purple-400 transition">
                    +57 300 123 4567
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm">Dirección</p>
                  <p>Bogotá, Colombia</p>
                  <p>Calle 100 #15-20</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-bold mb-2">Suscríbete a nuestro Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Recibe las mejores ofertas y novedades directamente en tu correo
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:outline-none text-white"
              />
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition">
                Suscribirse
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} KN-STORE. Todos los derechos reservados.</p>
          <p className="mt-2">
            Hecho con ❤️ en Colombia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;