import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timezone, timedelta
from app.db.session import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.organization import Organization
from app.models.user import User
from app.models.brand import BrandProfile
from app.models.content import ContentItem, ContentVersion
from app.models.review import ReviewSession, ReviewIssue
from app.models.approval import ApprovalRequest
from app.models.comment import ContentComment
from app.models.audit_log import AuditLog
from app.models.notification import Notification

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for clean demo
    db.query(Notification).delete()
    db.query(AuditLog).delete()
    db.query(ContentComment).delete()
    db.query(ApprovalRequest).delete()
    db.query(ReviewIssue).delete()
    db.query(ReviewSession).delete()
    db.query(ContentVersion).delete()
    db.query(ContentItem).delete()
    db.query(BrandProfile).delete()
    db.query(User).delete()
    db.query(Organization).delete()
    db.commit()

    print("Seeding Inkloom AI database...")

    # 1. Organization
    org = Organization(
        name="Luminary Cloud Technologies",
        slug="luminary-cloud",
        plan="Enterprise Scale"
    )
    db.add(org)
    db.commit()
    db.refresh(org)

    # 2. Users with diverse roles
    default_pw = get_password_hash("password123")
    
    admin_user = User(
        organization_id=org.id,
        email="admin@inkloom.ai",
        hashed_password=default_pw,
        full_name="Sarah Chen (Admin)",
        role="admin",
        title="Head of Brand Architecture",
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    )
    approver_user = User(
        organization_id=org.id,
        email="approver@inkloom.ai",
        hashed_password=default_pw,
        full_name="Marcus Vance (Approver)",
        role="approver",
        title="VP of Global Marketing",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    )
    manager_user = User(
        organization_id=org.id,
        email="manager@inkloom.ai",
        hashed_password=default_pw,
        full_name="Elena Rostova (Manager)",
        role="manager",
        title="Content Strategy Director",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    )
    creator_user = User(
        organization_id=org.id,
        email="creator@inkloom.ai",
        hashed_password=default_pw,
        full_name="Alex Rivera (Creator)",
        role="creator",
        title="Senior Tech Copywriter",
        avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    )

    db.add_all([admin_user, approver_user, manager_user, creator_user])
    db.commit()
    db.refresh(admin_user)
    db.refresh(approver_user)
    db.refresh(manager_user)
    db.refresh(creator_user)

    # 3. Brand Profiles
    brand1 = BrandProfile(
        organization_id=org.id,
        name="Luminary Cloud",
        slug="luminary-cloud",
        description="Next-generation distributed cloud computing platform for modern enterprise workloads.",
        industry="Enterprise Cloud & AI",
        version=2,
        tone_voice="Authoritative, optimistic, crystal-clear, and consultative. We speak with confidence and clarity, avoiding jargon and sensationalism.",
        tone_rules=[
            {"rule": "No condescending phrasing", "description": "Never use 'obviously', 'duh', or imply readers lack standard industry knowledge."},
            {"rule": "Empowering over aggressive", "description": "Highlight collaborative growth instead of combatting or 'crushing' competition."},
            {"rule": "Clear and concise", "description": "Prefer concrete terms over buzzwords like 'synergy' and 'deep dive'."}
        ],
        preferred_terms=[
            {"term": "specialist", "replaces": ["ninja", "rockstar", "guru"], "rationale": "Maintains corporate dignity and tech authority."},
            {"term": "cost-effective", "replaces": ["cheap"], "rationale": "Protects premium enterprise perception."},
            {"term": "premier platform", "replaces": ["best in the world"], "rationale": "Adheres to advertising substantiation requirements."}
        ],
        prohibited_terms=[
            {"term": "cheap", "severity": "medium", "reason": "Devalues the premium brand perception.", "suggestion": "cost-effective or affordable"},
            {"term": "ninja", "severity": "low", "reason": "Outdated informal tech jargon.", "suggestion": "specialist or expert"},
            {"term": "rockstar", "severity": "low", "reason": "Overused startup cliché.", "suggestion": "talented professional"},
            {"term": "100% guaranteed", "severity": "critical", "reason": "Creates unrestricted legal liability without indemnification.", "suggestion": "backed by our satisfaction commitment"},
            {"term": "no risk", "severity": "critical", "reason": "Regulatory noncompliance under commercial trade laws.", "suggestion": "streamlined adoption"},
            {"term": "unbeatable", "severity": "high", "reason": "Unsubstantiated comparative claim.", "suggestion": "market-leading"},
            {"term": "crush the competition", "severity": "high", "reason": "Overly combative tone contrary to brand guidelines.", "suggestion": "outperform industry benchmarks"}
        ],
        approved_facts=[
            {
                "id": "FACT-001",
                "topic": "founding",
                "claim": "Luminary Cloud was founded in 2021 by veterans of distributed systems.",
                "source": "Corporate Governance Dossier 2024",
                "category": "corporate",
                "contradiction_triggers": ["founded in 2018", "founded in 2019", "founded in 2015"]
            },
            {
                "id": "FACT-002",
                "topic": "scale",
                "claim": "Luminary Cloud manages over 45,000 active enterprise workloads across 18 regions.",
                "source": "Q2 Infrastructure Audit",
                "category": "infrastructure",
                "contradiction_triggers": ["millions of workloads", "100 regions"]
            },
            {
                "id": "FACT-003",
                "topic": "sla",
                "claim": "Our enterprise SLA guarantees 99.99% high-availability uptime.",
                "source": "Master Services Agreement (MSA v4)",
                "category": "legal",
                "contradiction_triggers": ["100% uptime", "zero downtime"]
            }
        ],
        brand_colors=[
            {"name": "Violet Royal", "hex": "#7657F6", "type": "primary"},
            {"name": "Electric Blue", "hex": "#478BFF", "type": "secondary"},
            {"name": "Mint Emerald", "hex": "#53D6B0", "type": "accent"},
            {"name": "Coral Glow", "hex": "#FF7B72", "type": "highlight"},
            {"name": "Deep Indigo", "hex": "#242044", "type": "text"}
        ],
        typography={
            "headings": "Plus Jakarta Sans, sans-serif",
            "body": "Inter, sans-serif",
            "min_font_size": 14
        },
        logo_guidelines="Always maintain 24px exclusion padding around the logo. Never place on unapproved high-contrast backgrounds.",
        content_restrictions=["No political commentary", "Never guarantee financial ROI without disclosure", "No unverified benchmark claims"],
        accessibility_reqs=["WCAG 2.1 AA compliant", "Descriptive alt text for all diagrams", "Minimum color contrast ratio 4.5:1"],
        required_disclaimers=[
            {"name": "Beta Disclosure", "keyword": "beta", "required_disclaimer": "Features subject to change prior to general availability."}
        ]
    )

    brand2 = BrandProfile(
        organization_id=org.id,
        name="Apex Financial AI",
        slug="apex-financial",
        description="Algorithmic portfolio risk intelligence and institutional financial reporting.",
        industry="FinTech & WealthTech",
        version=1,
        tone_voice="Rigorous, analytical, transparent, and compliant with FINRA/SEC advertising standards.",
        prohibited_terms=[
            {"term": "guaranteed returns", "severity": "critical", "reason": "Illegal under SEC marketing rules.", "suggestion": "historically backtested models"},
            {"term": "free money", "severity": "critical", "reason": "Deceptive trade practice.", "suggestion": "optimized yield"}
        ],
        brand_colors=[
            {"name": "Deep Emerald", "hex": "#1E5E4E", "type": "primary"},
            {"name": "Gold Accent", "hex": "#E5A93C", "type": "secondary"}
        ]
    )

    db.add_all([brand1, brand2])
    db.commit()
    db.refresh(brand1)
    db.refresh(brand2)

    # 4. Realistic Content Items
    # Content 1: Blog with issues ready for review in the studio
    content1 = ContentItem(
        organization_id=org.id,
        brand_id=brand1.id,
        creator_id=creator_user.id,
        title="Introducing Luminary Cloud Mesh: The Future of Distributed Compute",
        content_type="blog",
        status="draft",
        current_version_number=1,
        latest_score=68.5
    )
    db.add(content1)
    db.commit()
    db.refresh(content1)

    c1_text = """Today, we are thrilled to unveil Luminary Cloud Mesh, the world's best distributed computing infrastructure designed to crush the competition.

Obviously, traditional cloud architectures are obsolete. While legacy providers offer cheap solutions that fail under load, Luminary delivers 100% uptime with zero downtime across any multi-cloud cluster. 

Our engineering rockstar team founded in 2018 has built a platform proven to double your developer velocity with no risk. With over 2 million customers already onboarded, we offer 100% guaranteed reliability for all enterprise workloads.

Try our beta version today and experience the unbeatable speed of modern cloud intelligence."""

    v1_1 = ContentVersion(
        content_id=content1.id,
        version_number=1,
        text_content=c1_text,
        change_summary="Initial marketing draft written by copywriter",
        created_by_id=creator_user.id
    )
    db.add(v1_1)
    db.commit()
    db.refresh(v1_1)

    # Review session for content 1
    rev1 = ReviewSession(
        organization_id=org.id,
        content_id=content1.id,
        content_version_id=v1_1.id,
        brand_id=brand1.id,
        compliance_score=68.5,
        engine_type="local_deterministic",
        status="critical_flags",
        critical_count=4,
        high_count=3,
        medium_count=2,
        low_count=1,
        summary="Found 10 governance issues including 4 critical claims: unverified 'world's best', 100% uptime violation, unbacked 'no risk', and fact contradiction on founding date."
    )
    db.add(rev1)
    db.commit()
    db.refresh(rev1)

    issues1 = [
        ReviewIssue(
            review_id=rev1.id,
            rule_id="RULE-UNSUPPORTED-SUPERLATIVE",
            category="unsupported_claims",
            severity="critical",
            excerpt="world's best",
            start_pos=64,
            end_pos=76,
            explanation="Superlative ranking claim 'world's best' requires accredited third-party verification and violates brand guidelines.",
            guideline_reference="Compliance Standard: Marketing Substantiation Rules",
            suggested_correction="industry-acclaimed",
            confidence=0.98,
            status="open"
        ),
        ReviewIssue(
            review_id=rev1.id,
            rule_id="RULE-PROHIBITED-CRUSH",
            category="terminology",
            severity="high",
            excerpt="crush the competition",
            start_pos=127,
            end_pos=148,
            explanation="Overly combative tone contrary to brand guidelines. We emphasize collaborative empowerment.",
            guideline_reference="Brand Voice: Section 1.2 Tone Guidelines",
            suggested_correction="outperform industry benchmarks",
            confidence=0.95,
            status="open"
        ),
        ReviewIssue(
            review_id=rev1.id,
            rule_id="RULE-TONE-CONDESCENDING",
            category="tone_of_voice",
            severity="medium",
            excerpt="Obviously",
            start_pos=151,
            end_pos=160,
            explanation="Condescending phrasing contradicts our empathetic and approachable brand voice.",
            guideline_reference="Brand Voice: Empathetic & Consultative Tone",
            suggested_correction="As industry research demonstrates,",
            confidence=0.91,
            status="open"
        ),
        ReviewIssue(
            review_id=rev1.id,
            rule_id="RULE-PROHIBITED-CHEAP",
            category="terminology",
            severity="medium",
            excerpt="cheap",
            start_pos=237,
            end_pos=242,
            explanation="Devalues premium brand perception. Use approved vocabulary.",
            guideline_reference="Brand Lexicon: Section 2.1",
            suggested_correction="cost-effective",
            confidence=0.99,
            status="open"
        ),
        ReviewIssue(
            review_id=rev1.id,
            rule_id="RULE-UNSUPPORTED-SLA",
            category="unsupported_claims",
            severity="high",
            excerpt="100% uptime with zero downtime",
            start_pos=280,
            end_pos=311,
            explanation="Technical uptime claim of 100% contradicts standard SLA specifications (MSA specifies 99.99%).",
            guideline_reference="Approved Fact FACT-003 & SLA Disclosures",
            suggested_correction="99.99% high-availability uptime",
            confidence=0.99,
            status="open"
        ),
        ReviewIssue(
            review_id=rev1.id,
            rule_id="RULE-PREFERRED-TERMINOLOGY",
            category="terminology",
            severity="low",
            excerpt="rockstar",
            start_pos=363,
            end_pos=371,
            explanation="'rockstar' is informal startup cliché. Standardize to preferred brand term 'specialist'.",
            guideline_reference="Brand Lexicon & Style Guide",
            suggested_correction="specialist",
            confidence=0.95,
            status="open"
        ),
        ReviewIssue(
            review_id=rev1.id,
            rule_id="RULE-FACT-CONTRADICTION",
            category="factual_accuracy",
            severity="critical",
            excerpt="founded in 2018",
            start_pos=384,
            end_pos=399,
            explanation="Contradicts approved brand fact: 'Luminary Cloud was founded in 2021 by veterans of distributed systems.'",
            guideline_reference="Verified Brand Knowledge Base (FACT-001)",
            suggested_correction="founded in 2021",
            confidence=0.99,
            status="open"
        ),
        ReviewIssue(
            review_id=rev1.id,
            rule_id="RULE-UNSUPPORTED-SUPERLATIVE",
            category="unsupported_claims",
            severity="critical",
            excerpt="no risk",
            start_pos=473,
            end_pos=480,
            explanation="Regulatory noncompliance under commercial trade laws. Never promise absolute zero risk.",
            guideline_reference="Legal Compliance: Risk Representations",
            suggested_correction="low barrier to entry",
            confidence=0.99,
            status="open"
        ),
        ReviewIssue(
            review_id=rev1.id,
            rule_id="RULE-PROHIBITED-GUARANTEED",
            category="unsupported_claims",
            severity="critical",
            excerpt="100% guaranteed",
            start_pos=544,
            end_pos=559,
            explanation="Creates unrestricted legal liability without legal department indemnity waiver.",
            guideline_reference="Corporate Legal & Risk Manual",
            suggested_correction="backed by our satisfaction commitment",
            confidence=0.99,
            status="open"
        ),
        ReviewIssue(
            review_id=rev1.id,
            rule_id="RULE-MISSING-DISCLAIMER-PRODUCT-BETA-NOTICE",
            category="policy_violations",
            severity="high",
            excerpt="[Content Body - Missing Mandatory Disclaimer]",
            start_pos=len(c1_text) - 1,
            end_pos=len(c1_text),
            explanation="Content references product beta version but lacks required disclosure.",
            guideline_reference="Product Beta Notice Guidelines",
            suggested_correction="\n\nDisclaimer: Features subject to change prior to general availability.",
            confidence=0.95,
            status="open"
        )
    ]
    db.add_all(issues1)
    db.commit()

    # Content 2: High quality item in review
    content2 = ContentItem(
        organization_id=org.id,
        brand_id=brand1.id,
        creator_id=creator_user.id,
        title="Achieving 99.99% High Availability in Multi-Cloud Infrastructures",
        content_type="document",
        status="in_review",
        current_version_number=2,
        latest_score=94.5
    )
    db.add(content2)
    db.commit()
    db.refresh(content2)

    c2_text = """In this architectural whitepaper, we examine resilient cluster topologies for mission-critical enterprise workloads.

Luminary Cloud, founded in 2021, provides a premier platform engineered for high-throughput transactional resilience. Our multi-region mesh architecture ensures continuous operation with 99.99% SLA adherence.

By partnering with our certified technical specialists, organizations can achieve cost-effective scalability while maintaining stringent governance standards."""

    v2_1 = ContentVersion(
        content_id=content2.id,
        version_number=1,
        text_content=c2_text.replace("cost-effective", "cheap"),
        change_summary="First draft",
        created_by_id=creator_user.id
    )
    v2_2 = ContentVersion(
        content_id=content2.id,
        version_number=2,
        text_content=c2_text,
        change_summary="Applied brand vocabulary corrections",
        created_by_id=creator_user.id
    )
    db.add_all([v2_1, v2_2])
    db.commit()
    db.refresh(v2_2)

    # Approval Request for Content 2
    app2 = ApprovalRequest(
        organization_id=org.id,
        content_id=content2.id,
        content_version_id=v2_2.id,
        requester_id=creator_user.id,
        reviewer_id=approver_user.id,
        status="in_review",
        decision_notes="All brand guidelines checked. Please review and provide sign-off for publication.",
        requested_version_number="2"
    )
    db.add(app2)
    db.commit()

    # Comments on Content 2
    comm1 = ContentComment(
        content_id=content2.id,
        user_id=creator_user.id,
        message="Submitted v2 with verified SLA numbers from the MSA. Ready for your review Marcus!"
    )
    comm2 = ContentComment(
        content_id=content2.id,
        user_id=approver_user.id,
        message="Reviewing now Alex. Looking very crisp and aligned with our Q3 branding objectives."
    )
    db.add_all([comm1, comm2])
    db.commit()

    # Notifications
    notif1 = Notification(
        user_id=approver_user.id,
        title="Approval Requested",
        message="Alex Rivera submitted 'Achieving 99.99% High Availability in Multi-Cloud Infrastructures' (v2) for sign-off.",
        link="/approvals",
        notification_type="approval_request"
    )
    notif2 = Notification(
        user_id=creator_user.id,
        title="Review Audit Complete",
        message="Content 'Introducing Luminary Cloud Mesh' flagged 10 potential governance issues. Review studio ready.",
        link=f"/studio?content_id={content1.id}",
        notification_type="issue_flag"
    )
    db.add_all([notif1, notif2])
    db.commit()

    # Audit Logs
    audit1 = AuditLog(
        organization_id=org.id,
        user_id=admin_user.id,
        user_email=admin_user.email,
        user_name=admin_user.full_name,
        action="brand_created",
        entity_type="brand",
        entity_id=brand1.id,
        details={"brand_name": brand1.name, "guidelines_version": 2}
    )
    audit2 = AuditLog(
        organization_id=org.id,
        user_id=creator_user.id,
        user_email=creator_user.email,
        user_name=creator_user.full_name,
        action="content_created",
        entity_type="content",
        entity_id=content1.id,
        details={"title": content1.title}
    )
    audit3 = AuditLog(
        organization_id=org.id,
        user_id=creator_user.id,
        user_email=creator_user.email,
        user_name=creator_user.full_name,
        action="approval_submitted",
        entity_type="approval",
        entity_id=app2.id,
        details={"content_title": content2.title, "version": 2}
    )
    db.add_all([audit1, audit2, audit3])
    db.commit()

    print("Seed completed successfully!")
    print(f"Organization: {org.name}")
    print("Demo Users:")
    print("  - Admin:    admin@inkloom.ai / password123")
    print("  - Approver: approver@inkloom.ai / password123")
    print("  - Manager:  manager@inkloom.ai / password123")
    print("  - Creator:  creator@inkloom.ai / password123")

if __name__ == "__main__":
    seed()
