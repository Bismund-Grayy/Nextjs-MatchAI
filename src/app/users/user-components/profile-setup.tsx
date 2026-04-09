"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../../../utils/supabase";

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

interface Interest {
  name: string;
  level: number;
}

const ProfileSetup = ({ onComplete }: { onComplete: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
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
    interests: [] as Interest[],
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (formData.birthday) {
      setFormData(prev => ({ ...prev, zodiac: getZodiacSign(formData.birthday) }));
    }
  }, [formData.birthday]);

  const addInterest = () => {
    setFormData(prev => ({
      ...prev,
      interests: [...prev.interests, { name: "", level: 3 }]
    }));
  };

  const updateInterest = (index: number, field: keyof Interest, value: string | number) => {
    const newInterests = [...formData.interests];
    newInterests[index] = { ...newInterests[index], [field]: value };
    setFormData(prev => ({ ...prev, interests: newInterests }));
  };

  const removeInterest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
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
      })
      .eq("id", userId);

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
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
          {formData.interests.map((interest, index) => (
            <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder={`Interest ${index + 1}`}
                value={interest.name}
                onChange={(e) => updateInterest(index, 'name', e.target.value)}
                required
                style={{ flex: 1, padding: '0.3rem' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem' }}>Level: {interest.level}</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={interest.level}
                  onChange={(e) => updateInterest(index, 'level', parseInt(e.target.value))}
                />
              </div>
              <button type="button" onClick={() => removeInterest(index)} style={{ color: 'red' }}>×</button>
            </div>
          ))}
          <button type="button" onClick={addInterest}>+ Add Interest</button>
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
          <input type="text" value={formData.nationality} onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))} style={{ display: 'block', width: '100%', padding: '0.5rem' }} />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Religion:</label>
          <input type="text" value={formData.religion} onChange={(e) => setFormData(prev => ({ ...prev, religion: e.target.value }))} style={{ display: 'block', width: '100%', padding: '0.5rem' }} />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? "Saving..." : "Complete Setup"}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
