import web3 from '@solana/web3.js';
import app from './app';

import { connectToDatabase } from './dbms/service/dbms';
import dotenv from 'dotenv';
import { CloseNonceAccount, CreateNonceAccount, SignTransactionUsingDurableNounce, sendSerializedTransaction } from './services/nonceService';
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
//CloseNonceAccount('devnet');
   // SignTransactionUsingDurableNounce('devnet');
    //sendSerializedTransaction('devnet',"66x5KjLpC1mcwEtF52HLYs8jhbHEsvGwS34gXHs1hTTkCGsaPu7T8EpwaDnrXL1dHVGKryFF1psPRGyd6axn6S6LpqNNJFjGfSKjT69WaHSy9zzmtLHX7UKEzYYxHh4FbFqPDb6rrTtFHFroM87AeoDTCvGRBM4xzKikCKxjxpBEqMDNPpijoeAhnx1PU3FtSgckCiP5AjzL7YPHoHuHwq3DF24cdo4oiUieVuDyacCJWWQD8v34dgEgK84cyVs48hA3SJKMn7MGcUpwgNkXjNFJTjafW14YWDtRXKJw2qxfbSVipU8FcJxPBH1VTAvsv9PvUTA3u8Tgi5nkpo9ghsrBM2JtXD3jLtvJtxsHafPFjUxFsvH61RzLBtWtZarzPQCuv8cUxw");
    

    