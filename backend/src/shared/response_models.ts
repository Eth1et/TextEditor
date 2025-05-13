
export interface QueriedDocument {
    docID: string;
    title: string;
    access: number;
    orgName: string | null;
    creator: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface QueriedOrg {
    orgID: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrgDetails {
    orgID: string;
    name: string;
    isAdmin: boolean
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export type CreatedID = string;

export interface UserDetails {
    email: string;
    createdAt: Date;
    updatedAt: Date;
}