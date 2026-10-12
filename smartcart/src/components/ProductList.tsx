import type { Product } from "../App";
import ProductCard from "./ProductCard";

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

function ProductList({
  products,
  onAddToCart,
}: ProductListProps) {
  return (
    <div className="product-grid">

      {products.map((product) => (
        <ProductCard
          key={product.productId}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}

    </div>
  );
}

export default ProductList;