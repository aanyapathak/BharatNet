import React, { useState } from 'react';
import { Network, Server, Shield, Radio, Activity, Eye, Zap, AlertCircle } from 'lucide-react';

export default function BlastRadiusTopology({ topology, nodeStates, activeIncident }) {
  const [selectedNode, setSelectedNode] = useState(null);

  if (!topology || !topology.nodes) {
    return <div className="p-4 text-slate-500 text-xs">Loading topology map...</div>;
  }

  // Pre-calculated aesthetic 2D visual layout coordinates for 20 nodes
  const layoutPositions = {
    // Core Edge Gateways
    'ER-MUM-01': { x: 300, y: 50, label: 'Mumbai Edge Router 01 (Cisco ASR)' },
    'ER-DEL-01': { x: 580, y: 50, label: 'Delhi Transit Router (Juniper)' },
    'FW-MUM-01': { x: 120, y: 50, label: 'Palo Alto Edge Firewall' },

    // Core Switches
    'CS-MUM-01': { x: 300, y: 150, label: 'Mumbai Core Switch 01 (Arista Spine)' },
    'CS-MUM-02': { x: 500, y: 150, label: 'Mumbai Core Switch 02 (Redundant Ring)' },
    'BSC-MUM-01': { x: 120, y: 150, label: 'Base Station Controller West-1' },

    // Aggregation Layer
    'AS-MUM-01': { x: 180, y: 260, label: 'South Mumbai Aggregation' },
    'AS-MUM-02': { x: 340, y: 260, label: 'Suburban Mumbai Aggregation' },
    'AS-MUM-03': { x: 520, y: 260, label: 'Datacenter Services Aggregation' },
    'AS-PUN-01': { x: 680, y: 260, label: 'Pune Transit Aggregation' },

    // Access Layer & Services
    'BTS-MUM-01': { x: 80, y: 380, label: 'BKC 5G Hub (42k Subs)' },
    'BTS-MUM-02': { x: 170, y: 380, label: 'Colaba 5G Hub (31k Subs)' },
    'OLT-MUM-01': { x: 250, y: 380, label: 'Bandra FTTH OLT' },
    'BTS-MUM-03': { x: 330, y: 380, label: 'Andheri Tech 5G' },
    'BTS-MUM-04': { x: 410, y: 380, label: 'Powai Campus 5G' },
    'SRV-PAY-01': { x: 490, y: 380, label: 'UPI Payment Gateway' },
    'SRV-AUTH-01': { x: 560, y: 380, label: 'Subscriber AAA/HLR' },
    'SRV-DNS-01': { x: 630, y: 380, label: 'Core DNS Node' },
    'SRV-SMS-01': { x: 700, y: 380, label: 'Banking OTP SMS' },
    'RTR-PUN-01': { x: 770, y: 380, label: 'Pune Branch Router' }
  };

  const getNodeColor = (nodeId) => {
    const state = nodeStates[nodeId] || 'HEALTHY';
    if (state === 'CRITICAL_ROOT') return { fill: '#ef4444', stroke: '#f87171', glow: true, text: 'ROOT CAUSE' };
    if (state === 'IMPACTED') return { fill: '#f97316', stroke: '#fb923c', glow: false, text: 'BLAST RADIUS' };
    return { fill: '#0f172a', stroke: '#38bdf8', glow: false, text: 'HEALTHY' };
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col backdrop-blur relative">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-sky-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Dynamic Network Graph & Blast Radius
          </h2>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" /> Root Cause Node
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Downstream Impact
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Healthy
          </span>
        </div>
      </div>

      {/* SVG Topology View */}
      <div className="w-full h-[320px] bg-slate-950/60 rounded-lg border border-slate-800/80 p-2 overflow-hidden relative scanline-effect">
        <svg viewBox="0 0 850 430" className="w-full h-full">
          <defs>
            <linearGradient id="linkGradRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="linkGradNormal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Links */}
          {topology.links.map((link, idx) => {
            const p1 = layoutPositions[link.source];
            const p2 = layoutPositions[link.target];
            if (!p1 || !p2) return null;

            const isImpactedLink = 
              (nodeStates[link.source] === 'CRITICAL_ROOT' || nodeStates[link.source] === 'IMPACTED') &&
              (nodeStates[link.target] === 'CRITICAL_ROOT' || nodeStates[link.target] === 'IMPACTED');

            return (
              <g key={idx}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isImpactedLink ? 'url(#linkGradRed)' : 'url(#linkGradNormal)'}
                  strokeWidth={isImpactedLink ? 2.5 : 1.2}
                  strokeDasharray={isImpactedLink ? '4 3' : 'none'}
                  className={isImpactedLink ? 'animate-pulse' : ''}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {topology.nodes.map((node) => {
            const pos = layoutPositions[node.id];
            if (!pos) return null;
            const color = getNodeColor(node.id);
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer transition-transform duration-200 hover:scale-110"
              >
                {color.glow && (
                  <circle
                    r="20"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    className="animate-ping opacity-75"
                  />
                )}
                <circle
                  r={isSelected ? 16 : 13}
                  fill={color.fill}
                  stroke={color.stroke}
                  strokeWidth={isSelected ? 3 : 2}
                  filter={color.glow ? 'url(#glow)' : undefined}
                />
                <text
                  y="24"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Inspector Flyout */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-700 p-3 rounded-lg text-xs max-w-xs shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-1.5">
              <span className="font-bold text-sky-400 font-mono">{selectedNode.id}</span>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-slate-200 font-semibold">{selectedNode.name}</p>
            <div className="mt-1 text-[11px] text-slate-400 space-y-0.5 font-mono">
              <div>Type: <span className="text-slate-200">{selectedNode.type}</span></div>
              <div>Vendor: <span className="text-slate-200">{selectedNode.vendor}</span></div>
              <div>IP: <span className="text-slate-200">{selectedNode.ip}</span></div>
              <div>Location: <span className="text-slate-200">{selectedNode.location}</span></div>
              {selectedNode.subscribers && (
                <div>Active Subscribers: <span className="text-emerald-400 font-bold">{selectedNode.subscribers.toLocaleString()}</span></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}