"use client";

import React, { useState, useEffect } from "react";
import { supabase, logActivity } from "../../../../utils/supabase";

// This component shows incoming message requests from potential matches.
// Users can accept or decline these requests before starting a chat.
const MessageRequest = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch pending requests where current user is the receiver (user_id_2)
        const { data, error } = await supabase
          .from('friendships')
          .select(`
            id,
            user_id_1,
            profiles:user_id_1 (
              id,
              username,
              gender,
              zodiac
            )
          `)
          .eq('user_id_2', user.id)
          .eq('status', 'pending');

        if (!error) {
          setRequests(data || []);
        }
      }
      setLoading(false);
    };

    fetchRequests();
  }, []);

  const handleResponse = async (requestId: string, status: 'accepted' | 'declined') => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('friendships')
      .update({ status })
      .eq('id', requestId);

    if (error) {
      console.error(`Error ${status} request:`, error.message);
      alert(`Failed to ${status} request.`);
    } else {
      if (user) {
        await logActivity(user.id, `friend_request_${status}`, { request_id: requestId });
      }
      setRequests(prev => prev.filter(req => req.id !== requestId));
      alert(`Request ${status}!`);
    }
  };

  if (loading) return <p>Loading requests...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Friend Requests</h2>
      {requests.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          {requests.map((request) => (
            <div key={request.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>{request.profiles?.username || 'Anonymous User'}</h3>
                <p>{request.profiles?.gender} • {request.profiles?.zodiac}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleResponse(request.id, 'accepted')}
                  style={{ background: '#28a745', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Accept
                </button>
                <button 
                  onClick={() => handleResponse(request.id, 'declined')}
                  style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No new requests.</p>
      )}
    </div>
  );
};

export default MessageRequest;