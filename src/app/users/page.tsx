
"use client";

import React, { useState, useEffect } from "react";
import "./application.css";
import LoginComponent from "./components/login";
import RegisterComponent from "./components/register";
import Link from "next/link";
import Main from "./user-components/main";
import { supabase } from "../../../utils/supabase";

// This page is for users to login or register

const LogRegPage = () => {
  // state for current active view: 'login', 'register' or 'main' (hub)
  const [view, setView] = useState<'login' | 'register' | 'main'>('login');
  // loading state to prevent flickering while checking for existing sessions
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial check for an existing user session on page load
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setView('main');
      }
      setLoading(false);
    };

    checkUser();

    // Listener for auth state changes (e.g., login, logout, password change)
    // This ensures the page automatically switches views when a session is created/destroyed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setView('main');
      } else {
        setView('login');
      }
    });

    // Cleanup subscription when component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Show loading indicator while session state is being determined
  if (loading) {
    return <main>Loading...</main>;
  }

  return (
    <main>
      <h1>MatchAI</h1>
      {/* Conditionally render login form, register form, or the main hub based on 'view' state */}
      {view === 'login' && (
        <LoginComponent onSwitch={() => setView('register')} onLogin={() => setView('main')} />
      )}
      {view === 'register' && (
        <RegisterComponent onSwitch={() => setView('login')} />
      )}
      {view === 'main' && (
        <Main />
      )}
    </main>
  );
};

export default LogRegPage;
