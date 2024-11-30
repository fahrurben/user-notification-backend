import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import errorHandler from "@/common/middleware/errorHandler";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import {userRouter} from "@/router/userRouter";
import {userService} from "@/service/userService";
import cron from "node-cron";
import {emailRouter} from "@/router/emailRouter";

const logger = pino({ name: "server start" });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());

// Request logging
app.use(requestLogger);
app.use(userRouter);
app.use(emailRouter);

// Error handlers
app.use(errorHandler());

cron.schedule('* * * * *', function() {
  userService.sendBirthdayNotification(new Date()).then(() => {
    console.log("Sending birthday email notification");
  })
});

export { app, logger };
