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

  async deleteUser(req: Request, res: Response){
    try {
      const id = Number.parseInt(req.params.id as string, 10);

      let existing = await userService.findById(id)
      if (!existing) {
        let errorResponse = ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
        return handleServiceResponse(errorResponse, res);
      }

      await userService.delete(id)
      let serviceResponse = ServiceResponse.success<number>("User deleted", id);
      return handleServiceResponse(serviceResponse, res);
    } catch (e) {
      let errorResponse = ServiceResponse.failure(e.message, null, StatusCodes.INTERNAL_SERVER_ERROR);
      return handleServiceResponse(errorResponse, res);
    }
  }
}

export const userController = new UserController();