# Inkloom AI — Enterprise Brand Governance & Approval Platform

> **"Create confidently. Stay on-brand. Publish responsibly."**

Inkloom AI is an intelligent brand-governance SaaS platform that ensures every piece of content remains 100% consistent with approved brand identity, tone of voice, factual claims, and disclosure standards before publication.

---

## 🌟 Live Service Endpoints

- **Web Application (React + Vite):** [http://localhost:5173](http://localhost:5173)
- **FastAPI OpenAPI Swagger Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **FastAPI ReDoc Reference:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check & AI Engine Status:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 🔑 Demo Personas & Credentials

The database comes pre-seeded with an organization (**Luminary Cloud Technologies**) and 4 distinct personas to evaluate role-based access control (RBAC):

| Role | Persona Name | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Sarah Chen | `admin@inkloom.ai` | `password123` | Full org setup, brand guidelines, vocabulary rules, user roles |
| **Approver** | Marcus Vance | `approver@inkloom.ai` | `password123` | Review queue, sign-off authorization, change requests, rejections |
| **Manager** | Elena Rostova | `manager@inkloom.ai` | `password123` | Analytics oversight, review tracking, guideline supervision |
| **Creator** | Alex Rivera | `creator@inkloom.ai` | `password123` | Drafting, auditing in studio, applying suggestions, submit for approval |

> **Pro Tip:** In the top navigation bar, use the **Role Switcher** to switch between personas with 1 click during demonstrations.

---

## 🚀 Quick Start on Windows

### Option A: Using Convenience Batch Scripts (Recommended)

1. **Seed Demonstration Data:**
   ```powershell
   .\seed.bat
   ```
2. **Start Backend (FastAPI on Port 8000):**
   ```powershell
   .\run_backend.bat
   ```
3. **Start Frontend (Vite on Port 5173):**
   ```powershell
   .\run_frontend.bat
   ```
4. **Execute Backend Automated Test Suite:**
   ```powershell
   .\run_tests.bat
   ```

---

### Option B: Manual Step-by-Step Setup

#### 1. Backend Setup
```powershell
cd C:\INKLOOM\backend
python -m venv venv
venv\Scripts\pip install -r requirements.txt
venv\Scripts\python seed_data.py
venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Setup
```powershell
cd C:\INKLOOM\frontend
cmd /c npm install
cmd /c npm run dev
```

---

## 🧠 Deterministic Review Engine & Explainability

Inkloom AI's review engine operates with **100% deterministic local precision**, requiring **0 paid external API keys**:

1. **Prohibited Terminology Detection:** Flags blacklisted marketing clichés (e.g. *"cheap"*, *"rockstar"*, *"100% guaranteed"*, *"no risk"*), providing rationale and approved replacements.
2. **Preferred Lexicon Standardization:** Automatically detects informal or deprecated words (e.g. replacing *"ninja"* or *"guru"* with *"specialist"*).
3. **Tone of Voice Heuristics:** Detects condescending wording (e.g. *"obviously"*, *"clearly everyone knows"*), high-pressure urgency (*"hurry up"*), and corporate jargon.
4. **Substantiation & Superlative Claims:** Detects claims like *"#1"*, *"world's best"*, *"proven to double"* that lack a corroborating fact in the verified brand knowledge base.
5. **Factual Contradiction Verification:** Cross-checks content statements against verified brand facts (e.g. flags claims that the company was *"founded in 2018"* when the corporate charter specifies *"founded in 2021"*).
6. **Mandatory Disclosures:** Ensures required disclaimers accompany sensitive topics (e.g. Product Beta Notices, Financial Performance Disclosures).
7. **Pillow Visual Asset Inspection:** Analyzes uploaded image files, extracts genuine dominant color swatches, calculates Euclidean delta-E distance from brand color swatches, and validates dimensions.

---

## 🎨 Visual Design System

- **Primary Violet:** `#7657F6`
- **Electric Blue:** `#478BFF`
- **Accent Coral:** `#FF7B72`
- **Highlight Mint:** `#53D6B0`
- **Soft Lavender Background:** `#F7F6FF`
- **Deep Indigo Text:** `#242044`
- **Borders:** `#E8E4F7`
- **Motion & 3D:** Interactive canvas 3D ribbon with pointer tilt response, subtle floating shapes, animated compliance gauge, and micro-interactions.

---

## 📁 Project Directory Structure

```
C:\INKLOOM
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entrypoint & routing
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic v2 application settings
│   │   │   ├── security.py          # Bcrypt hashing & PyJWT token utilities
│   │   │   └── permissions.py       # RBAC roles (Admin, Manager, Approver, Creator)
│   │   ├── db/
│   │   │   ├── session.py           # SQLAlchemy 2.0 SQLite/Postgres session
│   │   │   └── base.py
│   │   ├── models/                  # Relational database models
│   │   │   ├── user.py
│   │   │   ├── organization.py
│   │   │   ├── brand.py
│   │   │   ├── content.py
│   │   │   ├── review.py
│   │   │   ├── approval.py
│   │   │   ├── comment.py
│   │   │   ├── audit_log.py
│   │   │   ├── notification.py
│   │   │   └── asset.py
│   │   ├── schemas/                 # Pydantic validation request/response schemas
│   │   ├── api/
│   │   │   ├── deps.py              # JWT authentication & role dependencies
│   │   │   └── v1/                  # REST API endpoints
│   │   │       ├── auth.py
│   │   │       ├── organizations.py
│   │   │       ├── users.py
│   │   │       ├── brands.py
│   │   │       ├── content.py
│   │   │       ├── reviews.py       # Studio review & 1-click suggestion application
│   │   │       ├── approvals.py     # Multi-user sign-off workflows
│   │   │       ├── comments.py
│   │   │       ├── analytics.py
│   │   │       ├── assets.py        # Pillow image color analyzer
│   │   │       ├── notifications.py
│   │   │       ├── audit_logs.py
│   │   │       └── health.py
│   │   └── services/
│   │       ├── review_engine.py     # Deterministic local rule evaluation engine
│   │       ├── llm_provider.py      # Abstract AI provider interface
│   │       ├── asset_analyzer.py    # Pillow-based dominant color extraction
│   │       ├── analytics_service.py # Live aggregated analytics
│   │       └── audit_service.py     # Audit event trail recorder
│   ├── tests/
│   │   └── test_api.py              # Pytest test suite covering full lifecycle
│   ├── seed_data.py                 # Comprehensive demonstration database seeder
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # Protected routing & layout
│   │   ├── main.tsx
│   │   ├── index.css                # Tailwind CSS & design tokens
│   │   ├── types/index.ts           # Complete TypeScript interfaces
│   │   ├── api/client.ts            # Central Axios HTTP client with JWT interceptor
│   │   ├── contexts/AuthContext.tsx # Authentication & demo persona switching
│   │   ├── components/
│   │   │   ├── layout/              # Navbar, Sidebar, AppLayout
│   │   │   ├── ui/                  # ScoreGauge, StatCard, Badge
│   │   │   └── motion/              # ThreeRibbon, FloatingShapes, TiltCard
│   │   └── pages/
│   │       ├── LandingPage.tsx      # Public landing with 3D ribbon hero
│   │       ├── LoginPage.tsx        # Sign in with 1-click persona buttons
│   │       ├── RegisterPage.tsx     # Organization onboarding
│   │       ├── DashboardPage.tsx    # Live analytics, trends, recent drafts
│   │       ├── BrandsPage.tsx       # Brand guidelines inventory
│   │       ├── BrandEditorPage.tsx  # Brand voice, prohibited terms, facts editor
│   │       ├── ReviewStudioPage.tsx # Core split-pane review & suggestion application
│   │       ├── AssetReviewPage.tsx  # Pillow visual color palette analyzer
│   │       ├── ApprovalsPage.tsx    # Multi-user approval workflow queue
│   │       ├── AnalyticsPage.tsx    # Recharts metrics, severity & category breakdowns
│   │       ├── TeamPage.tsx         # Team members & permission matrix
│   │       ├── AuditLogsPage.tsx    # Immutable compliance history
│   │       └── SettingsPage.tsx     # Security & privacy disclosures
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── README.md
├── run_backend.bat
├── run_frontend.bat
├── run_tests.bat
└── seed.bat
```

---

## 🧪 Automated Test Verification

All integration and unit tests pass with zero failures:

```powershell
============================= test session starts =============================
tests/test_api.py::test_health_check PASSED                              [ 14%]
tests/test_api.py::test_login_demo_admin PASSED                          [ 28%]
tests/test_api.py::test_login_invalid_password PASSED                    [ 42%]
tests/test_api.py::test_user_registration PASSED                         [ 57%]
tests/test_api.py::test_deterministic_review_engine PASSED               [ 71%]
tests/test_api.py::test_brands_endpoint PASSED                           [ 85%]
tests/test_api.py::test_content_lifecycle_and_review PASSED              [100%]
======================= 7 passed in 5.18s =====================================
```

---

## 🔒 Security & Privacy Posture

1. **Password Security:** Salted hashing with `bcrypt` (12 rounds).
2. **Access Control:** Short-lived JWT bearer tokens with backend dependency role enforcement (`require_admin`, `require_approver`).
3. **Multi-Tenant Isolation:** All database queries are partitioned by `organization_id`.
4. **Confidentiality:** Zero content is transmitted to third-party AI models without explicit configuration. All core evaluations run inside the local Python runtime.
5. **Audit Logging:** Every critical action (review runs, edits, suggestion applications, approval decisions) is recorded with timestamps and responsible actor identity.
