"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../../utils/supabase";

// This component displays a list of the current user's friends or connections.
// It will query the Supabase 'friendships' relationship table.
const FriendList = ({ onChat }: { onChat: (friend: any) => void }) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch friendships where status is 'accepted'
        // We need to fetch both directions or use an OR query
        const { data, error } = await supabase
          .from('friendships')
          .select(`
            id,
            user_id_1,
            user_id_2,
            profiles1:user_id_1 ( id, username, gender, zodiac ),
            profiles2:user_id_2 ( id, username, gender, zodiac )
          `)
          .eq('status', 'accepted')
          .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

        if (!error) {
          // Process the data to get the other user's profile
          const friendsData = (data || []).map((friendship: any) => {
            const isUser1 = friendship.user_id_1 === user.id;
            return isUser1 ? friendship.profiles2 : friendship.profiles1;
          });
          setFriends(friendsData);
        }
      }
      setLoading(false);
    };

    fetchFriends();
  }, []);

  if (loading) return <p>Loading friends...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Friend List</h2>
      {friends.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {friends.map((friend) => (
            <div key={friend.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', background: '#fff' }}>
              <h3>{friend.username || 'Anonymous User'}</h3>
              <p>{friend.gender} • {friend.zodiac}</p>
              <button 
                onClick={() => onChat(friend)}
                style={{ 
                  marginTop: '0.5rem', 
                  width: '100%', 
                  padding: '0.4rem', 
                  background: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer' 
                }}
              >
                Chat
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No friends yet. Go to the feed to find matches!</p>
      )}
    </div>
  );
};

export default FriendList;