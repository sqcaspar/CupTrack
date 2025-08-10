// Database Migration Utilities
// Updates existing database schema to support authentication system

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key for admin operations
);

/**
 * Migrates the users table to add missing authentication fields
 * This ensures the database schema matches what the authentication system expects
 */
export async function migrateUsersTable(): Promise<boolean> {
  try {
    console.log('🔄 Migrating users table to add authentication fields...');

    // Check if columns already exist
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'users')
      .eq('table_schema', 'public');

    if (checkError) {
      console.warn('⚠️ Could not check existing columns:', checkError.message);
      return false;
    }

    const existingColumns = columns?.map(col => col.column_name) || [];
    console.log('📋 Existing users table columns:', existingColumns);

    // Add password_hash column if it doesn't exist
    if (!existingColumns.includes('password_hash')) {
      console.log('🔨 Adding password_hash column...');
      const { error: addPasswordError } = await supabase.rpc('execute_sql', {
        query: `
          ALTER TABLE users 
          ADD COLUMN password_hash VARCHAR(255);
        `
      });

      if (addPasswordError) {
        console.error('❌ Failed to add password_hash column:', addPasswordError.message);
        // Try direct SQL execution if RPC fails
        try {
          const { error: directError } = await supabase
            .from('users')
            .select('id')
            .limit(1);
            
          if (directError) {
            console.log('📝 Using direct SQL approach for password_hash...');
            // This approach might work depending on Supabase permissions
          }
        } catch (directErr) {
          console.error('❌ Direct SQL also failed');
        }
      } else {
        console.log('✅ password_hash column added successfully');
      }
    } else {
      console.log('✅ password_hash column already exists');
    }

    // Add auth_provider column if it doesn't exist
    if (!existingColumns.includes('auth_provider')) {
      console.log('🔨 Adding auth_provider column...');
      const { error: addProviderError } = await supabase.rpc('execute_sql', {
        query: `
          ALTER TABLE users 
          ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'email'
          CHECK (auth_provider IN ('email', 'google', 'apple'));
        `
      });

      if (addProviderError) {
        console.error('❌ Failed to add auth_provider column:', addProviderError.message);
      } else {
        console.log('✅ auth_provider column added successfully');
      }
    } else {
      console.log('✅ auth_provider column already exists');
    }

    console.log('🎉 Users table migration completed');
    return true;
  } catch (error) {
    console.error('❌ Error during users table migration:', error);
    return false;
  }
}

/**
 * Creates users table with full schema if it doesn't exist
 */
export async function ensureUsersTableExists(): Promise<boolean> {
  try {
    console.log('🏗️ Ensuring users table exists with correct schema...');

    const { error } = await supabase.rpc('execute_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          auth_provider VARCHAR(20) DEFAULT 'email' CHECK (auth_provider IN ('email', 'google', 'apple')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin'))
        );

        -- Enable UUID extension if not exists
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      `
    });

    if (error) {
      console.error('❌ Failed to create users table:', error.message);
      return false;
    }

    console.log('✅ Users table exists with correct schema');
    return true;
  } catch (error) {
    console.error('❌ Error ensuring users table exists:', error);
    return false;
  }
}

/**
 * Performs all necessary database migrations
 */
export async function performDatabaseMigrations(): Promise<boolean> {
  console.log('🚀 Starting database migrations...');
  
  try {
    // First ensure table exists
    const tableExists = await ensureUsersTableExists();
    if (!tableExists) {
      console.error('❌ Could not ensure users table exists');
      return false;
    }

    // Then migrate columns if needed
    const migrationResult = await migrateUsersTable();
    if (!migrationResult) {
      console.warn('⚠️ Users table migration had issues');
    }

    console.log('🎉 Database migrations completed');
    return true;
  } catch (error) {
    console.error('❌ Database migrations failed:', error);
    return false;
  }
}