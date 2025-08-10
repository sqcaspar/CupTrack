// BrewService - handles all brew-related database operations and business logic
// Implements comprehensive CRUD operations with validation and calculations

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  CreateBrewRequest, 
  UpdateBrewRequest,
  BrewRecord, 
  BrewListFilters,
  BrewListResponse,
  BrewError,
  BrewCalculations
} from '../types/brew';
import { 
  validateCreateBrewRequest, 
  calculateBrewRatio,
  generateBrewNumber 
} from '../utils/brew-validation';

export class BrewService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new brew record with validation and automatic calculations
   */
  async createBrew(brewData: CreateBrewRequest, userId: string): Promise<BrewRecord> {
    // Validate the brew data
    const validation = validateCreateBrewRequest(brewData);
    if (!validation.isValid) {
      throw new BrewError('Brew validation failed', 400, validation.errors);
    }

    try {
      // Calculate coffee to water ratio
      const coffeeToWaterRatio = calculateBrewRatio(
        brewData.measurements.waterWeight,
        brewData.measurements.coffeeBeansWeight
      );

      // Get next brew sequence number
      const sequenceNumber = await this.getNextBrewSequence(userId);
      const brewNumber = generateBrewNumber(userId, sequenceNumber);

      // Prepare the brew record for database insertion
      const brewRecord = {
        user_id: userId,
        brew_number: brewNumber,
        user_name: brewData.userName || null,
        beans: brewData.beans,
        parameters: brewData.parameters,
        turbulence_steps: brewData.turbulenceSteps || [],
        measurements: {
          ...brewData.measurements,
          coffeeToWaterRatio
        },
        evaluation: brewData.evaluation || null,
        is_shared: brewData.isShared || false,
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert into database
      const { data, error } = await this.supabase
        .from('brews')
        .insert(brewRecord)
        .select('*')
        .single();

      if (error) {
        console.error('Database error creating brew:', error);
        throw new BrewError(`Failed to create brew: ${error.message}`, 500);
      }

      if (!data) {
        throw new BrewError('No data returned from brew creation', 500);
      }

      return data as BrewRecord;

    } catch (error) {
      if (error instanceof BrewError) {
        throw error;
      }
      console.error('Unexpected error creating brew:', error);
      throw new BrewError('An unexpected error occurred while creating the brew', 500);
    }
  }

  /**
   * Get a specific brew by ID
   */
  async getBrewById(brewId: string, userId: string): Promise<BrewRecord> {
    try {
      const { data, error } = await this.supabase
        .from('brews')
        .select('*')
        .eq('id', brewId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new BrewError('Brew not found', 404);
        }
        console.error('Database error fetching brew:', error);
        throw new BrewError(`Failed to fetch brew: ${error.message}`, 500);
      }

      if (!data) {
        throw new BrewError('Brew not found', 404);
      }

      return data as BrewRecord;

    } catch (error) {
      if (error instanceof BrewError) {
        throw error;
      }
      console.error('Unexpected error fetching brew:', error);
      throw new BrewError('An unexpected error occurred while fetching the brew', 500);
    }
  }

  /**
   * Get brews with filtering, pagination, and sorting
   */
  async getBrews(filters: BrewListFilters): Promise<BrewListResponse> {
    try {
      // Build the query
      let query = this.supabase
        .from('brews')
        .select('*', { count: 'exact' })
        .eq('user_id', filters.userId);

      // Apply filters
      if (filters.method) {
        query = query.eq('parameters->>brewingMethod', filters.method);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters.favorites) {
        query = query.eq('is_favorite', true);
      }

      if (filters.search) {
        query = query.ilike('beans->>brand', `%${filters.search}%`);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 20, 100); // Max 100 items per page
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Database error fetching brews:', error);
        throw new BrewError(`Failed to fetch brews: ${error.message}`, 500);
      }

      const brews = (data || []) as BrewRecord[];
      const totalRecords = count || 0;
      const totalPages = Math.ceil(totalRecords / limit);

      // Get available filter options
      const availableFilters = await this.getAvailableFilters(filters.userId);

      return {
        brews,
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        filters: {
          appliedFilters: {
            method: filters.method,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            favorites: filters.favorites,
            search: filters.search,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder
          },
          availableFilters
        }
      };

    } catch (error) {
      if (error instanceof BrewError) {
        throw error;
      }
      console.error('Unexpected error fetching brews:', error);
      throw new BrewError('An unexpected error occurred while fetching brews', 500);
    }
  }

  /**
   * Update an existing brew
   */
  async updateBrew(brewId: string, updateData: UpdateBrewRequest, userId: string): Promise<BrewRecord> {
    try {
      // Validate the update data if it contains fields that need validation
      if (updateData.beans || updateData.parameters || updateData.measurements || updateData.evaluation) {
        // Build a proper validation request with required minimal fields
        const validationData: any = {};
        
        // For partial updates, provide minimal required data to pass validation
        if (updateData.beans) {
          validationData.beans = updateData.beans;
        }
        
        if (updateData.parameters) {
          validationData.parameters = updateData.parameters;
        }
        
        if (updateData.measurements) {
          validationData.measurements = updateData.measurements;
        }
        
        if (updateData.evaluation) {
          validationData.evaluation = updateData.evaluation;
        }

        // Only validate if we have complete required sections
        if (validationData.beans && validationData.parameters && validationData.measurements) {
          const validation = validateCreateBrewRequest(validationData as CreateBrewRequest);
          if (!validation.isValid) {
            throw new BrewError('Brew update validation failed', 400, validation.errors);
          }
        }
        
        // For individual field updates, validate separately
        if (updateData.beans && !updateData.parameters && !updateData.measurements) {
          const { validateCoffeeBeans } = await import('../utils/brew-validation');
          const validation = validateCoffeeBeans(updateData.beans);
          if (!validation.isValid) {
            throw new BrewError('Beans validation failed', 400, validation.errors);
          }
        }
        
        if (updateData.parameters && !updateData.beans && !updateData.measurements) {
          const { validateBrewingParameters } = await import('../utils/brew-validation');
          const validation = validateBrewingParameters(updateData.parameters);
          if (!validation.isValid) {
            throw new BrewError('Parameters validation failed', 400, validation.errors);
          }
        }
        
        if (updateData.measurements && !updateData.beans && !updateData.parameters) {
          const { validateBrewMeasurements } = await import('../utils/brew-validation');
          const validation = validateBrewMeasurements(updateData.measurements);
          if (!validation.isValid) {
            throw new BrewError('Measurements validation failed', 400, validation.errors);
          }
        }
        
        if (updateData.evaluation) {
          const { validateBrewEvaluation } = await import('../utils/brew-validation');
          const validation = validateBrewEvaluation(updateData.evaluation);
          if (!validation.isValid) {
            throw new BrewError('Evaluation validation failed', 400, validation.errors);
          }
        }
      }

      // Prepare update object
      const updateObject: any = {
        updated_at: new Date().toISOString()
      };

      // Map fields to database column names
      if (updateData.userName !== undefined) updateObject.user_name = updateData.userName;
      if (updateData.beans) updateObject.beans = updateData.beans;
      if (updateData.parameters) updateObject.parameters = updateData.parameters;
      if (updateData.turbulenceSteps !== undefined) updateObject.turbulence_steps = updateData.turbulenceSteps;
      if (updateData.evaluation !== undefined) updateObject.evaluation = updateData.evaluation;
      if (updateData.isFavorite !== undefined) updateObject.is_favorite = updateData.isFavorite;
      if (updateData.isShared !== undefined) updateObject.is_shared = updateData.isShared;

      // Handle measurements with ratio recalculation
      if (updateData.measurements) {
        const coffeeToWaterRatio = calculateBrewRatio(
          updateData.measurements.waterWeight,
          updateData.measurements.coffeeBeansWeight
        );
        updateObject.measurements = {
          ...updateData.measurements,
          coffeeToWaterRatio
        };
      }

      // Update in database
      const { data, error } = await this.supabase
        .from('brews')
        .update(updateObject)
        .eq('id', brewId)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new BrewError('Brew not found', 404);
        }
        console.error('Database error updating brew:', error);
        throw new BrewError(`Failed to update brew: ${error.message}`, 500);
      }

      if (!data) {
        throw new BrewError('Brew not found', 404);
      }

      return data as BrewRecord;

    } catch (error) {
      if (error instanceof BrewError) {
        throw error;
      }
      console.error('Unexpected error updating brew:', error);
      throw new BrewError('An unexpected error occurred while updating the brew', 500);
    }
  }

  /**
   * Delete a brew
   */
  async deleteBrew(brewId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('brews')
        .delete()
        .eq('id', brewId)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new BrewError('Brew not found', 404);
        }
        console.error('Database error deleting brew:', error);
        throw new BrewError(`Failed to delete brew: ${error.message}`, 500);
      }

      return !!data;

    } catch (error) {
      if (error instanceof BrewError) {
        throw error;
      }
      console.error('Unexpected error deleting brew:', error);
      throw new BrewError('An unexpected error occurred while deleting the brew', 500);
    }
  }

  /**
   * Get the next brew sequence number for a user
   */
  async getNextBrewSequence(userId: string): Promise<number> {
    try {
      const { data, error, count } = await this.supabase
        .from('brews')
        .select('brew_number', { count: 'exact' })
        .eq('user_id', userId);

      if (error) {
        console.error('Database error getting brew sequence:', error);
        throw new BrewError(`Failed to get brew sequence: ${error.message}`, 500);
      }

      // If no brews exist for user, start with 1
      if (!data || data.length === 0) {
        return 1;
      }

      // Return count + 1 for next sequence
      return (count || 0) + 1;

    } catch (error) {
      if (error instanceof BrewError) {
        throw error;
      }
      console.error('Unexpected error getting brew sequence:', error);
      throw new BrewError('An unexpected error occurred while getting brew sequence', 500);
    }
  }

  /**
   * Get available filter options for the user's brews
   */
  private async getAvailableFilters(userId: string): Promise<{
    methods: string[];
    dateRange: { earliest: string; latest: string };
  }> {
    try {
      // Get distinct brewing methods
      const { data: methodsData } = await this.supabase
        .from('brews')
        .select('parameters')
        .eq('user_id', userId);

      const methods = methodsData ? 
        [...new Set(methodsData.map(brew => brew.parameters?.brewingMethod).filter(Boolean))] :
        [];

      // Get date range
      const { data: dateData } = await this.supabase
        .from('brews')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1);

      const { data: latestDateData } = await this.supabase
        .from('brews')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      const earliest = dateData && dateData.length > 0 ? dateData[0].created_at : new Date().toISOString();
      const latest = latestDateData && latestDateData.length > 0 ? latestDateData[0].created_at : new Date().toISOString();

      return {
        methods,
        dateRange: { earliest, latest }
      };

    } catch (error) {
      console.error('Error getting available filters:', error);
      return {
        methods: [],
        dateRange: { 
          earliest: new Date().toISOString(), 
          latest: new Date().toISOString() 
        }
      };
    }
  }

  /**
   * Calculate additional brew metrics and analytics
   */
  async calculateBrewMetrics(brewData: BrewRecord): Promise<BrewCalculations> {
    const calculations: BrewCalculations = {
      coffeeToWaterRatio: brewData.measurements.coffeeToWaterRatio
    };

    // Calculate extraction yield if TDS and brewed weight are available
    if (brewData.measurements.tdsPercentage && brewData.measurements.brewedCoffeeWeight) {
      calculations.extractionYield = Math.round(
        (brewData.measurements.tdsPercentage * brewData.measurements.brewedCoffeeWeight) / 
        brewData.measurements.coffeeBeansWeight * 100
      ) / 100;
    }

    // Calculate brewing efficiency (brewed weight / water weight)
    if (brewData.measurements.brewedCoffeeWeight) {
      calculations.brewingEfficiency = Math.round(
        (brewData.measurements.brewedCoffeeWeight / brewData.measurements.waterWeight) * 100 * 100
      ) / 100;
    }

    return calculations;
  }

  /**
   * Get brew statistics for a user
   */
  async getUserBrewStats(userId: string): Promise<{
    totalBrews: number;
    favoriteBrews: number;
    averageQuality: number;
    mostUsedMethod: string;
    brewsThisMonth: number;
  }> {
    try {
      // Get total brews
      const { count: totalBrews } = await this.supabase
        .from('brews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get favorite brews
      const { count: favoriteBrews } = await this.supabase
        .from('brews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_favorite', true);

      // Get brews this month
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { count: brewsThisMonth } = await this.supabase
        .from('brews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth);

      // Get all brews for calculations
      const { data: brews } = await this.supabase
        .from('brews')
        .select('parameters, evaluation')
        .eq('user_id', userId);

      let averageQuality = 0;
      let mostUsedMethod = '';

      if (brews && brews.length > 0) {
        // Calculate average quality from evaluations
        const qualityScores = brews
          .filter(brew => brew.evaluation?.type === 'quick')
          .map(brew => brew.evaluation.overallQuality);

        if (qualityScores.length > 0) {
          averageQuality = Math.round(
            qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length * 100
          ) / 100;
        }

        // Find most used brewing method
        const methodCounts = brews.reduce((acc: Record<string, number>, brew) => {
          const method = brew.parameters?.brewingMethod;
          if (method) {
            acc[method] = (acc[method] || 0) + 1;
          }
          return acc;
        }, {});

        mostUsedMethod = Object.entries(methodCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '';
      }

      return {
        totalBrews: totalBrews || 0,
        favoriteBrews: favoriteBrews || 0,
        averageQuality,
        mostUsedMethod,
        brewsThisMonth: brewsThisMonth || 0
      };

    } catch (error) {
      console.error('Error getting user brew stats:', error);
      throw new BrewError('Failed to get user brew statistics', 500);
    }
  }
}