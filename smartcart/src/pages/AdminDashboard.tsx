import type { Page, User } from "../App";

interface AdminDashboardProps {
  user: User | null;
  setPage: (page: Page) => void;
}

function AdminDashboard({
  user,
  setPage,
}: AdminDashboardProps) {
  return (
    <div className="dashboard-page">

      <div className="admin-banner">

        <div className="admin-icon">
          ⚙️
        </div>

        <div>
          <span>
            ADMIN DASHBOARD
          </span>

          <h1>
            Welcome, {user?.name || "Admin"}
          </h1>

          <p>
            Manage your ECommerce system.
          </p>
        </div>

      </div>

      <div className="dashboard-grid">

        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            📦
          </div>

          <h3>Product Management</h3>

          <p>
            View and manage products in your
            ECommerce system.
          </p>

          <button
            onClick={() => setPage("products")}
          >
            View Products →
          </button>

        </div>

        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            👥
          </div>

          <h3>User Management</h3>

          <p>
            Manage registered users and their
            account information.
          </p>

        </div>

        <div className="dashboard-card">

          <div className="dashboard-card-icon">
            📊
          </div>

          <h3>System Overview</h3>

          <p>
            Monitor your ECommerce application.
          </p>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;