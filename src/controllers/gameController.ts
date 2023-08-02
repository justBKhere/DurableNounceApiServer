import { Request, Response } from 'express';
import UserService from '../services/userService';
import { handleItemPickup } from '../services/gameService';

const GameController = {
    async HandleItemPickup(req: Request, res: Response) {
        const result = await handleItemPickup(req);
        console.log("result", result);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        return res.status(200).json({ success: true, message: "Item picked up", result: result });
    }
    ,
    async BuildABattleBot(req: Request, res: Response) {

    },

   

}


export default GameController;