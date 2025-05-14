
export interface QueriedDocument {
    docID: string;
    title: string;
    access: number;
    orgName: string | null;
    creator: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface DocumentDetails {
    docID: string;
    title: string;
    text: string;
    access: number;
    isCreator: boolean;
    orgName: string | null;
    publicAccess: number;
    orgAccess: number;
    orgID: string;
    creator: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface QueriedOrg {
    orgID: string;
    name: string;
    creator: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrgDetails {
    orgID: string;
    name: string;
    admin: boolean;
    creator: string;
    isCreator: boolean;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface QueriedMember {
    email: string;
    admin: boolean;
    addedBy: string;
    isCreator: boolean;
}

export type CreatedID = string;

export interface UserDetails {
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface QueriedOverride {
    email: string;
    access: number;
    addedBy: string;
}