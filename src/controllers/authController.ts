import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { validationResult } from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

import prisma from "../User/infrastructure/database/prismaClient";
import { registerValidator } from "../validators";
import { analyzeImage } from "../helpers";
import { loginValidator } from "../validators/auth/loginValidator";
import { updateValidator } from "../validators/auth/updateValidator";
import { Readable } from "stream";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const register = [
  ...registerValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password: passwordReq, name } = req.body;

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res
          .status(409)
          .json({ error: "User with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(passwordReq, 12);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "viewer",
          name,
        },
        select: {
          id: true,
          name: true,
          email: true,
          profile_picture: true,
          role: true,
        },
      });

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "1h" }
      );

      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
        sameSite: "strict",
      });

      await transporter.sendMail({
        from: `"Equipo de Turismomza" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "¡Bienvenido a la plataforma de Turismomza!",
        html: `<h1>Bienvenido, ${user.name}!</h1>
               <p>Gracias por registrarte en nuestra plataforma. ¡Esperamos que disfrutes de la experiencia!</p>`,
      });

      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error registering user" });
    }
  },
];

export const login = [
  ...loginValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password: passwordReq } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          profile_picture: true,
        },
      });

      if (!user || !(await bcrypt.compare(passwordReq, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.two_factor_enabled) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await prisma.user.update({
          where: { id: user.id },
          data: {
            two_factor_code: code,
            two_factor_expires: new Date(Date.now() + 10 * 60 * 1000),
          },
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

      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "1h" }
      );

      const refreshToken = uuidv4();
      // TODO: Revisar
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const refreshTokenExist = await prisma.refreshToken.findUnique({
        where: { userId: user.id },
      });

      if (refreshTokenExist) {
        await prisma.refreshToken.update({
          where: {
            userId: user.id,
          },
          data: {
            token: refreshToken,
            expiresAt,
          },
        });
      } else {
        await prisma.refreshToken.create({
          data: {
            token: refreshToken,
            userId: user.id,
            expiresAt,
          },
        });
      }

      res.cookie("authToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 604800000, // 7 días
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });

      const {
        id,
        password,
        two_factor_code,
        two_factor_expires,
        created_at,
        ...restUser
      } = user;

      res.status(200).json({ ...restUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error logging in" });
    }
  },
];

export const logout = async (req: Request, res: Response) => {
  await prisma.refreshToken.deleteMany({
    where: {
      userId: req.user!.userId,
    },
  });

  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};

export const updateUser = [
  upload.single("profilePicture"),
  ...updateValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password: passwordReq, name, currentPassword } = req.body;
    const userId = req.user!.userId;
    const { file } = req;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile_picture: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(403).json({ error: "Current password is incorrect" });
      }

      if (file) {
        if (user?.profile_picture) {
          const publicId = user.profile_picture.public_id;
          await cloudinary.uploader.destroy(publicId);

          await prisma.profilePicture.delete({
            where: { userId },
          });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          async (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              return res
                .status(500)
                .json({ error: "Error uploading to Cloudinary" });
            }
            if (result?.secure_url) {
              const isImageAppropriate = await analyzeImage(result.secure_url);
              if (isImageAppropriate) {
                await prisma.profilePicture.create({
                  data: {
                    public_id: result.public_id,
                    url: result.secure_url,
                    userId,
                  },
                });
              } else {
                return res.status(500).json({ message: "Inapropiated image" });
              }
            }
          }
        );

        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);
      }

      let updatedData: any = {};

      if (name && name !== user.name) {
        updatedData.name = name;
      }

      if (email && email !== user.email) {
        updatedData.email = email;
      }

      if (passwordReq) {
        const hashedPassword = await bcrypt.hash(passwordReq, 12);
        updatedData.password = hashedPassword;

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Tu contraseña ha sido actualizada",
          text: `Hola ${user.name},\n\nTu contraseña ha sido actualizada exitosamente. Si no fuiste tú quien realizó este cambio, por favor contacta a nuestro soporte.\n\nSaludos,\nEl equipo de Turismomza.`,
        };

        await transporter.sendMail(mailOptions);
      }

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: updatedData,
      });

      res.status(200).json({ ok: true, message: "User updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating user" });
    }
  },
];

export const listUsers = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10 } = req.query;

  const pageNumber = parseInt(page as string, 10);
  const pageSizeNumber = parseInt(pageSize as string, 10);
  const skip = (pageNumber - 1) * pageSizeNumber;

  try {
    const totalUsers = await prisma.user.count();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        password: false,
        two_factor_code: false,
        two_factor_enabled: false,
        two_factor_expires: false,
        profile_picture: true,
      },
      skip,
      take: pageSizeNumber,
    });

    res.json({
      total: totalUsers,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(totalUsers / pageSizeNumber),
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error listing users" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  try {
    const tokenEntry = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenEntry) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenEntry.userId },
      include: {
        profile_picture: true,
      },
    });

    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "1h" }
    );

    res.cookie("authToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
      sameSite: "strict",
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error refreshing token" });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile_picture: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const {
      password,
      two_factor_code,
      two_factor_expires,
      created_at,
      ...restUser
    } = user;
    res.status(200).json({ ...restUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging in" });
  }
};

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
    console.error(error);
    res.status(500).json({ error: "Error verifying code" });
  }
};

export const enableTwoFactorAuth = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { two_factor_enabled: true },
    });

    res
      .status(200)
      .json({ message: "Two-factor authentication enabled", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error enabling two-factor authentication" });
  }
};

export const disableTwoFactorAuth = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        two_factor_enabled: false,
        two_factor_code: null,
        two_factor_expires: null,
      },
    });

    res
      .status(200)
      .json({ message: "Two-factor authentication disabled", user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error disabling two-factor authentication" });
  }
};
