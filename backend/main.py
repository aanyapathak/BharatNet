import asyncio
import json
import os
import time
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os
from pydantic import BaseModel

from ingestion.models import (
    NormalizedAlert, Incident, IncidentStatus, SeverityLevel,
    AlertStatus, MatchedRunbook
)
from ingestion.alert_generator import AlertGenerator
from pipeline.noise_reducer import NoiseReducer
from pipeline.correlator import TopologyCorrelator
from runbook.matcher import RunbookMatcher
from runbook.executor import RunbookExecutor
from escalation.escalation_engine import EscalationEngine
from metrics.tracker import MetricTracker

app = FastAPI(title="BharatNet AIOps NOC Commander", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


alert_generator = AlertGenerator(DATA_DIR)
noise_reducer = NoiseReducer(DATA_DIR)
correlator = TopologyCorrelator(DATA_DIR)
runbook_matcher = RunbookMatcher(DATA_DIR)
runbook_executor = RunbookExecutor()
escalation_engine = EscalationEngine(DATA_DIR)
metric_tracker = MetricTracker()

recent_alerts = []
active_ws_connections = []
system_mode = "NORMAL"
is_storm_running = False

class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message_type: str, data: Any):
        if not self.active_connections:
            return
        payload = json.dumps({"type": message_type, "data": data})
        for connection in list(self.active_connections):
            try:
                await connection.send_text(payload)
            except Exception:
                self.disconnect(connection)

ws_manager = ConnectionManager()

def process_incoming_alert(raw_alert: NormalizedAlert):
    in_retained, processed_alert = noise_reducer.process_alert(raw_alert)
    recent_alerts.insert(0, processed_alert)
    if len(recent_alerts) > 150:
        recent_alerts.pop()

    matched_incident = None
    if in_retained:
        incident, is_new = correlator.correlate_alert(processed_alert)
        matched_incident = incident
        
        if is_new:
            incident.runbook = runbook_matcher.match_runbook(incident)
            incident.time_to_detect_sec = 42.0
            escalation_engine.evaluate_escalation(incident)
        else:
            escalation_engine.evaluate_escalation(incident)

    return processed_alert, matched_incident

async def background_telemetry_loop():
    last_bg_alert_time = time.time()
    
    while True:
        try:
            now = time.time()
            
            for inc in correlator.active_incidents.values():
                if inc.status != IncidentStatus.RESOLVED:
                    duration_sec = now - inc.created_at
                    inc.accumulated_loss_inr = duration_sec * inc.revenue_loss_rate_inr_per_sec
                    escalation_engine.evaluate_escalation(inc)

            if system_mode == "NORMAL" and (now - last_bg_alert_time) > 3.5:
                bg_alert = alert_generator.generate_random_background_alert()
                proc_alert, _ = process_incoming_alert(bg_alert)
                await ws_manager.broadcast("ALERT_STREAM", proc_alert.model_dump())
                last_bg_alert_time = now

            metrics = metric_tracker.compute_metrics(list(correlator.active_incidents.values()))
            incidents_list = [inc.model_dump() for inc in correlator.active_incidents.values()]
            
            node_states = {}
            for n in correlator.topology_data["nodes"]:
                node_states[n["id"]] = "HEALTHY"
                
            for inc in correlator.active_incidents.values():
                if inc.status != IncidentStatus.RESOLVED:
                    if inc.root_cause:
                        node_states[inc.root_cause.root_device_id] = "CRITICAL_ROOT"
                    for d in inc.blast_radius_devices:
                        if node_states.get(d) != "CRITICAL_ROOT":
                            node_states[d] = "IMPACTED"

            await ws_manager.broadcast("METRICS_UPDATE", metrics)
            await ws_manager.broadcast("INCIDENTS_UPDATE", incidents_list)
            await ws_manager.broadcast("TOPOLOGY_STATUS", node_states)

        except Exception as e:
            pass

        await asyncio.sleep(1.0)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(background_telemetry_loop())

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        init_payload = {
            "alerts": [a.model_dump() for a in recent_alerts[:40]],
            "incidents": [inc.model_dump() for inc in correlator.active_incidents.values()],
            "metrics": metric_tracker.compute_metrics(list(correlator.active_incidents.values())),
            "topology": correlator.topology_data,
            "services": correlator.services_data
        }
        await websocket.send_text(json.dumps({"type": "INIT_SNAPSHOT", "data": init_payload}))
        
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

@app.get("/api/topology")
async def get_topology():
    return correlator.topology_data

@app.get("/api/services")
async def get_services():
    return correlator.services_data

@app.get("/api/incidents")
async def get_incidents():
    return [inc.model_dump() for inc in correlator.active_incidents.values()]

@app.get("/api/metrics")
async def get_metrics():
    return metric_tracker.compute_metrics(list(correlator.active_incidents.values()))

async def run_fiber_cut_storm_task():
    global is_storm_running, system_mode
    is_storm_running = True
    system_mode = "STORM"
    events = alert_generator.generate_fiber_cut_storm_sequence()
    
    start_time = time.time()
    for ev in events:
        target_time = start_time + (ev["delay_sec"] * 0.35)
        delay = target_time - time.time()
        if delay > 0:
            await asyncio.sleep(delay)
            
        node = correlator.nodes_map.get(ev["device_id"], {})
        now = time.time()
        raw_alert = NormalizedAlert(
            alert_id=alert_generator._next_alert_id("STORM"),
            timestamp=now,
            formatted_time=time.strftime('%H:%M:%S', time.localtime(now)),
            device_id=ev["device_id"],
            device_name=node.get("name", ev["device_id"]),
            device_type=node.get("type", "unknown"),
            location=node.get("location", "Mumbai-BKC"),
            alert_type=ev["alert_type"],
            severity=ev["severity"],
            oid=ev.get("oid"),
            description=ev["description"],
            source_protocol=ev["source_protocol"],
            status=AlertStatus.NORMALIZED,
            is_root_cause_candidate=ev.get("is_root", False)
        )
        proc_alert, inc = process_incoming_alert(raw_alert)
        await ws_manager.broadcast("ALERT_STREAM", proc_alert.model_dump())
        
    is_storm_running = False

@app.post("/api/scenarios/fiber-cut")
async def trigger_fiber_cut(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_fiber_cut_storm_task)
    return {"status": "STORM_INITIATED", "scenario": "Mumbai Metro Dark Fiber Trunk 1 Shearing"}

@app.post("/api/scenarios/predictive")
async def trigger_predictive():
    global system_mode
    system_mode = "PREDICTIVE"
    alert = alert_generator.generate_predictive_drift_alert()
    proc_alert, inc = process_incoming_alert(alert)
    await ws_manager.broadcast("ALERT_STREAM", proc_alert.model_dump())
    return {"status": "PREDICTIVE_EMITTED", "alert": proc_alert.model_dump()}

@app.post("/api/scenarios/reset")
async def reset_scenario():
    global system_mode, recent_alerts
    system_mode = "NORMAL"
    correlator.active_incidents.clear()
    correlator.alert_to_incident.clear()
    noise_reducer.dedup_cache.clear()
    noise_reducer.flapping_history.clear()
    recent_alerts.clear()
    return {"status": "SYSTEM_RESET_OK"}

class ActionExecuteRequest(BaseModel):
    incident_id: str
    action_id: str
    is_tier1: bool = True

@app.post("/api/runbook/execute")
async def execute_runbook_action(req: ActionExecuteRequest):
    incident = correlator.active_incidents.get(req.incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    success, log, updated_inc = runbook_executor.execute_action(incident, req.action_id, req.is_tier1)
    if not success:
        raise HTTPException(status_code=400, detail=log)
        
    await ws_manager.broadcast("INCIDENT_UPDATED", updated_inc.model_dump())
    return {"status": "SUCCESS", "log": log, "incident": updated_inc.model_dump()}

class AckRequest(BaseModel):
    incident_id: str
    acknowledged_by: str = "NOC On-Call Engineer"

@app.post("/api/incidents/acknowledge")
async def acknowledge_incident(req: AckRequest):
    incident = correlator.active_incidents.get(req.incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    incident.status = IncidentStatus.ACKNOWLEDGED
    incident.remediation_log.append(f"[{time.strftime('%H:%M:%S')}] Acknowledged by {req.acknowledged_by}")
    await ws_manager.broadcast("INCIDENT_UPDATED", incident.model_dump())
    return {"status": "ACKNOWLEDGED", "incident": incident.model_dump()}

class FeedbackRequest(BaseModel):
    incident_id: str
    runbook_id: str
    rating: str
    comment: str = ""

@app.post("/api/feedback")
async def submit_feedback(req: FeedbackRequest):
    runbook_executor.record_feedback(req.incident_id, req.runbook_id, req.rating, req.comment)
    return {"status": "FEEDBACK_RECORDED", "msg": "Thank you! Feedback recorded."}




