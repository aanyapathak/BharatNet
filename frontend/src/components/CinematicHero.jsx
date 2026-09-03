import React, { useState, useEffect, useRef } from "react";
import { Activity, ArrowDown, Shield, Zap, Radio, Globe, Terminal, Sparkles } from "lucide-react";
import KineticText from "./KineticText";

export default function CinematicHero({ onEnterNoc, systemMode, isConnected }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const canvasRef = useRef(null);

  // Track scroll for progressive awakening
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const progress = Math.min(1, Math.max(0, scrollY / (windowHeight * 0.8)));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Canvas circular intelligence core + network signal animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      time += 0.02;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Radial background grid
      ctx.strokeStyle = "rgba(56, 189, 248, 0.04)";
      ctx.lineWidth = 1;
      for (let r = 50; r < 400; r += 60) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Circular Intelligence Core
      const coreRadius = 38 + Math.sin(time * 2) * 3;
      
      // Outer rotating halo rings
      for (let i = 0; i < 3; i++) {
        const ringRadius = coreRadius + 20 + i * 28;
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, time * (i % 2 === 0 ? 1 : -1) * 0.8, time * 0.8 + Math.PI * 1.4);
        ctx.strokeStyle = i === 0 ? "rgba(56, 189, 248, 0.4)" : "rgba(99, 102, 241, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Glowing Core
      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, coreRadius * 1.8);
      grad.addColorStop(0, "rgba(56, 189, 248, 0.9)");
      grad.addColorStop(0.4, "rgba(99, 102, 241, 0.6)");
      grad.addColorStop(1, "rgba(99, 102, 241, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Core Inner Circle
      ctx.fillStyle = "#090d16";
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Signals entering core
      const signalCount = 12;
      for (let i = 0; i < signalCount; i++) {
        const angle = (i / signalCount) * Math.PI * 2 + time * 0.3;
        const dist = 180 + Math.sin(time * 3 + i) * 40;
        const progress = (time * 1.5 + i * 0.5) % 1;
        const currentDist = dist * (1 - progress) + coreRadius * progress;

        const sx = cx + Math.cos(angle) * currentDist;
        const sy = cy + Math.sin(angle) * currentDist;

        ctx.fillStyle = i % 2 === 0 ? "#38bdf8" : "#818cf8";
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Trace line
        ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist);
        ctx.lineTo(cx, cy);
        ctx.stroke();
      }

      // Nodes spawning based on scrollProgress
      const nodeCount = Math.floor(scrollProgress * 8);
      for (let i = 0; i < nodeCount; i++) {
        const nodeAngle = (i / 8) * Math.PI * 2;
        const nodeDist = 140 + (i % 2) * 50;
        const nx = cx + Math.cos(nodeAngle) * nodeDist;
        const ny = cy + Math.sin(nodeAngle) * nodeDist;

        // Node circle
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(nx, ny, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Node link to core
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [scrollProgress]);

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between px-6 py-8 overflow-hidden bg-[#090d16] border-b border-slate-800/80 select-none">
      {/* Background canvas */}
      <div className="absolute inset-0 pointer-events-none opacity-80">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Top Tagline */}
      <div className="relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full pt-2">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-sky-400">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span>BHARATNET TIER-1 CORE • AUTONOMOUS NETWORK INTELLIGENCE</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-400">
          <span>TELEMETRY: LIVE</span>
          <span>•</span>
          <span className="text-emerald-400">STATUS: ACTIVE</span>
        </div>
      </div>

      {/* Center Cinematic Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center my-auto py-12">
        {/* Kinetic Telemetry Decode Banner */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-slate-300 mb-6 backdrop-blur shadow-2xl">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <KineticText text="AL3RT_5T0RM :: BGP_D0WN :: 0SPF_LOST :: R00T_C4U53_D3T3CT3D" duration={1800} />
        </div>

        {/* Hero Title with Kinetic Resolution */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          <span className="block bg-gradient-to-r from-slate-100 via-sky-200 to-white bg-clip-text text-transparent">
            FROM ALERT CHAOS
          </span>
          <span className="block mt-2 bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-200 bg-clip-text text-transparent">
            TO ONE ROOT CAUSE
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
          Turn thousands of noisy network alerts into one explainable incident, identify the root cause with 89%+ confidence, understand the blast radius, and accelerate recovery.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onEnterNoc}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-sky-500/25 transition active:scale-95"
          >
            <Activity className="w-4 h-4" />
            <span>ENTER MISSION CONTROL FLOOR</span>
          </button>
          <a
            href="#noc-floor"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-sm transition"
          >
            <span>Explore Architecture</span>
            <ArrowDown className="w-4 h-4 text-sky-400" />
          </a>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-xs font-mono text-slate-400 pb-2">
        <span className="tracking-widest uppercase text-[11px] text-slate-500">SCROLL TO AWAKEN TOPOLOGY</span>
        <div className="w-5 h-8 rounded-full border-2 border-slate-600 flex items-start justify-center p-1">
          <div className="w-1.5 h-2 rounded-full bg-sky-400 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
