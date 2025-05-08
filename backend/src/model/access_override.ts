import { Schema, Model, Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { Access } from './access';
import { z } from 'zod';

export interface IAccessOverride extends Document {
    _id: Types.ObjectId;
    userID: Types.ObjectId;
    docID: Types.ObjectId;
    access: Access;
    createdAt: Date;
    updatedAt: Date;
}

const AccessOverrideSchema: Schema<IAccessOverride> = new mongoose.Schema({
    userID: { type: Schema.Types.ObjectId, required: true },
    docID: { type: Schema.Types.ObjectId, required: true },
    access: { type: Number, required: true, enum: Object.values(Access), default: Access.None }
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            return {};
        },
    },
});

export const AccessOverride: Model<IAccessOverride> = mongoose.model<IAccessOverride>('AccessOverride', AccessOverrideSchema);