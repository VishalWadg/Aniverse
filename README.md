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
- MySQL for local development
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
|-- package.json          # Root convenience scripts
`-- README.md
```

## Local Development Setup

### Prerequisites

- JDK 21
- Node.js 20+
- npm
- MySQL 8+
- Git
- Cloudinary account credentials
- Maven 3.9+ if you prefer local Maven instead of the wrapper

### 1. Clone the Repository

```bash
git clone https://github.com/VishalWadg/Aniverse.git
cd Aniverse
```

### 2. Install Dependencies

The repo has root scripts for running both apps together, and the frontend has its own dependency set.

```bash
npm install
cd Frontend
npm install
cd ..
```

### 3. Create the Database

Create a MySQL database that matches your backend connection string.

```sql
CREATE DATABASE aniverse;
```

### 4. Configure Environment Files

Create the two local env files below.

- Copy `Backend/.env.example` to `Backend/.env`
- Copy `Frontend/.env.sample` to `Frontend/.env`

Backend env variables:

```env
SPRING_PROFILES_ACTIVE=dev
DB_URL=jdbc:mysql://localhost:3306/aniverse
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
JWT_SECRET=replace_with_a_long_random_secret
ACCESS_TOKEN_EXPIRATION_MS=900000
REFRESH_TOKEN_EXPIRATION_MS=604800000
REFRESH_TOKEN_ABSOLUTE_EXPIRATION_MS=2592000000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
```

Frontend env variables:

```env
VITE_BACKEND_URL=http://localhost:8080/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
```

Notes:

- The backend defaults to the `dev` profile.
- The backend serves its API under `http://localhost:8080/api/v1`.
- `VITE_BACKEND_URL` is optional in local development because the Vite dev server proxies `/api/v1`, but setting it explicitly keeps the editor link tool configuration consistent.
- Cloudinary variables are required for the current backend startup path because upload signing is wired at application startup.

### 5. Start the Project

#### Option A: Root Convenience Script

From the repository root:

```bash
npm run dev
```

This starts:

- the Vite frontend
- the Spring Boot backend

Important:

- This root script is currently Windows-oriented because it calls `Backend/mvnw.cmd`.
- It expects the backend env file at `Backend/.env`.

#### Option B: Start Services Separately

Backend from the repository root with the env file loaded through `dotenv-cli`:

Windows:

```bash
npx dotenv -e Backend/.env -- ./Backend/mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
npx dotenv -e Backend/.env -- ./Backend/mvnw spring-boot:run
```

If you already provide the same environment variables through your shell or IDE, you can also run the backend directly from `Backend/` with Maven or the wrapper.

Frontend:

```bash
cd Frontend
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api/v1`

## Useful Commands

Frontend:

```bash
cd Frontend
npm run lint
npm run typecheck
npm run build
```

Backend:

```bash
cd Backend
mvn test
```

If you prefer the wrapper:

```bash
./mvnw.cmd test
```

or

```bash
./mvnw test
```

Backend tests use an in-memory H2 database, so they do not require a running MySQL instance.

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
