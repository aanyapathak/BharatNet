import React from "react";
import { Layers, Network, Cable, Radio, Server, Users, Info } from "lucide-react";

export default function NetworkLayerSwitcher({ activeLayer, onSelectLayer }) {
  const layers = [
    {
      id: "FULL",
      name: "Full Topology",
      icon: Layers,
      description: "See the complete network and how devices, services, and dependencies are connected."
    },
    {
      id: "PHYSICAL",
      name: "Physical Fiber",
      icon: Cable,
      description: "View fiber links and physical infrastructure where failures originate."
    },
    {
      id: "NETWORK",
      name: "Network & Routing",
      icon: Network,
      description: "Inspect routers, switches, routing paths, and network connectivity."
    },
    {
      id: "ACCESS",
      name: "Access / BTS",
      icon: Radio,
      description: "See BTS, BSC/RNC, and access infrastructure affected by the incident."
    },
    {
      id: "SERVICE",
      name: "Telecom Services",
      icon: Server,
      description: "See which telecom and backend services are affected by network problems."
    },
    {
      id: "CUSTOMER",
      name: "Customer Impact",
      icon: Users,
      description: "See how infrastructure failures translate into affected services and users."
    }
  ];

  const currentLayer = layers.find(l => l.id === activeLayer) || layers[0];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 backdrop-blur select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Network Layer Perspective
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {layers.map(layer => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 ${
                  isActive
                    ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{layer.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual Description */}
      <div className="mt-2 text-[11px] text-slate-400 font-sans flex items-center gap-1.5 px-1">
        <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <span>{currentLayer.description}</span>
      </div>
    </div>
  );
}
