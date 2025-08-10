// Demo User Account Management
// Creates a real demo user in Supabase for identical authentication experience

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key for admin operations
);

export interface DemoUserConfig {
  email: string;
  password: string;
  userData: {
    full_name: string;
    preferred_name: string;
    user_metadata: Record<string, any>;
  };
}

export const DEMO_USER_CONFIG: DemoUserConfig = {
  email: 'demo@cuptrack.com',
  password: 'demo123',
  userData: {
    full_name: 'Demo User',
    preferred_name: 'Demo',
    user_metadata: {
      role: 'demo',
      created_for: 'demonstration',
      created_at: new Date().toISOString()
    }
  }
};

/**
 * Creates or ensures the demo user account exists in both systems:
 * 1. Custom users table (for login authentication)
 * 2. Supabase Auth (for token validation - if needed later)
 * This makes demo authentication identical to regular user authentication
 */
export async function ensureDemoUserExists(): Promise<boolean> {
  try {
    console.log('🎭 Checking if demo user exists in custom users table...');

    // Check if demo user exists in custom users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', DEMO_USER_CONFIG.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - that's okay, user doesn't exist yet
      console.warn('⚠️ Error checking for demo user:', checkError.message);
      return false;
    }

    if (existingUser) {
      console.log('✅ Demo user already exists in custom users table:', {
        id: existingUser.id,
        email: existingUser.email
      });
      return true;
    }

    // Demo user doesn't exist, create it
    console.log('🔨 Creating demo user in custom users table...');
    
    // Hash the demo password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(DEMO_USER_CONFIG.password, saltRounds);

    // Try to insert demo user with authentication fields if they exist
    let userData: any = {
      email: DEMO_USER_CONFIG.email,
      role: 'user'
    };

    // Add auth fields if the columns exist (after migration)
    try {
      userData.password_hash = passwordHash;
      userData.auth_provider = 'email';
    } catch (error) {
      console.log('ℹ️ Authentication columns may not exist yet - using basic user data');
    }

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([userData])
      .select('id, email, role')
      .single();

    if (insertError) {
      console.error('❌ Failed to create demo user in custom users table:', insertError.message);
      return false;
    }

    if (newUser) {
      console.log('🎉 Demo user created successfully in custom users table:', {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      });
      
      // Log demo credentials for reference
      console.log('🔑 Demo Credentials:');
      console.log('   Email:', DEMO_USER_CONFIG.email);
      console.log('   Password:', DEMO_USER_CONFIG.password);
      console.log('   Authentication: Custom users table with bcrypt hashing');
      console.log('⚠️  NOTE: For login to work, run the SQL migration in SUPABASE-MIGRATION.md');
      
      return true;
    }

    console.error('❌ Demo user creation returned no user data');
    return false;
  } catch (error) {
    console.error('❌ Error managing demo user:', error);
    return false;
  }
}

/**
 * Validates demo user can authenticate (for testing)
 */
export async function validateDemoUserAuth(): Promise<boolean> {
  try {
    console.log('🔍 Validating demo user authentication...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DEMO_USER_CONFIG.email,
      password: DEMO_USER_CONFIG.password
    });

    if (error) {
      console.error('❌ Demo user authentication failed:', error.message);
      return false;
    }

    if (data.user && data.session) {
      console.log('✅ Demo user authentication successful');
      
      // Sign out to clean up
      await supabase.auth.signOut();
      return true;
    }

    console.error('❌ Demo user authentication returned no session');
    return false;
  } catch (error) {
    console.error('❌ Error validating demo user auth:', error);
    return false;
  }
}

/**
 * Gets demo user information
 */
export async function getDemoUserInfo() {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw error;
    }

    const demoUser = users.users.find(user => user.email === DEMO_USER_CONFIG.email);
    return demoUser;
  } catch (error) {
    console.error('Error getting demo user info:', error);
    return null;
  }
}