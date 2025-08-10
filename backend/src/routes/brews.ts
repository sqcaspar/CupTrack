// Brew routes - handles all brew-related HTTP endpoints
// Implements full CRUD operations with authentication and validation

import { Router, Request, Response } from 'express';
import { BrewService } from '../services/brew';
import { 
  CreateBrewRequest, 
  UpdateBrewRequest, 
  BrewListFilters, 
  BrewError 
} from '../types/brew';
import { authenticateUser } from '../middleware/auth';

const router = Router();
const brewService = new BrewService();

// All brew routes require authentication
router.use(authenticateUser);

/**
 * @route   GET /api/v1/brews
 * @desc    Get user's brews with filtering and pagination
 * @access  Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const filters: BrewListFilters = {
      userId: req.user.id,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      method: req.query.method as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      favorites: req.query.favorites === 'true',
      sortBy: req.query.sortBy as 'created_at' | 'brew_number' | 'evaluation_quality',
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      search: req.query.search as string
    };

    const result = await brewService.getBrews(filters);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting brews:', error);

    if (error instanceof BrewError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        validationErrors: error.validationErrors
      });
    }

    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while fetching brews'
    });
  }
});

/**
 * @route   POST /api/v1/brews
 * @desc    Create a new brew
 * @access  Private
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const brewData: CreateBrewRequest = req.body;
    const result = await brewService.createBrew(brewData, req.user.id);

    res.status(201).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error creating brew:', error);

    if (error instanceof BrewError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        validationErrors: error.validationErrors
      });
    }

    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while creating the brew'
    });
  }
});

/**
 * @route   GET /api/v1/brews/:id
 * @desc    Get a specific brew by ID
 * @access  Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const brewId = req.params.id;
    const result = await brewService.getBrewById(brewId, req.user.id);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting brew by ID:', error);

    if (error instanceof BrewError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while fetching the brew'
    });
  }
});

/**
 * @route   PUT /api/v1/brews/:id
 * @desc    Update a specific brew
 * @access  Private
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const brewId = req.params.id;
    const updateData: UpdateBrewRequest = req.body;
    const result = await brewService.updateBrew(brewId, updateData, req.user.id);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error updating brew:', error);

    if (error instanceof BrewError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        validationErrors: error.validationErrors
      });
    }

    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while updating the brew'
    });
  }
});

/**
 * @route   DELETE /api/v1/brews/:id
 * @desc    Delete a specific brew
 * @access  Private
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const brewId = req.params.id;
    await brewService.deleteBrew(brewId, req.user.id);

    res.json({
      success: true,
      message: 'Brew deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting brew:', error);

    if (error instanceof BrewError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while deleting the brew'
    });
  }
});

/**
 * @route   POST /api/v1/brews/:id/duplicate
 * @desc    Duplicate a brew as a template
 * @access  Private
 */
router.post('/:id/duplicate', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const brewId = req.params.id;
    
    // Get the existing brew
    const existingBrew = await brewService.getBrewById(brewId, req.user.id);

    // Create a new brew based on the existing one (template functionality)
    const templateBrew: CreateBrewRequest = {
      userName: req.body.userName || `Copy of ${existingBrew.user_name}`,
      beans: existingBrew.beans,
      parameters: existingBrew.parameters,
      turbulenceSteps: existingBrew.turbulence_steps,
      measurements: {
        coffeeBeansWeight: existingBrew.measurements.coffeeBeansWeight,
        waterWeight: existingBrew.measurements.waterWeight,
        ...(existingBrew.measurements.brewedCoffeeWeight && { 
          brewedCoffeeWeight: existingBrew.measurements.brewedCoffeeWeight 
        }),
        ...(existingBrew.measurements.tdsPercentage && { 
          tdsPercentage: existingBrew.measurements.tdsPercentage 
        })
      }
      // Note: No evaluation - user will need to evaluate the new brew
    };

    const result = await brewService.createBrew(templateBrew, req.user.id);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Brew duplicated successfully'
    });

  } catch (error) {
    console.error('Error duplicating brew:', error);

    if (error instanceof BrewError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        validationErrors: error.validationErrors
      });
    }

    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while duplicating the brew'
    });
  }
});

/**
 * @route   GET /api/v1/brews/stats/user
 * @desc    Get user brew statistics
 * @access  Private
 */
router.get('/stats/user', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const stats = await brewService.getUserBrewStats(req.user.id);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting user brew stats:', error);

    if (error instanceof BrewError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while fetching brew statistics'
    });
  }
});

export default router;