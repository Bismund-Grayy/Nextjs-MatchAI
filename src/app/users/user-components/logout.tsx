import React from "react";
import { useRouter } from "next/navigation";
import { supabase, logActivity } from "../../../../utils/supabase";

const Logout = () => {
  const router = useRouter();

  // Async function to handle user sign-out via Supabase
  const handleLogout = async () => {
    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await logActivity(user.id, "logout");
        // 2. Mark as offline/last seen right now
        await supabase
          .from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', user.id);
      }
    } catch (err) {
      console.error("Error updating status during logout:", err);
    }

    // 3. End the Supabase session
    await supabase.auth.signOut();
    // Redirect the user back to the public landing page
    router.push("/");
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};

export default Logout;