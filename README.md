<!-- ==================== HERO SECTION ==================== --><div align="center"><img src="https://capsule-render.vercel.app/api?type=venom&height=250&color=0:09090B,50:312E81,100:7C3AED&text=INKLOOM%20AI&fontColor=FFFFFF&fontSize=75&fontAlignY=42&desc=Your%20Brand.%20Your%20Voice.%20Your%20Standards.&descAlignY=62&descSize=17&animation=fadeIn" width="100%" alt="Inkloom AI Banner"/><br/>✦ Intelligent Brand Governance & Content Intelligence ✦

Create confidently. Stay on-brand. Publish responsibly.

A modern AI-powered platform designed to help teams maintain brand consistency, review content, and streamline approval workflows.

<br/><a href="https://github.com/Ritik-0706/INKLOOM-AI">
<img src="https://img.shields.io/badge/GitHub-Repository-18181B?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repository"/>
</a>
<a href="https://fastapi.tiangolo.com/">
<img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
</a>
<a href="https://react.dev/">
<img src="https://img.shields.io/badge/React-Frontend-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
</a>
<a href="https://www.typescriptlang.org/">
<img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
</a><br/><br/>

"Overview" (#-overview) · "Features" (#-key-features) · "Technology" (#-technology-stack) · "Installation" (#-getting-started) · "Security" (#-security-first)

</div>---

<!-- ==================== OVERVIEW ==================== -->✨ Overview

Inkloom AI brings brand guidelines, content validation, review workflows, and brand consistency checks into a unified workspace.

Whether a team is preparing marketing campaigns, social media posts, website copy, or other business content, Inkloom AI helps identify potential issues before publication.

Instead of relying entirely on manual reviews, teams can use intelligent content analysis and structured approval processes to improve consistency and efficiency.

<table>
<tr>
<td width="50%" valign="top">🎯 Brand Intelligence

Organize brand voice, preferred terminology, restricted terms, and approved brand information.

</td>
<td width="50%" valign="top">🧠 Content Intelligence

Analyze content for potential inconsistencies, unsupported claims, tone issues, and missing disclosures.

</td>
</tr>
<tr>
<td width="50%" valign="top">🛡️ Governance

Support structured reviews, role-based access, and content approval workflows.

</td>
<td width="50%" valign="top">📊 Visibility

Track review findings, activity, and approval history to support better content decisions.

</td>
</tr>
</table>---

🚀 Key Features

<table>
<tr>
<td width="60" align="center">🎨</td>
<td>Brand Guidelines Management

Maintain a consistent brand identity through configurable brand voice, terminology, restricted words, and verified facts.

</td>
</tr>
<tr>
<td align="center">🔍</td>
<td>Intelligent Content Review

Identify potential issues involving tone, brand terminology, factual inconsistencies, unsupported claims, and required disclosures.

</td>
</tr>
<tr>
<td align="center">💡</td>
<td>Actionable Recommendations

Review suggested improvements and decide which changes are appropriate before publishing content.

</td>
</tr>
<tr>
<td align="center">✅</td>
<td>Approval Workflows

Support review and sign-off processes for teams with different responsibilities.

</td>
</tr>
<tr>
<td align="center">🖼️</td>
<td>Visual Brand Consistency

Analyze image assets for dominant colors and compare them with configured brand colors.

</td>
</tr>
<tr>
<td align="center">📈</td>
<td>Analytics & Audit History

Provide visibility into review activity, findings, and approval history.

</td>
</tr>
<tr>
<td align="center">🔐</td>
<td>Role-Based Access Control

Organize application access around team roles and responsibilities.

</td>
</tr>
</table>---

🧰 Technology Stack

<div align="center">Frontend

<img src="https://skillicons.dev/icons?i=react,ts,vite,html,css,js" alt="Frontend Technologies"/>Backend & Data

<img src="https://skillicons.dev/icons?i=python,fastapi" alt="Backend Technologies"/>Development Tools

<img src="https://skillicons.dev/icons?i=git,github,vscode" alt="Development Tools"/></div>Layer| Technologies
Frontend| React, TypeScript, Vite, HTML, CSS, JavaScript
Backend| Python, FastAPI
Database Integration| SQLAlchemy
Authentication| JWT-based authentication
Testing| Pytest
Package Management| npm, pip
Version Control| Git and GitHub

---

🏗️ Architecture Overview

Inkloom AI follows a frontend-backend architecture.

flowchart TD
    A["👤 User"] --> B["🖥️ React Frontend"]
    B --> C["⚡ FastAPI Backend"]
    C --> D["🔐 Authentication & Authorization"]
    C --> E["🧠 Content Review Services"]
    C --> F["🎨 Brand Validation"]
    C --> G["🗄️ Data Layer"]
    E --> H["📋 Review Findings"]
    F --> H
    G --> I["📊 Activity & Approval Data"]
    H --> J["✨ Results & Recommendations"]
    I --> J
    J --> B

    style A fill:#312E81,color:#fff,stroke:#818CF8
    style B fill:#1E293B,color:#fff,stroke:#38BDF8
    style C fill:#064E3B,color:#fff,stroke:#34D399
    style J fill:#4C1D95,color:#fff,stroke:#C4B5FD

This diagram illustrates the high-level application concept, not every implementation detail.

---

## 🔐 Accounts and demo access

Public registrations are always assigned the least-privileged **creator** role. To give hackathon judges access, create a dedicated account through the registration page and share its unique credentials privately. Do not reuse administrator credentials or put passwords in the repository. For the first administrator, configure `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` as protected deployment variables; the password must be at least 16 characters. The account is created only if that email is absent, and existing account passwords are never overwritten.

The optional local demo seed creates test personas only when explicitly enabled with `INKLOOM_ENABLE_DEMO_SEED=true`, only in an empty SQLite database, and only with a unique password supplied through `DEMO_SEED_PASSWORD`. It refuses to run against PostgreSQL and never clears existing data. Do not use the local demo seed for a public deployment.

---

## 🚀 Quick Start on Windows

### Option A: Using Convenience Batch Scripts (Recommended)

1. **Start Backend (FastAPI on Port 8000):**
   ```powershell
   .\run_backend.bat
   ```
2. **Start Frontend (Vite on Port 5173):**
   ```powershell
   .\run_frontend.bat
   ```
3. **Execute Backend Automated Test Suite:**
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
venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Setup
```powershell
cd C:\INKLOOM\frontend
cmd /c npm install
cmd /c npm run dev
```

`SECRET_KEY` and `DATABASE_URL` are required. The example environment file uses SQLite for local development; cloud deployments must set `DATABASE_URL` to a persistent managed PostgreSQL database. Keep secrets in a local ignored environment file or a secrets manager; never commit them.

## FastAPI Cloud deployment

The repository root is the deployment directory. `pyproject.toml` selects `main:app`, and `main.py` exposes the existing backend while `frontend/dist` is served by FastAPI. Build the frontend before deploying:

```powershell
cd C:\INKLOOM\frontend
npm ci
npm run build
cd C:\INKLOOM
fastapi deploy .
```

The deployment archive uses `.fastapicloudignore`; it excludes environment files, the local SQLite database, virtual environments, caches, uploaded files, and frontend source while retaining the generated frontend build. Configure protected FastAPI Cloud variables before deployment: `SECRET_KEY`, a persistent PostgreSQL `DATABASE_URL`, and the one-time administrator credentials (`BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD`). The deterministic AI provider works without an external key; `OPENAI_API_KEY` is optional.

Uploaded images currently live in the application filesystem. FastAPI Cloud instances may restart or be replaced, so image files are not durable; do not rely on cloud uploads persisting until an external object-storage provider is selected and configured. Local uploads remain available for local development.

---

## 🧠 Deterministic Review Engine & Explainability

Inkloom AI's review engine operates with **100% deterministic local precision**, requiring **0 paid external API keys**:

---

## 🤖 AI Brand Governance Copilot (Groq + LangChain)

Inkloom AI includes an interactive **Brand Copilot Chatbot** powered by **Groq's accelerated free inference models** and **LangChain**:
- **Models:** `llama-3.3-70b-versatile` (default free tier), `llama-3.1-8b-instant`, `mixtral-8x7b-32768`, `gemma2-9b-it`.
- **Dynamic Brand Grounding:** Directly queries the database for the active brand's tone of voice, prohibited terms, preferred vocabulary, verified facts, and mandatory disclaimers.
- **Interfaces:**
  - Dedicated full workspace page: `/chat` (linked in sidebar as **AI Brand Copilot**).
  - Global floating assistant drawer widget (`Ask Copilot`) available from any page in the app.
- **Configuration:** Set `GROQ_API_KEY` in `backend/.env` or enter your free Groq API key directly via the UI's **"Set Groq Key"** modal (stored locally in the browser).

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
│   ├── app/                 # Backend application
│   ├── tests/               # Automated tests
│   ├── requirements.txt     # Python dependencies
│   └── seed_data.py         # Development seed data
│
├── frontend/
│   ├── src/                 # Frontend source code
│   ├── public/               # Static assets
│   └── package.json         # Node.js dependencies
│
├── run_backend.bat          # Backend helper
├── run_frontend.bat         # Frontend helper
├── run_tests.bat            # Test runner
├── seed.bat                 # Seed-data helper
├── .gitignore
└── README.md

This is a simplified overview. Refer to the repository for the complete directory structure.

---

⚙️ Getting Started

Run Inkloom AI locally using the following instructions.

Prerequisites

Install these tools first:

- Python
- Node.js and npm
- Git
- A code editor such as Visual Studio Code

1. Clone the Repository

git clone https://github.com/Ritik-0706/INKLOOM-AI.git
cd INKLOOM-AI

2. Configure the Backend

cd backend
python -m venv .venv

Activate the virtual environment on Windows PowerShell:

.venv\Scripts\Activate.ps1

Install the dependencies:

python -m pip install -r requirements.txt

Configure any required environment variables using the project's configuration instructions.

If an ".env.example" file is available, create your local configuration file:

Copy-Item .env.example .env

Never commit your real ".env" file or private credentials.

3. Start the Backend

From the "backend" directory:

python -m uvicorn app.main:app --reload

When the server starts successfully, the API documentation is typically available at:

Swagger UI: "http://127.0.0.1:8000/docs"

ReDoc: "http://127.0.0.1:8000/redoc"

4. Configure the Frontend

Open a second terminal and navigate to the frontend directory from the project root:

cd frontend
npm install
npm run dev

Open the local development URL displayed by Vite.

Ensure that the frontend is configured to communicate with the correct backend address.

5. Run Tests

From the project root on Windows:

run_tests.bat

Alternatively, execute the tests using the commands configured in the project.

«Note: Exact configuration requirements may vary depending on the current source code and environment.»

---

🔐 Security First

Security matters when working with authentication, business content, and organizational data.

Inkloom AI should be configured with the following principles in mind:

- Never publish passwords, API keys, tokens, or private credentials.
- Keep ".env" files out of version control.
- Use strong, unique secrets for production.
- Apply authentication and authorization checks to protected endpoints.
- Configure CORS for trusted frontend origins.
- Use HTTPS in production.
- Restrict database access.
- Avoid exposing sensitive information in application logs.
- Keep dependencies updated.
- Use development seed data only in local or test environments.

Important: If a real credential has already been exposed in a public repository, revoke or rotate it. Removing it from the latest file does not erase it from previous Git commits.

---

🌐 Deployment

Before deploying Inkloom AI, verify that:

- [ ] Backend environment variables are configured securely.
- [ ] The production database is configured correctly.
- [ ] The frontend uses the correct backend URL.
- [ ] CORS allows only the intended origins.
- [ ] Authentication and authorization work in production.
- [ ] Development-only functionality is disabled or appropriately secured.
- [ ] No secrets are included in frontend assets.
- [ ] Tests pass in the intended environment.

The application should be tested in its deployment environment before being used with real users or business data.

---

🗺️ Project Direction

The platform is designed around four central goals:

Goal| Purpose
Consistency| Help teams maintain a recognizable brand voice
Intelligence| Identify potential content and brand issues
Governance| Support structured review and approval
Visibility| Make review findings and activity easier to understand

---

🤝 Contributing

Ideas, feedback, and improvements are welcome.

1. Fork the repository.
2. Create a branch for your changes.
3. Implement and test your improvements.
4. Review your changes for exposed credentials.
5. Submit a pull request with a clear description.

---

📄 License

No open-source license is specified in this README.

Unless a license is added to the repository, permission to reuse, modify, or redistribute the project is not automatically granted.

---

<div align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=0:312E81,100:7C3AED&height=120&section=footer" width="100%" alt="Footer Banner"/>✦ INKLOOM AI ✦

Make every piece of content reflect your brand.

Built with purpose. Designed for consistency.

<br/><a href="https://github.com/Ritik-0706/INKLOOM-AI">
<img src="https://img.shields.io/badge/Explore%20the%20Repository-7C3AED?style=for-the-badge&logo=github&logoColor=white" alt="Explore Repository"/>
</a><br/><br/>

<sub>© Inkloom AI · Brand Governance & Content Intelligence</sub>

</div>