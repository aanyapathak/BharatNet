import React, { useState, useEffect, useRef } from "react";
import CinematicHero from "./components/CinematicHero";
import NocNavbar from "./components/NocNavbar";
import DemoScenarioControls from "./components/DemoScenarioControls";
import KPICards from "./components/KPICards";
import NetworkLayerSwitcher from "./components/NetworkLayerSwitcher";
import LivingTopologyCanvas from "./components/LivingTopologyCanvas";
import IncidentCommandPanel from "./components/IncidentCommandPanel";
import RunbookEngine from "./components/RunbookEngine";
import AlertStream from "./components/AlertStream";
import NetworkEventLog from "./components/NetworkEventLog";
import EscalationTimelineView from "./components/EscalationTimelineView";
import NetworkHealthMatrix from "./components/NetworkHealthMatrix";
import PredictiveWarningModule from "./components/PredictiveWarningModule";
import RecoveryTimeMetric from "./components/RecoveryTimeMetric";
import FloatingNotifications from "./components/FloatingNotifications";

export default function App() {
  // State Machine: NORMAL, STORM, CORRELATING, ROOT_CAUSE, REROUTING, RUNBOOK, RECOVERING, HEALTHY, PREDICTIVE
  const [systemState, setSystemState] = useState("NORMAL");
  const [activeLayer, setActiveLayer] = useState("FULL");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isStorming, setIsStorming] = useState(false);

  // Data State
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [topology, setTopology] = useState(null);
  const [nodeStates, setNodeStates] = useState({});
  const [eventLogs, setEventLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const wsRef = useRef(null);
  const nocFloorRef = useRef(null);

  // Helper to push toast notification
  const addNotification = (title, message, type = "INFO") => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  };

  // Helper to add event log
  const addEventLog = (type, desc, sev = "INFO") => {
    const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setEventLogs((prev) => [{ time, type, desc, sev }, ...prev.slice(0, 40)]);
  };

  // WebSocket Connection
  useEffect(() => {
    let ws;
    const connectWs = () => {
      ws = new WebSocket("ws://localhost:8000/ws/telemetry");
      wsRef.current = ws;

      ws.onopen = () => setIsConnected(true);

      ws.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          if (type === "INIT_SNAPSHOT") {
            setAlerts(data.alerts || []);
            setIncidents(data.incidents || []);
            setMetrics(data.metrics || null);
            setTopology(data.topology || null);
          } else if (type === "ALERT_STREAM") {
            setAlerts((prev) => [data, ...prev.slice(0, 120)]);
          } else if (type === "INCIDENTS_UPDATE") {
            setIncidents(data);
          } else if (type === "METRICS_UPDATE") {
            setMetrics(data);
          } else if (type === "TOPOLOGY_STATUS") {
            setNodeStates(data);
          }
        } catch (err) {
          console.error("Telemetry sync error:", err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWs, 2000);
      };

      ws.onerror = () => ws.close();
    };

    connectWs();
    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Scenario Handlers
  const handleTriggerFiberCut = async () => {
    setIsStorming(true);
    setSystemState("STORM");
    addEventLog("LINK DOWN", "ER-MUM-01 Ingress Dark Fiber Shearing", "CRIT");
    addNotification("INCIDENT DETECTED", "Mumbai dark fiber failure detected on ER-MUM-01 uplink.", "ROOT_CAUSE");

    try {
      await fetch("http://localhost:8000/api/scenarios/fiber-cut", { method: "POST" });
    } catch (e) {
      console.error(e);
    }

    // Sequence state transitions for cinematic demo
    setTimeout(() => {
      setSystemState("CORRELATING");
      addEventLog("CORRELATING", "Topology Correlator grouping 23 alerts into INC-2024-0001", "INFO");
    }, 4000);

    setTimeout(() => {
      setSystemState("ROOT_CAUSE");
      addEventLog("ROOT CAUSE", "ER-MUM-01 physical uplink identified (89% Confidence)", "INFO");
      addNotification("ROOT CAUSE IDENTIFIED", "ER-MUM-01 uplink failure · 89% Confidence", "ROOT_CAUSE");
    }, 7000);

    setTimeout(() => {
      setSystemState("RUNBOOK");
      addEventLog("RUNBOOK READY", "Matched RB-014 Uplink Recovery · Awaiting Action", "INFO");
      addNotification("RUNBOOK READY", "RB-014 Uplink Recovery ready. Human approval required.", "INFO");
      setIsStorming(false);
    }, 9500);
  };

  const handleTriggerPredictive = async () => {
    setSystemState("PREDICTIVE");
    addEventLog("PREDICTIVE", "ER-MUM-01 Optical Rx power degrading at -0.8 dBm/hr", "CRIT");
    addNotification("PREDICTIVE WARNING", "ER-MUM-01 optical link degrading toward cutoff.", "INFO");
    try {
      await fetch("http://localhost:8000/api/scenarios/predictive", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerNormal = async () => {
    setSystemState("NORMAL");
    addEventLog("NORMAL", "Ambient telemetry monitoring active", "INFO");
  };

  const handleReset = async () => {
    setSystemState("NORMAL");
    setIsStorming(false);
    try {
      await fetch("http://localhost:8000/api/scenarios/reset", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    addNotification("SYSTEM RESET", "All incidents and telemetry trackers restored to baseline.", "INFO");
  };

  const handleAcknowledge = async (incidentId) => {
    try {
      await fetch("http://localhost:8000/api/incidents/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incident_id: incidentId, acknowledged_by: "NOC Lead Rajesh Kumar" })
      });
      addEventLog("ACKNOWLEDGED", "Incident acknowledged by NOC Lead", "INFO");
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecuteAction = async (incidentId, actionId, isTier1) => {
    try {
      if (!isTier1) {
        setSystemState("REROUTING");
        addEventLog("REROUTING", "Optical Ring B failover committed via CS-MUM-02", "INFO");
      }

      await fetch("http://localhost:8000/api/runbook/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incident_id: incidentId, action_id: actionId, is_tier1: isTier1 })
      });

      if (!isTier1) {
        setTimeout(() => {
          setSystemState("RECOVERING");
          addEventLog("RECOVERING", "Recovery wave propagating across downstream nodes", "SUCCESS");
        }, 1500);

        setTimeout(() => {
          setSystemState("HEALTHY");
          addEventLog("RECOVERED", "Network Restored 100%. Traffic verified.", "SUCCESS");
          addNotification("NETWORK RECOVERED", "Traffic restored across all 6 affected services.", "RECOVERY");
        }, 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitFeedback = async (incidentId, runbookId, rating) => {
    try {
      await fetch("http://localhost:8000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incident_id: incidentId, runbook_id: runbookId, rating })
      });
      addNotification("FEEDBACK SAVED", "Runbook accuracy recorded to tune ML model weights.", "INFO");
    } catch (e) {
      console.error(e);
    }
  };

  const activeIncident = incidents[0] || (systemState !== "NORMAL" ? {
    incident_id: "INC-2024-0001",
    title: "Mumbai Fiber Shearing & Core Link Drop",
    severity: "CRITICAL",
    status: systemState === "HEALTHY" ? "RESOLVED" : "OPEN",
    formatted_created_at: "20:41:08",
    blast_radius_devices: ["ER-MUM-01", "CS-MUM-01", "AS-MUM-01", "AS-MUM-02", "AS-MUM-03", "BTS-MUM-01", "BTS-MUM-02", "BTS-MUM-03", "BTS-MUM-04", "SRV-PAY-01", "SRV-AUTH-01"],
    total_subscribers_impacted: 120500,
    revenue_loss_rate_inr_per_sec: 8540,
    accumulated_loss_inr: 512400,
    correlated_alerts_count: 23,
    correlation_reasoning: "Correlated 23 alerts into single actionable incident. Ingress fiber cut on ER-MUM-01 caused cascading OSPF/BGP teardown and downstream traffic starvation across 11 devices."
  } : null);

  const isResolved = systemState === "HEALTHY" || activeIncident?.status === "RESOLVED";
  const suppressedCount = alerts.filter((a) => ["DEDUPED", "FLAPPING_SUPPRESSED", "SELF_HEALING_HOLD"].includes(a.status)).length;

  const scrollToNoc = () => {
    if (nocFloorRef.current) {
      nocFloorRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-[#070b12] text-slate-100" : "bg-slate-50 text-slate-900"} font-sans antialiased transition-colors duration-300`}>
      {/* 1. Cinematic Opening Experience */}
      <CinematicHero
        onEnterNoc={scrollToNoc}
        systemMode={systemState}
        isConnected={isConnected}
      />

      {/* 2. NOC Mission Control Operations Floor */}
      <div ref={nocFloorRef} id="noc-floor" className="flex flex-col">
        {/* Top Mission Control Bar */}
        <NocNavbar
          systemState={systemState}
          isConnected={isConnected}
          onReset={handleReset}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />

        {/* Demo Simulation Controls */}
        <DemoScenarioControls
          onTriggerFiberCut={handleTriggerFiberCut}
          onTriggerPredictive={handleTriggerPredictive}
          onTriggerNormal={handleTriggerNormal}
          onReset={handleReset}
          isStorming={isStorming}
        />

        {/* Financial Loss & MTTR KPI Strip */}
        <KPICards
          metrics={metrics}
          activeIncidents={incidents}
          totalAlertsCount={alerts.length}
          suppressedCount={suppressedCount}
        />

        {/* Main Side-by-Side Command Center (LEFT: Topology, RIGHT: Incident & Runbook) */}
        <main className="px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT: Network Topology & Layer Switcher (7 cols) */}
          <section className="lg:col-span-7 flex flex-col gap-4">
            <NetworkLayerSwitcher
              activeLayer={activeLayer}
              onSelectLayer={setActiveLayer}
            />

            <LivingTopologyCanvas
              topology={topology}
              nodeStates={nodeStates}
              activeIncident={activeIncident}
              activeLayer={activeLayer}
              systemState={systemState}
            />
          </section>

          {/* RIGHT: Active Incident Intelligence & Runbook Engine (5 cols) */}
          <section className="lg:col-span-5 flex flex-col gap-4">
            <IncidentCommandPanel
              incident={activeIncident}
              onAcknowledge={handleAcknowledge}
              isResolved={isResolved}
            />

            <RunbookEngine
              incident={activeIncident}
              onExecuteAction={handleExecuteAction}
              onSubmitFeedback={handleSubmitFeedback}
              isResolved={isResolved}
            />
          </section>
        </main>

        {/* Supporting Operations Grid: Alerts, Event Log, Escalation, Health Matrix, MTTR */}
        <section className="px-6 pb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Live Alert Stream */}
          <AlertStream alerts={alerts} />

          {/* Network Event Log & Escalation */}
          <div className="flex flex-col gap-5">
            <NetworkEventLog events={eventLogs} />
            <EscalationTimelineView isResolved={isResolved} systemState={systemState} />
          </div>

          {/* Health Matrix, Predictive Warning & MTTR Reduction */}
          <div className="flex flex-col gap-5">
            <NetworkHealthMatrix systemState={systemState} isResolved={isResolved} />
            <PredictiveWarningModule onTriggerPredictive={handleTriggerPredictive} />
            <RecoveryTimeMetric metrics={metrics} />
          </div>
        </section>
      </div>

      {/* Floating Notifications Toast Container */}
      <FloatingNotifications
        notifications={notifications}
        onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
      />
    </div>
  );
}