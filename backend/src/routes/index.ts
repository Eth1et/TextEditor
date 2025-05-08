import { Router, Request, Response, NextFunction } from "express";
import { configureUserRoutes } from "./user_routes";
import { configureOrgRoutes } from "./org_routes";
import { configureDocumentRoutes } from "./document_routes";
import { ZodSchema } from "zod";
import { INVALID_REQUEST_ERR } from "../consts/msgs";

export const validate =
    (schema: ZodSchema) =>
        (req: Request, res: Response, next: NextFunction) => {
            const result = schema.safeParse(req.body);

            if (!result.success) {
                res.status(400).send(INVALID_REQUEST_ERR);
                return;
            }

            req.body = result.data;
            next();
        };

export const configureRoutes = (router: Router): Router => {
    configureUserRoutes(router);
    configureDocumentRoutes(router);
    configureOrgRoutes(router);
    return router;
};