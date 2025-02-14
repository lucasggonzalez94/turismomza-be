import { Request, Response } from "express";
import { EmailService } from "../services/EmailService";

const emailService = new EmailService();

export class ContactController {
  static async send(req: Request, res: Response) {
    const { email, name, subject, message } = req.body;

    try {
      await emailService.sendContactEmail(email, name, subject, message);

      res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
      res.status(500).json({ error: "Error sending email" });
    }
  }
}
