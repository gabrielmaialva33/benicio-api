# Benício API - Project Guidelines

## Project Overview

**Benício API** is a comprehensive legal practice management system designed for Benício Advocacia. Built with **AdonisJS v6** and React, it provides complete functionality for managing legal cases, clients, documents, and all operational aspects of a modern law firm.

### Key Features
- ⚖️ **Case Management**: Complete litigation and case tracking with deadline management
- 👥 **Client Relationship Management**: Comprehensive client portal with prospecting
- 📄 **Legal Document Management**: Secure document storage with categorization
- 💰 **Financial Management**: Billing, expense tracking, and financial reporting
- ⏰ **Deadline & Task Management**: Automated deadline tracking with calendar integration
- 🔐 **Secure Authentication**: Multi-factor authentication with RBAC system

## Technology Stack

### Backend
- **AdonisJS v6**: Node.js framework with TypeScript support
- **PostgreSQL**: Primary database for production
- **Redis**: Caching and session storage
- **Lucid ORM**: Database abstraction layer
- **VineJS**: Request validation
- **Bull Queue**: Background job processing

### Frontend
- **React 19**: Modern frontend framework
- **Inertia.js**: SPA-like experience without API complexity
- **TailwindCSS v4**: Utility-first CSS framework

### Additional Services
- **AWS S3 & Google Cloud Storage**: File storage providers
- **JWT & Session Authentication**: Multiple authentication guards
- **Argon2**: Password hashing
- **Luxon**: Date/time manipulation

## Project Structure

```
app/
├── controllers/     # HTTP request handlers by domain
├── services/       # Business logic layer organized by domain
├── models/         # Lucid ORM models with relationships
├── repositories/   # Data access layer abstraction
├── middleware/     # HTTP middleware (auth, ACL, ownership)
├── validators/     # Request validation schemas
├── events/         # Domain events and listeners
├── exceptions/     # Custom exception classes
└── shared/         # Shared utilities and types

config/             # Application configuration
database/           # Migrations, seeders, and factories
tests/              # Unit and functional tests
providers/          # Custom service providers
start/              # Application bootstrap files
```

## Development Workflow

### 🚨 CRITICAL RULE: Always Use AdonisJS Commands

**NEVER manually create files.** Always use AdonisJS Ace commands:

```bash
# Controllers
node ace make:controller User --resource

# Models with migrations
node ace make:model Product -m

# Services (organized by domain)
node ace make:service users/CreateUser
node ace make:service products/UpdateProduct

# Migrations
node ace make:migration create_users_table

# Validators
node ace make:validator CreateUser

# Tests
node ace make:test UserController --suite=functional
node ace make:test UserService --suite=unit
```

### Import Aliases
Always use import aliases defined in package.json:
- `#controllers/*` → `./app/controllers/*.js`
- `#models/*` → `./app/models/*.js`  
- `#services/*` → `./app/services/*.js`
- `#validators/*` → `./app/validators/*.js`
- `#config/*` → `./config/*.js`

**Never use relative imports like `../../`**

## Development Commands

### Development Server
```bash
pnpm run dev          # Start development server with hot reload
pnpm run build        # Build for production
pnpm start           # Start production server
```

### Database Operations
```bash
node ace migration:run     # Run pending migrations
node ace db:seed          # Run database seeders
node ace migration:rollback # Rollback last migration
```

### Code Quality
```bash
pnpm run lint         # Run ESLint (must pass)
pnpm run lint:fix     # Fix linting issues automatically
pnpm run format       # Format code with Prettier
pnpm run typecheck    # TypeScript type checking (must pass)
```

## Testing Requirements

### Test Suites
- **Unit Tests**: `tests/unit/**/*.spec.ts` (2s timeout)
- **Functional Tests**: `tests/functional/**/*.spec.ts` (30s timeout)

### Running Tests
```bash
pnpm test            # Run unit tests only
pnpm run test:e2e    # Run all tests (functional and e2e)
```

### Testing Guidelines
- **Always run tests before submitting**: Both unit and functional tests must pass
- Use Japa testing framework with API client assertions
- Test coverage should include business logic in services
- Mock external dependencies in unit tests

## Architecture Patterns

### Request Flow
Controller → Service → Repository → Model

### Authentication & Authorization
- **Multiple Guards**: JWT (default), API tokens, session, basic auth
- **RBAC System**: Users → Roles → Permissions with inheritance
- **Permission Caching**: Optimized permission checking
- **Ownership Middleware**: Resource-level access control

### Service Organization
Services are organized by domain with specific use cases:
- `app/services/users/` - User management operations
- `app/services/permissions/` - Permission management
- `app/services/roles/` - Role management
- `app/services/audits/` - Audit logging

## Code Quality Standards

### Before Submitting Changes
1. ✅ Run `pnpm lint` - Must pass
2. ✅ Run `pnpm typecheck` - Must pass  
3. ✅ Run `pnpm test` - Must pass
4. ✅ Verify functional tests if modifying API endpoints

### Code Style
- Follow AdonisJS conventions and naming patterns
- Use TypeScript strictly - no `any` types
- Keep business logic in services, not controllers
- Use dependency injection with `@inject()` decorator

## Build Requirements

### Production Build
```bash
pnpm run build      # Required before deployment
```

### Docker Deployment
```bash
pnpm run docker     # Run migrations, seeders, and start server
```

## AI Development Guidelines

### REPL Usage
Use `node ace repl` for:
- Testing queries before implementation
- Debugging service methods
- Exploring data relationships
- One-off data operations

### Example Development Workflow
```bash
# When adding a new feature:
node ace make:model Feature -m
node ace make:controller Feature --resource  
node ace make:validator CreateFeature
node ace make:service features/CreateFeature
node ace make:factory Feature
node ace make:test FeatureController --suite=functional
node ace migration:run
```

## Legal Domain Context

This system is specifically designed for legal practice management with:
- Brazilian legal procedure compliance
- Case deadline tracking with legal calendar integration
- Client-lawyer communication protocols
- Legal document categorization and version control
- Financial reporting for legal practices
