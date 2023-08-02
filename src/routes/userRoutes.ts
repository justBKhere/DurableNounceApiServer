// src/routes/userRoutes.ts
import express, { Router, Request, Response } from 'express';
import UserController from '../controllers/userController';

const router: Router = express.Router();

// Register a new user
router.post('/register', UserController.register);

// Login with username and password
router.post('/login', UserController.login);



export default router;
