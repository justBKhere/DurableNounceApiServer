import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction, TransactionInstruction, clusterApiUrl, sendAndConfirmTransaction } from '@solana/web3.js';
import { AccountLayout, createTransferInstruction, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { base58ToUint8Array, uint8ArrayToBase58 } from './base58Utils';
import base58 from 'bs58';

interface Wallet {
    privateKey: Uint8Array;
    mnemonic: string;
    publicAddress: string;
}
/*
const nonceKeypair = Keypair.generate();

console.log("nonceKeypair", nonceKeypair);


const noncePrivate = uint8ArrayToBase58(nonceKeypair.secretKey);
const noncePublic = nonceKeypair.publicKey.toBase58();

console.log("nonceKeypair.secretKey", noncePrivate);
console.log("nonceKeypair.publicKey", noncePublic);

*/
export function generateNewWallet(): Wallet {
    const wallet: Wallet = {} as Wallet;
    const mnemonic = generateMnemonic(256);
    const master_seed = mnemonicToSeedSync(mnemonic);
    const index = 0;
    const derived_path = `m/44'/501'/${index}'/0'`;
    const derived_seed = derivePath(derived_path, master_seed.toString('hex')).key;
    const keypair = Keypair.fromSeed(derived_seed);

    console.log("keypair", keypair);
    wallet.privateKey = keypair.secretKey;
    wallet.mnemonic = mnemonic;
    wallet.publicAddress = keypair.publicKey.toBase58();
    console.log("Wallet mnemonic: " + wallet.mnemonic);
    console.log(keypair.publicKey.toBase58());
    return wallet;
}
export function setConnection(network?: string) {
    let connection: Connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    switch (network) {
        case 'mainnet':
            connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
            break;
        case 'testnet':
            connection = new Connection(clusterApiUrl('testnet'), 'confirmed');
            break;
        case 'devnet':
            connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        // Add more cases for other networks if needed
        default:
            connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    }
    return connection;
}

export async function GetBalance(publicKeyStr: string, network?: string) {
    const connection = setConnection(network);
    const publicKey = new PublicKey(publicKeyStr);
    const balance = await connection.getBalance(publicKey);
    console.log('Balance:', balance);
    return balance;

}


export async function AirdropSol(publicKeyStr: string, amount: number, network?: string) {
    try {
        const connection = setConnection(network);
        const publicKey = new PublicKey(publicKeyStr);
        const signature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
        console.log('Airdrop request submitted:', signature);
        return signature;
    } catch (error) {
        console.error('Error airdropping SOL:', error);
        return null;
    }
}


export async function GatherAssets(tokenAddress:string,toPublicAddress:string, amount:number, network?:string){
    try{
        const connection = setConnection(network);
        const fromAddress: any = process.env.PUBLIC_KEY;
        const fromPrivateKey: any = process.env.PRIVATE_KEY;
        const fromKeyPair = Keypair.fromSecretKey(base58ToUint8Array(fromPrivateKey));
    }
    catch(error){
        console.log(error);
    }
}
export async function SendAssetToPlayer(tokenAddress: string, toPublicAddress: string, amount: number, network?: string) {
    try {
        const connection = setConnection(network);
        const fromAddress: any = process.env.PUBLIC_KEY;
        const fromPrivateKey: any = process.env.PRIVATE_KEY;
        const fromKeyPair = Keypair.fromSecretKey(base58ToUint8Array(fromPrivateKey));

        let sourceAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromKeyPair,
            new PublicKey(tokenAddress),
            fromKeyPair.publicKey
        );
        console.log(`    Source Account: ${sourceAccount.address.toString()}`);

        let destinationAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromKeyPair,
            new PublicKey(tokenAddress),
            new PublicKey(toPublicAddress)
        )

        const transferInstruction: TransactionInstruction = createTransferInstruction(
            sourceAccount.address,
            destinationAccount.address,
            fromKeyPair.publicKey,
            BigInt(amount),

        )
        const transaction = new Transaction().add(transferInstruction);
        const recentBlockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = recentBlockhash.blockhash;
        console.log("transaction", transaction);

        const signature = await sendAndConfirmTransaction(connection, transaction, [Keypair.fromSecretKey(base58ToUint8Array(fromPrivateKey))]);
        const solanaExplorerUrl = `https://explorer.solana.com/tx/${signature}`;

        console.log('%cClick here to view the transaction', 'color: blue; text-decoration: underline; cursor: pointer', solanaExplorerUrl);
        if (signature) {
            const updatedTokenBalance = await getAllTokenBalances(toPublicAddress, network);
            return updatedTokenBalance;
        }
        else {
            return null
        }

    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function GetAssetFromPlayer(tokenAddress:string,userPublicKey:string, userPrivateAddress:string, amount: string, network?: string)
{
     try {
        const connection = setConnection(network);
        const fromAddress: any = userPublicKey;
        const fromPrivateKey: string = userPrivateAddress;
        console.log("fromPrivateKey", fromPrivateKey);
        const decodedPrivateKey = base58.decode(fromPrivateKey);
        const fromKeyPair = Keypair.fromSecretKey(decodedPrivateKey);
        const gameServerAddress:string = process.env.PUBLIC_KEY as string;

        let sourceAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromKeyPair,
            new PublicKey(tokenAddress),
            fromKeyPair.publicKey
        );
        console.log(`Source Account: ${sourceAccount.address.toString()}`);

        let destinationAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromKeyPair,
            new PublicKey(tokenAddress),
            new PublicKey(gameServerAddress)
        )

        const transferInstruction: TransactionInstruction = createTransferInstruction(
            sourceAccount.address,
            destinationAccount.address,
            fromKeyPair.publicKey,
            BigInt(amount),

        )
        const transaction = new Transaction().add(transferInstruction);
        const recentBlockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = recentBlockhash.blockhash;
        console.log("transaction", transaction);

        const signature = await sendAndConfirmTransaction(connection, transaction, [Keypair.fromSecretKey(base58ToUint8Array(fromPrivateKey))]);
        const solanaExplorerUrl = `https://explorer.solana.com/tx/${signature}`;

        console.log('%cClick here to view the transaction', 'color: blue; text-decoration: underline; cursor: pointer', solanaExplorerUrl);
        if (signature) {
            const updatedTokenBalance = await getAllTokenBalances(fromAddress, network);
            return updatedTokenBalance;
        }
        else {
            return null
        }

    } catch (error) {
        console.error(error);
        return null;
    }
}




export async function ManufactureBot(consumetokenAddress: string[],buildTokenAddress: string, clientPrivate: string, network?: string) {
    try {
        const connection = setConnection(network);
        const serverAddress: any = process.env.PUBLIC_KEY;
        const serverPrivateKey: any = process.env.PRIVATE_KEY;
        const serverKeyPair = Keypair.fromSecretKey(base58ToUint8Array(serverPrivateKey));
        const clientKeyPair = Keypair.fromSecretKey(base58ToUint8Array(clientPrivate));
        //bot send ix
const transaction = new Transaction();

        for(const tokenAddress of consumetokenAddress){
        const receivetx = await buildix(tokenAddress, clientKeyPair, serverAddress, 20, network);
        transaction.add(receivetx);
    }
const sendtx = await buildix(buildTokenAddress, serverKeyPair, clientKeyPair, 1, network);
transaction.add(sendtx);
const recentBlockhash = await connection.getLatestBlockhash();
transaction.recentBlockhash = recentBlockhash.blockhash;
console.log("transaction", transaction);
const signature = await sendAndConfirmTransaction(connection, transaction, [Keypair.fromSecretKey(base58ToUint8Array(serverPrivateKey)), Keypair.fromSecretKey(base58ToUint8Array(clientPrivate))]);
const solanaExplorerUrl = `https://explorer.solana.com/tx/${signature}`;

        console.log('%cClick here to view the transaction', 'color: blue; text-decoration: underline; cursor: pointer', solanaExplorerUrl);
        if (signature) {
            const updatedTokenBalance = await getAllTokenBalances(clientKeyPair.publicKey.toString(), network);
            return updatedTokenBalance;
        }
        else {
            return null
        }

    } catch (error) {
        console.error(error);
        return null;
    }
}

async function buildix(tokenAddress: string, fromKeyPair: Keypair, toKeyPair: Keypair, amount: number, network?: string) {
    const connection = setConnection(network);
    const sourceAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromKeyPair,
        new PublicKey(tokenAddress),
        fromKeyPair.publicKey
    );
    const destinationAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromKeyPair,
        new PublicKey(tokenAddress),
        toKeyPair.publicKey
    )
    const transferInstruction: TransactionInstruction = createTransferInstruction(
        sourceAccount.address,
        destinationAccount.address,
        fromKeyPair.publicKey,
        BigInt(amount),
    )
    return transferInstruction
}



export async function getAllTokenBalances(walletAddress: string, network?: string) {
    console.log("Getting All Token Balances for", walletAddress);


    const walletPublicKey = new PublicKey(walletAddress);
    try {
        const tokenAccounts = await setConnection(network).getTokenAccountsByOwner(walletPublicKey, {
            programId: TOKEN_PROGRAM_ID,
        });

        if (tokenAccounts.value.length === 0) {
            throw new Error('No tokens found for the given wallet address');
        }

        const tokens = [];
        for (const tokenAccount of tokenAccounts.value) {
            const accountData = AccountLayout.decode(tokenAccount.account.data);
            const amount = accountData.amount;

            const token = {
                mint: new PublicKey(accountData.mint),
                amount: amount,
            };

            tokens.push({
                tokenAddress: token.mint.toString(),
                balance: token.amount.toString(),

            });
        }
        console.log("Total tokens", tokens.length);

        return tokens;
    } catch (error) {
        console.error(error);
        return null;
        throw new Error('Failed to retrieve token balances');
    }
}