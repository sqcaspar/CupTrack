# Change Request Template

**INSTRUCTIONS**: Copy this template and fill in all sections. Replace all placeholder text in [brackets] with actual information. Remove instructional text before submitting.

---

# Change Request CR-[YYYY-MM-DD-XXX]

**Example ID Format**: CR-2025-01-15-001 (use sequential number for day)

## Basic Information

- **Request ID**: CR-[YYYY-MM-DD-XXX]
- **Submission Date**: [Current date in YYYY-MM-DD format]
- **Requested By**: [Your name/role or "User" if from external request]
- **Change Type**: [Select one: A/B/C/D] - [Provide justification for classification]
  - **Type A**: New feature or major functionality addition
  - **Type B**: Modification to existing functionality
  - **Type C**: Bug fix or performance improvement
  - **Type D**: Documentation, configuration, or non-functional change
- **Priority**: [Select one: Critical/High/Medium/Low]
  - **Critical**: Blocks progress or creates security/data risks
  - **High**: Significant impact on user experience or timeline
  - **Medium**: Moderate impact, can be scheduled normally
  - **Low**: Nice-to-have, minimal impact

## Change Description

### Current State
[Detailed description of current implementation/requirements]
- What exists now?
- How does it currently work?
- What are the current limitations or problems?

**Example**: "Currently, users can export brew data only in CSV format through the analytics dashboard. The export is limited to 100 records and doesn't include collection information."

### Proposed Change
[Detailed description of requested change]
- What should change?
- How should it work differently?
- What new functionality is needed?

**Example**: "Add PDF export option with unlimited record count and include collection metadata in both CSV and PDF exports."

### Business Justification
[Why this change is needed - extract from user's reasoning]
- What problem does this solve?
- What business value does it provide?
- How does it align with the 6-month profitability goal?

**Example**: "Users have requested PDF exports for sharing with colleagues and unlimited record counts for comprehensive analysis. This improves user satisfaction and reduces support requests."

## Impact Assessment

### Affected Components
**Instructions**: Check all that apply and provide details

- [ ] **spec.md** - Functional requirements change
  - Details: [What requirements need updating?]
- [ ] **design-system.md** - UI/UX changes
  - Details: [What design elements are affected?]
- [ ] **blueprint.md** - Implementation approach change
  - Details: [How does implementation change?]
- [ ] **claude.md** - Development guidelines change
  - Details: [What guidelines need updating?]
- [ ] **Frontend Components** - React components
  - Details: [Which components and how?]
- [ ] **Backend APIs** - Server-side changes
  - Details: [Which endpoints and what modifications?]
- [ ] **Database Schema** - Data model changes
  - Details: [What schema changes are needed?]
- [ ] **Authentication** - Auth system changes
  - Details: [How is authentication affected?]
- [ ] **Third-party Integration** - Platform connectivity
  - Details: [Vercel/Railway/Supabase changes?]
- [ ] **Testing Strategy** - Test modifications needed
  - Details: [What tests need updating/adding?]

### Timeline Impact

- **Development Time**: [Estimated hours/days with reasoning]
  - Example: "8 hours - 4 hours for PDF generation utility, 4 hours for UI integration"
- **Testing Time**: [Estimated hours/days with reasoning]
  - Example: "4 hours - Integration testing and export validation"
- **Documentation Time**: [Estimated hours/days with reasoning]
  - Example: "2 hours - Update user documentation and API docs"
- **Total Impact**: [Total estimated time]
  - Example: "14 hours (approximately 2 development days)"
- **Critical Path Effect**: [Yes/No with explanation]
  - Example: "No - This is enhancement work that doesn't block core functionality"

### Resource Requirements
[What resources are needed to implement this change]
- Development skills needed
- External dependencies
- Third-party services or tools
- Testing environments

**Example**: "Requires PDF generation library (jsPDF or similar), testing with various export sizes, validation across different browsers"

## Risk Assessment

### Technical Risks
[Identified risks and mitigation strategies]

**Format**: [Risk] → [Impact] → [Mitigation]

**Example**: 
- Large export size → Performance issues → Implement streaming/chunked export
- PDF generation complexity → Development delays → Use well-established library with good documentation
- Browser compatibility → Export failures → Test across major browsers and provide fallbacks

### Business Risks
[Impact on timeline, scope, quality]
- Will this delay other features?
- Does this affect the 6-month timeline?
- Are there quality concerns?

### Timeline Risks
[Effect on 6-month profitability goal]
- How does this change affect the overall timeline?
- What are the opportunity costs?
- Should other features be deprioritized?

## Implementation Plan

### Update Sequence
[Prioritized list of documents and components to update]

**Recommended Order**:
1. [First document/component to update and why]
2. [Second document/component to update and why]
3. [Continue with all affected items...]

**Example**:
1. spec.md - Add export requirements and acceptance criteria
2. blueprint.md - Add PDF export implementation steps  
3. Frontend export utilities - Implement PDF generation
4. Export UI components - Add PDF option to interface
5. Integration tests - Validate new export functionality

### Testing Plan
[How the change will be validated]
- Unit tests needed
- Integration tests required
- Manual testing steps
- Performance validation
- Cross-browser testing

### Rollback Plan
[How to revert if issues arise]
- What can be easily reversed?
- What requires more complex rollback?
- How to detect if rollback is needed?
- Steps to execute rollback safely

## Approval Requirements

**Change Type A**: Product owner approval required
**Change Type B**: Technical lead approval sufficient  
**Change Type C**: Can proceed with documentation
**Change Type D**: Minimal approval needed

**For this change**: [State what approvals are needed based on change type]

## Communication Plan

**Who needs to be notified?**
- [ ] Development team
- [ ] Product owner
- [ ] QA team
- [ ] End users (if user-facing)
- [ ] Support team
- [ ] Documentation team

**When to communicate:**
- [ ] Change request submitted
- [ ] Change approved/rejected
- [ ] Implementation started
- [ ] Implementation completed
- [ ] Rollback executed (if needed)

---

## Submission Checklist

Before submitting this change request, verify:

- [ ] All sections are completed with actual information (no [placeholder] text remains)
- [ ] Business justification clearly explains the value
- [ ] Impact assessment is thorough and realistic
- [ ] Timeline estimates are based on actual work complexity
- [ ] Risk assessment includes mitigation strategies
- [ ] Implementation plan has clear, actionable steps
- [ ] Testing approach is comprehensive
- [ ] Rollback plan is feasible and documented
- [ ] Appropriate stakeholders are identified for approval

**Submitted by**: [Your name]  
**Date**: [Submission date]  
**Status**: Pending Review