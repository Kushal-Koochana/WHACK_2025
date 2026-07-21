# JAK — Financial Literacy & Contract Analyser

> A full-stack web application that combines financial education, personal finance management, and AI-powered contract analysis to help users build healthier financial habits, improve financial literacy, and make more informed decisions before signing contracts.

---

## Table of Contents

* [Overview](#overview)
* [Technology Stack](#technology-stack)
* [Features](#features)
* [Requirements](#requirements)
* [Installation](#installation)
* [Usage](#usage)
* [Project Structure](#project-structure)
* [AI Contract Analysis Pipeline](#ai-contract-analysis-pipeline)
* [Database](#database)
* [Security & Privacy](#security--privacy)
* [Future Improvements](#future-improvements)
* [Credits](#credits)
* [Licence](#licence)

---

# Overview

JAK is a full-stack prototype developed to encourage positive financial behaviour through interactive learning and artificial intelligence.

The application combines four integrated modules:

* **AI-powered Contract Analysis** for reviewing contracts before signing.
* **Personal Finance Tracker** for recording income and expenditure.
* **Financial Decision Quiz** for testing real-world financial knowledge.
* **Gamified Credit Education Game** that teaches good financial habits through an interactive Snake game.

The project demonstrates practical software engineering principles by integrating front-end development, back-end APIs, database management, PDF processing, and Large Language Model (LLM) technologies into a single web application.

---

# Technology Stack

## Back-end

* Python
* Flask
* Flask-SQLAlchemy / SQLAlchemy ORM
* SQLite
* Google Gemini 3.5 Flash/Pro API

## Front-end

* HTML5
* CSS3
* JavaScript
* Bootstrap

## Libraries & Tools

* PyMuPDF
* Chart.js
* python-dotenv
* Git
* GitHub

---

# Features

## 🤖 AI Contract Analysis

Users can upload PDF contracts which are analysed using Google's Gemini 3.5 Pro/Flash model.

The system can:

* Analyse contractual clauses
* Generate fairness scores
* Identify potentially risky clauses
* Suggest improvements to strengthen contractual protection
* Highlight important passages directly within the original PDF
* Display recommendations alongside the annotated document

---

## 💰 Personal Finance Tracker

A lightweight finance management tool allowing users to:

* Record income
* Record expenditure
* Categorise transactions
* Delete entries
* Filter transactions by date
* Visualise spending using interactive charts
* Monitor overall financial activity

Chart visualisations are generated using Chart.js.

---

## 📝 Financial Decision Quiz

An interactive quiz designed around realistic financial scenarios.

Features include:

* Multiple-choice questions
* Real-world financial situations
* Score tracking
* Persistent, per-user high scores stored in the database
* SQLAlchemy/SQLite database integration

Topics include:

* Credit scores
* APR
* Debt management
* Minimum repayments
* Credit cards
* Co-signing agreements
* Responsible borrowing

---

## 🎮 Credit Education Snake Game

An educational version of the classic Snake game.

Players collect positive financial actions while avoiding negative financial behaviours.

Examples include:

Positive actions:

* Paying bills on time
* Keeping credit utilisation low
* Maintaining good financial habits

Negative actions:

* Missing repayments
* Excessive borrowing
* Defaulting on loans

Each collected item pauses gameplay and presents a short educational explanation describing how that financial decision affects credit health. Like the quiz, high scores are tied to the logged-in user's account and persisted in the database; guests without an account get a local-only high score stored in the browser.

---

# Requirements

Before running the project, ensure the following software is installed.

## Software Requirements

* Python 3.10 or later
* Git
* A modern web browser
* A Google Gemini API key

---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/Joshua-Cullen/WHACK25.git
cd WHACK25
```

---

## 2. Create a virtual environment

macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

---

## 3. Install project dependencies

```bash
pip install -r requirements.txt
```

This installs Flask along with Flask-SQLAlchemy/SQLAlchemy, which the app uses as its database layer.

---

## 4. Configure environment variables

Create a `.env` file in the project root.

Example:

```env
GEMINI_API_KEY="your_api_key_here"
SECRET_KEY="your_secret_key_here"
FLASK_ENV=development
```

Your `.env` file should **never** be committed to Git.

---

## 5. Create the database

```bash
python databaseSetup.py
```

This uses Flask-SQLAlchemy's `db.create_all()` to build all tables defined in `models.py`. By Flask-SQLAlchemy convention, the SQLite file is created at `instance/database.db` (auto-created on first run, and git-ignored).

---

## 6. Run the application

```bash
python app.py
```

The application will be available at:

```text
http://127.0.0.1:5000
```

---

# Usage

After launching the application you can:

1. Create an account.
2. Sign in securely.
3. Upload contracts for AI analysis.
4. Review highlighted contractual clauses.
5. Track personal finances.
6. Complete the financial literacy quiz.
7. Play the educational Snake game.
8. View spending charts and financial summaries.

---

# Project Structure

The repository is organised into modular components to separate the application's business logic, user interface, AI processing, and database management.

```text
JAK/
├── app.py                          # Main Flask application and API routes
├── models.py                       # SQLAlchemy models (User, Money, QuizScore, GameScore)
├── databaseSetup.py                # Database initialisation (db.create_all())
├── databaseDelete.py               # Development database reset utility
├── gemini.py                       # Google Gemini API integration
├── pdfHighlighting.py              # PDF annotation engine using PyMuPDF
├── requirements.txt                # Project dependencies
├── .gitignore                      # Git exclusions
├── instance/                       # Auto-created by Flask-SQLAlchemy; holds database.db (git-ignored)
├── uploads/                        # Uploaded and annotated PDF files
│
├── static/
│   ├── cash-flow-tracker_script.js
│   ├── cash-flow-tracker_style.css
│   ├── game_script.js
│   ├── game_style.css
│   ├── index_script.js
│   ├── index_style.css
│   ├── login_script.js
│   ├── login_style.css
│   ├── signup_script.js
│   ├── signup_style.css
│   ├── quiz_script.js
│   ├── quiz_style.css
│   ├── upload_script.js
│   ├── upload_style.css
│   └── icons/
│
└── templates/
    ├── base.html
    ├── index.html
    ├── game.html
    ├── quiz.html
    ├── cash-flow-tracker.html
    ├── upload.html
    ├── login.html
    └── signup.html
```

---

# AI Contract Analysis Pipeline

One of the application's primary features is its AI-assisted contract analysis system.

The pipeline consists of the following stages:

## 1. Contract Upload

The user uploads a PDF document through the Contract Analyser interface.

The uploaded document is temporarily stored within the `uploads/` directory before processing begins.

---

## 2. Text Extraction

The application extracts the contract's textual content from the uploaded PDF.

This extracted text is prepared for submission to the Google Gemini model.

---

## 3. AI Analysis

The extracted contract is analysed using **Google Gemini 3.5 Flash/Pro**.

The model evaluates the contract and produces structured information including:

* Fairness assessment
* Potential contractual risks
* Recommended improvements
* Clauses requiring further attention
* Supporting explanations

The AI responses are structured into a predictable format before being returned to the application.

---

## 4. PDF Highlighting

The AI identifies key clauses that should be reviewed.

Using **PyMuPDF**, the application:

* Locates the identified text
* Highlights important passages
* Adds visual annotations
* Saves an annotated version of the original PDF

This enables users to compare the AI recommendations directly with the original contract.

---

## 5. Results Presentation

The processed contract is displayed within an embedded PDF viewer alongside the AI-generated analysis.

Users can:

* Read the original contract
* View highlighted clauses
* Review suggested improvements
* Examine overall fairness scores
* Make more informed decisions before signing

---

# Application Workflow

The overall workflow can be summarised as follows:

```text
User uploads PDF
        │
        ▼
Extract contract text
        │
        ▼
Google Gemini analysis
        │
        ▼
Generate structured recommendations
        │
        ▼
Highlight important clauses
        │
        ▼
Display annotated PDF and AI feedback
```

---

# Database

JAK uses **SQLite** as its underlying database, accessed through the **Flask-SQLAlchemy** ORM rather than raw SQL. All tables are defined declaratively in `models.py`.

Current database tables include:

* **`users`** — accounts (`user_id`, `username`, `email`, `password`)
* **`money`** — income/expense entries (`money_id`, `user_id`, `date`, `description`, `amount`, `type`)
* **`quiz_scores`** — financial decision quiz scores (`quiz_id`, `user_id`, `score`, `date`)
* **`game_scores`** — Credit Snake Game high scores (`game_score_id`, `user_id`, `score`, `date`)

All child tables reference `users.user_id` with `ON DELETE CASCADE`, so deleting a user also removes their finance entries and scores.

The database is automatically created using:

```bash
python databaseSetup.py
```

This calls `db.create_all()` against the models in `models.py`. By Flask-SQLAlchemy's convention, the SQLite file lives at `instance/database.db`, which is auto-created and git-ignored.

For development purposes, database contents can be reset (all rows deleted, tables kept) using:

```bash
python databaseDelete.py
```

> **Note:** `databaseDelete.py` should only be used in development, as it removes stored data.

Both the quiz and the Snake game show a **per-user, server-persisted high score** when logged in; when logged out, a local-only high score is shown instead (stored in the browser and never sent to or read from another account).

---

# Front-end

The application's user interface has been built using standard web technologies.

## Technologies

* HTML5
* CSS3
* JavaScript
* Bootstrap

Each feature has its own dedicated JavaScript and stylesheet files, making the project easier to maintain and extend.

The interface has been designed with an emphasis on:

* Responsive layouts
* Clear navigation
* Accessibility
* Consistent styling
* Modular design

---

# Back-end

The back-end has been developed using **Flask**, with **Flask-SQLAlchemy** as the database access layer.

Responsibilities include:

* User authentication
* Session management
* API endpoints
* Database interaction via SQLAlchemy models
* AI integration
* PDF processing
* File uploads

The application follows a modular structure to keep business logic separate from presentation logic wherever possible.

---

# PDF Highlighting

Contract highlighting is performed using **PyMuPDF**.

After receiving the AI-generated response:

1. Relevant contractual clauses are identified.
2. Matching text is located within the PDF.
3. Highlight annotations are applied.
4. The annotated PDF is saved.
5. The highlighted document is displayed to the user.

This allows users to review the AI's findings while maintaining full visibility of the original document.

---

# Financial Tracker

The finance tracker enables users to monitor their personal finances.

Features include:

* Income tracking
* Expense tracking
* Transaction categorisation
* Date filtering
* Transaction deletion
* Interactive charts
* Running financial summaries

Charts are generated dynamically using **Chart.js**.

---

# Quiz Module

The financial literacy quiz reinforces important financial concepts through scenario-based questions.

Scores are stored per-user in the SQLite database via the `QuizScore` model, allowing users to monitor their progress over time from any device once logged in.

The quiz focuses on topics including:

* Credit scores
* APR
* Debt management
* Loans
* Credit cards
* Responsible borrowing
* Financial decision-making

---

# Educational Snake Game

The Snake game introduces financial concepts through interactive gameplay.

Rather than collecting traditional food items, players encounter financial behaviours that influence their score.

Each item collected triggers a short educational explanation, encouraging users to understand the consequences of positive and negative financial decisions.

High scores are stored per-user via the `GameScore` model, mirroring the quiz's scoring system, so a logged-in player's best score persists across sessions and devices.

The game combines entertainment with financial education to create an engaging learning experience.

---

# Security & Privacy

Security and responsible handling of user data have been considered throughout the project.

## Environment Variables

Sensitive information is stored using environment variables rather than hard-coded into the source code.

Examples include:

* `GEMINI_API_KEY`
* `SECRET_KEY`

The `.env` file is excluded from version control through `.gitignore` and should never be committed to a public repository.

---

## User Authentication

The application supports user authentication to protect personalised data, including:

* Financial records
* Quiz and game high scores
* User accounts

Session management is handled by the Flask application, and all per-user database queries (finance entries, quiz scores, game scores) are scoped to `session["user_id"]` so one account can never see or overwrite another's data.

---

## File Uploads

Contract documents are uploaded temporarily for analysis.

When deploying the application publicly, it is recommended to:

* Restrict permitted file types
* Validate uploaded files
* Limit maximum upload sizes
* Automatically remove uploaded files after processing
* Scan uploaded documents where appropriate

---

## AI Disclaimer

The Contract Analyser is designed as an educational and decision-support tool.

AI-generated responses:

* should not be considered legal advice;
* may contain inaccuracies or omissions; and
* should always be reviewed alongside the original contract.

Users should seek advice from a qualified legal professional before signing legally binding agreements.

---

# Testing

The application has been manually tested throughout development, along with targeted automated smoke tests (using Flask's test client) covering:

* User authentication (signup, duplicate-email rejection, login)
* Contract uploads
* AI contract analysis
* PDF highlighting
* Quiz functionality, including per-user high score isolation
* Snake game functionality, including per-user high score isolation
* Financial tracker CRUD operations
* Database persistence
* Responsive layouts
* Cross-page navigation

Future improvements could include a proper automated test suite using frameworks such as:

* `pytest`
* Flask testing utilities
* Selenium or Playwright for end-to-end testing

---

# Deployment

For production deployment, the following improvements are recommended:

## Application Server

Replace Flask's built-in development server with a production-ready WSGI server such as:

* Gunicorn (Linux/macOS)
* Waitress (Windows)

---

## Reverse Proxy

Use a reverse proxy such as:

* Nginx
* Apache

to improve security, performance and scalability.

---

## Database

SQLite is suitable for development and smaller deployments.

For larger-scale deployments, consider migrating to:

* PostgreSQL
* MySQL

Because the app already uses SQLAlchemy as its ORM, switching the `SQLALCHEMY_DATABASE_URI` to a PostgreSQL/MySQL connection string requires no changes to `models.py` or the application's query logic.

---

## HTTPS

Serve the application exclusively over HTTPS using a valid TLS certificate to protect user data in transit.

---

## File Storage

For cloud deployments, uploaded documents can be stored using services such as:

* Amazon S3
* Google Cloud Storage
* Azure Blob Storage

rather than the local file system.

---

# Future Improvements

There are several opportunities to extend the application further, including:

## AI

* Support for additional AI models
* Multi-language contract analysis
* OCR support for scanned PDF documents
* Clause-by-clause contract summaries
* Downloadable AI-generated reports

---

## Finance Tracker

* Monthly budgeting
* Savings goals
* Recurring transactions
* Financial forecasting
* CSV import and export

---

## Educational Features

* Additional financial literacy games
* Achievement badges
* User progression tracking
* Personalised learning recommendations

---

## Technical Improvements

* Docker containerisation
* CI/CD pipeline using GitHub Actions
* Automated testing
* Improved logging and monitoring
* REST API documentation
* PostgreSQL migration
* Role-based access control
* Password reset functionality
* Email verification

---

# Learning Outcomes

This project provided practical experience in:

* Full-stack web development
* Python programming
* Flask application development
* Database design and ORM modelling using SQLAlchemy/SQLite
* Front-end development with HTML, CSS and JavaScript
* API integration
* Prompt engineering for Large Language Models
* PDF processing using PyMuPDF
* Secure configuration using environment variables
* Software architecture and modular design
* Git and GitHub version control

---

# Credits

This project was developed as part of a software engineering and hackathon project exploring the application of artificial intelligence within financial technology.

Open-source libraries and services used include:

* Flask
* Flask-SQLAlchemy / SQLAlchemy
* Bootstrap
* Chart.js
* Google Gemini API
* PyMuPDF
* python-dotenv
* SQLite

Special thanks to the maintainers of these open-source projects for providing the tools that made this application possible.

---

# Licence

This project is licensed under the MIT Licence.

You are welcome to use, modify and adapt the code for educational purposes in accordance with the terms of the licence.

---

## Authors

Developed by **Josh B, Josh C, Aaron G, Kushal K**.

GitHub: https://github.com/Joshua-Cullen

---

> **Note:** This project is intended for educational and demonstration purposes. While every effort has been made to provide accurate financial information and AI-assisted contract analysis, the application should not be relied upon as a substitute for professional financial or legal advice.