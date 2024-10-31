import express, { Express, json, Request, Response } from "express";
import dotenv from "dotenv";
import { connect } from "mongoose";

import categories from './routes/categories'

dotenv.config();

export const app: Express = express();
export const router = express.Router();
export const port = process.env.PORT || 3000;

connect(process.env.DB_CONN_STRING as string);

app.use(json())

app.get("/", (req: Request, res: Response) => {  
    // console.log("Gotten request to '/'")
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({response: "TS + Node"}));
});

app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "Not Found" });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at port ${port}`);
});