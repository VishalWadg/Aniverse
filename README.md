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

### Repository Structure

```text
Aniverse/
|-- .github/workflows/         # CI/CD and security scan pipelines
|   |-- backend-ci.yml
|   |-- deploy.yml             # Production deployment to AWS and GH Pages
|   `-- frontend-ci.yml
|-- Backend/                   # Spring Boot API
|   |-- src/main/java/
|   |-- src/main/resources/
|   |-- Dockerfile             # Local compilation backend image
|   `-- src/test/
|-- Frontend/                  # React + Vite client
|   |-- src/
|   |-- Dockerfile             # Local/production frontend image (non-root)
|   |-- nginx.conf             # Production Nginx reverse proxy routing
|   `-- vite.config.js         # Dynamic base path Vite configuration
|-- docker-compose.override.yml# Local dev database & source compilation
|-- docker-compose.prod.yml    # Production container config with Caddy
|-- docker-compose.yml         # Shared base service definitions
|-- package.json               # Root convenience scripts
`-- README.md
```

## Local Run Configurations & Workflows

Aniverse supports three primary workflows depending on whether you are coding locally, running a fully containerized dev stack, or preparing to deploy.

### Prerequisites

- **JDK 21**
- **Node.js 20+** and **npm**
- **Docker** and **Docker Compose**
- **PostgreSQL 15+** (only if running a locally downloaded database without Docker)
- **Git**
- **Cloudinary account credentials**
- **DuckDNS account** (for production dynamic DNS and SSL)

---

### Workflow 1: Local Development with Docker Database (Recommended)

This workflow keeps your computer clean by running PostgreSQL 15 and Redis in lightweight Docker containers, while you run the Java and React code locally on your host OS for instant hot-reloads and step-by-step debugging.

#### 1. Clone the repository and install dependencies
```bash
git clone https://github.com/VishalWadg/Aniverse.git
cd Aniverse
npm install
cd Frontend && npm install && cd ..
```

#### 2. Start the Database and Cache Containers
Run this command from the repository root to start only the backend infrastructure services:
```bash
docker compose up -d postgres redis
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

### Workflow 2: Full Local Containerized Stack

Use this workflow to test the entire application inside isolated Docker containers on your local machine using automatic override configurations.

#### 1. Configure the Environment Variables
*   Copy `Backend/.env.example` to `Backend/.env`
*   Copy `Frontend/.env.sample` to `Frontend/.env`
*   *Note: Ensure your Cloudinary and JWT settings are defined in Backend/.env.*

#### 2. Launch the complete containerized network
From the repository root, run:
```bash
docker compose up --build -d
```
*Note: Docker automatically merges `docker-compose.yml` with `docker-compose.override.yml`, compiling the Frontend and Backend images locally on demand and spinning up the dev Postgres container.*

#### 3. Access the Website
Open your browser and navigate to `http://localhost`.
*   The frontend is served from port `80` (mapping to Nginx port `8080` inside the container).
*   The backend is served on port `8080`.
*   Both containers are monitored by healthchecks pointing to backend actuator endpoints.

---

### Workflow 3: Full Production/Integration Stack (Dual Hosting Deployment)

This workflow represents the production deployment architecture. The frontend is hosted statically on GitHub Pages for low-latency delivery, and serves as a secure client making HTTPS API requests to your AWS VPS. The VPS runs your backend and cache containers behind a Caddy reverse proxy.

#### 1. AWS VPS Host Configuration (Caddy SSL Gateway)
1.  Connect to your AWS VPS via SSH.
2.  Install Caddy on the host system to automatically terminate SSL and renew certificates:
    ```bash
    sudo apt update
    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update
    sudo apt install caddy -y
    ```
3.  Ensure ports `80` and `443` are open in your AWS Security Group.

#### 2. Configure GitHub Repository Secrets
Under your GitHub repository settings, configure these Actions secrets:
- `VPS_SSH_HOST`: Your AWS VPS public IP address.
- `VPS_SSH_USERNAME`: Your SSH user (e.g. `ubuntu`).
- `EC2_SSH_KEY`: The contents of your private SSH Key `.pem` file.
- `VPS_PUBLIC_DOMAIN`: Your registered DuckDNS subdomain (e.g. `aniverse.duckdns.org`).
- `ALLOWED_ORIGINS`: Comma-separated list containing your AWS domain and GitHub Pages domain:
  `https://aniverse.duckdns.org,https://vishalwadg.github.io`
- `GHCR_PAT`: A GitHub Personal Access Token with package write permissions.
- `DB_NAME`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` (Supabase and production credentials).

#### 3. Deploy
Push your code changes to the `main` branch. The automated pipeline will build your backend and frontend, publish them to GHCR, copy configurations to the VPS, write the dynamic `.env` file, and deploy the frontend static files to the `gh-pages` branch.

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

## CI/CD Workflows

This repository uses three GitHub Actions workflows:

- `frontend-ci.yml`: Installs frontend dependencies, runs tests, and runs Semgrep scans.
- `backend-ci.yml`: Performs Maven validation, SonarCloud quality analysis, and Semgrep scans.
- `deploy.yml`: Builds and pushes Docker images to GHCR, deploys the backend and Caddy containers to AWS, and publishes the static client to GitHub Pages.

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
