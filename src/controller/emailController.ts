import type { Request, Response } from "express";
import {handleServiceResponse} from "@/common/utils/httpHandlers";
import {ServiceResponse} from "@/common/models/serviceResponse";
import {StatusCodes} from "http-status-codes";
import {SendEmail} from "@/entity/email";
import {User} from "@/entity/user";
import moment from "moment-timezone";

class EmailController {

  async createUser(req: Request, res: Response){
    let sendEmailDTO: SendEmail = req.body as SendEmail
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    let randomDown = Math.floor(Math.random() * 10);
    let randomError = Math.floor(Math.random() * 10);

    if (randomDown === 1) {
      req.setTimeout(5000);
      await sleep(10000);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to send email"});
    }

    if (randomError === 1) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to send email"});
    }

    return res.json({ status: "sent", sentTime: moment().toISOString()});
  }
}
export const emailController = new EmailController();