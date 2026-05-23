"use client";
import { useEffect } from "react";

export default function LandingFlowPage() {
  useEffect(() => {
    // Scroll-reveal for cards
    const cards = document.querySelectorAll(".section-card");
    const observer = new window.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = "1";
          (entry.target as HTMLElement).style.transform = "translateY(0px) scale(1)";
        }
      });
    }, { threshold: 0.32 });
    cards.forEach(card => observer.observe(card));

    // Hero orb parallax on scroll
    function onScroll() {
      const orb = document.getElementById("siriOrb");
      const hero = document.getElementById("heroSection");
      const scrollY = window.scrollY;
      if (!orb || !hero) return;
      if (window.innerWidth < 500) return;

      const rel = Math.min(1, scrollY / (hero.offsetHeight * 0.6));
      orb.style.transform = `translate(-50%, -50%) scale(${1.1 + rel * .33})`;
      orb.style.filter = `blur(${rel * 6}px)`;
      orb.style.opacity = `${1 - rel * 0.75}`;
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToSection(id: string) {
    document?.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <style>{`
      :root {
        --canvas: #f8f9fa;
        --surface: #fff;
        --ink: #18181b;
        --text: #63636f;
        --indigo: #4f46e5;
      }
      html, body, .app-landing-root {
        font-family: 'Inter', system-ui, sans-serif;
        color: var(--ink);
        background: var(--canvas);
        scroll-behavior: smooth;
        padding:0; margin:0;
      }
      section, .hero-landing {
        width: 100%;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background: var(--canvas);
      }
      .hero-landing {
        background: linear-gradient(120deg, var(--surface) 60%, #e0e7ff 100%);
        flex-direction: column;
        position: sticky;
        top: 0;
        z-index: 10;
        overflow: hidden;
        min-height: 120vh;
      }
      .hero-content {
        text-align: center;
        z-index: 2;
      }
      .hero-title {
        font-size: clamp(2.5rem, 8vw, 5rem);
        font-weight: 800;
        letter-spacing: -0.04em;
        color: var(--ink);
        margin-bottom: 1rem;
      }
      .hero-subtitle {
        font-size: 1.4rem;
        color: var(--text);
        margin-bottom: 2.5rem;
        line-height: 1.5;
        font-weight: 400;
      }
      .siri-orb {
        width: 140px;
        height: 140px;
        background: radial-gradient(circle at 60% 40%, #a5b4fc 40%, #6366f1 100%);
        border-radius: 50%;
        box-shadow: 0 10px 32px 0 #818cf880, 0 2px 8px 1px #6366f133;
        position: absolute;
        left: 50%;
        top: 62%;
        transform: translate(-50%, -50%) scale(1);
        filter: blur(0);
        opacity: 1;
        z-index: 1;
        transition: filter 1s, opacity 1s, transform 0.7s cubic-bezier(.77,0,.18,1);
      }
      .button-main {
        padding: 1.1rem 2.4rem;
        border-radius: 999px;
        background: var(--indigo);
        font-weight: 600;
        font-size: 1.2rem;
        color: #fff;
        box-shadow: 0 3px 14px #6366f122;
        border: none;
        outline: none;
        cursor: pointer;
        transition: background 0.18s;
      }
      .button-main:hover {
        background: #3730a3;
      }
      .section-card {
        background: var(--surface);
        box-shadow: 0 2px 12px #0001, 0 1px 4px #2a2a321a;
        border: 1px solid #e4e4e7;
        border-radius: 2rem;
        padding: 3.5rem 2rem 3rem 2rem;
        max-width: 540px;
        margin: 0 auto;
        text-align: center;
        opacity: 0;
        transform: translateY(80px) scale(.96);
        transition: opacity .9s cubic-bezier(.77,0,.18,1),transform .95s cubic-bezier(.77,0,.18,1);
        will-change: opacity,transform;
      }
      .card-title {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: .7rem;
        letter-spacing: -.02em;
        color: var(--ink);
      }
      .card-desc {
        color: var(--text);
        font-size: 1.1rem;
        margin-bottom: 2.4rem;
        letter-spacing: 0.01em;
        font-weight: 400;
      }
      @media (max-width: 720px) {
        .hero-landing { min-height: 90vh; }
        .hero-title { font-size: 2.2rem; }
        .section-card { padding: 2.1rem 1rem 1.6rem 1rem; }
      }  
      `}</style>
      <div className="app-landing-root">
        <div className="hero-landing" id="heroSection">
          <div className="siri-orb" id="siriOrb"></div>
          <div className="hero-content">
            <h1 className="hero-title">
              Campus<br />Recruitment<br />Supercharged
            </h1>
            <div className="hero-subtitle">
              The new gold standard for campus placement.<br />
              Smooth. Simple. Seriously smart.
            </div>
            <button className="button-main" onClick={() => scrollToSection("feature1")}> 
              Explore Features
            </button>
          </div>
        </div>

        {/* Feature 1 */}
        <section>
          <div className="section-card" id="feature1">
            <div className="card-title">Role-Based Dashboards</div>
            <div className="card-desc">
              Beautiful, smart dashboards for Students, Companies, and TPOs.<br />
              Blazing fast navigation, stats, and everything you need.
            </div>
            <img
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80"
              alt="dashboard"
              style={{
                width: "100%",
                borderRadius: "1.6rem",
                marginBottom: "1rem",
              }}
            />
          </div>
        </section>
        {/* Feature 2 */}
        <section>
          <div className="section-card" id="feature2">
            <div className="card-title">Smart Eligibility Engine</div>
            <div className="card-desc">
              No more wasted time. Instantly checks if you’re eligible for a job.<br />
              If not, get clear feedback—no guesswork.
            </div>
            <img
              src="https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?auto=format&fit=crop&w=400&q=80"
              alt="logic"
              style={{
                width: "100%",
                borderRadius: "1.6rem",
                marginBottom: "1rem",
              }}
            />
          </div>
        </section>
        {/* Feature 3 */}
        <section>
          <div className="section-card" id="feature3">
            <div className="card-title">Premium UI. Flawless UX.</div>
            <div className="card-desc">
              Crafted like an Apple product.<br />
              Subtle gradients, shadows, and seamless scrolling.
            </div>
            <img
              src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80"
              alt="ui"
              style={{
                width: "100%",
                borderRadius: "1.6rem",
                marginBottom: "1rem",
              }}
            />
          </div>
        </section>
      </div>
    </>
  );
}
