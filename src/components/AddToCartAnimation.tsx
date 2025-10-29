'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaperPlane {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface AddToCartAnimationProps {
  trigger: number;
  sourceElement?: HTMLElement | null;
}

/**
 * Paper plane animation flying from product button to cart
 */
export default function AddToCartAnimation({ trigger, sourceElement }: AddToCartAnimationProps) {
  const [planes, setPlanes] = useState<PaperPlane[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    // Get cart button position
    const cartButton = document.querySelector('.cart-button');
    if (!cartButton) return;

    const cartRect = cartButton.getBoundingClientRect();
    const cartCenterX = cartRect.left + cartRect.width / 2;
    const cartCenterY = cartRect.top + cartRect.height / 2;

    // Get source position
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;

    if (sourceElement) {
      const sourceRect = sourceElement.getBoundingClientRect();
      startX = sourceRect.left + sourceRect.width / 2;
      startY = sourceRect.top + sourceRect.height / 2;
    }

    // Create single paper plane
    const plane: PaperPlane = {
      id: `plane-${trigger}`,
      startX,
      startY,
      endX: cartCenterX,
      endY: cartCenterY,
    };

    setPlanes(prev => [...prev, plane]);

    // Remove after animation
    setTimeout(() => {
      setPlanes(prev => prev.filter(p => p.id !== plane.id));
    }, 1300);
  }, [trigger, sourceElement]);

  return (
    <div className="cart-animation-container">
      <AnimatePresence>
        {planes.map(plane => {
          // Calculate angle for rotation
          const angle = Math.atan2(
            plane.endY - plane.startY,
            plane.endX - plane.startX
          ) * (180 / Math.PI);

          return (
            <motion.div
              key={plane.id}
              className="paper-plane"
              style={{
                left: 0,
                top: 0,
              }}
              initial={{
                x: plane.startX,
                y: plane.startY,
                rotate: angle,
                scale: 0,
                opacity: 0
              }}
              animate={{
                x: plane.endX,
                y: plane.endY,
                rotate: angle + 720,
                scale: [0, 1.3, 1, 0],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 1.2,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              exit={{ opacity: 0 }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

