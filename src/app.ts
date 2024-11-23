import express, { Express, json, Request, Response } from "express";
import dotenv from "dotenv";
import { connect } from "mongoose";
import morgan from 'morgan'
import index from './routes/_index'
// import { authMiddleware } from "./services/auth";

dotenv.config();

export const app: Express = express();
export const router = express.Router();
export const port = process.env.PORT || 3000;

console.log(process.env.DB_CONN_STRING as string)
connect(process.env.DB_CONN_STRING as string).then((db) => {
    console.log("[server]: Connected to database successfully")
});

app.use(json())
app.use(morgan("dev"))

app.use('/api', index)

// app.get("/api", (req: Request, res: Response) => {  
//     // console.log("Gotten request to '/'")
//     res.setHeader('Content-Type', 'application/json');
//     res.send(JSON.stringify({ success: "Got request to /" }));
// });

app.use((req: Request, res: Response) => {
    res.status(404).json({
        path: req.url, 
        error: "Endpoint Not Found" 
    });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at port ${port}`);
});