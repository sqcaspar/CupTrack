Claude.md - CupTrack Coffee Brewing Application
🚀 Quick Start for AI Development Sessions
🚨 CRITICAL: ALWAYS READ TODO.md FIRST
⚠️ STOP - Before reading anything else in this document:
1.	📋 OPEN AND READ TODO.md COMPLETELY
o	This contains current project status and your next task
o	Everything else in this document is reference material
o	TODO.md tells you what to work on and how to approach it
2.	🎯 FOLLOW TODO.md SESSION GUIDANCE
o	Use the "Next Session Guidance" section in TODO.md
o	Follow the Pre-Session Checklist in TODO.md
o	Confirm current task with human before starting work
Document Hierarchy (Read in This Order)
1.	TODO.md - 🔥 PRIMARY - Current status, active task, next actions
2.	Claude.md - 📚 REFERENCE - This document with development guidelines
3.	Blueprint & Specs - 📋 DETAILS - Comprehensive requirements and implementation plans
Essential Quick References (After Reading TODO.md)
•	TDD Components - What requires pure TDD methodology
•	Integration Checklist - Platform validation steps
•	Emergency Procedures - When things break
•	Code Standards - Quality requirements
⚠️ WARNING: Don't Start Development Without TODO.md
If you start working without reading TODO.md first, you may:
•	Work on the wrong task or use wrong methodology
•	Miss critical context from previous sessions
•	Duplicate work or break existing functionality
•	Ignore current blockers or known issues
 
📖 Table of Contents
🏗️ Project Foundation
•	Project Overview
•	Technical Architecture
•	Development Environment Setup
🔧 Development Guidelines
•	AI Development Protocols
•	Hybrid TDD Methodology
•	Code Quality Standards
•	Testing Strategy
📋 Change Management Guidelines
•	Requirement Change Detection
•	Change Request Creation & Approval
•	Document Update Protocols
•	Cross-Reference Management
•	Quality Validation & Rollback
🔗 Integration & Security
•	Platform Integration
•	Security Guidelines
•	Performance Standards
🚀 Operations & Deployment
•	Deployment Procedures
•	Monitoring & Alerting
•	Troubleshooting Guide
📚 Reference Materials
•	Core Features
•	API Documentation
•	Decision Log
 
Project Overview
Business Context
CupTrack is a web application for coffee brewing enthusiasts (pour-over, French press, Aeropress) to systematically track brewing parameters and improve coffee quality consistency.
•	Timeline: 6-month profitability goal
•	Revenue Model: Equipment partnerships, bean sales, advertisements
•	Success Metrics: Thousands of active users with consistent engagement
•	User Problem: Inability to make consistent quality coffee due to lack of systematic tracking
Technical Architecture
Platform Stack:
•	Frontend: React TypeScript on Vercel
•	Backend: Node.js Express on Railway
•	Database: Supabase (PostgreSQL)
•	Authentication: Supabase Auth with Google/Apple OAuth
Integration Priority: 🚨 CRITICAL: Cross-platform integration (Vercel ↔ Railway ↔ Supabase) is the #1 technical risk. Every development step must validate platform communication works seamlessly.
System Architecture:
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Vercel          │ │ Railway         │ │ Supabase        │
│ (Frontend)      │◄──►│ (Backend)      │◄──►│ (Database)     │
│                 │ │                 │ │                 │
│ - React App     │ │ - REST APIs     │ │ - PostgreSQL    │
│ - Static Assets │ │ - Business Logic│ │ - Auth System   │
│ - Client Charts │ │ - Calculations  │ │ - Real-time     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
 
Development Environment Setup
Prerequisites
•	Node.js: 18+ required (use node --version to check)
•	Git: Latest version for version control
•	Package Manager: npm (comes with Node.js)
Local Development Setup
# 1. Clone repository
git clone [repository-url]
cd cuptrack

# 2. Install dependencies  
npm install

# 3. Environment configuration
cp .env.example .env.development
# Configure platform API keys (see Environment Management section)

# 4. Database setup
# Follow Supabase connection instructions

# 5. Start development server
npm run dev

# 6. Verify setup
# All services should be accessible on localhost
Development Tools Required
•	Code Editor: VS Code recommended with TypeScript extension
•	Browser: Chrome/Firefox with React Developer Tools
•	Database Tool: Supabase Dashboard or PostgreSQL client
•	API Testing: Thunder Client or Postman
Environment Configuration
Environment Files Structure:
.env.example          # Template file (commit to repo)
.env.development      # Local development (never commit)
.env.staging         # Staging environment (platform variables)
.env.production      # Production environment (platform variables)
Required Environment Variables:
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Railway Backend
RAILWAY_BACKEND_URL=your_railway_app_url
JWT_SECRET=your_jwt_secret_key

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
APPLE_CLIENT_ID=your_apple_oauth_client_id
APPLE_CLIENT_SECRET=your_apple_oauth_secret

# Environment Specific
NODE_ENV=development|staging|production
CORS_ORIGIN=your_vercel_domain
Environment Validation
// Add to startup validation
const validateEnvironment = () => {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'RAILWAY_BACKEND_URL',
    'JWT_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  if (missing.length) {
    console.error('Missing environment variables:', missing);
    process.exit(1);
  }
  
  console.log('✅ Environment validation passed');
};

// Call during app initialization
validateEnvironment();
 
AI Development Protocols
1. 🚨 CRITICAL: TODO.md is Your Command Center
TODO.md contains everything you need to start working immediately:
•	Current active task and methodology to use (TDD vs Rapid Iteration)
•	Complete context from previous sessions and decisions made
•	Integration status and known issues/blockers
•	Success criteria and what NOT to do (scope boundaries)
•	Debugging guidance for common problems you may encounter
🔄 TODO.md Update Requirements:
•	Read TODO.md completely at session start
•	Update task progress during your session
•	Move completed tasks from Active → Completed with timestamps
•	Document any new issues, decisions, or discoveries
•	Update "Next Session Guidance" for the next AI
•	Mark integration points as tested after changes
The TODO.md file is the single source of truth for project progress and must be referenced and updated by every AI session.
2. Task Execution Following TODO.md Guidance
STRICT RULE: Only work on the task marked as "Active" in TODO.md
Session Workflow (Mandatory Steps):
1.	📖 Read TODO.md completely - Understand current project state
2.	🤝 Confirm with human - Use the "Session Start Actions" from TODO.md
3.	🎯 Follow task methodology - TDD or Rapid Iteration as specified in TODO.md
4.	🔧 Work on ONLY the active task - Complete all success criteria listed
5.	✅ Test integration points - Validate connections work after changes
6.	📝 Update TODO.md continuously - Progress, issues, decisions
7.	⏭️ Prepare next task - Update TODO.md before ending session
8.	🛑 STOP and confirm - Await human approval before next task
DO NOT:
•	Work on multiple tasks simultaneously
•	Skip the TODO.md reading step
•	Change methodology without updating TODO.md
•	Continue without human confirmation between tasks
•	Make changes outside current task scope (see "Don't Do" section in TODO.md)
3. Using TODO.md for Decision Making and Context
TODO.md contains critical context you need:
Before Making Technical Decisions:
1.	Check "Context & Decision History" in TODO.md for previous decisions
2.	Review "Known Issues & Blockers" to avoid creating new problems
3.	Validate against success criteria listed for current task
4.	Document new decisions in TODO.md using the standard format
When You Encounter Problems:
1.	Check "Debugging & Troubleshooting Guide" in TODO.md first
2.	Review "Lessons Learned" for similar issues and solutions
3.	Update TODO.md with new problems and solutions you discover
4.	Add to troubleshooting guide for future AI sessions
Integration Requirements:
•	Follow integration checklist specified in TODO.md
•	Update integration status after testing connections
•	Document any integration issues in the "Known Issues" section
•	Test cross-platform functionality as specified in current task guidance
4. TODO.md Communication Templates
Use these templates from TODO.md when communicating with humans:
Starting Work (From TODO.md "Session Start Actions"):
"I've read TODO.md and see that [TASK-XXX] ([Task Name]) is active. 
Based on TODO.md, this task requires [TDD/Rapid Iteration] methodology.
The deliverables listed are: [list from TODO.md success criteria]
Should I proceed with this task, or have there been any changes since TODO.md was last updated?"
Requesting Clarification:
"While working on [TASK-XXX] from TODO.md, I need clarification on:
1. [Specific question about requirement not clear in TODO.md]
2. [Technical decision needed that's not covered in Decision History]

The TODO.md shows [context from TODO.md], but I'm uncertain about [specific uncertainty].
Should I proceed with [proposed approach] or would you prefer [alternative]?"
Reporting Progress:
"Progress update on [TASK-XXX] from TODO.md:
- Completed: [List completed success criteria from TODO.md]
- Currently working on: [Current step from TODO.md guidance]
- Issues encountered: [Any new issues to add to TODO.md]
- Integration status: [Results of integration testing from TODO.md checklist]

I will update TODO.md with this progress. Should I continue or need any adjustments?"
Completing Work:
"I've completed [TASK-XXX] with all success criteria from TODO.md:
- [Success criteria 1]: ✅ Complete
- [Success criteria 2]: ✅ Complete
- Integration validation: ✅ Complete

TODO.md has been updated with:
- Task moved from Active → Completed with timestamp
- New issues/lessons learned documented
- Next task ([TASK-XXX+1]) identified and marked as Active
- Updated technical state and environment status

Should I proceed with [NEXT-TASK] or is there anything else needed for the current task?"
 
Hybrid TDD Methodology
Methodology Assignment (Defined in TODO.md)
⚠️ IMPORTANT: Each task in TODO.md specifies which methodology to use. Always check the current task's methodology before starting work.
TDD Components (PURE Red-Green-Refactor Required)
Tasks marked as "TDD Core" in TODO.md require strict TDD - NEVER skip:
•	✅ Authentication & security logic - Security failures are costly
•	✅ Business calculations (SCA scoring, coffee ratios) - Accuracy is critical
•	✅ Data validation rules - Prevent data corruption
•	✅ Platform integration utilities - Integration failures are expensive
•	✅ Export processing logic - Data accuracy essential
•	✅ Background job systems - Reliability critical
Rapid Iteration Components (Build-First Approach)
Tasks marked as "Rapid Iteration" in TODO.md:
•	🚀 UI components and layouts
•	🚀 Database schema design
•	🚀 Basic CRUD operations
•	🚀 Dashboard visualizations
•	🚀 Navigation components
•	🚀 Styling and animations
Following Current Task Methodology
1.	Check TODO.md for current task methodology designation
2.	Read task-specific guidance in "Methodology Guidance for Current Task" section
3.	Follow the prescribed approach (TDD cycles vs rapid build-first)
4.	Don't change methodology without updating TODO.md and human confirmation
TDD Example - SCA Calculation:
// RED: Write failing test first
describe('SCA Cupping Score Calculation', () => {
  test('should calculate correct final score', () => {
    const scores = { 
      aroma: 8, 
      flavor: 8, 
      aftertaste: 7, 
      acidity: 8, 
      body: 7, 
      balance: 8, 
      overall: 8 
    };
    const defects = 2;
    expect(calculateSCAScore(scores, defects)).toBe(81);
  });
  
  test('should handle defects correctly', () => {
    const scores = { 
      aroma: 8, flavor: 8, aftertaste: 7, 
      acidity: 8, body: 7, balance: 8, overall: 8 
    };
    const defects = 4;
    expect(calculateSCAScore(scores, defects)).toBe(79);
  });
});

// GREEN: Write minimal implementation
const calculateSCAScore = (scores, defects) => {
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  return total - defects;
};

// REFACTOR: Improve while keeping tests green
const calculateSCAScore = (scores, defects = 0) => {
  const categoryScores = Object.values(scores);
  const totalScore = categoryScores.reduce((sum, score) => sum + score, 0);
  const finalScore = Math.max(0, totalScore - defects);
  return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
};
Rapid Iteration Components (Build-First Approach)
Use rapid iteration for:
•	🚀 UI components and layouts
•	🚀 Database schema design
•	🚀 Basic CRUD operations
•	🚀 Dashboard visualizations
•	🚀 Navigation components
•	🚀 Styling and animations
Rapid Iteration Example - UI Component:
// Build first, test basic functionality
const BrewCard = ({ brew, onSelect, isSelected }) => {
  return (
    <div className={`brew-card ${isSelected ? 'selected' : ''}`}>
      <h3>{brew.beans.brand}</h3>
      <p>{brew.beans.origin}</p>
      <div className="brew-score">
        Quality: {brew.evaluation?.final_score || 'N/A'}
      </div>
      <button onClick={() => onSelect(brew.id)}>
        {isSelected ? 'Deselect' : 'Select'}
      </button>
    </div>
  );
};

// Then add basic test
test('BrewCard renders brew information correctly', () => {
  const mockBrew = {
    id: '1',
    beans: { brand: 'Ethiopian Coffee', origin: 'Yirgacheffe' },
    evaluation: { final_score: 85 }
  };
  
  render(<BrewCard brew={mockBrew} onSelect={jest.fn()} />);
  expect(screen.getByText('Ethiopian Coffee')).toBeInTheDocument();
  expect(screen.getByText('Quality: 85')).toBeInTheDocument();
});
 
Code Quality Standards
TypeScript Configuration
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
Code Quality Gates
•	ESLint: 0 errors, 0 warnings allowed
•	TypeScript: Strict mode, no any types without justification
•	Prettier: Code formatting must pass
•	Test Coverage: >80% for TDD components, >60% overall
•	Bundle Size: <500KB initial JavaScript load
Code Standards
•	Variables: Use descriptive names, avoid abbreviations
•	Functions: Single responsibility, max 20 lines for pure functions
•	Components: Max 200 lines, break into smaller components if larger
•	Comments: Required for business logic, SCA calculations, complex algorithms
•	Error Handling: All async operations must have error handling
File Organization
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (buttons, inputs)
│   ├── forms/          # Form-specific components
│   ├── charts/         # Data visualization components
│   └── layout/         # Page layout components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── services/           # API services
├── types/              # TypeScript type definitions
├── tests/              # Test files
└── styles/             # Global styles
Git Hooks Setup
# Install development dependencies
npm install --save-dev husky lint-staged

# Configure package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check && npm run integration-test"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
 
Testing Strategy
Testing Stack
•	Unit Tests: Jest + React Testing Library
•	Integration Tests: Supertest for API testing
•	Contract Tests: Pact for API contracts
•	Visual Tests: Storybook + Chromatic
•	E2E Tests: Cypress (when UI stabilizes)
Testing Requirements by Component Type
TDD Components (Comprehensive Testing Required)
// Example: Authentication middleware
describe('Authentication Middleware', () => {
  describe('Token Validation', () => {
    test('should accept valid Supabase JWT token', async () => {
      const validToken = 'valid-jwt-token';
      const req = { headers: { authorization: `Bearer ${validToken}` } };
      const res = {};
      const next = jest.fn();
      
      await authenticateUser(req, res, next);
      
      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalled();
    });
    
    test('should reject invalid token', async () => {
      const invalidToken = 'invalid-token';
      const req = { headers: { authorization: `Bearer ${invalidToken}` } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      await authenticateUser(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
Visual Regression Testing
// Add to testing guidelines
describe('BrewEntryForm Visual Tests', () => {
  test('matches approved visual design', async () => {
    render(<BrewEntryForm />);
    const form = screen.getByTestId('brew-form');
    await expect(form).toMatchSnapshot();
  });
  
  test('shows validation errors correctly', async () => {
    render(<BrewEntryForm />);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/brand is required/i)).toBeVisible();
    });
    
    const formWithErrors = screen.getByTestId('brew-form');
    await expect(formWithErrors).toMatchSnapshot();
  });
});
Contract Testing (API Integration)
// Pact testing for API contracts between Vercel and Railway
const { PactV3 } = require('@pact-foundation/pact');

describe('Brew API Contract', () => {
  test('should get brew list with valid token', async () => {
    await provider
      .given('user has brews')
      .uponReceiving('a request for brew list')
      .withRequest({
        method: 'GET',
        path: '/api/v1/brews',
        headers: { Authorization: 'Bearer valid-token' }
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { 
          brews: [
            { id: '1', beans: { brand: 'Test Coffee' } },
            { id: '2', beans: { brand: 'Another Coffee' } }
          ],
          total: 2
        }
      });
      
    const response = await api.get('/brews');
    expect(response.data.brews).toHaveLength(2);
  });
});
Test Data Management
// Factory functions for consistent test data
const createMockBrew = (overrides = {}) => ({
  id: faker.datatype.uuid(),
  user_id: faker.datatype.uuid(),
  brew_number: faker.datatype.number({ min: 1, max: 1000 }),
  beans: {
    brand: faker.company.companyName(),
    origin: faker.address.country(),
    processing_method: faker.random.arrayElement(['washed', 'natural', 'honey'])
  },
  parameters: {
    brewing_method: faker.random.arrayElement(['pour-over', 'french-press', 'aeropress']),
    water_temperature: faker.datatype.number({ min: 80, max: 100 }),
    grinder_setting: faker.datatype.number({ min: 1, max: 20 }).toString()
  },
  measurements: {
    coffee_beans_weight: faker.datatype.number({ min: 15, max: 25 }),
    water_weight: faker.datatype.number({ min: 200, max: 400 })
  },
  created_at: faker.date.recent(),
  ...overrides
});

// Use in tests
const mockBrews = Array.from({ length: 5 }, () => createMockBrew());
 
📋 Change Management Guidelines

## 🚨 CRITICAL: Requirement Change Management Protocol

**MANDATORY READING**: Before handling any user requirement change, read `/change-management.md` completely. This section provides AI-specific implementation guidance for the comprehensive change management framework.

### Change Detection & Initial Response

#### Recognizing Requirement Changes
Claude AI must immediately identify when a user is requesting a requirement change:

**Explicit Change Indicators**:
- "I want to change the requirement for..."
- "Can we modify the [feature/design/functionality]..."
- "Instead of X, let's do Y..."
- "I've decided we need to add/remove/alter..."

**Implicit Change Indicators**:
- Contradiction with existing documented requirements
- Request for functionality not in current scope
- Modification to established user stories or acceptance criteria
- Changes to technical architecture or platform choices

**User Feedback That May Indicate Changes**:
- "This doesn't match what I expected..."
- "What if we tried a different approach..."
- "I saw another app that does it like..."
- "Our users would prefer..."

#### Immediate Response Protocol
When a requirement change is detected, Claude AI must:

```markdown
1. STOP current work immediately
2. ACKNOWLEDGE the change request
3. ASSESS the change using the Change Management Framework
4. CREATE formal change request
5. AWAIT explicit approval before proceeding
```

**Response Template**:
```
I've identified this as a requirement change that affects [list affected areas].

Before proceeding, I need to create a formal change request following our change management process. This change appears to be:
- Type: [A/B/C/D] ([reasoning])
- Impact Level: [1/2/3/4] ([reasoning])
- Affected Documents: [list]
- Estimated Impact: [timeline/resource impact]

Should I proceed with creating the formal change request, or would you like to discuss the change first?
```

### Change Request Creation Process

#### Step 1: Impact Analysis
Before creating the change request, Claude AI must analyze:

```markdown
## Document Impact Assessment
For each document, assess:
- spec.md: Does this change requirements, user stories, or acceptance criteria?
- design-system.md: Does this change UI/UX design, components, or user experience?
- blueprint.md: Does this change implementation approach, technical architecture, or methodology?
- claude.md: Does this change development guidelines, code standards, or AI instructions?
- todo.md: Does this change task priorities, timeline, or resource allocation?

## Technical Impact Assessment
- Frontend: New components, modified functionality, UI changes, API integration changes
- Backend: New endpoints, modified business logic, database schema changes, authentication changes
- Database: Schema modifications, new tables/fields, relationship changes, performance implications
- Integration: Platform connectivity changes, third-party service modifications, authentication flow changes

## Timeline Impact Assessment
- Development time required for implementation
- Testing time required for validation
- Documentation time required for updates
- Integration testing time required
- Total project timeline impact
```

#### Step 2: Formal Change Request Creation
Using the template from `/change-management.md`, create a comprehensive change request:

```markdown
# Change Request CR-YYYY-MM-DD-XXX

## Basic Information
- **Request ID**: CR-[Generated unique ID]
- **Submission Date**: [Current date]
- **Requested By**: [User identification]
- **Change Type**: [A/B/C/D] - [Justification]
- **Priority**: [Critical/High/Medium/Low]

## Change Description
### Current State
[Detailed description of current implementation/requirements]

### Proposed Change
[Detailed description of requested change]

### Business Justification
[Why this change is needed - extract from user's reasoning]

## Impact Assessment
### Affected Components
[Checked list of all affected areas]

### Timeline Impact
- **Development Time**: [Estimated hours/days]
- **Testing Time**: [Estimated hours/days]
- **Documentation Time**: [Estimated hours/days]
- **Total Impact**: [Total estimated time]
- **Critical Path Effect**: [Yes/No with explanation]

### Resource Requirements
[What resources are needed to implement this change]

## Risk Assessment
### Technical Risks
[Identified risks and mitigation strategies]

### Business Risks
[Impact on timeline, scope, quality]

### Timeline Risks
[Effect on 6-month profitability goal]

## Implementation Plan
### Update Sequence
[Prioritized list of documents and components to update]

### Testing Plan
[How the change will be validated]

### Rollback Plan
[How to revert if issues arise]
```

### Document Update Protocols

#### Update Sequence Priority
When implementing approved changes, Claude AI must update documents in this order:

```markdown
1. spec.md (if requirements change)
   - Update user stories and acceptance criteria
   - Modify functional requirements
   - Update technical architecture if needed
   - Adjust success metrics and KPIs

2. design-system.md (if UI/UX changes)
   - Update component specifications
   - Modify user experience flows
   - Adjust visual design system
   - Update interaction patterns

3. blueprint.md (if implementation changes)
   - Update implementation steps
   - Modify technical approach
   - Adjust testing strategy
   - Update deliverables and timelines

4. claude.md (if development guidelines change)
   - Update AI development protocols
   - Modify code standards
   - Adjust testing requirements
   - Update troubleshooting guides

5. todo.md (always update)
   - Add new tasks for implementing changes
   - Update priorities based on new requirements
   - Adjust timeline and resource allocation
   - Document change in decision history

6. CHANGELOG.md (always update)
   - Document the change with full details
   - Include rationale and impact analysis
   - Update version numbers appropriately
```

#### Cross-Reference Management
For each document updated, Claude AI must:

```markdown
1. **Search for References**: Find all references to changed content
   - Direct links to changed sections
   - Contextual references in other documents
   - Implied dependencies and relationships

2. **Update References**: Systematically update all references
   - Update direct links and section references
   - Modify contextual references to match new content
   - Ensure consistency across all documents

3. **Validate Updates**: Test all changes for consistency
   - Verify all links work correctly
   - Check that context still makes sense
   - Ensure no contradictions between documents

4. **Version Management**: Update version information
   - Increment version numbers appropriately
   - Update compatibility matrix
   - Document change history in each affected document
```

### Quality Validation & Rollback

#### Pre-Implementation Validation Checklist
```markdown
Before implementing any approved change, verify:
- [ ] All required approvals obtained
- [ ] Impact analysis is complete and accurate
- [ ] Implementation plan is detailed and feasible
- [ ] Rollback procedure is documented and tested
- [ ] Success criteria are clearly defined
- [ ] Timeline impact is acceptable
- [ ] Resource requirements are available
```

#### Implementation Validation Checklist
```markdown
During implementation, validate:
- [ ] Each document update maintains quality standards
- [ ] Cross-references are updated correctly
- [ ] Version numbers are incremented appropriately
- [ ] No contradictions introduced between documents
- [ ] Technical feasibility is maintained
- [ ] Business requirements are still met
- [ ] Timeline impact remains within approved limits
```

#### Post-Implementation Validation Checklist
```markdown
After implementation is complete, verify:
- [ ] All affected documents are consistent
- [ ] Cross-references work correctly
- [ ] Version compatibility is maintained
- [ ] Change log is complete and accurate
- [ ] Success criteria are met
- [ ] No regression in existing functionality
- [ ] Integration points still work correctly
- [ ] Documentation quality is maintained
```

#### Rollback Procedures
If issues are discovered after implementation:

```markdown
## Immediate Rollback (Critical Issues)
1. **STOP all further work immediately**
2. **Document the issue** encountered
3. **Assess rollback scope** - what needs to be reverted
4. **Execute rollback** in reverse order of implementation
5. **Validate rollback** - ensure system is stable
6. **Report issue** with full details
7. **Plan corrective action** for future attempt

## Planned Rollback (Non-Critical Issues)
1. **Assess the problem** and determine if rollback is needed
2. **Plan rollback sequence** to minimize disruption
3. **Notify stakeholders** of planned rollback
4. **Execute planned rollback** following documented procedure
5. **Validate system state** after rollback
6. **Analyze root cause** and document lessons learned
7. **Update procedures** to prevent similar issues
```

### Advanced Change Management

#### Change Impact Prediction
Claude AI should proactively assess potential change impacts:

```markdown
## Cascade Effect Analysis
When a change is requested, analyze:
- What other features might be affected?
- Which user stories might need updating?
- What technical components have dependencies?
- How might this affect the user experience?
- What testing strategies need modification?

## Future Compatibility Assessment
Consider how changes affect:
- Planned future features and enhancements
- Technical architecture scalability
- User experience consistency
- Platform integration requirements
- Performance and security implications
```

#### Change Batching and Optimization
```markdown
## Related Change Identification
When multiple changes are requested:
- Group related changes for efficient implementation
- Identify conflicts between different change requests
- Optimize implementation sequence for minimal disruption
- Consider combined testing strategies

## Change Timing Optimization
Consider optimal timing for changes:
- Implement related changes together
- Schedule disruptive changes during low-impact periods
- Coordinate with development milestones
- Balance change frequency with stability requirements
```

### Emergency Change Procedures

#### Critical Security or Compliance Changes
```markdown
For changes related to security vulnerabilities or compliance issues:

1. **Immediate Assessment**: Evaluate severity and impact
2. **Fast-Track Approval**: Use expedited approval process
3. **Priority Implementation**: Interrupt current work if necessary
4. **Accelerated Testing**: Focus on critical path validation
5. **Immediate Deployment**: Deploy as soon as validation complete
6. **Post-Implementation Review**: Conduct thorough post-mortem

## Security Change Protocol
- Assess security impact immediately
- Implement with security-first approach
- Test security implications thoroughly
- Document security considerations
- Update security guidelines if needed
```

#### Business-Critical Changes
```markdown
For changes that directly impact the 6-month profitability timeline:

1. **Business Impact Analysis**: Quantify impact on timeline and revenue
2. **Stakeholder Alignment**: Ensure all stakeholders understand implications
3. **Resource Reallocation**: Adjust resource allocation if needed
4. **Timeline Adjustment**: Update project timeline if necessary
5. **Risk Mitigation**: Implement additional risk mitigation strategies
6. **Success Metrics Update**: Adjust success criteria appropriately
```

### Change Communication Protocols

#### Stakeholder Notification
```markdown
## Change Request Submitted
Immediately notify relevant stakeholders:
- Project owner: All Type A and B changes
- Development team: All changes affecting implementation
- QA team: All changes affecting testing strategy
- Product manager: All changes affecting user experience

## Change Approved
When change is approved, notify:
- All stakeholders of implementation timeline
- Development team of specific tasks and priorities
- QA team of new testing requirements
- Documentation team of update requirements

## Change Implemented
After successful implementation, notify:
- All stakeholders of completion
- Users (if applicable) of new functionality
- Support team of changes affecting user support
- Monitoring team of changes affecting system monitoring
```

#### Documentation Communication
```markdown
## Document Update Notifications
When documents are updated due to changes:
- Notify all team members of document version changes
- Highlight specific sections that changed
- Explain rationale for changes
- Provide timeline for reviewing updated documentation

## Cross-Reference Updates
When cross-references are updated:
- Verify all team members are aware of new document structure
- Update any bookmarks or shortcuts to changed sections
- Ensure training materials reference correct sections
- Update onboarding documentation for new team members
```

### Change Metrics and Monitoring

#### Change Process Metrics
Claude AI should track and report:

```markdown
## Process Efficiency Metrics
- Average time from change request to approval
- Average time from approval to implementation
- Change approval rate (first-time vs. revised)
- Rollback rate and reasons

## Quality Metrics
- Documentation consistency score after changes
- Cross-reference accuracy after updates
- User satisfaction with implemented changes
- Defect rate in changed functionality

## Business Impact Metrics
- Timeline impact from approved changes
- Resource utilization for change implementation
- Change-related delays or accelerations
- ROI of implemented changes
```

#### Continuous Improvement
```markdown
## Process Optimization
Regularly assess and improve:
- Change request template effectiveness
- Impact assessment accuracy
- Implementation efficiency
- Rollback procedure effectiveness

## Learning Integration
Document and apply lessons learned:
- Common change patterns and their optimal handling
- Frequently missed impact areas
- Most effective implementation sequences
- Successful risk mitigation strategies
```

---

**🎯 Key Takeaways for Claude AI**:

1. **Always detect requirement changes early** and handle them through the formal process
2. **Never implement changes without proper approval** - this protects project timeline and quality
3. **Use the comprehensive change management framework** documented in `/change-management.md`
4. **Maintain document consistency** through systematic update procedures
5. **Validate thoroughly** at every step to prevent issues and enable easy rollback
6. **Communicate proactively** with all stakeholders throughout the change process
7. **Learn and improve** the change management process based on experience

**⚠️ Critical Warning**: Implementing requirement changes without following this process can lead to:
- Document inconsistencies and contradictions
- Timeline delays and scope creep
- Technical debt and integration issues
- Team confusion and misaligned expectations
- Increased risk of project failure

**✅ Success Criteria**: Following this change management protocol ensures:
- All changes are properly evaluated and approved
- Document consistency is maintained across all updates
- Technical integrity is preserved throughout changes
- Timeline and budget impacts are controlled
- Quality standards are maintained despite changes
- Team alignment and communication is preserved

 
Platform Integration
Integration Priority
🚨 CRITICAL: Cross-platform integration is the #1 technical risk. Every development step must validate platform communication.
Integration Architecture
Data Flow: User Action → Frontend Validation → API Call → Backend Validation → 
          Database Operation → Response → Frontend Update → UI Refresh
Authentication Flow
1.	User initiates login (Google/Apple/Email)
2.	Frontend redirects to Supabase Auth
3.	Supabase returns JWT token to frontend
4.	Frontend stores token and includes in API calls to Railway
5.	Railway validates token with Supabase
6.	API response includes refreshed token if needed
Integration Validation Framework
After Each Major Task - Validate:
•	[ ] Vercel ↔ Railway: API calls work reliably with proper CORS
•	[ ] Railway ↔ Supabase: Database operations succeed with connection pooling
•	[ ] Authentication Flow: Tokens work across all platforms seamlessly
•	[ ] Error Handling: Graceful degradation when any platform unavailable
•	[ ] Performance: Response times meet standards across all endpoints
•	[ ] Data Consistency: No data corruption or loss during operations
Platform-Specific Integration Tests
// Vercel Frontend Integration
test('should connect to Railway backend successfully', async () => {
  const response = await fetch(`${process.env.RAILWAY_BACKEND_URL}/health`);
  expect(response.status).toBe(200);
  
  const data = await response.json();
  expect(data.status).toBe('ok');
  expect(data.timestamp).toBeDefined();
});

// Railway Backend Integration  
test('should connect to Supabase database successfully', async () => {
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .single();
    
  expect(error).toBeNull();
  expect(data).toBeDefined();
});

// Cross-Platform Authentication Test
test('should authenticate user across all platforms', async () => {
  // 1. Login via Supabase
  const { user, session } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123'
  });
  
  expect(session?.access_token).toBeDefined();
  
  // 2. Use token in Railway API call
  const response = await fetch(`${backendUrl}/api/v1/brews`, {
    headers: { 
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });
  
  // 3. Verify response
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.brews).toBeDefined();
});
Error Recovery Procedures
Vercel ↔ Railway Connection Fails
1.	Check CORS configuration in Railway backend
2.	Verify environment variables match across platforms
3.	Test with curl: curl -H "Origin: https://your-app.vercel.app" $RAILWAY_URL/health
4.	Check network tab in browser dev tools for specific error
5.	If still failing: Rollback to last working commit
Railway ↔ Supabase Connection Issues
1.	Verify credentials: Check PROJECT_URL and ANON_KEY in Railway env
2.	Test connection: Use Supabase SQL editor to verify database is accessible
3.	Check RLS policies: Might be blocking legitimate requests
4.	Monitor connection pool: Check for connection exhaustion
5.	Fallback: Switch to local PostgreSQL for development
Complete Platform Outage Response
•	Vercel Outage: Static content cached, inform users of limited functionality
•	Railway Outage: API unavailable, display cached data with warning
•	Supabase Outage: Complete service interruption, show maintenance page
 
Security Guidelines
Security Checklist (Mandatory for All Development)
Input Validation & Sanitization
•	All user inputs validated on both frontend and backend
•	SQL injection prevention using parameterized queries
•	XSS protection with input sanitization and CSP headers
•	File upload validation for future image uploads
Security Headers Configuration
// Add to Express app - specific implementation
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: [
        "'self'", 
        process.env.SUPABASE_URL, 
        process.env.RAILWAY_BACKEND_URL
      ]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: false
}));
Authentication & Authorization
// Example: Middleware validation with comprehensive error handling
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const user = await validateSupabaseToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);
Input Validation Schemas
// Comprehensive validation schemas using Joi or similar
const Joi = require('joi');

const brewValidationSchema = Joi.object({
  beans: Joi.object({
    brand: Joi.string().required().max(100).trim(),
    origin: Joi.string().required().max(100).trim(),
    processing_method: Joi.string().required().valid('washed', 'natural', 'honey'),
    altitude: Joi.number().optional().min(0).max(3000),
    roasting_date: Joi.date().optional().max('now'),
    roasting_level: Joi.string().optional().max(50)
  }).required(),
  
  parameters: Joi.object({
    brewing_method: Joi.string().required().valid('pour-over', 'french-press', 'aeropress'),
    grinder_model: Joi.string().required().max(100).trim(),
    grinder_setting: Joi.string().required().max(50).trim(),
    water_temperature: Joi.number().required().min(80).max(100),
    filtering_tools: Joi.string().optional().max(100),
    water_quality: Joi.string().optional().max(100)
  }).required(),
  
  measurements: Joi.object({
    coffee_beans_weight: Joi.number().required().min(5).max(100),
    water_weight: Joi.number().required().min(50).max(1000),
    brewed_coffee_weight: Joi.number().optional().min(30),
    tds_percentage: Joi.number().optional().min(0).max(3)
  }).required()
});

// Validation middleware
const validateBrew = (req, res, next) => {
  const { error, value } = brewValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
  }
  req.validatedData = value;
  next();
};
Data Protection
•	User Data Isolation: RLS policies in Supabase
•	Personal Data: Minimal collection, secure storage
•	Audit Logging: Track admin actions and data changes
•	Backup Security: Encrypted backups, access control
Security Testing
// Example: Security test
describe('API Security', () => {
  test('should reject requests without valid authentication', async () => {
    const response = await request(app)
      .get('/api/v1/brews')
      .expect(401);
      
    expect(response.body.error).toContain('Authentication');
  });
  
  test('should prevent SQL injection attempts', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await request(app)
      .post('/api/v1/brews')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ beans: { brand: maliciousInput } })
      .expect(400);
      
    expect(response.body.error).toContain('Validation failed');
  });
  
  test('should sanitize XSS attempts', async () => {
    const xssInput = '<script>alert("xss")</script>';
    const response = await request(app)
      .post('/api/v1/brews')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ beans: { brand: xssInput } });
      
    // Should either reject or sanitize the input
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
 
Performance Standards
Performance Requirements
•	Frontend Load Time: <2 seconds initial page load
•	API Response Time: <1 second (95th percentile)
•	Database Queries: <100ms average response time
•	Bundle Size: <500KB initial JavaScript load
•	Lighthouse Score: >90 for Performance, Accessibility, SEO
Performance Monitoring Setup
Frontend Performance (Vercel Analytics)
// Add to _app.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}

// Error boundary with performance logging
const logError = (error, errorInfo) => {
  const performanceData = {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    loadTime: performance.now(),
    memory: performance.memory ? {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    } : null
  };
  
  console.error('Performance Error:', performanceData);
  // Send to monitoring service
};
Backend Performance (Railway + Custom Metrics)
// Add to Express app
const responseTime = require('response-time');

app.use(responseTime((req, res, time) => {
  const logData = {
    method: req.method,
    url: req.url,
    responseTime: `${time}ms`,
    statusCode: res.statusCode,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };
  
  console.log('API Performance:', JSON.stringify(logData));
  
  // Alert if response time is too high
  if (time > 2000) {
    console.warn('⚠️ Slow API response:', logData);
  }
}));

// Database query performance monitoring
const logSlowQuery = (query, duration) => {
  if (duration > 100) {
    console.warn('🐌 Slow database query:', {
      query: query.slice(0, 100) + '...',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  }
};
Performance Optimization Strategies
•	Code Splitting: Lazy load non-critical components
•	Image Optimization: Use Vercel image optimization
•	Caching: API response caching with appropriate TTL
•	Database Indexing: Index frequently queried fields
•	Bundle Analysis: Regular bundle size monitoring
 
Version Control & Code Management
Git Workflow
•	Main branch: main (production-ready code only)
•	Development branch: develop (integration branch)
•	Feature branches: feature/TASK-XXX-brief-description
•	Hotfix branches: hotfix/critical-fix-description
Branching Strategy
main (production)
├── develop (integration)
    ├── feature/TASK-001-database-foundation
    ├── feature/TASK-002-backend-api
    └── feature/TASK-003-authentication
Commit Conventions
[TASK-XXX] Brief description of change

Examples:
[TASK-001] Add Supabase database schema for users and brews
[TASK-002] Implement JWT authentication middleware
[TASK-003] Add TDD tests for SCA calculation functions
Pull Request Process
1.	Create feature branch from develop
2.	Complete task following TDD methodology
3.	Run all tests and linting
4.	Create PR to develop with task description
5.	Self-review checklist before requesting review
6.	Merge only after all checks pass
 
Technical Decision Log
When making significant technical choices, document:
Decision Template
•	Decision: What was chosen
•	Alternatives: What else was considered
•	Rationale: Why this choice was made
•	Impact: How it affects other components
•	Reversibility: How hard would it be to change later
Example Decisions
Chart Library Selection
•	Decision: Use Chart.js instead of D3.js for analytics
•	Alternatives: D3.js, Recharts, Victory
•	Rationale: Chart.js has simpler API, smaller bundle size, meets all current requirements
•	Impact: Polygon charts and SCA graphs will be Chart.js components
•	Reversibility: Medium - would require rewriting chart components
Authentication Strategy
•	Decision: Use Supabase Auth with OAuth providers
•	Alternatives: Custom JWT implementation, Auth0, Firebase Auth
•	Rationale: Integrates perfectly with Supabase database, supports OAuth, handles refresh tokens
•	Impact: All authentication flows go through Supabase, Railway validates tokens
•	Reversibility: High - would require significant backend changes
 
Core Features & Requirements
1. Multi-Step Brew Entry Wizard
•	6 Steps: Coffee beans → Brewing parameters → Turbulence (optional/dynamic) → Measurements → Tasting evaluation → Review
•	Draft System: Auto-save progress, recover on return
•	Validation: Required fields marked with *, optional fields noted
•	Skip Functionality: Users can skip optional sections
2. Brewing Data Structure
Coffee Bean Information:
•	Brand (required), Origin (required), Processing Method (required)
•	Altitude, Roasting Date, Roasting Level (all optional)
Brewing Parameters:
•	Brewing Method (required), Grinder Model/Setting (required)
•	Water Temperature (required), Filtering Tools, Water Quality (optional)
Measurements:
•	Coffee/Water weights (required), Auto-calculated ratios
•	Brewed Coffee Weight, TDS percentage (optional)
Tasting Evaluation (choose one):
•	Quick Tasting Assessment
•	SCA Cupping Protocol (official formulas required)
•	CVA Affective Score
•	CVA Descriptive Assessment
3. Analytics & Visualization
•	Polygon Charts: Compare 2 brews across multiple parameters
•	SCA Ratio Graphs: Coffee-to-water ratio with standard ranges
•	Personal Analytics: Quality trends, brewing frequency, method preferences
4. Organization Features
•	Collections: User-created groupings of brews
•	Favorites: Heart icon toggle for preferred brews
•	Templates: Duplicate previous brews as starting points (input fields only)
5. Data Export
•	Formats: CSV, Excel, PDF
•	Options: Raw data vs calculated values
•	Limits: Max records per export to prevent server overload
 
API Documentation
Base URL Structure
•	Development: http://localhost:3001/api/v1
•	Staging: https://staging-railway-app.railway.app/api/v1
•	Production: https://production-railway-app.railway.app/api/v1
Authentication Endpoints
POST /api/v1/auth/register
POST /api/v1/auth/login  
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/oauth/google
POST /api/v1/auth/oauth/apple
Brew Management Endpoints
GET    /api/v1/brews              # Get user's brews with pagination
POST   /api/v1/brews              # Create new brew
GET    /api/v1/brews/:id          # Get specific brew
PUT    /api/v1/brews/:id          # Update brew
DELETE /api/v1/brews/:id          # Delete brew
POST   /api/v1/brews/:id/duplicate # Duplicate brew as template
Analytics Endpoints
GET /api/v1/analytics/comparison?brew1=:id&brew2=:id
GET /api/v1/analytics/user-stats
GET /api/v1/analytics/charts/:type
Data Export Endpoints
GET /api/v1/export/csv
GET /api/v1/export/excel
GET /api/v1/export/pdf
 
Deployment Procedures
Environment Configuration Matrix
Development Environment
•	Vercel: Preview deployments for feature branches
•	Railway: Development instance with limited resources
•	Supabase: Development project with test data
•	Domain: vercel.app subdomain
Production Environment
•	Vercel: Production deployment with performance optimization
•	Railway: Production instance with auto-scaling
•	Supabase: Production project with backups and monitoring
•	Domain: Custom domain with SSL
Automated CI/CD Pipeline
1.	Code Commit: Developer pushes to repository
2.	Automated Testing: Unit tests, integration tests, security scans
3.	Build Process: Parallel builds for frontend and backend
4.	Staging Deployment: Automatic deployment to staging environment
5.	End-to-End Testing: Automated workflow testing
6.	Production Deployment: Manual approval for production release
7.	Health Checks: Automated verification of deployment success
8.	Rollback: Automated rollback on critical failure detection
Pre-Deployment Checklist
•	[ ] All tests passing (unit, integration, security)
•	[ ] Code quality gates met (ESLint, TypeScript, Prettier)
•	[ ] Performance benchmarks achieved
•	[ ] Integration validation complete across all platforms
•	[ ] Environment variables configured for target environment
•	[ ] Database migrations tested and ready
•	[ ] Monitoring and alerts configured
•	[ ] Security scan completed with no critical issues
•	[ ] Backup procedures verified
•	[ ] Rollback plan documented and tested
 
Monitoring and Alerting
System Health Monitoring
•	Uptime Monitoring: 99.9% availability target across all platforms
•	API Response Times: Alert if response times exceed 2 seconds
•	Database Performance: Monitor query performance and connection pool usage
•	Error Rates: Alert on error rates exceeding 1% of total requests
Critical Failure Alerts
•	Database Connection Issues: Immediate alert to development team
•	Authentication System Failures: High-priority alert with escalation
•	Payment Processing Errors: Critical alert for future monetization features
•	Security Breach Detection: Immediate alert with incident response activation
Performance Metrics
•	User Engagement: Daily active users, brew entries per user, session duration
•	System Performance: Page load times, API response times, database query performance
•	Business Metrics: User registration rates, feature adoption, export usage
 
Troubleshooting Guide
Common Development Issues
Database Connection Issues
Symptoms: Connection timeouts, authentication errors Solutions:
1.	Verify Supabase credentials in environment variables
2.	Check network connectivity to Supabase
3.	Ensure database is not paused (free tier limitation)
4.	Verify RLS policies are not blocking access
CORS Configuration Problems
Symptoms: Frontend can't reach backend API Solutions:
1.	Check CORS configuration in Railway backend
2.	Ensure Vercel domain is in allowed origins
3.	Verify environment-specific CORS settings
4.	Test with browser dev tools network tab
Authentication Failures
Symptoms: Login not working, token validation fails Solutions:
1.	Verify OAuth app configurations (Google/Apple)
2.	Check JWT secret consistency across environments
3.	Ensure Supabase auth settings are correct
4.	Test token flow with API debugging tools
Development Server Issues
Symptoms: "Safari can't connect to the server", localhost not accessible, server won't start
Root Causes & Solutions:
1.	Port Conflicts:
	•	Background Node processes from previous sessions
	•	Zombie React development servers
	•	Solution: Kill processes with lsof -ti:3000,3001,3002,3003 | xargs kill -9
2.	Dependency Conflicts:
	•	TypeScript version mismatch (react-scripts expects ^4, project uses ^5)
	•	Missing modules (ajv/dist/compile/codegen)
	•	npm cache corruption
	•	Solution: npm cache clean --force && npm install --legacy-peer-deps
3.	Package Resolution Issues:
	•	Peer dependency conflicts
	•	Inconsistent package-lock.json
	•	Solution: Use --legacy-peer-deps flag for installations
4.	Build System Failures:
	•	Webpack configuration issues
	•	Host binding problems
	•	Solution: Use explicit PORT=3000 and HOST=0.0.0.0 environment variables
5.	**🚨 CRITICAL: webpack-dev-server Binding Issues (macOS)**
	•	**Symptoms**: Server shows "Compiled successfully!" but browser shows "Safari can't connect to the server"
	•	**Root Cause**: webpack-dev-server fails to bind correctly to localhost despite successful compilation
	•	**Immediate Solution**: Use production build with simple HTTP server
	•	**Why it works**: Simple HTTP server bypasses webpack-dev-server's complex networking stack
	•	**Commands**:
		```bash
		# Build production version
		npm run build
		
		# Serve with simple HTTP server on port 9000
		cd build
		node -e "require('http').createServer((q,s)=>{require('fs').readFile(q.url=='/'?'index.html':'.'+q.url,(e,d)=>{s.end(d||require('fs').readFileSync('index.html'))})}).listen(9000,'127.0.0.1',()=>console.log('✅ Server: http://127.0.0.1:9000'))" &
		
		# Access application at: http://127.0.0.1:9000
		```
	•	**Full Functionality**: This approach provides complete functionality including SCA assessment validation
	•	**Alternative Ports**: Try 9000, 8080, 8000, 8888 if port conflicts occur
Quick Fix Commands:
# Automated cleanup and restart
npm run dev              # Uses automated cleanup script
npm run health           # Check environment health

# Manual recovery steps
lsof -ti:3000,3001,3002,3003 | xargs kill -9  # Kill conflicting processes
npm cache clean --force                       # Clear corrupted cache
rm -rf node_modules package-lock.json         # Full reset
npm install --legacy-peer-deps                # Reinstall with compatibility
PORT=3000 npm start                           # Start with explicit port

# 🚨 CRITICAL: webpack-dev-server Emergency Workaround
# Use when server compiles but browser can't connect
npm run build && cd build && node -e "require('http').createServer((q,s)=>{require('fs').readFile(q.url=='/'?'index.html':'.'+q.url,(e,d)=>{s.end(d||require('fs').readFileSync('index.html'))})}).listen(9000,'127.0.0.1',()=>console.log('Server: http://127.0.0.1:9000'))" &

# Quick test connection
node -e "require('http').get('http://127.0.0.1:9000',(r)=>console.log('✅ Connected:',r.statusCode))"

Prevention:
•	Always use ./scripts/dev-start.sh for automated cleanup
•	Run ./scripts/health-check.sh before starting development
•	Keep TypeScript version compatible with react-scripts (~4.9.5)
•	Use consistent npm scripts (npm run dev instead of npm start)
•	**webpack-dev-server Prevention**:
  - Test connection immediately after server startup: `node -e "setTimeout(()=>require('http').get('http://localhost:3000',(r)=>console.log('Status:',r.statusCode)),3000)"`
  - If connection fails, immediately use emergency fallback instead of debugging
  - Consider updating to react-scripts v5+ or migrating to Vite for better macOS compatibility
  - Keep emergency server script readily available for critical development sessions
Platform-Specific Debugging
Vercel Debugging
•	Build Logs: Check Vercel dashboard for build errors
•	Function Logs: Monitor serverless function execution
•	Analytics: Use Vercel Analytics for performance insights
•	Preview Deployments: Test with preview URLs before production
Railway Debugging
•	Application Logs: Monitor Railway dashboard logs
•	Metrics: Check CPU, memory, and network usage
•	Environment Variables: Verify all variables are set correctly
•	Deployment History: Review deployment logs for issues
Supabase Debugging
•	SQL Editor: Test queries directly in Supabase dashboard
•	Auth Logs: Monitor authentication attempts and failures
•	RLS Policies: Test Row Level Security with different users
•	Database Logs: Check for slow queries and connection issues
Emergency Response Procedures
Application Failure Recovery
1.	Identify Issue: Check monitoring alerts and logs
2.	Assess Impact: Determine which components are affected
3.	Quick Fix: Apply hotfix if issue is minor
4.	Rollback: Revert to previous stable version if needed
5.	Communication: Notify users of any extended downtime

🚨 **Development Server Emergency Fallback**
**When**: webpack-dev-server shows "Compiled successfully!" but browser can't connect
**Immediate Action**:
```bash
# Emergency production build workaround
npm run build
cd build  
node -e "require('http').createServer((q,s)=>{require('fs').readFile(q.url=='/'?'index.html':'.'+q.url,(e,d)=>{s.end(d||require('fs').readFileSync('index.html'))})}).listen(9000,'127.0.0.1',()=>console.log('Emergency server: http://127.0.0.1:9000'))" &
```
**Result**: Full application functionality available at http://127.0.0.1:9000 including SCA assessment
**Recovery Time**: 2-3 minutes (build + server startup)
**When to Use**: Critical development deadlines, demos, SCA assessment validation
Database Failure Recovery
1.	Stop Application: Prevent further data corruption
2.	Assess Data Loss: Determine last known good state
3.	Restore Backup: Use most recent uncorrupted backup
4.	Data Validation: Verify data integrity after restore
5.	Resume Service: Restart application with data verification
 
Project Health Indicators
Green (Healthy Project Status)
•	✅ All tests passing
•	✅ Integration validation successful
•	✅ Performance metrics within standards
•	✅ TODO.md kept up to date
•	✅ Code quality gates passing
•	✅ Security scans clean
Yellow (Attention Needed)
•	⚠️ Some tests failing but not blocking
•	⚠️ Performance slightly below targets
•	⚠️ TODO.md not updated recently
•	⚠️ Minor security warnings
•	⚠️ Integration issues in development
Red (Critical Issues)
•	🚨 Multiple test failures
•	🚨 Integration failures across platforms
•	🚨 Security vulnerabilities
•	🚨 Performance significantly degraded
•	🚨 Production deployment issues
•	🚨 Data integrity problems
Health Check Commands
# Development Environment Health
npm run health             # Run comprehensive health check
npm run dev                # Start development server with cleanup
./scripts/health-check.sh  # Direct health check script
./scripts/dev-start.sh     # Direct development start script

# Individual checks
npm test                    # Run all tests
npm run lint               # Check code quality
npm run type-check         # TypeScript validation
npm run integration-test   # Platform integration
npm run security-audit     # Security scan
 
Working with This Project
🚨 MANDATORY Workflow for Every AI Session
1. Session Start Protocol (Use TODO.md):
1.	📖 Read TODO.md completely, especially:
o	Critical Status Overview (current project state)
o	Current active task and methodology required
o	Known issues/blockers that might affect your work
o	Next Session Guidance (specific instructions for you)
2.	🤝 Follow TODO.md Session Start Actions:
o	Confirm current task scope using exact template from TODO.md
o	Validate environment using health check commands from TODO.md
o	Ask about changes since TODO.md was last updated
3.	🎯 Understand Your Task:
o	Read "Methodology Guidance for Current Task" section in TODO.md
o	Review success criteria and "Don't Do" constraints
o	Check dependencies and verify they're complete
2. During Development (Update TODO.md Throughout):
1.	Work ONLY on the active task listed in TODO.md
2.	Follow the specified methodology (TDD or Rapid Iteration)
3.	Update TODO.md progress as you complete steps
4.	Test integration points listed in TODO.md after major changes
5.	Document new issues/decisions you discover in TODO.md
6.	Follow code quality standards from this Claude.md document
3. Session End Protocol (Complete TODO.md Updates):
1.	Move completed work from Active → Completed in TODO.md
2.	Update all relevant sections in TODO.md:
o	Current Technical State (environment changes)
o	Known Issues & Blockers (new problems discovered)
o	Context & Decision History (decisions made)
o	Change Log (what you accomplished)
3.	Prepare next task - Mark next task as Active if current task is complete
4.	Update "Next Session Guidance" for the next AI
5.	STOP and confirm - Get human approval before proceeding to next task
Common Pitfalls to Avoid
Process Issues
•	Skipping TODO.md: 🚨 NEVER start work without reading TODO.md completely
•	Working on multiple tasks: Only work on the task marked "Active" in TODO.md
•	Wrong methodology: Always check TODO.md for TDD vs Rapid Iteration
•	Assuming requirements: Use TODO.md context and ask for clarification if unclear
TODO.md Management Issues
•	Not updating progress: Update TODO.md during work, not just at the end
•	Incomplete task transitions: Properly move tasks Active → Completed
•	Missing documentation: Always document new issues and decisions
•	Forgetting integration tests: Test and update integration status after changes
Integration Issues
•	CORS Configuration: Must be set correctly for Vercel domains
•	Environment Variables: Different configs for dev/staging/production
•	Token Management: Supabase JWT tokens must work across platforms
•	Database Connections: Connection pooling and retry logic essential
Development Issues
•	Feature Creep: Stick to current task scope, resist adding extras
•	Platform Assumptions: Always test cross-platform integration
•	Performance: Monitor bundle sizes, API response times from start
•	Security: Never skip validation or authentication checks
•	Testing: Don't skip tests for TDD components, even under time pressure
•	Documentation: Document complex business logic as you write it
 
Important References
📋 Essential Documents (Read in Priority Order)
Primary Development Documents:
1.	TODO.md - 🔥 READ FIRST ALWAYS - Current project status, active task, next actions
2.	Claude.md - 📚 REFERENCE GUIDE - This document with comprehensive development guidelines
3.	CupTrack Development Blueprint.docx - 📋 IMPLEMENTATION PLAN - Detailed step-by-step instructions
4.	CupTrack Spec.docx - 📋 REQUIREMENTS - Complete functional requirements and API specifications
Document Usage Guide:
•	For immediate work: Use TODO.md exclusively for current status and next steps
•	For methodology questions: Reference Claude.md sections on TDD, testing, code standards
•	For implementation details: Use Blueprint for step-by-step technical guidance
•	For requirements clarification: Use Spec for feature requirements and acceptance criteria
Quick Reference Sections (After Reading TODO.md):
•	Hybrid TDD Methodology - When to use TDD vs Rapid Iteration
•	Platform Integration - Cross-platform validation steps
•	Security Guidelines - Security requirements and patterns
•	Testing Strategy - Testing approaches and frameworks
•	Troubleshooting Guide - Common issues and solutions
External Standards & Documentation
•	SCA Cupping Protocol: Official scoring formulas and evaluation criteria
•	WCAG 2.1 AA Guidelines: Accessibility compliance requirements
•	Platform Documentation:
o	Vercel: Deployment and environment configuration
o	Railway: Backend hosting and scaling
o	Supabase: Database, authentication, and real-time features
 
🚨 CRITICAL REMINDER: Always start with TODO.md. It contains everything you need to begin work immediately and will direct you to relevant sections of this Claude.md document when needed. This document is comprehensive reference material - TODO.md is your actionable work queue.
This document is living documentation - update it as the project evolves, decisions are made, and new patterns emerge. Keep TODO.md and Claude.md synchronized at all times.

