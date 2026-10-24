import re
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass

@dataclass
class DetectedIssue:
    rule_id: str
    category: str
    severity: str
    excerpt: str
    start_pos: int
    end_pos: int
    explanation: str
    guideline_reference: str
    suggested_correction: str
    confidence: float

class LocalReviewEngine:
    """
    Deterministic, rule-based brand governance review engine.
    Analyzes content against brand voice, terminology, approved facts,
    promotional claims, disclaimers, and accessibility guidelines.
    """

    DEFAULT_PROHIBITED_TERMS = [
        {"term": "cheap", "severity": "medium", "reason": "Devalues the premium brand perception.", "suggestion": "cost-effective or affordable"},
        {"term": "ninja", "severity": "low", "reason": "Outdated informal tech jargon.", "suggestion": "specialist or expert"},
        {"term": "rockstar", "severity": "low", "reason": "Overused startup cliché.", "suggestion": "talented professional"},
        {"term": "100% guaranteed", "severity": "critical", "reason": "Absolute legal liability claim without legal clearance.", "suggestion": "backed by our satisfaction pledge"},
        {"term": "no risk", "severity": "critical", "reason": "Promotional over-promise that triggers compliance risk.", "suggestion": "low barrier to entry"},
        {"term": "unbeatable", "severity": "high", "reason": "Unsubstantiated comparative claim.", "suggestion": "market-leading"},
        {"term": "crush the competition", "severity": "high", "reason": "Aggressive tone contrary to our collaborative brand voice.", "suggestion": "outperform industry benchmarks"}
    ]

    DEFAULT_UNSUPPORTED_PATTERNS = [
        (r"\b#1\b|\bnumber one\b|\bnumber 1\b", "critical", "RULE-UNSUPPORTED-SUPERLATIVE", "Superlative ranking claim '#1' requires accredited third-party verification.", "leading or premier"),
        (r"\bworld['’]s best\b|\bbest in the world\b", "critical", "RULE-UNSUPPORTED-SUPERLATIVE", "Absolute superlative claims cannot be validated without independent audit.", "industry-acclaimed"),
        (r"\bproven to (?:double|triple|quadruple|\d+%)\b", "high", "RULE-UNSUPPORTED-METRIC", "Specific percentage increase claim lacks citation from verified case study.", "shown in recent pilot studies to significantly improve"),
        (r"\bzero downtime\b|\b100% uptime\b", "high", "RULE-UNSUPPORTED-SLA", "Technical uptime claim of 100% contradicts standard SLA specifications.", "99.9% uptime SLA"),
        (r"\bnever fails?\b|\bbulletproof\b", "medium", "RULE-UNSUPPORTED-ABSOLUTE", "Absolute reliability claim creates unrealistic customer expectation.", "highly resilient and reliable"),
        (r"\bguaranteed (?:results|roi|success|revenue)\b", "critical", "RULE-UNSUPPORTED-GUARANTEE", "Commercial financial guarantee prohibited under advertising governance guidelines.", "designed to maximize ROI"),
        (r"\b(\d{1,3}(?:,\d{3})*|\d+)\s*(?:million|billion|k)?\s*(?:users|customers|downloads|clients)\b", "medium", "RULE-METRIC-VERIFICATION", "Specific user/customer count claim must be verified against approved factual database.", "our rapidly expanding customer community")
    ]

    TONE_VIOLATIONS = [
        (r"\b(?:obviously|duh|clearly everyone knows)\b", "medium", "tone_of_voice", "RULE-TONE-CONDESCENDING", "Condescending phrasing contradicts our empathetic and approachable brand voice.", "as demonstrated across industry research"),
        (r"\b(?:hurry up|act now before it's too late|don't miss out)\b", "high", "tone_of_voice", "RULE-TONE-URGENCY", "Aggressive high-pressure sales urgency violates our respectful advisory tone.", "explore how our platform can support your goals"),
        (r"\b(?:synergy|deep dive|move the needle|circle back)\b", "low", "tone_of_voice", "RULE-TONE-JARGON", "Generic corporate jargon dilutes clear, authentic communication.", "align on priorities / examine closely")
    ]

    REQUIRED_DISCLAIMER_TRIGGERS = [
        {"keyword": r"\b(?:investment|returns|yield|financial gain|profit)\b", "required_disclaimer": "Past performance is not indicative of future results.", "name": "Financial Disclosure"},
        {"keyword": r"\b(?:beta|early access|preview version)\b", "required_disclaimer": "Features subject to change prior to general availability.", "name": "Product Beta Notice"},
        {"keyword": r"\b(?:hipaa|gdpr|soc2|compliance certified)\b", "required_disclaimer": "Review our compliance documentation for detailed scope and specifications.", "name": "Regulatory Compliance Reference"}
    ]

    def analyze(self, text: str, brand_profile: Any, content_type: str = "blog", has_visual: bool = False, image_alt: str = "") -> Tuple[float, List[DetectedIssue], str]:
        issues: List[DetectedIssue] = []
        if not text:
            return 100.0, [], "Empty content reviewed."

        # 1. Prohibited Terminology
        prohibited_list = list(self.DEFAULT_PROHIBITED_TERMS)
        if hasattr(brand_profile, "prohibited_terms") and brand_profile.prohibited_terms:
            for item in brand_profile.prohibited_terms:
                if isinstance(item, dict) and "term" in item:
                    prohibited_list.append(item)
                elif isinstance(item, str):
                    prohibited_list.append({"term": item, "severity": "high", "reason": "Listed in brand prohibited terms.", "suggestion": "approved alternative"})

        for item in prohibited_list:
            term = item.get("term", "").strip()
            if not term:
                continue
            pattern = re.compile(rf"\b{re.escape(term)}\b", re.IGNORECASE)
            for match in pattern.finditer(text):
                matched_text = match.group(0)
                issues.append(DetectedIssue(
                    rule_id=f"RULE-PROHIBITED-{re.sub(r'[^a-zA-Z0-9]', '', term).upper()}",
                    category="terminology",
                    severity=item.get("severity", "medium"),
                    excerpt=matched_text,
                    start_pos=match.start(),
                    end_pos=match.end(),
                    explanation=item.get("reason", f"The term '{matched_text}' is prohibited under brand vocabulary rules."),
                    guideline_reference=f"Brand Guideline: Section 2.1 Terminology Governance",
                    suggested_correction=item.get("suggestion", "Use approved terminology instead"),
                    confidence=0.98
                ))

        # 2. Preferred Terminology Replacements
        if hasattr(brand_profile, "preferred_terms") and brand_profile.preferred_terms:
            for pref in brand_profile.preferred_terms:
                if isinstance(pref, dict):
                    target_term = pref.get("term", "")
                    replaces = pref.get("replaces", [])
                    rationale = pref.get("rationale", f"Brand standard is to use '{target_term}'.")
                    for old_word in replaces:
                        pattern = re.compile(rf"\b{re.escape(old_word)}\b", re.IGNORECASE)
                        for match in pattern.finditer(text):
                            issues.append(DetectedIssue(
                                rule_id="RULE-PREFERRED-TERMINOLOGY",
                                category="terminology",
                                severity="low",
                                excerpt=match.group(0),
                                start_pos=match.start(),
                                end_pos=match.end(),
                                explanation=f"'{match.group(0)}' should be standardized to preferred brand term '{target_term}'. {rationale}",
                                guideline_reference="Brand Lexicon & Style Guide",
                                suggested_correction=target_term,
                                confidence=0.92
                            ))

        # 3. Tone of Voice Checks
        for pattern_str, severity, category, rule_id, explanation, suggestion in self.TONE_VIOLATIONS:
            pattern = re.compile(pattern_str, re.IGNORECASE)
            for match in pattern.finditer(text):
                issues.append(DetectedIssue(
                    rule_id=rule_id,
                    category=category,
                    severity=severity,
                    excerpt=match.group(0),
                    start_pos=match.start(),
                    end_pos=match.end(),
                    explanation=explanation,
                    guideline_reference="Brand Voice: Authentic, Empathetic & Professional Tone",
                    suggested_correction=suggestion,
                    confidence=0.89
                ))

        # 4. Potentially Unsupported Claims & Superlatives
        for pattern_str, severity, rule_id, explanation, suggestion in self.DEFAULT_UNSUPPORTED_PATTERNS:
            pattern = re.compile(pattern_str, re.IGNORECASE)
            for match in pattern.finditer(text):
                matched_text = match.group(0)
                # Check if this claim is backed by an approved fact in the brand profile
                is_backed_by_fact = False
                approved_facts = getattr(brand_profile, "approved_facts", []) or []
                for fact in approved_facts:
                    claim_text = fact.get("claim", "") if isinstance(fact, dict) else str(fact)
                    if matched_text.lower() in claim_text.lower():
                        is_backed_by_fact = True
                        break

                if not is_backed_by_fact:
                    issues.append(DetectedIssue(
                        rule_id=rule_id,
                        category="unsupported_claims",
                        severity=severity,
                        excerpt=matched_text,
                        start_pos=match.start(),
                        end_pos=match.end(),
                        explanation=f"{explanation} (No corroborating entry found in approved brand facts)",
                        guideline_reference="Compliance Standard: Substantiation of Marketing Claims",
                        suggested_correction=suggestion,
                        confidence=0.91
                    ))

        # 5. Factual Consistency Check against Brand Knowledge Base
        approved_facts = getattr(brand_profile, "approved_facts", []) or []
        for fact in approved_facts:
            if isinstance(fact, dict):
                # E.g. fact = {"id": "fact-1", "topic": "founded_year", "approved_value": "2021", "claim": "Founded in 2021 in San Francisco", "contradiction_triggers": ["founded in 2018", "founded in 2019", "founded in 2020"]}
                triggers = fact.get("contradiction_triggers", [])
                for trigger in triggers:
                    pattern = re.compile(rf"\b{re.escape(trigger)}\b", re.IGNORECASE)
                    for match in pattern.finditer(text):
                        issues.append(DetectedIssue(
                            rule_id="RULE-FACT-CONTRADICTION",
                            category="factual_accuracy",
                            severity="critical",
                            excerpt=match.group(0),
                            start_pos=match.start(),
                            end_pos=match.end(),
                            explanation=f"Contradicts approved brand fact: '{fact.get('claim')}'. Source: {fact.get('source', 'Brand Verified Facts')}.",
                            guideline_reference=f"Verified Brand Knowledge Base ({fact.get('id', 'Fact Reference')})",
                            suggested_correction=fact.get("claim", "Verified brand fact"),
                            confidence=0.99
                        ))

        # 6. Required Disclaimers
        for item in self.REQUIRED_DISCLAIMER_TRIGGERS:
            keyword_pattern = re.compile(item["keyword"], re.IGNORECASE)
            if keyword_pattern.search(text):
                required_text = item["required_disclaimer"]
                if required_text.lower() not in text.lower():
                    # Flag missing disclaimer
                    issues.append(DetectedIssue(
                        rule_id=f"RULE-MISSING-DISCLAIMER-{item['name'].upper().replace(' ', '-')}",
                        category="policy_violations",
                        severity="high",
                        excerpt="[Content Body - Missing Mandatory Disclaimer]",
                        start_pos=len(text) - 1,
                        end_pos=len(text),
                        explanation=f"Content touches on {item['name'].lower()} concepts but lacks mandatory disclosure: '{required_text}'",
                        guideline_reference="Legal & Regulatory Disclosure Guidelines",
                        suggested_correction=f"\n\nDisclaimer: {required_text}",
                        confidence=0.95
                    ))

        # 7. Accessibility & Visual Requirements
        if has_visual and not image_alt.strip():
            issues.append(DetectedIssue(
                rule_id="RULE-ACCESSIBILITY-MISSING-ALT",
                category="accessibility",
                severity="medium",
                excerpt="[Attached Visual Asset]",
                start_pos=0,
                end_pos=0,
                explanation="Visual asset attached without descriptive alternative text for screen readers (WCAG 2.1 AA requirement).",
                guideline_reference="Digital Accessibility Standard: Non-text Content (SC 1.1.1)",
                suggested_correction="Provide concise alt text describing visual subject matter and brand elements.",
                confidence=1.0
            ))

        # Calculate Compliance Score (100 base, deductions based on severity)
        deductions = {
            "critical": 25.0,
            "high": 15.0,
            "medium": 8.0,
            "low": 3.0,
            "informational": 0.0
        }
        total_deduction = sum(deductions.get(issue.severity, 5.0) for issue in issues)
        score = max(0.0, min(100.0, round(100.0 - total_deduction, 1)))

        # Build Summary
        if not issues:
            summary = "Excellent! Content is 100% compliant with all brand voice, terminology, factual claims, and disclosure standards."
        else:
            crit_count = sum(1 for i in issues if i.severity == "critical")
            high_count = sum(1 for i in issues if i.severity == "high")
            summary = f"Review completed with {len(issues)} item(s) flagged ({crit_count} critical, {high_count} high severity). Review flagged suggestions before submission."

        return score, issues, summary

review_engine = LocalReviewEngine()
