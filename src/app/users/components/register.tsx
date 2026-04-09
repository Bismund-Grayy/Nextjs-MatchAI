import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "../../../../utils/supabase";

interface RegisterProps {
  onSwitch: () => void;
}

const RegisterComponent: React.FC<RegisterProps> = ({ onSwitch }) => {
  // Input field and messaging state management
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Function to handle registration process using Supabase
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Call Supabase auth sign-up method with username in metadata
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });

    if (signUpError) {
      // Display error if registration fails
      setMessage({ type: "error", text: signUpError.message });
      setLoading(false);
      return;
    }

    // Success: The profile is now created automatically by the database trigger!
    setMessage({ 
      type: "success", 
      text: "Account created! Please check your email to verify your account before logging in." 
    });
    
    // With email confirmation ON, the user is NOT signed in immediately.
    // They must verify their email first.
    setLoading(false);
  };

  return (
    <section>
      <h2>Register</h2>
      {message && (
        <p style={{ color: message.type === "success" ? "green" : "red" }}>
          {message.text}
        </p>
      )}
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="reg-username">Username:</label>
          <input
            type="text"
            id="reg-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reg-email">Email:</label>
          <input
            type="email"
            id="reg-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reg-password">Password:</label>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* Add confirm password field */}
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p>
        <Link href="/">back to main page</Link>
        <br />
        {/* Switch back to the Login form */}
        Already have an account? <button onClick={onSwitch} style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>Login</button>
      </p>
    </section>
  );
};

export default RegisterComponent;
