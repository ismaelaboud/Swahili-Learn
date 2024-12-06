import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import logger from '../../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

// Generate access token
const generateAccessToken = (user: any) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
};

// Generate refresh token
const generateRefreshToken = async (userId: string) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
};

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);

    // Find valid refresh token
    const token = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        expiresAt: {
          gt: new Date(),
        },
        revokedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!token) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(token.user);

    // Optional: Rotate refresh token for better security
    await prisma.refreshToken.update({
      where: { id: token.id },
      data: { revokedAt: new Date() },
    });

    const newRefreshToken = await generateRefreshToken(token.user.id);

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(500).json({ message: 'Failed to refresh token' });
  }
});

// Revoke refresh token (logout)
router.post('/revoke', async (req, res) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);

    await prisma.refreshToken.updateMany({
      where: {
        token: refreshToken,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    res.json({ message: 'Token revoked successfully' });
  } catch (error) {
    logger.error('Revoke token error:', error);
    res.status(500).json({ message: 'Failed to revoke token' });
  }
});

// Revoke all refresh tokens for a user
router.post('/revoke-all', async (req, res) => {
  try {
    const { userId } = req.body;

    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    res.json({ message: 'All tokens revoked successfully' });
  } catch (error) {
    logger.error('Revoke all tokens error:', error);
    res.status(500).json({ message: 'Failed to revoke tokens' });
  }
});

export { generateAccessToken, generateRefreshToken };
export default router;
