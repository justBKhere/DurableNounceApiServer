
import base58 from 'bs58';
import UserService from '../services/userService';
import { GetAssetFromPlayer, ManufactureBot, ManufactureBotNounceTx, SendAssetToPlayer, getAllTokenBalances } from '../utils/walletUtils';
import { base58ToUint8Array, uint8ArrayToBase58 } from '../utils/base58Utils';
import exp from 'constants';
import { v4 as uuidv4 } from 'uuid';
import botBuildingModel, { botBuildingNonce } from '../dbms/models/botBuildingNonce';
import { ExecuteBotNonceTx, SignTransactionUsingDurableNounce } from './nonceService';


export async function createBotData(uuid: string, nonceAccountPubKey: string, nonceTxn: string): Promise<botBuildingNonce> {
    const createdAt = new Date();
    const botID = uuidv4();

    try {
        const botModel = await botBuildingModel.create({
            uuid: uuid,
            nonceAccountPubKey: nonceAccountPubKey,
            nonceTxn: nonceTxn,
            createdAt: new Date(),
            botID: botID,
            TimetoComplete: 8   //TOBE ACQUIRED FROM TOKEN

        });
        return botModel;
    } catch (error) {
        throw new Error('Failed to create user.'); // Custom error message
    }
}


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
    const { network, tokenAddress } = req.body
    const user = await UserService.findByUuid(req.user.userId);
    console.log("user", user);
    console.log("tokenAddress", tokenAddress);
    console.log("network", network);
    try {
        if (!user) {
            return false
        }
        const updatedTokenBalance: any = await GetAssetFromPlayer(tokenAddress, user.publicAddress, user.privateKey, '5', network);
        return updatedTokenBalance;
    }
    catch (error) {
        console.error(error);
        return null
    }
}

export async function manufactureBot(req: any) {

    const { network, buildTokenAddress } = req.body
    let consumeTokenAddress = [""];
    if (buildTokenAddress == "5259eCocGrfYVj1w4YqBJopihxStHD881b2Bbt3cSK1n") {
        consumeTokenAddress = ["CLNX8gTNWFrhVPT5ED39YKgHsfPC8qitxgxqBQKiZ38k", "2t5YSZjQhiWxPzoBQFeivpv2EBfjb6pYXcaEC7arCcyj", "CjeGjYdCu4ccwdtaGXbbxeHsN6UV5CUr8RYEubpbvH19"]

    }
    if (consumeTokenAddress.length == 0) {
        return false
    }
    const user = await UserService.findByUuid(req.user.userId);
    console.log("user", user);
    try {
        if (!user) {
            return false
        }
        const updatedTokenBalance: any = await ManufactureBot(consumeTokenAddress, buildTokenAddress, user.privateKey, network);
        return updatedTokenBalance;
    }
    catch (error) {
        console.error(error);
        return null
    }
}

export async function ManufactureBotNounce(req: any) {

    const { network, buildTokenAddress } = req.body
    let consumeTokenAddress = [""];
    if (buildTokenAddress == "5259eCocGrfYVj1w4YqBJopihxStHD881b2Bbt3cSK1n") {
        consumeTokenAddress = ["CLNX8gTNWFrhVPT5ED39YKgHsfPC8qitxgxqBQKiZ38k", "2t5YSZjQhiWxPzoBQFeivpv2EBfjb6pYXcaEC7arCcyj", "CjeGjYdCu4ccwdtaGXbbxeHsN6UV5CUr8RYEubpbvH19"]
        //TO BE ACQUIRED FROM METADATA
    }
    if (consumeTokenAddress.length == 0) {
        return false
    }
    const user = await UserService.findByUuid(req.user.userId);
    console.log("user", user);
    try {
        if (!user) {
            return false
        }
        const serializedTx: any = await ManufactureBotNounceTx(consumeTokenAddress, buildTokenAddress, user.privateKey, network);
        const botData = await createBotData(user.uuid, user.publicAddress, serializedTx);
        return {
            botUUID: botData.botID,
            botAddress: botData.botAddress,
            nonceAccountPubKey: botData.nonceAccountPubKey,
            createdAt: botData.createdAt,
            timetoComplete: botData.TimetoComplete
        };
    }
    catch (error) {
        console.error(error);
        return null
    }
}

export async function ClaimBots(req: any) {
    const { botID, network } = req.body
    const user = await UserService.findByUuid(req.user.userId);
    const botData = await botBuildingModel.findOne({ botID: botID });
    if (botData) {
        if (botData?.TimetoComplete > (new Date().getTime() - botData?.createdAt.getTime()))
            if (user) {
                const isExecuted = await ExecuteBotNonceTx(botData, user, network);
                if (isExecuted) {
                    await botBuildingModel.deleteOne({ botID: botID });
                    const tokenBalances = await getAllTokenBalances(user.publicAddress, network);
                    return tokenBalances;
                }
                else {
                    return false;
                }
            }

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
