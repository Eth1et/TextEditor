import { Schema, Model, Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export interface IOrgMembership extends Document {
    _id: Types.ObjectId;
    userID: Types.ObjectId;
    orgID: Types.ObjectId;
    admin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const OrgMembershipSchema: Schema<IOrgMembership> = new mongoose.Schema({
    userID: { type: Schema.Types.ObjectId, required: true },
    orgID: { type: Schema.Types.ObjectId, required: true },
    admin: { type: Boolean, required: true }
});

export const OrgMembership: Model<IOrgMembership> = mongoose.model<IOrgMembership>('OrgMembership', OrgMembershipSchema);