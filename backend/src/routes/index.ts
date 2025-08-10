import { Router } from 'express';
import authRoutes from './auth';
import brewRoutes from './brews';

const router = Router();

// Health check (no auth required)
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication routes
router.use('/auth', authRoutes);

// Brew management routes (protected)
router.use('/brews', brewRoutes);

// Analytics endpoints (will be implemented in Phase 3)
router.get('/analytics/comparison', (req, res) => {
  res.status(501).json({
    message: 'Analytics endpoints will be implemented in Phase 3',
    endpoint: 'GET /analytics/comparison',
    user: req.user
  });
});

router.get('/analytics/user-stats', (req, res) => {
  res.status(501).json({
    message: 'Analytics endpoints will be implemented in Phase 3',
    endpoint: 'GET /analytics/user-stats',
    user: req.user
  });
});

// Export endpoints (will be implemented in Phase 3)
router.get('/export/csv', (req, res) => {
  res.status(501).json({
    message: 'Export endpoints will be implemented in Phase 3',
    endpoint: 'GET /export/csv',
    user: req.user
  });
});

export default router;