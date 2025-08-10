# CupTrack Backend

Node.js/Express backend API for the CupTrack coffee brewing application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp ../.env.example .env.development
```

3. Configure your `.env.development` file with:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Health Checks

- `GET /health` - Complete system health check including database connectivity
- `GET /env-check` - Environment variable validation

## Database Setup

The database schema is defined in `src/database/schema.sql`. Apply this to your Supabase project.

## TDD Implementation

This backend follows hybrid TDD methodology:

**TDD Components (Red-Green-Refactor):**
- Database connection utilities (`src/utils/database.ts`)
- Data validation rules (`src/utils/validation.ts`)
- Authentication middleware (coming in TASK-002)
- Platform integration utilities

**Rapid Iteration Components:**
- Server setup and routing
- Basic CRUD endpoints
- Environment configuration

## Testing

- Unit tests: Jest + TypeScript
- Coverage target: >80% for TDD components
- Integration tests: Supertest for API endpoints

## Architecture

```
src/
├── utils/           # Utility functions (TDD components)
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── tests/           # Test files
└── database/        # Database schema and migrations
```