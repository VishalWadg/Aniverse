# 🌌 Aniverse  
![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-blue?style=for-the-badge&logo=githubactions)
![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/Backend-Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![AI Reviewed](https://img.shields.io/badge/Code_Review-AI_Assisted-8A2BE2?style=for-the-badge)

**Aniverse** is an open-source, full-stack community platform designed for anime and manga enthusiasts.  
It provides a dedicated space for fans to discover new series, track their watch/read progress, and engage in detailed discussions.

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
- **Database:** SQL  
- **Security:** Spring Security & JWT Authentication  
- **Build Tool:** Maven  

## DevSecOps & Infrastructure
- **Version Control:** Git & GitHub (Monorepo architecture)  
- **CI/CD:** GitHub Actions (Automated building and testing for both Frontend and Backend)  
- **AI Code Review:** Integrated with Qodo Merge and Gemini Code Assist for automated PR analysis  
- **Branch Protection:** Strict rule sets enforcing code reviews and blocking direct pushes to `main`

---

# 📂 Repository Structure

This repository is structured as a monorepo containing both the client and server applications:

```text
Aniverse/
├── .github/workflows/    # CI/CD Pipeline configurations
├── Backend/              # Spring Boot Java application
├── Frontend/             # React application
├── README.md             # Project documentation
└── .gitignore            # Root level git-ignore
```

---

# 🛠️ Local Development Setup

To run this project locally on your machine, follow these steps:

## Prerequisites

- Java Development Kit (JDK) 21  
- Node.js (v20+)  
- Maven  
- A SQL Database (MySQL/PostgreSQL)

---

## 1️⃣ Clone the repository

```bash
git clone https://github.com/VishalWadg/Aniverse.git
cd Aniverse
```

---

## 2️⃣ Start the Backend

```bash
cd Backend
```

> **Note:** Ensure you configure your database credentials in `application.properties` first.

```bash
mvn clean install
mvn spring-boot:run
```

---

## 3️⃣ Start the Frontend

Open a new terminal window:

```bash
cd Frontend
npm install
npm run dev
```

---

# 🤝 Contribution Guidelines

We welcome contributions! Because this project enforces strict quality control, please follow this workflow:

1. Check the **Project Board** for open tickets in the **Todo** column.
2. Create a new branch for your feature or bugfix.

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes with clear, descriptive messages.
4. Open a **Pull Request (PR)** against the `main` branch.

---

## 🔍 Automated Review Process

Once a PR is opened:

- **CI Pipeline** will run automated builds and tests using GitHub Actions.
- **AI Code Review** tools (Qodo Merge & Gemini Code Assist) will analyze the code.
- Contributors should address any feedback provided by the automated reviewers or project maintainers.

After approval, the PR will be merged into `main`.

---

Built with 💻 and ☕ for the Anime Community.
