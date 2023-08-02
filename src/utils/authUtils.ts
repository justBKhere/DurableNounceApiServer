// src/utils/authUtils.ts
import jwt from 'jsonwebtoken';
import UserService from '../services/userService';
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_key_here';

// Function to generate a JWT token
export const generateToken = (userId: string): string => {

    //sign the JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' }); // You can customize the token expiration time as needed
    return token;
};

export async function getPrivateKeyFromToken(req: any) {
    const uuid = req.user.userId;
    try {
        const user = await UserService.findByUuid(uuid);
        if (!user) {
            return null;
        }
        return user.privateKey;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
