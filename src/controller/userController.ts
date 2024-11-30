import type { Request, Response } from "express";
import {SaveUser, User} from "@/entity/user";
import {userService} from "@/service/userService";
import {handleServiceResponse} from "@/common/utils/httpHandlers";
import {ServiceResponse} from "@/common/models/serviceResponse";
import {StatusCodes} from "http-status-codes";

class UserController {

  async createUser(req: Request, res: Response){
    try {
      let userDTO: SaveUser = req.body as SaveUser

      let existingUser = await userService.findByEmail(userDTO.email)
      if (existingUser) {
        throw new Error(`User with email ${userDTO.email} is exist`)
      }

      let user = await userService.create(userDTO)
      let serviceResponse = ServiceResponse.success<User>("User created", user);
      return handleServiceResponse(serviceResponse, res);
    } catch (e) {
      let errorResponse = ServiceResponse.failure(e.message, null, StatusCodes.INTERNAL_SERVER_ERROR);
      return handleServiceResponse(errorResponse, res);
    }
  }
}

export const userController = new UserController();