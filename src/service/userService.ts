import { env } from "@/common/utils/envConfig";
import db from "@/db";
import { BIRTHDAY_TYPE } from "@/entity/notificationLog";
import type { SaveUser, User } from "@/entity/user";
import axios from "axios";
import { response } from "express";
import type { knex } from "knex";
import moment from "moment-timezone";

export const users_table = "users";
export const notifications_table = "notification_logs";
export const NOTIFICATION_SEND_TIME = 9;
export const EMAIL_API_STATUS_SENT = "sent";
export const EMAIL_API_STATUS_FAILED = "failed";

export class UserService {
  private db: knex;

  constructor(db: knex) {
    this.db = db;
  }
  async create(user: SaveUser): Promise<User> {
    const [id] = await db(users_table).insert({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthday: user.birthday,
      location: user.location,
    });
    return await db(users_table).where("id", id).first();
  }

  async findById(id: number): Promise<User> {
    return await db(users_table).where("id", id).first();
  }

  async findByEmail(email: string): Promise<User> {
    return await db(users_table).where("email", email).first();
  }

  async delete(id: number): Promise<void> {
    return await db(users_table).where("id", id).delete();
  }

  async update(id: number, user: SaveUser): Promise<User> {
    const sameEmail = await db(users_table).where("email", user.email).andWhereNot("id", id).first();
    if (sameEmail) {
      throw new Error(`Email already exist ${user.email}`);
    }

    await db(users_table).where("id", id).update({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthday: user.birthday,
      location: user.location,
    });
    return await db(users_table).where("id", id).first();
  }

  async sendBirthdayNotification(today: Date): Promise<void> {
    const allBirthdayUsers: User[] = await db(users_table)
      .where(
        (q) =>
          q
            .whereRaw(
              "DATE_FORMAT(birthday, '%m-%d') = DATE_FORMAT(CONVERT_TZ(now(), @@GLOBAL.time_zone, users.location), '%m-%d')",
            )
            .andWhere("id", "not in", function () {
              this.select("userId")
                .from(notifications_table)
                .whereRaw("type = ? and status = ? and YEAR(sentTime) = ?", [
                  BIRTHDAY_TYPE,
                  EMAIL_API_STATUS_SENT,
                  moment().year(),
                ]);
            }),
        // .andWhereRaw('DATE_FORMAT(CONVERT_TZ(now(), @@GLOBAL.time_zone, users.location), \'%H\') = ?', [NOTIFICATION_SEND_TIME])
      )
      .orWhereIn("id", function () {
        this.select("userId")
          .from(notifications_table)
          .whereRaw("type = ? and status = ? and YEAR(sentTime) = ?", [
            BIRTHDAY_TYPE,
            EMAIL_API_STATUS_FAILED,
            moment().year(),
          ]);
      });
    for (const user of allBirthdayUsers) {
      const currentTime = moment(today).tz(user.location);
      if (currentTime.hour() < NOTIFICATION_SEND_TIME) {
        continue;
      }

      let status: string;
      try {
        const response = await axios.post(env.EMAIL_SERVICE_API_URL, {
          email: user.email,
          message: `Hey, ${user.firstName} ${user.lastName} it’s your birthday`,
        });
        status = EMAIL_API_STATUS_SENT;
      } catch (e) {
        status = EMAIL_API_STATUS_FAILED;
      }

      const existingLog = await db(notifications_table)
        .where("type", BIRTHDAY_TYPE)
        .andWhere("type", BIRTHDAY_TYPE)
        .andWhere("userId", user.id)
        .andWhereRaw("YEAR(sentTime) = ?", [moment().year()])
        .first();

      if (existingLog) {
        await db(notifications_table).where("id", existingLog.id).update({
          status: status,
          sentTime: new Date(),
        });
      } else {
        await db(notifications_table).insert({
          type: BIRTHDAY_TYPE,
          userId: user.id,
          status: status,
          sentTime: new Date(),
        });
      }
    }
  }
}

export const userService = new UserService(db);
