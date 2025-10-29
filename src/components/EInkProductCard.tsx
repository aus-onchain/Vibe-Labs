import { Product } from '@/types/products';
import { useRef } from 'react';

interface EInkProductCardProps {
  product: Product;
  onAddToCart: (product: Product, sourceElement?: HTMLElement | null) => void;
}

/**
 * EInk-styled ProductCard component
 * Displays product as an actual e-ink display device with screen preview
 */
export default function EInkProductCard({ product, onAddToCart }: EInkProductCardProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  return (
    <div className="eink-product-card">
      {/* E-ink display preview */}
      <div className="eink-display">
        <div className="eink-bezel">
          <div className="eink-screen">
            <div className="eink-screen-content">
              <div className="screen-header">
                <div className="status-indicator active"></div>
                <span className="screen-title">PAYMENT MONITOR</span>
              </div>
              <div className="screen-stats">
                <div className="stat-item">
                  <div className="stat-label">TODAY</div>
                  <div className="stat-value">$2,847</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">PENDING</div>
                  <div className="stat-value">3</div>
                </div>
              </div>
              <div className="screen-transactions">
                <div className="transaction-line"></div>
                <div className="transaction-line short"></div>
                <div className="transaction-line"></div>
              </div>
            </div>
          </div>
          <div className="eink-button"></div>
        </div>
      </div>

      {/* Product details */}
      <div className="product-details">
        <div className="product-card-header">
          <h3 className="product-name">{product.name}</h3>
          <div className="product-size">{product.size}</div>
        </div>
        
        <div className="product-specs">
          <span className="spec-label">Resolution:</span>
          <span className="spec-value">{product.resolution}</span>
        </div>
        
        <p className="product-description">{product.description}</p>
        
        <div className="product-features">
          <div className="features-label">Features</div>
          <ul className="features-list">
            {product.features.slice(0, 4).map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        
        <div className="product-footer">
          <div className="product-price">
            <span className="currency">$</span>
            <span className="amount">{product.price.toFixed(2)}</span>
            <span className="unit">USD</span>
          </div>
          
          <button
            ref={buttonRef}
            className="btn-add-to-cart"
            onClick={() => onAddToCart(product, buttonRef.current)}
            disabled={!product.inStock}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

