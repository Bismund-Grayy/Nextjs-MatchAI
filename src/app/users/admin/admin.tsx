"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../../../utils/supabase";

// The Admin component provides a dashboard for monitoring user activity and system health.
// It allows developers to view registered users and system logs (to be implemented).
const Admin = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Fetch users and set up presence listener
  useEffect(() => {
    // 1. Create channel synchronously
    const channel = supabase.channel('online-users');

    // 2. Set up presence listener synchronously
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        
        // Extract all user_ids from the presence state
        const activeIds: string[] = [];
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.user_id) activeIds.push(p.user_id);
          });
        });
        
        setOnlineUsers(activeIds);
      })
      .subscribe();

    const fetchUsers = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (data) setUsers(data);
      setLoading(false);
    };

    fetchUsers();

    // 3. Cleanup: Use removeChannel for a more thorough cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>MatchAI Admin Dashboard</h1>
      <Link href="/">Back to Home</Link>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>User Management</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                <th style={{ padding: '0.5rem' }}>ID</th>
                <th style={{ padding: '0.5rem' }}>Username</th>
                <th style={{ padding: '0.5rem' }}>Status</th>
                <th style={{ padding: '0.5rem' }}>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => {
                  const isOnline = onlineUsers.includes(user.id);
                  return (
                    <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.5rem' }}>{user.id}</td>
                      <td style={{ padding: '0.5rem' }}>{user.username}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem',
                          backgroundColor: isOnline ? '#d4edda' : '#f8d7da',
                          color: isOnline ? '#155724' : '#721c24'
                        }}>
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        {user.last_seen_at ? new Date(user.last_seen_at).toLocaleString() : 'Never'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '1rem', textAlign: 'center' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>System Status</h2>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
          <p><strong>Database:</strong> Connected (Supabase)</p>
          <p><strong>Authentication:</strong> Enabled</p>
          <p><strong>Real-time:</strong> Configured</p>
        </div>
      </section>
    </div>
  );
};

export default Admin;