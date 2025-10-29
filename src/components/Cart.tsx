'use client';

import { CartItem } from '@/types/products';
import { useState } from 'react';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

/**
 * Shopping cart component with eink aesthetic
 */
export default function Cart({ items, onUpdateQuantity, onRemove, onCheckout }: CartProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0 && !isOpen) {
    return (
      <button className="cart-button cart-empty" onClick={() => setIsOpen(!isOpen)}>
        <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 2L7.17 6H2v13h20V6h-5.17L15 2H9z"/>
          <circle cx="9" cy="19" r="1"/>
          <circle cx="15" cy="19" r="1"/>
        </svg>
        <span>Cart (0)</span>
      </button>
    );
  }

  return (
    <div className="cart-container">
      <button className="cart-button" onClick={() => setIsOpen(!isOpen)}>
        <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 2L7.17 6H2v13h20V6h-5.17L15 2H9z"/>
          <circle cx="9" cy="19" r="1"/>
          <circle cx="15" cy="19" r="1"/>
        </svg>
        <span>Cart ({itemCount})</span>
        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
      </button>

      {isOpen && (
        <div className="cart-dropdown">
          <div className="cart-header">
            <h3>Your Cart</h3>
            <button className="cart-close" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="cart-items">
            {items.map((item) => (
              <div key={item.product.id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product.name}</div>
                  <div className="cart-item-size">{item.product.size}</div>
                </div>
                
                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="cart-item-price">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                  
                  <button
                    className="remove-btn"
                    onClick={() => onRemove(item.product.id)}
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span className="total-amount">${total.toFixed(2)}</span>
            </div>
            
            <button className="btn-checkout" onClick={onCheckout}>
              Checkout with Coinbase
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

