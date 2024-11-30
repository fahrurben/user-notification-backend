import {validateRequest} from "@/common/utils/httpHandlers";
import express, { type Router } from "express";
import {SendEmailSchema} from "@/entity/email";
import {emailController} from "@/controller/emailController";

export const emailRouter: Router = express.Router();

emailRouter.post("/send-email", validateRequest(SendEmailSchema), emailController.createUser);
