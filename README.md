# CupTrack ☕

**Professional Coffee Brewing Tracker & Analytics Platform**

Track your coffee brewing journey with precision. Record brewing parameters, evaluate taste, and analyze your progress with advanced analytics and SCA-compliant assessments.

## 🚀 Live Application

- **Production**: https://cuptrack.vercel.app
- **Development**: https://cuptrack-git-develop.vercel.app

## 📋 Features

### ✅ Core Functionality
- **Multi-Step Brew Wizard**: Comprehensive 6-step brew entry process
- **SCA Assessment Protocol**: Professional cupping score calculations
- **Advanced Analytics**: Polygon charts, trend analysis, brewing insights
- **Collections & Organization**: Group brews by origin, method, or custom themes
- **Data Export**: CSV, Excel, and PDF export capabilities
- **Responsive Design**: Mobile-first approach with desktop optimization

### ✅ Technical Features
- **Real-time Data Storage**: Supabase PostgreSQL database
- **Authentication**: Secure JWT-based auth with OAuth integration
- **Cross-Platform Integration**: Vercel + Railway + Supabase architecture
- **Professional Development Workflow**: Separate dev/staging/production environments
- **Comprehensive Testing**: Unit, integration, and end-to-end test coverage

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Platform**: Vercel
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: Context API + Custom Hooks
- **Styling**: CSS Modules + Responsive Design
- **Charts**: Chart.js for analytics visualization

### Backend (Node.js + Express)
- **Platform**: Railway
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with comprehensive middleware
- **Authentication**: JWT with refresh token rotation
- **Security**: Helmet, CORS, rate limiting, input validation
- **API Design**: RESTful API with standardized error handling

### Database (PostgreSQL)
- **Platform**: Supabase
- **Type**: PostgreSQL with Row Level Security (RLS)
- **Features**: Real-time subscriptions, automatic backups
- **Schema**: Normalized design for brews, users, collections

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: 18+ (check: `node --version`)
- **npm**: 8+ (check: `npm --version`)
- **Git**: Latest version

### Quick Start
```bash
# Clone repository
git clone [your-repo-url]
cd CupTrack

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Set up environment variables
cp frontend/.env.example frontend/.env.development
cp backend/.env.example backend/.env.development
# Edit .env.development files with your credentials

# Start development servers
cd backend && npm run dev    # Port 3001
cd frontend && npm start     # Port 3000
```

### Platform Integration
This project is designed for seamless deployment across multiple platforms:

1. **Push to GitHub**: All code versioned and tracked
2. **Auto-deploy to Railway**: Backend API automatically deployed
3. **Auto-deploy to Vercel**: Frontend automatically built and deployed
4. **Connect to Supabase**: Database automatically integrated

## 📁 Project Structure

```
CupTrack/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route components
│   │   ├── services/        # API integration services
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── services/        # Business logic services
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── package.json
├── database/                 # Database schemas and migrations
│   └── schema.sql
└── docs/                     # Project documentation
```

## 🌐 Environment Configuration

### Development Environment
- **Frontend**: https://cuptrack-git-develop.vercel.app
- **Backend**: https://cuptrack-backend-dev.up.railway.app
- **Database**: Development Supabase project

### Production Environment  
- **Frontend**: https://cuptrack.vercel.app
- **Backend**: https://cuptrack-backend-prod.up.railway.app
- **Database**: Production Supabase project

### Environment Variables
Refer to `.env.example` files in each directory for required variables.

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Component and service-level testing
- **Integration Tests**: API and database integration
- **End-to-End Tests**: Complete user workflow validation
- **Performance Tests**: Load testing and optimization

### Running Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests  
cd backend && npm test

# Coverage reports
npm run test:coverage
```

## 🚀 Deployment

### Automatic Deployment
- **Push to `develop`** → Auto-deploy to development environment
- **Push to `main`** → Auto-deploy to production environment

### Manual Deployment
```bash
# Deploy to staging
git checkout develop
git merge feature/your-feature
git push origin develop

# Deploy to production  
git checkout main
git merge develop
git push origin main
```

## 📊 Monitoring & Analytics

- **Performance**: Vercel Analytics + Custom metrics
- **Errors**: Sentry integration for error tracking
- **Usage**: Custom analytics dashboard
- **Health**: Automated health checks and alerts

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes and test thoroughly**
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Create Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SCA (Specialty Coffee Association)** for cupping protocol standards
- **Coffee community** for brewing methodology insights
- **Open source contributors** for the amazing tools and libraries

---

**Built with ❤️ for coffee enthusiasts who value precision and consistency in their brewing journey.**