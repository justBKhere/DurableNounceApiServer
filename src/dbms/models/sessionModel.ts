// src/dbms/models/session.ts
import { Document, model, Schema, Model, Types } from 'mongoose';

export interface Session extends Document {
    userId: String;
    privateKey: string;
}

const sessionSchema: Schema<Session> = new Schema<Session>({
    userId: { type: String, ref: 'User', required: true },
    privateKey: { type: String, required: true },
});

const SessionModel: Model<Session> = model<Session>('Session', sessionSchema);

export default SessionModel;
