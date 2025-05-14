import { Schema, Model, Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { Access, accessValues } from '../shared/access';

export interface IAccessOverride extends Document {
    _id: Types.ObjectId;
    userID: Types.ObjectId;
    docID: Types.ObjectId;
    addedBy: Types.ObjectId;
    access: Access;
    createdAt: Date;
    updatedAt: Date;
}

const AccessOverrideSchema: Schema<IAccessOverride> = new mongoose.Schema({
    userID: { type: Schema.Types.ObjectId, required: true },
    docID: { type: Schema.Types.ObjectId, required: true },
    access: { type: Number, required: true, enum: accessValues, default: Access.None },
    addedBy: { type: Schema.Types.ObjectId, required: true },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            return {};
        },
    },
});

export const AccessOverride: Model<IAccessOverride> = mongoose.model<IAccessOverride>('AccessOverride', AccessOverrideSchema);