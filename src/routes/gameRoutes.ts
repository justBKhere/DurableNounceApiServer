// src/routes/userRoutes.ts
import express, { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import GameController from '../controllers/gameController';

const router: Router = express.Router();

// Register a new user
router.post('/item-pickup', authMiddleware, GameController.HandleItemPickup);

router.post('/build-a-battle-bot', authMiddleware, GameController.BuildABattleBot);



router.post('/')
export default router;
