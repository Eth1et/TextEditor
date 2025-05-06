import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { INVALID_REQUEST_ERR, PASSWORDS_DONT_MATCH_ERR } from '../consts/msgs';
import { z } from 'zod';
import {
    MIN_PASSWORD_LENGTH,
    MAX_PASSWORD_LENGTH,
    MIN_ORG_NAME_LENGTH,
    MAX_ORG_NAME_LENGTH,
    MAX_ORG_DESC_LENGTH
} from '../consts/constants';

export const validate =
    (schema: ZodSchema) =>
        (req: Request, res: Response, next: NextFunction) => {
            const result = schema.safeParse(req.body);

            if (!result.success) {
                res.status(400).send(INVALID_REQUEST_ERR);
                return;
            }

            req.body = result.data;
            next();
        };

// User Schemas
export const updatePasswordSchema = z.object({
    oldPassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    oldRePassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    newPassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
}).refine(data => data.oldPassword === data.oldRePassword, {
    message: PASSWORDS_DONT_MATCH_ERR,
    path: ["oldRePassword"],
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    rePassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
}).refine(data => data.password === data.rePassword, {
    message: PASSWORDS_DONT_MATCH_ERR,
    path: ["rePassword"],
});

export const deleteUserSchema = z.object({
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    rePassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
}).refine(data => data.password === data.rePassword, {
    message: PASSWORDS_DONT_MATCH_ERR,
    path: ["rePassword"],
});

// Organization Schemas
export const createOrgSchema = z.object({
    name: z.string().min(MIN_ORG_NAME_LENGTH).max(MAX_ORG_NAME_LENGTH),
    description: z.string().max(MAX_ORG_DESC_LENGTH),
});

export const deleteOrgSchema = z.object({
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

export const updateOrgSchema = z.object({
    name: z.string().min(MIN_ORG_NAME_LENGTH).max(MAX_ORG_NAME_LENGTH),
    description: z.string().max(MAX_ORG_DESC_LENGTH),
});

export const addMemberSchema = z.object({
    email: z.string().email(),
    admin: z.boolean(),
});

export const removeMemberSchema = z.object({
    email: z.string().email(),
});

export const updateMemberSchema = z.object({
    email: z.string().email(),
    admin: z.boolean(),
});
