Inkloom AI

Create confidently. Stay on-brand. Publish responsibly.

Inkloom AI is a brand-governance and content-review platform designed to help teams create content that aligns with their brand guidelines before publication.

It brings brand rules, content review, approval workflows, and activity tracking into one workspace so teams can identify potential issues and improve their content.

✨ Features

- Brand Guidelines: Maintain brand voice, preferred terminology, restricted terms, and verified brand facts.
- Content Review: Check drafts for terminology, tone, unsupported claims, factual inconsistencies, and required disclosures.
- AI-Assisted Suggestions: Review findings and suggested improvements before deciding what to change.
- Approval Workflows: Support content review and approval across different team roles.
- Visual Asset Checks: Analyze image assets for dominant colors and compare them with configured brand colors.
- Analytics and Audit History: Track review activity, findings, and approval history.
- Role-Based Access: Organize access according to team responsibilities.

«Review results support human decision-making and do not guarantee factual accuracy, legal compliance, or publication readiness.»

🛠️ Tech Stack

Frontend

- React
- TypeScript
- Vite
- JavaScript
- HTML5 and CSS3

Backend

- Python
- FastAPI
- SQLAlchemy
- JWT-based authentication

Development and Testing

- Git and GitHub
- Pytest
- npm
- Python virtual environments

📁 Project Structure

INKLOOM-AI/
├── backend/
│   ├── app/
│   ├── tests/
│   ├── requirements.txt
│   └── seed_data.py
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── .gitignore
├── run_backend.bat
├── run_frontend.bat
├── run_tests.bat
├── seed.bat
└── README.md

Note: The directory structure above is a simplified overview. Your actual files and folders may differ.

🚀 Getting Started

Follow these steps to run Inkloom AI locally.

Prerequisites

Make sure you have installed:

- Python
- Node.js and npm
- Git
- A code editor such as Visual Studio Code

1. Clone the Repository

git clone https://github.com/Ritik-0706/INKLOOM-AI.git

Navigate to the project directory:

cd INKLOOM-AI

2. Set Up the Backend

Navigate to the backend directory:

cd backend

Create a virtual environment:

python -m venv .venv

Activate the virtual environment on Windows PowerShell:

.venv\Scripts\Activate.ps1

Alternatively, use Command Prompt:

.venv\Scripts\activate.bat

Install the required dependencies:

python -m pip install -r requirements.txt

3. Configure Environment Variables

If the project includes an ".env.example" file, create your local ".env" file from it.

For PowerShell:

Copy-Item .env.example .env

Configure the required environment variables according to your local environment.

Security requirements:

- Never publish API keys, database passwords, authentication secrets, or access tokens.
- Never commit your real ".env" file to GitHub.
- Use strong, unique secrets for production.
- Store production secrets in your hosting provider's environment configuration or secret manager.

If the project does not include an ".env.example" file, consult the backend configuration to identify the required variables before starting the application.

4. Start the Backend

From the "backend" directory, run:

python -m uvicorn app.main:app --reload

If the application starts successfully, FastAPI's interactive API documentation is typically available at:

http://127.0.0.1:8000/docs

The ReDoc interface is typically available at:

http://127.0.0.1:8000/redoc

Keep the backend terminal running.

5. Set Up the Frontend

Open a second terminal and navigate to the frontend directory from the repository root:

cd frontend

Install the frontend dependencies:

npm install

Start the development server:

npm run dev

Open the local URL displayed in the terminal.

Ensure that the frontend is configured to communicate with the correct backend address.

Important: Never put private API keys or other secrets in frontend environment variables that are exposed to browser code.

6. Run Tests

From the repository root, you can use the provided Windows test script:

run_tests.bat

You can also run the relevant tests directly using the project's configured test commands.

🔐 Security

Security is an important consideration for any application that handles users, content, or organizational information.

Inkloom AI should follow these practices:

- Keep credentials and private configuration outside the public repository.
- Use environment variables for sensitive backend configuration.
- Apply appropriate authentication and authorization checks.
- Restrict database access and use secure production database credentials.
- Configure CORS to allow only trusted origins in production.
- Use HTTPS when deployed publicly.
- Avoid exposing internal error messages or sensitive information in application logs.
- Keep dependencies updated.
- Use development seed data only in local or test environments.
- Review authentication, session management, and token handling before production deployment.

If a real credential has already been committed to a public repository, rotate or revoke it. Removing it from the latest version of a file does not remove it from Git history.

⚙️ Configuration and Deployment

Before deploying Inkloom AI, verify the following:

1. Backend environment variables are configured.
2. The database is configured and initialized correctly.
3. The frontend uses the correct deployed backend URL.
4. CORS allows the intended frontend origin.
5. Authentication works correctly in the production environment.
6. Secrets are stored securely and are not included in the frontend bundle.
7. Tests pass and development-only features are disabled or properly secured.

The application should be tested in the deployment environment before being used with real users or business data.

🧪 Testing

Testing helps identify errors and maintain application reliability.

The project includes a test runner script that can be used during development:

run_tests.bat

Run tests after making changes to authentication, content review, database operations, or other important application features.

🤝 Contributing

Contributions, suggestions, and improvements are welcome.

To contribute:

1. Fork the repository.
2. Create a new branch for your changes.
3. Implement and test your changes.
4. Check that no confidential information has been added.
5. Submit a pull request describing your changes.

📄 License

No open-source license is specified in this README.

Unless a license is added to the repository, others do not automatically receive permission to reuse, modify, or redistribute the project.

Add a "LICENSE" file if you intend to release Inkloom AI under an open-source license.

👨‍💻 Project

Inkloom AI

GitHub Repository: https://github.com/Ritik-0706/INKLOOM-AI

---

Built to help teams maintain brand consistency, improve content quality, and streamline content review.