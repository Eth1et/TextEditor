import { Schema, Model, Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export interface IOrg extends Document {
    _id: Types.ObjectId;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrgSchema: Schema<IOrg> = new mongoose.Schema({
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String },
});

export const Org: Model<IOrg> = mongoose.model<IOrg>('Org', OrgSchema);