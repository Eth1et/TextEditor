import { Request, Router, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { CANNOT_REMOVE_SELF_ERR, CANNOT_UPDATE_SELF_MEMBERSHIP_ERR, INCORRECT_PASSWORD_ERR, INTERNAL_ERR, MEMBER_ADD_SUCCESS, MEMBER_REMOVED_SUCCESS, MEMBER_UPDATE_SUCCESS, NO_ADMIN_PERMISSION_ON_ORG_ERR, NO_USER_WITH_GIVEN_EMAIL_ERR, NOT_LOGGED_IN_ERR, ORG_CREATED_SUCCESS, ORG_DELETD_SUCESS, ORG_DOESNT_EXIST_ERR, ORG_NAME_TAKEN_ERR, ORG_UPDATED_SUCCESS, SESSION_EXPIRED_ERR, TOO_MANY_REQUESTS_ERR, USER_ALREADY_MEMBER_ERR, USER_NOT_MEMBER_OF_ORG_ERR } from "../consts/msgs";
import { createOrgSchema, deleteOrgSchema, updateOrgSchema, addMemberSchema, removeMemberSchema, updateMemberSchema, queryMembersSchema } from "../shared/route_schemas";
import { validate } from ".";
import { Org } from "../model/organization";
import { OrgMembership } from "../model/org_membership";
import { User } from "../model/user";
import { comparePasswordAsync, ensureAuthenticated, logout } from "./user_routes";


export const configureOrgRoutes = (router: Router): Router => {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 400,
        message: TOO_MANY_REQUESTS_ERR
    });

    router.post('/query-orgs', limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        try {
            const id = req.user;
            const memberships = await OrgMembership.find({ userID: id });

            const orgIds = memberships.map(m => m.orgID);
            const orgs = await Org.find({ _id: { $in: orgIds } });

            res.status(200).json({ orgs: orgs });
        }
        catch (err) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.post('/create-org', validate(createOrgSchema), limiter, async (req: Request, res: Response) => {
        if (!ensureAuthenticated(req, res)) return;

        const { name, description } = createOrgSchema.parse(req.body);

        try {
            const existing = await Org.findOne({ name });
            if (existing) {
                res.status(409).send(ORG_NAME_TAKEN_ERR);
                return;
            }

            const org = await Org.create({ name, description });

            await OrgMembership.create({
                userID: req.user,
                orgID: org._id,
                admin: true
            });
            res.status(200).send(ORG_CREATED_SUCCESS);
        }
        catch (err) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.delete('/delete-org', validate(deleteOrgSchema), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        const { password, orgID } = deleteOrgSchema.parse(req.body);

        try {
            const user = await User.findById(req.user);
            if (!user) {
                logout(req, res, _next, SESSION_EXPIRED_ERR, 401);
                return;
            }

            const isMatch = await comparePasswordAsync(user, password);

            if (!isMatch) {
                res.status(401).send(INCORRECT_PASSWORD_ERR);
                return;
            }

            const membership = await OrgMembership.findOne({ userID: req.user, orgID });
            if (!membership) {
                res.status(404).send(USER_NOT_MEMBER_OF_ORG_ERR);
                return;
            }

            if (!membership.admin) {
                res.status(403).send(NO_ADMIN_PERMISSION_ON_ORG_ERR);
                return;
            }

            await Org.deleteOne({ _id: orgID });
            await OrgMembership.deleteMany({ orgID });

            res.status(200).send(ORG_DELETD_SUCESS);
        } catch (err) {
            console.error(err);
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.post('/update-org', validate(updateOrgSchema), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        const { orgID, name, description, password } = updateOrgSchema.parse(req.body);

        try {
            const user = await User.findById(req.user);
            if (!user) {
                logout(req, res, _next, SESSION_EXPIRED_ERR, 401);
                return;
            }

            const isMatch = await comparePasswordAsync(user, password);

            if (!isMatch) {
                res.status(401).send(INCORRECT_PASSWORD_ERR);
                return;
            }

            const membership = await OrgMembership.findOne({ userID: req.user, orgID });
            if (!membership) {
                res.status(404).send(USER_NOT_MEMBER_OF_ORG_ERR);
                return;
            }

            if (!membership.admin) {
                res.status(403).send(NO_ADMIN_PERMISSION_ON_ORG_ERR);
                return;
            }

            const org = await Org.findById(orgID);
            if (!org) {
                res.status(404).send(ORG_DOESNT_EXIST_ERR);
                return;
            }

            org.name = name;
            org.description = description;
            await org.save();

            res.status(200).send(ORG_UPDATED_SUCCESS);
        }
        catch (err) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.post('/query-members', validate(queryMembersSchema), limiter, async (req: Request, res: Response) => {
        if (!ensureAuthenticated(req, res)) return;

        const { orgID } = queryMembersSchema.parse(req.body);

        try {
            const membership = await OrgMembership.findOne({ userID: req.user, orgID });
            if (!membership) {
                res.status(403).send(USER_NOT_MEMBER_OF_ORG_ERR);
                return;
            }

            const memberships = await OrgMembership.find({ orgID: orgID });

            const members = await Promise.all(
                memberships.map(async (membership) => {
                    const user = await User.findById(membership.userID);
                    return {
                        admin: membership.admin,
                        email: user?.email ?? 'unknown'
                    };
                })
            );

            res.status(200).json({ members: members });
        }
        catch (err) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.post('/add-member', validate(addMemberSchema), limiter, async (req: Request, res: Response) => {
        if (!ensureAuthenticated(req, res)) return;

        const { email, admin, orgID } = addMemberSchema.parse(req.body);

        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                res.status(404).send(NO_USER_WITH_GIVEN_EMAIL_ERR);
                return;
            }

            const membership = await OrgMembership.findOne({ userID: req.user, orgID });
            if (!membership) {
                res.status(403).send(USER_NOT_MEMBER_OF_ORG_ERR);
                return;
            }

            if (!membership.admin) {
                res.status(403).send(NO_ADMIN_PERMISSION_ON_ORG_ERR);
                return;
            }

            const existing = await OrgMembership.findOne({ userID: user._id, orgID });
            if (existing) {
                res.status(409).send(USER_ALREADY_MEMBER_ERR);
                return;
            }

            await OrgMembership.create({
                userID: user._id,
                orgID: orgID,
                admin: admin
            });
            res.status(200).send(MEMBER_ADD_SUCCESS);
        }
        catch (err) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.post('/remove-member', validate(removeMemberSchema), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        const { email, password, orgID } = removeMemberSchema.parse(req.body);

        try {
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

            const membership = await OrgMembership.findOne({ userID: req.user, orgID });
            if (!membership) {
                res.status(403).send(USER_NOT_MEMBER_OF_ORG_ERR);
                return;
            }

            if (!membership.admin) {
                res.status(403).send(NO_ADMIN_PERMISSION_ON_ORG_ERR);
                return;
            }

            const removedUser = await User.findOne({ email: email });
            if (!removedUser) {
                res.status(404).send(NO_USER_WITH_GIVEN_EMAIL_ERR);
                return;
            }

            const removedMembership = await OrgMembership.findOne({ userID: removedUser._id, orgID });
            if (!removedMembership) {
                res.status(404).send(USER_NOT_MEMBER_OF_ORG_ERR);
                return;
            }

            if (removedUser._id.equals(thisUser._id)) {
                res.status(409).send(CANNOT_REMOVE_SELF_ERR);
                return;
            }

            await removedMembership.deleteOne();

            res.status(200).send(MEMBER_REMOVED_SUCCESS);
        }
        catch (err) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.post('/update-member', validate(updateMemberSchema), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        const { password, orgID, admin, email } = updateMemberSchema.parse(req.body);

        try {
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

            let membership = await OrgMembership.findOne({ userID: req.user, orgID });
            if (!membership) {
                res.status(403).send(USER_NOT_MEMBER_OF_ORG_ERR);
                return;
            }

            if (!membership.admin) {
                res.status(403).send(NO_ADMIN_PERMISSION_ON_ORG_ERR);
                return;
            }

            const updatedUser = await User.findOne({ email: email });
            if (!updatedUser) {
                res.status(404).send(NO_USER_WITH_GIVEN_EMAIL_ERR);
                return;
            }

            membership = await OrgMembership.findOne({ userID: updatedUser._id, orgID });
            if (!membership) {
                res.status(404).send(USER_NOT_MEMBER_OF_ORG_ERR);
                return;
            }

            if (updatedUser._id.equals(thisUser._id)) {
                res.status(409).send(CANNOT_UPDATE_SELF_MEMBERSHIP_ERR);
                return;
            }

            membership.admin = admin;
            await membership.save();

            res.status(200).send(MEMBER_UPDATE_SUCCESS);
        }
        catch (err) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    return router;
};