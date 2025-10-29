import { Product } from '@/types/products';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

/**
 * ProductCard component with eink aesthetic
 * Displays individual product information in a minimalist, paper-like style
 */
export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="product-card">
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
          {product.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
      
      <div className="product-footer">
        <div className="product-price">
          <span className="currency">$</span>
          <span className="amount">{product.price}</span>
          <span className="unit">USD</span>
        </div>
        
        <button
          className="btn-add-to-cart"
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}

