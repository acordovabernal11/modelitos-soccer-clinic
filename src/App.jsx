import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

function Navbar() {
  return (
    <nav className="nav">
      <h2 className="logo">Modelitos Soccer Clinic</h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/how-it-works">How It Works</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </nav>
  );
}

function HomePage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <>
      <section className="hero">
        <div className="hero-overlay">
          <p className="eyebrow">Private Coaching • AI Drill Plans • Serious Development</p>
          <h1>Elite Private Soccer Training for Serious Players</h1>
          <p className="hero-text">
            Modelitos Soccer Clinic helps ambitious soccer players sharpen their
            technical skills, build confidence, and improve decision-making
            through personalized 1-on-1 coaching and AI-powered training plans.
          </p>

          <div className="hero-buttons">
            <Link to="/contact">
              <button className="primary-btn">Book Training</button>
            </Link>
            <Link to="/how-it-works">
              <button className="secondary-btn">See How It Works</button>
            </Link>
          </div>

          <div className="hero-badges">
            <div className="badge-card">
              <h3>1-on-1</h3>
              <p>Personalized private training</p>
            </div>
            <div className="badge-card">
              <h3>AI Plans</h3>
              <p>Custom weekly drill suggestions</p>
            </div>
            <div className="badge-card">
              <h3>Player Growth</h3>
              <p>Technique, confidence, and game IQ</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Join the Waitlist</h2>
        <p>
          Leave your name and email to hear about training openings, future
          sessions, and personalized development options.
        </p>

        <div className="form">
          {!submitted ? (
            <>
              <input
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={() => {
                  if (name.trim() && email.trim()) {
                    setSubmitted(true);
                  }
                }}
              >
                Join Waitlist
              </button>
            </>
          ) : (
            <p className="success">
              Thanks {name}! You’re on the waitlist and we’ll contact you soon.
            </p>
          )}
        </div>
      </section>

      <section className="section">
        <h2>Why Players Choose Modelitos Soccer Clinic</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Position-Specific Coaching</h3>
            <p>
              Sessions are built around the real demands of your role on the field,
              not random generic drills.
            </p>
          </div>
          <div className="feature-card">
            <h3>Confidence Under Pressure</h3>
            <p>
              Improve technical ability and decision-making so you feel sharper in
              real game moments.
            </p>
          </div>
          <div className="feature-card">
            <h3>Modern Training Approach</h3>
            <p>
              AI-style drill plans help players leave each session knowing exactly
              what to work on next.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function AboutPage() {
  return (
    <section className="section">
      <h2>About Me</h2>
      <p>
        I provide private soccer training focused on technical development,
        confidence, and real game situations. Players receive personalized
        training plans based on their position, goals, and areas that need the
        most improvement. The goal is to help serious players train with purpose
        and stand out on the field.
      </p>

      <div className="photos">
        <img src="/photo1.jpg" alt="Training photo 1" />
        <img src="/photo2.jpg" alt="Training photo 2" />
        <img src="/photo3.jpg" alt="Training photo 3" />
      </div>

      <h2 className="video-title">30-Second Pitch</h2>
      <iframe
        width="100%"
        height="400"
        src="https://www.youtube.com/embed/YTs9PxzEIck"
        title="Pitch Video"
        allowFullScreen
      ></iframe>
    </section>
  );
}

function HowItWorksPage() {
  const [position, setPosition] = useState("Winger");
  const [goal, setGoal] = useState("Improve dribbling");
  const [plan, setPlan] = useState(null);

  const generatePlan = () => {
    const plans = {
      Winger: {
        "Improve shooting": [
          "Day 1: first-touch finishing from wide angles",
          "Day 2: cutting inside and shooting across goal",
          "Day 3: attacking the back post and one-touch finishing",
        ],
        "Improve dribbling": [
          "Day 1: cone dribbling with quick direction changes",
          "Day 2: winger 1v1 moves and explosive exits",
          "Day 3: dribble into space and deliver a final action",
        ],
        "Improve speed": [
          "Day 1: sprint mechanics and resisted starts",
          "Day 2: acceleration after first touch",
          "Day 3: repeated wide runs with recovery intervals",
        ],
        "Improve first touch": [
          "Day 1: wall passes with directional first touch",
          "Day 2: receiving on the half-turn under pressure",
          "Day 3: touch out of feet into crossing or dribbling action",
        ],
      },
      Striker: {
        "Improve shooting": [
          "Day 1: quick release finishing inside the box",
          "Day 2: one-touch finishing from cutbacks",
          "Day 3: finishing under pressure after physical contact",
        ],
        "Improve dribbling": [
          "Day 1: tight dribbling in traffic near goal",
          "Day 2: striker turns and 1v1 take-ons",
          "Day 3: receive, attack defender, and finish",
        ],
        "Improve speed": [
          "Day 1: short burst acceleration work",
          "Day 2: timed runs in behind the defense",
          "Day 3: repeat sprint finishing circuits",
        ],
        "Improve first touch": [
          "Day 1: back-to-goal control and layoff touches",
          "Day 2: receiving through balls in stride",
          "Day 3: first touch into a shot in tight space",
        ],
      },
      Midfielder: {
        "Improve shooting": [
          "Day 1: long-range technique and balance",
          "Day 2: edge-of-box finishing after dribble",
          "Day 3: arriving late into the box and striking first time",
        ],
        "Improve dribbling": [
          "Day 1: tight central-area dribbling",
          "Day 2: escape moves under pressure",
          "Day 3: carry ball forward and break lines",
        ],
        "Improve speed": [
          "Day 1: agility ladder and quick feet",
          "Day 2: burst after scanning and receiving",
          "Day 3: box-to-box interval runs",
        ],
        "Improve first touch": [
          "Day 1: receiving across body with scanning",
          "Day 2: one-touch passing combinations",
          "Day 3: control under pressure and play forward quickly",
        ],
      },
      Defender: {
        "Improve shooting": [
          "Day 1: striking from recycled balls",
          "Day 2: heading and finishing on set pieces",
          "Day 3: clean technique from distance",
        ],
        "Improve dribbling": [
          "Day 1: dribble out of pressure from the back",
          "Day 2: 1v1 composure in defensive build-up",
          "Day 3: controlled carry forward into midfield",
        ],
        "Improve speed": [
          "Day 1: backpedal-to-sprint transition work",
          "Day 2: recovery runs and chase-down speed",
          "Day 3: lateral movement and defensive acceleration",
        ],
        "Improve first touch": [
          "Day 1: opening hips and receiving under pressure",
          "Day 2: first touch away from pressing attacker",
          "Day 3: control and break the first line with a pass",
        ],
      },
    };

    setPlan(plans[position][goal]);
  };

  return (
    <section className="section">
      <h2>How It Works</h2>
      <p>
        This demo shows how the AI feature works. A player selects their position
        and the skill they want to improve. Then the system generates a custom
        weekly training plan.
      </p>

      <div className="ai-box">
        <div className="ai-controls">
          <select value={position} onChange={(e) => setPosition(e.target.value)} className="input">
            <option>Winger</option>
            <option>Striker</option>
            <option>Midfielder</option>
            <option>Defender</option>
          </select>

          <select value={goal} onChange={(e) => setGoal(e.target.value)} className="input">
            <option>Improve shooting</option>
            <option>Improve dribbling</option>
            <option>Improve speed</option>
            <option>Improve first touch</option>
          </select>

          <button className="primary-btn" onClick={generatePlan}>
            Generate Training Plan
          </button>
        </div>

        {plan && (
          <div className="plan-card">
            <h3>Your AI Training Plan</h3>
            <p className="plan-subtitle">
              Position: <strong>{position}</strong> | Focus: <strong>{goal}</strong>
            </p>
            <ul className="plan-list">
              {plan.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function ContactPage() {
  return (
    <>
      <section className="section">
        <h2>Contact</h2>
        <p>
          Ready to train or want to learn more? Reach out and let’s talk about
          your goals and how private coaching can help.
        </p>

        <div className="contact-card">
          <p><strong>Email:</strong> modelitosoccer@gmail.com</p>
          <p><strong>Location:</strong> State College, PA</p>
          <p><strong>Training Type:</strong> Private 1-on-1 soccer development</p>
        </div>
      </section>

      <section className="section">
        <h2>Simple Pricing</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Single Session</h3>
            <p className="price">$40</p>
            <p>One focused private training session</p>
          </div>
          <div className="pricing-card featured-pricing">
            <h3>Weekly Plan</h3>
            <p className="price">$140</p>
            <p>4 sessions + AI training plan support</p>
          </div>
          <div className="pricing-card">
            <h3>Custom Package</h3>
            <p className="price">Contact Me</p>
            <p>Built around player goals and availability</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default function App() {
  return (
    <div className="container">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </div>
  );
}