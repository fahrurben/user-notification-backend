import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { SaveUser, User } from "@/entity/user";
import { userService } from "@/service/userService";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const userDTO: SaveUser = req.body as SaveUser;

      const existingUser = await userService.findByEmail(userDTO.email);
      if (existingUser) {
        throw new Error(`User with email ${userDTO.email} is exist`);
      }

      const user = await userService.create(userDTO);
      const serviceResponse = ServiceResponse.success<User>("User created", user);
      return handleServiceResponse(serviceResponse, res);
    } catch (e) {
      const errorResponse = ServiceResponse.failure(e.message, null, StatusCodes.INTERNAL_SERVER_ERROR);
      return handleServiceResponse(errorResponse, res);
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id as string, 10);

      const existing = await userService.findById(id);
      if (!existing) {
        const errorResponse = ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
        return handleServiceResponse(errorResponse, res);
      }

      await userService.delete(id);
      const serviceResponse = ServiceResponse.success<number>("User deleted", id);
      return handleServiceResponse(serviceResponse, res);
    } catch (e) {
      const errorResponse = ServiceResponse.failure(e.message, null, StatusCodes.INTERNAL_SERVER_ERROR);
      return handleServiceResponse(errorResponse, res);
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id as string, 10);
      const userDTO: SaveUser = req.body as SaveUser;

      const existing = await userService.findById(id);
      if (!existing) {
        const errorResponse = ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
        return handleServiceResponse(errorResponse, res);
      }

      const updated = await userService.update(id, userDTO);

      const serviceResponse = ServiceResponse.success<User>("User updated", updated);
      return handleServiceResponse(serviceResponse, res);
    } catch (e) {
      const errorResponse = ServiceResponse.failure(e.message, null, StatusCodes.INTERNAL_SERVER_ERROR);
      return handleServiceResponse(errorResponse, res);
    }
  }
}

export const userController = new UserController();
