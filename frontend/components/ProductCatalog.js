'use client';

import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Package, RefreshCw, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

const gridV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.1 } },
};

const cardV = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

const ProductCard = ({ product }) => {
  const isActive = product.active !== false;
  return (
    <Motion.article className="product-card" variants={cardV}>
      <div className="product-card__image">
        <Package size={44} strokeWidth={1.2} />
        <span className={`product-card__badge product-card__badge--${isActive ? 'active' : 'inactive'}`}>
          {isActive ? 'Disponible' : 'Inactivo'}
        </span>
      </div>

      <div className="product-card__body">
        {product.brand && <p className="product-card__brand">{product.brand}</p>}
        <h3 className="product-card__name">{product.name}</h3>
        {product.description && <p className="product-card__desc">{product.description}</p>}

        <div className="product-card__footer">
          <span className="product-card__price">
            ${product.price != null ? Number(product.price).toLocaleString('es-CO') : '—'}
          </span>
          {product.stock != null && (
            <span className="product-card__stock">{product.stock} uds.</span>
          )}
        </div>
      </div>
    </Motion.article>
  );
};

const SkeletonCard = () => (
  <div className="product-card">
    <div className="skeleton skeleton--image" />
    <div className="product-card__body product-card__body--skeleton">
      <div className="skeleton skeleton--line-sm" />
      <div className="skeleton skeleton--line-md" />
      <div className="skeleton skeleton--line-xs" />
      <div className="product-card__footer product-card__footer--skeleton">
        <div className="skeleton skeleton--line-price" />
        <div className="skeleton skeleton--line-stock" />
      </div>
    </div>
  </div>
);

export default function ProductCatalog({ products, categories }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const router = useRouter();

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => {
          if (!p.category) return false;
          const id = typeof p.category === 'object' ? p.category._id : p.category;
          return id === activeCategory;
        });

  const countFor = (catId) =>
    products.filter((p) => {
      if (!p.category) return false;
      const id = typeof p.category === 'object' ? p.category._id : p.category;
      return id === catId;
    }).length;

  return (
    <>
      {/* Stats */}
      <Motion.div
        className="stats-row"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="stat-card">
          <span className="stat-card__label">Productos</span>
          <span className="stat-card__value">{products.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Categorías</span>
          <span className="stat-card__value">{categories.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Disponibles</span>
          <span className="stat-card__value">
            {products.filter((p) => p.active !== false).length}
          </span>
        </div>
      </Motion.div>

      {/* Category filter */}
      {categories.length > 0 && (
        <Motion.div
          className="category-pills"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            className={`category-pill${activeCategory === 'all' ? ' is-active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            Todos ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              className={`category-pill${activeCategory === cat._id ? ' is-active' : ''}`}
              onClick={() => setActiveCategory(cat._id)}
            >
              {cat.name} ({countFor(cat._id)})
            </button>
          ))}
        </Motion.div>
      )}

      {/* Actions */}
      <Motion.div
        className="hero__actions"
        style={{ marginTop: 'var(--sp-6)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <button
          className="btn btn-secondary btn-sm"
          type="button"
          onClick={() => router.refresh()}
        >
          <RefreshCw size={13} />
          Actualizar
        </button>
      </Motion.div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state empty-state--spaced">
          <div className="empty-state__icon">
            <Package size={48} />
          </div>
          <h4>Sin productos{activeCategory !== 'all' ? ' en esta categoría' : ''}</h4>
          <p>
            {activeCategory !== 'all'
              ? 'Prueba con otra categoría o carga todos los productos.'
              : 'Agrega productos desde el panel de administración.'}
          </p>
        </div>
      ) : (
        <Motion.div
          className="product-grid"
          variants={gridV}
          initial="hidden"
          animate="show"
        >
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </Motion.div>
      )}
    </>
  );
}
