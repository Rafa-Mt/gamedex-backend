import { RouteParams, SuccessResponse } from "../types/types"
import { Request, Response, Router } from "express"
import { FormatError, getErrorMessage } from "./utils";

export const buildRouter = (router: Router, routeBuilders: RouteParams[]) => {
    routeBuilders.forEach((route) => {
        createRoute(router, route);
    })
}

export const createRoute = (router: Router, routeBuilder: RouteParams) => {
    const { method, path, callback, bodySchema, successMessage, returnData } = routeBuilder;

    const route = async (req: Request, res: Response) => {
        try {
            const reqBody = bodySchema ? bodySchema.safeParse(req.body) : null ;
            const params = req.params;
            const query = req.query;
            if (reqBody && !reqBody.success)
                throw new FormatError(JSON.stringify(reqBody.error.flatten()));
            const requestedData = await callback({ body: reqBody ? reqBody.data : null, params, query });

            const response: SuccessResponse = {
                success: successMessage
            }
            if (returnData)
                response.data = requestedData

            res.status(200).json(response);
        }
        catch (err) {
            console.error(err);
            const error = getErrorMessage(err);
            res.status(500).send(error);
        }
    };
    switch(method) {
        case 'GET': 
            router.get(path, route); break;
        case 'POST': 
            router.post(path, route); break;
        case 'PUT': 
            router.put(path, route); break;
        case 'DELETE': 
            router.delete(path, route); break;
    }
}