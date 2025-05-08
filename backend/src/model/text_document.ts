import { Schema, Model, Document, Types, InferSchemaType ,} from 'mongoose';
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

    publicAccess: { type: Number, required: true, enum: Object.values(Access), default: Access.None },
    orgAccess: { type: Number, required: true, enum: Object.values(Access), default: Access.None },

    title: { type: String },
    text: { type: String },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.__v;
            return ret;
        },
    },
});

export type TextDocumentType = InferSchemaType<typeof TextDocumentSchema>;
export const TextDocument: Model<ITextDocument> = mongoose.model<ITextDocument>('TextDocument', TextDocumentSchema);