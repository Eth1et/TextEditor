import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Types } from 'mongoose';
import { User } from "../model/user";
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
import { deleteUserSchema, loginSchema, registerSchema, updatePasswordSchema, validate } from "./route_schemas";


export const configureUserRoutes = (router: Router): Router => {

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message: TOO_MANY_REQUESTS_ERR
    });

    const login = function (req: Request, res: Response, _next: NextFunction, successMsg: string) {
        passport.authenticate('local', (error: string | null, user: typeof User) => {
            if (error) {
                res.status(500).send(error);
                return;
            }
            if (!user) {
                res.status(400).send(INCORRECT_EMAIL_OR_PASSWORD_ERR);
                return;
            }

            req.login(user, (login_err: string | null) => {
                if (login_err) {
                    res.status(500).send(INTERNAL_ERR);
                }
                else {
                    res.status(200).send(successMsg);
                }
            });
        })(req, res, _next);
    }

    const logout = function (req: Request, res: Response, _next: NextFunction, successMsg: string) {
        req.logout((error) => {
            if (error) {
                res.status(500).send(INTERNAL_ERR);
            }
            else {
                res.status(200).send(successMsg);
            }
        });
    }


    router.post('/login', validate(loginSchema), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (req.isAuthenticated()) {
            res.status(400).send(ALREADY_LOGGED_IN_ERR);
            return;
        }
        login(req, res, _next, LOGIN_SUCCESS);
    });

    router.post('/logout', limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (req.isAuthenticated()) {
            logout(req, res, _next, LOGOUT_SUCCESS);
        } else {
            res.status(400).send(NOT_LOGGED_IN_ERR);
        }
    });

    router.post('/register', validate(registerSchema), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (req.isAuthenticated()) {
            res.status(400).send(ALREADY_LOGGED_IN_ERR);
            return;
        }

        const { email, password } = registerSchema.parse(req.body);

        //? verify email

        const user = new User({ email: email, passwordHash: password });
        user.save().then(data => {
            login(req, res, _next, REGISTER_SUCCESS);
        }).catch(error => {
            res.status(500).send(EMAIL_ALREADY_IN_USE_ERR);
        });

    });

    router.post('/update-password', validate(updatePasswordSchema), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.isAuthenticated()) {
            res.status(400).send(NOT_LOGGED_IN_ERR);
            return;
        }

        const body = updatePasswordSchema.parse(req.body);

        User.findById(req.user as Types.ObjectId).then(user => {
            if (!user) {
                logout(req, res, _next, SESSION_EXPIRED_ERR);
            }
            else {
                user.comparePassword(body.oldPassword, (error, isMatch) => {
                    if (error || !isMatch) {
                        res.status(400).send(INCORRECT_PASSWORD_ERR);
                    }
                    else {
                        user.passwordHash = body.newPassword;
                        user.save().then(() => {
                            res.status(200).send(PASSWORD_UPDATE_SUCCESS);
                        }).catch(() => {
                            res.status(500).send(INTERNAL_ERR);
                        });
                    }
                })
            }
        });
    });

    router.delete('/delete-user', validate(deleteUserSchema), limiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.isAuthenticated()) {
            res.status(400).send(NOT_LOGGED_IN_ERR);
            return;
        }

        const body = deleteUserSchema.parse(req.body);

        User.findById(req.user as Types.ObjectId).then(user => {
            if (!user) {
                logout(req, res, _next, SESSION_EXPIRED_ERR);
            }
            else {
                user.comparePassword(body.password, (error, isMatch) => {
                    if (error || !isMatch) {
                        res.status(400).send(INCORRECT_PASSWORD_ERR);
                    }
                    else {
                        user.deleteOne().then(() => {
                            logout(req, res, _next, ACCOUNT_DELETE_SUCCESS);
                        }).catch(() => {
                            res.status(500).send(INTERNAL_ERR);
                        });
                    }
                })
            }
        });
    });

    return router;
}