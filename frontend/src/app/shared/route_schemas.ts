import { z } from 'zod';
import {
    MIN_PASSWORD_LENGTH,
    MAX_PASSWORD_LENGTH,
    MIN_ORG_NAME_LENGTH,
    MAX_ORG_NAME_LENGTH,
    MAX_ORG_DESC_LENGTH
} from './constants';
import { Access } from './access';

// User Schemas
export const updatePasswordSchema = z.object({
    oldPassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    oldRePassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    newPassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
}).refine(data => data.oldPassword === data.oldRePassword, {
    message: "Passwords do not match!",
    path: ["oldRePassword"],
});

export const loginSchema = z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

export const registerSchema = z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    rePassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
}).refine(data => data.password === data.rePassword, {
    message: "Passwords do not match!",
    path: ["rePassword"],
});

export const deleteUserSchema = z.object({
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    rePassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
}).refine(data => data.password === data.rePassword, {
    message: "Passwords do not match!",
    path: ["rePassword"],
});

// Organization Schemas
export const createOrgSchema = z.object({
    name: z.string().min(MIN_ORG_NAME_LENGTH).max(MAX_ORG_NAME_LENGTH),
    description: z.string().max(MAX_ORG_DESC_LENGTH),
});

export const deleteOrgSchema = z.object({
    orgID: z.string(),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

export const updateOrgSchema = z.object({
    orgID: z.string(),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    name: z.string().min(MIN_ORG_NAME_LENGTH).max(MAX_ORG_NAME_LENGTH),
    description: z.string().max(MAX_ORG_DESC_LENGTH),
});

export const addMemberSchema = z.object({
    orgID: z.string(),
    email: z.string().email().toLowerCase(),
    admin: z.boolean(),
});

export const removeMemberSchema = z.object({
    orgID: z.string(),
    email: z.string().email().toLowerCase(),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

export const updateMemberSchema = z.object({
    orgID: z.string(),
    email: z.string().email().toLowerCase(),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    admin: z.boolean(),
});

export const queryMembersSchema = z.object({
    orgID: z.string()
});

// Document Schemas
export const searchDocumentsSchema = z.object({
    filter: z.string().toLowerCase()
});

export const saveDocumentSchema = z.object({
    docID: z.string().optional(),
    orgID: z.string().optional(),
    publicAccess: z.nativeEnum(Access),
    orgAccess: z.nativeEnum(Access),
    title: z.string(),
    text: z.string()
});

export const deleteDocumentSchema = z.object({
    docID: z.string(),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

export const addAccessOverride = z.object({
    docID: z.string(),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    email: z.string().email().toLowerCase(),
    access: z.nativeEnum(Access)
});

export const removeAccessOverride = z.object({
    docID: z.string(),
    email: z.string().email().toLowerCase(),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

export const updateAccessOverride = z.object({
    docID: z.string(),
    email: z.string().email().toLowerCase(),
    access: z.nativeEnum(Access),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

export const queryAccessOverride = z.object({
    docID: z.string(),
});