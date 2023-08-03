
import base58 from 'bs58';
import UserService from '../services/userService';
import { GetAssetFromPlayer, ManufactureBot, SendAssetToPlayer } from '../utils/walletUtils';
import { base58ToUint8Array, uint8ArrayToBase58 } from '../utils/base58Utils';
import exp from 'constants';

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
        const updatedTokenBalance: any = await SendAssetToPlayer(tokenAddress, user.publicAddress,generateRandomValue(parsedLevel), network);
        return updatedTokenBalance;

    }
    catch (error) {
        console.error(error);
        return null
    }
}

export async function handleItemDrop(req: any) {
    const { network, tokenAddress} = req.body
    const user = await UserService.findByUuid(req.user.userId);
    console.log("user", user);
    console.log("tokenAddress", tokenAddress);
    console.log("network", network);
    try {
        if (!user) {
            return false
        }
        const updatedTokenBalance: any = await GetAssetFromPlayer(tokenAddress,user.publicAddress, user.privateKey, '5',network);
        return updatedTokenBalance;
    }
    catch (error) {
        console.error(error);
        return null
    }
}

export async function manufactureBot(req: any) {
    const { network, consumeTokenAddress, buildTokenAddress } = req.body
    const user = await UserService.findByUuid(req.user.userId);
    console.log("user", user);
    try {
        if (!user) {
            return false
        }
        const updatedTokenBalance: any = await ManufactureBot(consumeTokenAddress,buildTokenAddress, user.privateKey, network);
        return updatedTokenBalance;
    }
    catch (error) {
        console.error(error);
        return null
    }
}

/*export async function HandleBuildAHelperBot(req: any) {
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
}*/

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
