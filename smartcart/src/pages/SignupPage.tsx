import { useState } from "react";
import type { Page } from "../App";

interface SignupPageProps {
  setPage: (page: Page) => void;
  onSignupSuccess: () => void;
}

function SignupPage({
  setPage,
  onSignupSuccess,
}: SignupPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8081/api/auth/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
          }),
        }
      );

      const text = await response.text();

      if (!response.ok) {
        throw new Error(
          text || "Signup failed. Please try again."
        );
      }

      setSuccess(
        "Account created successfully! Redirecting to Sign In..."
      );

      setName("");
      setEmail("");
      setPassword("");
      setRole("USER");

      setTimeout(() => {
        onSignupSuccess();
      }, 1200);

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Signup failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-icon">
          👤
        </div>

        <div className="auth-header">

          <span className="auth-label">
            JOIN US
          </span>

          <h1>Create Account</h1>

          <p>
            Create your ECommerce account and start
            shopping.
          </p>

        </div>

        {error && (
          <div className="error-message">
            <span>⚠</span>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span>✓</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSignup}>

          <div className="input-group">

            <label>Full Name</label>

            <div className="input-with-icon">
              <span>👤</span>

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </div>

          </div>

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

          <div className="input-group">

            <label>Account Type</label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              <option value="USER">
                User
              </option>

              <option value="ADMIN">
                Admin
              </option>
            </select>

          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account →"}
          </button>

        </form>

        <div className="auth-footer">

          <span>
            Already have an account?
          </span>

          <button
            onClick={() => setPage("signin")}
          >
            Sign In
          </button>

        </div>

      </div>

    </div>
  );
}

export default SignupPage;