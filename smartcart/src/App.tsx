
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import CheckoutForm from "./components/CheckoutForm";

import SignupPage from "./pages/SignupPage";
import SigninPage from "./pages/SigninPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

export type Page =
  | "products"
  | "signup"
  | "signin"
  | "admin"
  | "user";

export interface Product {
  productId: number;
  productName: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  rating: number;
  status: string;
}

export interface User {
  userId?: number;
  name: string;
  email: string;
  role: string;
}

export interface CartItem extends Product {
  quantity: number;
}

function App() {
  const [page, setPage] = useState<Page>("products");

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("ecommerceUser");

    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }

    return null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8081/api/products"
      );

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();

      setProducts(data);
    } catch (error) {
      console.error("Product loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  function addToCart(product: Product) {
    if (product.stock <= 0) {
      alert("This product is out of stock.");
      return;
    }

    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (item) =>
          item.productId === product.productId
      );

      if (existingItem) {
        return previousCart.map((item) =>
          item.productId === product.productId
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  product.stock
                ),
              }
            : item
        );
      }

      return [
        ...previousCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(productId: number) {
    setCart((previousCart) =>
      previousCart.filter(
        (item) =>
          item.productId !== productId
      )
    );
  }

  function updateQuantity(
    productId: number,
    quantity: number
  ) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((previousCart) =>
      previousCart.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.min(
                quantity,
                item.stock
              ),
            }
          : item
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  function handleLogin(
    loggedInUser: User
  ) {
    setUser(loggedInUser);

    localStorage.setItem(
      "ecommerceUser",
      JSON.stringify(loggedInUser)
    );

    if (
      loggedInUser.role?.toUpperCase() ===
      "ADMIN"
    ) {
      setPage("admin");
    } else {
      setPage("user");
    }
  }

  function handleLogout() {
    setUser(null);

    localStorage.removeItem(
      "ecommerceUser"
    );

    setCart([]);

    setPage("products");
  }

  function handleSignupSuccess() {
    setPage("signin");
  }

  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  return (
    <div className="app">

      <Navbar
        page={page}
        setPage={setPage}
        user={user}
        cartCount={cartCount}
        onLogout={handleLogout}
      />

      <main className="main-content">

        {page === "products" && (
          <>

            <section className="hero-section">

              <div className="hero-content">

                <div className="hero-badge">
                  ✨ Welcome to ECommerce
                </div>

                <h1>
                  Everything You Need.
                  <br />
                  <span>
                    All in One Place.
                  </span>
                </h1>

                <p>
                  Discover quality products,
                  great prices and
                  an easy shopping experience.
                </p>

                <button
                  className="hero-button"
                  onClick={() => {
                    document
                      .getElementById(
                        "products"
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }}
                >
                  Explore Products →
                </button>

              </div>

              <div className="hero-visual">

                <div className="floating-card card-one">
                  🛍️
                  <span>
                    Easy Shopping
                  </span>
                </div>

                <div className="hero-circle">
                  🛒
                </div>

                <div className="floating-card card-two">
                  ⭐
                  <span>
                    Quality Products
                  </span>
                </div>

              </div>

            </section>

            <section
              id="products"
              className="products-section"
            >

              <div className="section-heading">

                <div>

                  <span className="section-label">
                    OUR COLLECTION
                  </span>

                  <h2>
                    Explore Products
                  </h2>

                  <p>
                    Find something you will love.
                  </p>

                </div>

                <div className="product-count">
                  {products.length} Products
                </div>

              </div>

              {loading ? (

                <div className="loading-box">

                  <div className="loader"></div>

                  <p>
                    Loading products...
                  </p>

                </div>

              ) : products.length === 0 ? (

                <div className="empty-products">

                  <div>📦</div>

                  <h3>
                    No Products Found
                  </h3>

                  <p>
                    Products are not available
                    right now.
                  </p>

                </div>

              ) : (

                <ProductList
                  products={products}
                  onAddToCart={addToCart}
                />

              )}

            </section>

            <Cart
              cart={cart}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
            />

            {/* PAYMENT / CHECKOUT */}

            {user ? (

              /*
               * USER IS LOGGED IN
               * Show the original CheckoutForm
               */

              <CheckoutForm
                cart={cart}
                clearCart={clearCart}
                user={user}
              />

            ) : (

              /*
               * USER IS NOT LOGGED IN
               * Do NOT show payment form
               */

              <section className="checkout-section">

                <div className="checkout-form-card">

                  <div className="section-heading">

                    <div>

                      <span className="section-label">
                        SECURE CHECKOUT
                      </span>

                      <h2>
                        Sign In Required
                      </h2>

                      <p>
                        Please sign in to your
                        account before making
                        a payment.
                      </p>

                    </div>

                  </div>

                  <button
                    className="pay-button"
                    type="button"
                    onClick={() =>
                      setPage("signin")
                    }
                  >
                    Sign In to Continue
                  </button>

                  <p
                    style={{
                      textAlign: "center",
                      marginTop: "15px",
                    }}
                  >
                    Don't have an account?{" "}

                    <button
                      type="button"
                      onClick={() =>
                        setPage("signup")
                      }
                      style={{
                        border: "none",
                        background: "none",
                        color: "#4f46e5",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Create Account
                    </button>

                  </p>

                </div>

              </section>

            )}

          </>
        )}

        {page === "signup" && (
          <SignupPage
            setPage={setPage}
            onSignupSuccess={
              handleSignupSuccess
            }
          />
        )}

        {page === "signin" && (
          <SigninPage
            setPage={setPage}
            onLogin={handleLogin}
          />
        )}

        {page === "user" && (
          <UserDashboard
            user={user}
            setPage={setPage}
            cartCount={cartCount}
          />
        )}

        {page === "admin" && (
          <AdminDashboard
            user={user}
            setPage={setPage}
          />
        )}

      </main>

      <footer className="footer">

        <div className="footer-content">

          <div>

            <h3>
              🛒 ECommerce
            </h3>

            <p>
              Your simple and trusted
              online shopping experience.
            </p>

          </div>

          <div>

            <h4>
              Quick Links
            </h4>

            <button
              onClick={() =>
                setPage("products")
              }
            >
              Products
            </button>

            <button
              onClick={() =>
                setPage("signup")
              }
            >
              Sign Up
            </button>

            <button
              onClick={() =>
                setPage("signin")
              }
            >
              Sign In
            </button>

          </div>

        </div>

        <div className="footer-bottom">
          © 2026 ECommerce. All rights reserved.
        </div>

      </footer>

    </div>
  );
}

export default App;

