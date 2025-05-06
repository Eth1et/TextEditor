import { Request, Router, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { TOO_MANY_REQUESTS_ERR } from "../consts/msgs";
import { validate, createOrgSchema } from "./route_schemas";


export const configureOrgRoutes = (router: Router): Router => {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message: TOO_MANY_REQUESTS_ERR
    });

    router.post('/create-org', validate(createOrgSchema), limiter, async (req: Request, res: Response, _next: NextFunction) => {
    
    });

    return router;
};