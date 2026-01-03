import express from 'express';
import { getActivityLogs, createActivityLog } from '../controllers/activityLogController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Get all activity logs (Admin only)
router.get('/', protectedRoute, authorizeRoles(['Admin']), getActivityLogs);

// Create activity log (for internal use)
router.post('/', protectedRoute, createActivityLog);

export default router;
