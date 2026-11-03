import { Router } from 'express';
import { obterAnalise } from '../controllers/analiseController';

const router = Router();

router.get('/', obterAnalise);

export default router;