import { ShoppingBag } from 'lucide-react';
import ProductCatalog from '@/components/ProductCatalog';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/products`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export default async function StorePage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero — Server-rendered HTML (SEO) */}
      <section className="hero">
        <p className="hero__eyebrow">KN-Store — Colección actual</p>

        <h1 className="hero__headline">
          El calzado que <mark>define</mark>
          <br />
          tu estilo
        </h1>

        <p className="hero__sub">
          Explora el catálogo completo. No necesitas cuenta para navegar.
        </p>

        <div className="hero__actions">
          <a href="#catalogo" className="btn btn-primary btn-lg">
            <ShoppingBag size={16} />
            Ver catálogo
          </a>
        </div>
      </section>

      {/* Catálogo interactivo — Client Component con datos del servidor */}
      <div id="catalogo">
        <ProductCatalog products={products} categories={categories} />
      </div>
    </div>
  );
}
