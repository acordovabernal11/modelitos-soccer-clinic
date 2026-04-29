import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { supabase, inquiries, plans } from "./supabase";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminDashboard } from "./pages/AdminDashboard";
import "./App.css";

function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user);
    });
  }, []);

  return (
    <nav className="nav">
      <h2 className="logo">Modelitos Soccer Clinic</h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/how-it-works">How It Works</Link>
        <Link to="/contact">Contact</Link>
        {user && <Link to="/profile">My Profile</Link>}
        {user && <Link to="/admin">Admin</Link>}
      </div>
    </nav>
  );
}

function HomePage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinWaitlist = async () => {
    if (!name.trim() || !email.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    const { error } = await inquiries.create({
      name: name.trim(),
      email: email.trim(),
      player_age: "",
      position: "",
      goal: "",
      status: "new"
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      setSubmitted(true);
      setName("");
      setEmail("");
    }
    setLoading(false);
  };

  return (
    <>
      <section className="hero">
        <div className="hero-overlay">
          <p className="eyebrow">College-Level Player • Mexico & Spain Professional Playing Experience • AI Training Plans</p>
          <h1>Elite Soccer Training for Players Who Want to Stand Out</h1>
          <p className="hero-text">
            Modelitos Soccer Clinic helps motivated soccer players improve their technique,
            confidence, speed of play, and decision-making through training backed by
            college-level playing experience and professional time in Mexico and Spain.
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
              <h3>1-on-1 Sessions</h3>
              <p>Personalized direction built around your strengths and goals.</p>
            </div>
            <div className="badge-card">
              <h3>College-Level Playing Experience</h3>
              <p>Built from real college competition and professional play in Mexico and Spain.</p>
            </div>
            <div className="badge-card">
              <h3>AI Training Plans</h3>
              <p>Actionable weekly plans with focus, drills, and coaching tips.</p>
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
              <button onClick={handleJoinWaitlist} disabled={loading}>
                {loading ? "Joining..." : "Join Waitlist"}
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

      <section className="section feature-summary-section">
        <h2>Feature Summary</h2>
        <p>
          This app helps players discover better training through position-specific plans,
          clear weekly progress, and experience-backed insights.
        </p>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Interactive AI Plan</h3>
            <p>Users choose their position and goal, then generate a customized weekly training plan.</p>
          </div>
          <div className="feature-card">
            <h3>Real Player Experience</h3>
            <p>Content is backed by college-level play and professional experience in Mexico and Spain.</p>
          </div>
          <div className="feature-card">
            <h3>Clear Value for Clients</h3>
            <p>Every training option includes clear pricing and realistic outcomes, not sales projections.</p>
          </div>
          <div className="feature-card">
            <h3>Easy Navigation</h3>
            <p>The site is structured for fast access to home, about, training demos, and contact details.</p>
          </div>
        </div>
      </section>

      <section className="section experience-section">
        <h2>Pro-Level Soccer Playing Experience</h2>
        <p>
          Work with a trainer who has played at the college level and professionally in
          Mexico and Spain. That experience brings real game insight, elite-feel training,
          and a player-first approach.
        </p>

        <div className="experience-grid">
          <div className="experience-card">
            <h3>College-Level Background</h3>
            <p>
              Played at the college level with the discipline, tactical awareness, and
              competitive habits that help players perform under pressure.
            </p>
          </div>

          <div className="experience-card">
            <h3>Mexico & Spain Professional Playing Experience</h3>
            <p>
              Played in competitive environments across Mexico and Spain, gaining technical
              polish, tactical awareness, and the mentality of a pro-level player.
            </p>
          </div>

          <div className="experience-card">
            <h3>Player-Focused Development</h3>
            <p>
              Each session is tailored to your position, goals, and current level so every training
              minute delivers real progress.
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
  const [customDetails, setCustomDetails] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedPlan, setSavedPlan] = useState(false);
  const [user, setUser] = useState(null);
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const generatePlan = () => {
    const plans = {
      Winger: {
        "Improve shooting": {
          title: "WEEKLY FOCUS: Winger – Shooting Precision & Wide Finishing",
          days: [
            {
              title: "Day 1 – Crossing and Finish Accuracy",
              warmup: "Dynamic hip openers, quick footwork, and light passing patterns.",
              mainWork: [
                "Wide crossing sessions with finishes from near and far post.",
                "One-touch finishing after receiving from a full-speed service.",
                "Shooting from stepovers and cutback positions."
              ],
              gameApplication: "Deliver fast crosses and finish quickly when the defense shifts inside.",
              coachingTip: "Attack the ball early and keep your body over the shot for accuracy."
            },
            {
              title: "Day 2 – Cutting Inside and Shooting",
              warmup: "Short passing, ball mastery, and movement into space drills.",
              mainWork: [
                "1v1 take-ons from the wing with a shot at the end.",
                "Dribble inside the box and strike off the preferred foot.",
                "Finishing from low crosses and cutback balls."
              ],
              gameApplication: "Use the first touch to create shooting space after beating a defender.",
              coachingTip: "Keep your head up so you can see goal angles before the finish."
            },
            {
              title: "Day 3 – Tempo and Decision Making",
              warmup: "Acceleration runs, ball rolls, and passing under pressure.",
              mainWork: [
                "Combination play with a supporting midfielder before shooting.",
                "Quick one-two finishes from the edge of the box.",
                "Small-sided shooting sequences with a defender closing."
              ],
              gameApplication: "Recognize when to shoot and when to lay off for the striker.",
              coachingTip: "Stay low and explode the moment the defender commits."
            }
          ]
        },
        "Improve dribbling": {
          title: "WEEKLY FOCUS: Winger – Dribbling & 1v1 Dominance",
          days: [
            {
              title: "Day 1 – Ball Mastery & Control",
              warmup: "Toe taps, inside-outside touches, and quick footwork.",
              mainWork: [
                "Cone dribbling with tight control and quick direction changes.",
                "1v1 move repetition using stepovers and scissors.",
                "Progressive acceleration after each move."
              ],
              gameApplication: "Beat a defender and explode into space down the wing.",
              coachingTip: "Keep your body low and accelerate immediately after your move."
            },
            {
              title: "Day 2 – Change of Direction and Speed",
              warmup: "Lateral shuffles, quick feet, and ball rolls.",
              mainWork: [
                "Shuffle dribble sequences with rapid feints.",
                "Chase-down 1v1 drills where the defender recovers quickly.",
                "Open-field dribbling into crossing opportunities."
              ],
              gameApplication: "Use a change of pace to create separation before the final action.",
              coachingTip: "Stay patient with the ball and let the defender commit first."
            },
            {
              title: "Day 3 – Combination Play and Game Speed",
              warmup: "Passing triangles, receiving on the move, and first-touch work.",
              mainWork: [
                "Wall-pass combinations followed by dribble and cross/shoot.",
                "Small-sided 1v1/2v1 scenarios with space to attack.",
                "Fast-break dribble sequences with a decision at the end."
              ],
              gameApplication: "Drive forward and use the dribble to create a better attacking angle.",
              coachingTip: "Attack the nearest defender’s weak side and keep your head up."
            }
          ]
        },
        "Improve speed": {
          title: "WEEKLY FOCUS: Winger – Acceleration & Route Efficiency",
          days: [
            {
              title: "Day 1 – Start Speed and Sprint Technique",
              warmup: "A-skips, quick feet, and mobility drills.",
              mainWork: [
                "Resisted starts with quick first steps.",
                "Short sprints from different angles and positions.",
                "Reaction sprint drills to a coach’s signal."
              ],
              gameApplication: "Explode into space when the ball arrives on the wing.",
              coachingTip: "Lean forward and push hard through the first two steps."
            },
            {
              title: "Day 2 – Recovery Runs and Endurance",
              warmup: "Light jog, dynamic hip openers, and leg swings.",
              mainWork: [
                "Repeated wing runs with short recovery intervals.",
                "Sprint-and-turn drills to simulate game transitions.",
                "Crossing after a high-speed run."
              ],
              gameApplication: "Maintain speed on the return run to cover defenders and support possession.",
              coachingTip: "Relax your upper body and breathe during longer runs."
            },
            {
              title: "Day 3 – Game-Speed Decision Making",
              warmup: "Step-over gates, lateral shuffle, and ball touches.",
              mainWork: [
                "7v7 wing attack drills with instant service and recovery.",
                "Sprint to receive and deliver under pressure.",
                "Timed run patterns into the final third."
              ],
              gameApplication: "Choose the right moment to sprint and when to hold your run.",
              coachingTip: "Move with purpose and keep options available ahead of each sprint."
            }
          ]
        },
        "Improve first touch": {
          title: "WEEKLY FOCUS: Winger – First Touch & Playmaking",
          days: [
            {
              title: "Day 1 – Directional First Touch",
              warmup: "Light passing, ball control, and receiving drills.",
              mainWork: [
                "Wall pass circuits with directional first touches.",
                "Receive on the half-turn and immediately drive forward.",
                "First touch into a crossing or shooting lane."
              ],
              gameApplication: "Control the ball away from defenders and keep the attack moving.",
              coachingTip: "Use the first touch to create space before the next action."
            },
            {
              title: "Day 2 – Touch Under Pressure",
              warmup: "Quick one-touch passing and movement drills.",
              mainWork: [
                "Pressure-receive exercises with a passive defender.",
                "Receive on the turn and take on a quick dribble.",
                "Play one-touch combinations in tight areas."
              ],
              gameApplication: "Control the ball cleanly when the defender closes in.",
              coachingTip: "Relax on the ball and let the touch guide it into space."
            },
            {
              title: "Day 3 – First Touch into Attack",
              warmup: "Passing ladders, close-touch work, and quick movement.",
              mainWork: [
                "First touch and cross sequences from the wing.",
                "Receive long passes with a strong directional touch.",
                "Transition from first touch into forward dribbling."
              ],
              gameApplication: "Make the first touch part of the attacking move, not a separate step.",
              coachingTip: "Keep your first touch sharp and immediately scan for the next pass or run."
            }
          ]
        }
      },
      Striker: {
        "Improve shooting": {
          title: "WEEKLY FOCUS: Striker – Finishing & Goal Threat",
          days: [
            {
              title: "Day 1 – Quick Release Finishing",
              warmup: "Aiming drills, footwork, and short passing.",
              mainWork: [
                "One-touch finishes from close-range service.",
                "Finishing after a quick first touch into the box.",
                "Shots from rebound scenarios."
              ],
              gameApplication: "Be ready to finish off crosses and rebounds with the first opportunity.",
              coachingTip: "Stay on your toes and keep your body positioned between the ball and defender."
            },
            {
              title: "Day 2 – Cutback Finishing",
              warmup: "Dynamic stretches and pace-controlled runs.",
              mainWork: [
                "Run across the box, receive cutbacks, and shoot first time.",
                "Finish from low crosses into the near post.",
                "Combination play with a teammate before the shot."
              ],
              gameApplication: "Move into spaces where the cutback can find you cleanly.",
              coachingTip: "Anticipate the pass and commit to the finish."
            },
            {
              title: "Day 3 – Pressure Finishing",
              warmup: "Balance work, core stability, and short touches.",
              mainWork: [
                "Finish while under contact from a defender.",
                "Shots after a heavy touch or first-time attempt.",
                "Small-sided finishing games with defensive pressure."
              ],
              gameApplication: "Stay strong and composed when defenders are tight.",
              coachingTip: "Protect the ball with your body and strike through it."
            }
          ]
        },
        "Improve dribbling": {
          title: "WEEKLY FOCUS: Striker – Tight Dribbling & Goal Line Threat",
          days: [
            {
              title: "Day 1 – Close-Control Dribbling",
              warmup: "Toe taps, inside-out touches, and close ball control.",
              mainWork: [
                "Dribbling in tight spaces around cones.",
                "1v1 take-ons near the penalty area.",
                "Shielding the ball while turning to shoot."
              ],
              gameApplication: "Use dribbling to create the extra yard needed for a shot.",
              coachingTip: "Keep the ball close and use small, sharp touches."
            },
            {
              title: "Day 2 – Turn and Attack",
              warmup: "Quick change-of-direction drills and ball rolls.",
              mainWork: [
                "Turn with the ball, face up to goal, and attack defenders.",
                "Pull-back dribble moves to open shooting lanes.",
                "1v1 knock-on drills to create separation."
              ],
              gameApplication: "Attack the defender’s weak side and drive into shooting positions.",
              coachingTip: "Commit to the move and keep your first touch forward."
            },
            {
              title: "Day 3 – Penetration and Finish",
              warmup: "Agility gates and finishing from movement.",
              mainWork: [
                "Receive the ball with back to goal, turn quickly, and shoot.",
                "Dribble into the box and finish under pressure.",
                "Close-range combination play and finish."
              ],
              gameApplication: "Use dribbling to enter dangerous scoring areas from the center."
              ,
              coachingTip: "Stay balanced and use your body to create the shooting angle."
            }
          ]
        },
        "Improve speed": {
          title: "WEEKLY FOCUS: Striker – Burst Speed & Finishing Runs",
          days: [
            {
              title: "Day 1 – Quick First Step",
              warmup: "High knees, quick step drills, and light passing.",
              mainWork: [
                "Short explosive sprints from different start positions.",
                "Run-on finishing drills after a quick first step.",
                "Reaction starts to a coach’s call."
              ],
              gameApplication: "Time your runs to stay onside and attack the back line.",
              coachingTip: "Explode quickly and keep your head up when running behind defenders."
            },
            {
              title: "Day 2 – Recovery and Support Runs",
              warmup: "Jogging, mobility, and dynamic leg swings.",
              mainWork: [
                "Sprint recovery runs after losing the ball.",
                "Support play runs to stay available for a pass.",
                "Cross-field sprint patterns with finishing."
              ],
              gameApplication: "Stay active off the ball and ready for second-ball chances.",
              coachingTip: "Run with purpose and always show for the ball."
            },
            {
              title: "Day 3 – Speed with Decision Making",
              warmup: "Acceleration drills and ball touches.",
              mainWork: [
                "Attack a high line in timed sprint drills.",
                "Finish after a sprint into a small-sided game.",
                "Service and shot sequences with quick transitions."
              ],
              gameApplication: "Choose when to keep the run and when to receive and turn."
              ,
              coachingTip: "Combine speed with smart movement, not just raw pace."
            }
          ]
        },
        "Improve first touch": {
          title: "WEEKLY FOCUS: Striker – First Touch into Finish",
          days: [
            {
              title: "Day 1 – Control & Shot Preparation",
              warmup: "Receiving drills, light passing, and body positioning.",
              mainWork: [
                "Receive passes on the half-turn and set up a shot.",
                "First touch into the space for a quick finish.",
                "Control and shoot sequences from inside the box."
              ],
              gameApplication: "Take the first touch into a dangerous finishing position.",
              coachingTip: "Make the touch purposeful and keep the attack alive."
            },
            {
              title: "Day 2 – First Touch Under Pressure",
              warmup: "One-touch passing and movement drills.",
              mainWork: [
                "Receive with a defender closing and finish immediately.",
                "Control from long passes and shoot quickly.",
                "Combination play with a quick first touch."
              ],
              gameApplication: "Maintain possession and create a shot even under pressure.",
              coachingTip: "Relax your foot and let the touch guide the ball into the path of the shot."
            },
            {
              title: "Day 3 – First Touch and Goal Reaction",
              warmup: "Service-and-shoot drills and close control.",
              mainWork: [
                "Quick-fire finishing after first touch in small-sided games.",
                "Control, turn, and shoot from rebound situations.",
                "Receive from the wing and finish across goal."
              ],
              gameApplication: "React to the first ball and be ready to finish the next action."
              ,
              coachingTip: "Use your first touch to keep the play moving forward."
            }
          ]
        }
      },
      Midfielder: {
        "Improve shooting": {
          title: "WEEKLY FOCUS: Midfielder – Long-Range Threat & Late Runs",
          days: [
            {
              title: "Day 1 – Technique from Distance",
              warmup: "Passing accuracy, positioning, and ball striking.",
              mainWork: [
                "Shots from outside the box with proper body balance.",
                "Strike from the top of the area after a charge."
              ],
              gameApplication: "Time your runs into space and shoot cleanly from distance.",
              coachingTip: "Plant your support foot and strike through the ball."
            },
            {
              title: "Day 2 – Late Arrival Finishing",
              warmup: "Dynamic movement, scanning, and passing.",
              mainWork: [
                "Late runs into the box with first-time finishes.",
                "Combination play and finish from cutbacks."
              ],
              gameApplication: "Arrive unmarked and attack pockets of space."
              ,
              coachingTip: "Keep your eyes on the ball while timing the run perfectly."
            },
            {
              title: "Day 3 – Balanced Shooting and Playmaking",
              warmup: "Ball control and passing patterns.",
              mainWork: [
                "Shoot after receiving in the half-space.",
                "Play and finish sequences with one or two touches."
              ],
              gameApplication: "Create and finish scoring chances from midfield."
              ,
              coachingTip: "Stay calm and choose the best shooting option."
            }
          ]
        },
        "Improve dribbling": {
          title: "WEEKLY FOCUS: Midfielder – Ball Carrying & Escape Moves",
          days: [
            {
              title: "Day 1 – Under Pressure Dribbling",
              warmup: "Passing in tight spaces and quick touches.",
              mainWork: [
                "Dribble through tight cones with close control.",
                "Escape pressure from a passive defender."
              ],
              gameApplication: "Drive past the first line of pressure and into midfield."
              ,
              coachingTip: "Protect the ball with your body while scanning the field."
            },
            {
              title: "Day 2 – Carry and Break Lines",
              warmup: "Movement drills and quick feet.",
              mainWork: [
                "Carry the ball forward with purpose and break the line.",
                "Stepovers and changes of direction to unbalance opponents."
              ],
              gameApplication: "Use dribbling to create passing lanes or shooting chances."
              ,
              coachingTip: "Keep your head up and look for support before taking the defender on."
            },
            {
              title: "Day 3 – Speed with the Ball",
              warmup: "Acceleration and control work.",
              mainWork: [
                "Fast dribble transitions from defense to midfield.",
                "1v1 carry drills with a focus on speed and balance."
              ],
              gameApplication: "Carry the ball at pace when your team needs to advance quickly."
              ,
              coachingTip: "Stay light on your feet and keep the ball close."
            }
          ]
        },
        "Improve speed": {
          title: "WEEKLY FOCUS: Midfielder – Speed of Play & Recovery Runs",
          days: [
            {
              title: "Day 1 – Quick First Touch Speed",
              warmup: "Passing and quick feet.",
              mainWork: [
                "Receive and move instantly into space.",
                "Short shuttle runs with immediate passing decisions."
              ],
              gameApplication: "Speed up the tempo by moving the ball quickly."
              ,
              coachingTip: "Let the ball do the work and focus on your next position."
            },
            {
              title: "Day 2 – Recovery and Support Speed",
              warmup: "Light running and mobility.",
              mainWork: [
                "Recovery runs after defensive transition.",
                "Support runs to offer a passing option quickly."
              ],
              gameApplication: "Keep the team connected by moving smartly off the ball."
              ,
              coachingTip: "Move with intent and always be between defenders and the ball."
            },
            {
              title: "Day 3 – Sprinting into Space",
              warmup: "Acceleration and agility drills.",
              mainWork: [
                "Timed runs into the final third.",
                "Run onto passes from deep with speed."
              ],
              gameApplication: "Use speed to open the field and support quick transitions."
              ,
              coachingTip: "Read the play and use your speed when the moment is right."
            }
          ]
        },
        "Improve first touch": {
          title: "WEEKLY FOCUS: Midfielder – First Touch & Playmaking",
          days: [
            {
              title: "Day 1 – Controlled Reception",
              warmup: "Receiving drills and passing triangles.",
              mainWork: [
                "First touch away from pressure into open space.",
                "Receive in stride and continue the attack."
              ],
              gameApplication: "Make the first touch work as the first pass in a sequence."
              ,
              coachingTip: "Take the touch into the direction you want to attack."
            },
            {
              title: "Day 2 – Quick Combinations",
              warmup: "One-touch passing and movement.",
              mainWork: [
                "One-touch combos with a teammate after the first touch.",
                "Receive and play quickly in tight areas."
              ],
              gameApplication: "Keep the ball moving and avoid being trapped by pressure."
              ,
              coachingTip: "Be ready to pass before the ball arrives."
            },
            {
              title: "Day 3 – First Touch into Vision",
              warmup: "Scanning and receiving exercises.",
              mainWork: [
                "Receive while scanning and make the next pass immediately.",
                "First touch into a forward passing lane."
              ],
              gameApplication: "Use the first touch to set up decisive plays."
              ,
              coachingTip: "See the next move before you control the ball."
            }
          ]
        }
      },
      Defender: {
        "Improve shooting": {
          title: "WEEKLY FOCUS: Defender – Set Piece Threat & Long Range Finishing",
          days: [
            {
              title: "Day 1 – Power and Accuracy",
              warmup: "Ball striking and balance drills.",
              mainWork: [
                "Shots from outside the box with good technique.",
                "Finishing from set-piece delivery."
              ],
              gameApplication: "Be a scoring threat on free kicks and second balls."
              ,
              coachingTip: "Keep your body over the ball and follow through cleanly."
            },
            {
              title: "Day 2 – Heading and Set Pieces",
              warmup: "Neck strength and aerial control.",
              mainWork: [
                "Aerial finishes from corners and free kicks.",
                "Heading on target after a run."
              ],
              gameApplication: "Attack the ball aggressively on set pieces."
              ,
              coachingTip: "Time your jump and keep your eyes on the ball."
            },
            {
              title: "Day 3 – Transition Shooting",
              warmup: "Ball recovery and passing.",
              mainWork: [
                "Long-range shots after winning the ball back.",
                "Finishing after a quick counterattack."
              ],
              gameApplication: "Take advantage of spaces when the opponent is disorganized."
              ,
              coachingTip: "Stay aware of your shooting opportunities after the turnover."
            }
          ]
        },
        "Improve dribbling": {
          title: "WEEKLY FOCUS: Defender – Composed Dribbling from the Back",
          days: [
            {
              title: "Day 1 – Carry Out of Pressure",
              warmup: "Close control and passing warm-up.",
              mainWork: [
                "Dribble out of pressure in the defensive third.",
                "Carry the ball into midfield with a calm head."
              ],
              gameApplication: "Release pressure by moving the ball forward yourself."
              ,
              coachingTip: "Keep your touch gentle and your head up."
            },
            {
              title: "Day 2 – 1v1 Composure",
              warmup: "Shielding and balance drills.",
              mainWork: [
                "1v1 take-ons with a focus on protection.",
                "Change-of-direction dribbling under defensive pressure."
              ],
              gameApplication: "Use dribbling to escape tight spots at the back."
              ,
              coachingTip: "Use your body to protect the ball and look for a passing option."
            },
            {
              title: "Day 3 – Progressive Carry",
              warmup: "Passing sequences and movement.",
              mainWork: [
                "Carry the ball from the defense into midfield with support nearby.",
                "Progressive dribbling into space before playing out."
              ],
              gameApplication: "Start attacks by moving the ball forward instead of just passing back."
              ,
              coachingTip: "Be patient but confident when you choose to carry."
            }
          ]
        },
        "Improve speed": {
          title: "WEEKLY FOCUS: Defender – Recovery Speed & Defensive Agility",
          days: [
            {
              title: "Day 1 – Backpedal to Sprint",
              warmup: "Defensive shuffle and hip mobility.",
              mainWork: [
                "Backpedal-to-sprint transitions with a coach’s signal.",
                "Reaction drills to mirror attackers."
              ],
              gameApplication: "Recover quickly when the opponent breaks through."
              ,
              coachingTip: "Stay low and keep your weight balanced."
            },
            {
              title: "Day 2 – Lateral Agility",
              warmup: "Side shuffles and quick feet.",
              mainWork: [
                "Lateral movement drills with sudden direction changes.",
                "Close-down runs with short recovery."
              ],
              gameApplication: "Close down attackers efficiently while staying balanced."
              ,
              coachingTip: "Use small, explosive steps instead of long strides."
            },
            {
              title: "Day 3 – Sprint Recovery",
              warmup: "Light jog and dynamic stretches.",
              mainWork: [
                "Chase-down sprints after a simulated turnover.",
                "Recovery runs into cover positions."
              ],
              gameApplication: "Get back into position fast after a turnover."
              ,
              coachingTip: "Focus on the next play, not the previous mistake."
            }
          ]
        },
        "Improve first touch": {
          title: "WEEKLY FOCUS: Defender – First Touch & Clean Distribution",
          days: [
            {
              title: "Day 1 – Controlled First Touch",
              warmup: "Passing, receiving, and body positioning.",
              mainWork: [
                "First touch away from pressure into space.",
                "Receive from ground and aerial passes cleanly."
              ],
              gameApplication: "Set up the next pass immediately after winning the ball."
              ,
              coachingTip: "Let the ball come to you and move your body with it."
            },
            {
              title: "Day 2 – First Touch into Passing",
              warmup: "Quick passing triangles and one-touch work.",
              mainWork: [
                "Receive and play a forward pass in one motion.",
                "Switch field with a strong first touch and next ball."
              ],
              gameApplication: "Keep possession while building from the back."
              ,
              coachingTip: "Choose the easiest play before making the more difficult one."
            },
            {
              title: "Day 3 – First Touch in Transition",
              warmup: "Ball control and movement exercises.",
              mainWork: [
                "Receive in transition and move the ball quickly into midfield.",
                "First touch into a safe, attacking pass."
              ],
              gameApplication: "Use the first touch to manage pressure when the opponent presses."
              ,
              coachingTip: "Stay calm and use the first touch to improve your angle."
            }
          ]
        }
      }
    };

    const defaultPlan = {
      title: `WEEKLY FOCUS: ${position} – ${goal}`,
      days: [
        {
          title: "Day 1 – Focus Session",
          warmup: "Dynamic movement, ball touches, and quick decision work.",
          mainWork: [
            `Position-specific drills to improve ${goal.toLowerCase()}.`, 
            "Technical repetition with a coach-led focus.",
            "Finish the session with a game-like application drill."
          ],
          gameApplication: "Take the session focus into a small-sided scenario.",
          coachingTip: "Stay deliberate with each touch and keep the main goal front of mind."
        },
        {
          title: "Day 2 – Build and Apply",
          warmup: "Passing, receiving, and mobility with the ball.",
          mainWork: [
            "Support play with a strong first touch and quick passes.",
            "Attacking or defending drills that mirror your position.",
            "Apply the skill in a full-speed transition exercise."
          ],
          gameApplication: "Use the learned action in a live game moment.",
          coachingTip: "Focus on quality over quantity and make each rep count."
        },
        {
          title: "Day 3 – Game Speed Review",
          warmup: "Speed of play, control, and decision-making drills.",
          mainWork: [
            "Small-sided play with the training focus in every sequence.",
            "Conditioning drills that reinforce the chosen skill.",
            "A final review set that emphasizes execution under pressure."
          ],
          gameApplication: "Link the training theme to a realistic match situation.",
          coachingTip: "Keep your actions simple and effective, then repeat them quickly."
        }
      ]
    };

    setLoading(true);
    setPlan(null);

    setTimeout(() => {
      setPlan(plans[position]?.[goal] || defaultPlan);
      setLoading(false);
    }, 1200);
  };

  const handleSavePlan = async () => {
    if (!user) {
      alert("Please sign in to save your training plan");
      return;
    }

    if (!plan) {
      alert("No plan to save");
      return;
    }

    setSavingPlan(true);
    const { error } = await plans.create(user.id, {
      position,
      goal,
      plan_data: plan
    });

    if (error) {
      alert("Error saving plan: " + error.message);
    } else {
      setSavedPlan(true);
      setTimeout(() => setSavedPlan(false), 3000);
    }
    setSavingPlan(false);
  };

  return (
    <>
      <section className="section">
        <h2>How It Works</h2>
        <p>
          Modelitos Soccer Clinic uses a simple but powerful process: evaluate the player,
          identify the goal, train with purpose, and use AI-generated drill plans to keep
          development going after the session ends.
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
            <p>The AI demo generates a custom training plan based on position and skill focus.</p>
          </div>
          <div className="timeline-card">
            <span>04</span>
            <h3>Live Coaching</h3>
            <p>Training focuses on technique, repetition, decision-making, and real game situations.</p>
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
              competition, and player exposure.
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
              <option>Wingback</option>
              <option>Striker</option>
              <option>Midfielder</option>
              <option>Defender</option>
            </select>

            <select value={goal} onChange={(e) => setGoal(e.target.value)} className="input">
              <option>Improve shooting</option>
              <option>Improve dribbling</option>
              <option>Improve speed</option>
              <option>Improve first touch</option>
              <option>Improve passing</option>
              <option>Improve decision making</option>
            </select>

            <textarea
              className="textarea"
              placeholder="Add custom player details, goals, or current level"
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
            />

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
              <div className="plan-header">
                <span className="weekly-focus-label">Weekly Focus</span>
                <h3>{plan.title}</h3>
              </div>
              <p className="plan-subtitle">
                Position: <strong>{position}</strong> | Focus: <strong>{goal}</strong>
              </p>
              {customDetails && (
                <p className="plan-custom-details">
                  <strong>Player Details:</strong> {customDetails}
                </p>
              )}
              {plan.days.map((day) => (
                <div className="plan-day" key={day.title}>
                  <h4>{day.title}</h4>
                  <p><strong>Warm-up:</strong> {day.warmup}</p>
                  <p><strong>Main Work:</strong></p>
                  <ul className="plan-list">
                    {day.mainWork.map((task, index) => (
                      <li key={index}>{task}</li>
                    ))}
                  </ul>
                  <p><strong>Game Application:</strong> {day.gameApplication}</p>
                  <p><strong>Coaching Tip:</strong> {day.coachingTip}</p>
                </div>
              ))}
            </div>
          )}

          {plan && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={handleSavePlan}
                disabled={savingPlan}
                className="primary-btn"
                style={{ marginRight: '10px' }}
              >
                {savingPlan ? "Saving..." : "Save This Plan"}
              </button>
              {savedPlan && <p className="success">Plan saved successfully!</p>}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    playerAge: "",
    position: "",
    goal: ""
  });

  const handleSignUp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) alert(error.message);
    else setUser(data.user);
    setLoading(false);
  };

  const handleSignIn = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    else setUser(data.user);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleSubmitInquiry = async () => {
    if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.position || !inquiryForm.goal) {
      alert("Please fill in all fields");
      return;
    }

    setInquiryLoading(true);
    const { error } = await inquiries.create({
      name: inquiryForm.name,
      email: inquiryForm.email,
      player_age: inquiryForm.playerAge,
      position: inquiryForm.position,
      goal: inquiryForm.goal,
      status: "new"
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      setInquirySubmitted(true);
      setInquiryForm({ name: "", email: "", playerAge: "", position: "", goal: "" });
      setTimeout(() => setInquirySubmitted(false), 5000);
    }
    setInquiryLoading(false);
  };

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
          <p><strong>Email:</strong> acordovabernal11@gmail.com</p>
          <p><strong>Location:</strong> West Grove, PA</p>
          <p><strong>Training Types:</strong> 1-on-1, small group, team training, camps, and clinics</p>
          <p><strong>Best For:</strong> Youth, middle school, high school, and motivated beginner players</p>
        </div>
      </section>

      <section className="section">
        <h2>Training Inquiry Form</h2>
        {!inquirySubmitted ? (
          <div className="form">
            <input
              placeholder="Player or parent name"
              value={inquiryForm.name}
              onChange={(e) => setInquiryForm({...inquiryForm, name: e.target.value})}
            />
            <input
              placeholder="Email address"
              value={inquiryForm.email}
              onChange={(e) => setInquiryForm({...inquiryForm, email: e.target.value})}
            />
            <input
              placeholder="Player age and position"
              value={inquiryForm.playerAge}
              onChange={(e) => setInquiryForm({...inquiryForm, playerAge: e.target.value})}
            />
            <input
              placeholder="Main goal: shooting, dribbling, speed, confidence, etc."
              value={inquiryForm.goal}
              onChange={(e) => setInquiryForm({...inquiryForm, goal: e.target.value})}
            />
            <input
              placeholder="Position: Striker, Winger, Defender, etc."
              value={inquiryForm.position}
              onChange={(e) => setInquiryForm({...inquiryForm, position: e.target.value})}
            />
            <button onClick={handleSubmitInquiry} disabled={inquiryLoading}>
              {inquiryLoading ? "Sending..." : "Send Training Inquiry"}
            </button>
          </div>
        ) : (
          <p className="success">
            Thanks! Your training inquiry has been received. I'll follow up with next steps.
          </p>
        )}
      </section>

      <section className="section">
        <h2>Pricing</h2>
        <p>
          These training options are designed to help players build technical skill,
          confidence, and game awareness. Small group sessions and camps/clinics are
          priced per player, while 1-on-1 training delivers fully personalized coaching.
        </p>

        <div className="pricing-grid">
          <div className="pricing-card featured-pricing">
            <h3>1-on-1 Training Sessions</h3>
            <p className="price">$60</p>
            <p>
              Personalized private sessions with focused technical correction,
              individual ball work, and a training plan built around your specific goals.
            </p>
          </div>

          <div className="pricing-card">
            <h3>Small Group Sessions</h3>
            <p className="price">$25</p>
            <p>
              Per player. Training in small groups of 2–5 gives competitive pressure,
              decision-making practice, and more game-like contact while keeping costs low.
            </p>
          </div>

          <div className="pricing-card">
            <h3>Team Training</h3>
            <p className="price">$150</p>
            <p>
              Designed for teams with shared tactical and technical goals, this option
              builds team habits, spacing, communication, and match-ready strategy.
            </p>
          </div>

          <div className="pricing-card">
            <h3>Camps & Clinics</h3>
            <p className="price">$100</p>
            <p>
              Per player. High-energy camps and clinics focus on skill stations,
              competitive drills, and development across multiple sessions.
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

      <section className="section">
        <h2>Account Access</h2>
        {user ? (
          <div>
            <p>Welcome, {user.email}!</p>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        ) : (
          <div className="form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleSignIn} disabled={loading}>
              Sign In
            </button>
            <button onClick={handleSignUp} disabled={loading}>
              Sign Up
            </button>
          </div>
        )}
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
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}