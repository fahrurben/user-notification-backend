import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type {SaveUser, User} from "@/entity/user";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";
import db from "@/db";
import {
  EMAIL_API_STATUS_FAILED, EMAIL_API_STATUS_SENT,
  NOTIFICATION_SEND_TIME,
  notifications_table,
  users_table,
  userService
} from "@/service/userService";
import moment from "moment-timezone";
import {BIRTHDAY_TYPE} from "@/entity/notificationLog";

describe("User API Endpoints", () => {
  beforeEach(async (context) => {
    // Clear Data
    await db(notifications_table).del()
    await db(users_table).del()
  })

  describe("POST /api/users", () => {
    it("should create new user", async () => {
      // Act
      const saveUser: SaveUser = {
        "email": "test1@test.com",
        "firstName": "John",
        "lastName": "Doe",
        "birthday": "2024-11-30",
        "location": "Asia/Jakarta"
      };
      const response = await request(app).post("/api/users")
        .send(saveUser)
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
        "email": "test1@test.com",
        "firstName": "John",
        "lastName": "Doe",
        "birthday": "2024-11-30",
        "location": "Asia/Jakarta"
      };

      await userService.create(saveUser);

      const response = await request(app).post("/api/users")
        .send(saveUser)
      const responseBody: ServiceResponse<User[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(responseBody.success).toBeFalsy();
    });

    it("should delete user", async () => {
      // Act
      const saveUser: SaveUser = {
        "email": "test1@test.com",
        "firstName": "John",
        "lastName": "Doe",
        "birthday": "2024-11-30",
        "location": "Asia/Jakarta"
      };

      let createdUser = await userService.create(saveUser);

      const response = await request(app).delete(`/api/users/${createdUser.id}`)
        .send(saveUser)
      const responseBody: ServiceResponse<User[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
    });

    it("should send notification", async () => {
      // Act
      const saveUser: SaveUser = {
        "email": "test@test.com",
        "firstName": "John",
        "lastName": "Doe",
        "birthday": moment().format("1990-MM-DD"),
        "location": "Asia/Jakarta"
      };

      let createdUser = await userService.create(saveUser);

      let today = moment().tz(createdUser.location).hour(NOTIFICATION_SEND_TIME);

      await userService.sendBirthdayNotification(today.toDate());

      let notificationLog = await db(notifications_table)
        .where('type', BIRTHDAY_TYPE)
        .andWhere('userId', createdUser.id)
        .first()

      // Assert
      expect(notificationLog.type).toEqual(BIRTHDAY_TYPE);
      expect(notificationLog.userId).toEqual(createdUser.id);
    });

    it("should re-send notification when failed", async () => {
      // Act
      const saveUser: SaveUser = {
        "email": "test@test.com",
        "firstName": "John",
        "lastName": "Doe",
        "birthday": moment().format("1990-MM-DD"),
        "location": "Asia/Jakarta"
      };

      let createdUser = await userService.create(saveUser);

      await db(notifications_table).insert({
        "type": BIRTHDAY_TYPE,
        "userId": createdUser.id,
        "status": EMAIL_API_STATUS_FAILED,
        "sentTime": new Date(),
      })

      let today = moment().tz(createdUser.location).hour(12);
      await userService.sendBirthdayNotification(today.toDate());

      let notificationLog = await db(notifications_table)
        .where('type', BIRTHDAY_TYPE)
        .andWhere('userId', createdUser.id)
        .first()

      // Assert
      expect(notificationLog.type).toEqual(BIRTHDAY_TYPE);
      expect(notificationLog.userId).toEqual(createdUser.id);
      expect(notificationLog.status).toEqual(EMAIL_API_STATUS_SENT);
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
