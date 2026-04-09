"use client";

import React, { useState, useEffect } from "react";
import { supabase, logActivity } from "../../../../utils/supabase";

// Zodiac calculation utility function
const getZodiacSign = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  return "";
};

const INTEREST_OPTIONS = [
  "Anime", "Coding", "Farming", "Fiction", "Writing", "Cooking", "Gaming", 
  "History", "Martial Arts", "Movies", "Nature", "Books", "Pets", "Crafting", 
  "Arts", "Singing", "Fitness", "Astrology", "Cars", "Travel", "Sports", 
  "Business", "Life", "Education", "LGBTQ"
];

const RELIGION_OPTIONS = [
  "Christianity", "Islam", "Hinduism", "Buddhism", "Sikhism", "Judaism", 
  "Agnostic", "Atheistic", "Non-religious", "Other"
];

const NATIONALITY_OPTIONS = [
  "American", "British", "Canadian", "Chinese", "French", "German", "Indian", "Japanese", "Other"
];

const ProfileSetup = ({ onComplete }: { onComplete: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [formData, setFormData] = useState({
    gender: "",
    show_gender: true,
    birthday: "",
    show_birthday: true,
    zodiac: "",
    show_zodiac: true,
    location_preference: "none",
    nationality: "",
    religion: "",
    interests: {} as Record<string, boolean>,
  });

  useEffect(() => {
    // Initialize interests as false
    const initialInterests: Record<string, boolean> = {};
    INTEREST_OPTIONS.forEach(interest => {
      initialInterests[interest] = false;
    });
    setFormData(prev => ({ ...prev, interests: initialInterests }));

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUsername(user.user_metadata.username || "");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (formData.birthday) {
      setFormData(prev => ({ ...prev, zodiac: getZodiacSign(formData.birthday) }));
    }
  }, [formData.birthday]);

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: {
        ...prev.interests,
        [interest]: !prev.interests[interest]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        username: username, // Preserve username from registration
        gender: formData.gender,
        show_gender: formData.show_gender,
        birthday: formData.birthday,
        show_birthday: formData.show_birthday,
        zodiac: formData.zodiac,
        show_zodiac: formData.show_zodiac,
        location_preference: formData.location_preference,
        nationality: formData.nationality,
        religion: formData.religion,
        interests: formData.interests,
        is_profile_complete: true,
      });

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      await logActivity(userId, "profile_setup_complete", {
        gender: formData.gender,
        nationality: formData.nationality,
        religion: formData.religion,
        interests: Object.keys(formData.interests).filter(k => formData.interests[k])
      });
      onComplete();
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Complete Your Profile</h2>
      <p style={{ fontSize: "0.8rem", color: "#666" }}>Unique ID: {userId}</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Gender:</label>
          <select value={formData.gender} onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))} required style={{ display: 'block', width: '100%', padding: '0.5rem' }}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <label>
            <input type="checkbox" checked={formData.show_gender} onChange={(e) => setFormData(prev => ({ ...prev, show_gender: e.target.checked }))} /> Show gender on profile
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Birthday:</label>
          <input type="date" value={formData.birthday} onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))} required style={{ display: 'block', width: '100%', padding: '0.5rem' }} />
          <label>
            <input type="checkbox" checked={formData.show_birthday} onChange={(e) => setFormData(prev => ({ ...prev, show_birthday: e.target.checked }))} /> Show birthday on profile
          </label>
        </div>

        {formData.birthday && (
          <div style={{ marginBottom: "1rem", padding: "0.5rem", background: "#f9f9f9" }}>
            <p><strong>Auto Zodiac:</strong> {formData.zodiac}</p>
            <label>
              <input type="checkbox" checked={formData.show_zodiac} onChange={(e) => setFormData(prev => ({ ...prev, show_zodiac: e.target.checked }))} /> Show zodiac on profile
            </label>
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <h3>Interests</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {INTEREST_OPTIONS.map((interest) => (
              <label key={interest} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.interests[interest] || false}
                  onChange={() => handleInterestChange(interest)}
                />
                {interest}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Location Preference:</label>
          <div>
            <label><input type="radio" value="city" checked={formData.location_preference === 'city'} onChange={(e) => setFormData(prev => ({ ...prev, location_preference: e.target.value }))} /> Show City</label>
            <label style={{ marginLeft: '1rem' }}><input type="radio" value="area" checked={formData.location_preference === 'area'} onChange={(e) => setFormData(prev => ({ ...prev, location_preference: e.target.value }))} /> Show Area</label>
            <label style={{ marginLeft: '1rem' }}><input type="radio" value="none" checked={formData.location_preference === 'none'} onChange={(e) => setFormData(prev => ({ ...prev, location_preference: e.target.value }))} /> Don't Show</label>
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Nationality:</label>
          <select 
            value={formData.nationality} 
            onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))} 
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          >
            <option value="">Select Nationality</option>
            {NATIONALITY_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Religion:</label>
          <select 
            value={formData.religion} 
            onChange={(e) => setFormData(prev => ({ ...prev, religion: e.target.value }))} 
            style={{ display: 'block', width: '100%', padding: '0.5rem' }}
          >
            <option value="">Select Religion</option>
            {RELIGION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? "Saving..." : "Complete Setup"}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
