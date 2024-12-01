import { validateRequest } from "@/common/utils/httpHandlers";
import { emailController } from "@/controller/emailController";
import { SendEmailSchema } from "@/entity/email";
import express, { type Router } from "express";

export const emailRouter: Router = express.Router();

emailRouter.post("/send-email", validateRequest(SendEmailSchema), emailController.createUser);
