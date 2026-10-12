import type { Product } from "../App";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const isAvailable =
    product.stock > 0 &&
    product.status?.toUpperCase() !== "OUT_OF_STOCK";

  return (
    <div className="product-card">

      <div className="product-image-container">

        <img
          src={
            product.imageUrl ||
            "https://via.placeholder.com/400x300?text=Product"
          }
          alt={product.productName}
          className="product-image"
        />

        <div
          className={
            isAvailable
              ? "stock-badge available"
              : "stock-badge unavailable"
          }
        >
          {isAvailable
            ? "✓ In Stock"
            : "Out of Stock"}
        </div>

      </div>

      <div className="product-details">

        <span className="product-category">
          {product.category || "General"}
        </span>

        <h3>{product.productName}</h3>

        <p className="product-description">
          {product.description ||
            "Quality product with excellent features."}
        </p>

        <div className="product-rating">
          <span className="stars">
            {"★".repeat(
              Math.max(
                0,
                Math.min(5, Math.round(product.rating || 0))
              )
            )}
          </span>

          <span>
            {product.rating || 0}
          </span>
        </div>

        <div className="product-bottom">

          <div>
            <div className="price">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </div>

            <div className="stock-text">
              {isAvailable
                ? `${product.stock} available`
                : "Currently unavailable"}
            </div>
          </div>

          <button
            className={
              isAvailable
                ? "add-cart-button"
                : "add-cart-button disabled"
            }
            disabled={!isAvailable}
            onClick={() => onAddToCart(product)}
          >
            {isAvailable
              ? "Add to Cart"
              : "Out of Stock"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default ProductCard;