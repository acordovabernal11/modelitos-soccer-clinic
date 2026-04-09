import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

function Navbar() {
  return (
    <nav className="nav">
      <h2 className="logo">Modelitos Soccer Clinic</h2>
      <div>
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
    <section className="section hero">
      <h1>Private Soccer Training for Players Who Want to Stand Out</h1>
      <p>
        Modelitos Soccer Clinic helps serious soccer players improve their technical
        skills, confidence, and decision-making through personalized 1-on-1 training
        and AI-powered drill recommendations.
      </p>

      <div className="hero-buttons">
        <button className="primary-btn">Book Training</button>
        <button className="secondary-btn">See How It Works</button>
      </div>

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
            <button onClick={() => setSubmitted(true)}>
              Join Waitlist
            </button>
          </>
        ) : (
          <p className="success">
            Thanks {name}! We'll contact you soon.
          </p>
        )}
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <section className="section">
      <h2>About Me</h2>
      <p>
        I provide private soccer training focused on technical development,
        confidence, and real game situations. Players receive personalized
        training plans based on their position and goals.
      </p>

      <div className="photos">
        <img src="/photo1.jpg" alt="Training photo 1" />
        <img src="/photo2.jpg" alt="Training photo 2" />
        <img src="/photo3.jpg" alt="Training photo 3" />
      </div>

      <iframe
        width="100%"
        height="315"
        src="https://www.youtube.com/embed/YTs9PxzEIck"
        title="Pitch Video"
      ></iframe>
    </section>
  );
}

function HowItWorksPage() {
  return (
    <section className="section">
      <h2>How It Works</h2>

      <div style={{ marginTop: "20px" }}>
        <select className="input">
          <option>Winger</option>
          <option>Striker</option>
          <option>Midfielder</option>
          <option>Defender</option>
        </select>

        <select className="input">
          <option>Improve shooting</option>
          <option>Improve dribbling</option>
          <option>Improve speed</option>
          <option>Improve first touch</option>
        </select>

        <button className="primary-btn">
          Generate Training Plan
        </button>
      </div>

      <div className="steps">
        <div>
          <h3>AI Training Plan</h3>
          <p>Day 1: Ball mastery + cone dribbling</p>
          <p>Day 2: Finishing inside the box</p>
          <p>Day 3: 1v1 attacking moves</p>
        </div>
      </div>
    </section>
  );
}

function ContactPage() {
  return (
    <section className="section">
      <h2>Contact</h2>
      <p>Email: acordovabernal11@gmail.com</p>
      <p>Location: Oxford, PA</p>
    </section>
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