#!/usr/bin/env node
/**
 * Railway Startup Validation Script
 * This script validates environment variables before starting the application
 */

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_KEY',
  'JWT_SECRET'
];

const optionalEnvVars = [
  'NODE_ENV',
  'PORT',
  'CORS_ORIGIN'
];

console.log('🚀 Railway Startup Validation');
console.log('==============================');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

console.log(`📊 Node.js version: ${nodeVersion}`);
if (majorVersion < 20) {
  console.error('❌ Node.js version must be 20 or higher for Supabase compatibility');
  console.error('   Current version:', nodeVersion);
  console.error('   Railway should use Node.js 20+ based on .nvmrc and engines in package.json');
} else {
  console.log('✅ Node.js version compatible');
}

// Check environment variables
console.log('\n🔍 Environment Variables Check:');
console.log('--------------------------------');

let allRequiredPresent = true;

// Check required variables
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (!value) {
    console.error(`❌ MISSING: ${envVar}`);
    allRequiredPresent = false;
  } else {
    // Show partial value for security
    const displayValue = value.length > 20 ? 
      `${value.substring(0, 10)}...${value.substring(value.length - 4)}` : 
      value;
    console.log(`✅ ${envVar}: ${displayValue}`);
  }
});

// Check optional variables
console.log('\n📋 Optional Variables:');
optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value}`);
  } else {
    console.log(`⚠️  ${envVar}: Not set (using default)`);
  }
});

// Railway-specific instructions
if (!allRequiredPresent) {
  console.error('\n🚨 RAILWAY CONFIGURATION REQUIRED:');
  console.error('=====================================');
  console.error('1. Go to your Railway project dashboard');
  console.error('2. Click on your backend service');
  console.error('3. Go to Variables tab');
  console.error('4. Add the missing environment variables:');
  console.error('');
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.error(`   ${envVar}=your_${envVar.toLowerCase()}_value`);
    }
  });
  console.error('');
  console.error('5. Railway will automatically redeploy after adding variables');
  console.error('');
  console.error('📖 Get your Supabase credentials from:');
  console.error('   https://app.supabase.com/project/[your-project]/settings/api');
  
  process.exit(1);
}

console.log('\n🎉 All environment variables configured correctly!');
console.log('🚀 Starting CupTrack backend server...');
console.log('');