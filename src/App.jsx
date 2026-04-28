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
          <p className="eyebrow">Private Coaching • Small Groups • Team Training • AI Drill Plans</p>
          <h1>Elite Soccer Training for Players Who Want to Stand Out</h1>
          <p className="hero-text">
            Modelitos Soccer Clinic helps motivated soccer players improve their technique,
            confidence, speed of play, and decision-making through personalized coaching
            and AI-powered training plans.
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
              <p>Focused private development</p>
            </div>
            <div className="badge-card">
              <h3>Groups</h3>
              <p>Small group competitive sessions</p>
            </div>
            <div className="badge-card">
              <h3>AI Plans</h3>
              <p>Custom drills based on position and goals</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Join the Waitlist</h2>
        <p>
          Leave your name and email to hear about training openings, camps, clinics,
          and new player development opportunities.
        </p>

        <div className="form">
          {!submitted ? (
            <>
              <input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button onClick={() => name.trim() && email.trim() && setSubmitted(true)}>
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
        <h2>Training Built Around Player Growth</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Technical Skill</h3>
            <p>First touch, ball control, dribbling, finishing, passing, and weak foot development.</p>
          </div>
          <div className="feature-card">
            <h3>Game IQ</h3>
            <p>Decision-making, scanning, positioning, movement off the ball, and confidence under pressure.</p>
          </div>
          <div className="feature-card">
            <h3>Clear Training Plan</h3>
            <p>Every player leaves with a focused plan instead of random drills with no direction.</p>
          </div>
        </div>
      </section>
    </>
  );
}

function AboutPage() {
  return (
    <section className="section">
      <h2>About Modelitos Soccer Clinic</h2>
      <p>
        Modelitos Soccer Clinic is a soccer training service focused on helping players
        improve with purpose. Instead of doing random drills, each session is designed
        around the player’s position, skill level, goals, and areas for improvement.
        The service combines live coaching with AI-powered training recommendations so
        players know exactly what to work on next.
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
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    setPlan(null);

    setTimeout(() => {
      setPlan(plans[position][goal]);
      setLoading(false);
    }, 1200);
  };

  return (
    <>
      <section className="section">
        <h2>How It Works</h2>
        <p>
          Modelitos Soccer Clinic uses a simple but powerful process: evaluate the player,
          choose the right training format, train with purpose, and use AI-generated drill
          plans to keep development going after the session ends.
        </p>

        <div className="timeline">
          <div className="timeline-card">
            <span>01</span>
            <h3>Player Evaluation</h3>
            <p>We identify the player’s position, age, strengths, weaknesses, and training goals.</p>
          </div>

          <div className="timeline-card">
            <span>02</span>
            <h3>Training Type Selection</h3>
            <p>The player chooses the right format: private, small group, team training, or clinic.</p>
          </div>

          <div className="timeline-card">
            <span>03</span>
            <h3>AI Drill Plan</h3>
            <p>The demo creates a custom weekly plan based on position and skill focus.</p>
          </div>

          <div className="timeline-card">
            <span>04</span>
            <h3>Live Coaching</h3>
            <p>Training focuses on technique, repetition, decision-making, and real game actions.</p>
          </div>

          <div className="timeline-card">
            <span>05</span>
            <h3>Progress Review</h3>
            <p>Players receive clear feedback and a next-step plan to keep improving.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Training Formats</h2>
        <div className="training-grid">
          <div className="training-card">
            <div className="training-icon">⚽</div>
            <h3>1-on-1 Training</h3>
            <p>
              Best for players who want personal attention, technical correction,
              and a training plan built directly around their goals.
            </p>
            <ul>
              <li>Private skill development</li>
              <li>Position-specific drills</li>
              <li>Confidence and technique focus</li>
            </ul>
          </div>

          <div className="training-card">
            <div className="training-icon">👥</div>
            <h3>Small Group Sessions</h3>
            <p>
              Best for 2–5 players who want competitive training with more game-like
              pressure and decision-making.
            </p>
            <ul>
              <li>Small-sided competition</li>
              <li>Passing and movement</li>
              <li>1v1 and 2v2 situations</li>
            </ul>
          </div>

          <div className="training-card">
            <div className="training-icon">🏟️</div>
            <h3>Team Training</h3>
            <p>
              Built for teams that want focused sessions around chemistry, tactical
              awareness, spacing, and team habits.
            </p>
            <ul>
              <li>Team shape and movement</li>
              <li>Communication</li>
              <li>Game-speed exercises</li>
            </ul>
          </div>

          <div className="training-card">
            <div className="training-icon">🏆</div>
            <h3>Camps & Clinics</h3>
            <p>
              High-energy training events focused on skill development, confidence,
              competition, and a fun group learning environment.
            </p>
            <ul>
              <li>Skill stations</li>
              <li>Competitive challenges</li>
              <li>Fun group environment</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Interactive AI Training Demo</h2>
        <p>
          Select a player position and development goal. The demo will generate a
          sample weekly plan. In a future version, this feature could analyze uploaded
          training videos and recommend even more specific drills.
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

          {loading && (
            <div className="loading-card">
              <div className="spinner"></div>
              <p>Analyzing player profile and generating custom plan...</p>
            </div>
          )}

          {plan && !loading && (
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
    </>
  );
}

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <section className="section">
        <h2>Contact Modelitos Soccer Clinic</h2>
        <p>
          Ready to train or want to learn more? Send a message with the player’s age,
          position, current level, and main goal. I will follow up with recommended
          training options and next steps.
        </p>

        <div className="contact-card">
          <p><strong>Email:</strong> modelitosoccer@gmail.com</p>
          <p><strong>Location:</strong> State College, PA</p>
          <p><strong>Training Types:</strong> 1-on-1, small group, team training, camps, and clinics</p>
          <p><strong>Best For:</strong> Youth, middle school, high school, and motivated beginner players</p>
        </div>
      </section>

      <section className="section">
        <h2>Training Inquiry Form</h2>
        {!sent ? (
          <div className="form">
            <input placeholder="Player or parent name" />
            <input placeholder="Email address" />
            <input placeholder="Player age and position" />
            <input placeholder="Main goal: shooting, dribbling, speed, confidence, etc." />
            <button onClick={() => setSent(true)}>Send Training Inquiry</button>
          </div>
        ) : (
          <p className="success">
            Thanks! Your training inquiry has been received. I’ll follow up with next steps.
          </p>
        )}
      </section>

      <section className="section">
        <h2>Training Packages & Pricing</h2>
        <p>
          Choose the training format that best fits the player’s goals, schedule, and level of development.
          Each option is designed to provide focused coaching, clear feedback, and a better plan for improvement.
        </p>

        <div className="pricing-grid">
          <div className="pricing-card featured-pricing">
            <h3>1-on-1 Training Sessions</h3>
            <p className="price">$60</p>
            <p>
              Private individual training built around one player’s specific needs. Best for players
              who want focused attention, technical correction, and a personalized development plan.
            </p>
          </div>

          <div className="pricing-card">
            <h3>Small Group Sessions</h3>
            <p className="price">$25</p>
            <p>
              Training for 2–5 players who want a competitive environment while still receiving
              personal feedback. Great for friends, teammates, or players with similar goals.
            </p>
          </div>

          <div className="pricing-card">
            <h3>Team Training</h3>
            <p className="price">$150</p>
            <p>
              Full team sessions focused on communication, spacing, movement, decision-making,
              and game-like situations that help the team improve together.
            </p>
          </div>

          <div className="pricing-card">
            <h3>Camps & Clinics</h3>
            <p className="price">$100</p>
            <p>
              High-energy training events designed for skill development, competition,
              confidence-building, and a fun group learning environment.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Which Option Is Best?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Choose 1-on-1 if...</h3>
            <p>You want the most personal attention and a plan built directly around one player.</p>
          </div>

          <div className="feature-card">
            <h3>Choose Small Group if...</h3>
            <p>You want training with friends, competition, and more game-like pressure.</p>
          </div>

          <div className="feature-card">
            <h3>Choose Team Training if...</h3>
            <p>Your team needs better chemistry, communication, spacing, or tactical habits.</p>
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