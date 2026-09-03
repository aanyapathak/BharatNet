import time
from ingestion.models import Incident, IncidentStatus, MatchedRunbook, RunbookAction

class RunbookExecutor:
    def __init__(self):
        self.feedback_store = []

    def execute_action(self, incident: Incident, action_id: str, is_tier1: bool = True) -> tuple[bool, str, Incident]:
        """
        Executes an automated Tier 1 action or approved Tier 2 action.
        Returns: (success: bool, execution_log: str, updated_incident: Incident)
        """
        if not incident.runbook:
            return False, "No runbook attached to incident", incident

        actions_list = incident.runbook.tier1_actions if is_tier1 else incident.runbook.tier2_actions
        target_action = next((a for a in actions_list if a.id == action_id), None)
        
        if not target_action:
            return False, f"Action {action_id} not found in runbook", incident

        now = time.time()
        target_action.status = "COMPLETED"
        target_action.executed_at = now
        
        # Simulated execution output
        output = (
            f"[EXECUTION OK @ {time.strftime('%H:%M:%S')}] Command: '{target_action.command}'\n"
            f"--> Target Nodes: {', '.join(incident.blast_radius_devices[:3])}\n"
            f"--> Status: ReturnCode=0, ExecutionDuration={target_action.est_seconds}s\n"
            f"--> Health Check: [{incident.runbook.verification_command}] returned HEALTHY / OK\n"
            f"--> Carrier sync re-established. Downstream queues draining."
        )
        target_action.output_log = output
        incident.remediation_log.append(f"[{time.strftime('%H:%M:%S')}] Executed: {target_action.name}")

        # Check if all Tier 1 actions are completed or any Tier 2 action is executed -> resolve incident!
        tier1_all_done = all(a.status == "COMPLETED" for a in incident.runbook.tier1_actions)
        tier2_any_done = any(a.status == "COMPLETED" for a in incident.runbook.tier2_actions)

        if tier1_all_done or tier2_any_done:
            incident.status = IncidentStatus.RESOLVED
            incident.resolved_at = now
            incident.time_to_resolve_sec = now - incident.created_at

        return True, output, incident

    def record_feedback(self, incident_id: str, runbook_id: str, rating: str, comment: str = ""):
        self.feedback_store.append({
            "timestamp": time.time(),
            "incident_id": incident_id,
            "runbook_id": runbook_id,
            "rating": rating,  # thumbs_up / thumbs_down
            "comment": comment
        })