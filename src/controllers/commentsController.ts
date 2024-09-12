import { Request, Response } from "express";
import prisma from "../prismaClient";
import { Server } from 'socket.io';

const io = new Server();

const sendNotitificationLike = async (commentId: string) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });

  if (comment?.userId) {
    await prisma.notification.create({
      data: {
        userId: comment.userId,
        message: 'Liked your comment.',
        type: 'like'
      },
    });

    io.to(comment.userId).emit('notification', {
      message: 'Liked your comment.',
    });
  }
}

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

    const attraction = await prisma.attraction.findUnique({
      where: { id: attractionId },
      select: { creatorId: true },
    });

    if (attraction?.creatorId) {
      await prisma.notification.create({
        data: {
          userId: attraction.creatorId,
          message: `New comment on your attraction: ${comment.content}`,
          type: 'comment'
        },
      });

      io.to(attraction.creatorId).emit('notification', {
        message: `New comment on your attraction: ${comment.content}`,
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Error adding comment" });
  }
};

export const editComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user?.userId;

  try {
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existingComment.userId !== userId) {
      return res.status(403).json({ error: "You can only edit your own comments" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: "Error updating comment" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const userId = req.user?.userId;

  try {
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existingComment.userId !== userId) {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting comment" });
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

export const likeDislikeComment = async (req: Request, res: Response) => {
  const { commentId } = req.body;
  const userId = req.user?.userId;

  try {
    const existingLikeDislike = await prisma.like.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (existingLikeDislike) {
      if (existingLikeDislike.like) {
        await prisma.like.update({
          where: {
            userId_commentId: {
              userId,
              commentId,
            },
          },
          data: {
            like: false,
          },
        });
        return res.status(200).json({ message: "Comment updated to dislike" });
      } else {
        await prisma.like.update({
          where: {
            userId_commentId: {
              userId,
              commentId,
            },
          },
          data: {
            like: true,
          },
        });
        await sendNotitificationLike(commentId);
        return res.status(200).json({ message: "Comment updated to like" });
      }
    } else {
      await prisma.like.create({
        data: {
          userId,
          commentId,
          like: true,
        },
      });
      await sendNotitificationLike(commentId);
      return res.status(201).json({ message: "Comment liked" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error liking comment" });
  }
};
