import React, { useEffect, useState } from "react";
import { supabase } from "../../../../utils/supabase";

// The Profile component allows users to view and update their personal information.
// It interacts with the 'profiles' table in Supabase.
const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!error) {
          setProfile(data);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>Profile not found.</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Your Profile</h2>
      <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
        <p><strong>Unique ID:</strong> {profile.id}</p>
        <p><strong>Username:</strong> {profile.username}</p>
        
        {profile.show_gender && (
          <p><strong>Gender:</strong> {profile.gender}</p>
        )}

        {profile.show_birthday && (
          <p><strong>Birthday:</strong> {profile.birthday}</p>
        )}

        {profile.show_zodiac && (
          <p><strong>Zodiac:</strong> {profile.zodiac}</p>
        )}

        {profile.nationality && (
          <p><strong>Nationality:</strong> {profile.nationality}</p>
        )}

        {profile.religion && (
          <p><strong>Religion:</strong> {profile.religion}</p>
        )}

        <div>
          <h3>Interests</h3>
          {profile.interests ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {Object.entries(profile.interests)
                .filter(([_, value]) => value === true)
                .map(([interest], index) => (
                  <span 
                    key={index} 
                    style={{ 
                      background: '#e0e0e0', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem' 
                    }}
                  >
                    {interest}
                  </span>
                ))}
              {Object.values(profile.interests).every(v => v === false) && (
                <p>No interests selected.</p>
              )}
            </div>
          ) : (
            <p>No interests added yet.</p>
          )}
        </div>

        <p><strong>Location Privacy:</strong> {profile.location_preference === 'none' ? 'Hidden' : `Showing ${profile.location_preference}`}</p>
        <p><strong>Last Seen:</strong> {new Date(profile.last_seen_at).toLocaleString()}</p>
      </div>
      <button 
        style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={() => alert("Edit profile functionality coming soon!")}
      >
        Edit Profile
      </button>
    </div>
  );
};

export default Profile;