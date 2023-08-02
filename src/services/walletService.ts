import { getPrivateKeyFromToken } from "../utils/authUtils";
import UserService from "./userService";
import { GetBalance, AirdropSol } from "../utils/walletUtils";

export async function getBalance(req: any) {

    const user = await UserService.findByUuid(req.user.userId)

    const network = req.query.network || 'mainnet'
    if (user) {
        return GetBalance(user.publicAddress, network);
    }
    else {
        console.log("No user found")
        return null
    }
}

export async function airdropSol(req: any) {
    const user = await UserService.findByUuid(req.user.userId)
    const network = req.query.network || 'mainnet'
    if (user) {
        const signature = await AirdropSol(user.publicAddress, 1, network);
        if (signature) {
            const balance = await GetBalance(user.publicAddress, network);
            return balance;
        }
    }
    else {
        return null
    }
}



