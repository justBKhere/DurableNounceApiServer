
import UserService from '../services/userService';
import { ManufactureAHelperBot, SendAssetToPlayer } from '../utils/walletUtils';

export async function handleItemPickup(req: any) {
    const { network, tokenAddress, level } = req.body
    const user = await UserService.findByUuid(req.user.userId);
    console.log("user", user);
    console.log("tokenAddress", tokenAddress);
    console.log("level", level);
    console.log("network", network);
    const parsedLevel = parseInt(level);
    try {
        if (!user) {
            return false
        }
        const updatedTokenBalance: any = await SendAssetToPlayer(tokenAddress, user.publicAddress, generateRandomValue(parsedLevel), network);
        return updatedTokenBalance;

    }
    catch (error) {
        console.error(error);
        return null
    }
}

export async function handleItemDrop(req: any) {
    const { network, tokenAddress, level } = req.body
    const user = await UserService.findByUuid(req.user.userId);
    console.log("user", user);
    console.log("tokenAddress", tokenAddress);
    console.log("network", network);
    const parsedLevel = parseInt(level);
    try {
        if (!user) {
            return false
        }
        const updatedTokenBalance: any = await GetAssetFromPlayer(tokenAddress, user.privateKey, network);
        return updatedTokenBalance;
}

export async function HandleBuildAHelperBot(req: any) {
    const { network, botAssetAddress } = req.body
    const user = await UserService.findByUuid(req.user.userId);
    console.log("user", user);
    try {
        if (!user) {
            return false
        }
        const updatedTokenBalance: any = await ManufactureAHelperBot(botAssetAddress, user.privateKey, network);
        return updatedTokenBalance;
    }
    catch (error) {
        console.error(error);
        return null
    }
}

function generateRandomValue(level: number) {
    let minValue = 10;
    let maxValue;

    if (level === 1) {
        maxValue = 20;
    } else if (level === 2) {
        maxValue = 30;
    } else if (level === 3) {
        maxValue = 50;
    } else if (level === 4) {
        maxValue = 100;
    } else {
        throw new Error('Invalid level');
    }

    const randomValue = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    return randomValue;
}
