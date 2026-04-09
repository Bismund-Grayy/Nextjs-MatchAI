import Link from "next/link";
import React, { useState } from "react";
import { supabase } from "../../../../utils/supabase";

interface LoginProps {
  onSwitch: () => void;
  onLogin: () => void;
}

const LoginComponent: React.FC<LoginProps> = ({ onSwitch, onLogin }) => {
  // Input field state management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to handle form submission for logging in via Supabase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Call Supabase auth sign-in method
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Display error message if authentication fails
      setError(error.message);
      setLoading(false);
    } else {
      // Success: Call parent handler to switch to Main view
      onLogin();
    }
  };

  return (
    <section>
      <h2>Login</h2>
      {/* Login form with email and password fields */}
      <form onSubmit={handleLogin}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p>
        <Link href="/">back to main page</Link>
        <br />
        {/* Switch to the Registration form */}
        Don't have an account? <button onClick={onSwitch} style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>Register</button>
      </p>
    </section>
  );
};

export default LoginComponent;
