# Change Impact Assessment Checklist

**Purpose**: Systematic evaluation of change impacts across all project dimensions  
**Usage**: Complete this checklist for every change request before implementation  
**Time**: Allow 15-30 minutes for thorough assessment  

---

## Pre-Assessment Information

**Change Request ID**: _______________________  
**Assessor**: ____________________________  
**Assessment Date**: _____________________  
**Change Summary**: _________________________________________________

---

## 1. Document Impact Analysis

### Core Documentation
- [ ] **spec.md** - Functional requirements
  - Impact Level: None / Minor / Major / Critical
  - Specific sections affected: ________________________________
  - New content needed: Yes / No
  - Existing content modification: Yes / No

- [ ] **design-system.md** - UI/UX specifications  
  - Impact Level: None / Minor / Major / Critical
  - Components affected: ____________________________________
  - New design patterns: Yes / No
  - Visual changes required: Yes / No

- [ ] **blueprint.md** - Implementation plan
  - Impact Level: None / Minor / Major / Critical
  - Implementation steps affected: ____________________________
  - New tasks required: Yes / No
  - Task priority changes: Yes / No

- [ ] **claude.md** - Development guidelines
  - Impact Level: None / Minor / Major / Critical
  - Guidelines affected: ____________________________________
  - New development patterns: Yes / No
  - Code standards changes: Yes / No

- [ ] **TODO.md** - Task management
  - Impact Level: None / Minor / Major / Critical
  - Tasks to add: _________________________________________
  - Tasks to modify: _____________________________________
  - Priority rebalancing needed: Yes / No

### Supporting Documentation
- [ ] **CHANGELOG.md** - Change history
  - New entry required: Yes / No
  - Version impact: Patch / Minor / Major
  
- [ ] **README.md** - Setup instructions
  - Updates needed: Yes / No
  - New dependencies: Yes / No

- [ ] **API Documentation**
  - Endpoints affected: ____________________________________
  - New endpoints: Yes / No
  - Breaking changes: Yes / No

---

## 2. Technical Component Impact

### Frontend Components
- [ ] **React Components**
  - Components affected: ____________________________________
  - New components needed: Yes / No
  - Breaking changes: Yes / No
  - CSS/Styling changes: Yes / No

- [ ] **Services & Utilities**
  - Services affected: _____________________________________
  - New services needed: Yes / No
  - API client changes: Yes / No
  - Utility function changes: Yes / No

- [ ] **State Management**
  - Context changes: Yes / No
  - New state variables: Yes / No
  - State migration needed: Yes / No

### Backend Systems
- [ ] **API Endpoints**
  - Endpoints to modify: ___________________________________
  - New endpoints needed: Yes / No
  - Authentication changes: Yes / No
  - Validation changes: Yes / No

- [ ] **Database Schema**
  - Tables affected: _____________________________________
  - New tables/columns: Yes / No
  - Migration scripts: Yes / No
  - Data transformation: Yes / No

- [ ] **Business Logic**
  - Calculation changes: Yes / No
  - Validation rules: Yes / No
  - Workflow changes: Yes / No

### Platform Integration
- [ ] **Vercel (Frontend Hosting)**
  - Configuration changes: Yes / No
  - Environment variables: Yes / No
  - Build process changes: Yes / No

- [ ] **Railway (Backend Hosting)**
  - Configuration changes: Yes / No
  - Environment variables: Yes / No
  - Deployment changes: Yes / No

- [ ] **Supabase (Database & Auth)**
  - Schema changes: Yes / No
  - RLS policy changes: Yes / No
  - Auth configuration: Yes / No

---

## 3. Timeline & Resource Impact

### Development Time Estimation
**Instructions**: Estimate realistically, include buffer time

- **Analysis & Design**: _______ hours
- **Frontend Development**: _______ hours  
- **Backend Development**: _______ hours
- **Database Changes**: _______ hours
- **Integration Work**: _______ hours
- **Testing & QA**: _______ hours
- **Documentation Updates**: _______ hours
- **Deployment & Validation**: _______ hours

**Total Estimated Time**: _______ hours (_______ days)

### Resource Requirements
- [ ] **Skills Needed**
  - Frontend React development: Yes / No
  - Backend Node.js development: Yes / No
  - Database design: Yes / No
  - UI/UX design: Yes / No
  - DevOps/deployment: Yes / No
  - Other: ____________________________________________

- [ ] **External Dependencies**
  - New libraries/packages: Yes / No
  - Third-party services: Yes / No
  - External APIs: Yes / No
  - Design assets: Yes / No

### Critical Path Analysis
- [ ] **Timeline Impact**
  - Blocks other work: Yes / No
  - Can be done in parallel: Yes / No
  - Depends on other tasks: Yes / No
  - Critical for milestone: Yes / No

- [ ] **6-Month Profitability Goal**
  - Supports goal: Yes / No / Neutral
  - Delays goal: Yes / No
  - Changes scope of goal: Yes / No

---

## 4. Risk Assessment Matrix

### Technical Risks
**Format**: [Risk] → [Probability: High/Med/Low] → [Impact: High/Med/Low] → [Mitigation]

1. _______________________________________________________________
2. _______________________________________________________________  
3. _______________________________________________________________

### Business Risks
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Quality Risks  
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Integration Risks
- [ ] **Cross-Platform Communication**
  - Vercel ↔ Railway: Risk Level: None / Low / Med / High
  - Railway ↔ Supabase: Risk Level: None / Low / Med / High
  - Authentication flow: Risk Level: None / Low / Med / High

---

## 5. Testing Impact Assessment

### Testing Strategy Changes
- [ ] **Unit Tests**
  - New tests needed: _______ (estimated count)
  - Existing tests to modify: _______ (estimated count)
  - Test coverage impact: Increase / Decrease / Same

- [ ] **Integration Tests**  
  - New integration scenarios: _____________________________
  - Existing tests affected: _______________________________
  - Cross-platform validation: Yes / No

- [ ] **Manual Testing**
  - User workflow changes: Yes / No
  - New testing scenarios: ________________________________
  - Regression testing scope: _____________________________

### TDD Impact (for TDD-classified components)
- [ ] Component requires TDD: Yes / No
- [ ] Red-Green-Refactor cycles needed: _______ (estimated)
- [ ] Business logic testing critical: Yes / No

---

## 6. Quality Assurance Checklist

### Code Quality Standards
- [ ] **TypeScript Compliance**
  - New types needed: Yes / No
  - Strict mode compatibility: Yes / No
  - Interface changes: Yes / No

- [ ] **Performance Considerations**
  - Bundle size impact: Increase / Decrease / None
  - Runtime performance: Better / Worse / Same
  - Database query impact: Yes / No

- [ ] **Security Implications**
  - Authentication changes: Yes / No
  - Authorization changes: Yes / No
  - Data validation changes: Yes / No
  - Security review needed: Yes / No

### Accessibility & Usability
- [ ] **User Experience Impact**
  - Workflow changes: Yes / No
  - Learning curve: Easy / Moderate / Difficult
  - User documentation updates: Yes / No

- [ ] **Accessibility (WCAG)**
  - New UI elements: Yes / No
  - Keyboard navigation: Yes / No
  - Screen reader compatibility: Yes / No

---

## 7. Implementation Priority Matrix

### Change Classification
Based on impact assessment, classify this change:

**Impact Score Calculation**:
- High impact item = 3 points
- Medium impact item = 2 points  
- Low impact item = 1 point
- No impact item = 0 points

**Total Score**: _______ points

**Classification**:
- 0-5 points: **Low Impact** - Can proceed with minimal oversight
- 6-10 points: **Medium Impact** - Requires standard approval process
- 11-15 points: **High Impact** - Requires detailed review and stakeholder alignment
- 16+ points: **Critical Impact** - Requires executive approval and careful planning

### Recommended Priority
Based on business value vs. implementation complexity:

- [ ] **High Priority** - High value, low complexity
- [ ] **Medium Priority** - Moderate value and complexity
- [ ] **Low Priority** - Low value or high complexity  
- [ ] **Defer** - Low value, high complexity

---

## 8. Final Assessment Summary

### Overall Impact Rating
**Final Rating**: Low / Medium / High / Critical

### Key Concerns
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Success Factors
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Recommendation
- [ ] **Approve** - Benefits outweigh costs and risks
- [ ] **Approve with Conditions** - Requires specific mitigations
- [ ] **Defer** - Should be implemented later
- [ ] **Reject** - Costs/risks outweigh benefits

### Conditions (if applicable)
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

---

## Assessment Sign-off

**Assessor Signature**: _________________________ **Date**: __________  
**Reviewer Signature**: _________________________ **Date**: __________  
**Approval Authority**: _________________________ **Date**: __________

**Status**: ☐ Pending Review ☐ Approved ☐ Approved with Conditions ☐ Rejected ☐ Deferred