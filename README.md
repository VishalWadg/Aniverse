# 🌌 Aniverse  
![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-blue?style=for-the-badge&logo=githubactions)
![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/Backend-Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![AI Reviewed](https://img.shields.io/badge/Code_Review-AI_Assisted-8A2BE2?style=for-the-badge)

**Aniverse** is an open-source, full-stack community platform designed for anime and manga enthusiasts.  
It provides a dedicated space for fans to discover new series, track their watch/read progress, and engage in detailed discussions.

---

# 📖 About

Aniverse is an open-source community platform built for anime and manga fans who enjoy **deep discussions and creative exploration of stories**.

The platform focuses on:

- **Theory crafting** about anime and manga storylines
- Exploring **"What If?" scenarios** within existing universes
- Writing and sharing **fanfiction**
- Discussing alternate timelines, character arcs, and plot possibilities with the community

Aniverse aims to provide a dedicated space where fans can **analyze, reinterpret, and expand their favorite fictional universes together**.

The project is built as a **modern full-stack application** with a focus on **clean architecture, CI/CD automation, and secure development practices**.

---

# 🚀 Tech Stack

## Frontend
- **Core:** React.js  
- **Routing:** React Router  
- **Styling:** Tailwind CSS / Material-UI (MUI)  
- **Build Tool:** npm  

## Backend
- **Core:** Java 21 & Spring Boot  
- **Data Access:** Spring Data JPA / Hibernate  
- **Database:** SQL (MySQL / PostgreSQL)  
- **Security:** Spring Security & JWT Authentication  
- **Build Tool:** Maven  

## DevSecOps & Infrastructure
- **Version Control:** Git & GitHub (Monorepo architecture)  
- **CI/CD:** GitHub Actions (automated builds and tests for both frontend and backend)  
- **AI Code Review:** Qodo Merge & Gemini Code Assist for automated pull request analysis  
- **Branch Protection:** Rules enforcing mandatory code reviews and blocking direct pushes to `main`

---

# 📂 Repository Structure

This repository is structured as a monorepo containing both the client and server applications.

```text
Aniverse/
├── .github/workflows/    # CI/CD pipeline configurations
├── Backend/              # Spring Boot backend application
├── Frontend/             # React frontend application
├── README.md             # Project documentation
└── .gitignore            # Root-level git ignore rules
```

---

# 🛠️ Local Development Setup

To run this project locally on your machine, follow these steps.

## Prerequisites

Make sure the following tools are installed:

- **Java Development Kit (JDK) 21**
- **Node.js (v20+)**
- **Maven**
- **MySQL or PostgreSQL database**
- **Git**

---

# ⚙️ Backend Configuration

Before starting the backend server, configure your database credentials.

Edit the following file:

```
Backend/src/main/resources/application.properties
```

Example configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/aniverse
spring.datasource.username=your_username
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

# 🚀 Running the Project

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/VishalWadg/Aniverse.git
cd Aniverse
```

---

## 2️⃣ Start the Backend

```bash
cd Backend
mvn clean install
mvn spring-boot:run
```

The backend server will typically start on:

```
http://localhost:8080
```

---

## 3️⃣ Start the Frontend

Open a **new terminal window**:

```bash
cd Frontend
npm install
npm run dev
```

The frontend will typically start on:

```
http://localhost:5173
```

---

# 🔄 CI/CD Pipeline

This project uses **GitHub Actions** to automate development workflows.

The pipeline automatically:

- Builds the frontend and backend
- Runs automated tests
- Performs AI-assisted code reviews
- Validates pull requests before merging

This ensures **consistent code quality and stable builds**.

---

# 🤝 Contribution Guidelines

We welcome contributions from the community.

Because this project enforces strict quality control, please follow this workflow.

### 1. Find an Issue

Check the **Project Board** for open tickets in the **Todo** column.

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Commit Changes

Use clear and descriptive commit messages.

```bash
git commit -m "Add feature: user watchlist system"
```

### 4. Push Changes

```bash
git push origin feature/your-feature-name
```

### 5. Open a Pull Request

Open a PR against the **main** branch.

---

# 🔍 Automated Review Process

Once a Pull Request is opened:

- **GitHub Actions** will run builds and tests
- **AI Code Review Tools** (Qodo Merge & Gemini Code Assist) will analyze the code
- Maintainers will review the changes

Please address any feedback before the PR can be merged.

---

# 🗺️ Future Roadmap

Planned improvements for Aniverse include:

- User profiles and social features  
- Anime & manga recommendation system  
- Advanced search and filtering  
- Episode and chapter tracking  
- Community forums and discussion threads  
- Notification system  

---

# 📜 License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this project in accordance with the license terms.

---

Built with 💻 and ☕ for the global anime community.
