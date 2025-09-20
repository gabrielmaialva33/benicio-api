<h1 align="center">
  <img src="https://raw.githubusercontent.com/gabrielmaialva33/adonis-kit/refs/heads/main/.github/assets/graphic-design.png" height="250" alt="Adonis Kit">
</h1>

<p align="center">
  <img src="https://img.shields.io/github/license/gabrielmaialva33/adonis-kit?color=00b8d3&style=flat-square" alt="License" />
  <img src="https://img.shields.io/github/languages/top/gabrielmaialva33/adonis-kit?style=flat-square" alt="GitHub top language" >
  <img src="https://img.shields.io/github/repo-size/gabrielmaialva33/adonis-kit?style=flat-square" alt="Repository size" >
  <a href="https://github.com/gabrielmaialva33/adonis-kit/commits/main">
    <img src="https://img.shields.io/github/last-commit/gabrielmaialva33/adonis-kit?style=flat-square" alt="GitHub last commit" >
  </a>
</p>

<p align="center">
    <a href="README.md">English</a>
    ·
    <a href="README-pt.md">Portuguese</a>
</p>

<p align="center">
  <a href="#bookmark-about">About</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#rocket-ai-first-development">AI-First Development</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#computer-technologies">Technologies</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#package-installation">Installation</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#memo-license">License</a>
</p>

## :bookmark: About

**Adonis Kit** is a modern, opinionated, and AI-first API starter kit designed to accelerate the development of robust
backend applications. Built with **AdonisJS v6**, it provides a powerful foundation for creating scalable REST APIs with
comprehensive authentication, authorization, and data management capabilities.

This project is not just a collection of technologies; it's a foundation engineered for efficiency, scalability, and
seamless collaboration with AI development partners. By providing a well-defined architecture with features like
multi-guard authentication, role-based access control (RBAC), and file management out of the box, it allows developers (
both human and AI) to focus on building unique business logic instead of boilerplate code.

### 🏗️ Architecture Overview

```mermaid
graph TD
    subgraph "API Layer"
        API_ROUTES[Routes]
        API_MW["Middleware (Auth, ACL)"]
        API_CTRL[Controllers]
        API_VALIDATORS[Validators]
    end

    subgraph "Business Layer"
        BL_SERVICES[Services]
        BL_REPOS[Repositories]
        BL_EVENTS[Events & Listeners]
    end

    subgraph "Data Layer"
        DL_MODELS[Lucid Models]
        DL_DB[(PostgreSQL)]
        DL_CACHE[(Redis)]
    end

    subgraph "Configuration"
        CONF_AUTH[Auth Guards]
        CONF_DB[Database Config]
        CONF_STORAGE[File Storage]
    end

    API_ROUTES --> API_MW
    API_MW --> API_CTRL
    API_CTRL --> API_VALIDATORS
    API_CTRL --> BL_SERVICES
    BL_SERVICES --> BL_REPOS
    BL_SERVICES --> BL_EVENTS
    BL_REPOS --> DL_MODELS
    DL_MODELS --> DL_DB
    BL_SERVICES --> DL_CACHE
```

## :rocket: AI-First Development

This starter kit is uniquely designed to maximize the effectiveness of AI-assisted coding.

- **Well-Structured API Foundation**: The clear separation of concerns (controllers, services, repositories) makes it
  easy for AI to locate, understand, and modify specific parts of the codebase with precision.
- **Strongly-Typed Foundation**: Complete TypeScript usage creates a clear contract across all API layers. This reduces
  ambiguity and allows AI to understand data structures and function signatures, leading to fewer errors.
- **Modular and Opinionated Architecture**: Domain-driven service organization and consistent patterns make it simple
  for AI to extend functionality following established conventions.
- **Focus on Business Logic**: With boilerplate for authentication, permissions, and file storage already handled, AI
  can be directed to solve higher-level business problems from day one.

## 🌟 Key Features

- **🔐 Multi-Guard Authentication**: Ready-to-use JWT-based authentication.
- **👥 Advanced Role-Based Access Control (RBAC)**: Manage user permissions with roles and fine-grained rules.
- **📁 File Management**: Pre-configured file upload service with support for local, S3, and GCS drivers.
- **⚡️ High-Performance API**: Optimized REST endpoints with intelligent caching and queue processing.
- **🔄 Event-Driven Architecture**: Built-in event system for decoupled, scalable application logic.
- **✅ Type-Safe API**: Complete TypeScript coverage with auto-completion and type checking.
- **🏥 Health Checks**: Integrated health check endpoint for monitoring.

## :computer: Technologies

- **[AdonisJS v6](https://adonisjs.com/)**: A robust Node.js framework for the backend.
- **[TypeScript](https://www.typescriptlang.org/)**: For type safety across the entire API.
- **[PostgreSQL](https://www.postgresql.org/)**: A reliable and powerful relational database.
- **[Redis](https://redis.io/)**: Used for caching, queues, and session management.
- **[VineJS](https://vinejs.dev/)**: Modern validation library for request data.
- **[Lucid ORM](https://lucid.adonisjs.com/)**: Elegant ActiveRecord implementation for AdonisJS.

## :package: Installation

### ✔️ Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (or npm/yarn)
- **Docker** (for running PostgreSQL and Redis)

### 🚀 Getting Started

1. **Clone the repository:**

   ```sh
   git clone https://github.com/gabrielmaialva33/adonis-kit.git
   cd adonis-kit
   ```

2. **Install dependencies:**

   ```sh
   pnpm install
   ```

3. **Setup environment variables:**

   ```sh
   cp .env.example .env
   ```

   _Open the `.env` file and configure your database credentials and other settings._

4. **Run database migrations:**

   ```sh
   node ace migration:run
   ```

5. **Start the development server:**
   ```sh
   pnpm dev
   ```
   _Your API will be available at `http://localhost:3333`._

### 📜 Available Scripts

- `pnpm dev`: Starts the development server with HMR.
- `pnpm build`: Compiles the application for production.
- `pnpm start`: Runs the production-ready server.
- `pnpm test`: Executes unit tests.
- `pnpm test:e2e`: Executes end-to-end tests.
- `pnpm lint`: Lints the codebase.
- `pnpm format`: Formats the code with Prettier.

## :memo: License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by the community.
</p>
