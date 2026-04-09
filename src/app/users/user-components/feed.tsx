"use client";

import React, { useState, useEffect } from "react";
import { supabase, logActivity } from "../../../../utils/supabase";

// The Feed component serves as the main social hub for users to discover and match with others.
// It will fetch profiles from the Supabase 'profiles' table.
const Feed = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        // Fetch profiles that are NOT the current user
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id);

        // Fetch existing friendships involving the current user
        const { data: friendshipsData, error: friendshipsError } = await supabase
          .from('friendships')
          .select('user_id_1, user_id_2, status')
          .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

        if (!profilesError && !friendshipsError) {
          // Filter out users who are already friends or have pending requests
          const friendIds = (friendshipsData || []).map(f => 
            f.user_id_1 === user.id ? f.user_id_2 : f.user_id_1
          );
          
          const filteredProfiles = (profilesData || []).filter(p => !friendIds.includes(p.id));
          setProfiles(filteredProfiles);
        }
      }
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  const handleAddFriend = async (profileId: string) => {
    if (!currentUser) return;

    const { error } = await supabase
      .from('friendships')
      .insert([
        { 
          user_id_1: currentUser.id, 
          user_id_2: profileId, 
          status: 'pending' 
        }
      ]);

    if (error) {
      console.error("Error adding friend:", error.message);
      alert("Failed to send friend request. Make sure the 'friendships' table exists in your Supabase project.");
    } else {
      await logActivity(currentUser.id, "friend_request_sent", { target_id: profileId });
      alert("Friend request sent!");
    }
  };

  if (loading) return <p>Loading profiles...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>User Feed</h2>
      <p>Discover new matches here!</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <div key={profile.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', background: '#fff' }}>
              <h3>{profile.username || 'Anonymous User'}</h3>
              <p><strong>Gender:</strong> {profile.gender || 'Not specified'}</p>
              <p><strong>Zodiac:</strong> {profile.zodiac || 'Not specified'}</p>
              <button 
                onClick={() => handleAddFriend(profile.id)}
                style={{ 
                  background: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Add Friend
              </button>
            </div>
          ))
        ) : (
          <p>No other users found.</p>
        )}
      </div>
    </div>
  );
};

export default Feed;