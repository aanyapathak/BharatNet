import time
import json
import os
from collections import defaultdict
from ingestion.models import NormalizedAlert, AlertStatus, SeverityLevel

class NoiseReducer:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        with open(os.path.join(data_dir, "historical_incidents.json"), "r", encoding="utf-8") as f:
            self.historical_patterns = json.load(f)
        
        # Deduplication memory: (device_id, alert_type) -> last_seen_timestamp
        self.dedup_cache = {}
        self.dedup_window_sec = 30.0
        
        # Flapping tracker: (device_id, alert_type) -> list of timestamps
        self.flapping_history = defaultdict(list)
        self.flapping_window_sec = 300.0  # 5 min
        self.flapping_threshold_count = 3

    def process_alert(self, alert: NormalizedAlert) -> tuple[bool, NormalizedAlert]:
        """
        Evaluates an alert against noise reduction heuristics:
        Returns: (is_retained_for_correlation: bool, updated_alert: NormalizedAlert)
        """
        now = alert.timestamp
        cache_key = (alert.device_id, alert.alert_type)
        
        # 1. Self-Healing Pattern Match Check
        for pat in self.historical_patterns:
            if pat.get("always_resolved_without_intervention") and alert.device_id == pat.get("device_id"):
                if alert.alert_type in pat.get("alert_types", []):
                    alert.status = AlertStatus.SELF_HEALING_HOLD
                    heal_sec = pat.get("avg_auto_heal_time_sec", 180)
                    alert.suppression_reason = (
                        f"Matched self-healing pattern [{pat['pattern_id']}]: historically auto-resolves in ~{heal_sec}s. "
                        f"Holding immediate escalation with safety countdown."
                    )
                    return False, alert

        # 2. Deduplication Check (same device + alert within 30s)
        if cache_key in self.dedup_cache:
            last_seen = self.dedup_cache[cache_key]
            if (now - last_seen) < self.dedup_window_sec:
                alert.status = AlertStatus.DEDUPED
                alert.suppression_reason = f"Duplicate alert within {self.dedup_window_sec}s window (previous seen {(now-last_seen):.1f}s ago). Suppressed."
                return False, alert

        self.dedup_cache[cache_key] = now

        # 3. Flapping Detection Check (>3 state changes in 5 min)
        history = self.flapping_history[cache_key]
        # Prune old
        self.flapping_history[cache_key] = [t for t in history if (now - t) < self.flapping_window_sec]
        self.flapping_history[cache_key].append(now)
        
        if len(self.flapping_history[cache_key]) >= self.flapping_threshold_count:
            alert.status = AlertStatus.FLAPPING_SUPPRESSED
            alert.suppression_reason = (
                f"Interface/state flapping detected ({len(self.flapping_history[cache_key])} events in last 5 min). "
                f"Dampening alert to prevent NOC notification fatigue."
            )
            return False, alert

        # 4. Informational Noise Filter
        if alert.severity == SeverityLevel.INFO:
            alert.status = AlertStatus.DEDUPED
            alert.suppression_reason = "Informational telemetry event - filtered from active incident formation."
            return False, alert

        # Alert passed all noise filters! Retain for topological correlation
        alert.status = AlertStatus.NORMALIZED
        return True, alert