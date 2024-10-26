import { Request, Response } from "express";
import { Server } from "socket.io";
import { validationResult } from "express-validator";

import prisma from "../prismaClient";
import {
  addReviewValidator,
  editReviewValidator,
  likeDislikeReviewValidator,
  reportReviewValidator,
} from "../validators";

const sendNotitificationLike = async (
  reviewId: string,
  userId: string,
  io: any,
  userSockets: any
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true },
  });

  if (review?.userId) {
    const notification = await prisma.notification.create({
      data: {
        userId: review.userId,
        triggeredById: userId,
        message: "Liked your review.",
        type: "like",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        triggeredBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    const socketId = userSockets[review.userId];
    if (socketId) {
      io.to(socketId).emit("notification", {
        ...notification,
      });
    }
  }
};

export const addReview = [
  ...addReviewValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { content, rating, attractionId } = req.body;
    const userId = req.user?.userId;

    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");

    try {
      const review = await prisma.review.create({
        data: {
          content,
          rating,
          userId,
          attractionId,
        },
        include: {
          user: true,
          likes: true,
        },
      });

      const attraction = await prisma.attraction.findUnique({
        where: { id: attractionId },
      });

      if (!attraction) {
        return res.status(404).json({ error: "Attraction not found" });
      }

      if (attraction?.creatorId !== userId) {
        const notification = await prisma.notification.create({
          data: {
            userId: attraction.creatorId,
            triggeredById: userId,
            message: `New review on your attraction: ${review.content}`,
            type: "review",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            triggeredBy: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        });

        const socketId = userSockets[attraction?.creatorId];
        if (socketId) {
          io.to(socketId).emit("notification", {
            ...notification,
          });
        }
      }

      res.status(201).json(review);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error adding review" });
    }
  },
];

export const editReview = [
  ...editReviewValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { reviewId } = req.params;
    const { content, rating } = req.body;
    const userId = req.user?.userId;

    try {
      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) {
        return res.status(404).json({ error: "Comment not found" });
      }

      if (existingReview.userId !== userId) {
        return res
          .status(403)
          .json({ error: "You can only edit your own comments" });
      }

      const updatedComment = await prisma.review.update({
        where: { id: reviewId },
        data: { content, rating },
        include: {
          user: true,
          likes: true,
        },
      });

      res.json(updatedComment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating review" });
    }
  },
];

export const deleteReview = async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const userId = req.user?.userId;

  try {
    const existingComment = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existingComment.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own comments" });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    res.status(204).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting review" });
  }
};

export const reportReview = [
  ...reportReviewValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { reviewId, reason } = req.body;
    const userId = req.user?.userId;

    try {
      await prisma.report.create({
        data: {
          reviewId,
          userId,
          reason,
        },
      });
      res.status(201).json({ message: "Report submitted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error reporting review" });
    }
  },
];

export const likeDislikeReview = [
  ...likeDislikeReviewValidator,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { reviewId } = req.body;
    const userId = req.user?.userId;

    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");

    try {
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_reviewId: {
            userId,
            reviewId,
          },
        },
      });

      if (existingLike) {
        await prisma.like.delete({
          where: {
            userId_reviewId: {
              userId,
              reviewId,
            },
          },
        });
        res.status(204).json({ ok: true });
      } else {
        await prisma.like.create({
          data: {
            userId,
            reviewId,
            like: true,
          },
        });
        await sendNotitificationLike(reviewId, userId, io, userSockets);
        return res.status(201).json({ message: "Comment liked" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error liking review" });
    }
  },
];
