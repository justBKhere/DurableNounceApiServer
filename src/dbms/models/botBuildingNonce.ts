// src/models/user.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface botBuildingNonce extends Document {
    uuid: string;
    nonceAccountPubKey: string;
    botAddress: string;
    nonceTxn: string;
    createdAt: Date;
    botID: string;
    TimetoComplete: number;
}

const userSchema: Schema<botBuildingNonce> = new Schema<botBuildingNonce>({
    uuid: { type: String, required: true },
    nonceAccountPubKey: { type: String, required: true },
    nonceTxn: { type: String, required: true },
    createdAt: { type: Date, required: true },
    botID: { type: String, required: true },
    TimetoComplete: { type: Number, required: true },
    // Add any other required fields here
});

const BotBuildingModel = mongoose.model<botBuildingNonce>('botBuildingNonce', userSchema);

export default BotBuildingModel;
