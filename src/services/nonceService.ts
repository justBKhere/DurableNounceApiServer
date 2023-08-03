import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Connection, Keypair, LAMPORTS_PER_SOL, NONCE_ACCOUNT_LENGTH, NonceAccount, PublicKey, SystemProgram, Transaction, TransactionInstruction, clusterApiUrl, sendAndConfirmRawTransaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { AccountLayout, createTransferInstruction, createWithdrawWithheldTokensFromAccountsInstruction, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { base58ToUint8Array, uint8ArrayToBase58 } from '../utils/base58Utils';
import { setConnection } from '../utils/walletUtils';
import { connect } from 'http2';
import base58 from 'bs58';
import { connection } from 'mongoose';
import { Console } from 'console';
import { botBuildingNonce } from '../dbms/models/botBuildingNonce';
import { User } from '../dbms/models/user';

const nonceAccount = Keypair.fromSecretKey(base58ToUint8Array(process.env.NONCE_ACCOUNT_PRIVATE_KEY as string));
console.log("nonceAccount", nonceAccount.publicKey.toBase58());
console.log("nonceAccount.secretKey", uint8ArrayToBase58(nonceAccount.secretKey));
export async function CreateNonceAccount(network: string) {
    const nonceAccount = Keypair.generate();
    const connection = setConnection(network);
    const tx = new Transaction();
    tx.feePayer = new PublicKey(process.env.NONCE_PUBLIC_KEY as string);

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.add(
        SystemProgram.createAccount({
            fromPubkey: new PublicKey(process.env.NONCE_PUBLIC_KEY as string),
            newAccountPubkey: nonceAccount.publicKey,
            lamports: 0.0015 * LAMPORTS_PER_SOL,
            space: NONCE_ACCOUNT_LENGTH,
            programId: SystemProgram.programId,

        }),
        SystemProgram.nonceInitialize({
            noncePubkey: nonceAccount.publicKey,
            authorizedPubkey: new PublicKey(process.env.NONCE_PUBLIC_KEY as string),
        })
    );

    tx.sign(nonceAccount, Keypair.fromSecretKey(base58ToUint8Array(process.env.NONCE_PRIVATE_KEY as string)));

    const signature = await sendAndConfirmRawTransaction(connection, tx.serialize());


    console.log("Nonce initiated: ", signature);
    const accountInfo = await connection.getAccountInfo(nonceAccount.publicKey);
    const nonceAccountInfo = NonceAccount.fromAccountData(accountInfo?.data as Buffer);


    console.log("Nonce Account: ", nonceAccountInfo);
}

export async function CreateNonceAccountUser(network: string, userPublicKey: string, userPrivateKey: string) {
    const nonceAccount = Keypair.generate();
    const connection = setConnection(network);
    const tx = new Transaction();
    tx.feePayer = new PublicKey(userPublicKey as string);

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.add(
        SystemProgram.createAccount({
            fromPubkey: new PublicKey(userPublicKey as string),
            newAccountPubkey: nonceAccount.publicKey,
            lamports: 0.0015 * LAMPORTS_PER_SOL,
            space: NONCE_ACCOUNT_LENGTH,
            programId: SystemProgram.programId,

        }),
        SystemProgram.nonceInitialize({
            noncePubkey: nonceAccount.publicKey,
            authorizedPubkey: new PublicKey(userPublicKey as string),
        })
    );

    tx.sign(nonceAccount, Keypair.fromSecretKey(base58ToUint8Array(userPrivateKey as string)));

    const signature = await sendAndConfirmRawTransaction(connection, tx.serialize());


    console.log("Nonce initiated: ", signature);
    const accountInfo = await connection.getAccountInfo(nonceAccount.publicKey);
    const nonceAccountInfo = NonceAccount.fromAccountData(accountInfo?.data as Buffer);

    return {
        noncePubKey: nonceAccount.publicKey,
        nonceAccount: nonceAccountInfo
    }
    console.log("Nonce Account: ", nonceAccountInfo);
}

export async function CloseNonceAccountUser(network: string, noncePublicKey: string, userPubkey: string, userPrivateKey: string) {
    let tx = new Transaction();
    tx.add(SystemProgram.nonceWithdraw({
        noncePubkey: new PublicKey(noncePublicKey),
        authorizedPubkey: new PublicKey(userPubkey as string),
        toPubkey: new PublicKey(userPubkey as string),
        lamports: 0.0015 * LAMPORTS_PER_SOL,
    }))
    tx.recentBlockhash = (await setConnection(network).getLatestBlockhash()).blockhash;
    tx.sign(Keypair.fromSecretKey(base58ToUint8Array(userPrivateKey as string)));
    const signature = await sendAndConfirmTransaction(setConnection(network), tx, [Keypair.fromSecretKey(base58ToUint8Array(userPrivateKey as string))]);
    console.log("Nonce closed: ", signature);
}
export async function CloseNonceAccount(network: string) {
    let tx = new Transaction();
    tx.add(SystemProgram.nonceWithdraw({
        noncePubkey: nonceAccount.publicKey,
        authorizedPubkey: new PublicKey(process.env.NONCE_PUBLIC_KEY as string),
        toPubkey: new PublicKey(process.env.NONCE_PUBLIC_KEY as string),
        lamports: 0.0015 * LAMPORTS_PER_SOL,
    })

    )

    tx.recentBlockhash = (await setConnection(network).getLatestBlockhash()).blockhash;
    tx.sign(Keypair.fromSecretKey(base58ToUint8Array(process.env.NONCE_PRIVATE_KEY as string)));
    const signature = await sendAndConfirmTransaction(setConnection(network), tx, [Keypair.fromSecretKey(base58ToUint8Array(process.env.NONCE_PRIVATE_KEY as string))]);
    console.log("Nonce closed: ", signature);
}


export async function SignTransactionUsingDurableNounce(network: string) {
    const accountInfo = await setConnection(network).getAccountInfo(nonceAccount.publicKey);
    const nonceInfo = NonceAccount.fromAccountData(accountInfo?.data as Buffer);
    console.log("Nonce Account: ", nonceInfo);
    const connection = setConnection(network);


    const fromPublicKey = new PublicKey(process.env.NONCE_PUBLIC_KEY as string);
    const toPublicKey = new PublicKey("9QkreA6FKVKSLRxVPwXYyuydsymdMyVQQCnDAGGMUVfp");
    const noncePubkey = base58ToUint8Array(process.env.NONCE_PUBLIC_KEY as string);
    const ix = SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: toPublicKey,
        lamports: 100000,
    });

    const advanceTx = SystemProgram.nonceAdvance({
        authorizedPubkey: new PublicKey(process.env.NONCE_PUBLIC_KEY as string),
        noncePubkey: nonceAccount.publicKey,
    })

    const tx = new Transaction();
    tx.add(advanceTx);
    tx.add(ix);

    tx.recentBlockhash = nonceInfo.nonce;
    tx.feePayer = fromPublicKey;

    tx.sign(Keypair.fromSecretKey(base58ToUint8Array(process.env.NONCE_PRIVATE_KEY as string)));
    //tx.sign(Keypair.fromSecretKey(base58ToUint8Array(process.env.PRIVATE_KEY as string)));
    const serializeTx = base58.encode(tx.serialize({ requireAllSignatures: false }));

    console.log("Transaction Signature", (tx.signature)?.toString('base64'));
    console.log("Serialized transaction: ", serializeTx);

    await sendSerializedTransaction(network, serializeTx);
}


export async function GetNounceIx(userPubKey: PublicKey, noncePubKey: PublicKey) {
    const advanceTx = SystemProgram.nonceAdvance({
        authorizedPubkey: userPubKey,
        noncePubkey: noncePubKey,
    })
    return advanceTx;
}

export async function ExecuteBotNonceTx(botData: botBuildingNonce, user: User, network: string) {
    try {

        const sx = await setConnection(network).sendRawTransaction(base58.decode(botData.nonceTxn));
        console.log("sx", sx);
        if (sx) {
            CloseNonceAccountUser(network, botData.nonceAccountPubKey, user.publicAddress, user.privateKey);
            return true

        }
    }
    catch (error) {
        console.error(error);
        return false
    }

}


//test for consecutive executions
export async function SignTransactionUsingDurableNounce2(network: string, nounceInfo: any) {
    const connection = setConnection(network);


    const fromPublicKey = new PublicKey(process.env.NONCE_PUBLIC_KEY as string);
    const toPublicKey = new PublicKey("MMXR4v5L8AtgGeAqQRyz9oCtmQRabQYFZH8bPenGyDE");
    const noncePubkey = base58ToUint8Array(process.env.NONCE_PUBLIC_KEY as string);
    const ix = SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: toPublicKey,
        lamports: 100000,
    });

    const advanceTx = SystemProgram.nonceAdvance({
        authorizedPubkey: new PublicKey(process.env.NONCE_PUBLIC_KEY as string),
        noncePubkey: nonceAccount.publicKey,
    })

    const tx = new Transaction();
    tx.add(advanceTx);
    tx.add(ix);

    tx.recentBlockhash = nounceInfo;
    tx.feePayer = fromPublicKey;

    tx.sign(Keypair.fromSecretKey(base58ToUint8Array(process.env.NONCE_PRIVATE_KEY as string)));
    //tx.sign(Keypair.fromSecretKey(base58ToUint8Array(process.env.PRIVATE_KEY as string)));
    const serializeTx = base58.encode(tx.serialize({ requireAllSignatures: false }));

    console.log("Transaction Signature", (tx.signature)?.toString('base64'));
    console.log("Serialized transaction: ", serializeTx);

    await sendSerializedTransaction(network, serializeTx);
}

export async function sendSerializedTransaction(network: string, serializedTx: string) {
    const sx = await setConnection(network).sendRawTransaction(base58.decode(serializedTx));
    console.log("Serialized transaction: ", sx);
}



