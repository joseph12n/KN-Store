'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { normalizeImages } from '@/lib/imageMapping';
import ImageGallery from '@/components/products/ImageGallery/ImageGallery';
import styles from './ProductPage.module.css';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function isProductOnOffer(discount) {
  if (!discount) return false;
  const hasDiscount = (discount.percentage > 0) || (discount.amount > 0);
  if (!hasDiscount) return false;
  const now = Date.now();
  if (discount.startDate && new Date(discount.startDate).getTime() > now) return false;
  if (discount.endDate && new Date(discount.endDate).getTime() < now) return false;
  return true;
}

function isProductNew(createdAt) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < THIRTY_DAYS_MS;
}

function formatPrice(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}

function ProductSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.galleryCol}>
        <div className={styles.skeletonMain} />
        <div className={styles.skeletonThumbStrip}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.skeletonThumb} />
          ))}
        </div>
      </div>
      <div className={styles.infoCol}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonLine}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonLineShort}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonPrice}`} />
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!id) return;

    setStatus('loading');

    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setStatus('error');
          return;
        }
        setProduct(data.data);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, [id]);

  if (status === 'loading') {
    return <ProductSkeleton />;
  }

  if (status === 'error' || !product) {
    return (
      <div className={styles.errorWrap}>
        <p className={styles.errorMsg}>No se pudo cargar el producto.</p>
      </div>
    );
  }

  const images = normalizeImages(product.images);
  const isOffer = isProductOnOffer(product.discount);
  const isNew = isProductNew(product.createdAt);

  const displayPrice = product.finalPrice ?? product.price;
  const hasDiscount = isOffer && product.finalPrice != null && product.finalPrice < product.price;

  return (
    <main className={styles.page}>
      <div className={styles.galleryCol}>
        <ImageGallery images={images} isOffer={isOffer} isNew={isNew} />
      </div>

      <div className={styles.infoCol}>
        {product.brand && (
          <span className={styles.brand}>{product.brand}</span>
        )}

        <h1 className={styles.productName}>{product.name}</h1>

        {product.sku && (
          <p className={styles.sku}>SKU: {product.sku}</p>
        )}

        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(displayPrice)}</span>
          {hasDiscount && (
            <span className={styles.originalPrice}>{formatPrice(product.price)}</span>
          )}
          {product.discount?.percentage > 0 && isOffer && (
            <span className={styles.discountBadge}>-{product.discount.percentage}%</span>
          )}
        </div>

        {product.description && (
          <p className={styles.description}>{product.description}</p>
        )}

        {product.stock != null && (
          <p className={product.stock > 0 ? styles.stockIn : styles.stockOut}>
            {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
          </p>
        )}
      </div>
    </main>
  );
}
