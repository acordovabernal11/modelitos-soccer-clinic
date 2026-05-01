import { useState, useEffect } from 'react';
import { supabase, profiles, plans, bookings as bookingsApi } from '../supabase';

function SavedPlanCard({ plan, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const p = plan.plan_data;

  return (
    <div className="profile-card" style={{ padding: '0' }}>
      {/* Header row — always visible, clickable to expand */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px', padding: '16px 20px', cursor: 'pointer'
        }}
      >
        <div>
          <h3 style={{ marginBottom: '4px', fontSize: '16px' }}>{p?.title || 'Training Plan'}</h3>
          <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>
            Position: <strong>{plan.position}</strong> &nbsp;|&nbsp; Focus: <strong>{plan.goal}</strong>
          </p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Saved {new Date(plan.created_at).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#8bc34a' }}>
            {expanded ? 'Hide plan ▲' : 'View full plan ▼'}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(plan.id); }}
            style={{
              background: 'none', border: '1px solid #444', color: '#888',
              padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
            }}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Expanded plan details */}
      {expanded && p && (
        <div style={{ borderTop: '1px solid #2a2a2a', padding: '20px' }}>
          {p.days?.map((day) => (
            <div key={day.title} className="plan-day">
              <h4>{day.title}</h4>
              <p><strong>Warm-up:</strong> {day.warmup}</p>
              <p><strong>Main Work:</strong></p>
              <ul className="plan-list">
                {day.mainWork?.map((task, i) => (
                  <li key={i}>{task}</li>
                ))}
              </ul>
              <p><strong>Game Application:</strong> {day.gameApplication}</p>
              <p><strong>Coaching Tip:</strong> {day.coachingTip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfilePage() {
  useEffect(() => {
    document.title = "My Profile — Modelitos Soccer Clinic";
  }, []);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [savedBookings, setSavedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Auth state
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin', 'signup', 'forgot'
  const [forgotSent, setForgotSent] = useState(false);

  const [formData, setFormData] = useState({
    position: '',
    skill_level: 'intermediate',
    goals: '',
    bio: ''
  });

  useEffect(() => {
    loadUserAndProfile();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setSavedPlans([]);
        setSavedBookings([]);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadUserAndProfile = async () => {
    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    if (currentUser) {
      await loadProfile(currentUser.id);
    } else {
      setLoading(false);
    }
  };

  const loadProfile = async (userId) => {
    const [profileResult, plansResult, bookingsResult] = await Promise.all([
      profiles.getByUserId(userId),
      plans.getByUserId(userId),
      bookingsApi.getByUserId(userId)
    ]);

    if (profileResult.data) {
      setProfile(profileResult.data);
      setFormData({
        position: profileResult.data.position || '',
        skill_level: profileResult.data.skill_level || 'intermediate',
        goals: profileResult.data.goals || '',
        bio: profileResult.data.bio || ''
      });
    }

    if (plansResult.data) setSavedPlans(plansResult.data);
    if (bookingsResult.data) setSavedBookings(bookingsResult.data);

    setLoading(false);
  };

  const handleSignIn = async () => {
    setAuthLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword
    });
    if (error) alert(error.message);
    else {
      setUser(data.user);
      setAuthEmail('');
      setAuthPassword('');
    }
    setAuthLoading(false);
  };

  const handleSignUp = async () => {
    setAuthLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword
    });
    if (error) alert(error.message);
    else {
      setUser(data.user);
      setAuthEmail('');
      setAuthPassword('');
    }
    setAuthLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!authEmail.trim()) { alert('Please enter your email address.'); return; }
    setAuthLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) alert(error.message);
    else setForgotSent(true);
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSavedPlans([]);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
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
      setSuccessMessage('Profile saved!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleDeletePlan = async (planId) => {
    const { error } = await plans.delete(planId);
    if (!error) {
      setSavedPlans(savedPlans.filter(p => p.id !== planId));
    }
  };

  // Parse goals into a list and compute which have matching saved plans
  const getGoalProgress = () => {
    if (!profile?.goals) return [];
    const goalList = profile.goals.split(',').map(g => g.trim()).filter(Boolean);
    return goalList.map(goal => {
      const matchingPlans = savedPlans.filter(p =>
        p.goal?.toLowerCase().includes(goal.toLowerCase()) ||
        goal.toLowerCase().includes(p.goal?.toLowerCase())
      );
      return { goal, count: matchingPlans.length };
    });
  };

  if (loading) return <div className="section"><p>Loading...</p></div>;

  // Not logged in — show auth form
  if (!user) {
    return (
      <div className="signin-layout">
        <div className="signin-photo-panel">
          <img src="/alexis-headstall.jpg" alt="Elite soccer training" />
          <div className="signin-photo-overlay">
            <h3>Train with Purpose</h3>
            <p>Sign in to access your training plans, track your progress, and manage your bookings.</p>
          </div>
        </div>

        <div className="signin-form-panel">
          <h2>
            {authMode === 'signin' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p>
            {authMode === 'signin'
              ? 'Sign in to view your profile, track your goals, and access your saved training plans.'
              : authMode === 'signup'
              ? 'Create an account to build your player profile and track your training progress.'
              : 'Enter your email and we\'ll send you a link to reset your password.'}
          </p>

          {authMode === 'forgot' ? (
            <div className="form">
              {forgotSent ? (
                <p className="success">Check your email for a password reset link.</p>
              ) : (
                <>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                  <button onClick={handleForgotPassword} disabled={authLoading} className="primary-btn">
                    {authLoading ? 'Sending...' : 'Send Reset Email'}
                  </button>
                </>
              )}
              <p style={{ textAlign: 'center', marginTop: '12px' }}>
                <button
                  onClick={() => { setAuthMode('signin'); setForgotSent(false); }}
                  style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                >
                  Back to Sign In
                </button>
              </p>
            </div>
          ) : (
            <div className="form">
              <input
                type="email"
                placeholder="Email address"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
              {authMode === 'signin' ? (
                <>
                  <button onClick={handleSignIn} disabled={authLoading} className="primary-btn">
                    {authLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                  <p style={{ textAlign: 'center', marginTop: '8px' }}>
                    <button
                      onClick={() => setAuthMode('forgot')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: '14px' }}
                    >
                      Forgot password?
                    </button>
                  </p>
                  <p style={{ textAlign: 'center', marginTop: '4px' }}>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setAuthMode('signup')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    >
                      Create one
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <button onClick={handleSignUp} disabled={authLoading} className="primary-btn">
                    {authLoading ? 'Creating account...' : 'Create Account'}
                  </button>
                  <p style={{ textAlign: 'center', marginTop: '12px' }}>
                    Already have an account?{' '}
                    <button
                      onClick={() => setAuthMode('signin')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    >
                      Sign in
                    </button>
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const goalProgress = getGoalProgress();

  return (
    <>
      <section className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h2>My Profile</h2>
          <button onClick={handleSignOut} className="secondary-btn">Sign Out</button>
        </div>
        <p style={{ color: '#aaa', marginBottom: '20px' }}>{user.email}</p>

        {successMessage && <p className="success">{successMessage}</p>}

        {!editing ? (
          <>
            {profile ? (
              <div className="profile-card">
                <p><strong>Position:</strong> {profile.position || 'Not set'}</p>
                <p><strong>Skill Level:</strong> {profile.skill_level || 'Not set'}</p>
                <p><strong>Goals:</strong> {profile.goals || 'Not set'}</p>
                <p><strong>Bio:</strong> {profile.bio || 'Not set'}</p>
              </div>
            ) : (
              <p>No profile yet. Create one to start tracking your progress!</p>
            )}
            <button onClick={() => setEditing(true)} className="primary-btn" style={{ marginTop: '12px' }}>
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
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <label>Goals (comma-separated)</label>
            <input
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              placeholder="e.g., Improve shooting, Improve speed, Improve dribbling"
            />
            <label>Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself as a player"
              rows="4"
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSaveProfile} className="primary-btn">Save Profile</button>
              <button onClick={() => setEditing(false)} className="secondary-btn">Cancel</button>
            </div>
          </div>
        )}
      </section>

      {goalProgress.length > 0 && (
        <section className="section">
          <h2>Goal Progress</h2>
          <p>These are the goals from your profile. Each one shows how many training plans you've saved toward it.</p>
          <div className="feature-grid">
            {goalProgress.map(({ goal, count }) => (
              <div key={goal} className="feature-card" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: count > 0 ? 'var(--green)' : '#2a2a2a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px', fontSize: '22px', fontWeight: 'bold',
                  color: count > 0 ? '#000' : '#666'
                }}>
                  {count > 0 ? count : '0'}
                </div>
                <h3 style={{ fontSize: '15px' }}>{goal}</h3>
                <p style={{ fontSize: '13px', color: count > 0 ? '#8bc34a' : '#666' }}>
                  {count > 0 ? `${count} plan${count > 1 ? 's' : ''} saved` : 'No plans saved yet'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>My Bookings</h2>
          <a href="/book">
            <button className="primary-btn" style={{ margin: 0 }}>+ Book a Session</button>
          </a>
        </div>
        {savedBookings.length === 0 ? (
          <p>No bookings yet. <a href="/book" style={{ color: '#2563eb', fontWeight: '700' }}>Book your first session</a> to get started.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {savedBookings.map((b) => {
              const statusStyles = {
                pending:   { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
                confirmed: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
                declined:  { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
                completed: { bg: '#dbeafe', color: '#1e3a8a', border: '#93c5fd' },
                cancelled: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' }
              };
              const s = statusStyles[b.status] || statusStyles.pending;
              const price = b.price_cents ? `$${(b.price_cents / 100).toFixed(0)}` : '';
              const date = b.session_date
                ? new Date(b.session_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                : 'No date set';
              return (
                <div key={b.id} className="contact-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', color: '#1e3a8a' }}>{b.session_type}</h3>
                      <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', textTransform: 'capitalize' }}>
                        {b.status}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#334155' }}>
                      <strong>Date:</strong> {date}
                    </p>
                    {b.preferred_time && (
                      <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#334155' }}>
                        <strong>Time:</strong> {b.preferred_time}
                      </p>
                    )}
                    {b.goals && (
                      <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#334155' }}>
                        <strong>Goals:</strong> {b.goals}
                      </p>
                    )}
                    {price && (
                      <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#1d4ed8', fontWeight: '700' }}>
                        {price} due in cash at field
                      </p>
                    )}
                    {b.status === 'pending' && (
                      <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#92400e', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '6px 10px', display: 'inline-block' }}>
                        ⏳ Awaiting confirmation — I'll respond within 24 hours
                      </p>
                    )}
                    {b.status === 'confirmed' && (
                      <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#065f46', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '8px', padding: '6px 10px', display: 'inline-block' }}>
                        ✅ Confirmed — bring cash and be ready to train!
                      </p>
                    )}
                    {b.status === 'declined' && (
                      <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#991b1b', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '6px 10px', display: 'inline-block' }}>
                        ❌ Not available for this date — try booking a different day
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="section">
        <h2>Saved Training Plans</h2>
        {savedPlans.length === 0 ? (
          <p>No saved plans yet. Go to <strong>How It Works</strong> to generate and save a training plan.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {savedPlans.map((p) => (
              <SavedPlanCard key={p.id} plan={p} onDelete={handleDeletePlan} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
