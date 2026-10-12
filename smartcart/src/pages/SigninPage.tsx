import { useState } from "react";
import type { Page, User } from "../App";

interface SigninPageProps {
  setPage: (page: Page) => void;
  onLogin: (user: User) => void;
}

function SigninPage({
  setPage,
  onLogin,
}: SigninPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8081/api/auth/signin",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      const loggedInUser: User = {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      onLogin(loggedInUser);

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Sign in failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-card signin-card">

        <div className="auth-icon">
          🔐
        </div>

        <div className="auth-header">

          <span className="auth-label">
            WELCOME BACK
          </span>

          <h1>Sign In</h1>

          <p>
            Sign in to continue shopping with ECommerce.
          </p>

        </div>

        {error && (
          <div className="error-message">
            <span>⚠</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSignin}>

          <div className="input-group">

            <label>Email Address</label>

            <div className="input-with-icon">
              <span>✉</span>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </div>

          </div>

          <div className="input-group">

            <label>Password</label>

            <div className="input-with-icon">
              <span>🔒</span>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />
            </div>

          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In →"}
          </button>

        </form>

        <div className="auth-footer">

          <span>
            Don't have an account?
          </span>

          <button
            onClick={() => setPage("signup")}
          >
            Create Account
          </button>

        </div>

      </div>

    </div>
  );
}

export default SigninPage;