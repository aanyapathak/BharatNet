import random
import time
import json
import os
from datetime import datetime
from ingestion.models import NormalizedAlert, SeverityLevel, AlertStatus

class AlertGenerator:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        with open(os.path.join(data_dir, "topology.json"), "r", encoding="utf-8") as f:
            self.topology = json.load(f)
        self.nodes_by_id = {n["id"]: n for n in self.topology["nodes"]}
        self.alert_counter = 1000

    def _next_alert_id(self, prefix="ALT"):
        self.alert_counter += 1
        now_str = datetime.now().strftime("%Y%m%d")
        return f"{prefix}-{now_str}-{self.alert_counter:05d}"

    def generate_random_background_alert(self) -> NormalizedAlert:
        """Generates ambient telecom noise, routine warnings, or flapping events."""
        noise_types = [
            ("cpu_utilization_warning", "High CPU Load", SeverityLevel.LOW, "PROMETHEUS", "1.3.6.1.4.1.9.9.109.1.1.1.1.3", "CPU utilization at 74% due to routine cron telemetry polling"),
            ("bgp_keepalive_timeout_transient", "BGP Keepalive Jitter", SeverityLevel.INFO, "SYSLOG", "1.3.6.1.2.1.15.3.1.2", "Transient BGP keepalive delay < 200ms with peer"),
            ("temp_sensor_elevated", "Chassis Temp Ambient Elevated", SeverityLevel.LOW, "SNMP_TRAP", "1.3.6.1.4.1.9.9.13.1.3.1.3", "Thermal sensor reading 38C within acceptable ceiling"),
            ("link_flapping", "Access Port Flap (Self-Healing)", SeverityLevel.MEDIUM, "SNMP_TRAP", "1.3.6.1.6.3.1.1.5.3", "Link status toggled state (carrier loss/regain cycle 2)"),
            ("disk_space_warning", "Disk Spool Threshold Warning", SeverityLevel.LOW, "PROMETHEUS", "1.3.6.1.4.1.2021.9.1.9", "/var/log spool partition utilization at 79%"),
            ("interface_err_counters", "CRC Inbound Packet Frame Error", SeverityLevel.INFO, "NETFLOW", "1.3.6.1.2.1.2.2.1.14", "Inbound CRC frame error count incremented by 12 pkts")
        ]
        
        # Pick random node
        node = random.choice(self.topology["nodes"])
        alert_choice = random.choice(noise_types)
        
        now = time.time()
        formatted_time = datetime.fromtimestamp(now).strftime("%H:%M:%S.%f")[:-3]
        
        return NormalizedAlert(
            alert_id=self._next_alert_id("BG"),
            timestamp=now,
            formatted_time=formatted_time,
            device_id=node["id"],
            device_name=node["name"],
            device_type=node["type"],
            location=node["location"],
            alert_type=alert_choice[0],
            severity=alert_choice[2],
            oid=alert_choice[4],
            description=f"[{node['id']}] {alert_choice[5]}",
            source_protocol=alert_choice[3],
            status=AlertStatus.NORMALIZED
        )

    def generate_fiber_cut_storm_sequence(self) -> list[dict]:
        """Generates the scripted Mumbai Dark Fiber Cut cascade on ER-MUM-01."""
        events = []
        
        # T+0s: Root Cause event on ER-MUM-01
        events.append({
            "delay_sec": 0.0,
            "device_id": "ER-MUM-01",
            "alert_type": "link_down",
            "severity": SeverityLevel.CRITICAL,
            "source_protocol": "SNMP_TRAP",
            "oid": "1.3.6.1.6.3.1.1.5.3",
            "description": "CRITICAL: GigabitEthernet0/0/1 line protocol DOWN (Carrier Loss / Optical Rx Dark -inf dBm)",
            "is_root": True
        })
        
        # T+1.2s: OSPF loss on ER-MUM-01
        events.append({
            "delay_sec": 1.2,
            "device_id": "ER-MUM-01",
            "alert_type": "ospf_nbr_down",
            "severity": SeverityLevel.CRITICAL,
            "source_protocol": "SYSLOG",
            "oid": "1.3.6.1.2.1.14.10.1.6",
            "description": "OSPF-5-ADJCHANGE: Nbr 10.50.1.1 on GigabitEthernet0/0/1 from FULL to DOWN, Dead timer expired",
            "is_root": False
        })
        
        # T+2.5s: BGP peering session down
        events.append({
            "delay_sec": 2.5,
            "device_id": "ER-MUM-01",
            "alert_type": "bgp_session_down",
            "severity": SeverityLevel.CRITICAL,
            "source_protocol": "SYSLOG",
            "oid": "1.3.6.1.2.1.15.3.1.2",
            "description": "BGP-5-ADJCHANGE: Neighbor 103.45.12.2 (AS 64512) Down - Interface link down",
            "is_root": False
        })
        
        # T+4.0s: Core Switch CS-MUM-01 detects upstream transit failure
        events.append({
            "delay_sec": 4.0,
            "device_id": "CS-MUM-01",
            "alert_type": "carrier_loss",
            "severity": SeverityLevel.CRITICAL,
            "source_protocol": "SNMP_TRAP",
            "oid": "1.3.6.1.2.1.2.2.1.8",
            "description": "Core Trunk Port Ethernet1/1 Inbound Optical Power dropped to -32.4 dBm",
            "is_root": False
        })
        
        # T+5.5s: Firewall FW-MUM-01 reports transit disruption
        events.append({
            "delay_sec": 5.5,
            "device_id": "FW-MUM-01",
            "alert_type": "transit_lost",
            "severity": SeverityLevel.HIGH,
            "source_protocol": "SYSLOG",
            "oid": "1.3.6.1.4.1.25461.2.1.3",
            "description": "Default Gateway 10.50.0.1 Unreachable - Security Zone Internet Dropping Outbound SYN",
            "is_root": False
        })
        
        # T+7.0s: Aggregation Switches detect packet loss
        events.append({
            "delay_sec": 7.0,
            "device_id": "AS-MUM-01",
            "alert_type": "packet_loss_critical",
            "severity": SeverityLevel.HIGH,
            "source_protocol": "NETFLOW",
            "oid": "1.3.6.1.4.1.9.9.276",
            "description": "Core Uplink TenGigabitEthernet1/0/1 Packet Loss > 98.4% to Gateway",
            "is_root": False
        })
        events.append({
            "delay_sec": 8.0,
            "device_id": "AS-MUM-02",
            "alert_type": "packet_loss_critical",
            "severity": SeverityLevel.HIGH,
            "source_protocol": "NETFLOW",
            "oid": "1.3.6.1.4.1.9.9.276",
            "description": "Core Uplink TenGigabitEthernet1/0/1 Packet Loss > 99.1% to Gateway",
            "is_root": False
        })
        events.append({
            "delay_sec": 9.2,
            "device_id": "AS-MUM-03",
            "alert_type": "packet_loss_critical",
            "severity": SeverityLevel.CRITICAL,
            "source_protocol": "NETFLOW",
            "oid": "1.3.6.1.4.1.9.9.276",
            "description": "Datacenter Spine Fabric Uplink Loss - Server Cluster Isolated",
            "is_root": False
        })
        
        # T+11.0s: 5G BTS Cell Outages (Child noise)
        events.append({
            "delay_sec": 11.0,
            "device_id": "BTS-MUM-01",
            "alert_type": "s1_c_link_failure",
            "severity": SeverityLevel.CRITICAL,
            "source_protocol": "SNMP_TRAP",
            "oid": "1.3.6.1.4.1.193.183.1",
            "description": "BKC 5G Radio Hub S1-MME Control Link Disconnected - 42,000 active subscribers affected",
            "is_root": False
        })
        events.append({
            "delay_sec": 12.5,
            "device_id": "BTS-MUM-02",
            "alert_type": "s1_c_link_failure",
            "severity": SeverityLevel.HIGH,
            "source_protocol": "SNMP_TRAP",
            "oid": "1.3.6.1.4.1.193.183.1",
            "description": "Colaba 5G Radio Hub S1-MME Control Link Disconnected - 31,000 active subscribers affected",
            "is_root": False
        })
        events.append({
            "delay_sec": 13.8,
            "device_id": "BTS-MUM-03",
            "alert_type": "cell_unavailable",
            "severity": SeverityLevel.HIGH,
            "source_protocol": "SNMP_TRAP",
            "oid": "1.3.6.1.4.1.193.183.1",
            "description": "Andheri Tech Park 5G Sectors Alpha/Beta/Gamma down due to backhaul packet starvation",
            "is_root": False
        })
        events.append({
            "delay_sec": 15.0,
            "device_id": "BTS-MUM-04",
            "alert_type": "cell_unavailable",
            "severity": SeverityLevel.HIGH,
            "source_protocol": "SNMP_TRAP",
            "oid": "1.3.6.1.4.1.193.183.1",
            "description": "Powai Campus 5G Cell Unreachable",
            "is_root": False
        })
        events.append({
            "delay_sec": 16.2,
            "device_id": "BSC-MUM-01",
            "alert_type": "subscriber_mass_drop",
            "severity": SeverityLevel.CRITICAL,
            "source_protocol": "SYSLOG",
            "oid": "1.3.6.1.4.1.94.1.16",
            "description": "Mass Subscriber VoLTE PDP Context Deregistration Event (>100,000 drops/min)",
            "is_root": False
        })
        
        # T+18.0s: Datacenter Application & Service Gateway Failures
        events.append({
            "delay_sec": 18.0,
            "device_id": "SRV-PAY-01",
            "alert_type": "http_504_gateway_timeout",
            "severity": SeverityLevel.CRITICAL,
            "source_protocol": "PROMETHEUS",
            "oid": "1.3.6.1.4.1.2021.13.15",
            "description": "UPI Payment Gateway Inbound HTTP 504 Gateway Timeout Rate = 99.8% (₹8,540/sec loss)",
            "is_root": False
        })
        events.append({
            "delay_sec": 19.5,
            "device_id": "SRV-AUTH-01",
            "alert_type": "aaa_radius_server_unreachable",
            "severity": SeverityLevel.CRITICAL,
            "source_protocol": "PROMETHEUS",
            "oid": "1.3.6.1.4.1.2021.13.15",
            "description": "HLR/HSS Subscriber Auth AAA Response Timeout to National Core (₹3,800/sec loss)",
            "is_root": False
        })
        events.append({
            "delay_sec": 21.0,
            "device_id": "SRV-DNS-01",
            "alert_type": "dns_latency_critical",
            "severity": SeverityLevel.HIGH,
            "source_protocol": "PROMETHEUS",
            "oid": "1.3.6.1.4.1.2021.13.15",
            "description": "Recursive DNS Resolution Query Drop Rate > 90%",
            "is_root": False
        })
        events.append({
            "delay_sec": 22.5,
            "device_id": "SRV-SMS-01",
            "alert_type": "svc_timeout",
            "severity": SeverityLevel.HIGH,
            "source_protocol": "PROMETHEUS",
            "oid": "1.3.6.1.4.1.2021.13.15",
            "description": "Banking OTP Delivery Queue Backpressure > 50,000 queued SMS",
            "is_root": False
        })
        events.append({
            "delay_sec": 24.0,
            "device_id": "OLT-MUM-01",
            "alert_type": "link_down",
            "severity": SeverityLevel.MEDIUM,
            "source_protocol": "SNMP_TRAP",
            "oid": "1.3.6.1.6.3.1.1.5.3",
            "description": "FTTH GPON Optical Uplink Down - 18,000 Broadband subscribers offline",
            "is_root": False
        })

        # Add 15 downstream duplicate & flapping noise echoes
        noise_echo_devices = ["AS-MUM-01", "AS-MUM-02", "BTS-MUM-01", "BTS-MUM-02", "BTS-MUM-03", "SRV-PAY-01", "SRV-AUTH-01"]
        for i in range(15):
            d_id = random.choice(noise_echo_devices)
            events.append({
                "delay_sec": 25.0 + (i * 1.5),
                "device_id": d_id,
                "alert_type": random.choice(["snmp_timeout", "packet_loss_critical", "interface_flapping", "keepalive_expired"]),
                "severity": random.choice([SeverityLevel.HIGH, SeverityLevel.MEDIUM, SeverityLevel.LOW]),
                "source_protocol": random.choice(["SNMP_TRAP", "SYSLOG"]),
                "oid": "1.3.6.1.6.3.1.1.5.3",
                "description": f"[{d_id}] Redundant downstream telemetry alarm: link jitter / TCP socket retry timeout",
                "is_root": False
            })
            
        return events

    def generate_predictive_drift_alert(self) -> NormalizedAlert:
        """Generates a pre-failure optical power drift warning on ER-MUM-01."""
        node = self.nodes_by_id["ER-MUM-01"]
        now = time.time()
        return NormalizedAlert(
            alert_id=self._next_alert_id("PRED"),
            timestamp=now,
            formatted_time=datetime.fromtimestamp(now).strftime("%H:%M:%S.%f")[:-3],
            device_id=node["id"],
            device_name=node["name"],
            device_type=node["type"],
            location=node["location"],
            alert_type="optical_rx_power_drift_warning",
            severity=SeverityLevel.HIGH,
            metric_name="Optical_Rx_Power_dBm",
            metric_value=-22.4,
            threshold=-23.0,
            oid="1.3.6.1.4.1.9.9.91.1.1.1.1.4",
            description="PREDICTIVE ANOMALY: Optical Rx power decaying at -0.8 dBm/hr (current -22.4 dBm, critical cutoff -23.0 dBm). Estimated hard failure in ~85 minutes.",
            source_protocol="PROMETHEUS",
            status=AlertStatus.NORMALIZED
        )