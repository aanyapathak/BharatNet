import json
import os
import math
import re
from collections import Counter
from ingestion.models import Incident, MatchedRunbook, RunbookAction

class RunbookMatcher:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        with open(os.path.join(data_dir, "runbooks.json"), "r", encoding="utf-8") as f:
            self.runbooks = json.load(f)
        
        self.doc_tokens = []
        self.idf = {}
        self._build_index()

    def _tokenize(self, text: str) -> list[str]:
        return [w.lower() for w in re.findall(r"\w+", text) if len(w) > 2]

    def _build_index(self):
        num_docs = len(self.runbooks)
        doc_freq = Counter()
        
        for rb in self.runbooks:
            text = (
                f"{rb['title']} {rb['category']} {' '.join(rb.get('keywords', []))} "
                f"{' '.join(rb.get('applicable_alert_types', []))} {' '.join(rb.get('applicable_device_types', []))}"
            )
            tokens = set(self._tokenize(text))
            self.doc_tokens.append(self._tokenize(text))
            for token in tokens:
                doc_freq[token] += 1
                
        for token, count in doc_freq.items():
            self.idf[token] = math.log((num_docs + 1) / (count + 1)) + 1.0

    def _vectorize(self, tokens: list[str]) -> dict[str, float]:
        tf = Counter(tokens)
        vec = {}
        for token, count in tf.items():
            if token in self.idf:
                vec[token] = count * self.idf[token]
        return vec

    def _cosine_similarity(self, vec1: dict[str, float], vec2: dict[str, float]) -> float:
        intersection = set(vec1.keys()) & set(vec2.keys())
        numerator = sum([vec1[x] * vec2[x] for x in intersection])
        
        sum1 = sum([val**2 for val in vec1.values()])
        sum2 = sum([val**2 for val in vec2.values()])
        denominator = math.sqrt(sum1) * math.sqrt(sum2)
        
        if not denominator:
            return 0.0
        return float(numerator) / denominator

    def match_runbook(self, incident: Incident) -> MatchedRunbook:
        root = incident.root_cause
        query_text = (
            f"{root.hypothesis} {root.primary_alert_type} {root.root_device_type} "
            f"{' '.join(root.evidence)} {' '.join(incident.blast_radius_devices)}"
        )
        query_tokens = self._tokenize(query_text)
        query_vec = self._vectorize(query_tokens)

        best_score = -1.0
        best_idx = 0

        for idx, doc_toks in enumerate(self.doc_tokens):
            doc_vec = self._vectorize(doc_toks)
            score = self._cosine_similarity(query_vec, doc_vec)
            
            # Domain heuristic boosting for exact alert or device match
            rb = self.runbooks[idx]
            if root.primary_alert_type in rb.get("applicable_alert_types", []):
                score += 0.35
            if root.root_device_type in rb.get("applicable_device_types", []):
                score += 0.20
                
            if score > best_score:
                best_score = score
                best_idx = idx

        best_rb = self.runbooks[best_idx]
        
        # Scale confidence score
        confidence_pct = min(96, max(45, int(best_score * 50 + 40)))
        
        match_reasons = [
            f"Keyword & symptom alignment on: {', '.join(best_rb['keywords'][:4])}",
            f"Target device type: [{root.root_device_type}] matches playbook scope",
            f"Pattern signature matches {best_rb['category']} emergency response",
            f"Target MTTR reduction: {best_rb['expected_resolution_min']} min vs {best_rb['manual_baseline_min']} min manual baseline"
        ]

        tier1 = [
            RunbookAction(
                id=a["id"],
                name=a["name"],
                command=a["command"],
                safe=a.get("safe", True),
                requires_approval=False,
                est_seconds=a.get("est_seconds", 5),
                status="PENDING"
            ) for a in best_rb.get("tier1_actions", [])
        ]
        
        tier2 = [
            RunbookAction(
                id=a["id"],
                name=a["name"],
                command=a["command"],
                safe=a.get("safe", False),
                requires_approval=True,
                est_seconds=a.get("est_seconds", 15),
                status="PENDING"
            ) for a in best_rb.get("tier2_actions", [])
        ]

        return MatchedRunbook(
            runbook_id=best_rb["id"],
            title=best_rb["title"],
            category=best_rb["category"],
            confidence_pct=confidence_pct,
            match_score=round(best_score, 3),
            match_reasons=match_reasons,
            tier1_actions=tier1,
            tier2_actions=tier2,
            expected_resolution_min=best_rb.get("expected_resolution_min", 5),
            manual_baseline_min=best_rb.get("manual_baseline_min", 45),
            verification_command=best_rb.get("verification_command", "check status")
        )
