/**
 * User Repository - Supabase Layer (Phase 8)
 * Handles all user-related database operations via Supabase PostgreSQL.
 */

const { supabase } = require('../config/supabase');
const logger = require('../config/logger');

class UserRepository {
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('UserRepository.findByEmail error:', error.message);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code === 'PGRST116') {
        return null;
      }
      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('UserRepository.findById error:', error.message);
      throw error;
    }
  }

  /**
   * Create new user
   */
  static async create(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;

      logger.info(`User created: ${data.id} (${data.email})`);
      return data;
    } catch (error) {
      logger.error('UserRepository.create error:', error.message);
      throw error;
    }
  }

  /**
   * Update user
   */
  static async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      logger.info(`User updated: ${id}`);
      return data;
    } catch (error) {
      logger.error('UserRepository.update error:', error.message);
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async delete(id) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      logger.info(`User deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error('UserRepository.delete error:', error.message);
      throw error;
    }
  }

  /**
   * List users with pagination
   */
  static async listUsers(page = 1, pageSize = 10, filters = {}) {
    try {
      let query = supabase.from('users').select('*', { count: 'exact' });

      // Apply filters
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      return {
        data,
        pagination: {
          page,
          pageSize,
          total: count,
          pages: Math.ceil(count / pageSize),
        },
      };
    } catch (error) {
      logger.error('UserRepository.listUsers error:', error.message);
      throw error;
    }
  }

  /**
   * Check if user exists by email
   */
  static async emailExists(email) {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('email', email);

      if (error) throw error;

      return count > 0;
    } catch (error) {
      logger.error('UserRepository.emailExists error:', error.message);
      throw error;
    }
  }
}

module.exports = UserRepository;
