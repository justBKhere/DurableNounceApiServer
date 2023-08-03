import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Connection, Keypair, LAMPORTS_PER_SOL, NONCE_ACCOUNT_LENGTH, NonceAccount, PublicKey, SystemProgram, Transaction, TransactionInstruction, clusterApiUrl, sendAndConfirmRawTransaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { AccountLayout, createTransferInstruction, getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { base58ToUint8Array, uint8ArrayToBase58 } from '../utils/base58Utils';
import { setConnection } from '../utils/walletUtils';
import { connect } from 'http2';


export async function CreateNonceAccount(network:string)
{
    const nonceAccount = Keypair.generate();
    const connection = setConnection(network);
 const tx = new Transaction();
 tx.feePayer = new PublicKey( process.env.NONCE_PUBLIC_KEY as string);

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

tx.sign(nonceAccount,Keypair.fromSecretKey(base58ToUint8Array(process.env.NONCE_PRIVATE_KEY as string)));

const signature = await sendAndConfirmRawTransaction(connection, tx.serialize());


console.log("Nonce initiated: ", signature);
const accountInfo = await connection.getAccountInfo(nonceAccount.publicKey);
const nonceAccountInfo  = NonceAccount.fromAccountData(accountInfo?.data as Buffer);

console.log("Nonce Account: ", nonceAccountInfo);
}