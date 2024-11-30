import {SaveUser, User} from "@/entity/user";
import db from "@/db";
import { knex } from 'knex';
import moment from "moment-timezone";
import axios from "axios";
import {response} from "express";
import {BIRTHDAY_TYPE} from "@/entity/notificationLog";

const table = "users";
const notifications_table = "notification_logs";
const NOTIFICATION_SEND_TIME = 9;
const EMAIL_API_STATUS_SENT = "sent"
const EMAIL_API_STATUS_FAILED = "failed"

export class UserService {

  private db: knex;

  constructor(db: knex) {
    this.db = db;
  }
  async create(user: SaveUser): Promise<User> {
    const [id] = await db(table).insert({
      "email": user.email,
      "firstName": user.firstName,
      "lastName": user.lastName,
      "birthday": user.birthday,
      "location": user.location,
    })
    return await db(table).where('id', id).first()
  }

  async findById(id: number): Promise<User> {
    return await db(table).where('id', id).first()
  }

  async findByEmail(email: string): Promise<User> {
    return await db(table).where('email', email).first()
  }

  async delete(id: number): Promise<void> {
    return await db(table).where('id', id).delete();
  }

  async sendBirthdayNotification(today: Date): Promise<void> {
    let allBirthdayUsers: User[] = await db(table)
      .where(q =>
        q.whereRaw('DATE_FORMAT(birthday, \'%m-%d\') = DATE_FORMAT(CONVERT_TZ(now(), @@GLOBAL.time_zone, users.location), \'%m-%d\')')
          .andWhereRaw('DATE_FORMAT(CONVERT_TZ(now(), @@GLOBAL.time_zone, users.location), \'%H\') = ?', [NOTIFICATION_SEND_TIME])
      )
      .orWhereIn('id', function () {
        this.select('userId').from('notification_logs').whereRaw('type = ? and status = ? and YEAR(sentTime) = ?', [BIRTHDAY_TYPE, EMAIL_API_STATUS_FAILED, moment().year()]);
      });
    for (let user of allBirthdayUsers) {
      let status;
      try {
        const response = await axios.post("https://email-service.digitalenvision.com.au/send-email", {
          "email": user.email,
          "message": `Hey, ${user.firstName} ${user.lastName} it’s your birthday`
        });
        status = EMAIL_API_STATUS_SENT
      } catch (e) {
        status = EMAIL_API_STATUS_FAILED
      }

      let existingLog = await db(notifications_table).where("type", BIRTHDAY_TYPE)
        .andWhere("userId", user.id)
        .andWhere("status", EMAIL_API_STATUS_FAILED)
        .first();

      if (existingLog) {
        await db(notifications_table).where('id', existingLog.id)
          .update({
            "status": status,
            "sentTime": new Date(),
          })
      } else {
        await db(notifications_table).insert({
          "type": BIRTHDAY_TYPE,
          "userId": user.id,
          "status": status,
          "sentTime": new Date(),
        })
      }

    }

  }

}

export const userService = new UserService(db);
