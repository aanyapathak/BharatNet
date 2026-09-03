import time
import json
import os
from datetime import datetime
from ingestion.models import Incident, EscalationNotification

class EscalationEngine:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        with open(os.path.join(data_dir, "escalation_policy.json"), "r", encoding="utf-8") as f:
            self.policy = json.load(f)

    def evaluate_escalation(self, incident: Incident) -> list[EscalationNotification]:
        """
        Evaluates elapsed time on an open incident and generates notifications
        according to the tiered escalation policy (L1 NOC -> L2 Core Architect -> VP Ops).
        """
        if incident.status.value in ["RESOLVED"]:
            return []

        now = time.time()
        elapsed_sec = now - incident.created_at
        
        # Match severity level
        sev_policy = next((p for p in self.policy["levels"] if p["severity"] == incident.severity.value), self.policy["levels"][0])
        steps = sev_policy["steps"]
        
        new_notifications = []
        for step_def in steps:
            step_num = step_def["step"]
            timeout = step_def["timeout_sec"]
            
            # If time has arrived and step not yet logged
            already_notified = any(n.step == step_num for n in incident.escalation_log)
            if elapsed_sec >= timeout and not already_notified:
                notif = EscalationNotification(
                    step=step_num,
                    timestamp=now,
                    formatted_time=datetime.fromtimestamp(now).strftime("%H:%M:%S"),
                    role=step_def["role"],
                    contact=step_def["contact"],
                    channels=step_def["channels"],
                    action_required=step_def["action"],
                    status="DELIVERED"
                )
                incident.escalation_log.append(notif)
                incident.current_escalation_step = step_num
                new_notifications.append(notif)

        return new_notifications