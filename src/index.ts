import web3 from '@solana/web3.js';
import app from './app';

import { connectToDatabase } from './dbms/service/dbms';
import dotenv from 'dotenv';
import { CreateNonceAccount } from './services/nonceService';
dotenv.config();


connectToDatabase()
    .then(() => {
        // Start the Express server after successful database connection
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to the database:', error);
        process.exit(1); // Exit the application with an error code
    });

    CreateNonceAccount('devnet');