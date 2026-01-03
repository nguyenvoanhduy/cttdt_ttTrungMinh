import express from 'express';
import { 
    authMe, 
    getAllUsers, 
    createUser, 
    updateUserRole,
    updateUserPassword,
    deleteUser 
} from '../controllers/userController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/me', authMe);
router.get('/', protectedRoute, authorizeRoles(['Admin', 'Trưởng Ban']), getAllUsers);
router.post('/', protectedRoute, authorizeRoles(['Admin']), createUser);
router.put('/:id/role', protectedRoute, authorizeRoles(['Admin']), updateUserRole);
router.put('/:id/password', protectedRoute, authorizeRoles(['Admin']), updateUserPassword);
router.delete('/:id', protectedRoute, authorizeRoles(['Admin']), deleteUser);

export default router;