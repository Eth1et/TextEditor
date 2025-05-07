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
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret._id;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
            return ret;
        },
    },
});

export const Org: Model<IOrg> = mongoose.model<IOrg>('Org', OrgSchema);