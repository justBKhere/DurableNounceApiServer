// src/dbms/models/encryptionInfo.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface EncryptionInfo extends Document {
    userUUID: string;
    encryptionKey: string;
    iv: string;
}

const encryptionInfoSchema: Schema<EncryptionInfo> = new Schema<EncryptionInfo>({
    userUUID: { type: String, required: true, unique: true },
    encryptionKey: { type: String, required: false },
    iv: { type: String, required: false },
});

const EncryptionInfoModel = mongoose.model<EncryptionInfo>('EncryptionInfo', encryptionInfoSchema);

export default EncryptionInfoModel;
