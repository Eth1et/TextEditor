import express from 'express';
import session from 'express-session';
import passport from 'passport';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { configureRoutes } from './routes';
import { configurePassport } from './passport';
import { INTERNAL_ERR, DB_CONNECT_SUCCESS, TOO_MANY_REQUESTS_ERR } from './consts/msgs';


dotenv.config();

const app = express();
const url = process.env.URL || 'http://localhost'
const port = process.env.PORT || 3000;
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/db'

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true
}));

// DB Connect
mongoose.connect(dbURL).then((_) => {
    console.log(DB_CONNECT_SUCCESS);
}).catch((error) => {
    console.error(error);
    return;
});

// Secure HTTP headers
app.use(helmet());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Parse cookies
app.use(
    cookieParser(
        process.env.COOKIE_SECRET || 'fallback_cookie_secret'
    )
);

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'fallback_session_secret',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.DB_URL,
            ttl: 14 * 24 * 60 * 60, // 14 days expiration
            autoRemove: 'native',
        }),
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    })
);

// Rate Limitation
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: TOO_MANY_REQUESTS_ERR
    })
);

// Authentication
app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

// Routing
app.use('/', configureRoutes(express.Router()));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send(INTERNAL_ERR);
});

app.listen(port, () => {
    console.log(`Server is running at ${url}:${port}`);
});