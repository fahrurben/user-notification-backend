import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { ServiceResponse } from "@/common/models/serviceResponse";
import db from "@/db";
import type { SaveUser, User } from "@/entity/user";
import { app } from "@/server";
import { notifications_table, userService, users_table } from "@/service/userService";

describe("User API Endpoints", () => {
  beforeEach(async (context) => {
    // Clear Data
    await db(notifications_table).del();
    await db(users_table).del();
  });

  describe("POST /api/users", () => {
    it("should create new user", async () => {
      // Act
      const saveUser: SaveUser = {
        email: "test1@test.com",
        firstName: "John",
        lastName: "Doe",
        birthday: "2024-11-30",
        location: "Asia/Jakarta",
      };
      const response = await request(app).post("/api/users").send(saveUser);
      const responseBody: ServiceResponse<User[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain("User created");

      compareUsers(saveUser as User, responseBody.responseObject as User);
    });

    it("should error when create user with same email", async () => {
      // Act
      const saveUser: SaveUser = {
        email: "test1@test.com",
        firstName: "John",
        lastName: "Doe",
        birthday: "2024-11-30",
        location: "Asia/Jakarta",
      };

      await userService.create(saveUser);

      const response = await request(app).post("/api/users").send(saveUser);
      const responseBody: ServiceResponse<User[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(responseBody.success).toBeFalsy();
    });

    it("should delete user", async () => {
      // Act
      const saveUser: SaveUser = {
        email: "test1@test.com",
        firstName: "John",
        lastName: "Doe",
        birthday: "2024-11-30",
        location: "Asia/Jakarta",
      };

      const createdUser = await userService.create(saveUser);

      const response = await request(app).delete(`/api/users/${createdUser.id}`);
      const responseBody: ServiceResponse<User[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
    });

    it("should return error when delete non existing user", async () => {
      const response = await request(app).delete("/api/users/1");
      const responseBody: ServiceResponse<User[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(responseBody.success).toBeFalsy();
    });

    it("should update user", async () => {
      // Act
      const saveUser: SaveUser = {
        email: "test1@test.com",
        firstName: "John",
        lastName: "Doe",
        birthday: "2024-11-30",
        location: "Asia/Jakarta",
      };

      const createdUser = await userService.create(saveUser);

      saveUser.email = "test2@test.com";
      const response = await request(app).put(`/api/users/${createdUser.id}`).send(saveUser);
      const responseBody: ServiceResponse<User[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain("User updated");

      compareUsers(saveUser as User, responseBody.responseObject as User);
    });

    it("should return error when update non existing user", async () => {
      const saveUser: SaveUser = {
        email: "test1@test.com",
        firstName: "John",
        lastName: "Doe",
        birthday: "2024-11-30",
        location: "Asia/Jakarta",
      };

      const response = await request(app).put("/api/users/1").send(saveUser);
      const responseBody: ServiceResponse<User[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(responseBody.success).toBeFalsy();
    });
  });
});

function compareUsers(mockUser: User, responseUser: User) {
  if (!mockUser || !responseUser) {
    throw new Error("Invalid test data: mockUser or responseUser is undefined");
  }

  expect(responseUser.email).toEqual(mockUser.email);
  expect(responseUser.firstName).toEqual(mockUser.firstName);
  expect(responseUser.lastName).toEqual(mockUser.lastName);
  expect(responseUser.birthday).toEqual(mockUser.birthday);
  expect(responseUser.location).toEqual(mockUser.location);
}
