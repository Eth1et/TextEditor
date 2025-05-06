import { Schema, Model, Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { Access } from './access';

export interface ITextDocument extends Document {
    _id: Types.ObjectId;
    creator: Types.ObjectId;
    orgID: Types.ObjectId | undefined;

    publicAccess: Access;
    orgAccess: Access;

    title: string;
    text: string;

    createdAt: Date;
    updatedAt: Date;
}

const TextDocumentSchema: Schema<ITextDocument> = new mongoose.Schema({
    creator: { type: Schema.Types.ObjectId, required: true },
    orgID: { type: Schema.Types.ObjectId, required: true },

    publicAccess: { type: String, required: true, enum: Object.values(Access), default: Access.None },
    orgAccess: { type: String, required: true, enum: Object.values(Access), default: Access.None },

    title: { type: String },
    text: { type: String },
});

export const TextDocument: Model<ITextDocument> = mongoose.model<ITextDocument>('TextDocument', TextDocumentSchema);