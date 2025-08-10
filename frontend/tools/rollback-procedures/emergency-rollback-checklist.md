# Emergency Rollback Checklist

**PURPOSE**: Rapid response checklist for critical system issues requiring immediate rollback  
**USAGE**: Follow steps sequentially during emergency situations  
**TIMELINE**: Complete within 15-30 minutes of issue identification

---

## 🚨 EMERGENCY RESPONSE PROTOCOL

### Immediate Actions (First 5 Minutes)

**Incident Commander**: _________________________  
**Start Time**: ____________________________  
**Issue Severity**: Critical / High / Medium  

#### Step 1: Issue Assessment (2 minutes)
- [ ] **Identify Problem**
  - Problem description: ________________________________________
  - Systems affected: __________________________________________
  - User impact: ______________________________________________
  - Data integrity status: Safe / At Risk / Compromised

- [ ] **Classify Severity**
  - [ ] **CRITICAL**: System down, data at risk, security breach
  - [ ] **HIGH**: Major functionality broken, significant user impact
  - [ ] **MEDIUM**: Partial functionality issues, workarounds available

**Stop Point**: If CRITICAL, execute immediate rollback. If HIGH/MEDIUM, consider alternative solutions first.

#### Step 2: Team Notification (2 minutes)
- [ ] **Alert Key Personnel**
  - Technical lead notified: _______ (Time: _____)
  - Product owner notified: _______ (Time: _____)
  - On-call developer notified: _______ (Time: _____)
  - Support team notified: _______ (Time: _____)

- [ ] **Communication Channels**
  - Slack emergency channel activated: Yes / No
  - Email alerts sent: Yes / No
  - Status page updated: Yes / No
  - User notification prepared: Yes / No

#### Step 3: Rollback Decision (1 minute)
- [ ] **Rollback Criteria Met**
  - Issue cannot be quickly fixed: Yes / No
  - User impact exceeds acceptable threshold: Yes / No
  - Data integrity at risk: Yes / No
  - Security vulnerability present: Yes / No

**Decision**: Proceed with Rollback / Attempt Quick Fix / Monitor

---

## 🔄 ROLLBACK EXECUTION (Next 10-15 minutes)

### Phase 1: Environment Stabilization (3-5 minutes)

- [ ] **Stop New Deployments**
  - Vercel deployments paused: Complete
  - Railway deployments paused: Complete
  - Database migrations halted: Complete
  - CI/CD pipeline paused: Complete

- [ ] **Identify Last Known Good State**
  - Last stable commit ID: _____________________
  - Last stable deployment time: ________________
  - Last successful health check: _______________
  - Database backup timestamp: _________________

- [ ] **Verify Rollback Target**
  - Target commit has been tested: Yes / No
  - Target deployment was stable: Yes / No
  - Database state compatible: Yes / No
  - No known issues in target: Yes / No

### Phase 2: Database Rollback (if needed) (5-7 minutes)

**⚠️ WARNING**: Only perform if data corruption suspected

- [ ] **Database Assessment**
  - Current database state: Stable / Corrupted / Unknown
  - Data loss potential: None / Minimal / Significant
  - Backup availability: Yes / No (Timestamp: ______)
  - Migration rollback needed: Yes / No

- [ ] **Execute Database Rollback** (if required)
  ```bash
  # Database rollback commands (customize for your setup)
  # 1. Create current state backup
  pg_dump -h [SUPABASE_HOST] -U [USER] [DB] > emergency_backup_$(date +%Y%m%d_%H%M%S).sql
  
  # 2. Stop application connections
  # (Update connection strings to maintenance mode)
  
  # 3. Restore from backup
  psql -h [SUPABASE_HOST] -U [USER] [DB] < backup_[TIMESTAMP].sql
  
  # 4. Verify restoration
  # (Run verification queries)
  ```

  - [ ] Current state backed up: Complete
  - [ ] Application disconnected from DB: Complete
  - [ ] Backup restored: Complete
  - [ ] Data integrity verified: Complete

### Phase 3: Application Rollback (3-5 minutes)

- [ ] **Frontend Rollback (Vercel)**
  ```bash
  # Vercel rollback commands
  vercel --prod rollback [DEPLOYMENT_URL]
  # OR
  # Redeploy from stable commit
  git checkout [STABLE_COMMIT_SHA]
  vercel --prod
  ```
  
  - [ ] Stable commit checked out: Complete
  - [ ] Frontend deployment initiated: Complete
  - [ ] Vercel health check passed: Complete
  - [ ] Static assets serving correctly: Complete

- [ ] **Backend Rollback (Railway)**
  ```bash
  # Railway rollback commands
  railway rollback [DEPLOYMENT_ID]
  # OR
  # Redeploy from stable commit
  git checkout [STABLE_COMMIT_SHA]
  railway up
  ```
  
  - [ ] Backend rollback initiated: Complete
  - [ ] Railway health check passed: Complete
  - [ ] API endpoints responding: Complete
  - [ ] Database connections restored: Complete

### Phase 4: System Verification (2-3 minutes)

- [ ] **Critical Path Testing**
  - User authentication working: Complete
  - Core API endpoints responding: Complete
  - Database queries executing: Complete
  - Frontend loading correctly: Complete

- [ ] **Integration Validation**
  - Vercel ↔ Railway communication: Complete
  - Railway ↔ Supabase connection: Complete
  - Authentication flow functional: Complete
  - Error rates within normal range: Complete

- [ ] **Performance Check**
  - Response times within SLA: Complete
  - Error rates <1%: Complete
  - CPU/Memory usage normal: Complete
  - No active alerts: Complete

---

## 📊 POST-ROLLBACK VALIDATION (Next 10 minutes)

### System Health Confirmation

- [ ] **Monitoring Dashboard Review**
  - All systems showing green: Complete
  - Error rates normalized: Complete
  - Response times acceptable: Complete
  - User traffic resuming normally: Complete

- [ ] **User Impact Assessment**
  - Critical workflows functional: Complete
  - No user-reported issues: Complete
  - Support ticket volume normal: Complete
  - Social media mentions stable: Complete

- [ ] **Data Integrity Verification**
  - No data loss detected: Complete
  - User sessions preserved: Complete
  - Transaction integrity maintained: Complete
  - Backup systems functional: Complete

### Communication Update

- [ ] **Internal Communication**
  - Team updated on rollback success: Complete
  - Stakeholders notified: Complete
  - Timeline for fix communicated: Complete
  - Post-mortem scheduled: Complete

- [ ] **External Communication**
  - Status page updated: Complete
  - User notification sent (if needed): Complete
  - Support team briefed: Complete
  - SLA impact assessed: Complete

---

## 📝 INCIDENT DOCUMENTATION

### Rollback Summary
**Rollback Execution Time**: _______ minutes  
**Total System Downtime**: _______ minutes  
**User Impact**: High / Medium / Low  
**Data Loss**: Yes / No (Details: _____________)

### Root Cause Analysis (Preliminary)
**Triggering Event**: _________________________________________  
**Component Failure**: ______________________________________  
**Contributing Factors**: ____________________________________

### Recovery Actions Taken
1. ________________________________________________
2. ________________________________________________  
3. ________________________________________________
4. ________________________________________________

### Lessons Learned
**What Worked Well**:
- ________________________________________________
- ________________________________________________

**What Could Be Improved**:
- ________________________________________________
- ________________________________________________

**Process Improvements Needed**:
- ________________________________________________
- ________________________________________________

---

## 🔍 POST-INCIDENT ACTIONS

### Immediate (Within 2 hours)
- [ ] **System Monitoring Enhanced**
  - Additional monitoring enabled: Complete
  - Alert thresholds reviewed: Complete
  - On-call schedule confirmed: Complete
  - Escalation procedures verified: Complete

- [ ] **Issue Investigation**
  - Detailed log analysis started: Complete
  - Code review of failed changes: Complete
  - Test coverage analysis: Complete
  - Timeline reconstruction: Complete

### Short Term (Within 24 hours)
- [ ] **Post-Mortem Meeting**
  - Meeting scheduled: Date/Time: _______________
  - Attendees identified: _____________________
  - Agenda prepared: Complete
  - Action items template ready: Complete

- [ ] **Process Review**
  - Rollback procedures effectiveness: _________
  - Communication effectiveness: ______________
  - Team response time: ______________________
  - Tool/automation gaps: ____________________

### Long Term (Within 1 week)
- [ ] **Preventive Measures**
  - Additional testing requirements: ___________
  - Monitoring improvements: __________________
  - Process documentation updates: _____________
  - Training needs identified: ________________

- [ ] **Process Improvements**
  - Rollback automation opportunities: _________
  - Communication improvements: _______________
  - Testing strategy enhancements: ____________
  - Infrastructure resilience: _______________

---

## 🛠️ ROLLBACK AUTOMATION SCRIPTS

### Quick Rollback Commands
```bash
#!/bin/bash
# Emergency rollback script
# Usage: ./emergency-rollback.sh [STABLE_COMMIT_SHA]

STABLE_COMMIT=${1:-"main"}
echo "🚨 Starting emergency rollback to $STABLE_COMMIT"

# 1. Checkout stable commit
git fetch origin
git checkout $STABLE_COMMIT

# 2. Deploy frontend
echo "📦 Rolling back frontend..."
vercel --prod --confirm

# 3. Deploy backend  
echo "🔧 Rolling back backend..."
railway up --detach

# 4. Wait and verify
echo "⏳ Waiting for deployments..."
sleep 30

# 5. Basic health check
echo "🏥 Running health checks..."
curl -f https://your-app.vercel.app/health || echo "❌ Frontend health check failed"
curl -f https://your-backend.railway.app/health || echo "❌ Backend health check failed"

echo "✅ Emergency rollback complete"
```

### Health Check Script
```bash
#!/bin/bash
# System health verification
# Usage: ./health-check.sh

echo "🏥 Running comprehensive health checks..."

# API Health
api_status=$(curl -s -o /dev/null -w "%{http_code}" https://your-backend.railway.app/health)
if [ $api_status -eq 200 ]; then
    echo "✅ API: Healthy"
else
    echo "❌ API: Unhealthy (Status: $api_status)"
fi

# Frontend Health
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" https://your-app.vercel.app)
if [ $frontend_status -eq 200 ]; then
    echo "✅ Frontend: Healthy"
else
    echo "❌ Frontend: Unhealthy (Status: $frontend_status)"
fi

# Database Health (example query)
db_check=$(psql $DATABASE_URL -c "SELECT 1;" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Database: Healthy"
else
    echo "❌ Database: Connection failed"
fi

echo "🏁 Health check complete"
```

---

## 📞 EMERGENCY CONTACTS

### Technical Escalation
- **Technical Lead**: _________________ (Phone: _________)
- **Senior Developer**: ______________ (Phone: _________)
- **DevOps Lead**: __________________ (Phone: _________)
- **Database Admin**: _______________ (Phone: _________)

### Business Escalation  
- **Product Owner**: ________________ (Phone: _________)
- **Engineering Manager**: __________ (Phone: _________)
- **Customer Success**: _____________ (Phone: _________)
- **Executive Sponsor**: ____________ (Phone: _________)

### External Support
- **Vercel Support**: support@vercel.com (Priority support if needed)
- **Railway Support**: help@railway.app (Priority support if needed)  
- **Supabase Support**: support@supabase.io (Priority support if needed)

---

**✅ ROLLBACK COMPLETE CHECKLIST**

Final verification before closing incident:
- [ ] All systems operational
- [ ] User impact resolved
- [ ] Monitoring shows normal metrics
- [ ] Team and stakeholders notified
- [ ] Incident documented
- [ ] Post-mortem scheduled
- [ ] Preventive actions identified

**Incident Closed By**: ______________________  
**Closure Time**: ___________________________  
**Total Incident Duration**: __________________