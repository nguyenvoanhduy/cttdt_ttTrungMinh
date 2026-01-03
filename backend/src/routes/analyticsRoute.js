import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

// Track page view (public - không cần authentication)
router.post('/pageview', analyticsController.trackPageView);

// Track custom event (public)
router.post('/event', analyticsController.trackEvent);

// Get visit statistics (admin only - có thể thêm middleware auth)
router.get('/visits', analyticsController.getVisitStats);

// Get daily visits for chart (admin only)
router.get('/daily-visits', analyticsController.getDailyVisits);

// Get top pages (admin only)
router.get('/top-pages', analyticsController.getTopPages);

export default router;
