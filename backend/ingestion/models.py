from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
import time

class SeverityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"

class AlertStatus(str, Enum):
    RAW = "RAW"
    NORMALIZED = "NORMALIZED"
    DEDUPED = "DEDUPED"
    FLAPPING_SUPPRESSED = "FLAPPING_SUPPRESSED"
    SELF_HEALING_HOLD = "SELF_HEALING_HOLD"
    CORRELATED = "CORRELATED"
    PROCESSED = "PROCESSED"

class NormalizedAlert(BaseModel):
    alert_id: str
    timestamp: float = Field(default_factory=time.time)
    formatted_time: str
    device_id: str
    device_name: str
    device_type: str
    location: str
    alert_type: str
    severity: SeverityLevel
    metric_name: Optional[str] = None
    metric_value: Optional[Any] = None
    threshold: Optional[Any] = None
    oid: Optional[str] = None
    description: str
    source_protocol: str  # SNMP_TRAP, SYSLOG, NETFLOW, PROMETHEUS
    status: AlertStatus = AlertStatus.NORMALIZED
    suppression_reason: Optional[str] = None
    incident_id: Optional[str] = None
    is_root_cause_candidate: bool = False

class IncidentStatus(str, Enum):
    OPEN = "OPEN"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    REMEDIATING = "REMEDIATING"
    RESOLVED = "RESOLVED"

class RootCauseAnalysis(BaseModel):
    root_device_id: str
    root_device_name: str
    root_device_type: str
    primary_alert_type: str
    hypothesis: str
    confidence_pct: int
    evidence: List[str]
    topology_depth: int
    explanation_text: str

class RunbookAction(BaseModel):
    id: str
    name: str
    command: str
    safe: bool = True
    requires_approval: bool = False
    est_seconds: int = 5
    status: str = "PENDING"  # PENDING, RUNNING, COMPLETED, FAILED
    executed_at: Optional[float] = None
    output_log: Optional[str] = None

class MatchedRunbook(BaseModel):
    runbook_id: str
    title: str
    category: str
    confidence_pct: int
    match_score: float
    match_reasons: List[str]
    tier1_actions: List[RunbookAction]
    tier2_actions: List[RunbookAction]
    expected_resolution_min: int
    manual_baseline_min: int
    verification_command: str

class EscalationNotification(BaseModel):
    step: int
    timestamp: float
    formatted_time: str
    role: str
    contact: str
    channels: List[str]
    action_required: str
    status: str = "DELIVERED"  # DELIVERED, ACKNOWLEDGED, ESCALATED

class Incident(BaseModel):
    incident_id: str
    title: str
    created_at: float
    formatted_created_at: str
    severity: SeverityLevel
    status: IncidentStatus = IncidentStatus.OPEN
    root_cause: Optional[RootCauseAnalysis] = None
    blast_radius_devices: List[str] = []
    affected_services: List[Dict[str, Any]] = []
    total_subscribers_impacted: int = 0
    revenue_loss_rate_inr_per_sec: float = 0.0
    accumulated_loss_inr: float = 0.0
    correlated_alert_ids: List[str] = []
    correlated_alerts_count: int = 0
    correlation_reasoning: str = ""
    runbook: Optional[MatchedRunbook] = None
    escalation_log: List[EscalationNotification] = []
    current_escalation_step: int = 1
    time_to_detect_sec: float = 0.0
    time_to_resolve_sec: Optional[float] = None
    resolved_at: Optional[float] = None
    remediation_log: List[str] = []