export interface QueriedDocument {
    docID: string;
    title: string;
    access: number;
    orgName: string | null;
    creator: string;
    createdAt: Date;
    updatedAt: Date;
}