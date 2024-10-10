import { Request, Response } from "express";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";

import { contactValidator } from "../validators/contact/contactValidator";

export const sendContactEmail = [
  ...contactValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_USER,
        subject: subject,
        text: message,
        html: `
        <p>Has recibido un nuevo mensaje de contacto.</p>
        <h3>Detalles:</h3>
        <ul>
          <li><strong>Nombre:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Asunto:</strong> ${subject}</li>
          <li><strong>Mensaje:</strong> ${message}</li>
        </ul>
      `,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Error sending email" });
    }
  },
];
