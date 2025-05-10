import { Schema, Model, Document, Types, InferSchemaType, } from 'mongoose';
import mongoose from 'mongoose';
import { Access } from '../shared/access';
import { QueriedDocument } from '../shared/response_models';

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

    toQueryResFormat: (access: Access, orgName: string | null) => QueriedDocument;
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

TextDocumentSchema.methods.toQueryResFormat = function (access: Access, orgName: string | null) {
    const doc: QueriedDocument = {
        docID: this.docID,
        access: access,
        title: this.title,
        orgName: orgName,
        creator: this.creator,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
    return doc;
}

export type TextDocumentType = InferSchemaType<typeof TextDocumentSchema>;
export const TextDocument: Model<ITextDocument> = mongoose.model<ITextDocument>('TextDocument', TextDocumentSchema);