'use client';

import { useState, useCallback } from 'react';
import styles from './ImageGallery.module.css';

const PLACEHOLDER = 'https://placehold.co/600x600/011E2A/0CF25D?text=KN+Store';

export default function ImageGallery({ images = [], isOffer = false, isNew = false }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const hasImages = images.length > 0;
  const total = images.length;

  const currentImage = hasImages ? images[activeIndex] : null;
  const mainUrl = currentImage?.url || PLACEHOLDER;
  const mainAlt = currentImage?.alt || 'Imagen del producto';

  const goTo = useCallback(
    (index) => {
      if (index < 0) {
        setActiveIndex(total - 1);
      } else if (index >= total) {
        setActiveIndex(0);
      } else {
        setActiveIndex(index);
      }
    },
    [total]
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  return (
    <div className={styles.gallery}>
      {/* ---- Badges ---- */}
      <div className={styles.badgeGroup}>
        {isOffer && <span className={styles.badgeOffer}>Oferta</span>}
        {isNew && <span className={styles.badgeNew}>Nuevo</span>}
      </div>

      {/* ---- Main image area ---- */}
      <div className={styles.mainImageWrap}>
        {total > 1 && (
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={goPrev}
            aria-label="Imagen anterior"
          >
            &#8249;
          </button>
        )}

        <img
          key={mainUrl}
          src={mainUrl}
          alt={mainAlt}
          className={styles.mainImage}
        />

        {total > 1 && (
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={goNext}
            aria-label="Imagen siguiente"
          >
            &#8250;
          </button>
        )}

        {/* ---- Position indicator ---- */}
        {total > 1 && (
          <span className={styles.indicator}>
            {activeIndex + 1} / {total}
          </span>
        )}
      </div>

      {/* ---- Thumbnails ---- */}
      {total > 1 && (
        <div className={styles.thumbnailStrip} role="list" aria-label="Miniaturas del producto">
          {images.map((img, index) => (
            <button
              key={index}
              type="button"
              role="listitem"
              className={`${styles.thumbnailBtn} ${index === activeIndex ? styles.thumbnailBtnActive : ''}`}
              onClick={() => goTo(index)}
              aria-label={img.alt || `Ver imagen ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            >
              <img
                src={img.url}
                alt={img.alt || `Miniatura ${index + 1}`}
                className={styles.thumbnailImg}
              />
              {img.angle && (
                <span className={styles.angleLabel}>{img.angle}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ---- Empty state ---- */}
      {!hasImages && (
        <div className={styles.emptyState}>
          <img src={PLACEHOLDER} alt="Sin imagen disponible" className={styles.mainImage} />
          <p className={styles.emptyLabel}>Sin imagenes disponibles</p>
        </div>
      )}
    </div>
  );
}
