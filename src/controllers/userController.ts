// UserController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/authUtils';
import UserService from '../services/userService';
import UserModel, { User } from '../dbms/models/user';
import EncryptionInfoModel, { EncryptionInfo } from '../dbms/models/encryptionInfo';
import { v4 as uuidv4 } from 'uuid';
import { generateNewWallet } from '../utils/walletUtils';
import crypto from 'crypto';
import bip39 from 'bip39';

import SessionModel from '../dbms/models/sessionModel';

const UserController = {
    async register(req: Request, res: Response) {
        console.log(req.body)
        let { username, password, email } = req.body;
        username = username.toLowerCase();
        try {
            // Check if the username already exists
            const existingUser = await UserService.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists.' });
            }

            // Generate a new wallet for the user
            const { privateKey, publicAddress, mnemonic } = generateNewWallet();
            console.log("Wallet mnemonic: " + mnemonic,
                "privateKey: " + privateKey,
                "publicAddress: " + publicAddress);
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Generate a new UUID for the user
            const uuid = uuidv4();
            console.log("UUID: " + uuid);



            // Create the user with optional email field
            const newUser: User = new UserModel({
                username: username,
                hashedPassword: hashedPassword,
                uuid: uuid,
                privateKey: uint8ArrayToString( privateKey),
                publicAddress: publicAddress,
                mnemonic: mnemonic,
                email: email || '', // Use empty string if email is not provided
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await newUser.save();

            // Save the encryption keys and IVs in the EncryptionInfo model
            const encryptionInfo: EncryptionInfo = new EncryptionInfoModel({
                userUUID: newUser.uuid,
                encryptionKey: '',
                iv: '',
            });
            await encryptionInfo.save();

            // Generate and issue a token upon successful registration
            const token = generateToken(newUser.uuid);
            if (await createSession(newUser)) {
                return res.json({
                    message: 'Authentication successful.',

                    result: {
                        username: newUser.username,
                        publicAddress: newUser.publicAddress,
                        jwtToken: token,
                    },
                });
            } else {
                return res.status(500).json({ message: 'Encryption information not found.' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    async login(req: Request, res: Response) {
        const { username, password } = req.body;

        try {
            // Find the user by username
            const user = await UserService.findByUsername(username);
            if (!user) {
                return res.status(401).json({ message: 'Authentication failed: Invalid credentials.' });
            }

            // Check if the password is valid
            const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Authentication failed: Invalid credentials.' });
            }

            // Generate and issue a token upon successful authentication
            const token = generateToken(user.uuid);

            if (await createSession(user)) {
                return res.json({
                    message: 'Authentication successful.',

                    result: {
                        username: user.username,
                        publicAddress: user.publicAddress,
                        jwtToken: token,
                    },
                });
            } else {
                return res.status(500).json({ message: 'Encryption information not found.' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // Rest of the code...

};

async function createSession(user: User) {
    // Decrypt the private key
    const encryptionInfo = await EncryptionInfoModel.findOne({ userUUID: user.uuid });
    if (!encryptionInfo) {
        return false;
    }
    return true;
}

export function uint8ArrayToString(data: Uint8Array): string {
    const textDecoder = new TextDecoder();
    return textDecoder.decode(data);
}

// Function to convert string to Uint8Array
export function stringToUint8Array(data: string): Uint8Array {
    const textEncoder = new TextEncoder();
    return textEncoder.encode(data);
}

export default UserController;
