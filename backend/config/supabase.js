/**
 * Supabase Client Configuration (Phase 8)
 * Initializes the Supabase PostgreSQL client for database operations.
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');

// Validate Supabase credentials
if (!process.env.SUPABASE_URL) {
  logger.warn('SUPABASE_URL environment variable is not set. Supabase connection will not be available.');
}

if (!process.env.SUPABASE_SERVICE_KEY && !process.env.SUPABASE_ANON_KEY) {
  logger.warn('Neither SUPABASE_SERVICE_KEY nor SUPABASE_ANON_KEY is set. Supabase connection will not be available.');
}

// Create Supabase client
// Use SERVICE_KEY for server-side operations (better RLS permissions)
// Use ANON_KEY for client-facing operations
let supabase = null;

if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY)) {
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        headers: {
          'x-application-name': 'edunova-backend',
          'x-application-version': '8.0.0',
        },
      }
    );
    logger.info('✓ Supabase client initialized');
  } catch (error) {
    logger.error('✗ Failed to initialize Supabase:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

// Test database connection
const testConnection = async () => {
  if (!supabase) {
    logger.info('ℹ Skipping Supabase connection test (not configured)');
    return true;
  }

  try {
    const { error } = await supabase
      .from('users')
      .select('id', { head: true, count: 'exact' });

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (acceptable)
      throw error;
    }

    logger.info('✓ Supabase connection test passed');
    return true;
  } catch (error) {
    const details = JSON.stringify(
      {
        code: error.code,
        message: error.message,
        hint: error.hint,
        details: error.details,
      },
      null,
      0
    );
    logger.error(`✗ Supabase connection test failed: ${details}`);
    // Non-blocking in dev, fail-hard in production
    if (process.env.NODE_ENV === 'production') {
      logger.error('Database connection required in production. Exiting.');
      process.exit(1);
    }
    return false;
  }
};

module.exports = {
  supabase,
  testConnection,
};
