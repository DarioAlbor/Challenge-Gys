import { Router } from 'express';
import polizasRoutes from './polizas.routes';
import authRoutes from './auth.routes';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// públicas
router.use('/api/auth', authRoutes);

// protegidas
router.use('/api/polizas', verifyToken as any, polizasRoutes);

export default router;