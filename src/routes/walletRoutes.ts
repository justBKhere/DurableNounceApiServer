import express, { Router } from 'express';
import WalletController from '../controllers/walletController';
import authMiddleware from '../middleware/authMiddleware';

const router: Router = express.Router();

router.get('/getPrivateKey', authMiddleware, WalletController.getPrivateKey);


router.get('/get-balance', authMiddleware, WalletController.getBalance);

router.get('/air-drop-sol', authMiddleware, WalletController.airDropSol);

export default router;
