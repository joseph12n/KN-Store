import Link from 'next/link';
import { MessageCircle, Mail, MapPin, CreditCard } from 'lucide-react';
import styles from './Footer.module.css';

/* ------------------------------------------------------------------ */
/* Iconos SVG de redes sociales                                        */
/* ------------------------------------------------------------------ */

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconTwitter() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="#1a1a1a" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Iconos SVG de metodos de pago                                       */
/* ------------------------------------------------------------------ */

function IconVisa() {
  return (
    <svg
      className={styles.paymentIcon}
      viewBox="0 0 38 24"
      aria-label="Visa"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="38" height="24" rx="4" fill="#1A1F71" />
      <text x="5" y="17" fontSize="11" fontWeight="bold" fill="#FFFFFF" fontFamily="Arial, sans-serif">
        VISA
      </text>
    </svg>
  );
}

function IconMastercard() {
  return (
    <svg
      className={styles.paymentIcon}
      viewBox="0 0 38 24"
      aria-label="Mastercard"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="38" height="24" rx="4" fill="#252525" />
      <circle cx="15" cy="12" r="7" fill="#EB001B" />
      <circle cx="23" cy="12" r="7" fill="#F79E1B" />
      <path
        d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function IconPSE() {
  return (
    <svg
      className={styles.paymentIcon}
      viewBox="0 0 38 24"
      aria-label="PSE"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="38" height="24" rx="4" fill="#006A3C" />
      <text x="7" y="17" fontSize="11" fontWeight="bold" fill="#FFFFFF" fontFamily="Arial, sans-serif">
        PSE
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Componente principal                                                 */
/* ------------------------------------------------------------------ */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* ---- 1. Contacto ---- */}
        <section className={styles.section} aria-labelledby="footer-contact-heading">
          <h3 id="footer-contact-heading" className={styles.sectionTitle}>
            Contacto
          </h3>
          <address className={styles.contact}>
            <a
              href="https://wa.me/573001234567"
              className={styles.contactLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar por WhatsApp"
            >
              <MessageCircle size={16} aria-hidden="true" />
              <span>+57 300 123 4567</span>
            </a>
            <a
              href="mailto:contacto@knstore.co"
              className={styles.contactLink}
              aria-label="Enviar correo electronico"
            >
              <Mail size={16} aria-hidden="true" />
              <span>contacto@knstore.co</span>
            </a>
            <a
              href="https://maps.google.com/?q=KN+Store+Colombia"
              className={styles.contactLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver ubicacion en Google Maps"
            >
              <MapPin size={16} aria-hidden="true" />
              <span>Ver ubicacion</span>
            </a>
          </address>
        </section>

        {/* ---- 2. Navegacion interna ---- */}
        <section className={styles.section} aria-labelledby="footer-nav-heading">
          <h3 id="footer-nav-heading" className={styles.sectionTitle}>
            Tienda
          </h3>
          <nav className={styles.navLinks} aria-label="Enlaces del footer">
            <Link href="/" className={styles.navLink}>Productos</Link>
            <Link href="/faq" className={styles.navLink}>Preguntas frecuentes</Link>
            <Link href="/politicas" className={styles.navLink}>Politicas de privacidad</Link>
            <Link href="/terminos" className={styles.navLink}>Terminos y condiciones</Link>
          </nav>
        </section>

        {/* ---- 3. Metodos de pago ---- */}
        <section className={styles.section} aria-labelledby="footer-payment-heading">
          <h3 id="footer-payment-heading" className={styles.sectionTitle}>
            Metodos de pago
          </h3>
          <div className={styles.paymentMethods}>
            <IconVisa />
            <IconMastercard />
            <IconPSE />
            <CreditCard size={38} className={styles.paymentIconFallback} aria-label="Otras tarjetas" />
          </div>
        </section>

        {/* ---- 4. Redes sociales ---- */}
        <section className={styles.section} aria-labelledby="footer-social-heading">
          <h3 id="footer-social-heading" className={styles.sectionTitle}>
            Siguenos
          </h3>
          <div className={styles.socialLinks}>
            <a
              href="https://facebook.com/knstore"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook de KN Store"
            >
              <IconFacebook />
            </a>
            <a
              href="https://instagram.com/knstore"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de KN Store"
            >
              <IconInstagram />
            </a>
            <a
              href="https://twitter.com/knstore"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter de KN Store"
            >
              <IconTwitter />
            </a>
            <a
              href="https://youtube.com/@knstore"
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube de KN Store"
            >
              <IconYoutube />
            </a>
          </div>
        </section>

      </div>

      {/* ---- 5. Barra de copyright ---- */}
      <div className={styles.bottom}>
        <p className={styles.copyright}>
          &copy; {currentYear} KN Store. Todos los derechos reservados.
        </p>
        <p className={styles.legalNote}>
          Hecho con dedicacion en Colombia.
        </p>
      </div>
    </footer>
  );
}
