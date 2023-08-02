// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_key_here';

// Define a custom interface to add the 'user' property to the Request object
interface AuthRequest extends Request {
    user?: any; // Replace 'any' with the type of your user object, if known
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication failed: No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Authentication failed: Invalid token.' });
    }
};

export default authMiddleware;
