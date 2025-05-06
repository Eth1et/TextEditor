import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import { User } from "./model/user";
import rateLimit from "express-rate-limit";
import {
    INTERNAL_ERR,
    LOGIN_SUCCESS,
    INVALID_REQUEST_ERR,
    NOT_LOGGED_IN_ERR,
    ALREADY_LOGGED_IN_ERR,
    INCORRECT_EMAIL_OR_PASSWORD_ERR,
    TOO_MANY_REQUESTS_ERR,
    REGISTER_SUCCESS,
    EMAIL_ALREADY_IN_USE_ERR,
    LOGOUT_SUCCESS,
} from "./consts/msgs";

export const configureRoutes = (router: Router): Router => {
    const MIN_PASSWORD_LENGTH = parseInt(process.env.MIN_PASSWORD_LENGTH || "5");
    const MAX_PASSWORD_LENGTH = parseInt(process.env.MAX_PASSWORD_LENGTH || "30");

    const authLimiter = rateLimit({
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

    router.post('/login', authLimiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (req.isAuthenticated()) {
            res.status(400).send(ALREADY_LOGGED_IN_ERR);
            return;
        }

        login(req, res, _next, LOGIN_SUCCESS);
    });

    router.post('/logout', authLimiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (req.isAuthenticated()) {
            req.logout((error) => {
                if (error) {
                    res.status(500).send(INTERNAL_ERR);
                }
                else {
                    res.status(200).send(LOGOUT_SUCCESS);
                }
            });
        } else {
            res.status(400).send(NOT_LOGGED_IN_ERR);
        }
    });

    router.post('/register', authLimiter, async (req: Request, res: Response, _next: NextFunction) => {
        if (req.isAuthenticated()) {
            res.status(400).send(ALREADY_LOGGED_IN_ERR);
            return;
        }

        if (!req.body || !req.body.email || !req.body.password) {
            res.status(400).send(INVALID_REQUEST_ERR);
            return;
        }

        const { email, password }: { email: string, password: string } = req.body;

        //? verify email

        if (password.length < MIN_PASSWORD_LENGTH) {
            res.status(500).send(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
            return;
        }
        if (password.length > MAX_PASSWORD_LENGTH) {
            res.status(500).send(`Password maximum length: ${MAX_PASSWORD_LENGTH} characters, your password: ${password.length} characters.`);
            return;
        }

        const user = new User({ email: email, passwordHash: password });
        user.save().then(data => {
            login(req, res, _next, REGISTER_SUCCESS);
        }).catch(error => {
            res.status(500).send(EMAIL_ALREADY_IN_USE_ERR);
        });

    });

    return router;
};