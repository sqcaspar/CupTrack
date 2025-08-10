// Demo User Account Management
// Creates a real demo user in Supabase for identical authentication experience

import { createClient } from '@supabase/supabase-js';

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
 * Creates or ensures the demo user account exists in Supabase
 * This makes demo authentication identical to regular user authentication
 */
export async function ensureDemoUserExists(): Promise<boolean> {
  try {
    console.log('🎭 Checking if demo user exists...');

    // First, check if demo user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.warn('⚠️ Could not check existing users:', listError.message);
      return false;
    }

    const existingDemoUser = existingUsers.users.find(
      user => user.email === DEMO_USER_CONFIG.email
    );

    if (existingDemoUser) {
      console.log('✅ Demo user already exists:', {
        id: existingDemoUser.id,
        email: existingDemoUser.email,
        created_at: existingDemoUser.created_at
      });
      return true;
    }

    // Create new demo user
    console.log('🔨 Creating demo user account...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: DEMO_USER_CONFIG.email,
      password: DEMO_USER_CONFIG.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: DEMO_USER_CONFIG.userData.user_metadata
    });

    if (error) {
      console.error('❌ Failed to create demo user:', error.message);
      return false;
    }

    if (data.user) {
      console.log('🎉 Demo user created successfully:', {
        id: data.user.id,
        email: data.user.email,
        confirmed: data.user.email_confirmed_at ? 'Yes' : 'No'
      });
      
      // Log demo credentials for reference
      console.log('🔑 Demo Credentials:');
      console.log('   Email:', DEMO_USER_CONFIG.email);
      console.log('   Password:', DEMO_USER_CONFIG.password);
      
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