import {validateRequest} from "@/common/utils/httpHandlers";
import express, { type Router } from "express";
import {userController} from "@/controller/userController";
import {SaveUserSchema} from "@/entity/user";

export const userRouter: Router = express.Router();

userRouter.post("/api/users", validateRequest(SaveUserSchema), userController.createUser);