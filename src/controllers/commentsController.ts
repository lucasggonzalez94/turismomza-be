import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const addComment = async (req: Request, res: Response) => {
  const { content, attractionId } = req.body;
  const userId = req.user?.id;

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
    res.status(500).json({ error: 'Error adding comment' });
  }
};

export const reportComment = async (req: Request, res: Response) => {
  const { commentId, reason } = req.body;
  const userId = req.user?.id;

  try {
    await prisma.report.create({
      data: {
        commentId,
        userId,
        reason,
      },
    });
    res.status(201).json({ message: 'Report submitted' });
  } catch (error) {
    res.status(500).json({ error: 'Error reporting comment' });
  }
};

export const likeComment = async (req: Request, res: Response) => {
  const { commentId } = req.body;
  const userId = req.user?.id;

  try {
    await prisma.likes_dislikes.create({
      data: {
        userId,
        commentId,
        tipo: 'like',
      },
    });
    res.status(201).json({ message: 'Comment liked' });
  } catch (error) {
    res.status(500).json({ error: 'Error liking comment' });
  }
};

export const dislikeComment = async (req: Request, res: Response) => {
  const { commentId } = req.body;
  const userId = req.user?.id;

  try {
    await prisma.likes_dislikes.create({
      data: {
        userId,
        commentId,
        tipo: 'dislike',
      },
    });
    res.status(201).json({ message: 'Comment disliked' });
  } catch (error) {
    res.status(500).json({ error: 'Error disliking comment' });
  }
};
