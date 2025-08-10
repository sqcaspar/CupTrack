# Post-Rollback Analysis Template

**PURPOSE**: Systematic analysis of rollback incidents to improve processes and prevent recurrence  
**USAGE**: Complete within 24-48 hours after every rollback incident  
**AUDIENCE**: Technical leads, product owners, development team

---

## Incident Summary

**Incident ID**: RB-YYYY-MM-DD-XXX  
**Analysis Date**: _________________________  
**Analyst**: ____________________________  
**Rollback Type**: Code / Database / Documentation / Full System  
**Severity Level**: Critical / High / Medium / Low

### Basic Information
- **Incident Start Time**: _________________________
- **Rollback Decision Time**: _____________________
- **Rollback Completion Time**: ___________________
- **Service Restoration Time**: ____________________
- **Total Incident Duration**: ____________________

### Impact Assessment
- **Users Affected**: _______ (estimated number)
- **Services Impacted**: ___________________________
- **Data Loss**: Yes / No (Details: ________________)
- **Revenue Impact**: $_______ (estimated)
- **Customer Complaints**: _______ (number received)

---

## Root Cause Analysis

### Primary Root Cause
**Category**: 
- [ ] Code Defect
- [ ] Configuration Error
- [ ] Process Failure
- [ ] Human Error
- [ ] External Dependency
- [ ] Infrastructure Issue
- [ ] Requirements Issue
- [ ] Testing Gap

**Description**: ________________________________________________
____________________________________________________________

### Contributing Factors
1. **Factor 1**: ________________________________________
   - Impact Level: High / Medium / Low
   - Preventable: Yes / No
   - Actions Needed: ____________________________________

2. **Factor 2**: ________________________________________
   - Impact Level: High / Medium / Low  
   - Preventable: Yes / No
   - Actions Needed: ____________________________________

3. **Factor 3**: ________________________________________
   - Impact Level: High / Medium / Low
   - Preventable: Yes / No
   - Actions Needed: ____________________________________

### Triggering Event
**Immediate Trigger**: ____________________________________
**Could Have Been Detected Earlier**: Yes / No
**Detection Method**: ____________________________________
**Time from Introduction to Detection**: ________________
**Time from Detection to Resolution**: __________________

---

## Timeline Analysis

### Incident Timeline
| Time | Event | Actor | Impact |
|------|-------|--------|---------|
| _____ | _____________ | _______ | _________ |
| _____ | _____________ | _______ | _________ |
| _____ | _____________ | _______ | _________ |
| _____ | _____________ | _______ | _________ |
| _____ | _____________ | _______ | _________ |

### Decision Points Analysis
**Key Decision Points**:
1. **Decision**: _______________________________________
   - **Time**: ________________________________________
   - **Rationale**: ___________________________________
   - **Outcome**: Good / Poor / Unknown
   - **Alternative Options**: ____________________________

2. **Decision**: _______________________________________
   - **Time**: ________________________________________
   - **Rationale**: ___________________________________
   - **Outcome**: Good / Poor / Unknown
   - **Alternative Options**: ____________________________

### Response Time Analysis
- **Detection Time**: _____ minutes (target: <5 minutes)
- **Assessment Time**: _____ minutes (target: <10 minutes)
- **Decision Time**: _____ minutes (target: <5 minutes)
- **Execution Time**: _____ minutes (target: <30 minutes)
- **Validation Time**: _____ minutes (target: <15 minutes)

**Performance vs. Targets**:
- [ ] Met all time targets
- [ ] Met most time targets (4/5)
- [ ] Met some time targets (2-3/5)
- [ ] Met few time targets (1/5)
- [ ] Met no time targets (0/5)

---

## Process Effectiveness Analysis

### Change Management Process
- [ ] **Change Request Process**
  - Change request existed: Yes / No
  - Proper approval obtained: Yes / No
  - Impact assessment completed: Yes / No
  - Risk assessment adequate: Yes / No

- [ ] **Review Process**
  - Code review completed: Yes / No
  - Technical review adequate: Yes / No
  - Business review conducted: Yes / No
  - Security review performed: Yes / No

- [ ] **Testing Process**
  - Unit tests existed: Yes / No
  - Integration tests passed: Yes / No
  - Manual testing performed: Yes / No
  - Performance testing done: Yes / No

**Process Gaps Identified**:
1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

### Monitoring and Alerting
- [ ] **Detection Capabilities**
  - Issue was automatically detected: Yes / No
  - Alerts fired correctly: Yes / No
  - Alert timing was adequate: Yes / No
  - Alert information was sufficient: Yes / No

- [ ] **Monitoring Gaps**
  - Missing monitoring for: ____________________________
  - Alert threshold issues: ____________________________
  - Dashboard visibility problems: ______________________

### Team Response
- [ ] **Communication Effectiveness**
  - Team notified promptly: Yes / No
  - Communication channels worked: Yes / No
  - Information sharing adequate: Yes / No
  - External communication timely: Yes / No

- [ ] **Technical Response**
  - Team had necessary skills: Yes / No
  - Tools were available: Yes / No
  - Procedures were followed: Yes / No
  - Escalation worked properly: Yes / No

---

## What Went Well

### Positive Aspects
1. **Response Speed**: ____________________________________
2. **Team Coordination**: ________________________________
3. **Technical Execution**: _______________________________
4. **Communication**: ____________________________________
5. **Decision Making**: ___________________________________

### Effective Procedures
1. ________________________________________________
2. ________________________________________________  
3. ________________________________________________

### Team Performance Highlights
1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

---

## Areas for Improvement

### Process Improvements Needed
1. **Improvement Area**: ________________________________
   - **Current Gap**: __________________________________
   - **Proposed Solution**: ______________________________
   - **Priority**: High / Medium / Low
   - **Timeline**: ____________________________________
   - **Owner**: ______________________________________

2. **Improvement Area**: ________________________________
   - **Current Gap**: __________________________________
   - **Proposed Solution**: ______________________________
   - **Priority**: High / Medium / Low
   - **Timeline**: ____________________________________
   - **Owner**: ______________________________________

3. **Improvement Area**: ________________________________
   - **Current Gap**: __________________________________
   - **Proposed Solution**: ______________________________
   - **Priority**: High / Medium / Low
   - **Timeline**: ____________________________________
   - **Owner**: ______________________________________

### Technical Improvements
1. **Monitoring Enhancement**: ____________________________
2. **Automation Opportunity**: ____________________________
3. **Tool Improvement**: __________________________________
4. **Infrastructure Change**: ______________________________

### Training and Knowledge Gaps
1. **Skill Gap**: ____________________________________
   - **Affected Team Members**: _________________________
   - **Training Plan**: ________________________________

2. **Process Knowledge**: ________________________________
   - **Documentation Needed**: _____________________________
   - **Training Required**: _______________________________

---

## Preventive Actions

### Immediate Actions (Within 1 Week)
- [ ] **Action 1**: ____________________________________
  - **Responsible**: ____________________________________
  - **Due Date**: ____________________________________
  - **Success Criteria**: _______________________________

- [ ] **Action 2**: ____________________________________
  - **Responsible**: ____________________________________
  - **Due Date**: ____________________________________
  - **Success Criteria**: _______________________________

- [ ] **Action 3**: ____________________________________
  - **Responsible**: ____________________________________
  - **Due Date**: ____________________________________
  - **Success Criteria**: _______________________________

### Short-term Actions (Within 1 Month)
- [ ] **Action 1**: ____________________________________
  - **Responsible**: ____________________________________
  - **Due Date**: ____________________________________
  - **Success Criteria**: _______________________________

- [ ] **Action 2**: ____________________________________
  - **Responsible**: ____________________________________
  - **Due Date**: ____________________________________
  - **Success Criteria**: _______________________________

### Long-term Actions (Within 3 Months)
- [ ] **Action 1**: ____________________________________
  - **Responsible**: ____________________________________
  - **Due Date**: ____________________________________
  - **Success Criteria**: _______________________________

- [ ] **Action 2**: ____________________________________
  - **Responsible**: ____________________________________
  - **Due Date**: ____________________________________
  - **Success Criteria**: _______________________________

---

## Impact on Project Goals

### 6-Month Profitability Timeline
- **Timeline Impact**: No Impact / Minor Delay / Significant Delay
- **Mitigation Strategies**: ______________________________
- **Scope Adjustments**: _________________________________

### Feature Development Impact
- **Features Delayed**: __________________________________
- **Resource Reallocation**: ______________________________
- **Priority Changes**: __________________________________

### Quality and Technical Debt
- **Technical Debt Added**: ______________________________
- **Quality Standards Impact**: ____________________________
- **Testing Strategy Changes**: ____________________________

---

## Cost Analysis

### Direct Costs
- **Development Time Lost**: ______ hours × $____/hour = $_______
- **System Downtime Cost**: ______ hours × $____/hour = $_______
- **Customer Support Costs**: $_______
- **Recovery Effort**: ______ hours × $____/hour = $_______

### Indirect Costs
- **Customer Satisfaction Impact**: _________________________
- **Team Morale Impact**: ______________________________
- **Brand Reputation**: ______________________________
- **Future Sales Impact**: _______________________________

### Total Estimated Cost
**Direct Costs**: $_______
**Indirect Costs**: $_______ (estimated)
**Total Cost**: $_______

### Cost Avoidance Through Prevention
**Estimated Cost of Similar Future Incidents**: $_______
**Investment in Prevention**: $_______
**ROI of Prevention**: _______% (if prevention cost is less)

---

## Knowledge Sharing

### Lessons Learned Documentation
- [ ] **Wiki Article Created**: Title: _________________________
- [ ] **Team Presentation**: Date: ___________________________  
- [ ] **Process Documentation Updated**: _____________________
- [ ] **Runbook Enhanced**: _______________________________

### Training Materials
- [ ] **Training Session**: Topic: ____________________________
- [ ] **Documentation Update**: Topic: ________________________
- [ ] **Best Practices Guide**: Topic: _______________________

### Cross-Team Sharing
- [ ] **Other Teams Notified**: Which teams: ____________________
- [ ] **Company-Wide Learning**: Method: ______________________
- [ ] **Industry Sharing**: Conference/blog post: _______________

---

## Monitoring and Follow-up

### Action Item Tracking
**Tracking Method**: _____________________________________
**Review Frequency**: ___________________________________
**Progress Reporting**: __________________________________

### Success Metrics
1. **Metric**: ______________________________________
   - **Current Value**: ____________________________
   - **Target Value**: _____________________________
   - **Measurement Date**: _________________________

2. **Metric**: ______________________________________
   - **Current Value**: ____________________________
   - **Target Value**: _____________________________
   - **Measurement Date**: _________________________

### Follow-up Schedule
- [ ] **1 Week Review**: Date: _______ Responsible: __________
- [ ] **1 Month Review**: Date: _______ Responsible: __________  
- [ ] **3 Month Review**: Date: _______ Responsible: __________
- [ ] **6 Month Review**: Date: _______ Responsible: __________

---

## Sign-off and Approval

### Review and Approval
- [ ] **Technical Accuracy Reviewed By**: ______________________
  - **Date**: _____________ **Signature**: _________________

- [ ] **Process Compliance Reviewed By**: ____________________
  - **Date**: _____________ **Signature**: _________________

- [ ] **Business Impact Reviewed By**: _______________________ 
  - **Date**: _____________ **Signature**: _________________

- [ ] **Final Approval By**: _________________________________
  - **Date**: _____________ **Signature**: _________________

### Distribution List
- [ ] Development Team
- [ ] Technical Leadership  
- [ ] Product Management
- [ ] QA Team
- [ ] DevOps Team
- [ ] Customer Support
- [ ] Executive Team (for Critical/High severity)

### Archive and Reference
**Document Location**: ____________________________________
**Reference ID**: ______________________________________ 
**Related Documents**: ___________________________________

---

## Appendices

### Appendix A: Technical Details
[Include detailed technical information, logs, code snippets, etc.]

### Appendix B: Communication Timeline
[Include all communications sent during the incident]

### Appendix C: Monitoring Data
[Include relevant monitoring charts, metrics, alerts]

### Appendix D: Customer Impact Evidence
[Include support tickets, user feedback, social media mentions]

---

**Analysis Completed By**: _________________________  
**Completion Date**: ___________________________  
**Review Cycle**: ______________________________ 
**Next Review Date**: ___________________________