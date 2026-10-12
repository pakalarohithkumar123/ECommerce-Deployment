import type { Page, User } from "../App";

interface UserDashboardProps {
  user: User | null;
  setPage: (page: Page) => void;
  cartCount: number;
}

function UserDashboard({
  user,
  setPage,
  cartCount,
}: UserDashboardProps) {
  return (
    <div className="dashboard-page">

      <div className="dashboard-hero">

        <div>
          <span className="dashboard-label">
            USER DASHBOARD
          </span>

          <h1>
            Welcome, {user?.name || "User"} 👋
          </h1>

          <p>
            Manage your shopping experience from here.
          </p>
        </div>

        <div className="dashboard-avatar">
          {user?.name
            ? user.name.charAt(0).toUpperCase()
            : "U"}
        </div>

      </div>

      <div className="dashboard-grid">

        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            🛍️
          </div>

          <h3>Shop Products</h3>

          <p>
            Browse all available products and find
            something you like.
          </p>

          <button
            onClick={() => setPage("products")}
          >
            Browse Products →
          </button>

        </div>

        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            🛒
          </div>

          <h3>Shopping Cart</h3>

          <p>
            You currently have {cartCount} item
            {cartCount === 1 ? "" : "s"} in your cart.
          </p>

          <button
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
            View Cart →
          </button>

        </div>

        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            👤
          </div>

          <h3>My Account</h3>

          <p>
            <strong>{user?.name}</strong>
            <br />
            {user?.email}
          </p>

        </div>

      </div>

    </div>
  );
}

export default UserDashboard;