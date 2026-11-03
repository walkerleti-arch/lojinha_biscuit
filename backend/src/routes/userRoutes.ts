import { Router } from 'express';
import { cadastrar } from '../controllers/userController';

const router = Router();

router.post('/', cadastrar);

export default router;