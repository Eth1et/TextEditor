import { Schema, Model, Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { QueriedOrg } from '../shared/response_models';

export interface IOrg extends Document {
    _id: Types.ObjectId;
    name: string;
    creator: Types.ObjectId;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    toQuriedOrg: (creator: string) => QueriedOrg;
}

const OrgSchema: Schema<IOrg> = new mongoose.Schema({
    name: { type: String, required: true, unique: true, index: true },
    creator: {type: Schema.Types.ObjectId, required: true },
    description: { type: String },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.__v;
            delete ret.creator;
            return ret;
        },
    },
});

OrgSchema.methods.toQuriedOrg = function (creator: string): QueriedOrg {
    return {
        orgID: this._id,
        name: this.name,
        creator: creator.toString(),
        description: this.description,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
}

export const Org: Model<IOrg> = mongoose.model<IOrg>('Org', OrgSchema);