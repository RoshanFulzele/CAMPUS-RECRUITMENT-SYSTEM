"use client";
import { useEffect } from "react";
export default function TPODashboardPage() {
  useEffect(() => {
    const cards = document.querySelectorAll(".tpo-metrics");
    cards.forEach(card=>{
      card.style.opacity="1";
      card.style.transform="translateY(0) scale(1)";
    });
  }, []);
  return (
    <>
      <style>{`
      :root{--canvas: #f8f9fa;--surface: #fff;--ink: #18181b;--text: #63636f;--indigo: #4f46e5;}
      .tpo-bg{min-height:100vh;background:linear-gradient(110deg,#fff 60%,#f8f9fa 100%);padding:2em 0 6vh 0;}
      .tpo-title{font-size:2.2rem;font-weight:800;margin:2rem 0 1.4rem 0;letter-spacing:-.02em;}
      .tpo-metrics-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2.3rem;}
      .tpo-metrics{
        background:var(--surface);box-shadow:0 3px 14px #6366f133,0 1px 4px #2a2a3218;
        border-radius:1.32rem;border:1.2px solid #e4e4e7;text-align:center;padding:2.3em 1.1em 1.3em 1.1em;
        opacity:0;transform:translateY(85px) scale(.98);transition:opacity .9s,transform .92s;
      }
      .tpo-metric-key{font-size:1.09rem;color:var(--text);font-weight:600;}
      .tpo-metric-value{font-size:2.2rem;color:var(--ink);font-weight:800;letter-spacing:-.014em;}
      @media(max-width:900px){.tpo-metrics-grid{grid-template-columns:1fr;}}
      `}</style>
      <div className="tpo-bg">
        <div className="tpo-title">TPO Command Center</div>
        <div className="tpo-metrics-grid">
          <div className="tpo-metrics">
            <div className="tpo-metric-key">Placement Rate</div>
            <div className="tpo-metric-value">82%</div>
          </div>
          <div className="tpo-metrics">
            <div className="tpo-metric-key">Highest Package</div>
            <div className="tpo-metric-value">₹22 LPA</div>
          </div>
          <div className="tpo-metrics">
            <div className="tpo-metric-key">Active Drives</div>
            <div className="tpo-metric-value">5</div>
          </div>
        </div>
      </div>
    </>
  );
}
