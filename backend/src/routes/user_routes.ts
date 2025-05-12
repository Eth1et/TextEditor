import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Types } from 'mongoose';
import { User, UserType } from "../model/user";
import rateLimit from "express-rate-limit";
import {
    INTERNAL_ERR,
    LOGIN_SUCCESS,
    NOT_LOGGED_IN_ERR,
    ALREADY_LOGGED_IN_ERR,
    INCORRECT_EMAIL_OR_PASSWORD_ERR,
    TOO_MANY_REQUESTS_ERR,
    REGISTER_SUCCESS,
    EMAIL_ALREADY_IN_USE_ERR,
    LOGOUT_SUCCESS,
    SESSION_EXPIRED_ERR,
    INCORRECT_PASSWORD_ERR,
    PASSWORD_UPDATE_SUCCESS,
    ACCOUNT_DELETE_SUCCESS,
} from "../consts/msgs";
import { deleteUserSchema, loginSchema, registerSchema, updatePasswordSchema } from "../shared/route_schemas";
import { validate } from ".";
import { UserDetails } from "../shared/response_models";


export function ensureNotAuthenticated(req: Request, res: Response): Boolean {
    if (req.isAuthenticated()) {
        res.status(409).send(ALREADY_LOGGED_IN_ERR);
        return false;
    }
    return true;
}

export function ensureAuthenticated(req: Request, res: Response): Boolean {
    if (!req.isAuthenticated()) {
        res.status(401).send(NOT_LOGGED_IN_ERR);
        return false;
    }
    return true;
}

export function comparePasswordAsync(user: UserType, inputPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        user.comparePassword(inputPassword, (err, isMatch) => {
            if (err) reject(err);
            else resolve(isMatch);
        });
    });
}

export const login = function (req: Request, res: Response, _next: NextFunction, successMsg: string, successCode: number = 200) {
    passport.authenticate('local', (error: string | null, user: string) => {
        if (error) {
            res.status(500).send(error);
            return;
        }
        if (!user) {
            res.status(401).send(INCORRECT_EMAIL_OR_PASSWORD_ERR);
            return;
        }

        req.login(user, (login_err: string | null) => {
            if (login_err) {
                res.status(500).send(INTERNAL_ERR);
            }
            else {
                res.status(successCode).send(successMsg);
            }
        });
    })(req, res, _next);
}

export const logout = function (req: Request, res: Response, _next: NextFunction, successMsg: string, successCode: number = 200) {
    req.logout((error) => {
        if (error) {
            res.status(500).send(INTERNAL_ERR);
        }
        else {
            res.status(successCode).send(successMsg);
        }
    });
}

export const configureUserRoutes = (router: Router): Router => {
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 4000,
        message: TOO_MANY_REQUESTS_ERR
    });

    router.get('/auth-check', authLimiter, (req: Request, res: Response) => {
        if (req.user) {
            res.sendStatus(200);
        }
        else {
            res.sendStatus(401);
        }
    });

    router.get('/user-details', authLimiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        try {   
            const user = await User.findById(req.user);
            if (!user) {
                logout(req, res, _next, SESSION_EXPIRED_ERR, 401);
                return;
            }
            const data: UserDetails = {
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
            res.status(200).json(data);
        } 
        catch (error) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 400,
        message: TOO_MANY_REQUESTS_ERR
    });

    router.post('/login', validate(loginSchema), async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureNotAuthenticated(req, res)) return;

        login(req, res, _next, LOGIN_SUCCESS);
    });

    router.post('/logout', limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        logout(req, res, _next, LOGOUT_SUCCESS);
    });

    router.post('/register', validate(registerSchema), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureNotAuthenticated(req, res)) return;

        const { email, password } = registerSchema.parse(req.body);

        //? verify email

        try {
            await User.create({ email: email, passwordHash: password });

            login(req, res, _next, REGISTER_SUCCESS, 201);
        }
        catch (err: any) {
            if (err.code === 11000) {
                res.status(409).send(EMAIL_ALREADY_IN_USE_ERR);
            } else {
                res.status(500).send(INTERNAL_ERR);
            }
        }
    });

    router.patch('/update-password', validate(updatePasswordSchema), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        const body = updatePasswordSchema.parse(req.body);

        try {
            const user = await User.findById(req.user as Types.ObjectId);

            if (!user) {
                logout(req, res, _next, SESSION_EXPIRED_ERR);
                return;
            }

            const isMatch = await new Promise<boolean>((resolve, reject) => {
                user.comparePassword(body.oldPassword, (error, match) => {
                    if (error) reject(error);
                    else resolve(match);
                });
            });

            if (!isMatch) {
                res.status(401).send(INCORRECT_PASSWORD_ERR);
                return;
            }

            user.passwordHash = body.newPassword;
            await user.save();
            res.status(200).send(PASSWORD_UPDATE_SUCCESS);
        }
        catch (error) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    router.delete('/delete-user', validate(deleteUserSchema), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!ensureAuthenticated(req, res)) return;

        const body = deleteUserSchema.parse(req.body);

        try {
            const user = await User.findById(req.user as Types.ObjectId);

            if (!user) {
                logout(req, res, _next, SESSION_EXPIRED_ERR);
                return;
            }

            const isMatch = await new Promise<boolean>((resolve, reject) => {
                user.comparePassword(body.password, (error, match) => {
                    if (error) reject(error);
                    else resolve(match);
                });
            });

            if (!isMatch) {
                res.status(401).send(INCORRECT_PASSWORD_ERR);
                return;
            }

            await user.deleteOne();
            logout(req, res, _next, ACCOUNT_DELETE_SUCCESS);
        }
        catch (error) {
            res.status(500).send(INTERNAL_ERR);
        }
    });

    return router;
}