# Aniverse
![Frontend](https://img.shields.io/badge/frontend-React_19_%2B_Vite_7-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/backend-Spring_Boot_3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-black?style=for-the-badge)

Aniverse is a full-stack publishing and discussion platform for anime and manga fans. The current codebase is focused on long-form posts, editorial-style discovery, authentication, and media-rich writing workflows.

Older drafts of this README mentioned features such as watchlists, progress tracking, recommendations, forums, and notifications. Those are not implemented in the current repository state and are better treated as future roadmap items rather than existing functionality.

## Current Features

- Public home feed and archive of posts
- Signup, login, logout, and token refresh flow
- Protected routes for creating, editing, and deleting posts
- Author-only edit and delete controls
- Rich editor built on Editor.js with embeds, formatting, image uploads, and link previews
- Cloudinary-backed image uploads using signed requests from the backend
- REST API served from `/api/v1`
- Frontend and backend GitHub Actions workflows
- Semgrep security scans on both apps and SonarCloud analysis on the backend workflow

## Tech Stack

### Frontend

- React 19
- Vite 7
- React Router 7
- Redux Toolkit and RTK Query
- Tailwind CSS 4
- React Hook Form
- Axios
- Editor.js

### Backend

- Java 21
- Spring Boot 3.5
- Spring Security with JWT-based authentication
- Spring Data JPA and Hibernate
- PostgreSQL for persistent data storage
- Redis for caching
- H2 for backend tests
- Cloudinary for media uploads
- Jsoup for URL metadata extraction

## Repository Structure

```text
Aniverse/
|-- .github/workflows/    # Frontend and backend CI pipelines
|-- Backend/              # Spring Boot API
|   |-- src/main/java/
|   |-- src/main/resources/
|   `-- src/test/
|-- Frontend/             # React + Vite client
|   |-- public/
|   `-- src/
|-- docker-compose.dev.yml# Local database & Redis orchestrator
|-- docker-compose.yml    # Master production container network
|-- package.json          # Root convenience scripts
`-- README.md
```

## Local Run Configurations & Workflows

Aniverse supports three primary workflows depending on whether you are coding locally, testing integration, or preparing to deploy.

### Prerequisites

- **JDK 21**
- **Node.js 20+** and **npm**
- **Docker** and **Docker Compose** (for Docker-based database and production workflows)
- **PostgreSQL 15+** (only if running a locally downloaded database without Docker)
- **Git**
- **Cloudinary account credentials**

---

### Workflow 1: Local Development with Docker Database (Recommended)

This workflow keeps your computer clean by running PostgreSQL and Redis in lightweight Docker containers, while you run the Java and React code locally on your host OS for instant hot-reloads and step-by-step debugging.

#### 1. Clone the repository and install dependencies
```bash
git clone https://github.com/VishalWadg/Aniverse.git
cd Aniverse
npm install
cd Frontend && npm install && cd ..
```

#### 2. Start the Database and Cache Containers
Run this command from the repository root:
```bash
docker compose -f docker-compose.dev.yml up -d
```

#### 3. Configure the Environment Variables
*   Copy `Backend/.env.example` to `Backend/.env`
*   Copy `Frontend/.env.sample` to `Frontend/.env`

Verify that `Backend/.env` points to the Docker database:
```env
SPRING_PROFILES_ACTIVE=dev
DB_NAME=aniverse
DB_URL=jdbc:postgresql://localhost:5432/aniverse
DB_USERNAME=postgres
DB_PASSWORD=Akadan10
```

#### 4. Run the applications
*   **Backend**: Navigate to `Backend/` and run:
    ```cmd
    .\mvnw.cmd spring-boot:run
    ```
*   **Frontend**: Navigate to `Frontend/` and run:
    ```bash
    npm run dev
    ```
*   **Access the App**: Navigate to `http://localhost:5173` in your browser.

---

### Workflow 2: Local Development with Downloaded (Local) PostgreSQL

Use this if you prefer running a locally downloaded PostgreSQL database on your host operating system.

#### 1. Create your database
Connect to your local PostgreSQL server and create a database:
```sql
CREATE DATABASE aniverse;
```

#### 2. Configure the Environment Variables
Open `Backend/.env` and update the connection details to match your local installation:
```env
SPRING_PROFILES_ACTIVE=dev
DB_NAME=aniverse
DB_URL=jdbc:postgresql://localhost:<your_port>/aniverse
DB_USERNAME=<your_postgres_username>
DB_PASSWORD=<your_postgres_password>
```

#### 3. Run the applications
*   Start the backend (`.\mvnw.cmd spring-boot:run` in `Backend/`).
*   Start the frontend (`npm run dev` in `Frontend/`).
*   *Note: If you have Redis installed locally, it will connect; if not, Spring Boot will run with local memory fallback after displaying a connection timeout warning.*

---

### Workflow 3: Full Production/Integration Stack (Full Containerization)

This workflow matches your production deployment. It containerizes all four layers (PostgreSQL, Redis, Spring Boot backend via Jib, and React frontend served via Nginx) inside a single isolated Docker network.

#### 1. Build the Backend Docker Image
Jib packages your Spring Boot app into a secure J21 JRE Alpine image. Navigate to `Backend/` and run:
```cmd
.\mvnw.cmd compile jib:dockerBuild
```

#### 2. Stop any running dev containers (to avoid port conflicts)
```bash
docker compose -f docker-compose.dev.yml down
```

#### 3. Launch the complete containerized network
From the repository root, run:
```bash
docker compose up --build -d
```

#### 4. Access the Website
Open your browser and navigate to `http://localhost`. 
*   React is compiled and served on port `80` using Nginx.
*   Nginx acts as a reverse proxy, routing `/api/v1` requests internally to the backend container, preventing CORS issues.
*   *Note: To simulate production database security, the database port is not exposed to the public internet.*

---

## Useful CLI Commands

### Frontend Checks
```bash
cd Frontend
npm run lint       # Run linter
npm run typecheck  # Check TypeScript compiler
npm run build      # Test compile production assets
```

### Backend Tests
```bash
cd Backend
./mvnw.cmd test    # Run backend tests (uses H2 in-memory DB)
```


## CI Workflows

This repository currently has two GitHub Actions workflows:

- `frontend-ci.yml`: installs frontend dependencies, runs `npm run build`, and runs Semgrep
- `backend-ci.yml`: runs Maven verify, SonarCloud analysis, and Semgrep

Both workflows trigger on pushes that touch the relevant app and on pull requests to `main`.

## Contributing

Contributions are welcome. A good default flow is:

1. Create a branch from `main`
2. Keep the change focused
3. Run the relevant checks locally
4. Open a pull request against `main`

Example:

```bash
git checkout -b feature/improve-editor-workflow
```

## Roadmap Ideas

These are reasonable next areas for the project, but they are not fully implemented in the current codebase:

- comments and richer discussion threads
- user profiles
- search and filtering improvements
- recommendation and discovery features
- notifications

## License

This project is licensed under the MIT License. See `LICENSE` for details.
