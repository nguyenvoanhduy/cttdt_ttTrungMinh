import express from 'express';
import * as chatbotConfigController from '../controllers/chatbotConfigController.js';

const router = express.Router();

// Get chatbot config (public - cho cả user và admin)
router.get('/', chatbotConfigController.getChatbotConfig);

// Update chatbot config (admin only - có thể thêm middleware auth sau)
router.put('/', chatbotConfigController.updateChatbotConfig);

export default router;
