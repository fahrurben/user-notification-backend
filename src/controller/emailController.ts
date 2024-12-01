import { ServiceResponse } from "@/common/models/serviceResponse";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import type { SendEmail } from "@/entity/email";
import { User } from "@/entity/user";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import moment from "moment-timezone";

class EmailController {
  async createUser(req: Request, res: Response) {
    const sendEmailDTO: SendEmail = req.body as SendEmail;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const randomDown = Math.floor(Math.random() * 10);
    const randomError = Math.floor(Math.random() * 10);

    if (randomDown === 1) {
      req.setTimeout(5000);
      await sleep(10000);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to send email" });
    }

    if (randomError === 1) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to send email" });
    }

    return res.json({ status: "sent", sentTime: moment().toISOString() });
  }
}
export const emailController = new EmailController();
