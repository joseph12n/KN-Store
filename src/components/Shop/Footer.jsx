// src/components/Footer.jsx
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>KN Store</h3>
          <p>Tu tienda de confianza</p>
        </div>
        
        <div className="footer-section">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="/about">Acerca de</a></li>
            <li><a href="/contact">Contacto</a></li>
            <li><a href="/terms">Términos</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Síguenos</h4>
          <div className="social-links">
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
            <a href="#">Twitter</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 KN Store. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;