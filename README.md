# BharatNet AIOps NOC Commander

### Topology-Aware Network Operations Intelligence for Telecom Incident Response

**BharatNet AIOps NOC Commander** is a telecom AIOps platform designed to transform large volumes of network alerts into explainable incidents. It combines alert normalization, noise reduction, temporal and topology-aware correlation, root-cause analysis, blast-radius analysis, business-impact estimation, escalation, runbooks, remediation, and recovery verification.

> **Thousands of network alerts should become one explainable incident.**

| | |
|---|---|
| **Status** | Prototype / Hackathon Demonstration |
| **Domain** | Telecom AIOps / Network Operations |
| **Core Focus** | Alert Correlation, Root Cause, Blast Radius, Business Impact, Runbooks |

---

## Overview

A single telecom failure can generate hundreds or thousands of downstream alerts. **BharatNet focuses on identifying the event that actually matters** instead of treating every symptom as an independent failure.

---

## Core Pipeline

```
Telemetry
   ↓
Alert Normalization
   ↓
Noise Reduction
   ↓
Temporal + Topology Correlation
   ↓
Root Cause Analysis
   ↓
Blast Radius
   ↓
Business Impact
   ↓
Escalation
   ↓
Runbook
   ↓
Controlled Remediation
   ↓
Recovery Verification
   ↓
Operator Explanation
```

---

## Architecture

```
                    NETWORK TELEMETRY
                           |
                           v
                  +------------------+
                  | Alert Ingestion  |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | Noise Reduction  |
                  | Dedup / Flapping |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | Correlation       |
                  | Time + Topology   |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | Incident Engine   |
                  +--------+---------+
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
        Root Cause    Blast Radius   Severity
             |             |             |
             +-------------+-------------+
                           |
                           v
                  +------------------+
                  | Business Impact  |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | Escalation       |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | Runbook Engine   |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | Remediation      |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | Recovery Verify  |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | AI Explanation   |
                  +------------------+
```

---

## Key Features

### Alert Intelligence
- **Alert normalization**
- **Duplicate detection**
- **Flapping suppression**
- **Temporal correlation**
- **Topology-aware correlation**
- **Incident grouping**

### Root Cause Analysis

The network is modeled as a **directed NetworkX graph**. The engine combines:

- Alert type
- Device hierarchy
- Topological position
- Upstream/downstream dependencies
- Time relationships

This allows multiple downstream symptoms to be associated with a probable upstream failure.

**Example:**

```
LINK DOWN
   +
OSPF LOST
   +
BGP DROP
   +
PACKET LOSS
   +
TOPOLOGY DEPENDENCY
   =
UPSTREAM FAILURE
```

### Blast Radius

Graph traversal identifies downstream devices and services affected by a probable root cause.

```
Root Device
    ↓
Core
    ↓
Aggregation
    ↓
Access
    ↓
Services
    ↓
Customers
```

### Business Impact

The dashboard provides modelled operational exposure such as:

- Impact per second
- Impact per minute
- Impact over time
- Affected services
- Estimated loss
- Estimated loss avoided through faster recovery

> **Note:** Financial values in the prototype are demonstration/modelled values and are not claimed to represent actual operator revenue.

### Escalation and Runbooks

Incidents are evaluated against predefined **escalation policies** and matched with operational **runbooks**.

Runbooks contain:

- Runbook ID
- Category
- Match confidence
- Recommended actions
- Estimated resolution time
- Verification command

### Recovery Verification

Recovery follows the operational state:

**`CRITICAL → DEGRADED → HEALTHY`**

The incident is **not** considered fully recovered simply because a remediation action was triggered.

---

## AI and Gemini

BharatNet follows the principle:

> **Deterministic where reliability matters. AI where intelligence adds value.**

Critical network reasoning is deterministic in the current prototype:

| Function | Approach |
|---|---|
| Alert processing | Rule-based |
| Noise reduction | Deterministic |
| Correlation | Temporal + topology |
| Network model | NetworkX graph |
| Root cause | Graph + heuristic rules |
| Blast radius | Graph traversal |
| Severity | Rule-based |
| Escalation | Policy-based |
| Runbooks | Rule-based |
| Remediation control | Controlled workflow |
| Explanation | Gemini/LLM architecture |

**Current prototype status:** the project does not make a live Gemini API request. The explanation layer is currently represented through structured application logic. A production Gemini integration can consume the deterministic incident state without receiving unrestricted network control.

---

## Safety Model

> **AI should not have unrestricted access to network operations.**

```
                AI / Gemini
                    |
                    v
             Explanation Layer
                    |
                    v
           Policy / Validation
              /          \
             v            v
       Safe Action    High-Risk Action
          Execute       Approval
```

Network-changing actions should remain behind **authorization, validation, allowlists, and engineer approval**.

---

## Real vs Simulated Data

The prototype deliberately separates public data from simulated operational data.

### Simulated
- Network topology
- Incident telemetry
- Alert storms
- Subscriber impact
- Business exposure
- Financial impact
- Recovery scenarios

### Public / External
The project can use public environmental information for Mumbai and references publicly available Indian telecom performance data such as **TRAI reports**.

> Public telecom reports are treated as reference/baseline data, **not** as live private operator telemetry. This distinction is important because real telecom OSS/BSS telemetry and network topology are generally proprietary.

---

## Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- Recharts

### Backend
- Python
- FastAPI
- Pydantic
- NetworkX
- REST APIs
- WebSockets

### Visualization
- SVG / Canvas
- Recharts
- Leaflet
- OpenStreetMap-based map tiles

### Data
- JSON configuration files
- In-memory application state
- Simulated network state

---

## Project Structure

```
BharatNet/
├── backend/
│   ├── data/
│   │   ├── topology.json
│   │   ├── services.json
│   │   ├── historical_incidents.json
│   │   ├── runbooks.json
│   │   └── escalation_policy.json
│   ├── ingestion/
│   │   ├── alert_generator.py
│   │   └── models.py
│   ├── pipeline/
│   │   ├── correlator.py
│   │   └── noise_reducer.py
│   ├── runbook/
│   │   ├── matcher.py
│   │   └── executor.py
│   ├── escalation/
│   │   └── escalation_engine.py
│   ├── metrics/
│   │   └── tracker.py
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## Running Locally

### Requirements
- Python 3.10+
- Node.js 18+
- npm

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL provided by Vite.

---

## Demo: Mumbai Fiber Cut

The primary demonstration simulates an upstream Mumbai network failure.

**Normal State**
The network operates normally with background telemetry.

**Failure**
An upstream element such as `ER-MUM-01` experiences an uplink/fiber-related failure.

**Alert Storm**
The failure produces symptoms such as:
- `LINK DOWN`
- `OSPF LOSS`
- `BGP DROP`
- `PACKET LOSS`
- `INTERFACE FLAPPING`
- `SERVICE TIMEOUT`

**Correlation**

```
1000+ Alerts
      ↓
Noise Reduction
      ↓
Correlation
      ↓
One Incident
```

**Root Cause**
The system identifies a probable upstream failure and presents supporting evidence.

**Blast Radius**
The topology graph determines affected downstream network elements and services.

**Business Impact**
The dashboard estimates modelled financial exposure while the incident remains active.

**Recovery**
The runbook workflow moves the network toward recovery and verifies the resulting state.

---

## API

| Endpoint | Purpose |
|---|---|
| `GET /api/topology` | Network topology |
| `GET /api/services` | Service definitions |
| `GET /api/incidents` | Current incidents |
| `GET /api/metrics` | Operational metrics |
| `POST /api/scenarios/fiber-cut` | Start fiber-cut simulation |
| `POST /api/scenarios/predictive` | Trigger predictive scenario |
| `POST /api/scenarios/reset` | Reset network state |
| `POST /api/runbook/execute` | Execute runbook action |
| `POST /api/incidents/acknowledge` | Acknowledge incident |
| `POST /api/feedback` | Submit feedback |
| `WS /ws/telemetry` | Real-time telemetry updates |

---

## Why BharatNet?

Traditional monitoring systems are excellent at **detecting** events, but an NOC engineer still needs to determine **how those events relate to each other**.

BharatNet focuses on the transition:

```
Alert Monitoring
       ↓
Incident Intelligence
       ↓
Root Cause
       ↓
Impact
       ↓
Action
       ↓
Recovery
```

**Key differentiators:**

- **Incident-centric** operations rather than alert-centric monitoring
- **Topology-aware correlation** using a network dependency graph
- **Explainable root-cause reasoning** with supporting evidence
- **Business-aware impact analysis**
- **Controlled remediation** instead of unrestricted AI actions

---

## Current Limitations

This is a prototype / hackathon implementation.

- Network telemetry is simulated
- Topology is demonstration data
- Financial impact is modelled
- Subscriber impact is estimated
- Gemini is not currently invoked through a live API
- Public telecom data is a reference source rather than private live telemetry
- Current state is primarily JSON/in-memory rather than a production telemetry database
- Production authentication, authorization, audit logging, tenant isolation, and hardened infrastructure require further implementation

---

## Future Scope

Potential production extensions include:

- SNMP / Syslog / NetFlow integration
- Streaming telemetry and gNMI
- Kafka-based event pipelines
- Live OSS/BSS integration
- Real operator topology
- Anomaly detection
- Failure prediction
- Time-series forecasting
- Probabilistic root-cause ranking
- Production database and observability
- RBAC and multi-tenant deployment
- SSO and audit logging
- Production Gemini integration
- Kubernetes-based deployment

---

## Project Status

**Prototype / Hackathon Demonstration**

BharatNet demonstrates an end-to-end topology-aware AIOps workflow for telecom incident intelligence using controlled simulation, deterministic reasoning, operational runbooks, business-impact modelling, and an AI explanation architecture.

> **Observe. Correlate. Reason. Act. Verify. Explain.**
