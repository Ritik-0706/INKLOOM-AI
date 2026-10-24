from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class MetricCard(BaseModel):
    label: str
    value: Any
    change: Optional[str] = None
    trend: Optional[str] = "neutral" # up, down, neutral

class IssueCategoryBreakdown(BaseModel):
    category: str
    label: str
    count: int
    percentage: float
    color: str

class IssueSeverityBreakdown(BaseModel):
    severity: str
    count: int
    color: str

class ComplianceTrendPoint(BaseModel):
    date: str
    score: float
    review_count: int

class FrequentMistake(BaseModel):
    phrase: str
    occurrences: int
    rule_id: str
    suggestion: str

class AnalyticsOverviewResponse(BaseModel):
    total_reviewed: int
    pending_approvals: int
    critical_issues: int
    average_compliance_score: float
    first_pass_approval_rate: float
    turnaround_time_hours: float
    categories_breakdown: List[IssueCategoryBreakdown]
    severities_breakdown: List[IssueSeverityBreakdown]
    trends: List[ComplianceTrendPoint]
    frequent_mistakes: List[FrequentMistake]
