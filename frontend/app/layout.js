import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import DynamicCursor from '@/components/DynamicCursor';
import './globals.css';

export const metadata = {
  title: 'KN Store — Calzado con carácter',
  description: 'Tienda virtual de calzado KN Store. Explora el catálogo completo de zapatillas, botas y más.',
  keywords: ['calzado', 'zapatillas', 'tienda online', 'KN Store'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <div className="kn-app-shell">
            <Navbar />
            <main className="kn-main">{children}</main>
            <DynamicCursor />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
