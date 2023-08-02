import { Request, Response } from 'express';
import { getPrivateKeyFromToken } from '../utils/authUtils';
import UserService from '../services/userService';
import { airdropSol, getBalance } from '../services/walletService';

const walletController = {
    async getPrivateKey(req: Request, res: Response) {
        // Assuming you have an authMiddleware that adds the authenticated user to the request object

        try {
            const privateKey = await getPrivateKeyFromToken(req);
            if (!privateKey) {
                return res.status(404).json({ message: 'Private key not found for the user.' });
            }

            res.json({ privateKey });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    async getBalance(req: Request, res: Response) {
        // Assuming you have an authMiddleware that adds the authenticated user to the request object
        try {
            const balance = await getBalance(req);
            if (!balance) {
                return res.status(404).json({ message: 'Balance not found for the user.' });
            }
            else {
                return res.status(200).json({
                    success: true,
                    message: 'Balance found for the user.',
                    result: balance
                });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    async airDropSol(req: Request, res: Response) {
        try {
            const balance = await airdropSol(req);
            if (!balance) {
                return res.status(404).json({ message: 'Balance not found for the user.' });
            }
            else {
                return res.status(200).json({
                    success: true,
                    message: 'AirDropped Successfully for the user.',
                    result: balance
                });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

export default walletController;
