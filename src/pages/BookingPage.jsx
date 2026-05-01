import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, bookings } from '../supabase';
import emailjs from '@emailjs/browser';

function usePageTitle(title) {
  useEffect(() => {
    document.title = `${title} — Modelitos Soccer Clinic`;
  }, [title]);
}

const EMAILJS_SERVICE_ID = "service_4kbanym";
const EMAILJS_TEMPLATE_ID = "template_1misot7";
const EMAILJS_PUBLIC_KEY = "1IFdc2nRFvanhLDbW";

const LOCATIONS = [
  {
    id: 'avon_grove',
    name: 'Avon Grove Middle School',
    address: '257 State Rd, West Grove, PA 19390',
    icon: '🏟️',
    details: 'A local training ground where sessions are focused, personal, and built around your game. Close to home and ready to work.'
  },
  {
    id: 'ustc',
    name: 'United Sports Complex (USTC)',
    address: '1426 Marshallton Thorndale Rd, Downingtown, PA 19335',
    icon: '🏆',
    details: 'A premier facility that matches the level of training you\'ll receive. Serious players train in serious environments.'
  },
  {
    id: 'nixon_park',
    name: 'Nixon Park',
    address: '405 N Walnut Rd, Kennett Square, PA 19348',
    icon: '🌳',
    details: 'An open, energetic outdoor setting that keeps sessions focused on the game. No distractions — just you and the ball. Home of local soccer club Real FC Wolves.',
    link: 'https://www.realfcwolves.com/',
    linkLabel: 'Visit Real FC Wolves',
    clubLogo: 'https://cdn1.sportngin.com/attachments/photo/e8d5-211154333/Real_FC_Logo_2021_large.png'
  },
  {
    id: 'kirkwood',
    name: 'Kirkwood Sports Complex',
    address: '1220 River Rd, New Castle, DE',
    icon: '⚽',
    details: 'A well-run complex that brings players from across the region. Great energy, great space, great training.'
  }
];

const TRAINING_TYPES = [
  {
    id: '1on1',
    name: '1-on-1 Training',
    icon: '⚽',
    price: 60,
    priceLabel: '$60',
    priceSub: 'per session',
    duration: '60 minutes',
    description: 'Fully personalized private session built around one player\'s goals, position, and current level. You get direct coaching attention for every minute of the session.',
    includes: [
      'Personal skill assessment before the session',
      'Position-specific drills tailored to your goals',
      'Live technical correction and feedback',
      'Custom training plan to take home',
      '60-minute session with full coach attention'
    ],
    bestFor: 'Players who want the fastest improvement and maximum personal attention.',
    playerNote: null
  },
  {
    id: 'small_group',
    name: 'Small Group Session',
    icon: '👥',
    price: 25,
    priceLabel: '$25',
    priceSub: 'per player',
    duration: '60 minutes',
    description: 'Competitive training for 2–5 players with game-like pressure, decision-making scenarios, and shared coaching.',
    includes: [
      'Small-sided competition and drills',
      'Passing, movement, and combination play',
      '1v1 and 2v2 competitive situations',
      'Shared technical feedback',
      '60-minute session'
    ],
    bestFor: 'Friends or teammates who want to train together with competitive energy.',
    playerNote: 'Price is per player. Enter the total number of players below.'
  },
  {
    id: 'team',
    name: 'Team Training',
    icon: '🏟️',
    price: 150,
    priceLabel: '$150',
    priceSub: 'per session',
    duration: '90 minutes',
    description: 'Focused team session designed around chemistry, tactical awareness, spacing, communication, and match-ready habits.',
    includes: [
      'Team shape, spacing, and movement work',
      'Communication and pressing drills',
      'Game-speed tactical exercises',
      'Positional and structural coaching',
      '90-minute full team session'
    ],
    bestFor: 'Teams that need better chemistry, communication, or tactical habits before a season or tournament.',
    playerNote: null
  },
  {
    id: 'camp',
    name: 'Camp / Clinic',
    icon: '🏆',
    price: 100,
    priceLabel: '$100',
    priceSub: 'per player',
    duration: 'Multi-session',
    description: 'High-energy training events with skill stations, competitive challenges, and individual development across multiple sessions in a group setting.',
    includes: [
      'Rotating skill stations (shooting, dribbling, passing)',
      'Competitive 1v1 and small-sided challenges',
      'Individual technique feedback',
      'Fun, high-energy group environment',
      'Multi-session format with structured progression'
    ],
    bestFor: 'Players who want intensive development across multiple sessions with a group.',
    playerNote: 'Price is per player. Enter the number of players attending.'
  }
];

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  confirmed: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  declined: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  completed: { bg: '#dbeafe', color: '#1e3a8a', border: '#93c5fd' },
  cancelled: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' }
};

export function BookingPage() {
  usePageTitle("Book a Session");
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    playerName: '',
    clientEmail: '',
    phone: '',
    playerAge: '',
    position: '',
    skillLevel: 'intermediate',
    goals: '',
    numPlayers: 1,
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      if (u) setForm(f => ({ ...f, clientEmail: u.email }));
    });
  }, []);

  const calcPrice = () => {
    if (!selectedType) return 0;
    if (selectedType.id === 'small_group' || selectedType.id === 'camp') {
      return selectedType.price * Math.max(1, form.numPlayers);
    }
    return selectedType.price;
  };

  const updateForm = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!user) {
      alert('Please sign in to complete your booking.');
      return;
    }
    setLoading(true);
    const { error } = await bookings.create(user.id, {
      session_type: selectedType.name,
      session_date: form.preferredDate,
      price_cents: calcPrice() * 100,
      status: 'pending',
      player_name: form.playerName,
      client_email: form.clientEmail,
      phone: form.phone,
      player_age: form.playerAge,
      position: form.position,
      skill_level: form.skillLevel,
      goals: form.goals,
      num_players: form.numPlayers,
      preferred_time: form.preferredTime,
      notes: form.notes
    });

    if (error) {
      alert('Error submitting booking: ' + error.message);
    } else {
      // Send email notification to admin
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        training_type: selectedType.name,
        player_name: form.playerName,
        phone: form.phone,
        player_age: form.playerAge,
        position: form.position,
        skill_level: form.skillLevel,
        goals: form.goals,
        preferred_date: new Date(form.preferredDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        preferred_time: form.preferredTime || 'Flexible',
        num_players: form.numPlayers,
        total: `$${calcPrice()}`,
        client_email: form.clientEmail,
        notes: form.notes || 'None',
        location: selectedLocation ? `${selectedLocation.name} — ${selectedLocation.address}` : 'Not specified'
      }, EMAILJS_PUBLIC_KEY).catch(() => {});

      setSubmittedBooking({ ...form, type: selectedType, total: calcPrice() });
      setSubmitted(true);
    }
    setLoading(false);
  };

  const goToStep2 = () => {
    if (!selectedType) return;
    setStep(2);
    window.scrollTo(0, 0);
  };

  const goToStep3 = () => {
    if (!selectedLocation) {
      alert('Please select a training location.');
      return;
    }
    setStep(3);
    window.scrollTo(0, 0);
  };

  const goToStep4 = () => {
    const missing = [];
    if (!form.playerName.trim()) missing.push('Player / Parent Name');
    if (!form.phone.trim()) missing.push('Phone Number');
    if (!form.playerAge.trim()) missing.push('Player Age');
    if (!form.position) missing.push('Position');
    if (!form.goals.trim()) missing.push('Session Goals');
    if (!form.preferredDate) missing.push('Preferred Date');
    if (missing.length) {
      alert('Please fill in the following required fields:\n• ' + missing.join('\n• '));
      return;
    }
    setStep(4);
    window.scrollTo(0, 0);
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted && submittedBooking) {
    const s = submittedBooking;
    return (
      <section className="section" style={{ maxWidth: '660px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ marginBottom: '8px' }}>Booking Request Submitted!</h2>
        <p style={{ color: '#475569', marginBottom: '28px' }}>
          Your request for a <strong>{s.type.name}</strong> has been received.
          I'll review availability and confirm within <strong>24 hours</strong>.
        </p>

        <div className="contact-card" style={{ textAlign: 'left', marginBottom: '16px' }}>
          <h3 style={{ color: '#1e3a8a', marginTop: 0, marginBottom: '16px' }}>Your Request Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><p style={{ margin: '0 0 2px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Training Type</p><p style={{ margin: 0, fontWeight: '600' }}>{s.type.name}</p></div>
            <div><p style={{ margin: '0 0 2px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Player</p><p style={{ margin: 0, fontWeight: '600' }}>{s.playerName}, Age {s.playerAge}</p></div>
            <div><p style={{ margin: '0 0 2px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Date</p><p style={{ margin: 0 }}>{new Date(s.preferredDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
            <div><p style={{ margin: '0 0 2px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Time</p><p style={{ margin: 0 }}>{s.preferredTime || 'Flexible'}</p></div>
          </div>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '14px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
          <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#15803d' }}>Total Due at the Field</p>
          <p style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: '800', color: '#15803d' }}>${s.total}</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#166534' }}>
            Payment is due in <strong>cash at the start of the session</strong>. Nothing is charged online.
            Once your booking is confirmed, I'll follow up with the location and any final details.
          </p>
        </div>

        <Link to="/profile">
          <button className="primary-btn">View My Bookings on Profile</button>
        </Link>
      </section>
    );
  }

  // ── Progress bar ────────────────────────────────────────────────────────────
  const steps = ['Choose Training', 'Choose Location', 'Your Details', 'Review & Confirm'];

  return (
    <>
      <div className="booking-hero">
        <div className="booking-hero-content">
          <p className="booking-eyebrow">Elite Soccer Coaching · PA &amp; DE</p>
          <h1>Book a Training Session</h1>
          <p>Choose your training type, pick a location, and fill in your details. I'll confirm within 24 hours — payment is due in cash at the field.</p>
        </div>
      </div>

      <section className="section" style={{ paddingBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {steps.map((label, i) => (
            <div key={label} style={{ flex: 1 }}>
              <div style={{
                height: '5px', borderRadius: '3px', marginBottom: '6px',
                background: step > i + 1 ? '#2563eb' : step === i + 1 ? '#2563eb' : '#e2e8f0'
              }} />
              <p style={{
                margin: 0, fontSize: '12px', fontWeight: step === i + 1 ? '700' : '400',
                color: step === i + 1 ? '#1e3a8a' : '#94a3b8'
              }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Step 1: Choose Training Type ────────────────────────────────────── */}
      {step === 1 && (
        <section className="section">
          <h3 style={{ color: '#1e3a8a', marginTop: 0 }}>What type of training are you booking?</h3>
          <p style={{ color: '#475569', marginBottom: '24px' }}>Select the option that fits your needs. All sessions are paid in cash at the field.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {TRAINING_TYPES.map((type) => (
              <div
                key={type.id}
                onClick={() => setSelectedType(type)}
                style={{
                  background: selectedType?.id === type.id ? '#eff6ff' : '#f8fbff',
                  border: selectedType?.id === type.id ? '2px solid #2563eb' : '2px solid #bfdbfe',
                  borderRadius: '18px', padding: '24px', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: selectedType?.id === type.id ? '0 0 0 4px rgba(37,99,235,0.08)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1 }}>
                    <span style={{ fontSize: '36px', lineHeight: 1 }}>{type.icon}</span>
                    <div>
                      <h3 style={{ margin: '0 0 6px', color: '#1e3a8a', fontSize: '19px' }}>{type.name}</h3>
                      <p style={{ margin: '0 0 6px', color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>{type.description}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                        <strong style={{ color: '#1d4ed8' }}>Best for:</strong> {type.bestFor}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: '28px', fontWeight: '800', color: '#1d4ed8' }}>{type.priceLabel}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#64748b' }}>{type.priceSub}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{type.duration}</p>
                  </div>
                </div>

                <div style={{ marginTop: '16px', borderTop: '1px solid #dbeafe', paddingTop: '16px' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What's included</p>
                  <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '4px' }}>
                    {type.includes.map((item) => (
                      <li key={item} style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>{item}</li>
                    ))}
                  </ul>
                </div>

                {selectedType?.id === type.id && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: '700', fontSize: '14px' }}>
                    <span style={{ width: '20px', height: '20px', background: '#2563eb', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>✓</span>
                    Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            className="primary-btn"
            style={{ marginTop: '28px', opacity: selectedType ? 1 : 0.5 }}
            disabled={!selectedType}
            onClick={goToStep2}
          >
            Continue with {selectedType?.name || '...'} →
          </button>
        </section>
      )}

      {/* ── Step 2: Choose Location ──────────────────────────────────────────── */}
      {step === 2 && (
        <section className="section">
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', fontWeight: '700', padding: '0 0 16px', display: 'block' }}>← Back to Training Types</button>
          <h3 style={{ color: '#1e3a8a', marginTop: 0 }}>Choose a Training Location</h3>
          <p style={{ color: '#475569', marginBottom: '24px' }}>Select the location that works best for you. All locations are in the area.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
            {LOCATIONS.map((loc) => (
              <div
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                style={{
                  background: selectedLocation?.id === loc.id ? '#eff6ff' : '#f8fbff',
                  border: selectedLocation?.id === loc.id ? '2px solid #2563eb' : '2px solid #bfdbfe',
                  borderRadius: '14px', padding: '20px 22px', cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <span style={{ fontSize: '28px' }}>{loc.icon}</span>
                    <div>
                      <h3 style={{ margin: '0 0 2px', color: '#1e3a8a', fontSize: '16px' }}>{loc.name}</h3>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: 'inline-block', margin: '0 0 6px', fontSize: '13px', fontWeight: '700', color: '#2563eb', textDecoration: 'underline' }}
                      >
                        📍 {loc.address}
                      </a>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{loc.details}</p>
                      {loc.link && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                          {loc.clubLogo && (
                            <img
                              src={loc.clubLogo}
                              alt="Real FC Wolves"
                              style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                            />
                          )}
                          <a
                            href={loc.link}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a', textDecoration: 'underline' }}
                          >
                            🌐 {loc.linkLabel}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedLocation?.id === loc.id && (
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>✓</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            className="primary-btn"
            style={{ opacity: selectedLocation ? 1 : 0.5 }}
            disabled={!selectedLocation}
            onClick={goToStep3}
          >
            Continue →
          </button>
        </section>
      )}

      {/* ── Step 3: Player Details ───────────────────────────────────────────── */}
      {step === 3 && (
        <section className="section">
          <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', fontWeight: '700', padding: '0 0 16px', display: 'block' }}>← Back to Location</button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
            <h3 style={{ color: '#1e3a8a', margin: 0 }}>Session Details — {selectedType.name}</h3>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '6px 14px', borderRadius: '999px', fontWeight: '700', fontSize: '14px' }}>
              {selectedType.priceLabel} {selectedType.priceSub}
            </span>
          </div>
          <p style={{ color: '#475569', marginBottom: '28px' }}>
            Fill in the player and session info so I can prepare the right training for your goals.
            Fields marked with <span style={{ color: '#dc2626' }}>*</span> are required.
          </p>

          {!user && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px' }}>
              <p style={{ margin: 0, color: '#1e3a8a', fontSize: '14px', fontWeight: '600' }}>
                You'll need to <Link to="/profile" style={{ color: '#2563eb' }}>sign in</Link> before confirming your booking in step 3. You can fill out your details now.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '560px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '700', color: '#1e3a8a', marginBottom: '6px', fontSize: '14px' }}>
                Player / Parent Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                className="form"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', color: '#0f172a' }}
                placeholder="Full name"
                value={form.playerName}
                onChange={(e) => updateForm('playerName', e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '700', color: '#1e3a8a', marginBottom: '6px', fontSize: '14px' }}>Contact Email <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', color: '#0f172a' }}
                type="email"
                placeholder="Your email address"
                value={form.clientEmail}
                onChange={(e) => updateForm('clientEmail', e.target.value)}
              />
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>I'll use this to confirm your booking.</p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '700', color: '#1e3a8a', marginBottom: '6px', fontSize: '14px' }}>Phone Number <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', color: '#0f172a' }}
                type="tel"
                placeholder="e.g., (610) 555-1234"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
              />
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>I'll use this to follow up and confirm session details.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '700', color: '#1e3a8a', marginBottom: '6px', fontSize: '14px' }}>Player Age <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', color: '#0f172a' }}
                  placeholder="e.g., 14"
                  value={form.playerAge}
                  onChange={(e) => updateForm('playerAge', e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '700', color: '#1e3a8a', marginBottom: '6px', fontSize: '14px' }}>Position <span style={{ color: '#dc2626' }}>*</span></label>
                <select
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', color: '#0f172a', background: 'white' }}
                  value={form.position}
                  onChange={(e) => updateForm('position', e.target.value)}
                >
                  <option value="">Select...</option>
                  <option>Striker</option>
                  <option>Winger</option>
                  <option>Midfielder</option>
                  <option>Defender</option>
                  <option>Goalkeeper</option>
                  <option>Not sure</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '700', color: '#1e3a8a', marginBottom: '6px', fontSize: '14px' }}>Skill Level <span style={{ color: '#dc2626' }}>*</span></label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { value: 'beginner', label: 'Beginner', sub: 'Just starting out or learning the basics' },
                  { value: 'intermediate', label: 'Intermediate', sub: 'Plays recreationally or on a youth team' },
                  { value: 'advanced', label: 'Advanced', sub: 'Competitive league, high school, or travel team level' }
                ].map(({ value, label, sub }) => (
                  <div
                    key={value}
                    onClick={() => updateForm('skillLevel', value)}
                    style={{
                      padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                      border: form.skillLevel === value ? '2px solid #2563eb' : '2px solid #e2e8f0',
                      background: form.skillLevel === value ? '#eff6ff' : 'white'
                    }}
                  >
                    <p style={{ margin: '0 0 2px', fontWeight: '700', color: '#1e3a8a', fontSize: '14px' }}>{label}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {(selectedType.id === 'small_group' || selectedType.id === 'camp') && (
              <div>
                <label style={{ display: 'block', fontWeight: '700', color: '#1e3a8a', marginBottom: '6px', fontSize: '14px' }}>
                  Number of Players <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', color: '#0f172a' }}
                  value={form.numPlayers}
                  onChange={(e) => updateForm('numPlayers', parseInt(e.target.value) || 1)}
                />
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#1d4ed8', fontWeight: '600' }}>
                  Total: ${selectedType.price * Math.max(1, form.numPlayers)} ({Math.max(1, form.numPlayers)} player{form.numPlayers > 1 ? 's' : ''} × ${selectedType.price}/player)
                </p>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontWeight: '700', color: '#1e3a8a', marginBottom: '6px', fontSize: '14px' }}>
                Main Goals for This Session <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                className="textarea"
                placeholder="e.g., Improve first touch and ball control, work on shooting from outside the box, build confidence in 1v1 situations"
                value={form.goals}
                onChange={(e) => updateForm('goals', e.target.value)}
                rows={3}
              />
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>The more specific, the better I can prepare.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '700', color: '#1e3a8a', marginBottom: '6px', fontSize: '14px' }}>
                  Preferred Date <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="date"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', color: '#0f172a' }}
                  value={form.preferredDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => updateForm('preferredDate', e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '700', color: '#1e3a8a', marginBottom: '6px', fontSize: '14px' }}>Preferred Time</label>
                <select
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', color: '#0f172a', background: 'white' }}
                  value={form.preferredTime}
                  onChange={(e) => updateForm('preferredTime', e.target.value)}
                >
                  <option value="">Flexible / No preference</option>
                  <option>Morning (8am – 12pm)</option>
                  <option>Afternoon (12pm – 4pm)</option>
                  <option>Evening (4pm – 8pm)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '700', color: '#1e3a8a', marginBottom: '6px', fontSize: '14px' }}>Additional Notes</label>
              <textarea
                className="textarea"
                placeholder="Anything else I should know — injuries, specific equipment needs, whether this is a birthday session, etc."
                value={form.notes}
                onChange={(e) => updateForm('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <button className="primary-btn" style={{ marginTop: '28px' }} onClick={goToStep4}>
            Review My Booking →
          </button>
        </section>
      )}

      {/* ── Step 4: Review & Confirm ─────────────────────────────────────────── */}
      {step === 4 && (
        <section className="section">
          <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', fontWeight: '700', padding: '0 0 16px', display: 'block' }}>← Back to Details</button>
          <h3 style={{ color: '#1e3a8a', marginTop: 0 }}>Review & Confirm Your Booking</h3>
          <p style={{ color: '#475569', marginBottom: '28px' }}>
            Review everything below. Once submitted I'll confirm your booking within 24 hours.
          </p>

          {/* Booking summary */}
          <div className="contact-card" style={{ marginBottom: '18px' }}>
            <h4 style={{ color: '#1e3a8a', margin: '0 0 18px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Booking Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {[
                ['Training Type', selectedType.name],
                ['Location', selectedLocation ? `${selectedLocation.name} — ${selectedLocation.address}` : ''],
                ['Duration', selectedType.duration],
                ['Player / Parent', `${form.playerName}, Age ${form.playerAge}`],
                ['Position', form.position],
                ['Skill Level', form.skillLevel.charAt(0).toUpperCase() + form.skillLevel.slice(1)],
                ['Preferred Date', new Date(form.preferredDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })],
                ['Preferred Time', form.preferredTime || 'Flexible'],
                ...(selectedType.id === 'small_group' || selectedType.id === 'camp' ? [['Number of Players', form.numPlayers.toString()]] : []),
                ['Contact Email', form.clientEmail]
              ].map(([label, val]) => (
                <div key={label}>
                  <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
                  <p style={{ margin: 0, fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>{val}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', borderTop: '1px solid #bfdbfe', paddingTop: '16px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Session Goals</p>
              <p style={{ margin: 0, color: '#0f172a', fontSize: '14px', lineHeight: '1.6' }}>{form.goals}</p>
            </div>
            {form.notes && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Notes</p>
                <p style={{ margin: 0, color: '#0f172a', fontSize: '14px', lineHeight: '1.6' }}>{form.notes}</p>
              </div>
            )}
          </div>

          {/* Price breakdown */}
          <div className="contact-card" style={{ marginBottom: '18px' }}>
            <h4 style={{ color: '#1e3a8a', margin: '0 0 16px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price Breakdown</h4>
            {(selectedType.id === 'small_group' || selectedType.id === 'camp') ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '15px' }}>
                  <span style={{ color: '#475569' }}>{selectedType.name}</span>
                  <span>{selectedType.priceLabel} per player</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px' }}>
                  <span style={{ color: '#475569' }}>Number of players</span>
                  <span>× {form.numPlayers}</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px' }}>
                <span style={{ color: '#475569' }}>{selectedType.name}</span>
                <span>{selectedType.priceLabel}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #dbeafe', paddingTop: '14px' }}>
              <strong style={{ fontSize: '17px' }}>Total Due at the Field</strong>
              <strong style={{ fontSize: '24px', color: '#1d4ed8' }}>${calcPrice()}</strong>
            </div>
            <div style={{ marginTop: '16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '14px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#166534', lineHeight: '1.6' }}>
                💵 <strong>Payment is due in cash at the start of the session.</strong> Nothing is charged online.
                Once I confirm your booking, I'll reach out with the field location and any final details.
              </p>
            </div>
          </div>

          {/* What happens next */}
          <div className="contact-card" style={{ marginBottom: '28px' }}>
            <h4 style={{ color: '#1e3a8a', margin: '0 0 16px', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>What Happens Next</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { n: '1', text: 'You submit this booking request' },
                { n: '2', text: 'I review it and confirm availability within 24 hours' },
                { n: '3', text: 'Check your Profile page — your booking status will update to Confirmed' },
                { n: '4', text: 'I\'ll follow up with the exact field location and any session details' },
                { n: '5', text: 'Show up ready to work — bring water, cleats, and your goals in mind' },
                { n: '6', text: 'Pay in cash at the start of the session' }
              ].map(({ n, text }) => (
                <div key={n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>{n}</div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#334155', paddingTop: '3px', lineHeight: '1.5' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {!user && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px' }}>
              <p style={{ margin: 0, color: '#c2410c', fontSize: '14px', fontWeight: '600' }}>
                You must <Link to="/profile" style={{ color: '#ea580c' }}>sign in</Link> to confirm a booking. Your details above are saved in this form.
              </p>
            </div>
          )}

          <button
            className="primary-btn"
            onClick={handleSubmit}
            disabled={loading || !user}
            style={{ width: '100%', padding: '18px', fontSize: '17px', fontWeight: '800' }}
          >
            {loading ? 'Submitting...' : `Confirm Booking Request — $${calcPrice()} due at field`}
          </button>
        </section>
      )}
    </>
  );
}
