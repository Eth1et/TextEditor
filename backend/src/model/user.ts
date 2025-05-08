import { Express } from 'express';
import { Schema, Model, Document, Types, InferSchemaType } from 'mongoose';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { SALT_FACTOR } from '../consts/constants';

export interface IUser extends Document, Express.User {
    _id: Types.ObjectId;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;

    comparePassword: (
        candidatePassword: string,
        callback: (error: Error | null, isMatch: boolean) => void
    ) => void;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    passwordHash: { type: String, required: true },
}, {
    timestamps: true,
    toJSON: {
        transform(_doc, ret) {
            delete ret.passwordHash;
            delete ret._id;
            delete ret.__v;
            delete ret.updatedAt;
            return ret;
        },
    },
})

UserSchema.pre<IUser>('save', function (next) {
    const user = this;
    bcrypt.genSalt(SALT_FACTOR, (error, salt) => {
        if (error) {
            return next(error);
        }
        bcrypt.hash(user.passwordHash, salt, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.passwordHash = hash;
            next();
        })
    })
});

UserSchema.methods.comparePassword = function (
    candidatePassword: string,
    callback: (error: Error | null, isMatch: boolean) => void
) {
    const user = this;
    bcrypt.compare(candidatePassword, user.passwordHash, (error, isMatch) => {
        if (error) {
            callback(error, false);
        }
        else {
            callback(null, isMatch);
        }
    })
};

export type UserType = InferSchemaType<typeof UserSchema>;
export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);