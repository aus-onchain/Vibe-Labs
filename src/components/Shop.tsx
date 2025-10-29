'use client';

import { useState, useEffect } from 'react';
import { Product, CartItem } from '@/types/products';
import { products } from '@/data/products';
import ProductCarousel from './ProductCarousel';
import Cart from './Cart';
import ThemeToggle from './ThemeToggle';
import AddToCartAnimation from './AddToCartAnimation';
import { useTheme } from '@/hooks/useTheme';

/**
 * Main shop component
 * Manages cart state and checkout flow
 */
export default function Shop() {
  const { theme, toggleTheme, isFlickering } = useTheme();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutStatus, setCheckoutStatus] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
    paymentLink?: string;
  }>({ status: 'idle' });
  const [addToCartTrigger, setAddToCartTrigger] = useState(0);
  const [animationSource, setAnimationSource] = useState<HTMLElement | null>(null);

  const addToCart = (product: Product, sourceElement?: HTMLElement | null) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...items, { product, quantity: 1 }];
    });
    
    // Trigger add to cart animation with source element
    setAnimationSource(sourceElement || null);
    setAddToCartTrigger(prev => prev + 1);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setCartItems((items) =>
      items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((items) => items.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setCheckoutStatus({ status: 'loading' });

    try {
      const total = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      const description = cartItems
        .map((item) => `${item.quantity}x ${item.product.name}`)
        .join(', ');

      const metadata = {
        orderType: 'eink-display',
        items: JSON.stringify(
          cartItems.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          }))
        ),
      };

      // Coinbase requires HTTPS for redirect URLs, so skip them on localhost
      const requestBody: any = {
        amount: total,
        currency: 'USDC',
        network: 'base',
        description,
        metadata,
      };

      // Only add redirect URLs for HTTPS (production)
      if (window.location.protocol === 'https:') {
        requestBody.successRedirectUrl = `${window.location.origin}/success`;
        requestBody.failRedirectUrl = `${window.location.origin}/failed`;
      }

      const response = await fetch('/api/payment-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment link');
      }

      // Redirect to hosted payment page
      if (data.hosted_url || data.url) {
        window.location.href = data.hosted_url || data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Checkout failed',
      });
    }
  };

  return (
    <div className={`shop ${isFlickering ? 'flickering' : ''}`}>
      {isFlickering && <div className="eink-flicker-overlay" />}
      
      <AddToCartAnimation trigger={addToCartTrigger} sourceElement={animationSource} />
      
      <header className="shop-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="shop-title">Vibe Labs</h1>
            <p className="shop-subtitle">
              E-ink displays for real-time payment monitoring
            </p>
          </div>
          
          <div className="header-right">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <Cart
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </header>

      <main className="shop-main">
        {checkoutStatus.status === 'loading' && (
          <div className="checkout-status loading">
            <div className="status-spinner" />
            <p>Creating secure payment link...</p>
          </div>
        )}

        {checkoutStatus.status === 'error' && (
          <div className="checkout-status error">
            <p>⚠ {checkoutStatus.message}</p>
            <button onClick={() => setCheckoutStatus({ status: 'idle' })}>
              Dismiss
            </button>
          </div>
        )}

        <ProductCarousel
          products={products}
          onAddToCart={addToCart}
        />

        <div className="shop-footer">
          <p className="footer-text">
            All displays connect securely via Coinbase Business API for real-time payment monitoring.
            <br />
            Ultra-low power consumption. Paper-like clarity. Enterprise grade.
          </p>
        </div>
      </main>
    </div>
  );
}
