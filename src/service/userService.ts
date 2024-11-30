import {SaveUser, User} from "@/entity/user";
import db from "@/db";
import { knex } from 'knex';

export class UserService {

  private db: knex;

  constructor(db: knex) {
    this.db = db;
  }
  async create(user: SaveUser): Promise<User> {
    const [id] = await db("users").insert({
      "email": user.email,
      "firstName": user.firstName,
      "lastName": user.lastName,
      "birthday": user.birthday,
      "location": user.location,
    })
    return await db("users").where('id', id).first()
  }

  async findById(id: number): Promise<User> {
    return await db("users").where('id', id).first()
  }

  async findByEmail(email: string): Promise<User> {
    return await db("users").where('email', email).first()
  }
}

export const userService = new UserService(db);
