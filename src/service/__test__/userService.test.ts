import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { ServiceResponse } from "@/common/models/serviceResponse";
import db from "@/db";
import { BIRTHDAY_TYPE } from "@/entity/notificationLog";
import type { SaveUser, User } from "@/entity/user";
import { app } from "@/server";
import {
  EMAIL_API_STATUS_FAILED,
  EMAIL_API_STATUS_SENT,
  NOTIFICATION_SEND_TIME,
  notifications_table,
  userService,
  users_table,
} from "@/service/userService";
import moment from "moment-timezone";

describe("User Service", () => {
  beforeEach(async (context) => {
    // Clear Data
    await db(notifications_table).del();
    await db(users_table).del();
  });

  describe("Send Notification", () => {
    it("should send notification", async () => {
      // Act
      const saveUser: SaveUser = {
        email: "test@test.com",
        firstName: "John",
        lastName: "Doe",
        birthday: moment().format("1990-MM-DD"),
        location: "Asia/Jakarta",
      };

      const createdUser = await userService.create(saveUser);

      const today = moment().tz(createdUser.location).hour(NOTIFICATION_SEND_TIME);

      await userService.sendBirthdayNotification(today.toDate());

      const notificationLog = await db(notifications_table)
        .where("type", BIRTHDAY_TYPE)
        .andWhere("userId", createdUser.id)
        .first();

      // Assert
      expect(notificationLog.type).toEqual(BIRTHDAY_TYPE);
      expect(notificationLog.userId).toEqual(createdUser.id);
    });

    it("should re-send notification when failed", async () => {
      // Act
      const saveUser: SaveUser = {
        email: "test@test.com",
        firstName: "John",
        lastName: "Doe",
        birthday: moment().format("1990-MM-DD"),
        location: "Asia/Jakarta",
      };

      const createdUser = await userService.create(saveUser);

      await db(notifications_table).insert({
        type: BIRTHDAY_TYPE,
        userId: createdUser.id,
        status: EMAIL_API_STATUS_FAILED,
        sentTime: new Date(),
      });

      const today = moment().tz(createdUser.location).hour(12);
      await userService.sendBirthdayNotification(today.toDate());

      const notificationLog = await db(notifications_table)
        .where("type", BIRTHDAY_TYPE)
        .andWhere("userId", createdUser.id)
        .first();

      // Assert
      expect(notificationLog.type).toEqual(BIRTHDAY_TYPE);
      expect(notificationLog.userId).toEqual(createdUser.id);
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
