import React, { useState, useEffect, useRef, useMemo } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Eye, Shield, Radio, Server, Activity, AlertTriangle, Layers, Navigation } from "lucide-react";

export default function LivingTopologyCanvas({
  topology,
  nodeStates,
  activeIncident,
  activeLayer = "FULL",
  systemState = "NORMAL", // NORMAL, STORM, CORRELATING, ROOT_CAUSE, REROUTING, RUNBOOK, RECOVERING, HEALTHY
  onSelectNode
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Camera & Zoom State
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  // Pre-calculated 2D Layout Coordinates for 20 Nodes
  const nodePositions = useMemo(() => ({
    // Layer 1: Core Edge Routers & Firewall (y: 60)
    "FW-MUM-01": { x: 120, y: 60, layer: "security" },
    "ER-MUM-01": { x: 380, y: 60, layer: "core_edge" },
    "ER-DEL-01": { x: 680, y: 60, layer: "core_edge" },

    // Layer 2: Core Switches & Control Plane (y: 165)
    "BSC-MUM-01": { x: 120, y: 165, layer: "control_plane" },
    "CS-MUM-01": { x: 380, y: 165, layer: "core" },
    "CS-MUM-02": { x: 600, y: 165, layer: "core" },

    // Layer 3: Aggregation Switches (y: 275)
    "AS-MUM-01": { x: 180, y: 275, layer: "aggregation" },
    "AS-MUM-02": { x: 360, y: 275, layer: "aggregation" },
    "AS-MUM-03": { x: 540, y: 275, layer: "aggregation" },
    "AS-PUN-01": { x: 740, y: 275, layer: "aggregation" },

    // Layer 4: Access 5G BTS / FTTH / Edge Branch (y: 380)
    "BTS-MUM-01": { x: 80, y: 380, layer: "access" },
    "BTS-MUM-02": { x: 170, y: 380, layer: "access" },
    "OLT-MUM-01": { x: 260, y: 380, layer: "access" },
    "BTS-MUM-03": { x: 340, y: 380, layer: "access" },
    "BTS-MUM-04": { x: 420, y: 380, layer: "access" },
    "RTR-PUN-01": { x: 780, y: 380, layer: "access" },

    // Layer 5: Mission-Critical Datacenter Services (y: 470)
    "SRV-PAY-01": { x: 480, y: 470, layer: "service" },
    "SRV-AUTH-01": { x: 560, y: 470, layer: "service" },
    "SRV-DNS-01": { x: 640, y: 470, layer: "service" },
    "SRV-SMS-01": { x: 720, y: 470, layer: "service" }
  }), []);

  // Filter nodes based on activeLayer
  const visibleNodes = useMemo(() => {
    if (!topology || !topology.nodes) return [];
    return topology.nodes.filter(node => {
      const pos = nodePositions[node.id];
      if (!pos) return false;
      if (activeLayer === "FULL") return true;
      if (activeLayer === "PHYSICAL") return ["core_edge", "core"].includes(pos.layer);
      if (activeLayer === "NETWORK") return ["core_edge", "core", "aggregation"].includes(pos.layer);
      if (activeLayer === "ACCESS") return ["aggregation", "access", "control_plane"].includes(pos.layer);
      if (activeLayer === "SERVICE") return ["aggregation", "service"].includes(pos.layer);
      if (activeLayer === "CUSTOMER") return ["access", "service"].includes(pos.layer);
      return true;
    });
  }, [topology, activeLayer, nodePositions]);

  // Main Canvas Rendering Engine (60fps Packet Flow, Fiber Optics, Blast Radius, Alert Convergence)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !topology) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let time = 0;

    // Packet particles array
    const packets = [];
    const linkKeys = topology.links.map(l => `${l.source}->${l.target}`);
    for (let i = 0; i < 40; i++) {
      packets.push({
        linkIndex: Math.floor(Math.random() * topology.links.length),
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.008,
        color: Math.random() > 0.3 ? "#38bdf8" : "#818cf8",
        size: 2.2 + Math.random() * 1.5
      });
    }

    // Alert explosion particles for STORM mode
    const alertParticles = [];
    for (let i = 0; i < 60; i++) {
      alertParticles.push({
        x: 380,
        y: 60,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 + 1.5,
        life: Math.random(),
        color: Math.random() > 0.5 ? "#ef4444" : "#f97316"
      });
    }

    const render = () => {
      time += 0.025;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.save();

      // Apply Pan & Zoom Transform
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // 1. Draw Links & Fiber Optics
      topology.links.forEach((link, idx) => {
        const p1 = nodePositions[link.source];
        const p2 = nodePositions[link.target];
        if (!p1 || !p2) return;

        const isFailedLink = (link.source === "ER-MUM-01" && link.target === "CS-MUM-01") &&
          ["STORM", "CORRELATING", "ROOT_CAUSE", "REROUTING"].includes(systemState);

        const isRerouteLink = (
          (link.source === "ER-MUM-01" && link.target === "CS-MUM-02") ||
          (link.source === "ER-DEL-01" && link.target === "CS-MUM-02")
        ) && ["REROUTING", "RUNBOOK", "RECOVERING", "HEALTHY"].includes(systemState);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        if (isFailedLink) {
          // Failed fiber line (red dashed)
          ctx.strokeStyle = "rgba(239, 68, 68, 0.7)";
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Failure point X indicator
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(midX, midY, 6 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (isRerouteLink) {
          // Alternate Failover Route (glowing amber/cyan)
          ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
          ctx.lineWidth = 3.0;
          ctx.setLineDash([]);
          ctx.stroke();
        } else {
          // Normal Healthy Fiber Link
          ctx.strokeStyle = "rgba(56, 189, 248, 0.22)";
          ctx.lineWidth = 1.6;
          ctx.setLineDash([]);
          ctx.stroke();

          // Traveling fiber optic light pulse
          const pulseProg = (time * 0.4 + idx * 0.2) % 1;
          const lx = p1.x + (p2.x - p1.x) * pulseProg;
          const ly = p1.y + (p2.y - p1.y) * pulseProg;
          ctx.fillStyle = "rgba(56, 189, 248, 0.9)";
          ctx.beginPath();
          ctx.arc(lx, ly, 2.0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 2. Animate Traveling Packets
      packets.forEach((pkt) => {
        const link = topology.links[pkt.linkIndex];
        const p1 = nodePositions[link.source];
        const p2 = nodePositions[link.target];
        if (!p1 || !p2) return;

        const isFailedLink = (link.source === "ER-MUM-01" && link.target === "CS-MUM-01") &&
          ["STORM", "CORRELATING", "ROOT_CAUSE"].includes(systemState);

        if (isFailedLink) {
          // Packets stop at failure point in outage
          return;
        }

        pkt.progress = (pkt.progress + pkt.speed) % 1;
        const px = p1.x + (p2.x - p1.x) * pkt.progress;
        const py = p1.y + (p2.y - p1.y) * pkt.progress;

        ctx.fillStyle = pkt.color;
        ctx.beginPath();
        ctx.arc(px, py, pkt.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Blast Radius Wave Ripple (during STORM / CORRELATING)
      if (["STORM", "CORRELATING", "ROOT_CAUSE"].includes(systemState)) {
        const rootPos = nodePositions["ER-MUM-01"];
        const waveRadius = ((time * 60) % 400);
        ctx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0, 0.6 - waveRadius / 400)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rootPos.x, rootPos.y, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Recovery Wave (during RECOVERING / HEALTHY)
      if (["RECOVERING", "HEALTHY"].includes(systemState)) {
        const rootPos = nodePositions["ER-MUM-01"];
        const waveRadius = ((time * 80) % 500);
        ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0, 0.7 - waveRadius / 500)})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(rootPos.x, rootPos.y, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 5. Alert Explosion / Convergence Particles
      if (systemState === "STORM") {
        alertParticles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.01;
          if (p.life <= 0) {
            p.x = 380;
            p.y = 60;
            p.life = 1;
          }
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (systemState === "CORRELATING") {
        // Particles converge into center
        alertParticles.forEach((p, i) => {
          const targetX = 380;
          const targetY = 60;
          p.x += (targetX - p.x) * 0.05;
          p.y += (targetY - p.y) * 0.05;
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.0, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 6. Draw Nodes
      visibleNodes.forEach((node) => {
        const pos = nodePositions[node.id];
        if (!pos) return;

        const isRootCause = nodeStates[node.id] === "CRITICAL_ROOT" ||
          (node.id === "ER-MUM-01" && ["STORM", "CORRELATING", "ROOT_CAUSE"].includes(systemState));
        const isImpacted = nodeStates[node.id] === "IMPACTED" && !isRootCause;
        const isRecovered = systemState === "HEALTHY" || systemState === "RECOVERING";

        // Node Heartbeat Outer Glow
        const pulse = Math.sin(time * 3 + pos.x) * 3;
        const baseRadius = 14;

        if (isRootCause && !isRecovered) {
          // Red Alarm Warning Pulse
          ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, baseRadius + 10 + pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ef4444";
          ctx.strokeStyle = "#fca5a5";
        } else if (isImpacted && !isRecovered) {
          // Orange Blast Radius Pulse
          ctx.fillStyle = "rgba(249, 115, 22, 0.2)";
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, baseRadius + 6 + pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ea580c";
          ctx.strokeStyle = "#fdba74";
        } else {
          // Stable Healthy Cyan Pulse
          ctx.fillStyle = "#0f172a";
          ctx.strokeStyle = isRecovered ? "#10b981" : "#38bdf8";
        }

        // Node Core Body
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, baseRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Device ID Label
        ctx.fillStyle = isRootCause && !isRecovered ? "#fca5a5" : "#cbd5e1";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(node.id, pos.x, pos.y + 26);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [topology, visibleNodes, nodePositions, nodeStates, systemState, pan, zoom]);

  // Handle Drag / Pan
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) {
      // Check node hover
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      const found = visibleNodes.find(n => {
        const pos = nodePositions[n.id];
        if (!pos) return false;
        const dist = Math.hypot(mouseX - pos.x, mouseY - pos.y);
        return dist <= 18;
      });

      setHoveredNode(found || null);
      return;
    }

    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="relative bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden backdrop-blur flex flex-col h-[560px] select-none shadow-2xl">
      {/* Top Controls & Status Bar */}
      <div className="p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 z-20">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Telecom Topology & Packet Flow Engine
          </h3>
          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-mono border border-sky-500/20">
            60 FPS Real-Time
          </span>
        </div>

        {/* Camera Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom(z => Math.min(2.0, z + 0.15))}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reset Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden bg-[#070b12]"
      >
        <canvas
          ref={canvasRef}
          width={900}
          height={500}
          className="w-full h-full block"
        />

        {/* Hover Node Tooltip Card */}
        {hoveredNode && (
          <div
            className="absolute top-4 left-4 z-30 bg-slate-900/95 border border-slate-700 p-3.5 rounded-lg shadow-2xl backdrop-blur max-w-xs pointer-events-none transition-all duration-200"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-1.5">
              <span className="font-mono font-bold text-sky-400 text-xs">{hoveredNode.id}</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {hoveredNode.type}
              </span>
            </div>
            <p className="text-white text-xs font-semibold">{hoveredNode.name}</p>
            <div className="mt-2 text-[11px] text-slate-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Vendor:</span> <span className="text-slate-200">{hoveredNode.vendor}</span>
              </div>
              <div className="flex justify-between">
                <span>IP Address:</span> <span className="text-slate-200">{hoveredNode.ip}</span>
              </div>
              <div className="flex justify-between">
                <span>Location:</span> <span className="text-slate-200">{hoveredNode.location}</span>
              </div>
              <div className="flex justify-between">
                <span>Optical Rx:</span> <span className="text-emerald-400 font-bold">{hoveredNode.optical_rx_dbm || -18.4} dBm</span>
              </div>
              <div className="flex justify-between">
                <span>Core Latency:</span> <span className="text-sky-300">12ms (Normal)</span>
              </div>
              {hoveredNode.subscribers && (
                <div className="flex justify-between">
                  <span>Subscribers:</span> <span className="text-emerald-400 font-bold">{hoveredNode.subscribers.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Corner Network Minimap */}
        <div className="absolute bottom-3 right-3 z-20 w-36 h-24 bg-slate-950/80 border border-slate-800 rounded-lg p-1.5 shadow-xl backdrop-blur pointer-events-none">
          <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Minimap</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="relative w-full h-[70px] bg-slate-900/60 rounded border border-slate-800/80 overflow-hidden">
            {/* Viewport frame */}
            <div
              className="absolute border border-sky-400/80 bg-sky-400/10 rounded pointer-events-none"
              style={{
                width: `${Math.min(100, (100 / zoom))}%`,
                height: `${Math.min(100, (100 / zoom))}%`,
                left: `${Math.max(0, -pan.x / 10)}%`,
                top: `${Math.max(0, -pan.y / 10)}%`
              }}
            />
            {/* Failure radar blip */}
            {["STORM", "CORRELATING", "ROOT_CAUSE"].includes(systemState) && (
              <div className="absolute left-[45%] top-[15%] w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
