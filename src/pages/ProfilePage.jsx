import { useState, useEffect } from 'react';
import { supabase, profiles } from '../supabase';

export function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    position: '',
    skill_level: 'intermediate',
    goals: '',
    bio: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadUserAndProfile();
  }, []);

  const loadUserAndProfile = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        const { data, error } = await profiles.getByUserId(currentUser.id);
        if (data) {
          setProfile(data);
          setFormData({
            position: data.position || '',
            skill_level: data.skill_level || 'intermediate',
            goals: data.goals || '',
            bio: data.bio || ''
          });
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      let result;
      if (profile) {
        result = await profiles.update(user.id, formData);
      } else {
        result = await profiles.create(user.id, formData);
      }

      if (result.error) {
        alert('Error saving profile: ' + result.error.message);
      } else {
        setProfile(result.data[0]);
        setEditing(false);
        setSuccessMessage('Profile saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div className="section"><p>Loading...</p></div>;
  if (!user) return <div className="section"><p>Please sign in to view your profile.</p></div>;

  return (
    <section className="section">
      <h2>My Profile</h2>
      <p>Email: {user.email}</p>

      {successMessage && <p className="success">{successMessage}</p>}

      {!editing ? (
        <>
          {profile && (
            <div className="profile-card">
              <p><strong>Position:</strong> {profile.position || 'Not set'}</p>
              <p><strong>Skill Level:</strong> {profile.skill_level || 'Not set'}</p>
              <p><strong>Goals:</strong> {profile.goals || 'Not set'}</p>
              <p><strong>Bio:</strong> {profile.bio || 'Not set'}</p>
            </div>
          )}
          {!profile && <p>No profile yet. Create one to get started!</p>}
          <button onClick={() => setEditing(true)} className="primary-btn">
            {profile ? 'Edit Profile' : 'Create Profile'}
          </button>
        </>
      ) : (
        <div className="form">
          <label>Position</label>
          <input
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="e.g., Striker, Winger, Defender"
          />

          <label>Skill Level</label>
          <select
            value={formData.skill_level}
            onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
          >
            <option>beginner</option>
            <option>intermediate</option>
            <option>advanced</option>
          </select>

          <label>Goals</label>
          <input
            value={formData.goals}
            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
            placeholder="e.g., Improve shooting, speed, confidence"
          />

          <label>Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself"
            rows="4"
          />

          <button onClick={handleSaveProfile} className="primary-btn">
            Save Profile
          </button>
          <button
            onClick={() => setEditing(false)}
            className="secondary-btn"
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        </div>
      )}
    </section>
  );
}