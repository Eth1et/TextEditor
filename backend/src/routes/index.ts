import { Router } from "express";
import { configureUserRoutes } from "./user_routes";


export const configureRoutes = (router: Router): Router => {
    configureUserRoutes(router);

    

    return router;
};