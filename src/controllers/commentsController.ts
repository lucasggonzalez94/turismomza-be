import { Request, Response } from "express";
import prisma from "../prismaClient";

export const addComment = async (req: Request, res: Response) => {
  const { content, attractionId } = req.body;
  const userId = req.user?.userId;

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        attractionId,
      },
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Error adding comment" });
  }
};

export const reportComment = async (req: Request, res: Response) => {
  const { commentId, reason } = req.body;
  const userId = req.user?.userId;

  try {
    await prisma.report.create({
      data: {
        commentId,
        userId,
        reason,
      },
    });
    res.status(201).json({ message: "Report submitted" });
  } catch (error) {
    res.status(500).json({ error: "Error reporting comment" });
  }
};

export const likeComment = async (req: Request, res: Response) => {
  const { commentId } = req.body;
  const userId = req.user?.userId;

  try {
    const existingLikeDislike = await prisma.likeDislike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (existingLikeDislike) {
      if (existingLikeDislike.type === "like") {
        return res.status(200).json({ message: "Comment already liked" });
      } else {
        await prisma.likeDislike.update({
          where: {
            userId_commentId: {
              userId,
              commentId,
            },
          },
          data: {
            type: "like",
          },
        });
        return res.status(200).json({ message: "Comment updated to like" });
      }
    } else {
      await prisma.likeDislike.create({
        data: {
          userId,
          commentId,
          type: "like",
        },
      });
      return res.status(201).json({ message: "Comment liked" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error liking comment" });
  }
};

export const dislikeComment = async (req: Request, res: Response) => {
  const { commentId } = req.body;
  const userId = req.user?.userId;

  try {
    const existingLikeDislike = await prisma.likeDislike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (existingLikeDislike) {
      if (existingLikeDislike.type === "dislike") {
        return res.status(200).json({ message: "Comment already disliked" });
      } else {
        await prisma.likeDislike.update({
          where: {
            userId_commentId: {
              userId,
              commentId,
            },
          },
          data: {
            type: "dislike",
          },
        });
        return res.status(200).json({ message: "Comment updated to dislike" });
      }
    } else {
      await prisma.likeDislike.create({
        data: {
          userId,
          commentId,
          type: "dislike",
        },
      });
      return res.status(201).json({ message: "Comment disliked" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error disliking comment" });
  }
};
