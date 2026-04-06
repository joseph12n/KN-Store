'use client';

import { useEffect, useState } from 'react';
import { motion as Motion, useReducedMotion, useSpring } from 'framer-motion';

const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, [role="button"]';

export default function DynamicCursor() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);

  const ringX = useSpring(-100, { stiffness: 540, damping: 40, mass: 0.25 });
  const ringY = useSpring(-100, { stiffness: 540, damping: 40, mass: 0.25 });
  const dotX = useSpring(-100, { stiffness: 900, damping: 42, mass: 0.12 });
  const dotY = useSpring(-100, { stiffness: 900, damping: 42, mass: 0.12 });

  useEffect(() => {
    if (typeof window === 'undefined' || reduceMotion) return;

    const media = window.matchMedia('(pointer: fine)');

    const applyMode = () => {
      setEnabled(media.matches);
    };

    applyMode();
    media.addEventListener('change', applyMode);

    return () => {
      media.removeEventListener('change', applyMode);
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (!enabled) {
      document.body.removeAttribute('data-dynamic-cursor');
      return;
    }

    document.body.setAttribute('data-dynamic-cursor', 'on');

    const onMove = (event) => {
      const x = event.clientX;
      const y = event.clientY;

      ringX.set(x - 18);
      ringY.set(y - 18);
      dotX.set(x - 4);
      dotY.set(y - 4);
      setVisible(true);

      const target = event.target;
      if (target instanceof Element) {
        setInteractive(Boolean(target.closest(INTERACTIVE_SELECTOR)));
      }
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('mouseenter', onEnter);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseenter', onEnter);
      document.body.removeAttribute('data-dynamic-cursor');
    };
  }, [enabled, ringX, ringY, dotX, dotY]);

  if (!enabled) return null;

  return (
    <>
      <Motion.div
        className={`kn-cursor kn-cursor--ring${interactive ? ' is-interactive' : ''}`}
        style={{ x: ringX, y: ringY }}
        animate={{ opacity: visible ? 1 : 0, scale: interactive ? 1.22 : 1 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      />
      <Motion.div
        className={`kn-cursor kn-cursor--dot${interactive ? ' is-interactive' : ''}`}
        style={{ x: dotX, y: dotY }}
        animate={{ opacity: visible ? 1 : 0, scale: interactive ? 0.75 : 1 }}
        transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
      />
    </>
  );
}
