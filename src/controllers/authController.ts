import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { body, validationResult } from "express-validator";

import prisma from "../prismaClient";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const register = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  // TODO: Validar password
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("name").notEmpty().withMessage("Name is required"),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password: passwordBody, name } = req.body;

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res
          .status(409)
          .json({ error: "User with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(passwordBody, 12);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "viewer",
          name,
        },
      });
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "1h" }
      );
      const {
        id,
        password,
        two_factor_enabled,
        registration_date,
        ...restUser
      } = user;
      res.status(201).json({ ...restUser, token });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Error registering user" });
    }
  },
];

export const login = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  // TODO: Validar password
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.two_factor_enabled) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await prisma.user.update({
          where: { id: user.id },
          data: {
            two_factor_code: code,
            two_factor_expires: new Date(Date.now() + 10 * 60 * 1000),
          }, // Expira en 10 minutos
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Your two-factor authentication code",
          text: `Your code is ${code}`,
        });

        return res
          .status(200)
          .json({ message: "2FA code sent, please verify", userId: user.id });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET as string
      );
      res.json({ ...user, token });
    } catch (error) {
      res.status(500).json({ error: "Error logging in" });
    }
  },
];

export const verifyTwoFactorCode = async (req: Request, res: Response) => {
  const { user, code } = req.body;

  try {
    if (user) {
      if (user?.two_factor_expires) {
        if (
          !user ||
          user.two_factor_code !== code ||
          new Date() > user.two_factor_expires
        ) {
          return res.status(401).json({ error: "Invalid or expired code" });
        }
      }

      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "1h" }
      );

      await prisma.user.update({
        where: { id: user.id },
        data: { two_factor_code: null, two_factor_expires: null },
      });

      res.json({ accessToken });
    }
  } catch (error) {
    res.status(500).json({ error: "Error verifying code" });
  }
};
