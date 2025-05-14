import { Request, Router, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { TOO_MANY_REQUESTS_ERR, INTERNAL_ERR, NO_SUCH_DOCUMENT_ERR, MUST_BE_CREATOR_ERR, DOC_SAVE_SUCCESS, SESSION_EXPIRED_ERR, INCORRECT_PASSWORD_ERR, DOC_DELETE_SUCCESS, NO_USER_WITH_GIVEN_EMAIL_ERR, USER_NOT_MEMBER_OF_ORG_ERR, INSUFFICIENT_ACCESS_ERR, ACCESS_OVERRIDE_DOESNT_EXIST_ERR, ACCESS_OVERRIDE_SUCCESS, ACCESS_OVERRIDE_ALREADY_EXIST_ERR, ORG_DOESNT_EXIST_ERR } from "../consts/msgs";
import { addAccessOverride, createDocumentSchema, deleteDocumentSchema, docDetailsSchema, docPriviligesSchema, queryAccessOverride, removeAccessOverride, saveDocumentSchema, searchDocumentsSchema, updateAccessOverride } from "../shared/route_schemas";
import { validate } from ".";
import type { Types } from 'mongoose';
import { Org } from "../model/organization";
import { OrgMembership } from "../model/org_membership";
import { User } from "../model/user";
import { Access } from "../shared/access";
import { AccessOverride } from "../model/access_override";
import { TextDocument, TextDocumentType, toDocQueryResFormatFromLeanDoc } from "../model/text_document";
import { comparePasswordAsync, ensureAuthenticated, logout } from "./user_routes";
import { CreatedID, DocumentDetails, QueriedOverride } from "../shared/response_models";


export async function checkUserAccess(
    userID: Types.ObjectId,
    doc: TextDocumentType
): Promise<Access> {
    if (doc.creator.equals(userID)) {
        return Access.Editor;
    }

    const override = await AccessOverride.findOne({ userID, documentID: doc._id });
    if (override) {
        return override.access;
    }

    if (doc.publicAccess === Access.Editor) {
        return doc.publicAccess;
    }

    if (doc.orgID) {
        const membership = await OrgMembership.findOne({ userID, orgID: doc.orgID });
        if (membership && (doc.orgAccess === Access.Viewer || doc.orgAccess === Access.Editor)) {
            return doc.orgAccess;
        }
    }

    if (doc.publicAccess === Access.Viewer) {
        return doc.publicAccess;
    }

    return Access.None;
}

export function escapeText(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const configureDocumentRoutes = (router: Router): Router => {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 2000,
        message: TOO_MANY_REQUESTS_ERR
    });

    router.post('/query-documents', validate(searchDocumentsSchema), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        try {
            const { filter } = searchDocumentsSchema.parse(req.body);
            const userID = req.user as Types.ObjectId;

            const or: any[] = [];
            if (filter) {
                // Text based filtering
                const escaped = escapeText(filter);
                or.push({ title: { $regex: escaped, $options: 'i' } });

                // RegExp based filtering
                try {
                    or.unshift({ title: { $regex: new RegExp(filter, 'i') } });
                } catch { }
            }

            const docs = await TextDocument.find(or.length ? { $or: or } : {}).lean();
            const docIds = docs.map(d => d._id);
            const orgIDs = Array.from(
                new Set(docs.map(d => d.orgID?.toString()).filter(Boolean))
            );

            const [overrides, memberships, orgs] = await Promise.all([
                AccessOverride.find({ userID, documentID: { $in: docIds } }).lean(),
                OrgMembership.find({ userID, orgID: { $in: orgIDs } }).lean(),
                Org.find({ _id: { $in: orgIDs } }, { _id: 1, name: 1 }).lean()
            ]);

            const creatorIDs = docs.map(doc => doc.creator);
            const creators = await User.find({ _id: { $in: creatorIDs } });
            const creatorMap = new Map(
                creators.map(creator => [creator._id.toString(), creator.email])
            );

            const overrideMap = new Map(overrides.map(o => [o.docID.toString(), o.access]));
            const membershipMap = new Map(memberships.map(m => [m.orgID.toString(), m.admin]));
            const orgNameMap = new Map(orgs.map(o => [o._id.toString(), o.name]));

            const visible = docs.reduce((out, doc) => {
                let access = overrideMap.get(doc._id.toString());

                if (access == null) {
                    if (doc.creator.equals(userID)) {
                        access = Access.Editor;
                    }
                    else if (doc.publicAccess >= Access.Editor) {
                        access = doc.publicAccess;
                    }
                    else if (doc.orgID && membershipMap.has(doc.orgID.toString()) && doc.orgAccess >= Access.Viewer) {
                        access = doc.orgAccess;
                    }
                    else if (doc.publicAccess >= Access.Viewer) {
                        access = doc.publicAccess;
                    }
                    else {
                        access = Access.None;
                    }
                }

                if (access >= Access.Viewer) {
                    out.push(toDocQueryResFormatFromLeanDoc(
                        doc,
                        access,
                        doc.orgID ? orgNameMap.get(doc.orgID.toString()) ?? null : null,
                        creatorMap.get(doc.creator.toString()) ?? "unknown"
                    ));
                }
                return out;
            }, [] as Array<Record<string, any>>);

            res.status(200).json(visible);
        }
        catch (err) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.post('/document-details', limiter, validate(docDetailsSchema), async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        try {
            const { docID } = docDetailsSchema.parse(req.body);

            const id = req.user;

            let user = await User.findById(id);

            let doc = await TextDocument.findById(docID);
            if (!doc) {
                res.status(404).send(NO_SUCH_DOCUMENT_ERR);
                return;
            }

            const access = await checkUserAccess(id as Types.ObjectId, doc);
            if (access < Access.Viewer) {
                res.status(403).send(INSUFFICIENT_ACCESS_ERR);
                return;
            }

            let org = doc.orgID ? await Org.findById(doc.orgID) : null;

            const result: DocumentDetails = {
                docID: doc._id.toString(),
                orgName: org ? org.name : null,
                orgID: doc.orgID?.toString() ?? "null",
                title: doc.title,
                text: doc.text,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                creator: user?.email ?? "unknown",
                isCreator: doc.creator.toString() === id,
                publicAccess: doc.publicAccess,
                orgAccess: doc.orgAccess,
                access: access
            };
            res.status(200).json(result);
        }
        catch (err) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.post('/create-document', validate(createDocumentSchema), limiter, async (req: Request, res: Response) => {
        if (!ensureAuthenticated(req, res)) return;

        try {
            const { title, orgID, orgAccess, publicAccess } = createDocumentSchema.parse(req.body);
            const userID = req.user as Types.ObjectId;

            // If assigning to an org, ensure they’re a member
            if (orgID !== undefined && orgID !== null) {
                const foundOrgId = await Org.findOne({ _id: orgID });
                if (!foundOrgId) {
                    res.status(404).send(ORG_DOESNT_EXIST_ERR);
                    return;
                }

                const mem = await OrgMembership.findOne({ userID, orgID });
                if (!mem) {
                    res.status(403).send(USER_NOT_MEMBER_OF_ORG_ERR);
                    return;
                }
            }

            const doc = await TextDocument.create({
                title,
                text: "",
                orgID,
                publicAccess,
                orgAccess,
                creator: userID,
            });

            res.status(201).send(doc._id.toString() as CreatedID);
        }
        catch (err) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.patch('/save-document', validate(saveDocumentSchema), limiter, async (req: Request, res: Response) => {
        if (!ensureAuthenticated(req, res)) return;

        const { title, text, docID } = saveDocumentSchema.parse(req.body);
        const userID = req.user as Types.ObjectId;

        try {
            let doc = await TextDocument.findById(docID);
            if (!doc) {
                res.status(404).send(NO_SUCH_DOCUMENT_ERR);
                return;
            }

            const access = await checkUserAccess(userID, doc);
            if (access < Access.Editor) {
                res.status(403).send(INSUFFICIENT_ACCESS_ERR);
                return;
            }

            doc.title = title;
            doc.text = text;

            await doc.save();

            res.status(200).send(DOC_SAVE_SUCCESS);
        }
        catch (err) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.patch('/update-document', validate(docPriviligesSchema), limiter, async (req: Request, res: Response) => {
        if (!ensureAuthenticated(req, res)) return;

        const { orgID, orgAccess, publicAccess, docID } = docPriviligesSchema.parse(req.body);
        const userID = req.user as Types.ObjectId;

        try {
            let doc = await TextDocument.findById(docID);
            if (!doc) {
                res.status(404).send(NO_SUCH_DOCUMENT_ERR);
                return;
            }

            // Only creator can change access settings or reassign orgID
            if (!doc.creator.equals(userID)) {
                res.status(403).send(MUST_BE_CREATOR_ERR);
                return;
            }

            doc.orgID = orgID as Types.ObjectId | undefined;
            doc.publicAccess = publicAccess;
            doc.orgAccess = orgAccess;

            await doc.save();

            // success
            res.status(200).send(DOC_SAVE_SUCCESS);
        }
        catch (err) {
            res.status(500).send(INTERNAL_ERR);
        }
    });


    router.delete('/delete-document', validate(deleteDocumentSchema), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        try {
            const { password, docID } = deleteDocumentSchema.parse(req.body);

            const thisUser = await User.findById(req.user);
            if (!thisUser) {
                logout(req, res, _next, SESSION_EXPIRED_ERR, 401);
                return;
            }

            const isMatch = await comparePasswordAsync(thisUser, password);
            if (!isMatch) {
                res.status(401).send(INCORRECT_PASSWORD_ERR);
                return;
            }

            const doc = await TextDocument.findById(docID);
            if (!doc) {
                res.status(404).send(NO_SUCH_DOCUMENT_ERR);
                return;
            }

            if (!doc.creator.equals(thisUser._id)) {
                res.status(403).send(MUST_BE_CREATOR_ERR);
                return;
            }

            await TextDocument.deleteOne({ _id: docID });
            await AccessOverride.deleteMany({ docID: docID });

            res.status(204).send(DOC_DELETE_SUCCESS);
        }
        catch (error) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.post('/add-access-override', validate(addAccessOverride), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        try {
            const { email, access, docID, password } = addAccessOverride.parse(req.body);

            const thisUser = await User.findById(req.user);
            if (!thisUser) {
                logout(req, res, _next, SESSION_EXPIRED_ERR, 401);
                return;
            }

            const isMatch = await comparePasswordAsync(thisUser, password);
            if (!isMatch) {
                res.status(401).send(INCORRECT_PASSWORD_ERR);
                return;
            }

            const doc = await TextDocument.findById(docID);
            if (!doc) {
                res.status(404).send(NO_SUCH_DOCUMENT_ERR);
                return;
            }

            if (!doc.creator.equals(thisUser._id)) {
                res.status(403).send(MUST_BE_CREATOR_ERR);
                return;
            }

            const addedUser = await User.findOne({ email: email });
            if (!addedUser) {
                res.status(404).send(NO_USER_WITH_GIVEN_EMAIL_ERR);
                return;
            }

            const addedOverride = await AccessOverride.findOne({ docID: docID, userID: addedUser._id })
            if (addedOverride) {
                res.status(404).send(ACCESS_OVERRIDE_ALREADY_EXIST_ERR);
                return;
            }

            await AccessOverride.create({
                docID: docID,
                userID: addedUser._id,
                access: access,
                addedBy: thisUser._id
            });
            res.status(201).send(ACCESS_OVERRIDE_SUCCESS);
        }
        catch (error) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.patch('/update-access-override', validate(updateAccessOverride), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        try {
            const { email, access, docID, password } = updateAccessOverride.parse(req.body);

            const thisUser = await User.findById(req.user);
            if (!thisUser) {
                logout(req, res, _next, SESSION_EXPIRED_ERR, 401);
                return;
            }

            const isMatch = await comparePasswordAsync(thisUser, password);
            if (!isMatch) {
                res.status(401).send(INCORRECT_PASSWORD_ERR);
                return;
            }

            const doc = await TextDocument.findById(docID);
            if (!doc) {
                res.status(404).send(NO_SUCH_DOCUMENT_ERR);
                return;
            }

            if (!doc.creator.equals(thisUser._id)) {
                res.status(403).send(MUST_BE_CREATOR_ERR);
                return;
            }

            const updatedUser = await User.findOne({ email: email });
            if (!updatedUser) {
                res.status(404).send(NO_USER_WITH_GIVEN_EMAIL_ERR);
                return;
            }

            const updatedOverride = await AccessOverride.findOne({ docID: docID, userID: updatedUser._id })
            if (!updatedOverride) {
                res.status(404).send(ACCESS_OVERRIDE_DOESNT_EXIST_ERR);
                return;
            }
            updatedOverride.access = access;
            await updatedOverride.save();
            res.status(201).send(ACCESS_OVERRIDE_SUCCESS);
        }
        catch (error) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.delete('/remove-access-override', validate(removeAccessOverride), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        try {
            const { email, docID, password } = removeAccessOverride.parse(req.body);

            const thisUser = await User.findById(req.user);
            if (!thisUser) {
                logout(req, res, _next, SESSION_EXPIRED_ERR, 401);
                return;
            }

            const isMatch = await comparePasswordAsync(thisUser, password);
            if (!isMatch) {
                res.status(401).send(INCORRECT_PASSWORD_ERR);
                return;
            }

            const doc = await TextDocument.findById(docID);
            if (!doc) {
                res.status(404).send(NO_SUCH_DOCUMENT_ERR);
                return;
            }

            if (!doc.creator.equals(thisUser._id)) {
                res.status(403).send(MUST_BE_CREATOR_ERR);
                return;
            }

            const updatedUser = await User.findOne({ email: email });
            if (!updatedUser) {
                res.status(404).send(NO_USER_WITH_GIVEN_EMAIL_ERR);
                return;
            }

            const deletedOverride = await AccessOverride.findOne({ docID: docID, userID: updatedUser._id })
            if (!deletedOverride) {
                res.status(404).send(ACCESS_OVERRIDE_DOESNT_EXIST_ERR);
                return;
            }

            await deletedOverride.deleteOne();
            res.status(201).send(ACCESS_OVERRIDE_SUCCESS);
        }
        catch (error) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.post('/query-access-overrides', validate(queryAccessOverride), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        try {
            const { docID } = queryAccessOverride.parse(req.body);

            const thisUser = await User.findById(req.user);
            if (!thisUser) {
                logout(req, res, _next, SESSION_EXPIRED_ERR, 401);
                return;
            }

            const doc = await TextDocument.findById(docID);
            if (!doc) {
                res.status(404).send(NO_SUCH_DOCUMENT_ERR);
                return;
            }

            const overrides = await AccessOverride.find({ docID: docID }).lean();
            const userIDs = overrides.map(o => o.userID);

            const users = await User.find({ _id: { $in: userIDs } }).select('email').lean();
            const userMap = new Map(users.map(u => [u._id.toString(), u.email]));

            const adderIDs = overrides.map(o => o.addedBy.toString());
            const adderUsers = await User.find({ _id: { $in: adderIDs } });
            const adderMap = new Map(adderUsers.map(user => [user._id.toString(), user.email]));

            const accessOverrides: Array<QueriedOverride> = overrides.map(o => ({
                email: userMap.get(o.userID.toString()) ?? 'Unknown',
                access: o.access,
                addedBy: adderMap.get(o.addedBy.toString()) ?? 'unknown'
            }));

            res.status(201).json(accessOverrides);
        }
        catch (error) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    return router;
};