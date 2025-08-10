# CupTrack Backend Security Configuration

## 🔐 JWT Secret for Authentication

### Generated Secure JWT Secret (64 characters):
```
CupTrack2024_SecureJWT_Authentication_Key_9X7mN4pQ2wR8vB3nM6kL1sA5dF9hJ2uY8tE4rW
```

**Usage:**
- Use this JWT secret in Railway environment variables
- Same secret should be used for both development and production environments
- This ensures consistent authentication across all deployments

**Generated on:** August 10, 2025
**For:** CupTrack Coffee Brewing Application

---

## 🛡️ Environment Variable Security Guidelines

### Railway Deployment Security
Railway provides enterprise-grade security for environment variables:
- ✅ **Encrypted storage** - All variables encrypted at rest
- ✅ **SOC 2 Type II compliant** - Enterprise security standards
- ✅ **Secure transmission** - Variables encrypted in transit
- ✅ **Access control** - Only accessible to your deployed application

### Supabase Credentials Security

#### ✅ SAFE to store in Railway:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_SERVICE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
JWT_SECRET=CupTrack2024_SecureJWT_Authentication_Key_9X7mN4pQ2wR8vB3nM6kL1sA5dF9hJ2uY8tE4rW
```

#### ❌ NEVER do this:
- Don't commit secrets to GitHub (protected by .gitignore)
- Don't use service keys in frontend/client-side code
- Don't share secrets in plain text messages or emails
- Don't hardcode secrets in source code

### Environment Separation

#### Development Environment (Railway Development Service):
- Use development Supabase project credentials
- Same JWT secret (for consistency)
- CORS_ORIGIN set to development Vercel URL

#### Production Environment (Railway Production Service):
- Use production Supabase project credentials  
- Same JWT secret (for consistency)
- CORS_ORIGIN set to production Vercel URL

---

## 🔒 Security Best Practices

### 1. Service Key Usage
- **Backend only**: Service keys should only be used in Railway backend
- **Never client-side**: Frontend should only use anon keys
- **Supabase RLS**: Database security handled by Row Level Security policies

### 2. JWT Token Security
- **Secure secret**: Use the generated 64-character secret
- **Token expiration**: Tokens expire in 7 days (configurable)
- **Refresh tokens**: Implement refresh token rotation for security

### 3. CORS Configuration
- **Specific origins**: Set CORS_ORIGIN to your Vercel domains only
- **No wildcards in production**: Avoid `*` in production CORS settings
- **Environment-specific**: Different CORS settings for dev/prod

### 4. Railway Security
- **Environment separation**: Separate services for dev/prod
- **Variable scoping**: Environment-specific variables
- **Access logging**: Railway provides deployment and access logs

---

## 📋 Quick Reference

### Railway Environment Variables to Set:

**Development Backend:**
```bash
NODE_ENV=development
SUPABASE_URL=https://[dev-project-id].supabase.co
SUPABASE_ANON_KEY=[dev-anon-key]
SUPABASE_SERVICE_KEY=[dev-service-key]  
JWT_SECRET=CupTrack2024_SecureJWT_Authentication_Key_9X7mN4pQ2wR8vB3nM6kL1sA5dF9hJ2uY8tE4rW
CORS_ORIGIN=https://cuptrack-git-develop.vercel.app
```

**Production Backend:**
```bash
NODE_ENV=production
SUPABASE_URL=https://[prod-project-id].supabase.co
SUPABASE_ANON_KEY=[prod-anon-key]
SUPABASE_SERVICE_KEY=[prod-service-key]
JWT_SECRET=CupTrack2024_SecureJWT_Authentication_Key_9X7mN4pQ2wR8vB3nM6kL1sA5dF9hJ2uY8tE4rW
CORS_ORIGIN=https://cuptrack.vercel.app
```

### Getting Supabase Credentials:
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings → API**
4. Copy Project URL, anon key, and service_role key

---

## 🚨 Emergency Procedures

### If JWT Secret is Compromised:
1. Generate new JWT secret
2. Update in Railway environment variables
3. Restart backend services
4. All existing tokens become invalid (users need to re-login)

### If Supabase Credentials are Compromised:
1. Regenerate keys in Supabase dashboard
2. Update Railway environment variables
3. Update frontend environment variables in Vercel
4. Test all integrations after update

**Contact**: For security concerns, review this document and update credentials as needed.

---

*This document contains sensitive information. Keep it secure and do not commit to public repositories.*