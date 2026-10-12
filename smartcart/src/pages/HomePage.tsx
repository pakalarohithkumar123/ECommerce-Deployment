
import type { Product, CartItem, User } from "../App";
import ProductList from "../components/ProductList";
import CheckoutForm from "../components/CheckoutForm";

interface HomePageProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
    cart: CartItem[];
    clearCart: () => void;
    user: User | null;
}

function HomePage({
    products,
    onAddToCart,
    cart,
    clearCart,
    user,
}: HomePageProps) {
    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="hero-content">
                    <span className="hero-badge">
                        ✨ New Shopping Experience
                    </span>

                    <h1>
                        Everything you need.
                        <br />
                        <span>All in one place.</span>
                    </h1>

                    <p>
                        Discover quality products, easy shopping,
                        secure checkout and a seamless online
                        shopping experience.
                    </p>

                    <div className="hero-buttons">
                        <a href="#products" className="hero-primary">
                            Explore Products →
                        </a>

                        <a href="#checkout" className="hero-secondary">
                            View Checkout
                        </a>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="floating-card card-one">
                        🛍️
                        <span>Easy Shopping</span>
                    </div>

                    <div className="hero-circle">
                        <div className="hero-bag">🛒</div>
                    </div>

                    <div className="floating-card card-two">
                        🔒
                        <span>Secure Checkout</span>
                    </div>
                </div>
            </section>

            <section id="products" className="products-section">
                <div className="section-heading">
                    <div>
                        <span>OUR COLLECTION</span>
                        <h2>Featured Products</h2>
                    </div>

                    <p>Explore our latest products</p>
                </div>

                {products.length > 0 ? (
                    <ProductList
                        products={products}
                        onAddToCart={onAddToCart}
                    />
                ) : (
                    <p>No products available.</p>
                )}
            </section>

            <section id="checkout" className="checkout-section">
                {user ? (
                    <CheckoutForm
                        cart={cart}
                        clearCart={clearCart}
                        user={user}
                    />
                ) : (
                    <div className="checkout-form-card">
                        <h2>Sign In Required</h2>
                        <p>
                            Please sign in to continue with checkout.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}

export default HomePage;
