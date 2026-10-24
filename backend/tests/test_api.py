import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal, Base, engine
from app.models.user import User
from app.models.organization import Organization
from app.services.review_engine import review_engine

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database_connected"] is True
    assert "ai_engine" in data

def test_login_demo_admin():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@inkloom.ai", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"
    assert data["user"]["email"] == "admin@inkloom.ai"

def test_login_invalid_password():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@inkloom.ai", "password": "wrong_password"}
    )
    assert response.status_code == 401

def test_user_registration():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "tester@example.com",
            "password": "securepassword",
            "full_name": "Test User",
            "organization_name": "Test Org",
            "role": "creator"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "tester@example.com"
    assert "access_token" in data

def test_deterministic_review_engine():
    # Test prohibited term and unsupported claims
    class DummyBrand:
        prohibited_terms = [
            {"term": "cheap", "severity": "medium", "reason": "Devalues brand", "suggestion": "cost-effective"}
        ]
        preferred_terms = []
        approved_facts = [
            {"id": "fact-1", "claim": "Founded in 2021", "contradiction_triggers": ["founded in 2018"]}
        ]

    test_content = "This cheap solution was founded in 2018 and is the world's best 100% guaranteed."
    score, issues, summary = review_engine.analyze(test_content, DummyBrand())

    assert score < 100.0
    assert len(issues) >= 3
    rule_ids = [i.rule_id for i in issues]
    assert any("PROHIBITED" in r for r in rule_ids)
    assert any("FACT-CONTRADICTION" in r for r in rule_ids)
    assert any("UNSUPPORTED" in r for r in rule_ids)

def test_brands_endpoint():
    # Login as admin
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@inkloom.ai", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    brands_res = client.get("/api/v1/brands", headers=headers)
    assert brands_res.status_code == 200
    brands = brands_res.json()
    assert len(brands) >= 1
    assert any(b["name"] == "Luminary Cloud" for b in brands)

def test_content_lifecycle_and_review():
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "creator@inkloom.ai", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Fetch brand
    brands = client.get("/api/v1/brands", headers=headers).json()
    brand_id = brands[0]["id"]

    # 2. Create content
    create_res = client.post(
        "/api/v1/content",
        headers=headers,
        json={
            "title": "Automated Test Content Item",
            "content_type": "blog",
            "brand_id": brand_id,
            "text_content": "This is a cheap tool with zero downtime and we are #1 in the market."
        }
    )
    assert create_res.status_code == 200
    content_data = create_res.json()
    content_id = content_data["id"]

    # 3. Run Review
    review_res = client.post(
        "/api/v1/reviews",
        headers=headers,
        json={"content_id": content_id}
    )
    assert review_res.status_code == 200
    review_data = review_res.json()
    assert len(review_data["issues"]) > 0
    assert review_data["compliance_score"] < 100.0

    # 4. Apply a suggestion
    first_issue = review_data["issues"][0]
    apply_res = client.post(
        f"/api/v1/reviews/issues/{first_issue['id']}/apply-suggestion",
        headers=headers
    )
    assert apply_res.status_code == 200
    assert apply_res.json()["new_version_number"] == 2

    # 5. Submit for approval
    submit_res = client.post(
        "/api/v1/approvals",
        headers=headers,
        json={"content_id": content_id, "notes": "Please approve test v2"}
    )
    assert submit_res.status_code == 200
    approval_id = submit_res.json()["id"]

    # 6. Approver sign-off
    approver_login = client.post(
        "/api/v1/auth/login",
        json={"email": "approver@inkloom.ai", "password": "password123"}
    )
    approver_token = approver_login.json()["access_token"]
    app_headers = {"Authorization": f"Bearer {approver_token}"}

    approve_res = client.post(
        f"/api/v1/approvals/{approval_id}/approve",
        headers=app_headers,
        json={"decision_notes": "Looks solid. Approved!"}
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "approved"
