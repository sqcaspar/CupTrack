# Supabase Database Migration Required

## Issue
The backend authentication system expects `password_hash` and `auth_provider` columns in the `users` table, but they don't exist in the current Supabase database.

## Manual Migration Required

Please run the following SQL in your Supabase SQL Editor:

### Development Database Migration

1. Go to https://app.supabase.com/project/[your-dev-project]/sql
2. Run this SQL:

```sql
-- Add missing columns to users table for authentication system
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'email';

-- Add check constraint for auth_provider
ALTER TABLE users ADD CONSTRAINT users_auth_provider_check 
    CHECK (auth_provider IN ('email', 'google', 'apple'));

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Production Database Migration

1. Go to https://app.supabase.com/project/[your-prod-project]/sql  
2. Run the same SQL as above

## Why This is Needed

The authentication system has two components:
1. **Login**: Uses custom `users` table with `password_hash` (bcrypt) and `auth_provider` fields
2. **Authorization**: Uses custom JWT tokens validated with the `JWT_SECRET`

The demo user needs to exist in the `users` table to authenticate through the `/auth/login` endpoint.

## After Migration

Once you've run the SQL migration:
1. Redeploy the Railway backend (it will detect the new columns)
2. The demo user will be created automatically in the `users` table 
3. Demo authentication will work identically to regular user authentication

## Verification

After migration, the `users` table should have these columns:
- `id` (UUID, primary key)
- `email` (VARCHAR, unique)
- `password_hash` (VARCHAR, nullable initially)
- `auth_provider` (VARCHAR, default 'email')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP) 
- `role` (VARCHAR, default 'user')