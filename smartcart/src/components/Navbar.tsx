import type { Page, User } from "../App";

interface NavbarProps {
  page: Page;
  setPage: (page: Page) => void;
  user: User | null;
  cartCount: number;
  onLogout: () => void;
}

function Navbar({
  page,
  setPage,
  user,
  cartCount,
  onLogout,
}: NavbarProps) {
  return (
    <header className="navbar">

      <div
        className="navbar-logo"
        onClick={() => setPage("products")}
      >
        <div className="logo-icon">
          🛒
        </div>

        <div>
          <div className="logo-title">
            ECommerce
          </div>

          <div className="logo-subtitle">
            Shop Smart
          </div>
        </div>
      </div>

      <nav className="nav-links">

        <button
          className={
            page === "products"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() => setPage("products")}
        >
          Products
        </button>

        {user && (
          <button
            className={
              page === "user" || page === "admin"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              setPage(
                user.role?.toUpperCase() === "ADMIN"
                  ? "admin"
                  : "user"
              )
            }
          >
            Dashboard
          </button>
        )}

        <button
          className="cart-button"
          onClick={() => {
            setPage("products");

            setTimeout(() => {
              document
                .getElementById("cart")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }, 100);
          }}
        >
          🛒 Cart

          {cartCount > 0 && (
            <span className="cart-badge">
              {cartCount}
            </span>
          )}
        </button>

        {!user ? (
          <>
            <button
              className="nav-signup"
              onClick={() => setPage("signup")}
            >
              Sign Up
            </button>

            <button
              className="nav-signin"
              onClick={() => setPage("signin")}
            >
              Sign In
            </button>
          </>
        ) : (
          <div className="user-area">
            <div className="user-avatar">
              {user.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}
            </div>

            <div className="user-name">
              {user.name}
            </div>

            <button
              className="logout-button"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        )}

      </nav>
    </header>
  );
}

export default Navbar;